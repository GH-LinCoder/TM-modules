// Single source of truth for application state
console.log('Imported appState.js');
export const appState = {
    // the query object structure (attached to appState) passed to functions & interigated & used at databaseCnetral

isDevMode:true,

clipboard:[],

    query: {

userIdentified:null, // added 11:23 Dec 18 2025 changed Jan 5 2026

userAuthId:'e0c6201d-66e0-4b1c-8826-027ec059d523',
userId :'e0c6201d-66e0-4b1c-8826-027ec059d523',//Huyie T&M vidoes task, member of TestMock,
userName:'Huyie Evridge',
userEmail:'huyie@test.com',
userType: 'app-human',
created_at:'2025-07-28 18:13:47.723148+00',

defaultManagerId:'9066554d-1476-4655-9305-f997bff43cbb',
defaultManagerName:'Lin Coder',
      
petitioner:{},  // Module: name, Section: name, Action: name Destination: name  as data-* attributes, 
      // destination 'a section by name' || 'new-panel' , 
      // key word: if action begins with 'data' it is treated differently as a db request instead of a module load
petitionHistory: [], // so howTo can offer context related instructions. The current petition will be dash-menu-howto-new-panel
      //purpose: null, //not needed? next item covers this
requestedAction: 'Dont-Panic',   //such as: 'UPDATE_TASK_STEP', <--- standardized actions LEGACY 

payload: [], //varies depending on the module. approfile-is/relationship/of_approfile  or task_id/step_id/ordinal
      
response: [], //contains read from DB & status of permission & other response of query DB

remember: [],// redundant LEGACY ??


autoPetition: {
  user: {
    authId: null,
    approId: null
  },

  existing: {
    automationId: null,
    assignmentId: null
  },

  source: {
    type: null,        // 'task' | 'survey' | 'relate' | 'unrelate' | 'message' | 'future'
    header: null,      // task_header_id | survey_header_id | null
    secondary: null    // task_step_id | survey_question_id | null
  },

  target: {
    type: null,        // same enum as above
    header: null,      // task_header_id | survey_header_id | appro_is | null
    secondary: null    // task_step_id | survey_question_id | relationship | of_appro | null
  }
}



    },
    
/* to assign values to autoPetition:
appState.query.auto_petition = {
  user: {
    authId: session.user.id,
    approId: approId
  },

  existing: {
    automationId: auto.id,
    assignmentId: assignment.id
  },

  source: {
    type: 'survey',
    header: sourceSurveyId,
    secondary: clickedAnswerId
  },

  target: {
    type: 'survey',
    header: targetSurveyId,
    secondary: null
  }
};






*/







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
    //    console.log('setPetionioer() History:',this.query.petitionHistory); /////////////
        // Optional: limit history length
        if (this.query.petitionHistory.length > 10) {
          this.query.petitionHistory.shift();
        }
      }
    
      // 👇 UPDATE current petitioner
      Object.assign(this.query.petitioner, petition);
    
//Parse the .Action to see if it is a request for data. 
//Assumes all such petitions have Action='data-*'
// 'data' is now a key word in a petition.Action
//petitionAction.slice(0,4));

let requestType ='QUERY_UPDATE'; // added 18:54 Sept 12 2025
//console.log('Parse of first 5 chars of petition.Action:', petition.Action.slice(0,5));// added 19:00 Sept 12 2025


if (typeof petition.Action === 'string' && petition.Action.startsWith('data-')) {
  requestType = 'DATA_REQUEST';
//  console.log(`Recognized data request: ${petition.Action}`);
} else {
//  console.log(`Module data- request is not known: ${petition.Action}`);
}

/*
if(petition.Action.slice(0,5)==='data-' )
  { requestType = 'DATA_REQUEST'; console.log('Data request recognised');} //added 18:54 Sept 12 2025
   else console.log('Load request recognised');
*/
//can use if(petition.Action.startsWith('data-') )

      // 👇 Dispatch state change
      window.dispatchEvent(new CustomEvent('state-change', { 
//        detail: { type: 'QUERY_UPDATE', payload: this.query } // changed 
          detail: { type: requestType, payload: this.query }// added 18:54 Sept 12 2025

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
//      console.log('appState.setQuery updates:', updates);
      // Merge updates into the existing query object
      Object.assign(this.query, updates);
      // Dispatch event for subscribers
      window.dispatchEvent(new CustomEvent('state-change', { 
        detail: { type: 'QUERY_UPDATE', payload: this.query }
      }));
    },
    
    // Reset to initial state
    resetQuery() {
 //     console.log('appState.resetQuery');
      this.query = {
        userId: this.query.userId, // preserve userId
        stubName: null,
        recordId: null,

        
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
// console.log('initializeState with userId:', userId);
    appState.query.userId = userId;
  }

// noomwild  4 tasks  step 3 of 3, step 3 of 5, step 1 of 5 , step 5 of 8 (+ 1 survey ) 
//const userId : '06e0a6e6-c5b3-4b11-a9ec-3e1c1268f3df',//profilia  step 3 1 task
//const userId :'e44dfc8a-1ded-4c39-aa3b-957c15fa2cf7',//hwbdygg  step 3 1 task
//const userId : '6004dc44-a451-417e-80d4-e9ac53265beb',//cannie step 3 1 task New Welcome

//const userId:'e9b82fd0-067e-43f1-b514-c2dbbfd10cba',//Jubbul  step 3  2 tasks
//const 
//default DEV values
//const userId:'a42c8756-a0ef-41e6-b073-bf20fbd8b7fb',// Tetsi Memoria step 3 2 tasks

//const userId : '87a90183-88b6-450a-94d2-7838ffbbf61b',//girdenjeeko dmin dasboard step 3 - completion

//const userId : '51cf02e4-a69c-41f3-bcff-52d0208df529',//Adam Adminium step 3 2 tasks one task has step 4 other next:completed No students

//const userId:'1c8557ab-12a5-4199-81b2-12aa26a61ec5',// noomwild  4 tasks  step 3 of 3, step 3 of 5, step 1 of 5 , step 5 of 8 (+ 1 survey ) 

//const userId : '6518fbf6-bf22-436b-8960-8af94edecb83',//john cartlin no assignments
    //  userId:'1c8557ab-12a5-4199-81b2-12aa26a61ec5', // noomwild who has lots of task assignments BUT not a manager

      
      //stubName: null,//obsolescent - phasing-out
      //recordId: null, //not sure if needed
