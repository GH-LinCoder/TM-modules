//databaseCentral.js


console.log("databaseCentral.js loaded");

/*
All access to the database is done through this module.
    
DBC listens for change of state of type = DATA_REQUEST.  
(DBC ignores MODULE_LOAD or toher change of state

The details of what is required are in the .petitioner part of the query object (appState.query.petitioner)
DBC extracts the content of 'petitioner' from the query. This is called the 'petition'
The definition of 'petition' is at /state/petitionSchema.js'

DBC parses the requirements converting it into which columns of which tables are involved

DBC checks with isPermitted to see if the request is allowed according to javascript rules
DBC then asks for the database's opinion of whether it is permiitted according to supabase functions and RLS
If both checks are passed, then...
DBC determines the actual API call to make based on the request
    Sends the call and places the result in appState.query.response:[], 

If either check fails (db and isPermitted), DC panics. 

    {Not yet decided what to do in this condition. 
    It may mean that the db rules or js rules are too permissive or too restrictive.

    It may mean that the request is invalid, malicious or a typo.

     If the db says yes, is it safe to continue if the js says no? - perhaps the db rules were not applied correctly.
     If the db says no, nothing can happen, but the discrpancy must be flagged.}

    I think the default behaviour should be it needs two yeses to proceed.
     If db says no the action is impossible and needs a loud flag
     If db says yes and js says no, we have the option of going ahead, but I think we should not or at least flag the problem

 If all goes well: 
 the result in placed into appState.query.response    
there is a callback to tell the petitioning module that the response is available

*/

import {executeIfPermitted} from '../registry/executeIfPermitted.js';


export async function databaseCentral(userId, action, rowId=null){

  try {

//at this point only know userId and the data-action. 
    // example 
    const userId='87a90183-88b6-450a-94d2-7838ffbbf61b'; //real id that is in db but DEV only const.
    const action = 'readTaskWithSteps';
    const taskId =  '1a22f8ac-ccaf-4662-856d-3338784ed8da'     //newRecord.id;
 //we don't know anything else. No metaData no functionName    
    
//when would the relevant metadata be discovered? Not here surely.
    // 2. Demonstrate a read operation
    const taskData = await executeIfPermitted(userId, 'readTaskWithSteps', taskId);
    console.log('Result of readTaskWithSteps:', taskData);
}
catch(error){console.error('something went wrong', error)}
}










/*
import {createSupabaseClient} from'supabase.js';
import { appState } from './state/appState.js';
import { permitted } from './Permitted.js';
import { dbSchema } from './registry/dbSchema.js';
import {petitionSchema} from '../state/petitionSchema.js';
import {actionRegistry} from './registry/actionsRegistry';

const supabase = createSupabaseClient();


// DBC — only cares about DATA_REQUEST
window.addEventListener('state-change', (event) => {
  if (event.detail.type === 'DATA_REQUEST') {
    handleDataRequest(event.detail.payload.query.petitioner);
  }
});


function isPermittedByCode(){

  const permitted = true; //placeholder for actual javascript rules
  if (!permitted) {
   console.error("databaseCentral() request not permitted by javascript rules:", requestedAction);
   appState.setQueryResult({ error: "Request not permitted by javascript rules" });
   return false;

   console.error("databaseCentral() isPermittedByCode:", permitted);
   return true;

}

// Check JS permissions
function isPermittedByCode(petition) {
  const allowed = permitted(petition); // ← your function
  if (!allowed) {
    console.warn(`[PERMISSION DENIED] JS rules blocked:`, petition);
  }
  return allowed;
}

// Check DB permissions (via dummy query)
async function isPermittedByDb(petition) {
  // Strategy: Try a COUNT query with same filters — if RLS blocks it, count = 0 or error
  try {
    const dbRequest = buildDummyCheckRequest(petition); // ← you'll build this
    const { data, error } = await supabase
      .from(dbRequest.table)
      .select('count(*)', { count: 'exact', head: true })
      .match(dbRequest.filters || {});

    if (error) {
      console.warn(`[DB PERMISSION DENIED] Error:`, error);
      return false;
    }

    // If count >= 0 → RLS allows at least read access
    // For writes, you may need to simulate with .upsert({}) returning nothing
    return true;
  } catch (error) {
    console.error(`[DB CHECK FAILED]`, error);
    return false;
  }
}

// Build a minimal request to test RLS
function buildDummyCheckRequest(petition) {
  // Map petition.Action → table (via registry or convention)
  const actionToTable = {
    'data-member-count': 'profiles',
    'data-task-list': 'task_headers',
    // ... add more
  };

  return {
    table: actionToTable[petition.Action] || 'task_headers', // fallback
    filters: {} // ← extract from petition if needed
  };
}

async function isPermittedByDb(crud){
//check if the request is permitted by supabase and RLS & functions 
  const dbPermitted = await permitted(query); //not sure how to check that
  if (!dbPermitted) {
    console.error("databaseCentral() request not permitted by database rules:", request);
    appState.setQueryResult({ error: "Request not permitted by database rules" });
  return;
  }
console.log("databaseCentral() dbPermitted:", dbPermitted);
}

function validateRequest(crud){
console.log('validateRequest()-placeholder')
let table='task_headers', field = 'description'; // placeholders

if (!dbSchema.tables[table]?.[field]) {
  throw new Error(`Invalid field: ${field} on table: ${table}`);
} 

table='task_headers', field = 'assignment'; // placeholders
if (!dbSchema.tables[table]?.[field]) {
  throw new Error(`Invalid field: ${field} on table: ${table}`);
} 

 // Ensure petition is complete
 if (!petition || !petition.Action) {
  throw new Error('Invalid petition: missing Action');
}

// ensure Action is string
if (typeof petition.Action !== 'string') {
  throw new Error('Action must be a string');
}




return true;

};



async function  logDbAccess(requester, petition, db, js){
    //optional
console.log('logDbAccess()-placeholder');
}

function convertPetitionToDbCRUD(petition){
console.log(convertPetitionToDbCRUD());

// the work is to be done by a registry
//with an example input of 'data-list-task-headers-fully'
//we call the registry to get a function like this:

function listTaskHeadersAllColumns(){
const { data, error } = await supabase
    .from('task_headers')
    .select('id, name, author_id, created_at, description, external_url')
    .order('name');

  if (error) {
    console.error('Error fetching tasks:', error.message);
    throw new Error('Failed to fetch all tasks.');
  }
  
  return data || [];

}


}



/////////////////////////////////////////            HANDLE DATA REQUEST             /////////////////////////////////

async function handleDataRequest(petition){
  console.log('handleDataRequest',petition);

  try {
    // 1. Validate petition
    if (!petition?.Action) throw new Error('Missing Action');
    
    const crud=RegistryOfActions();// 
    if (!crud) throw new error (`Unknown action ${petition.Action}`);

let isValid =  validateRequest(crud);
if(!isValid) return; //error already handled

isValid =permittedQuery(crud);
if(!isValid) return; //error already handled

//Build dbRequest (inject user context)
const dbRequest = buildDbRequest(requestSpec, petition);

  // Enforce permissions  Idea is to have js rules as guide but also check the db opinion
  const isPermittedCode = isPermittedByCode();
  const isPermittedByDb = await isPermittedByDb();
  if (isPermittedCode != isPermittedByDb) panic(isPermittedCode,isPermittedByDb);

  // Log access (optional)
  logDbAccess(requester, petition, isPermittedByDb, isPermittedCode); // ????

  if(!isPermittedCode) {return};  
  if(!isPermittedByDb) {return};


 /*  Get triggers that will fire (for awareness/debugging) (optional)
 const triggers = getTriggers();  //???
 if (triggers.length > 0) {
   console.debug(`[TRIGGERS] ${action} on ${table} will activate:`, triggers.map(t => t.name));
 } */

   /*
 // Execute via Supabase
   result = await executeSupabaseQuery(not,sure,what, to,Send);
 
 // Return safe, structured response.  Not sure how to structure the response
 return {  //?????
   success: true,
   data: result.data || [],
   count: result.count || 0,
   error: result.error,
   triggersFired: triggers.map(t => t.name)
 };

   //set the result in appState  // needs some work
   console.log("databaseCentral() result:", result);
   appState.setQueryResult(result);

   //Need callback notification

   const callback = dataCallbacks.get(petition.Action);
  if (callback) {
    callback(result);        // ← call the module's callback
    dataCallbacks.delete(petition.Action); // ← clean up
  }


}


function panic(db,js){
console.log(`panic() The database replied that permission is ${db}, but the javascript rules say that permission is ${js}. What to do?` )
const msg = `[SECURITY INVARIANT VIOLATION] Action: ${petition.Action} | JS: ${jsPermitted} | DB: ${dbPermitted}`;
  console.error(msg);
  // Later: send to error tracking service, alert admins, etc.
  throw new Error(msg);
}


  function isValidSchema(table, field){
    if (!dbSchema.tables[table]?.[field]) {
      throw new Error(`Invalid field: ${field} on table: ${table}`);
    }//end if
  }//end function


     // Example: Immutable tables
     if (table === 'app_event_log' && action === 'DELETE') {
      throw new Error("Event log records cannot be deleted");
    }


    function getTriggers(table, action) {
      if (!dbSchema.triggers) return [];
      return Object.values(dbSchema.triggers).filter(trigger =>
        trigger.table === table &&
        trigger.events.includes(action)
      );
    }

function  logAccess(user, table, action) {
      console.log(`[DB ACCESS] User ${user.id} performed ${action} on ${table}`);

      //log to actual app_events_log
    }


*/
  //////////////////////////////////  code for functions that call DBC ///////////////////////////////////

/* code for module request
// Module Loader — only cares about MODULE_REQUEST
window.addEventListener('state-change', (event) => {
  if (event.detail.type === 'MODULE_REQUEST') {
    loadModule(event.detail.payload.query.petitioner);
  }
});
*/
/*
const callback = dataCallbacks.get(petition.Action);
if (callback) {
  callback(result); // ← deliver result to the right module
  dataCallbacks.delete(petition.Action); // ← clean up
}
*/

/* ./registry/dataCallbacks.js  ??? Is this compatible with using state change? How use?
export const dataCallbacks = new Map();

export function requestData(petition, callback) {
  // Store callback keyed by Action
  dataCallbacks.set(petition.Action, callback);
  
  // Trigger data request
  appState.setPetitioner(petition);
}
*/



/*
// Utility function
function fetchData(petition) {
  return new Promise((resolve, reject) => {
    requestData(petition, (result) => {
      if (result.error) reject(result.error);
      else resolve(result);
    });
  });
}
*/
/*
// Now use async/await
export async function render(petition) {
  try {
    const result = await fetchData({
      ...petition,
      Action: 'member-count-data'
    });
    // update UI
  } catch (error) {
    // handle error
  }
}
*/
/*
// Inside your module
export function render(petition) {
  document.querySelector(petition.Destination).innerHTML = 'Loading...';

  requestData(
    {
      ...petition,
      Action: 'member-count-data' // ← triggers DBC via state-change
    },
    (result) => {
      document.querySelector(petition.Destination).innerHTML = `
        <div>Members: ${result.data[0].member_count}</div>
      `;
    }
  );
}
*/


/*


requestData(
  { ...petition, Action: 'member-count-data' },
  (result) => {
    // This is YOUR code — you decide what to do with the data
    updateUI(result.data);
  }
);

*/



/*  
  function  permissionEnforcement(request) {
  if (table === "task_assignments" && field === "manager_id") { // ?? example only
    if (request.role !== "admin" && request.approfile_id !== record.manager_id) {
      throw new PermissionDenied("You cannot access this manager_id");
    } //end if
  }//end main if
  }//end of function
*/





    /*

    //both checks passed, have to parse the requestedAction and extarct the payload and call the appropriate function
    let result;
    switch (requestedAction) {
        case 'getUser':
            result = await getUser(payload);
            break;
        case 'addUser':
            result = await addUser(payload);
            break;
        case 'updateUser':
            result = await updateUser(payload);
            break;
        case 'deleteUser':
            result = await deleteUser(payload);
            break;
        default:
            console.error("databaseCentral() unknown request:", request);
            appState.setQueryResult({ error: "Unknown request" });
            return;
    }

 
}
    */