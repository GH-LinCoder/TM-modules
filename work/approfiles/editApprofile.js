// ./work/approfiles/editApprofileForm.js
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';
import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';
console.log('editApprofileForm.js loaded');

import {getClipboardAppros} from './getClipboardAppros.js';
let currentSelection = null;

const state = {
  user: '06e0a6e6-c5b3-4b11-a9ec-3e1c1268f3df', // Replace with dynamic user ID
  currentApprofile: null
};

export function render(panel, query = {}) {
  console.log('Render Edit Approfile Form:', panel, query);
  
  panel.innerHTML = getTemplateHTML();
  attachListeners(panel);
  
  // Initialize clipboard integration
  initClipboardIntegration(panel);
       //   panel.innerHTML+=petitionBreadcrumbs();//this reads 'petition' and prints the values at bottom of the render panel
}

function initClipboardIntegration(panel) {
  // Check clipboard immediately
  populateFromClipboard(panel);
  
  // Listen for future changes
  onClipboardUpdate(() => {
    populateFromClipboard(panel);
    populateApprofileSelect(panel);
  });
}

async function populateApprofileSelect(panel) {

  const approfiles = getClipboardAppros();//replaced 19:45 Nov 27
 
console.log('length:',approfiles.length);

  const select = panel.querySelector('#approfile1Select');
  if (!select) {currentSelection = 'Not selected' } // previously return    changed 12:00 Oct 27
else  currentSelection = select.value;

 // Save current selection
  
  // Rebuild options
  select.innerHTML = '<option value="">Select an approfile from clipboard...</option>';
  
  approfiles.forEach(item => {
    const option = document.createElement('option');
    option.value = item.entity.id;
    option.textContent = item.entity.name;
    select.appendChild(option);
  });
  
  // Restore selection if still valid
  if (currentSelection && approfiles.some(item => item.entity.id === currentSelection)) {
    select.value = currentSelection;
  } else if (approfiles.length === 1) { //change to approLength=approfiles.length; if approLength >0 select.value = approfiles[approLength-1] //select newest entry
    // Auto-select if only one option
    select.value = approfiles[0].entity.id;
    //await loadAndRenderRelationships(panel, approfiles[0].entity.id, approfiles[0].entity.name);
  }
  attachDropdownListener(panel);

  return approfiles.length

}

function attachDropdownListener(panel) {
  const select = panel.querySelector('#approfile1Select'); //change 16:17 Oct 27

if (!select) return;

// Check if listener already attached
if (select.dataset.listenerAttached === 'true') {
  console.log('Listener already attached, skipping');
  return;
}

// Add the listener
select.addEventListener('change', async (e) => {
  const approfileId = e.target.value;
  const selectedName = e.target.options[e.target.selectedIndex].textContent;

  if (approfileId) {
    console.log('Selected approfileId:', approfileId);

    // Find the approfile object from the clipboard list
    const approfiles = getClipboardAppros();
    const selectedApprofile = approfiles.find(item => item.entity.id === approfileId);

    if (selectedApprofile) {
      state.currentApprofile = selectedApprofile.entity.item || selectedApprofile.entity;

      // Populate the form fields
      loadApprofileIntoForm(panel, state.currentApprofile);
    }
  }
});

}

function loadApprofileIntoForm(panel, approfile) {
  const nameInput = panel.querySelector('#approfileName');
  const descriptionInput = panel.querySelector('#approfileDescription');
  const nameCounter = panel.querySelector('#approfileNameCounter');
  const descriptionCounter = panel.querySelector('#approfileDescriptionCounter');

  if (nameInput) {
    nameInput.value = approfile.name || '';
    nameCounter.textContent = `${nameInput.value.length}/64 characters`;
  }
  if (descriptionInput) {
    descriptionInput.value = approfile.description || '';
    descriptionCounter.textContent = `${descriptionInput.value.length}/2000 characters`;
  }
}



function populateFromClipboard(panel) {
  console.log('populateFromClipboard()');
  
  // Get approfiles from clipboard (any type)
  const approfiles = getClipboardItems({ type: 'app-human' })
    .concat(getClipboardItems({ type: 'app-task' }))
    .concat(getClipboardItems({ type: 'app-abstract' }));
  
  if (approfiles.length === 0) return;
  
  // Use the most recent one
  const item = approfiles[0];
  state.currentApprofile = item.entity.item; // full row data
  
  // Populate form
  if (state.currentApprofile) {
    loadApprofileIntoForm(panel, state.currentApprofile);
  }
  // Sync dropdown selection
  const select = panel.querySelector('#approfile1Select');
  console.log('Clipboard approfile:', state.currentApprofile);
console.log('Clipboard approfile.id:', state.currentApprofile?.id);
select.value =''; //remove the previous name from the dropdown
  /*
  if (select && state.currentApprofile.id) {
    select.value = state.currentApprofile.id;
  } */ //this didn't work. It just reset the dropdown text to "Select...."
}

function getTemplateHTML() {
  return `
    <div id="editApprofileDialog" class="edit-approfile-dialogue relative z-10 flex flex-col h-full">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 z-10 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-xl font-semibold text-gray-900">Edit Approfile</h3>
          <button data-action="close-dialog" class="text-gray-500 hover:text-gray-700" aria-label="Close">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="p-6">
          <div class="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 class="font-medium text-blue-800 mb-2">Instructions:</h4>
            <p class="text-blue-700 text-sm">
              Edit the details of this approfile. The name must remain unique across all approfiles.
            </p>
            <ul class="text-blue-700 text-sm mt-2 space-y-1">
              <li>• You can modify the name and description</li>
              <li>• The name must be unique across all existing approfiles</li>
              <li>• Click "Update Approfile" to save your changes</li>
              <li>📋 Auto-filled from clipboard if available</li>
            </ul>
          </div>

<div class="space-y-2">
            <label for="approfile1Select" class="block text-sm font-medium text-gray-700">Use [Select] to load Approfiles</label>
            <select id="approfile1Select" data-form="approfile1Select" class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500" required>
              <option value="">The select from dropwdown</option>
            </select>
          </div>



          <div id="editApprofileForm" class="space-y-6 bg-gray-50 p-6 rounded-lg">
            <div>
              <label for="approfileName" class="block text-sm font-medium text-gray-700 mb-1">
                Profile Name *
              </label>
              <input id="approfileName" placeholder="Short & unique profile name" maxlength="64" required class="w-full p-2 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              <p id="approfileNameCounter" class="text-xs text-gray-500 mt-1">0/64 characters</p>
              <p id="nameError" class="text-xs text-red-500 mt-1 hidden">This name already exists. Please choose a different name.</p>
            </div>

            <div>
              <label for="approfileDescription" class="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea id="approfileDescription" placeholder="Profile description" rows="4" maxlength="2000" required class="w-full p-2 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
              <p id="approfileDescriptionCounter" class="text-xs text-gray-500 mt-1">0/2000 characters</p>
            </div>

            <div class="flex gap-4">
              <button id="saveApprofileBtn" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
                Update Approfile
              </button>
              <button id="cancelBtn" class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
       ${petitionBreadcrumbs()} 
  `;
}

function attachListeners(panel) {
  const nameInput = panel.querySelector('#approfileName');
  const descriptionInput = panel.querySelector('#approfileDescription');
  const nameCounter = panel.querySelector('#approfileNameCounter');
  const descriptionCounter = panel.querySelector('#approfileDescriptionCounter');
  const nameError = panel.querySelector('#nameError');
  const saveBtn = panel.querySelector('#saveApprofileBtn');
  const cancelBtn = panel.querySelector('#cancelBtn');

  nameInput?.addEventListener('input', e => {
    nameCounter.textContent = `${e.target.value.length}/64 characters`;
    nameError.classList.add('hidden');
    saveBtn.disabled = false;
    saveBtn.textContent = 'Update Approfile';
  });

  descriptionInput?.addEventListener('input', e => {
    descriptionCounter.textContent = `${e.target.value.length}/2000 characters`;
  });

  saveBtn?.addEventListener('click', handleApprofileUpdate);
  cancelBtn?.addEventListener('click', () => panel.remove());
  panel.querySelector('[data-action="close-dialog"]')?.addEventListener('click', () => panel.remove());
}

async function handleApprofileUpdate(e) {
  e.preventDefault();
  console.log('handleApprofileUpdate');

  const name = document.querySelector('#approfileName')?.value.trim();
  console.log('name:',name);
  const description = document.querySelector('#approfileDescription')?.value.trim();
  const saveBtn = document.querySelector('#saveApprofileBtn');
  const nameError = document.querySelector('#nameError');

  if (!name || !description) {
    showToast('Name and description are required', 'error');
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = 'Checking for duplicates...';

  try {
    // Check for duplicates only if name has changed
    if (!state.currentApprofile || state.currentApprofile.name !== name) {
      const existing = await executeIfPermitted(state.user, 'readApprofileByName', { approfileName: name });
      console.log('checkIfExists:', existing);
      
      if (existing && existing.length > 0) {
        nameError.classList.remove('hidden');
        showToast('An approfile with this name already exists', 'error');
        saveBtn.disabled = false;
        saveBtn.textContent = 'Choose a different name';
        return;
      }
    }

    saveBtn.textContent = 'Updating Approfile...';

    const updatedApprofile = await executeIfPermitted(state.user, 'updateApprofile', {
      id: state.currentApprofile?.id,
      name,
      description
    });

    showToast('Approfile updated successfully!');
    saveBtn.textContent = 'Approfile updated!';
    
    // Update state
    state.currentApprofile = updatedApprofile;
    
    // Close after delay
    setTimeout(() => {
      const dialog = document.querySelector('#editApprofileDialog');
      if (dialog && dialog.parentElement) {
        dialog.parentElement.remove();
      }
    }, 1500);
    
  } catch (error) {
    showToast('Failed to update approfile: ' + error.message, 'error');
    saveBtn.disabled = false;
    saveBtn.textContent = 'Update Approfile';
  }
}