//flexmain.js


import { loadAdminDashWithData } from './dash/loadAdminDashWithData.js';
import { adminListeners } from './ui/adminListeners.js';
import { appState } from './state/appState.js';
import  * as createTask  from './work/task/createTask.js';
import { registry } from './registry/registry.js';

// === UTILITY: Get main display area ===
function getDisplayArea() {
console.log('GetDisplayArea()');
    return document.querySelector('[data-panel="inject-here"]');
}

function getFrameAroundThePages() {
    return document.getElementById('main-container');
}

// === GLOBAL STATE ===
const panelsOnDisplay = [];

// === QUERY OBJECT ===

//export   //if delete this crashed because imported by adminListeners at first load of flexmain without any log
const Xquery = {  //local
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
};


//the above, I think is a local object, but we are supposed to use the appState.query object

try {
  if (appState) {
    console.log('appState has been successfully loaded:', appState);
    // You can now safely use appState here


//                          === DEV MODE: Load adminDash.html stub ===   <------ !!!!!!!

    appState.setQuery({ //global
      stubName: 'adminDash.html',  //For dev concentrating on the adminDash
      INSERT_request: true,    //probably not relevant
      userId: '06e0a6e6-c5b3-4b11-a9ec-3e1c1268f3df' // MOCK but in db
    });



 console.log('appState.query in flexmain after setQuery:', appState.query); //global
 console.log('local query in flexmain after appState.setQuery:', query); //local
  } else {
    console.error('appState is undefined or not properly exported.');
  }
} catch (error) {
  console.error('Error while accessing appState:', error);
}




// === STATE CHANGE HANDLER ===

window.addEventListener('state-change', async (e) => {
    const { type, payload } = e.detail;
    console.log('State change event at window.addEventListener:', type, payload);
    switch (type) {
      case 'QUERY_UPDATE':
        if ( payload.stubName) {
           //commented out this local query. Froze here because definition removed
           // query.stubName = payload.stubName; //sync local query with global appState.query.  Need to solve this sometime
//            console.log('before openClosePanelsByRule in state-change.payload:', payload, 'query.stubName:', query.stubName);
            //error that some functions are using the local query object and some are using the appState.query object. Here the local =admin.html, but global is createTaskForm.html
            await openClosePanelsByRule(payload.stubName); 
        }
        break;
        
      case 'DATA_LOADED':
        updateUI(payload.data); //what is this?
        break;
    }
  });











// === DEV MODE: Load adminDash.html stub ===  local
//query.stubName = 'adminDash.html';
//query.READ_request = true;
//query.userId = '06e0a6e6-c5b3-4b11-a9ec-3e1c1268f3df'; // MOCK but in db




// === APP INITIALIZATION ===
document.addEventListener('DOMContentLoaded', onAppLoad);



//  === CONNECT FORMS TO DATABASE ===
async function connectFormsToDatabase(stubName) {
  console.log(`connectFormsToDatabase ${stubName} `);
  // possibly redundant function now that we have loading of js modules
  // Placeholder for actual form-to-database connection logic
  // This would involve querying the panel for forms and setting up event listeners
  //or every form has a class and we need to just recognise it is a form and have a standard loading function
  stubName = stubName + '.js';
  console.log(`connectFormsToDatabase ${stubName} `);
  
  const module = await import(stubName); // Dynamic import
  if (module && typeof module.setupForm === 'function') {
    module.setupForm(); // Call the setup function from the module
  }

}



// === LOAD PAGE WITH DATA ===
async function loadPageWithData(pageName) { // pageName without .html
    console.log('LoadPageWithData(', pageName,')');
    switch(pageName) {
        case 'adminDash':
            await loadAdminDashWithData();
            break;
        // Add cases for other pages as needed
        case 'memberDash':
            // await loadMemberDashWithData(); // Implement this function similarly
            console.warn('loadMemberDashWithData() not implemented yet');
            break;
        case 'createTaskForm':

            await connectFormsToDatabase(pageName); //need to load script not data
            //console.warn('loadCreateTaskFormWithData() not implemented yet');
            break;    
        default:
            console.warn(`No data loader defined for ${pageName}`);
    }
}


async function onAppLoad() {
    console.log('App loaded, initializing...');
  // Ensure display area is available
  const displayArea = getDisplayArea();
  let query=appState.query; //now global
  // Load admin page initially (full width)
  if (panelsOnDisplay.length === 0) {
    await renderPanel(query);
  console.log('Calling loadadminDashWithData()');
  await loadPageWithData(query.stubName.replace('.html','')); 
//    await loadAdminDashWithData();
    // Set active button
    const adminBtn = document.querySelector('[data-page="adminDash"]');
    if (adminBtn) adminBtn.classList.add('active');
  }
  setupNavigationListeners();//local function
  const frameAroundThePages = getFrameAroundThePages();
  adminListeners(frameAroundThePages); //imported function  this may be wrong element. need the frame around the pages
  console.log('Initialization complete.');
}


// === PANEL RENDERING ===
export async function renderPanel(query) {
  console.log('RenderPanel(', query, ')');
    const stubName = query.stubName;
  const displayArea = getDisplayArea();
  
  // Check if panel is already open
  const alreadyOpen = panelsOnDisplay.some(p => p.stubName === stubName);
  if (alreadyOpen) {
    // If it's already open, just focus it (don't open again)
    return;
  }

  const panel = document.createElement('div');
  panel.className = 'page-panel';
  panel.dataset.pageName = stubName;
//////////////////////////////////////////// is this where load module takes place?? 


console.log('about to check registry(',stubName,')',stubName.length);
/*
let registryEntry = await registry[stubName.replace('.html','')];
console.log('registryEntry is ex html:', registryEntry);
*/
let registryEntry = await registry[stubName];
console.log('registryEntry with html:', registryEntry);

//if (stubName === 'createTaskForm.html') { console.log('here');  //getting to here in console

if(registryEntry) { console.log('Registry recognises', stubName, 'append panel, push details in array');

displayArea.appendChild(panel);
panelsOnDisplay.push({ stubName, panel, query });

const selectedModule = await registryEntry(); // Get the module path from the registry
//console.log('Panel is in DOM?', document.body.contains(panel));
console.log('Loaded module:', selectedModule);
//selectedModule = './work/task/createTask.js'; // Adjust path as needed

try {

  selectedModule.render(panel); // 
} catch (error) {
  console.error('Failed to load module:', error);
  console.log('Available exports:', Object.keys(selectedModule));
}


}else  try {
    // Load html content from a file
console.log('Registry does not recognise', stubName, 'append panel, push details in array, then load html content instead');
    displayArea.appendChild(panel);
    panelsOnDisplay.push({ stubName, panel, query });
    const html = await getStubContent(stubName);
    panel.innerHTML = html;

    // Update layout based on number of panels
    updatePanelLayout();
  } catch (error) {
    console.error(`Error loading ${stubName}:`, error);
    panel.innerHTML = `<div class="text-red-700 p-4">Error loading ${stubName}</div>`;
    displayArea.appendChild(panel);
    updatePanelLayout();
  }
}



// === CLOSE PANEL ===
function closePanel(stubName) {
    console.log('ClosePanel(', stubName, ')');
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



// === FETCH STUB CONTENT ===
async function getStubContent(stubName) {

  const pageUrl = `htmlStubs/${stubName}`;
  console.log('getStubContent(', stubName, ') from:', pageUrl);

  const response = await fetch(pageUrl);
  if (!response.ok) {
    throw new Error(`Failed to load ${stubName}: ${response.status} ${response.statusText}`);
  }
  
  return await response.text();
}


// === OPEN/CLOSE PANELS BY RULE ===
export async function openClosePanelsByRule(stubName, fromButtonClick = false) {
console.log('openClosePanelsByRule(', stubName, 'fromButtonClick:', fromButtonClick,')');
if(fromButtonClick)
    {document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));}

    // Check if this is a click on an already active button
    const isAlreadyOpen = panelsOnDisplay.some(p => p.stubName === stubName);

    // Special case: admin and member are toggleable
    const isSpecialToggle =stubName === 'adminDash.html' || stubName === 'memberDash.html';
    

    if (isSpecialToggle && isAlreadyOpen) {
      // Clicking on already open admin or member - close all other panels
      closeAllOtherPanels(stubName);  // next lines are using 'query' instead of the pass param 'stubName'  !!! <<<<<<
      await loadPageWithData(stubName.replace('.html','')); //this refreshes data on already open panel
      btn.classList.add('active');
    } else if (isSpecialToggle && !isAlreadyOpen) {
      // Switching between admin and member - replace current with new one
      closeAllPanels();
      await renderPanel({...appState.query, stubName: stubName});
      await loadPageWithData(appState.query.stubName.replace('.html','')); 
      btn.classList.add('active');
    } else if (!isSpecialToggle) {
      // Regular page - open alongside existing panels
      if (isAlreadyOpen) {
        // If already open, close it
        closePanel(stubName);
      } else {
        // Open new panel - this is to display a new side page that is not admin or member & not already open
        await renderPanel({...appState.query, stubName: stubName});
        await loadPageWithData(appState.query.stubName.replace('.html',''));
       // where do we check and connect input forms to the database? Here or in loadPageWithData? 17:10 Sept 2 2025
      }
      // Always keep admin or member active when opening other panels
      const activePanel = panelsOnDisplay.find(p => 
        p.stubName === 'adminDash.html' || p.stubName === 'memberDash.html');
      
      if (activePanel) {
        const activeBtn = document.querySelector(`[data-page="${activePanel.stubName === 'adminDash.html' ? 'adminDash' : 'memberDash'}"]`);
        if (activeBtn) activeBtn.classList.add('active');
      }
    }

// could move loadPageWithData outside the if/else as they all call it 17:05 Sept 2 2025
}



// === NAVIGATION HANDLING ===
function setupNavigationListeners() {
    console.log('Setting up navigation listeners');

    document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.nav-btn');
    if (!btn) return;

    e.preventDefault();
    e.stopPropagation();

    const pageName = btn.dataset.page;
    appState.query.stubName = pageName + '.html';
    const stubName = pageName + '.html';


// Call the extracted function. true indicates it's from button click
await openClosePanelsByRule(stubName, true); 

//this is where we handle the logic for opening/closing panels based on button clicks
//I want to extract this logic into its own function so I can call it from other places if needed 
//but when I tried this it ceased to work. need to understand why.

    // Remove active class from all buttons
//    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));


  });
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

/*
// === ADMIN LISTENERS ===
 function adminListeners() {
    console.log('within main: Setting up admin listeners');
  // Setup sign out button
  const signOutBtn = document.querySelector('[data-action="sign-out"]');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (confirm('Are you sure you want to sign out?')) {
        console.log('User signed out');
      }
    });
  }
 } */
