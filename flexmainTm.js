// flexmainTm.js
console.log('flexmainTm.js');
import { reactToHowToButton } from './reactToHowToButton.js';

// In listener:
if (page === 'howTo') {
  reactToHowToButton();
}
const contentArea = document.getElementById('content');
let rightPanel = null;

// Load default: Admin Dashboard
window.addEventListener('DOMContentLoaded', () => {
  loadPage('dash');
});

// Delegated listener
contentArea.addEventListener('click', (e) => {
  const target = e.target;

  // Handle Close button
  if (target.closest('[data-action="close"]')) {
    if (rightPanel) {
      rightPanel.remove();
      rightPanel = null;
      document.querySelector('#content > *')?.classList.replace('w-1/2', 'w-full');
    }
    return;
  }

  // Handle menu button clicks
  const btn = target.closest('[data-page]');
  if (btn) {
    const page = btn.dataset.page;
    if (page === 'dash') {
      loadPage('dash');
    } else if (page === 'howTo') {
      loadPage('howTo');
    }
  }
});

// Load page into right panel
async function loadPage(page) {
    console.log('loadPage()');
  try {
    const response = await fetch(`/${page}.html`);
    const html = await response.text();

    if (page === 'dash') {
      // Replace or create left panel
      const leftPanel = document.querySelector('#content > :first-child');
      if (leftPanel) {
        leftPanel.innerHTML = html;
        leftPanel.className = 'w-full p-6'; // Full width if no right panel
      } else {
        const panel = document.createElement('div');
        panel.className = 'w-full p-6';
        panel.innerHTML = html;
        contentArea.innerHTML = '';
        contentArea.appendChild(panel);
      }
      rightPanel = null;
    } else {
      // Load into right panel
      const leftPanel = document.querySelector('#content > :first-child');
      if (leftPanel && !rightPanel) {
        leftPanel.classList.replace('w-full', 'w-1/2');
        rightPanel = document.createElement('div');
        rightPanel.className = 'w-1/2 p-6';
        rightPanel.innerHTML = html;
        contentArea.appendChild(rightPanel);
      } else if (rightPanel) {
        rightPanel.innerHTML = html;
      }
    }
  } catch (err) {
    console.error('Failed to load page:', err);
  }
}