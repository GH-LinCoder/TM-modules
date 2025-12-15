console.log('executIfPermitted.js');


import { registryWorkActions } from './registryWorkActions.js';
import { permissions } from './permissions.js';
import { createSupabaseClient } from '../db/supabase.js';

// The Supabase client is created once and passed to the functions.
const supabase = createSupabaseClient();

/**   version 13:05 Sept 13 2025
 * A private, centralized function that executes a registered database operation.
 * It is only ever called from the permission-checked public function below.
 *
 * @param {string} functionName The name of the function to execute.
 * @param {...any} args The arguments to pass to the handler function.
 * @returns {Promise<any>} The result of the database operation.
 */



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

  //console.log('result:', result);
  return result || [];
}




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







export async function executeIfPermitted(userId, action, payload={}) {
 console.log('executIfPermitted()action&payload:',action, payload);

  const funcEntry = registryWorkActions[action];

  if (!funcEntry) {
    throw new Error(`Function '${action}' not found in the registry.`);
  }

  // Perform the critical security check.
  const hasPermission = permissions(userId, action, payload);
  if (!hasPermission) {// one of many possible problems
    throw new Error(`Permission denied: User '${userId}' does not have access to function '${action}'.`);
  }

  // If the check passes, call the private execute function with all arguments.
  // We return the result of this call directly.
  return await execute(userId, action, payload);
}






/**
 * A centralized function to execute any registered database operation.
 * It first performs a security check before calling the handler.
 *
 * @param {string} functionName The name of the function to execute from the registry.
 * @param {...any} args The arguments to pass to the handler function.
 * @returns {Promise<any>} The result of the database operation.
 */

