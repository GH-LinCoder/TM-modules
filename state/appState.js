// Single source of truth for application state
export const appState = {
    // the query object structure (attached to appState) passed to functions & interigated & used at databaseCnetral

/**
 * @type {{ action: string, payload: Array<{approfile_is: string, relationship: string, of_approfile: string}>, 
 * 
 */

    query: {
      userId: null,
      stubName: null,//obsolescent - phasing-out
      recordId: null, //not sure if needed
      
      // simple description of the request
      READ_request: false,
      INSERT_request: false,
      DELETE_request: false,
      UPDATE_request: false,
      
      petitioner:[],  // moduleName, sectionName, element (card or button) data-* attribute
      //purpose: null, //not needed? next item covers this
      requestedAction: 'Dont-Panic',   //such as: 'UPDATE_TASK_STEP', <--- standardized actions

      payload: [], //varies depending on the module. approfile-is/relationship/of_approfile  or task_id/step_id/ordinal
      
      response: [], //contains read from DB & status of permission & other response of query DB
    },
    
    
    // Methods to update state
    setQuery(updates) {
      console.log('appState.setQuery updates:', updates);
      // Merge updates into the existing query object
      Object.assign(this.query, updates);
      // Dispatch event for subscribers
      window.dispatchEvent(new CustomEvent('state-change', { 
        detail: { type: 'QUERY_UPDATE', payload: this.query }
      }));
    },
    
    // Reset to initial state
    resetQuery() {
      console.log('appState.resetQuery');
      this.query = {
        userId: this.query.userId, // preserve userId
        stubName: null,
        recordId: null,
        READ_request: false,
        INSERT_request: false,
        DELETE_request: false,
        UPDATE_request: false,
        callerContext: null,
        purpose: null,
        payload: {},
        response: null
      };
    }
  };
  
  // Export a function to initialize with user ID
  export function initializeState(userId) {
console.log('initializeState with userId:', userId);
    appState.query.userId = userId;
  }