// workspace.js
import { supabase } from '/db/supabase.js';

let panels = [];
const container = document.querySelector('.container');
const modalOverlay = document.getElementById('modal-overlay');

// Open a main panel (90%)
export function openMainPanel(url) {
  closeAllPanels();
  const panel = createPanel(url, 'main');
  panels.push(panel);
  container.appendChild(panel);
}

// Open a side panel (45%)
export function openSidePanel(url) {
  // If no main panel, open as main
  if (panels.length === 0) {
    return openMainPanel(url);
  }

  // If only one main panel, convert it to side and add new side
  if (panels.length === 1 && panels[0].classList.contains('main')) {
    panels[0].classList.replace('main', 'side');
    panels[0].style.flex = '1 1 45%';
  }

  const panel = createPanel(url, 'side');
  panels.push(panel);
  container.appendChild(panel);

  // Optional: scroll to end
  container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
}

// Create panel
function createPanel(url, type) {
  const panel = document.createElement('div');
  panel.className = `panel ${type} bg-white rounded-lg shadow p-4`;
  panel.innerHTML = `
    <div class="flex justify-between items-center mb-3">
      <strong class="text-gray-800">Loading...</strong>
      <button onclick="removePanel(this)" class="text-gray-500 hover:text-gray-700">×</button>
    </div>
    <div class="panel-content min-h-96"></div>
  `;

  fetch(url)
    .then(r => r.text())
    .then(html => {
      const temp = document.createElement('div');
      temp.innerHTML = html;
      const content = temp.querySelector('.panel-content')?.innerHTML || html;
      panel.querySelector('.panel-content').innerHTML = content;
      panel.querySelector('strong').textContent = temp.querySelector('title')?.textContent || 'Panel';
      
      // Execute scripts
      Array.from(temp.querySelectorAll('script')).forEach(script => {
        const newScript = document.createElement('script');
        newScript.textContent = script.textContent;
        document.body.appendChild(newScript);
      });
    });

  return panel;
}

// Close all panels
export function closeAllPanels() {
  container.innerHTML = '';
  panels = [];
}

// Remove specific panel
window.removePanel = function(btn) {
  const panel = btn.closest('.panel');
  panel.remove();
  panels = panels.filter(p => p !== panel);

  // If only one panel left, make it main
  if (panels.length === 1) {
    panels[0].classList.replace('side', 'main');
    panels[0].style.flex = '1 1 90%';
  }
};

// Open modal
export function openModal(url) {
  fetch(url)
    .then(r => r.text())
    .then(html => {
      const modal = document.createElement('div');
      modal.className = 'fixed inset-4 top-20 z-50 max-w-lg mx-auto bg-white rounded-lg shadow-lg p-6';
      modal.innerHTML = html;
      document.body.appendChild(modal);
      modalOverlay.classList.remove('hidden');
      modalOverlay.onclick = closeModal;
    });
}

// Close modal
export function closeModal() {
  const modal = document.querySelector('.fixed.z-50');
  if (modal) modal.remove();
  modalOverlay.classList.add('hidden');
}

// ABAC-aware widget loader
export async function loadWidget(containerId, widgetUrl, requiredPermissions) {
  const user = await getCurrentUser();
  const hasAccess = await checkUserPermissions(user, requiredPermissions);

  if (!hasAccess) {
    document.getElementById(containerId).innerHTML = `
      <div class="text-sm text-red-600">Access denied</div>
    `;
    return;
  }

  const response = await fetch(widgetUrl);
  document.getElementById(containerId).innerHTML = await response.text();
}

// Helper: Get current user
async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// Helper: Check permissions (simplified)
async function checkUserPermissions(user, required) {
  const { data } = await supabase
    .from('user_permissions')
    .select('permission')
    .eq('user_id', user.id);

  const userPerms = data.map(p => p.permission);
  return required.every(p => userPerms.includes(p));
}