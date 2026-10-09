// ./windowEventPetitionListener.js
console.log('windowEventPetitionListener.js imported');

import {openClosePanelsByRule} from '../flexmain.js';
// listen for a window event

export function windowEventPetitionListener(){
console.log('windowEventPetitionListener()');
    // === STATE CHANGE HANDLER ===
    // appState has a function to add a petition to the global appState. When that happens appState dispatches a window change event
// the following listener reacts to that event which is announcuing that there is a new petition that should lead to a module being opened (or closed if already open)

    window.addEventListener('state-change', async (e) => {
        const { type, payload } = e.detail;

        /*
   console.group('🔍 windowListener() reacting to state change e',e);
    console.trace('Called from:');  // ← Shows full call stack
    console.log('windowListenerchecking values in e.detail:',e.detail);
        console.log('windowListenerchecking values in e.detail:', 'type: ',type, '+ payload inside e.detail: ',payload);
    console.groupEnd();
*/
    //the type and payload are the original system values of huyie Everidge. They aren't the actual petition values wet by the 
  //      console.log('State change event at window.addEventListener:', type, payload, 'Action:',payload.petitioner.Action,' to ', payload.petitioner.Destination);
      //  console.log('Action:',payload.petitioner.Action,' to ', payload.petitioner.Destination);
     //   console.log('appState.query in state-change event:', appState.query.pr); //global
        switch (type) {
          case 'QUERY_UPDATE':
    
            //if ( payload.stubName) {
              if ( payload.petitioner.Action) {  
             await openClosePanelsByRule(payload.petitioner.Action); 
             //is this closing the dash and reopening it?  March 29 2026?
           }
            break;
    /*
            case 'DATA_REQUEST':  // the appState still has code for this. Probabbly legacy. Oct 4 2026
    
            //if ( payload.stubName) { //Suspect this is needlesly calling extra panel changes and recalling functions when/if payload changes.
              if ( payload.petitioner.Action) {  //why is a change in data triggering this? Is it causing unneeded display changes? March 29
              await openClosePanelsByRule(payload.petitioner.Action); //<---need import to use await executeIfPermitted(payload.petitioner.Action); 
           }
            break;
   */ //commented out 13:19 March 29 2026 What will it break?    Oct 4 2026 nothing broken?
    
          case 'DATA_LOADED':
          //  updateUI(payload.data); //what is this?
            break;
        }
      });
}