// Single source of truth for application state
console.log('Imported appState.js');
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
      
      // simple description of the request. Not sure if useful
      READ_request: false,
      INSERT_request: false,
      DELETE_request: false,
      UPDATE_request: false,
      
      petitioner:{},  // moduleName, sectionName, element (card or button) data-* attribute, destination 'a section' || 'new-panel'
      petitionHistory: [], // so howTo can offer context related instructions. The current petition will be dash-menu-howto-new-panel
      //purpose: null, //not needed? next item covers this
      requestedAction: 'Dont-Panic',   //such as: 'UPDATE_TASK_STEP', <--- standardized actions LEGACY 

      payload: [], //varies depending on the module. approfile-is/relationship/of_approfile  or task_id/step_id/ordinal
      
      response: [], //contains read from DB & status of permission & other response of query DB
    },
    

    setPetitioner(petition) {
      console.log('setPetitioner(',petition,')' );
     // console.log('this.query.petitioner:',this.query.petitioner );//the log shows all the values even at appOnLoad - browser doesn't take the values at this moment, but may fill them in later
    //  console.log('this.query.petitioner.Action',this.query.petitioner.Action)// the log says undefined at appOnLoad - this is weird browser behaviour as it does take this value at the moment
      // 👇 SAVE TO HISTORY if action is meaningfully different
      const currentAction = this.query.petitioner.Action;
    //  console.log('petition.Action:',petition.Action);
      if (petition.Action !== currentAction) {
        // Clone current petitioner and push to history
        this.query.petitionHistory.push({ ...this.query.petitioner });
        console.log('setPetionioer() History:',this.query.petitionHistory); /////////////
        // Optional: limit history length
        if (this.query.petitionHistory.length > 10) {
          this.query.petitionHistory.shift();
        }
      }
    
      // 👇 UPDATE current petitioner
      Object.assign(this.query.petitioner, petition);
    
    
      // 👇 Dispatch state change
      window.dispatchEvent(new CustomEvent('state-change', { 
        detail: { type: 'QUERY_UPDATE', payload: this.query }
      }));
    },

    /*
    setPetitioner(petition) {
      console.log('appState.setPetitioner:', petition);
      Object.assign(this.query.petitioner, petition);
      this.query.requestedAction = this.query.petitioner.Action;

      window.dispatchEvent(new CustomEvent('state-change', { 
        detail: { type: 'QUERY_UPDATE', payload: this.query }
      }));
    },
replaced 21:57 sept 10 2025 to use petitionHistory[]*/


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
        
        petitioner:{},  // moduleName, sectionName, element (card or button) data-* attribute, destination 'a section' || 'new-panel'
        petitionHistory: [], // so howTo can offer context related instructions. The current petition will be dash-menu-howto-new-panel
        //purpose: null, //not needed? next item covers this
        requestedAction: 'Dont-Panic',   //such as: 'UPDATE_TASK_STEP', <--- standardized actions  LEGACY to be phased out
  
        payload: [], //varies depending on the module. approfile-is/relationship/of_approfile  or task_id/step_id/ordinal
        
        response: [], //contains read from DB & status of permission & other response of query DB
      };
    }
  };
  
  // Export a function to initialize with user ID
  export function initializeState(userId) {
console.log('initializeState with userId:', userId);
    appState.query.userId = userId;
  }

