//flexmain.js  version 23:00 Dec 13 - commented out parts signalled as unused

/**
 * === FLOW: Panel Management ===
 * (in dev we are loading the admin Dashboard)
 
 * 1. User clicks a button or card
 * 2. Listener extracts intent {Module/Section/Action}
 * 3. appState.query.petitioner = { Module Section Action}
 * 4. appState.query.stubName = 'xxx.html' //legacy to be phased-out
 * 5. state-change event → openClosePanelsByRule()
 * 6. → if already open: close
 *    → else: renderPanel()
 * 7. renderPanel() checks registry → loads module // or HTML - legacy to be phased-out
 * 8. Module takes over (self-contained)
 * 
 * === PRINCIPLES ===
 * - Single source of truth: appState
 * - No direct DOM manipulation
 * - Panels are tracked in panelsOnDisplay
 * - Toggle logic is centralized
 * - Database connections concentrated in databaseCentral()
 * - All databse interactions via the rules in permitted(), but enforced by database functions
 */


console.log('Imported: flexmain.js');

// === LISTENERS 
import { adminListeners } from './listeners/adminListeners.js';
import { windowEventListener } from './listeners/windowEventListener.js';
import { menuListeners } from './listeners/menuListeners.js';
import {markMenuButton}  from './listeners/menuListeners.js';


// === GLOBALS
import { appState } from './state/appState.js'; // modules interact through appState
import { registry } from './registry/registryLoadModule.js'; // stores page (module) loading functions

// === Data from database
import { loadAdminDashWithData } from './dash/loadAdminDashWithData.js';
import { loadMyDashWithData } from './dash/loadMyDashWithData.js';


// === UTILITY: Get main display area ===
function getDisplayArea() {
//console.log('GetDisplayArea()');

const destination=appState.query.petitioner.Destination;
//console.log('destination:',destination);
if(destination==='new-panel') return document.querySelector('[data-panel="inject-here"]');
else {const displayArea = document.querySelector(`[data-section="${destination}"]`);
//  console.log('displayArea:',displayArea );
  return  displayArea;
}

}

function getFrameAroundThePages() {
    return document.getElementById('main-container');
}

// === GLOBAL STATE ===
export const panelsOnDisplay = [];



//                          === DEV MODE: Loads adminDash.html stub ===   <------ !!!!!!!
/*  the 'petitioner' represents what part of the app has requested some action. The source may be a nav button or card or software.
 @ 'Module' is the webpage or the js file.
 @  'Section' is if the page or file is split into parts. 
 @   'Action' comes from the element clicked & is descriptive of the desired result, not of the source
 @  
 @   'adminDash'  // dashboards have preferential treatment. Displaying on left
 @   'myDash' // & able to close all other open pages by clicking the menu button a 2nd time 

 @   '404.html', //is a default start page that explains to click menu.
 @   'howTo' //is for context specific instructions
 @   'login/out' //brings up the relevant login/out/signup/password forms

      // If no file is specified the app crashes with unresponsive menu buttons, 
      // but if wrong name used app runs, flags 'Error loading file.html' & menu works so can then load any dashboard

      // in dev we start with adminDash.html.. This was changed to myDash 10:45 Dec 18 2025
      // in deployed app the intial page is based on login & permissions, but could have default page

      // the page/module to display is stored in the appState.query.petitioner objec
     

      //     userId: '06e0a6e6-c5b3-4b11-a9ec-3e1c1268f3df' // MOCK but in db - not used as at 14:36 7 Sept 2025
*/


try {
  if (appState) {
  //  console.log('appState has been successfully loaded:', appState);

    const petition = {'Module':'myDash','Section': 'jsDevMock','Action': 'myDash', 'Destination':'new-panel'}; //changed from adminDash to myDash 10:42 Dec 18
    appState.setPetitioner(petition); //dev set-up of petitioner object 14:39 7 Sept 2025

  //  console.log('appState.query in flexmain after setQuery:', appState.query); //global
         // console.log('local query in flexmain after appState.setQuery:', query); //local
  } else {
    console.error('appState is undefined or not properly exported.');
  }
} catch (error) {
  console.error('Error while accessing appState:', error);
}


windowEventListener(); //Listen for change of State

// === STATE CHANGE HANDLER ===
/*  trying to use external file in place of this local function 10:15 Sept 14
window.addEventListener('state-change', async (e) => {
    const { type, payload } = e.detail;
    console.log('State change event at window.addEventListener:', type, payload);
    console.log('Action:',payload.petitioner.Action,' to ', payload.petitioner.Destination);
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
        updateUI(payload.data); //what is this?
        break;
    }
  });
*/



// === APP INITIALIZATION ===
document.addEventListener('DOMContentLoaded', onAppLoad);



async function onAppLoad() {
    console.log('onAppLoad(), initializing...');
  // Ensure display area is available
  //const displayArea = getDisplayArea();

  
  let query=appState.query; //now global    //<------------------------- important
  
  
  // Load a page initially (full width)
  if (panelsOnDisplay.length === 0) {
    await renderPanel(query.petitioner); 
    const name=query.petitioner.Action;//changed 16:46 7 Sept 2025
  //console.log('Calling loadPageWithData(',name,')');
  await loadPageWithData(name.replace('.html','')); //changed 14:49 7 Sept 2025

    // Set active button   //redundant?
//    const adminBtn = document.querySelector('[data-page="adminDash"]');
//    if (adminBtn) adminBtn.classList.add('active');
//below new 15:00 Dec 21
    const myDashBtn = document.querySelector('[data-page="myDash"]');
markMenuButton('myDash', myDashBtn);

  }
// changed to external function 10:47 spet 14 2025

menuListeners();//add listener to menu buttons, and respond to their being clicked


//  setupNavigationListeners();//local function
  const frameAroundThePages = getFrameAroundThePages();
  adminListeners(frameAroundThePages); //imported function  this may be wrong element. need the frame around the pages
  console.log('-----------Initialization COMPLETED ------------.');
}

// === LOAD PAGE WITH DATA ===
async function loadPageWithData(pageName) { // pageName without .html
 // console.log('LoadPageWithData(', pageName,')');
  switch(pageName) {
      case 'adminDash':
          await loadAdminDashWithData();
          break;
      // Add cases for other pages as needed
      case 'myDash':
           await loadMyDashWithData(); // Implement this function similarly
         // console.warn('loadMyDashWithData() not implemented yet');
          break;
      default:
          console.warn(`No data loader defined for ${pageName}`);
  }
}


// === PANEL RENDERING ===

async function renderNewPanel(stubName, query, registryEntry,selectedModule, displayArea){// new 10:35 sept 10 2025 Moved from renderPanels- which needs a name change
 // console.log('renderNewPanel(',displayArea,')');
  if(registryEntry) { 
///below conditional on 'new-panel

//moved here 9.44 Sep 10
const panel = document.createElement('div');
panel.className = 'page-panel';
panel.dataset.pageName = stubName; //what is this?
//
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
//moved here  9.42 sep 10
displayArea.appendChild(panel);
panelsOnDisplay.push({ stubName, panel, query });// why using stubName?? legacy - should use .petitioner.Module
//

try {
selectedModule.render(panel,query); // use the function that was obtained from the registry
} catch (error) {
  console.error('Failed to load module:', error);
//  console.log('Available exports:', Object.keys(selectedModule));
}

}


}

async function backgroundProcess() {
    
    const action = appState.query.petitioner.Action;
 //   console.log('background process', action);
    let registryEntry = await registry[action];
    if (!registryEntry) { 
 //       console.log('Registry unknown', action, ' not here');
        return false;
    }
    
//    console.log('Registry recognises', action);
    const selectedModule = await registryEntry();
    
    try {
        await selectedModule.render(null, appState.query); // Execute with null panel
        console.log('Background module executed successfully');
        return true;
    } catch (error) {
        console.error('Failed to execute background module:', error);
        return false;
    }
}


export async function renderPanel(query) {// need change name from renderPanel to renderSomewhere ?
  console.log('RenderPanel(', query, ')');
const stubName = appState.query.petitioner.Action; //legacy html to be phased-out FAILS - no effect of nav buttons

    const displayArea = getDisplayArea();
  //console.log('petitioner .Module:', appState.query.petitioner.Module, '.Action:', appState.query.petitioner.Action, '.Destination:', appState.query.petitioner.Destination);
  // Check if panel is already open
  const alreadyOpen = panelsOnDisplay.some(p => p.stubName === stubName);
  //console.log(panelsOnDisplay);//why does panelsOnDisplay have a 'stubName' ?
  if (alreadyOpen) {
    // If it's already open, just focus it (don't open again)
    return;
  }


let registryEntry = await registry[stubName]; //send string to lookup object, get a pointer to a function (don't need await)

if(!registryEntry) { console.log('Registry unknown', stubName, ' not here');}
if(registryEntry) { console.log('Registry recognises', stubName, 'push details in array')
  
 // console.log('registryEntry is:', registryEntry);

const selectedModule = await registryEntry(); // Use the pointer to get the function
//console.log('Loaded module functions:', selectedModule);

//if(true) 
  renderNewPanel(stubName,query, registryEntry,selectedModule,displayArea); //was a test but never changed the if??
    }

}



// === CLOSE PANEL ===
function closePanel(stubName) {
  console.log('ClosePanel(', stubName, ')  BUT should let module know so can removed listeners etc');

  const entry = panelsOnDisplay.find(p => p.stubName === stubName);
  if (entry && entry.panel) {
    entry.panel.remove();
    panelsOnDisplay.splice(panelsOnDisplay.indexOf(entry), 1);
    updatePanelLayout();
  }
}



// === UPDATE PANEL LAYOUT ===
function updatePanelLayout() {
  console.log('UpdatePanelLayout(), Panels on display:', panelsOnDisplay.length);
  
  if (panelsOnDisplay.length === 0) {
    return;
  } else if (panelsOnDisplay.length === 1) {
    // Single panel - full width
    panelsOnDisplay[0].panel.style.flex = '1 1 100%';
  } else {
    // Multiple panels - equal width
    const width = `${100 / panelsOnDisplay.length}%`;
    panelsOnDisplay.forEach(entry => {
      entry.panel.style.flex = `1 1 calc(${width} - 1rem)`;
    });
  }
}


// === OPEN/CLOSE PANELS BY RULE ===
export async function openClosePanelsByRule(stubName, fromButtonClick = false) {
 // console.log('openClosePanelsByRule(', stubName, 'fromButtonClick:', fromButtonClick,')');
  
  if(fromButtonClick){document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));}
  
      // Check if this is a 2nd click for an already open page
      const isPageOpen = panelsOnDisplay.some(p => p.stubName === stubName);
 //     console.log('isPageOpen:', isPageOpen);
  
      // Special case: dashboards
      const isDashboard =stubName === 'adminDash.html' || stubName === 'myDash.html'|| stubName === 'adminDash' || stubName === 'myDash';
 //     console.log('isDashboard:', isDashboard);    
  
      // 2nd Click on open dashboard
      if (isDashboard && isPageOpen) {
        // Clicking on already open admin or member - close all other panels
        closeAllOtherPanels(stubName);  // next lines are using 'query' instead of the pass param 'stubName'  !!! <<<<<<
        await loadPageWithData(stubName.replace('.html','')); //this refreshes data on already open panel
      //  if(fromButtonClick) {btn.classList.add('active');}
      } else 
      
      // 1st Click to open a dashboard
      if (isDashboard && !isPageOpen) {
        // Switching between admin and member - replace current with new one
        closeAllPanels();
        await renderPanel({...appState.query.petitioner, 'Action': stubName});//puts the name of the desired module in petitioner   
        await loadPageWithData(appState.query.petitioner.Action.replace('.html','')); 
      //  if(fromButtonClick) {btn.classList.add('active');}
      } 
      
      // Clicked on other menu buttons 
      else if (!isDashboard) {
  
        // 2nd Click on an open page
        if (isPageOpen) {
          // If already open, close it
        //  console.log('Panel already open, closing it:', stubName);
          closePanel(stubName);
        } else 
  
        { // console.log('Panel NOT open:', stubName);  // 1st Click for an ordinary page
          // Open new panel - this is to display a new side page that is not admin or member & not already open
//changed 22:11 Oct 13

const destination = appState.query.petitioner.Destination;
//console.log('destination:',destination);
if(destination==='background') await backgroundProcess(); else
{
          await renderPanel({...appState.query.petitioner, 'Action': stubName});
          await loadPageWithData(appState.query.petitioner.Action.replace('.html','')); 
}
//end of change

          // where do we check and connect input forms to the database? Here or in loadPageWithData? 17:10 Sept 2 2025
        }
  
        // Always keep admin or member active when opening other panels
          const activePanel = panelsOnDisplay.find(p => 
          p.stubName === 'adminDash.html' || p.stubName === 'myDash.html');
        
        if (activePanel) {
          const activeBtn = document.querySelector(`[data-page="${activePanel.stubName === 'adminDash.html' ? 'adminDash' : 'myDash'}"]`);
          if (activeBtn) activeBtn.classList.add('active');
        }
      }
    }

// === CLOSE ALL PANELS ===
function closeAllPanels() {
    console.log('Closing all panels');
  while (panelsOnDisplay.length > 0) {
    const panel = panelsOnDisplay[0];
    closePanel(panel.stubName);
  }
}

// === CLOSE ALL OTHER PANELS ===
function closeAllOtherPanels(keepStubName) {
    console.log('Closing all panels except:', keepStubName);    
  const panelsToClose = panelsOnDisplay.filter(p => p.stubName !== keepStubName);
  panelsToClose.forEach(panel => {
    closePanel(panel.stubName);
  });
}