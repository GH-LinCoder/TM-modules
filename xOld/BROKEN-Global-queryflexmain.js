// flexmain.js

import { loadAdminDashWithData } from './dash/loadAdminDashWithData.js';
import { adminListeners } from './ui/adminListeners.js';
import { appState } from './state/appState.js'; // Import appState (no updateAppState needed)
console.log('🔥 FLEXMAIN: Module is executing');
//dev
window.appState = appState;

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

// === EVENT LISTENER FOR STATE CHANGES ===
window.addEventListener('state-change', async (e) => {
  const { type, payload } = e.detail;
  console.log('State change event:', type, payload);

  switch (type) {
    case 'QUERY_UPDATE':
      if (payload.stubName) {
        await openClosePanelsByRule(payload.stubName);
      }
      break;

    case 'DATA_LOADED':
      updateUI(payload.data);
      break;

    default:
      console.log('Unhandled state change:', type);
  }
});

// === APP INITIALIZATION ===
document.addEventListener('DOMContentLoaded', onAppLoad);


// === PAGE LOADING ===
async function loadPageWithData(pageName) {
  console.log('Loading page with data:', pageName);
  switch (pageName) {
    case 'adminDash':
      await loadAdminDashWithData();
      break;
    case 'memberDash':
      console.warn('loadMemberDashWithData() not implemented yet');
      break;
    default:
      console.warn(`No data loader defined for ${pageName}`);
  }
}

async function onAppLoad() {
    console.log('App loaded, initializing...');
    const displayArea = getDisplayArea();
    if (!displayArea) {
      console.error('Display area not found');
      return;
    }
  
    setupNavigationListeners();
    const frame = getFrameAroundThePages();
    adminListeners(frame);
  
    // Initialize user ID
    appState.query.userId = '06e0a6e6-c5b3-4b11-a9ec-3e1c1268f3df';
  
    // Now trigger initial state
    appState.setQuery({
      stubName: 'adminDash.html',
      READ_request: true
    });
  
    console.log('Initialization complete.');
  }
  

// === PANEL RENDERING ===
export async function renderPanel(queryData) {
  const stubName = queryData.stubName;
  const displayArea = getDisplayArea();

  // Prevent duplicates
  const alreadyOpen = panelsOnDisplay.some(p => p.stubName === stubName);
  if (alreadyOpen) return;

  const panel = document.createElement('div');
  panel.className = 'page-panel';
  panel.dataset.pageName = stubName;

  try {
    const html = await getStubContent(stubName);
    panel.innerHTML = html;
    displayArea.appendChild(panel);

    panelsOnDisplay.push({ stubName, panel, query: { ...queryData } });
    simulatePageSetup(stubName, panel);
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
  const entry = panelsOnDisplay.find(p => p.stubName === stubName);
  if (entry) {
    entry.panel.remove();
    panelsOnDisplay.splice(panelsOnDisplay.indexOf(entry), 1);
    updatePanelLayout();
  }
}

// === LAYOUT MANAGEMENT ===
function updatePanelLayout() {
  if (panelsOnDisplay.length === 0) return;

  if (panelsOnDisplay.length === 1) {
    panelsOnDisplay[0].panel.style.flex = '1 1 100%';
  } else {
    const width = `${100 / panelsOnDisplay.length}%`;
    panelsOnDisplay.forEach(entry => {
      entry.panel.style.flex = `1 1 calc(${width} - 1rem)`;
    });
  }
}

// === FETCH CONTENT ===
async function getStubContent(stubName) {
  const pageUrl = `htmlStubs/${stubName}`;
  console.log('Fetching:', pageUrl);
  const response = await fetch(pageUrl);
  if (!response.ok) {
    throw new Error(`Failed to load ${stubName}: ${response.status} ${response.statusText}`);
  }
  return await response.text();
}

function simulatePageSetup(stubName, panel) {
  console.log(`Setting up ${stubName} panel`);
}

// === PANEL RULE LOGIC ===
export async function openClosePanelsByRule(stubName, fromButtonClick = false) {
    console.log('openClosePanelsByRule triggered for:', stubName);
  if (fromButtonClick) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  }

  const isAlreadyOpen = panelsOnDisplay.some(p => p.stubName === stubName);
  const isSpecialToggle = stubName === 'adminDash.html' || stubName === 'memberDash.html';
  const btn = document.querySelector(`[data-page="${stubName.replace('.html', '')}"]`);

  if (isSpecialToggle && isAlreadyOpen) {
    closeAllOtherPanels(stubName);
    if (btn) btn.classList.add('active');
  } else if (isSpecialToggle && !isAlreadyOpen) {
    closeAllPanels();
    appState.setQuery({ stubName }); // Will trigger state-change → renderPanel called via event
  } else if (!isSpecialToggle) {
    if (isAlreadyOpen) {
      closePanel(stubName);
    } else {
      appState.setQuery({ stubName });
    }

    // Re-activate admin/member button if other panels are open
    const activePanel = panelsOnDisplay.find(p =>
      p.stubName === 'adminDash.html' || p.stubName === 'memberDash.html'
    );
    if (activePanel) {
      const activeBtn = document.querySelector(
        `[data-page="${activePanel.stubName === 'adminDash.html' ? 'adminDash' : 'memberDash'}"]`
      );
      if (activeBtn) activeBtn.classList.add('active');
    }
  }
}

// === NAVIGATION HANDLING ===
function setupNavigationListeners() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.nav-btn');
    if (!btn) return;

    e.preventDefault();
    e.stopPropagation();

    const pageName = btn.dataset.page;
    const stubName = pageName + '.html';

    // Update state via appState.setQuery → triggers event → openClosePanelsByRule
    appState.setQuery({ stubName });
  });
}

// === CLOSE ALL PANELS ===
function closeAllPanels() {
  while (panelsOnDisplay.length > 0) {
    closePanel(panelsOnDisplay[0].stubName);
  }
}

// === CLOSE OTHER PANELS ===
function closeAllOtherPanels(keepStubName) {
  const panelsToClose = panelsOnDisplay.filter(p => p.stubName !== keepStubName);
  panelsToClose.forEach(p => closePanel(p.stubName));
}

// Optional: Debug helper
export function logCurrentState() {
  console.log('Current appState.query:', appState.query);
}


