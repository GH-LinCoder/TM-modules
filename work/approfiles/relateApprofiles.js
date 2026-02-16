// work/relate/relateApprofiles.js
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { appState } from '../../state/appState.js';
import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';
import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';

import {getClipboardAppros} from './getClipboardAppros.js';

const userId = appState.query.userId;

console.log('🔥 relateApprofiles.js: START');

export function renderPermissions(panel,query={},relationType){
    panel.innerHTML = getTemplateHTML();
   const dialog = panel.querySelector('[data-form="relateDialog"]');
  const form = panel.querySelector('[data-form="relateForm"]');
  const approfile1Select = panel.querySelector('[data-form="approfile1Select"]');
  const approfile2Select = panel.querySelector('[data-form="approfile2Select"]');
  const relationshipSelect = panel.querySelector('[data-form="relationshipSelect"]');
  const relateBtn = panel.querySelector('[data-form="relateBtn"]');
  const informationFeedback = panel.querySelector('[data-task="information-feedback"]');

  init(panel, {
    dialog,
    form,
    approfile1Select,
    approfile2Select,
    relationshipSelect,
    relateBtn,
    informationFeedback,
    relationType
  });  
}



export function render(panel, query = {}, relationType) {
  console.log('relateApprofiles.js render() called');
  panel.innerHTML = getTemplateHTML();
/*  
let sourceTable=null;
if(relationType === 'permissionRelation') sourceTable = 'permission_relationships';
else if (relationType === 'ordinaryRelation') sourceTable ='relationships'; 
else {console.log('relationType unknown', relationType) }
*/
  // DOM elements
  const dialog = panel.querySelector('[data-form="relateDialog"]');
  const form = panel.querySelector('[data-form="relateForm"]');
  const approfile1Select = panel.querySelector('[data-form="approfile1Select"]');
  const approfile2Select = panel.querySelector('[data-form="approfile2Select"]');
  const relationshipSelect = panel.querySelector('[data-form="relationshipSelect"]');
  const relateBtn = panel.querySelector('[data-form="relateBtn"]');
  const informationFeedback = panel.querySelector('[data-task="information-feedback"]');

  init(panel, {
    dialog,
    form,
    approfile1Select,
    approfile2Select,
    relationshipSelect,
    relateBtn,
    informationFeedback,
    relationType
  });
     //     panel.innerHTML+=petitionBreadcrumbs();//this reads 'petition' and prints the values at bottom of the render panel
}

function getTemplateHTML() {
  return `
    <div id="relateDialog" data-form="relateDialog" class="relate-dialog   flex flex-col h-full">
    <!-- INSTRUCTIONS -->
        <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p class="text-sm text-blue-800">
            <strong>How to use:</strong><br>
            1. Uses the [Select] menu to select which files to relate<br>
            2. The names will appear in the dropdowns in this mmodule.<br>
            3. Choose one in each dropdown.<br>
            4. Choose the relationship in the middle dropdown.<br>
            5. Click "Confirm" to store it for use in forms.<br>
            6. IMPORTANT: To relate tasks make sure you have selected the appro for the task, and not the actual task.
            Only appros can be related. (Tasks can be assigned but not related. Sorry, it is confusing)
          </p>
        </div>  
    
    <div class="bg-white rounded-lg shadow-lg w-auto max-w-4xl mx-4 z-10 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Relate Approfiles 🖇️</h3>
            <p class="text-sm text-gray-600">Create a relationship between two approfiles</p>
            <button class="text-gray-500 hover:text-gray-700" data-action="close-dialog" aria-label="Close">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        <div class="p-6 space-y-6">
          <div class="space-y-2">
            <label for="approfile1Select" class="block text-sm font-medium text-gray-700">Select First Approfile</label>
            <select id="approfile1Select" data-form="approfile1Select" class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500" required>
              <option value="">Select an approfile</option>
            </select>
          </div>
          <div class="space-y-2">
            <label for="relationshipSelect" class="block text-sm font-medium text-gray-700">Select Relationship</label>
            <select id="relationshipSelect" data-form="relationshipSelect" class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500" required>
              <option value="">Select a relationship</option>
            </select>
          </div>
          <div class="space-y-2">
            <label for="approfile2Select" class="block text-sm font-medium text-gray-700">Select Second Approfile</label>
            <select id="approfile2Select" data-form="approfile2Select" class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500" required>
              <option value="">Select an approfile</option>
            </select>
          </div>
          <div class="text-sm text-gray-500 space-y-2 p-3 bg-gray-50 rounded-lg">
            <p>Create a semantic relationship between two approfiles (people, tasks, groups).</p>
            <p>📋 Items from your clipboard will appear in dropdowns with "(clipboard)" label.</p>
            <p>Example: "John" → "member" → "Project Team"</p>
          </div>
          <button type="submit" id="relateBtn" data-form="relateBtn" 
            class="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled>
            Create Relationship
          </button>
        </div>
        <div class="bg-green-100 flex flex-col md:flex-row justify-center gap-4 pt-4 border-t border-gray-200">
          <p class="text-lg font-bold">Information:</p>
          <p data-task="information-feedback"></p>
        </div>
      </div>
    </div>
       ${petitionBreadcrumbs()} 
  `;
}

function init(panel, elements) {
  const { dialog, form, approfile1Select, approfile2Select, relationshipSelect, relateBtn, informationFeedback, relationType } = elements;
  
  console.log('relateApprofiles.js init()');
  
  // Close dialog
  dialog.querySelectorAll('[data-action="close-dialog"]').forEach(el => {
    el.addEventListener('click', () => {
      if (panel.parentElement) {
        panel.parentElement.removeChild(panel);
      }
    });
  });

  // Button click
  relateBtn.addEventListener('click', (e) => handleRelate(e, {
    approfile1Select,
    approfile2Select,
    relationshipSelect,
    relateBtn,
    informationFeedback,
    relationType
  }));

  // Update button state on change
  approfile1Select.addEventListener('change', () => updateSubmitButtonState({
    approfile1Select,
    approfile2Select,
    relationshipSelect,
    relateBtn
  }));
  approfile2Select.addEventListener('change', () => updateSubmitButtonState({
    approfile1Select,
    approfile2Select,
    relationshipSelect,
    relateBtn
  }));
  relationshipSelect.addEventListener('change', () => updateSubmitButtonState({
    approfile1Select,
    approfile2Select,
    relationshipSelect,
    relateBtn
  }));

  // Load relationships
  populateRelationshipsDropdown(relationshipSelect, relationType);
  
  // Clipboard integration
  populateFromClipboard({
    approfile1Select,
    approfile2Select,
    informationFeedback
  });
  
  onClipboardUpdate(() => {
    populateFromClipboard({
      approfile1Select,
      approfile2Select,
      informationFeedback
    });
  });
}

async function populateRelationshipsDropdown(relationshipSelect, relationType='ordinaryRelation') {
      console.log('populateRelationshipsDropdown relationType:', relationType);

    try { let relationships = []
    
    if(relationType === 'ordinaryRelation') relationships = await executeIfPermitted(userId, 'readRelationships');
    else if(relationType === 'permissionRelation') relationships = await executeIfPermitted(userId, 'readPermissionRelationships');
    else {
      console.log('relationType unknown', relationType);
      throw new Error('Unknown relation type: ' + relationType);
    }
    if (!relationships || relationships.length === 0) {
      throw new Error('No relationships found');
    }

    relationshipSelect.innerHTML = '<option value="" disabled selected>Select relationship</option>';
    
    relationships.forEach(rel => {
      const option = document.createElement('option');
      option.value = rel.name;
      option.textContent = rel.name;
      relationshipSelect.appendChild(option);
    });
    
  } catch (error) {
    console.error('Error populating relationships dropdown:', error);
    showToast('Failed to load relationships', 'error');
  }
}
/*
function getClipboardAppros(){
  const allAppros = getClipboardItems({ type: 'app-human' })
  .concat(getClipboardItems({ type: 'app-task' }))
  .concat(getClipboardItems({ type: 'app-abstract' }))
  .concat(getClipboardItems({ type: 'app-survey' })) 
  .concat(getClipboardItems({ type: 'app-task' }))
return allAppros;
} */


function populateFromClipboard({ approfile1Select, approfile2Select, informationFeedback }) {
  console.log('populateFromClipboard()');
  
  const approfiles =getClipboardAppros(); //moved to separate function

  // Get all approfile types
/*
  const approfiles = getClipboardItems({ type: 'app-human' })
    .concat(getClipboardItems({ type: 'app-task' }))
    .concat(getClipboardItems({ type: 'app-abstract' }))
    .concat(getClipboardItems({ type: 'app-survey' })) 
    .concat(getClipboardItems({ type: 'app-task' }))
 ; */ //added surveys and tasks 18:57 Nov 27 2025
  
  // Auto-fill if exactly two items and fields are empty
  if (approfiles.length === 2 && !approfile1Select.value && !approfile2Select.value) {
    approfile1Select.value = approfiles[0].entity.id;
    approfile2Select.value = approfiles[1].entity.id;
    if (informationFeedback) {
      informationFeedback.innerHTML += `<div class="p-1 text-sm bg-purple-50 border border-purple-200 rounded">Auto-filled from clipboard</div>`;
    }
  }
  
  // Add to dropdowns
  addClipboardItemsToDropdown(approfiles, approfile1Select);
  addClipboardItemsToDropdown(approfiles, approfile2Select);
  
  updateSubmitButtonState({
    approfile1Select,
    approfile2Select,
    relationshipSelect: document.querySelector('[data-form="relationshipSelect"]'),
    relateBtn: document.querySelector('[data-form="relateBtn"]')
  });
}

function addClipboardItemsToDropdown(items, selectElement) {
  if (!items || items.length === 0 || !selectElement) return;
  
  items.forEach(item => {
    const existingOption = Array.from(selectElement.options).find(opt => opt.value === item.entity.id);
    if (!existingOption) {
      const option = document.createElement('option');
      option.value = item.entity.id;
      option.textContent = `${item.entity.name} (clipboard)`;
      option.dataset.source = 'clipboard';
      selectElement.appendChild(option);
    }
  });
}

function updateSubmitButtonState({ approfile1Select, approfile2Select, relationshipSelect, relateBtn }) {
  const approfile1Selected = approfile1Select?.value !== '';
  const approfile2Selected = approfile2Select?.value !== '';
  const relationshipSelected = relationshipSelect?.value !== '';
//could contain check if the selected values are the same as the passed values. If so disable button & text displayed to 'waiting for change'
  if (relateBtn) {
    relateBtn.disabled = !(approfile1Selected && approfile2Selected && relationshipSelected);
    if (approfile1Selected && approfile2Selected && relationshipSelected) {
      relateBtn.textContent = 'Create Relationship';
    }
  }
}

async function handleRelate(e, { approfile1Select, approfile2Select, relationshipSelect, relateBtn, informationFeedback, relationType }) {
  e.preventDefault();
  console.log('handleRelate()');
  relateBtn.disabled = true;

  const approfile_is = approfile1Select.value;
  const of_approfile = approfile2Select.value;
  const relationship = relationshipSelect.value;

  if (!approfile_is || !of_approfile || !relationship) {
    showToast('Please select both approfiles and a relationship', 'error');
    relateBtn.disabled = false;
    return;
  }

  try {
    relateBtn.textContent = 'Creating relationship...';
    
if(relationType ==='ordinaryRelation'){

    const newRelation = await executeIfPermitted(userId, 'createApprofileRelation', {
      approfile_is,
      of_approfile,
      relationship
    });
}
 else if(relationType ==='permissionRelation'){
      const newRelation = await executeIfPermitted(userId, 'createPermissionRelation', {
      approfile_is,
      of_approfile,
      relationship
    });
 }



    relateBtn.textContent = 'Relationship created! - create another or close';
    showToast('Relationship created successfully!', 'success');
    
    // Clear selections for next relationship// this makes it harder to do another similar relation
 //   approfile1Select.value = '';
  //  approfile2Select.value = '';
  //  relationshipSelect.value = '';
    
    updateSubmitButtonState({
      approfile1Select,
      approfile2Select,
      relationshipSelect,
      relateBtn
    });
    
  } catch (error) {
    console.error('Failed :', error);
    showToast('Failed to create relationship: ' + error.message, 'error');
    relateBtn.disabled = false;
    relateBtn.textContent = 'Create Relationship';
  }
}