// Single source of truth for application state
export const appState = {
    // Your query object structure
    query: {
      userId: null,
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
    },
    
    // Methods to update state
    setQuery(updates) {
      Object.assign(this.query, updates);
      // Dispatch event for subscribers
      window.dispatchEvent(new CustomEvent('state-change', { 
        detail: { type: 'QUERY_UPDATE', payload: this.query }
      }));
    },
    
    // Reset to initial state
    resetQuery() {
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
    appState.query.userId = userId;
  }