// === GLOBAL STATE ===
const dynamicPanels = [];

// === ON APP LOAD ===
document.addEventListener('DOMContentLoaded', onAppLoad);

async function onAppLoad() {
  // Load the default 'admin' page into the main container
  const notesPanel = document.getElementById('notes-panel');
   loadPage('admin', notesPanel);

  // Set up click listeners on navigation buttons
  setupNavigationListeners();
}

// === NAVIGATION LISTENER SETUP ===
function setupNavigationListeners() {
  const navButtons = document.querySelectorAll('nav button');

  navButtons.forEach(button => {
    // Prevent duplicate listeners (important if this runs more than once)
    const cloned = button.cloneNode(true);
    button.replaceWith(cloned);

    cloned.addEventListener('click', async function () {
      const pageName = this.getAttribute('data-page');
      await handleNavigation(this, pageName);
    });
  });
}

// === HANDLE NAVIGATION LOGIC ===
async function handleNavigation(button, pageName) {
  const navButtons = document.querySelectorAll('nav button');
  const mainContainer = document.getElementById('main-container');

  // Update active class
  navButtons.forEach(btn => btn.classList.remove('active-page'));
  button.classList.add('active-page');

  if (pageName === 'admin') {
    await handleAdminNavigation();
  } else {
    await togglePanel(pageName);
    resizePanels();
  }
}

// === SPECIFIC HANDLERS ===

async function handleAdminNavigation() {
  const mainContainer = document.getElementById('main-container');
  const notesPanel = document.getElementById('notes-panel'); 

  // Reset notes panel style
  notesPanel.className = 'notes-panel bg-amber-50 p-8';

  // Remove all dynamic panels (everything after the first child)
  while (mainContainer.children.length > 1) {
    mainContainer.removeChild(mainContainer.lastChild);
  }

  // Clear tracking array
  dynamicPanels.length = 0;

  // Reload admin content
  await loadPage('admin', notesPanel);

  // Adjust layout
  resizePanels();
}

async function togglePanel(pageName) {
  const mainContainer = document.getElementById('main-container');
  const panelIndex = dynamicPanels.indexOf(pageName);

  if (panelIndex !== -1) {
    // Panel is open → close it
    const panel = Array.from(mainContainer.children).find(el => el.dataset.pageName === pageName);
    if (panel) {
      mainContainer.removeChild(panel);
      dynamicPanels.splice(panelIndex, 1);
    }
  } else {
    // Panel is closed → open it
    const newPanel = document.createElement('div');
    newPanel.className = 'page-panel bg-amber-50 p-8';
    newPanel.dataset.pageName = pageName;
    mainContainer.appendChild(newPanel);
    dynamicPanels.push(pageName);
    await loadPage(pageName, newPanel);
  }
}

// === LAYOUT MANAGEMENT ===
function resizePanels() {
  const mainContainer = document.getElementById('main-container');
  const totalPanels = 1 + dynamicPanels.length; // 1 for admin + dynamic panels
  const width = `${Math.floor(90 / totalPanels)}%`;

  Array.from(mainContainer.children).forEach(child => {
    child.style.width = width;
  });
}

  // Function to load a page
  async function loadPage(pageName, container = notesPanel) {
    try {
      console.log('pageName:',pageName);
      // Don't reload if it's already the current page
      if (container.dataset.currentPage === pageName) {
        return;
      }
      
      // Fetch page content
      const response = await fetch(`htmlStubs/${pageName}.html`);
      if (!response.ok) {
        throw new Error(`Failed to load ${pageName} page`);
      }
      
      const content = await response.text();
      
      // Clear container and add new content
      container.innerHTML = content;
      container.dataset.currentPage = pageName;
      
    } catch (error) {
      console.error('Error loading page:', error);
      container.innerHTML = `
        <div class="text-red-700">
          <h3 class="text-lg font-bold">Error</h3>
          <p>Failed to load ${pageName} page.</p>
        </div>
      `;
    }
  }