// @ts-check
// Single source of truth for application state & petition to open and close modules
console.log('Imported appState.js');
// when buildPetitionListener OR menuListener send a petition to be stored in appState, 
// the function here dispatches a window event which is picked up by windowEventPetitionListener
//which calls openClosePanelsByRule() which opens a new module or closes the existing module




export const appState = {
  

  // Global clipboard storage
  clipboard: [],

  // Global record of what panels (modules) are on screen
  panelsOnDisplay: [],  //added 21:37 Oct 4 2026. Was in flexmain as a global


/**
 * @typedef {Object} StudentsManagers
 * @property {string[]|null} assignmentRoles
 * @property {string|null} taskHeaderId
**/
    studentsManagers:{//STUDENTS & MANAGERS - possible new position
      assignmentRoles: null, // displayStudentsOnTasks.js / moveStudentManager.js
      taskHeaderId: null,    // displayStudentsOnTasks.js / moveStudentManager.js
    },

/**
 * @typedef {Object} DisplaySurveysTasks
 * @property {string|null} assignmentId
 * @property {string|null} surveyHeaderId
 * @property {number|null} currentStep
 */
    displaySurveysTasks:{ // - possible new position
      assignmentId: null,    // displaySurveyCards.js  / displayOneSurvey / displayTaskCards.js 
      surveyHeaderId: null,    // displaySurveyCards.js  / displayOneSurvey (should be id ?)
      currentStep: null      // displaySurveyCards.js  / displayOneSurvey   
    },


  // Active query parameters and context
  query: {

    // Formalized petitioner schema including all module-written fields
    /**
 * @typedef {Object} Petitioner
 * @property {string|null} [Module]
 * @property {string|null} [Section]
 * @property {string|null} [Action]
 * @property {string|null} [Destination]
 * 
 * @property {string|null} [studentId]
 */
    petitioner: { //used lots & must stay inside query unless refactor all the calls
      Module: null,
      Section:null,          
      Action: null,
      Destination:null,

      studentId:null, //used sometimes
    },

    petitionHistory: [], 
    maxHistoryLength:10, //limits how many modules to display in lists

    userIdentified: null,  // not used? Oct 6 2026
    userAuthId: null, //used by resolveSubjectPlus2
    userId: null, //used
    userName: null, //used
    userEmail: null, //used 
    userType: 'app-human', //used in resolveSubject
    created_at: '2025-07-28 18:13:47.723148+00',
    defaultManagerId: null,  //used
    defaultManagerName: 'Lin Coder', //used

    requestedAction: 'Dont-Panic', //not used? Oct 10 2026

    payload: [],  //autoRelateAppro.js

    response: [], //not used Oct 10 2026
    remember: {}, //not used Oct 10 2026

    
    // Automated petition execution payload
    autoPetition: { //not used 10 Oct 2026 ? at least not in JS
      user: {
        authId: null,
        approId: null,
      },
      existing: {
        automationId: null,
        assignmentId: null,
      },
      source: {
        type: null,     // 'task' | 'survey' | 'relate' | 'unrelate' | 'message' | 'future'
        header: null,   // taskheaderid | surveyheaderid | null
        secondary: null, // taskstepid | surveyquestionid | null
      },
      target: {
        type: null,     // same enum as above
        header: null,   // taskheaderid | surveyheaderid | approis | null
        secondary: null, // taskstepid | surveyquestionid | relationship | ofappro | null
      },
    },


  },



  // --- State Modification Methods ---
/** 
   * @this {typeof appState}
   * @param {Petitioner} petition
   */
  setPetitioner(petition) { //used lots
    console.log('setPetitioner()');

    const currentAction = this.query.petitioner.Action;

    // Save to history if action changes meaningfully
    if (petition.Action && petition.Action !== currentAction) {
      this.query.petitionHistory.push({ ...this.query.petitioner });
      if (this.query.petitionHistory.length > this.query.maxHistoryLength) {
        this.query.petitionHistory.shift();
      }
    }

if(!petition.Module ||!petition.Section || !petition.Action || !petition.Destination) console.log('WARN petition incomplete', petition);
    // Update petitioner in-place. Using 'Object.assign, means that a partial petition that has missing bits will be melded with the old petition.
    //Old:  Module='adminDash' Section='QuickActs' Action='edit-task-dialogue' destination='display-araea'
  //if the new petition just sends: Action='edit-survey-dialogue' then the module, section and destination stay the same.
  //This may be why partial petitions work. Or this may be a menace that will cause confusion.
//Is this wise??
    Object.assign(this.query.petitioner, petition);

    // Identify if action is a database data request
    let requestType = 'QUERY_UPDATE';
    /* //commented out 12:00 Oct 10 2026
    if (typeof petition.Action === 'string' && petition.Action.startsWith('data-')) { 
      // I don't think this is used. It is commented out in windowEventPetitionListener. Probabbly legacy. Oct 4 2026
      requestType = 'DATA_REQUEST';
    } */

    // Dispatch state change event - which windowListener should pick up - it then opensClosesPanelsByRule()  which then calls the module to load the new module into the panel
    window.dispatchEvent(
      new CustomEvent('state-change', {
        detail: { type: requestType, payload: this.query },
      })
    );
  },


/**
 * @typedef {Object} StudentsManagersUpdates
 * @property {string} [taskHeaderId] - UUID, used in displayStudentsOnTasks.js / moveStudentManager.js
 * @property {Array<string>|Object} [assignmentRoles] - Used in displayStudentsOnTasks.js / moveStudentManager.js
 */
/**
 * @param {StudentsManagersUpdates} updates - Accepts partial updates
 */

setStudentsManagers(updates) {//not yet used in modules Oct 11 2026
  console.log('setStudentsManagers()');
  Object.assign(this.studentsManagers, updates);

//taskHeaderId  used in // displayStudentsOnTasks.js / moveStudentManager.js
//assignmentRoles used in // displayStudentsOnTasks.js / moveStudentManager.js

},

/**
 * @typedef {Object} DisplaySurveysTasksUpdates
 * @property {string} [assignmentId] - UUID, used in displaySurveyCards.js / displayOneSurvey / displayTaskCards.js
 * @property {string} [surveyHeaderId] - UUID, used in displaySurveyCards.js / displayOneSurvey
 * @property {number|string} [currentStep] - Used in displaySurveyCards.js / displayOneSurvey
 */
/**
 * @param {DisplaySurveysTasksUpdates} updates - Accepts partial updates
 */
setDisplaySurveysTasks(updates) {//not yet used in modules Oct 11 2026
console.log('setDisplaySurveysTasks');
Object.assign(this.displaySurveysTasks, updates);

//assignmentId used in/ displaySurveyCards.js / displayOneSurvey /displayTaskCards.js 
//surveyHeader used in/ displaySurveyCards.js  / displayOneSurvey (should be id ?)
//currentStep used in/ displaySurveyCards.js  / displayOneSurvey

},


///////////////////   below are old sections and methods not currently used Oct 10 2026

//////    SECTIONS of object not currently used in app  10 Oct 2026   /////

/*
// Payment provider metadata. THIS CANNOT BE ALLOWED. 
// Cannot be hard coded as each customer of the app would have different account
// The account has to be read from tables.
  paymentProvider: {//Not used Oct 11 2026 
    platformId: 'e056bb4b-791a-49bd-b7ab-8e9c143ab7a4', //search Not used Oct 11 2026
    approId: '8f9e5a4d-b9ea-458a-b7a6-843c7022e8d5',
    name: 'Lemon Squeezy',
  },
*/

/*
  // Authenticated user state
  authUser: { // looks like not used Oct 6 2026
    userAuthId: null,
    userId: null,
    userName: null,
    userEmail: null,
    userType: 'app-human',
    created_at: null,
  },
*/
/*
  // Currently active/chosen user context
  chosenSubject: { // Global search found no use of this Oct 6 2026
    userChosenAuthId: null,
    userChosenId: null,
    userName: null,
    userEmail: null,
    userType: 'app-human',
    created_at: null,
  },
*/






//////    METHODS not currently used in app  10 Oct 2026   /////

  setQuery(updates) { //not used 10 Oct 2026
    Object.assign(this.query, updates);
    window.dispatchEvent(
      new CustomEvent('state-change', {
        detail: { type: 'QUERY_UPDATE', payload: this.query },
      })
    );
  },

  resetQuery() { // not used 10 Oct 2026
    console.log('appState.resetQuery');
    const preserveUserId = this.query.userId;

    // Mutate existing query top-level properties in-place (preserves Object.seal)
    Object.assign(this.query, {
      userIdentified: null,
      userAuthId: null,
      userId: preserveUserId,
      userName: null,
      userEmail: null,
      userType: 'app-human',
      created_at: null,
      defaultManagerId: null,
      defaultManagerName: null,
      requestedAction: 'Dont-Panic',
      payload: [],
      response: [],
      remember: {},
    });

    // Mutate petitioner in-place
    Object.assign(this.query.petitioner, {
      assignmentRoles: null,
      assignmentId: null,
      surveyHeader: null,
      currentStep: null,
      taskHeaderId: null,
      Action: null,
    });

    // Mutate autoPetition sub-objects in-place  Seems that this is not used 10 Oct 2026
    Object.assign(this.query.autoPetition.user, { authId: null, approId: null });
    Object.assign(this.query.autoPetition.existing, { automationId: null, assignmentId: null });
    Object.assign(this.query.autoPetition.source, { type: null, header: null, secondary: null });
    Object.assign(this.query.autoPetition.target, { type: null, header: null, secondary: null });

    // Clear history array in-place
    this.query.petitionHistory = [];
  },
};

//END of methods not currently used




//Deep seal idea

// Recursive helper to deeply seal all nested objects
//I have no idea if this is worth having.
// It silently failed when there was an item (student)  in a petition that was not in the definition
//That is a menace. Si I am switching it off
/*
function deepSeal(obj) {
  if (obj && typeof obj === 'object') {
    Object.seal(obj);
    Object.keys(obj).forEach((key) => {
      // Traverse sub-objects, skipping arrays/nulls
      if (
        typeof obj[key] === 'object' &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        deepSeal(obj[key]);
      }
    });
  }
  return obj;
} */

  /* this function did not display an error
function deepSealAndTrap(obj, path = 'appState') {
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    // Wrap with Proxy to catch silent non-strict mode assignment failures
    return new Proxy(Object.seal(obj), {
      set(target, prop, value, receiver) {
        if (!Object.prototype.hasOwnProperty.call(target, prop)) {
          const err = new Error(
            `🚨 UNEXPECTED WRITE BLOCKED: Tried to write unknown property '${String(prop)}' on '${path}' with value: ${JSON.stringify(value)}`
          );
          console.error(err.stack);
          throw err;
        }
        return Reflect.set(target, prop, value, receiver);
      },
    });
  }
  return obj;
} */

// Deep seal just fails silently if there is a discrepancy. This is not useful.
// It should warn if a module puts something into appState that isn't explicit in its definition
//deepSeal(appState);

// Enable the write trap on appState.query and appState.query.petitioner
//appState.query.petitioner = deepSealAndTrap(appState.query.petitioner, 'appState.query.petitioner');
//appState.query = deepSealAndTrap(appState.query, 'appState.query');