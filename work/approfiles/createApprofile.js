//  ./work/approfiles/createApprofile.js

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
import { appState } from '../../state/appState.js'; // modules interact through appState

console.log('createApprofileForm.js loaded');

const userId = appState.query.userId;// first use of the global userId 15:15 sept 16

export function render(panel, query = {}) {
  console.log('Render Approfile Form:', panel, query);
  panel.innerHTML = getTemplateHTML();
  attachListeners(panel);
}

function getTemplateHTML() {
  return `
    <div id="createApprofileDialog" class="relative z-10 flex flex-col h-full">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 z-10 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-xl font-semibold text-gray-900">Create Approfile</h3>
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

        <div class="bg-gray-200 p-6 space-y-6">
          <div id="createApprofileForm" class="space-y-4">
          <label for="approfileName" class="block text-sm font-medium text-gray-700 mb-1">
                Approfile Name *
          </label>
            <input id="approfileName" placeholder="Unique name for approfile" maxlength="64" required class="w-full p-2 border rounded" />
            <p id="approfileNameCounter" class="text-xs text-gray-500">0/64 characters</p>
         <label for="approfileDescription" class="block text-sm font-medium text-gray-700 mb-1">
                Description *
         </label>
            <textarea id="approfileDescription" placeholder="Description" rows="3" maxlength="500" required class="w-full p-2 min-h-80 border rounded"></textarea>
            <p id="approfileDescriptionCounter" class="text-xs text-gray-500">0/500 characters</p>

            <button id="saveApprofileBtn" class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">Save Approfile</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function attachListeners(panel) {
  panel.querySelector('#approfileName')?.addEventListener('input', e => {
    panel.querySelector('#approfileNameCounter').textContent = `${e.target.value.length}/64 characters`;
  });

  panel.querySelector('#approfileDescription')?.addEventListener('input', e => {
    panel.querySelector('#approfileDescriptionCounter').textContent = `${e.target.value.length}/2000 characters`;
  });

  panel.querySelector('#saveApprofileBtn')?.addEventListener('click', handleApprofileSubmit);
  panel.querySelector('[data-action="close-dialog"]')?.addEventListener('click', () => panel.remove());


  panel.querySelector('#approfileName')?.addEventListener('input', e => {
    const saveBtn = document.querySelector('#saveApprofileBtn');
    saveBtn.disabled = false;
    saveBtn.textContent = 'New name detected, saving is possible';
  });


/*
  const nameInput = panel.querySelector('#approfileName');
  nameInput?.addEventListener('input', () => {
    saveBtn.disabled = false;
    saveBtn.textContent = '';
  });
*/  


}

async function handleApprofileSubmit(e) {
  e.preventDefault();
  console.log('handleApprofileSubmit');

  const name = document.querySelector('#approfileName')?.value.trim();
  const description = document.querySelector('#approfileDescription')?.value.trim();
  const saveBtn = document.querySelector('#saveApprofileBtn');

  if (!name || !description) {
    showToast('Name and description are required', 'error');
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving Approfile...';

  try {
    // Check for duplicates first
    const existing = await executeIfPermitted(userId, 'readApprofileByName', { approfileName:name });
    console.log('checkIfExists:', existing);
    if (existing && existing.length > 0) {
      showToast('An approfile with this name already exists', 'error');
      saveBtn.disabled = false;
      saveBtn.textContent = 'Check the existing approfile with this name Or change the name';
      return;
    }

    const newApprofile = await executeIfPermitted(userId, 'createApprofile', {
      name,
      description
    });

    showToast('Approfile created successfully!');
    saveBtn.disabled = true;
    saveBtn.textContent = 'You can create another by editing the name';
   // panel.remove(); // Optionally close the dialog
  } catch (error) {
    showToast('Failed to create approfile: ' + error.message, 'error');
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Approfile';
  }
}
