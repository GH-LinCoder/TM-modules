// ./windowEventListener.js
console.log('windowEventListener.js imported');

import {openClosePanelsByRule} from '../flexmain.js';


export function windowEventListener(){
console.log('windowEventListener()');
    // === STATE CHANGE HANDLER ===
    
    window.addEventListener('state-change', async (e) => {
        const { type, payload } = e.detail;

   console.group('🔍 windowListener() reacting to state change e',e);
    console.trace('Called from:');  // ← Shows full call stack
    console.log('windowListenerchecking values in e.detail:',e.detail);
        console.log('windowListenerchecking values in e.detail:', 'type: ',type, '+ payload inside e.detail: ',payload);
    console.groupEnd();

    //the type and payload are the original system values of huyie Everidge. They aren't the actual petition values wet by the 
        console.log('State change event at window.addEventListener:', type, payload, 'Action:',payload.petitioner.Action,' to ', payload.petitioner.Destination);
      //  console.log('Action:',payload.petitioner.Action,' to ', payload.petitioner.Destination);
     //   console.log('appState.query in state-change event:', appState.query.pr); //global
        switch (type) {
          case 'QUERY_UPDATE':
    
            //if ( payload.stubName) {
              if ( payload.petitioner.Action) {  
             await openClosePanelsByRule(payload.petitioner.Action); //is this doing too much opeing and closing when the call is to load a new module inside the dashboard, is it closing the dash and reopening it  March 29 2026?
           }
            break;
    /*
            case 'DATA_REQUEST':
    
            //if ( payload.stubName) { //Suspect this is needlesly calling extra panel changes and recalling functions when/if payload changes.
              if ( payload.petitioner.Action) {  //why is a change in data triggering this? Is it causing unneeded display changes? March 29
              await openClosePanelsByRule(payload.petitioner.Action); //<---need import to use await executeIfPermitted(payload.petitioner.Action); 
           }
            break;
   */ //commented out 13:19 March 29 2026 What will it break?    
    
          case 'DATA_LOADED':
          //  updateUI(payload.data); //what is this?
            break;
        }
      });
    


}