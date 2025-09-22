//  ./symanticClipboard.js


import{executeIfPermitted} from '../../registry/executeIfPermitted.js';
import{showToast} from '../../ui/showToast.js';
import { appState } from '../../state/appState.js'; // modules interact through appState

console.log('createTaskForm.js loaded');

const userId = appState.query.userId;

export function render(panel, query = {}) { //query is not currently used, but may be important for permissions
  console.log('Render(', panel, query,')');
//  panel.innerHTML = "TEST TEST TEST";//working 16:05 3 sept 2025
  panel.innerHTML = getTemplateHTML();
  attachListeners(panel);
  //updatePanelLayout();
}

function getTemplateHTML() { console.log('getTemplateHTML()');
  return `

<div id="semantic-clipboard" class="fixed bottom-0 right-0 w-80 bg-white border-l border-t shadow-lg z-50">
  <div class="p-3 bg-gray-100 border-b flex justify-between items-center">
    <h4 class="font-medium">Clipboard ({{ count }})</h4>
    <button onclick="SemanticClipboard.clear()">Clear All</button>
  </div>
  <div class="p-2 max-h-96 overflow-y-auto">
    <!-- Repeated for each item -->
    <div class="p-2 mb-2 bg-gray-50 rounded border flex items-center justify-between">
      <div>
        <div class="font-medium">{{ item.label }}</div>
        <div class="text-xs">
          <span class="px-2 py-0.5 bg-blue-100 text-blue-800 rounded">{{ item.type }}</span>
          <span class="px-2 py-0.5 bg-green-100 text-green-800 rounded ml-1">{{ item.role }}</span>
        </div>
      </div>
      <button onclick="SemanticClipboard.removeItem('{{ item.id }}')" class="text-red-500 hover:text-red-700">×</button>
    </div>
  </div>
</div>`
}

function attachListeners(panel) {
    console.log('attachListeners()', panel);
  //    panel.querySelector('#taskName')?.addEventListener('input', e => {
  //    panel.querySelector('#taskNameCounter').textContent = `${e.target.value.length}/64 characters`;
   // });
  

//    panel.querySelector('#saveStepBtn')?.addEventListener('click', handleStepSubmit);
//    panel.querySelector('[data-action="close-dialog"]')?.addEventListener('click', () => panel.remove());
  }
  

  //calling from functions  //////////////////////////////////////

  // In assignTaskForm.js
const studentItems = SemanticClipboard.getItemsByRole('student');
if (studentItems.length > 0) {
  studentDropdown.value = studentItems[0].id;
  showToast(`Auto-filled from clipboard: ${studentItems[0].label}`, 'info');
}

/// change in data sends trigger

// In any list, card, table, etc.
function onEntityClick(entity, suggestedAs = null) {
    appState.tempSelection = {
      entity: entity,
      suggestedAs: suggestedAs || inferSemanticRole(entity), // e.g., if from /students → "student"
      source: getCurrentModule(),
      timestamp: Date.now()
    };
  
    // Dispatch global event
    document.dispatchEvent(new CustomEvent('clipboard:selection-ready'));
  }


  ///////////// other possible design

  // components/ClipboardClassifier.js
export function showClipboardClassifier() {
    if (!appState.tempSelection) return;
  
    const panel = document.createElement('div');
    panel.innerHTML = getClassifierTemplate();
    document.body.appendChild(panel);
  
    const classifier = panel.querySelector('#clipboard-classifier');
    const entityDisplay = classifier.querySelector('[data-display="entity"]');
    const asSelect = classifier.querySelector('[data-input="as"]');
    const confirmBtn = classifier.querySelector('[data-action="confirm"]');
    const cancelBtn = classifier.querySelector('[data-action="cancel"]');
  
    // Populate with selected entity
    const { entity, suggestedAs } = appState.tempSelection;
    entityDisplay.innerHTML = `
      <div class="p-3 bg-gray-50 rounded">
        <div class="font-medium">${entity.name || entity.id}</div>
        <div class="text-sm text-gray-600">Type: ${entity.type}</div>
      </div>
    `;
  
    // Pre-select suggested "as"
    if (suggestedAs) {
      const option = Array.from(asSelect.options).find(opt => opt.value === suggestedAs);
      if (option) asSelect.value = suggestedAs;
    }
  
    // Event listeners
    confirmBtn.addEventListener('click', () => {
      const asValue = asSelect.value;
      if (!asValue) return;
  
      // Add to clipboard
      const clipboardItem = {
        entity: entity,
        as: asValue,
        metadata: {
          ...appState.tempSelection,
          confirmedAt: Date.now(),
          id: `clipboard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }
      };
  
      appState.clipboard.push(clipboardItem);
      document.dispatchEvent(new CustomEvent('clipboard:item-added', { detail: clipboardItem }));
  
      // Clear temp selection
      appState.tempSelection = null;
  
      // Close and notify
      panel.remove();
      showToast(`Remembered "${entity.name}" as ${asValue}`, 'success');
    });
  
    cancelBtn.addEventListener('click', () => {
      appState.tempSelection = null;
      panel.remove();
    });
  }
  
  function getClassifierTemplate() {
    return `
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div id="clipboard-classifier" class="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div class="p-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold">Remember Selection</h3>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Selected Item</label>
              <div data-display="entity"></div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Remember as...</label>
              <select data-input="as" class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500">
                <option value="">Select classification...</option>
                <option value="student">Student</option>
                <option value="manager">Manager</option>
                <option value="task">Task</option>
                <option value="approver">Approver</option>
                <option value="reviewer">Reviewer</option>
                <option value="observer">Observer</option>
                <option value="owner">Owner</option>
                <option value="participant">Participant</option>
                <option value="custom">Custom...</option>
              </select>
            </div>
            <div class="flex gap-3 pt-4">
              <button data-action="confirm" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                Remember
              </button>
              <button data-action="cancel" class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }


  ///////////////  flexmain.js
/*
  // main.js or app.js
document.addEventListener('clipboard:selection-ready', () => {
    showClipboardClassifier();
  });

  */

  ////////// docked panel ////////////

  // components/DockedClipboard.js
export function renderDockedClipboard(container) {
    container.innerHTML = `
      <div id="docked-clipboard" class="fixed bottom-4 right-4 w-80 bg-white border rounded-lg shadow-lg z-40">
        <div class="p-3 bg-gray-100 border-b flex justify-between items-center">
          <h4 class="font-medium">Clipboard (${appState.clipboard.length})</h4>
          <button data-action="clear-clipboard" class="text-sm text-red-500 hover:text-red-700">Clear</button>
        </div>
        <div class="p-2 max-h-80 overflow-y-auto" data-container="items">
          ${appState.clipboard.map(item => `
            <div class="p-2 mb-2 bg-gray-50 rounded border flex items-center justify-between" data-item-id="${item.metadata.id}">
              <div>
                <div class="font-medium text-sm">${item.entity.name}</div>
                <div class="text-xs">
                  <span class="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">${item.entity.type}</span>
                  <span class="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs ml-1">as ${item.as}</span>
                </div>
              </div>
              <button data-action="remove-item" data-id="${item.metadata.id}" class="text-red-500 hover:text-red-700">×</button>
            </div>
          `).join('')}
        </div>
        <div class="p-3 border-t bg-gray-50">
          <button data-action="pin-toggle" class="text-xs text-blue-600 hover:text-blue-800">
            ${appState.clipboardPinned ? 'Unpin' : 'Pin to stay open'}
          </button>
        </div>
      </div>
    `;
  
    // Event listeners
    container.querySelector('[data-action="clear-clipboard"]')?.addEventListener('click', () => {
      appState.clipboard = [];
      document.dispatchEvent(new CustomEvent('clipboard:cleared'));
      renderDockedClipboard(container); // Re-render
    });
  
    container.querySelectorAll('[data-action="remove-item"]')?.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        appState.clipboard = appState.clipboard.filter(item => item.metadata.id !== id);
        document.dispatchEvent(new CustomEvent('clipboard:item-removed', { detail: { id } }));
        renderDockedClipboard(container);
      });
    });
  }


  ////////////// data structure ?
/*
  {
    id: 'uuid-123',
    name: 'Jane Doe',
    type: 'approfile',      // optional
    as: 'student',          // semantic label
    source: 'app_profiles', // optional
    timestamp: Date.now(),  // optional
    raw: { ... }            // original row data
  }

  
  or

  {
    // The actual data (minimal or full, depending on need)
    entity: {
      id: "uuid-123",
      name: "Jane Smith",
      type: "approfile", // or "task", "assignment", etc.
      // ... other fields as needed
    },
  
    // The semantic lens — how to interpret this entity in context
    as: "student", // or "manager", "task", "reviewer", "owner", etc.
  
    // Metadata for the system
    metadata: {
      timestamp: 1712345678901,
      source: "approfile-list.js",
      sourceContext: "member-dashboard",
      autoDetectedAs: "student", // optional: what the system guessed
      userConfirmedAs: true,      // optional: did user confirm/edit?
      pinned: true               // optional: user pinned it
    }
  }
*/
