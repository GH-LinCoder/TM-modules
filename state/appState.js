// @ts-check
// Single source of truth for application state & petition to open and close modules
console.log('Imported appState.js');
// when buildPetitionListener OR menuListener send a petition to be stored in appState, 
// the function here dispatches a window event which is picked up by windowEventPetitionListener
//which calls openClosePanelsByRule() which opens a new module or closes the existing module

/**
 * @typedef {Object} Petitioner
 * @property {string|null} [Module]
 * @property {string|null} [Section]
 * @property {string|null} [Action]
 * @property {string|null} [Destination]
 * 
 * 
 * @property {string|null} [studentId]
 * @property {string[]|null} [assignmentRoles]
 * @property {string|null} [assignmentId]
 * @property {string|null} [surveyHeader]
 * @property {number|null} [currentStep]
 * @property {string|null} [taskHeaderId]
 */


export const appState = {
  // Payment provider metadata
  paymentProvider: {
    platformId: 'e056bb4b-791a-49bd-b7ab-8e9c143ab7a4',
    approId: '8f9e5a4d-b9ea-458a-b7a6-843c7022e8d5',
    name: 'Lemon Squeezy',
  },

  // Global clipboard storage
  clipboard: [],

  // Authenticated user state
  authUser: {
    userAuthId: null,
    userId: null,
    userName: null,
    userEmail: null,
    userType: 'app-human',
    created_at: null,
  },

  // Currently active/chosen user context
  chosenSubject: {
    userChosenAuthId: null,
    userChosenId: null,
    userName: null,
    userEmail: null,
    userType: 'app-human',
    created_at: null,
  },

  // Active query parameters and context
  query: {
    userIdentified: null,
    userAuthId: null,
    userId: null,
    userName: null,
    userEmail: null,
    userType: 'app-human',
    created_at: '2025-07-28 18:13:47.723148+00',
    defaultManagerId: null,
    defaultManagerName: 'Lin Coder',

    // Formalized petitioner schema including all module-written fields
    /** @type {Petitioner} */
    petitioner: {
      Module: null,
      Section:null,          
      Action: null,
      Destination:null,
studentId:null,

      assignmentRoles: null, // displayStudentsOnTasks.js / moveStudentManager.js
      assignmentId: null,    // displaySurveyCards.js & displayTaskCards.js
      surveyHeader: null,    // displaySurveyCards.js
      currentStep: null,     // displaySurveyCards.js
      taskHeaderId: null    // displayTaskCards.js
      
    },

    petitionHistory: [],
    requestedAction: 'Dont-Panic',
    payload: [],
    response: [],
    remember: {},

    // Automated petition execution payload
    autoPetition: {
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
  setPetitioner(petition) {
    console.log('setPetitioner()');

    const currentAction = this.query.petitioner.Action;

    // Save to history if action changes meaningfully
    if (petition.Action && petition.Action !== currentAction) {
      this.query.petitionHistory.push({ ...this.query.petitioner });
      if (this.query.petitionHistory.length > 10) {
        this.query.petitionHistory.shift();
      }
    }

    // Update petitioner in-place
    Object.assign(this.query.petitioner, petition);

    // Identify if action is a database data request
    let requestType = 'QUERY_UPDATE';
    if (typeof petition.Action === 'string' && petition.Action.startsWith('data-')) { 
      // I don't think this is used. It is commented out in windowEventPetitionListener. Probabbly legacy. Oct 4 2026
      requestType = 'DATA_REQUEST';
    }

    // Dispatch state change event - which windowListener should pick up - it then opensClosesPanelsByRule()  which then calls the module to load the new module into the panel
    window.dispatchEvent(
      new CustomEvent('state-change', {
        detail: { type: requestType, payload: this.query },
      })
    );
  },

  setQuery(updates) { //is this used?
    Object.assign(this.query, updates);
    window.dispatchEvent(
      new CustomEvent('state-change', {
        detail: { type: 'QUERY_UPDATE', payload: this.query },
      })
    );
  },

  resetQuery() { //is this used?
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

    // Mutate autoPetition sub-objects in-place
    Object.assign(this.query.autoPetition.user, { authId: null, approId: null });
    Object.assign(this.query.autoPetition.existing, { automationId: null, assignmentId: null });
    Object.assign(this.query.autoPetition.source, { type: null, header: null, secondary: null });
    Object.assign(this.query.autoPetition.target, { type: null, header: null, secondary: null });

    // Clear history array in-place
    this.query.petitionHistory = [];
  },
};

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