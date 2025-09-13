/**
 * A centralized function to execute any registered database operation.
 * It first performs a security check before calling the handler.
 *
 * @param {string} functionName The name of the function to execute from the registry.
 * @param {...any} args The arguments to pass to the handler function.
 * @returns {Promise<any>} The result of the database operation.
 */
import {permissions} from './gemini-permissions.js';

execute (functionName, userId){
//only ever called from the permission checked function below
    console.log(`[Executor] Executing '${functionName}'...`);
  return await funcEntry.handler(...args);
  
}

async function executeIfPermitted(functionName, userId) {
  const funcEntry = functionRegistry[functionName];

  if (!funcEntry) {
    throw new Error(`Function '${functionName}' not found in the registry.`);
  }

  // Perform the critical security check
  const hasPermission = permissions(currentUserId, funcEntry.metadata);
  if (!hasPermission) {
    throw new Error(`Permission denied: User '${currentUserId}' does not have access to function '${functionName}'.`);
  }

execute (functionEntry, userId)
  
  // If the check passes, call the handler with the provided arguments

}

