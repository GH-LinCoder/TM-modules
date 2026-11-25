console.log('executIfPermitted.js');


import { registryWorkActions } from './registryWorkActions.js';
//import { permissions } from './permissions.js';
import { createSupabaseClient } from '../db/supabase.js';

// The Supabase client is created once and passed to the functions.
const supabase = createSupabaseClient();


/**
 * Executes a registered work action after the exported gateway has validated the action name.
 * @param {string} userId Authenticated user's UUID
 * @param {keyof typeof registryWorkActions} action Exact registry action name
 * @param {object} [payload={}] Action-specific payload
 * @returns {Promise<*>} The registered handler's return value
 * @throws {Error} When the action handler or Supabase operation fails
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
if (Array.isArray(result) && result.length === 0) {
  console.warn("⚠️ Possible RLS denial: query returned 0 rows. Check the console log for what was the proximate function call, the permissions tables & Postgress logs for clues?");
}
  //console.log('result:', result);
  return result || [];
}


/**
 * Public database gateway. Callers must provide an exact registered action name
 * and the action-specific payload fields required by that registry handler.
 *
 * @param {string} userId Authenticated user's UUID
 * @param {keyof typeof registryWorkActions} action Exact registered action name
 * @param {object} [payload={}] Action-specific payload
 * @returns {Promise<*>} The registered handler's return value
 * @throws {Error} When the action name is not registered or the handler fails
 */
export async function executeIfPermitted(userId, action, payload={}) {
 console.log('executIfPermitted()userId,action,-payload:',userId ,action, payload);

  const funcEntry = registryWorkActions[action];//does this execute?

  if (!funcEntry) {
    throw new Error(`Function '${action}' not found in the registry.`);
  }
  return await execute(userId, action, payload);
}



