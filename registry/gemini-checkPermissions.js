/**
 * A centralized function to execute any registered database operation.
 * It first performs a security check before calling the handler.
 *
 * @param {string} functionName The name of the function to execute from the registry.
 * @param {...any} args The arguments to pass to the handler function.
 * @returns {Promise<any>} The result of the database operation.
 */
async function execute(functionName, ...args) {
  const funcEntry = functionRegistry[functionName];
  const currentUserId = 'user_123'; // In a real app, you'd get this from your auth state.

  if (!funcEntry) {
    throw new Error(`Function '${functionName}' not found in the registry.`);
  }

  // Perform the critical security check
  const hasPermission = canUserAccess(currentUserId, funcEntry.metadata);
  if (!hasPermission) {
    throw new Error(`Permission denied: User '${currentUserId}' does not have access to function '${functionName}'.`);
  }

  // If the check passes, call the handler with the provided arguments
  console.log(`[Executor] Executing '${functionName}'...`);
  return await funcEntry.handler(...args);
}

