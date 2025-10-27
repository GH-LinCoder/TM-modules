/**
 * This is the heart of the security system.
 * This is a placeholder for the actual permission check logic.
 *
 * @param {string} userId The current user's ID.
 * @param {object} metadata The metadata of the function being called.
 * @returns {boolean} True if the user has permission, false otherwise.
 */

import {registryWorkActions} from './registryWorkActions.js';
import { appState } from '../state/appState.js'; // for checking if in DEVMode


//new 20:37 Sept 24 2025

export function checkIfUserIsAdmin(userId) {
  // PLACEHOLDER: Implement real permission logic when auth is ready
  // For now, return false in production, true in DEV
  return appState.isDevMode;
}

export function canAccessFeature(featureName, userId) {
  if (appState.isDevMode) {
    return true; // All features available in DEV
  }
  
  // Future: Check feature-specific permissions
  const adminOnlyFeatures = ['selectRemember', 'adminDash', 'moveStudent'];
  if (adminOnlyFeatures.includes(featureName)) {
    return checkIfUserIsAdmin(userId);
  }
  
  return true; // Public features
}






export function permissions(userId, functionName, rowId) {// when is the relevant metadata discovered? which function does this?
  // In a real application, we would implement complex logic here
  // based on user roles, permissions from a "temporary permissions" table,
  // and the function's metadata (tables, columns, type).
//needs to collect metadata
/*
readTaskWithSteps: {
    metadata: {
      tables: ['task_headers', 'task_steps'],
      columns: ['id', 'name', 'description'],
      type: 'SELECT',
    },
*/

if (!registryWorkActions[functionName]) {
  throw new Error(`Function '${functionName}' not found in registry.`);
}
const metadata = registryWorkActions[functionName]?.metadata;
  if(!metadata)  throw new Error(`No metadata found - check ${functionName} in registry`);  
 // console.log('metaData:',metadata);
  // do something with metadata and user id, to determine if permitted
//const args = ({supabase,userId,taskId});





//  console.log(`[Security] Checking if user '${userId}' can perform a '${metadata.type}' operation on tables: ${metadata.tables.join(', ')}...`);
//this also will check permissions by column not just by table.
  
  // placeholder response:
  return true;
}

  
// This function would make sense one stage earlier in executIfPermitted
//because another basic test is done in that file
//but the metadata is loaded here in permissions

//Needs the parameters to be in an object 'args'not separate.

//but here we don't have the args
/*
const args = { supabase, userId, taskId };
validateArgs(funcEntry.metadata, Object.keys(args));
const result = funcEntry.handler(args);+

function validateArgs(metadata, args) {
  const expected = metadata.requiredArgs || [];
  if (args.length !== expected.length) {
    throw new Error(`Argument mismatch: expected ${expected.length} (${expected.join(',')}), received ${args.length}`);
  }
} */