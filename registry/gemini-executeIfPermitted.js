/**
 * A centralized function to execute any registered database operation.
 * It first performs a security check before calling the handler.
 *
 * @param {string} functionName The name of the function to execute from the registry.
 * @param {...any} args The arguments to pass to the handler function.
 * @returns {Promise<any>} The result of the database operation.
 */
import {permissions} from './gemini-permissions.js';
import{createSupabaseClient} from './supabase.js';

supabase = createSupabaseClient();

execute (functionName, userId){
//only ever called from the permission checked function below
    console.log(`[Executor] Executing '${functionName}'...`);
  return await funcEntry.handler();
  
}

export async function executeIfPermitted(userId, functionName,rowId=null  ) {//insert would not know rowId
  const funcEntry = functionRegistry[functionName];

  if (!funcEntry) {
    throw new Error(`Function '${functionName}' not found in the registry.`);
  }

  // Perform the critical security check
  const hasPermission = permissions(userId, functionName, rowId);
  if (!hasPermission) {// there can be many reasons for not having permission. The following is just one of the reasons
    throw new Error(`Permission denied: User '${userId}' does not have access to function '${functionName}'.`);
  }

execute (functionEntry, userId)
  
  // If the check passes, call the handler with the provided arguments

}

