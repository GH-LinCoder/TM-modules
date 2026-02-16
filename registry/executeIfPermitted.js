console.log('executIfPermitted.js');


import { registryWorkActions } from './registryWorkActions.js';
import { permissions } from './permissions.js';
import { createSupabaseClient } from '../db/supabase.js';

// The Supabase client is created once and passed to the functions.
const supabase = createSupabaseClient();


async function execute(userId, action, payload) {
  const funcEntry = registryWorkActions[action];
 console.log(`Execute( '${action}'...`);
  let result;

  try {
    result = await funcEntry.handler(supabase, userId, payload);
  } catch (error) {
    console.error(`funcEntry.handler:`, error);
    throw error; // optional: rethrow to bubble up
  }
if (Array.isArray(result) && result.length === 0) {
  console.warn("⚠️ Possible RLS denial: query returned 0 rows. Check the console log for what was the proximate function call, the permissions tables & Postgress logs for clues?");
}
  //console.log('result:', result);
  return result || [];
}


export async function executeIfPermitted(userId, action, payload={}) {
 console.log('executIfPermitted()userId,action,-payload:',userId ,action, payload);

  const funcEntry = registryWorkActions[action];//does this execute?

  if (!funcEntry) {
    throw new Error(`Function '${action}' not found in the registry.`);
  }
  return await execute(userId, action, payload);
}








/**   version 13:05 Sept 13 2025
 * A private, centralized function that executes a registered database operation.
 * It is only ever called from the permission-checked public function below.
 *
 * @param {string} functionName The name of the function to execute.
 * @param {...any} args The arguments to pass to the handler function.
 * @returns {Promise<any>} The result of the database operation.
 */

/*

//temp to read file
//import { registryWorkActions } from './registry/registryWorkActions.js';

// Extract function names from your registry structure
const functionNames = Object.keys(registryWorkActions);
console.log('Registry function names:', functionNames);

// Generate SQL for comparison with permission_molecule_required
const valuesClause = functionNames
  .map(name => `('${name}')`)
  .join(',\n    ');

const sql = `
-- Compare registry functions with permission_molecule_required
WITH registry_functions AS (
  VALUES 
    ${valuesClause}
)
SELECT 
  'Missing from DB' as status,
  rf.column1 as function_name
FROM registry_functions rf
LEFT JOIN permission_molecule_required pmr ON rf.column1 = pmr.name
WHERE pmr.name IS NULL

UNION ALL

SELECT 
  'Orphaned in DB' as status,
  pmr.name as function_name
FROM permission_molecule_required pmr
LEFT JOIN registry_functions rf ON pmr.name = rf.column1  
WHERE rf.column1 IS NULL

ORDER BY status, function_name;
`;

console.log('📋 Copy this SQL and run it in your database:');
console.log(sql);

/////  */







/**
 * The public-facing function that serves as the secure entry point for all
 * registered database operations. It first performs a security check before
 * calling the private execute function.
 *
 * @param {string} userId The current user's ID.
 * @param {string} functionName The name of the function to execute from the registry.
 * @param {...any} args The arguments to pass to the handler function.
 * @returns {Promise<any>} The result of the database operation.
 */



const TEST_permission_db_function = false; //was set 'true' to connect to an old db is_permitted RPC function
//but the new RLS based is_permitted won't know the auth user and will always say denied.









/**
 * A centralized function to execute any registered database operation.
 * It first performs a security check before calling the handler.
 *
 * @param {string} functionName The name of the function to execute from the registry.
 * @param {...any} args The arguments to pass to the handler function.
 * @returns {Promise<any>} The result of the database operation.
 */