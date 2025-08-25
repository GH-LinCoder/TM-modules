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

  await displayNotes(); //new file 19:15 aug 14 to call fetchnotes()
  
  // Set up navigation
  navButtons.forEach(button => {
    button.addEventListener('click', async function() {
      const pageName = this.getAttribute('data-page');
      
      // Remove active state from all buttons
      navButtons.forEach(btn => btn.classList.remove('active-page'));
      // Add active state to clicked button
      this.classList.add('active-page');
      
      // If Notes is selected, show it with full width
      if (pageName === 'admin') {
        // Ensure notes panel has full width
        notesPanel.className = 'notes-panel bg-amber-50 p-8';
        // Make sure it's the only panel
        while (mainContainer.children.length > 1) {
          mainContainer.removeChild(mainContainer.lastChild);
        }
        
        // Reload the Notes page if needed
        await loadPage('admin', notesPanel);
      } else {
        // For other pages, create a split view
        if (mainContainer.children.length === 1) {
          // Create the dynamic page panel
          const dynamicPage = document.createElement('div');
          dynamicPage.className = 'page-panel bg-amber-50 p-8';
          dynamicPage.id = 'dynamic-page';
          mainContainer.appendChild(dynamicPage);
        }
        
        // Load the selected page in the right panel
        const dynamicPage = document.getElementById('dynamic-page');
        await loadPage(pageName, dynamicPage);
      }
    });
  });
  
  // Function to load a page
  async function loadPage(pageName, container = notesPanel) {
    try {
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