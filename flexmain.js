//flexmain.js

import { loadAdminDashWithData } from './dash/loadAdminDashWithData.js';
import { adminListeners } from './ui/adminListeners.js';
import { appState } from './state/appState.js';

// === UTILITY: Get main display area ===
function getDisplayArea() {
console.log('Getting display area');
    return document.querySelector('[data-panel="inject-here"]');
}

function getFrameAroundThePages() {
    return document.getElementById('main-container');
}

// === GLOBAL STATE ===
const panelsOnDisplay = [];

// === QUERY OBJECT ===
export const query = {
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

//but the below does not work. The app freezes 

//setQuery(stubName = 'adminDash.html', INSERT_request = true, userId='06e0a6e6-c5b3-4b11-a9ec-3e1c1268f3df');


//console.log('query2 in flexmain:', query2);

window.addEventListener('state-change', async (e) => {
    const { type, payload } = e.detail;
    console.log('State change event:', type, payload);
    switch (type) {
      case 'QUERY_UPDATE':
        if ( payload.stubName) {
            await openClosePanelsByRule(payload.stubName);
//          await renderPanel(payload);
        }
        break;
        
      case 'DATA_LOADED':
        updateUI(payload.data); //what is this?
        break;
    }
  });




// === DEV MODE: Load adminDash.html stub ===
query.stubName = 'adminDash.html';
query.READ_request = true;
query.userId = '06e0a6e6-c5b3-4b11-a9ec-3e1c1268f3df'; // MOCK but in db




// === APP INITIALIZATION ===
document.addEventListener('DOMContentLoaded', onAppLoad);


async function loadPageWithData(pageName) { // pageName without .html
    console.log('Loading page with data:', pageName);
    switch(pageName) {
        case 'adminDash':
            await loadAdminDashWithData();
            break;
        // Add cases for other pages as needed
        case 'memberDash':
            // await loadMemberDashWithData(); // Implement this function similarly
            console.warn('loadMemberDashWithData() not implemented yet');
            break;
        default:
            console.warn(`No data loader defined for ${pageName}`);
    }
}


async function onAppLoad() {
    console.log('App loaded, initializing...');
  // Ensure display area is available
  const displayArea = getDisplayArea();
  
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
  console.log('Rendering panel for:', query.stubName);
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

  try {
    // Load content from actual file
    const html = await getStubContent(stubName);
    panel.innerHTML = html;
    displayArea.appendChild(panel);

    panelsOnDisplay.push({ stubName, panel, query });

    // Simulate any page-specific setup
    simulatePageSetup(stubName, panel);

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
    console.log('Closing panel for:', stubName);
  const entry = panelsOnDisplay.find(p => p.stubName === stubName);
  if (entry && entry.panel) {
    entry.panel.remove();
    panelsOnDisplay.splice(panelsOnDisplay.indexOf(entry), 1);
    updatePanelLayout();
  }
}



// === UPDATE PANEL LAYOUT ===
function updatePanelLayout() {
    console.log('Updating panel layout. Panels on display:', panelsOnDisplay.length);
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
    console.log('Fetching stub content for:', stubName);
  const pageUrl = `htmlStubs/${stubName}`;
  console.log('Fetching:', pageUrl);

  const response = await fetch(pageUrl);
  if (!response.ok) {
    throw new Error(`Failed to load ${stubName}: ${response.status} ${response.statusText}`);
  }
  
  return await response.text();
}



// Simulate page-specific setup functions
function simulatePageSetup(stubName, panel) {
  console.log(`Setting up ${stubName} panel`);
}


export async function openClosePanelsByRule(stubName, fromButtonClick = false) {

if(fromButtonClick)
    {document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));}

    // Check if this is a click on an already active button
    const isAlreadyOpen = panelsOnDisplay.some(p => p.stubName === stubName);

    // Special case: admin and member are toggleable
    const isSpecialToggle =stubName === 'adminDash.html' || stubName === 'memberDash.html';

    if (isSpecialToggle && isAlreadyOpen) {
      // Clicking on already open admin or member - close all other panels
      closeAllOtherPanels(stubName);
      btn.classList.add('active');
    } else if (isSpecialToggle && !isAlreadyOpen) {
      // Switching between admin and member - replace current with new one
      closeAllPanels();
      await renderPanel({...query, stubName: stubName});
      await loadPageWithData(query.stubName.replace('.html','')); 
      btn.classList.add('active');
    } else if (!isSpecialToggle) {
      // Regular page - open alongside existing panels
      if (isAlreadyOpen) {
        // If already open, close it
        closePanel(stubName);
      } else {
        // Open new panel
        await renderPanel({...query, stubName: stubName});
        await loadPageWithData(query.stubName.replace('.html',''));
      }
      // Always keep admin or member active when opening other panels
      const activePanel = panelsOnDisplay.find(p => 
        p.stubName === 'adminDash.html' || p.stubName === 'memberDash.html');
      
      if (activePanel) {
        const activeBtn = document.querySelector(`[data-page="${activePanel.stubName === 'adminDash.html' ? 'adminDash' : 'memberDash'}"]`);
        if (activeBtn) activeBtn.classList.add('active');
      }
    }


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
    query.stubName = pageName + '.html';
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