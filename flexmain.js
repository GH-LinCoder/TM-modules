import { setupNotesListeners } from "./ui/setupNotesListeners.js";
import { renderNotes } from "./ui/renderNotes.js";  
import { displayNotes } from "./ui/displayNotes.js";  

const dynamicPanels = [];

document.addEventListener('DOMContentLoaded', async function() {
  const notesPanel = document.getElementById('notes-panel');
  const mainContainer = document.getElementById('main-container');
  const navButtons = document.querySelectorAll('nav button');
  
  // Load the Notes page
  await loadPage('admin');
  
  // Set up the listeners after the page is loaded
  setupNotesListeners();

  await displayNotes(); //new file 19:15
  
  // Set up navigation
  navButtons.forEach( button => {
    button.addEventListener('click', async function() {
      const pageName = this.getAttribute('data-page');
      
button.addEventListener('click', async function () {
  const pageName = this.getAttribute('data-page');

  navButtons.forEach(btn => btn.classList.remove('active-page'));
  this.classList.add('active-page');

  if (pageName === 'admin') {
    notesPanel.className = 'notes-panel bg-amber-50 p-8';
    while (mainContainer.children.length > 1) {
      mainContainer.removeChild(mainContainer.lastChild);
    }
    dynamicPanels.length = 0;
    await loadPage('admin', notesPanel);
    return;
  }

  // Check if panel is already open BEFORE doing anything
  const panelIndex = dynamicPanels.indexOf(pageName);
  if (panelIndex !== -1) {
    // Panel is open — remove it
    const panel = Array.from(mainContainer.children).find(
      el => el.dataset.pageName === pageName
    );
    if (panel) {
      mainContainer.removeChild(panel);
      dynamicPanels.splice(panelIndex, 1);
    }
  } else {
    // Panel is not open — add it
    const newPanel = document.createElement('div');
    newPanel.className = 'page-panel bg-amber-50 p-8';
    newPanel.dataset.pageName = pageName;
    mainContainer.appendChild(newPanel);
    dynamicPanels.push(pageName);
    await loadPage(pageName, newPanel);
  }

  // Recalculate widths
  const totalPanels = 1 + dynamicPanels.length;
  const width = `${Math.floor(90 / totalPanels)}%`;
  Array.from(mainContainer.children).forEach(child => {
    child.style.width = width;
  });
});

    });
  });
    
  
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
});