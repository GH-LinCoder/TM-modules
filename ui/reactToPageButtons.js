//reactToPageButtons.js
import { loadAdminDashWithData } from '../dash/loadAdminDashWithData.js';
// === GLOBAL STATE ===
const dynamicPanels = [];
const DASHBOARD_PAGES = new Set(['adminDash', 'memberDash']);


console.log('ui/reactToPageButtons.js');
//import { loadPage } from './.js';

// === HANDLE NAVIGATION LOGIC ===
export async function handleNavigation(button, pageName) {
    console.log('handleNavigation()', { button, pageName });
  const navButtons = document.querySelectorAll('nav button');
  const mainContainer = document.getElementById('main-container');

  // Update active class
  navButtons.forEach(btn => btn.classList.remove('active-page'));
  button.classList.add('active-page');

  // Check if it's a dashboard switch
  if (DASHBOARD_PAGES.has(pageName)) {
    await switchDashboard(pageName);
    if(pageName==='adminDash'){
      await  loadAdminDashWithData();  //12:35 Aug 25 2025. Call direct, not through local function
    }
  } else {
    await togglePanel(pageName);
    resizePanels();
  }
}

async function switchDashboard(dashboardName) {
    console.log('switchDashboard()', dashboardName);
  const mainContainer = document.getElementById('main-container');
  if (!mainContainer) {
    console.error('Element #main-container not found in DOM');
    return;
  }

  // Update the source of truth
  dynamicPanels[0] = dashboardName;

  // Remove all panels except the first (we'll keep/use the first)
  while (mainContainer.children.length > 1) {
    mainContainer.removeChild(mainContainer.lastChild);
  }

//  let firstChild = mainContainer.firstChild;
    let firstChild = mainContainer.firstElementChild;
//console.log('firstChild:', firstChild);
//console.log('firstChild.nodeType:', firstChild.nodeType);
//console.log('firstChild.nodeName:', firstChild.nodeName);


  // If no child exists, create one
  if (!firstChild) {
    firstChild = document.createElement('div');
    firstChild.className = 'page-panel bg-amber-50 p-8';
    mainContainer.appendChild(firstChild);
  }

  // ✅ Now it's safe to set dataset
  firstChild.dataset.pageName = dashboardName;

  // Load the content
  await loadPage(dashboardName, firstChild);

  // Ensure only the dashboard is tracked
  dynamicPanels.length = 1;

  resizePanels();
}

// === PANEL TOGGLE LOGIC ===    oddly this is where you send a page to be loaded 
export async function togglePanel(pageName) {
  console.log('togglePanel()', pageName);

    const mainContainer = document.getElementById('main-container');

  // Check if panel is already open
  const panelIndex = dynamicPanels.findIndex(p => 
    typeof p === 'string' ? p === pageName : p.pageName === pageName
  );

  if (panelIndex !== -1) {
    // Close panel
    const panel = Array.from(mainContainer.children).find(el => el.dataset.pageName === pageName);
    if (panel) {
      mainContainer.removeChild(panel);
      dynamicPanels.splice(panelIndex, 1);
    }
  } else {
    // Open panel
    const newPanel = document.createElement('div');
    newPanel.className = 'page-panel bg-amber-50 p-8';
    newPanel.dataset.pageName = pageName;
    mainContainer.appendChild(newPanel);

    // Store with metadata (future-proofing)
    dynamicPanels.push({
      pageName,
      source: 'nav-button',  // should we have more?  subject='members' || 'tasks' || 'relations' ??
      triggerElement: null // can be set if needed
    });

    await loadPage(pageName, newPanel);
  }

  resizePanels();
}

// === LAYOUT MANAGEMENT ===
function resizePanels() {
    console.log('resizePanels()');
  const mainContainer = document.getElementById('main-container');
  const totalPanels = 1 + dynamicPanels.length - 1; // 1 for dashboard + others
  const width = `${Math.floor(90 / totalPanels)}%`;

  Array.from(mainContainer.children).forEach(child => {
    child.style.width = width;
  });
}

// === PAGE LOADING ===




export async function loadPage(pageName, container=document.getElementById('notes-panel')
) {
  console.log('Load page:',pageName);
  console.log('dynamic[]:',dynamicPanels); //how are we updating dynamicPanels? 
  
  try {
    if (!container) {
      console.error('No container provided for page:', pageName);
      return;
    }

    // Don't reload if already current
    if (container.dataset.currentPage === pageName) {
      return;
    }

    const pageUrl = `htmlStubs/${pageName}.html`;
console.log('pageUrl:',pageUrl);

    const response = await fetch(pageUrl);
//    const response = await fetch(`htmlStubs/${pageName}.html`);
    if (!response.ok) {
      throw new Error(`Failed to load ${pageName}.html`);
    }

    const content = await response.text();
    container.innerHTML = content;
    container.dataset.currentPage = pageName;

    // Optional: Trigger page-specific setup
    if (typeof setupPage === 'function') {
      setupPage(pageName, container);
    }

  } catch (error) {
    console.error('Error loading page:', error);
    container.innerHTML = `
      <div class="text-red-700 p-4">
        <h3 class="text-lg font-bold">Error</h3>
        <p>Failed to load ${pageName} page.</p>
      </div>
    `;
  }
}