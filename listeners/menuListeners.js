//   ./listeners/navListeners.js
// === GLOBALS
import { appState } from '../state/appState.js'; // modules interact through appState

export function menuListeners() {//unlike admiListeners navListeners have not been loading petition by reading html
//    console.log('Setting up navigation listeners');

    document.addEventListener('click', async (e) => {
//    console.log('Navigation click event:', e.target);
    
    const btn = e.target.closest('.nav-btn');
    if (!btn) return;

    e.preventDefault();
    e.stopPropagation();

    const pageName = btn.dataset.page; //pageName is set in flex load.html Nothing else set there
markMenuButton(pageName, btn);
    if(pageName === 'howTo'){ // store the existing petition for later use to give context related howTo
const howToContext = appState.query.petitioner;  //legacy ? to be removed? now using petitioner & history?
console.log('howToContext:',howToContext);
    }

    console.log('Navigation button clicked for page:', );
    const petition={'Section':'menu','Action':pageName, 'Destination':'new-panel'};//try without .html 14:56 sep 22 2025
    //const petition={'Section':'menu','Action':pageName+'.html', 'Destination':'new-panel'}; //new petitioner object 23:22 7 Sept 2025
    //appState.query.petitioner.Action = pageName + '.html'; //keeping petitioner in sync with stubName
    appState.setPetitioner(petition); //keeping petitioner in sync with stubName

    const stubName = pageName + '.html'; //????????????????

// Call the extracted function. true indicates it's from button click
//await openClosePanelsByRule(stubName, true); 

//this is where we handle the logic for opening/closing panels based on button clicks
//I want to extract this logic into its own function so I can call it from other places if needed 
//but when I tried this it ceased to work. need to understand why.

    // Remove active class from all buttons
//    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));


  });
}

export function markMenuButton(pageName, btn){
  console.log('markMenuButton()', pageName, btn);
  document.querySelectorAll('.nav-btn').forEach(el => {
    console.log('el.dataset.page',el.dataset.page, 'currentpage',pageName);
    el.classList.toggle('ring-4', el.dataset.page === pageName);
    el.classList.toggle('ring-blue-500', el.dataset.page === pageName);
    el.classList.toggle('bg-blue-100', el.dataset.page === pageName);
  });


} 