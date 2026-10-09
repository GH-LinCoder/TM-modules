//flexmain.js  version 23:00 Dec 13 - commented out parts signalled as unused

/** === Kernal ===
 * panelsOnDisplay = [] (keep track of what is displayed - changed to using global inside appState 21:40 Oct 5 2026)
 * select environmental variables & signal when loaded
 * check that appState is available
 * setup myDash as default landing page - set in petition -> dispatches an event
 * setup WINDOW EVENT for PETITION -> responds to that event calls openClosePanel...
 * setup document.load listener  (Why?)
 * setup petition build listener (for later clicks on menu or cards)
 
 * === FLOW: Panel Management ===
 * 1. User clicks a menu or card
 * 2. buildPetitionListener extracts intent {Module/Section/Action/Destination etc}
 * 3. appState.query.petitioner = { Module Section Action Destination, etc}
 * 4. 
 * 5. state-change event calls → openClosePanelsByRule()
 * 6. → if already open: close the module
 *    → else: render the module
 * 7. processPanel() checks registry → loads module 
 * 8. Module takes over (self-contained)
 * 
 * === PRINCIPLES ===
 * - Single source of truth: appState
 * - No direct DOM manipulation by flexmain
 * - Panels are tracked in panelsOnDisplay
 * - Toggle logic is centralized
 * - 
 * - All databse interactions via a signle function executeIfpermitted(), but permissions is_permitted rpc
 */


console.log('flexmain.js  loaded');

// === LISTENERS 
import { buildPetitionListener } from './listeners/buildPetitionListener.js';
import { windowEventPetitionListener } from './listeners/windowEventPetitionListener.js';

// === GLOBALS
import { appState } from './state/appState.js'; // modules interact through appState
import { registry } from './registry/registryLoadModule.js'; // stores page (module) loading functions

// === Data from database
import { loadAdminDashWithData } from './dash/loadAdminDashWithData.js';
import { loadMyDashWithData } from './dash/loadMyDashWithData.js';

// === GLOBAL STATE ===
const panelsOnDisplay = appState.panelsOnDisplay;


// === READ ENVIRONMENTAL VARIABLES

//on local host the env vars are read from .env.local which can be edited. 
// The hosted site at Netlify reads the values set in the control panel for each instance
//But the favcion for isnatcnces (if they use a direct link to the HQ Github repo) are stored in that repo public/

document.addEventListener('DOMContentLoaded', () => {
//this reads the env vars at Netlify (or in env.local on localhost to choose what name to display)
const envName = import.meta.env.VITE_ENVIRONMENT_NAME; // e.g., the customer instance or the HQ
const labelElement = document.getElementById('env-label');

if (labelElement && envName) {
    labelElement.textContent = envName;
}
//this reads env vars to see which favicon to display in the browser tab
const faviconUrl = import.meta.env.VITE_FAVICON_URL;
const faviconTag = document.getElementById('app-favicon');

if (faviconTag && faviconUrl) {
    faviconTag.href = faviconUrl;
}

//This reads env vars to display the favicon in the row that has the menu buttons
const logoImg = document.getElementById('main-logo');
//console.log("Logo Element:", logoImg);
//console.log("Favicon URL from Env:", faviconUrl);

if (logoImg && faviconUrl) logoImg.src = faviconUrl;
});


console.log('Set myDash into petitioner, call windowEventPetitionListener(). Add listener to document load');
try {
  if (appState) {
          //  console.log('appState has been successfully loaded:', appState);

// === SET myDash AS DASHBOARD TO DISPLAY (the landing page) ===
   const petition = {'Module':'myDash','Section': '','Action': 'myDash', 'Destination':'new-panel'}; 
   appState.setPetitioner(petition);
  } else {
    console.error('appState is undefined or not properly exported.');
  }
} catch (error) {
  console.error('Error while accessing appState:', error);
}

// === WINDOW EVENT for PETITION ===
windowEventPetitionListener(); //Setup a listener for change of State related to petitions calls openClosePanel...

// === APP INITIALIZATION ===
document.addEventListener('DOMContentLoaded', onAppLoad);


// === OPEN/CLOSE PANELS BY RULE === called by windowEventPetitionListener
export async function openClosePanelsByRule(panelName, fromButtonClick = false) {//but only called from eventListener  openClosePanelsByRule(payload.petitioner.Action)
console.log('openClosePanelsByRule(panelName)',panelName, 'fromButtonClick', fromButtonClick);
  
  if(fromButtonClick){document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));}
  
      // Check if this is a 2nd click for an already open page
      const isPageOpen = panelsOnDisplay.some(p => p.panelName === panelName);
      console.log('isPageOpen:', isPageOpen);
  
      //DASHBOARDS
      // Special case: dashboards Dashboards replace the existing dashboard. They also close other open sections or panels.
      //If a new dashboard is to be added -put the name here
      const isDashboard =panelName === 'adminDash.html' || panelName === 'myDash.html'|| panelName === 'adminDash' || panelName === 'myDash' || panelName === 'runDash';
 //     console.log('isDashboard:', isDashboard);    
  
      // 2nd Click on open dashboard
      if (isDashboard && isPageOpen) {
        // Clicking on already open admin or member - close all other panels
        closeAllOtherPanels(panelName);  // next lines are using 'query' instead of the pass param 'panelName'  !!! <<<<<<
        await loadPageWithData(panelName.replace('.html','')); //this refreshes data on already open panel
      //  if(fromButtonClick) {btn.classList.add('active');}
      } else 
      
      // 1st Click to open a dashboard
      if (isDashboard && !isPageOpen) {
        // Switching between admin and member - replace current with new one
        closeAllPanels();
        await processPanel({...appState.query.petitioner, 'Action': panelName});//puts the name of the desired module in petitioner   
        await loadPageWithData(appState.query.petitioner.Action.replace('.html','')); 
      //  if(fromButtonClick) {btn.classList.add('active');}
      } 
      
      // Clicked on other menu buttons 
      else if (!isDashboard) {
  
        // 2nd Click on an open page
        if (isPageOpen) {
          // If already open, close it
        //  console.log('Panel already open, closing it:', panelName);
          closePanel(panelName);
        } else 
  
        { // console.log('Panel NOT open:', panelName);  // 1st Click for an ordinary page
          // Open new panel - this is to display a new side page that is not admin or member & not already open

const destination = appState.query.petitioner.Destination;
//console.log('destination:',destination);
if(destination==='background') await backgroundProcess(); else
{
          await processPanel({...appState.query.petitioner, 'Action': panelName});
          await loadPageWithData(appState.query.petitioner.Action.replace('.html','')); 
}
        }
  
        // Always keep admin or member active when opening other panels
          const activePanel = panelsOnDisplay.find(p => 
          p.panelName === 'adminDash.html' || p.panelName === 'myDash.html');
        
        if (activePanel) {
          const activeBtn = document.querySelector(`[data-page="${activePanel.panelName === 'adminDash.html' ? 'adminDash' : 'myDash'}"]`);
          if (activeBtn) activeBtn.classList.add('active');
        }
      }
      updateMenuHighlights();
    }


async function processPanel(query) {// need change name from processPanel to renderSomewhere ?
  console.log('processPanel()');
const panelName = appState.query.petitioner.Action; 
console.log('flexmain-processPanel() panelName:',panelName);
    const displayArea = getDisplayArea();
  //console.log('petitioner .Module:', appState.query.petitioner.Module, '.Action:', appState.query.petitioner.Action, '.Destination:', appState.query.petitioner.Destination);
  //on first call the above are all null
  // Check if panel is already open
  const alreadyOpen = panelsOnDisplay.some(p => p.panelName === panelName);
  //console.log(panelsOnDisplay);//why does panelsOnDisplay have a 'panelName' ?
  if (alreadyOpen) {
    // If it's already open, just focus it (don't open again)
    return;
  }

let registryEntry = await registry[panelName]; //send string to lookup object, get a pointer to a function (don't need await)

if(!registryEntry) { console.log('Registry unknown [', panelName, '] not here');}
if(registryEntry) { console.log('Registry recognises', panelName, 'push details i panels on display array')  //which array??
  
 // console.log('registryEntry is:', registryEntry);

const selectedModule = await registryEntry(); // Use the pointer to get the function
//console.log('Loaded module functions:', selectedModule);

  await renderNewPanel(panelName,query, registryEntry,selectedModule,displayArea); 
   
// ✅ FORCE layout recalculation after panel is added. Without this delay the render to the side is erratic. Sometimes 50% width sometimes tiny width
setTimeout(() => {
  updatePanelLayout();
     }, 10);
 }
}



// === UTILITY: Get main display area ===
function getDisplayArea() {
  console.log('GetDisplayArea()');
  const destination = appState.query.petitioner.Destination;

  if (destination === 'new-panel') {
    const primaryPanel = document.querySelector('#primary-panel');
    
    // Check if the dashboard is already loaded by seeing if the panel has children
    const isDashboardAlreadyLoaded = primaryPanel && primaryPanel.children.length > 0;

    // 1. INITIAL LOAD: If the panel is empty, this is the first render (the dashboard)
    if (!isDashboardAlreadyLoaded) {
      console.log('✅ INITIAL DASHBOARD: Injecting into #primary-panel');
      return primaryPanel;
    }

    // 2. SUBSEQUENT MENU CLICKS: The dashboard is already there. Check screen size.
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) { console.log('✅ MOBILE MENU: Injecting into #mobile-panel (Top)');
      const mobilePanel = document.querySelector('[data-panel="mobile-inject-here"]');
      mobilePanel.classList.remove('hidden', 'md:hidden'); // Ensure it's visible
      
      return mobilePanel;
    } else {
      console.log('✅ DESKTOP MENU: Injecting into #primary-panel (Side-by-side)');
      return primaryPanel; // Or document.querySelector('[data-panel="inject-here"]')
    }

  } else {
    // Handle specific section destinations (e.g., expanding a section in place)
    const displayArea = document.querySelector(`[data-section="${destination}"]`);
    return displayArea;
  }
}


/*
function getFrameAroundThePages() {
  console.log('getFrameAroundThePage');
    return document.getElementById('main-container');//main-container excludes the menu buttons
} */





async function onAppLoad() {
    console.log('onAppLoad(), initializing...');
  // Ensure display area is available
  //const displayArea = getDisplayArea();

  
  let query=appState.query; //now global    //<------------------------- important
  
  
  // Load a page initially (full width)
  if (panelsOnDisplay.length === 0) {
    await processPanel(query.petitioner); 
    const name=query.petitioner.Action;//changed 16:46 7 Sept 2025
  //console.log('Calling loadPageWithData(',name,')');
  await loadPageWithData(name.replace('.html','')); //changed 14:49 7 Sept 2025
  }

//menuListeners();//add listener to menu buttons, and respond to their being clicked
//replced this to use the buildPetitionListener instead Oct 4 2026
//  setupNavigationListeners();//local function
 // const frameAroundThePages = getFrameAroundThePages();
 //the above code excluded the menu buttons. They were handled by menuListeners.
 //changed to only have 1 listener function to handle cards and menu 'buttons' Oct 4 2026
buildPetitionListener(document);
//  buildPetitionListener(frameAroundThePages); //imported function  this may be wrong element. need the frame around the pages
  console.log('-----------Initialization COMPLETED: now load data ------------.');
}

// === LOAD PAGE WITH DATA === (only works for myDash and adminDash ast at 4 Oct 2026)
async function loadPageWithData(pageName) { // pageName without .html
 console.log('LoadPageWithData(', pageName,')');
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
          console.warn(`flexmain has no data loader for ${pageName}`);
  }
}


// === PANEL RENDERING ===
async function renderNewPanel(panelName, query, registryEntry, selectedModule, displayArea) {
  console.log('renderNewPanel()');
  
  if (registryEntry) { 
    const panel = document.createElement('div');
    panel.className = 'page-panel w-full min-w-0 flex-1';
    panel.dataset.pageName = panelName; 

    displayArea.appendChild(panel);

 // flexmain creates the controller
  const controller = new AbortController();

  panelsOnDisplay.push({ 
    panelName, 
    panel, 
    query,
    controller: controller  // ✅ Store it in the array
  });
    try {
      selectedModule.render(panel, query, controller); 
    } catch (error) {
      console.error('Failed to load module:', error);
    }
  }
}


async function backgroundProcess() { //What is this?  Oct 4 2026?
    
    const action = appState.query.petitioner.Action;
 console.log('background process');
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





// Note: NO 'async' keyword needed anymore!
function closePanel(panelName) {
  console.log('ClosePanel(', panelName, ')');

  const entry = panelsOnDisplay.find(p => p.panelName === panelName);
  
  if (entry && entry.panel) {
    
    // use abort if it exists
 if (entry.controller) {
      entry.controller.abort();
    }

    // ✅ ALWAYS remove from DOM
    entry.panel.remove();
    
    // ✅ ALWAYS remove from array
    const index = panelsOnDisplay.indexOf(entry);
    if (index > -1) {
      panelsOnDisplay.splice(index, 1);
    }
    
    updatePanelLayout();
    console.log(`✅ Panel ${panelName} closed. Remaining:`, panelsOnDisplay.length);
  } else {
    console.warn(`⚠️ closePanel called but no entry found for:`, panelName);
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


function updateMenuHighlights() {
  console.log('🎨 updateMenuHighlights() running...');
 // console.log('📦 Current panelsOnDisplay:', panelsOnDisplay.map(p => p.panelName));

  // 1. Strip highlights from ALL menu buttons (both desktop and mobile)
  const allBtns = document.querySelectorAll('.nav-btn');
 // console.log('🔍 Found .nav-btn elements:', allBtns.length);
  
  allBtns.forEach(btn => {
    btn.classList.remove('ring-4', 'ring-blue-500', 'bg-blue-100', 'active');
  });

  // 2. Apply highlights to ALL buttons for currently open panels Legacy?
  panelsOnDisplay.forEach(panel => {
    const pageName = panel.panelName.replace('.html', '');
    
    // ✅ Use querySelectorAll to find ALL matching buttons (desktop + mobile)
    const buttons = document.querySelectorAll(`.nav-btn[data-page="${pageName}"]`);
    
   // console.log(`🎯 Looking for buttons with data-page="${pageName}"`, `Found: ${buttons.length}`);
    
    buttons.forEach(btn => {
    //  console.log(`✅ Adding highlight to button:`, btn);
      btn.classList.add('ring-4', 'ring-blue-500', 'bg-blue-100', 'active');
    });
  });
}


// === CLOSE ALL PANELS ===
function closeAllPanels() {
    console.log('Closing all panels');
  while (panelsOnDisplay.length > 0) {
    const panel = panelsOnDisplay[0];
    closePanel(panel.panelName);
  }
}

// === CLOSE ALL OTHER PANELS ===
function closeAllOtherPanels(keeppanelName) {
    console.log('Closing all panels except:', keeppanelName);    
  const panelsToClose = panelsOnDisplay.filter(p => p.panelName !== keeppanelName);
  panelsToClose.forEach(panel => {
    closePanel(panel.panelName);
  });
}


/*  the 'petitioner' represents what part of the app has requested some action. The source may be a nav button or card or software.
 @ 'Module' is the webpage or the js file.
 @  'Section' is if the page or file is split into parts. 
 @   'Action' comes from the element clicked & is descriptive of the desired result, not of the source
 @  
 @   'adminDash'  // dashboards have preferential treatment. Displaying on left
 @   'myDash' // & able to close all other open pages by clicking the menu button a 2nd time 
 @   'runDash' //
 @   '404.html', //is a default error page that explains to click menu.
 @   'howTo' //is for context specific instructions
 @   'login/out' //brings up the relevant login/out/signup/password forms

      // If no file is specified the app crashes with unresponsive menu buttons, 
      // but if wrong name used app runs, flags 'Error loading file.html' & menu works so can then load any dashboard

      // start with myDash.html.. 
      // the page/module to display is stored in the appState.query.petitioner object
*/