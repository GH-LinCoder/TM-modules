/*
approfiles are a central point of relationships
every authenticated user has an approfile with whatever important informtion about that person inlcuding their auth_user_id
every task has an approfile with the name, description and the task_header_id
In addition groups and designations are represented by approfiles. These are 'abstract' approfiles
Some standard approfiles: 
    name: 'Admin of database' 
        -any user who has permission to alter/drop tables 
        at the database 
        Identified by relating that persons approfile with this approfile by the relationship 'is'

    name: 'Admin of app' 
        -any user who has permission to carry out any action posible using 
        the app, but not a database admin is identified by relating that persons approfile 
        with this approfile by the relationshion ship 'is'
    
    name: 'Welcome' 
        -an approfile to relate to any tasks, persons, knowledge etc that is relevant to
        dealing with or greeting a new user.
    name: 'App learn how to use'
        -an approfile to relate any introductory or instructional tasks, knowledge, persons etc
        relavant to learning how to use the app.

Create Approfile:
    Requires that the user is related to the correct permissions to add an approfile to the database.
    The 'name' of the approfile must not already be in the database. Names of approfiles must be unique.
    The name should be though of as the end of a sentence  "Here is an approfile which IS the (some relationship) of the new approfile name."
    If you are creating an abstract approfile such as "art collector" a typical relationship could be 'is (is a / is an)' 
    This could produce the sentence: John is art collector or as it would appear in the database
    approfile_is 'is' of_approfile.
    If the new approfile were "The Art Collector's Club" then the relationship would probably be 'member'
    approfile_is 'member' of_approfile 
*/

import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';

console.log('createApprofileForm.js loaded');

const state = {
  user: '06e0a6e6-c5b3-4b11-a9ec-3e1c1268f3df' // Replace with dynamic user ID
};

export function render(panel, query = {}) {
  console.log('Render Approfile Form:', panel, query);
  panel.innerHTML = getTemplateHTML();
  attachListeners(panel);
}

function getTemplateHTML() {
  return `
    <div id="createApprofileDialog" class="create-approfile-dialogue relative z-10 flex flex-col h-full">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 z-10 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-xl font-semibold text-gray-900">Create New Approfile</h3>
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
              Create a new approfile to represent a person, role, or entity in your system.
              Each approfile must have a unique name that doesn't already exist in the database.
            </p>
            <ul class="text-blue-700 text-sm mt-2 space-y-1">
              <li>• Choose a short, unique, and meaningful name for the approfile</li>
              <li>• Provide a description that explains the purpose of this approfile</li>
              <li>• The name must be unique across all existing approfiles</li>
              <li>• Click "Save Approfile" when you're ready to create it</li>
            </ul>
          </div>

          <div id="createApprofileForm" class="space-y-6 bg-gray-50 p-6 rounded-lg">
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
                Save Approfile
              </button>
              <button id="cancelBtn" class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
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
    saveBtn.textContent = 'Save Approfile';
  });

  descriptionInput?.addEventListener('input', e => {
    descriptionCounter.textContent = `${e.target.value.length}/2000 characters`;
  });

  saveBtn?.addEventListener('click', handleApprofileSubmit);
  cancelBtn?.addEventListener('click', () => panel.remove());
  panel.querySelector('[data-action="close-dialog"]')?.addEventListener('click', () => panel.remove());
}

async function handleApprofileSubmit(e) {
  e.preventDefault();
  console.log('handleApprofileSubmit');

  const name = document.querySelector('#approfileName')?.value.trim();
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
    // Check for duplicates first
    const existing = await executeIfPermitted(state.user, 'readApprofileByName', { approfileName: name });
    console.log('checkIfExists:', existing);
    
    if (existing && existing.length > 0) {
      nameError.classList.remove('hidden');
      showToast('An approfile with this name already exists', 'error');
      saveBtn.disabled = false;
      saveBtn.textContent = 'Choose a different name';
      return;
    }

    saveBtn.textContent = 'Saving Approfile...';

    const newApprofile = await executeIfPermitted(state.user, 'createApprofile', {
      name,
      description
    });

    showToast('Approfile created successfully!');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Approfile created! Create another by changing the name.';
    
    // Clear the form but keep it open for creating another approfile
    document.querySelector('#approfileDescription').value = '';
    document.querySelector('#approfileDescriptionCounter').textContent = '0/2000 characters';
  } catch (error) {
    showToast('Failed to create approfile: ' + error.message, 'error');
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Approfile';
  }
}