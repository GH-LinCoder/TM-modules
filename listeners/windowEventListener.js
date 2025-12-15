// ./windowEventListener.js
console.log('windowEventListener.js imported');

import {openClosePanelsByRule} from '../flexmain.js';


export function windowEventListener(){

    // === STATE CHANGE HANDLER ===
    
    window.addEventListener('state-change', async (e) => {
        const { type, payload } = e.detail;
        console.log('State change event at window.addEventListener:', type, payload, 'Action:',payload.petitioner.Action,' to ', payload.petitioner.Destination);
      //  console.log('Action:',payload.petitioner.Action,' to ', payload.petitioner.Destination);
     //   console.log('appState.query in state-change event:', appState.query.pr); //global
        switch (type) {
          case 'QUERY_UPDATE':
    
            //if ( payload.stubName) {
              if ( payload.petitioner.Action) {  
             await openClosePanelsByRule(payload.petitioner.Action); 
           }
            break;
    
            case 'DATA_REQUEST':
    
            //if ( payload.stubName) {
              if ( payload.petitioner.Action) {  
              await openClosePanelsByRule(payload.petitioner.Action); //<----------------------------need import to use await executeIfPermitted(payload.petitioner.Action); 
           }
            break;
       
    
          case 'DATA_LOADED':
          //  updateUI(payload.data); //what is this?
            break;
        }
      });
    


}