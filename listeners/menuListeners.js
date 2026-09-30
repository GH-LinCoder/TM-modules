//   ./listeners/navListeners.js
// Responds to menu buttons, builds a petition, inserts it in appState. ()
// === GLOBALS
import { appState } from '../state/appState.js'; // modules interact through appState
console.log('menuListeners loaded');

export function menuListeners() {//unlike admiListeners navListeners have not been loading petition by reading html
//    console.log('Setting up navigation listeners');
//changed from document.  in hope this will solve the problem with unresponsive dropdowns - FAILED
document.querySelectorAll('[data-nav="main-nav"]').forEach(nav => {
    nav.addEventListener('click', async (e) => {
        const btn = e.target.closest('.nav-btn');
        if (!btn) return;

if (['SELECT', 'OPTION', 'INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

 e.preventDefault(); //removed in hope that the dropdowns would now respond - failed  17:12 May 9
 e.stopPropagation(); //removed in hope that the dropdowns would now respond - failed

    const pageName = btn.dataset.page; //
   
                      //markMenuButton(pageName, btn); ////commented out sept 21 2026
/*
    if(pageName === 'howTo'){ // store the existing petition for later use to give context related howTo
const howToContext = appState.query.petitioner;  //legacy ? to be removed? now using petitioner & history?
console.log('howToContext:',howToContext);
    }
*/  //commented out 12:11 Sept 21 2026

    console.log('Navigation button clicked for page:', );
    const petition={'Section':'menu','Action':pageName, 'Destination':'new-panel'};//try without .html 14:56 sep 22 2025    
    appState.setPetitioner(petition); //keeping petitioner in sync with stubName

                    //    const stubName = pageName + '.html'; //????????????????
  })
})
}

//commented out completely sept 21 2026
//removed 22:05 Aug27 trying to do this in openClosePanelsByRules()
//export function markMenuButton(pageName, btn){
//is called from somewhere - flexmain.js imports on line 57
// calls it on line 225 
//markMenuButton('myDash', myDashBtn);
//not calling this causes failure, but it doesn't do anything??
//also called in this file line 20. If not called the buttons do not react
//} 