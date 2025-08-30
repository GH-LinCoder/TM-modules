//ui/navListeners.js
import { handleNavigation } from './reactToPageButtons.js';
console.log('ui/navListeners.js');
// === NAVIGATION LISTENER SETUP === setupNavigationListeners
export function setupNavigationListeners() {
console.log('setupNavigationListeners()');
    const navButtons = document.querySelectorAll('nav button');
  
    navButtons.forEach(button => {
      // Prevent duplicate listeners
      const cloned = button.cloneNode(true);
      button.replaceWith(cloned);
  
      cloned.addEventListener('click', async function () {
        const pageName = this.getAttribute('data-page');
        await handleNavigation(this, pageName);
      });
    });
  }