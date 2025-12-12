// ./work/approfile/deleteRelation.js

import { appState } from '../../state/appState.js';
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';
import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';

console.log('deleteRelation.js loaded');
let relations = null;

export function render(panel, query = {}) {
    console.log('deleteRelate.render '); 
    panel.innerHTML = getTemplateHTML();
    initClipboardIntegration(panel)
  }

function initClipboardIntegration(panel) {
    console.log('initClipboardIntegration()');
  // Check clipboard immediately
  getDataFromClipboard(panel);
  // Listen for future changes
  onClipboardUpdate(() => {
    getDataFromClipboard(panel);
   
  });
}

function getDataFromClipboard(panel) {
  console.log('getDataFromClipboard()');
  
    const relationSelect = panel.querySelector('#relationSelect');
   if (!relationSelect) return; 

  // Get relations from clipboard
  relations = getClipboardItems({ as: 'relation', type: 'relations' });
  
  if (relations.length === 0) return;
        
  console.log('Populating relations dropdown with', relations.length, 'items', relations);
  addClipboardItemsToDropdown(relations, relationSelect, panel);
    

// const item = relationSelect.value ? relations.find(t => t.entity.id === relationSelect.value) : relations[0];
// if (!item) return;
// console.log('Using clipboard item:', item);

  }
  
  
function displayRelation(panel, relationSelect){
//    const relationSelect = panel.querySelector('#relationSelect');
   if (!relationSelect) return; 

const selectedId = relationSelect.value;
console.log('selectedId',selectedId)
  const item = relations.find(r => r.entity.item.relation_id === selectedId);
console.log('item',item);
  if (!item) return;


      const approIs = panel.querySelector('#approIs');
 const relationship = panel.querySelector('#relationship');
 const ofAppro = panel.querySelector('#ofAppro'); 

// These three places on the screen should be injected with the info from the array relations[] but which element to pick depends on the value in the dropdown relationSelect
 approIs.innerHTML = item.entity.item.approfile_is_name;
  relationship.innerHTML = item.entity.item.relationship;
  ofAppro.innerHTML = item.entity.item.of_approfile_name;



}

function addClipboardItemsToDropdown(items, selectElement, panel) {
    console.log('addClipboardItemsToDropdown()');
  if (!items || items.length === 0) return;
 console.log('items',items);
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

  if (items.length === 1 && !selectElement.value) { 
    selectElement.value = items[0].entity.id; // this displays the name.Ho does .id display a name???
    console.log('selectElement.value',selectElement.value)
    displayRelation(panel, selectElement)
    const infoSection = document.querySelector('#informationSection');
    infoSection.innerHTML += `<div class="p-1 text-sm bg-blue-50 border border-blue-200 rounded">Auto-filled relation: ${items[0].entity.name}</div>`;
  }
 
if(selectElement.value) displayRelation(panel, selectElement);


}


/*
structure of array that comes from the clipboard:

const relations = [
  {
    as: "relation",
    entity: {
      id: undefined,
      name: "[App 001  How to use the web a...",
      type: "relations",
      item: {
        relation_id: "918aa53f-a957-47b9-a24d-4bd092617291",    relations[0].entity.item.relation_id
        approfile_is_name: "App 001  How to use the web app",
        of_approfile_name: "T&M Test Team",
        rel_description: "Belongs to a group or organization",
        rel_name: "a member",
      }
    },
    meta: { / ... / }
  },
  // second object...
];

*/



function getTemplateHTML() { 
  return `
    <div id="relateDialog" data-form="relateDialog" class="relate-dialog   flex flex-col h-full">
    <!-- INSTRUCTIONS -->
        <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p class="text-sm text-blue-800">
            <strong>How to use:</strong><br>
            1. Uses the [Select] menu to select which relation to break<br>
            2. The names will appear in the text boxes in this mmodule.<br>
            3. The first box shows the appro is.<br>
            4. The middle box shows the relationship.<br>
            5. The bottom box shows the of appro.<br>
            6. IMPORTANT: To break the relationship means that the bridge between them is removed, and not the actual appros.
            The appros continue but without that link between them.
          </p>
        </div>  
    


<div class="section" style="margin-bottom: 24px; border: 1px solid #2a0985; border-radius: 24px; padding: 16px;"  data-action="relate-approfiles-dialogue">        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Unrelate Approfiles 🗑️🖇️</h3>
            <p class="text-sm text-gray-600">Remove a relationship between these approfiles</p>
            <button class="text-gray-500 hover:text-gray-700" data-action="close-dialog" aria-label="Close">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>


         <div class="space-y-2">
              <!--label for="relationSelect" class="block text-sm font-medium text-gray-700">Use [Select] menu to choose relations then this dropdown to load a relation</label-->
              <select id="relationSelect" data-form="relationSelect" class="flex-1 p-2 border border-gray-300 rounded text-sm">
                <option value="">Use the menu [Select] button then this dropdown to select relation</option>
              </select>
            </div>

         <div class="relationship-flow" style="display: flex; justify-content: center; align-items: center; margin: 2rem auto; gap: 1rem;">
            
            <div class="flow-box-other" 
                 style="padding: 0.75rem 1.25rem; background-color: #b8b2db; border: 2px solid #8fa1b3; border-radius: 6px; font-weight: bold; text-align: center; color: #004080; cursor: pointer; hover:bg-purple-400;"
                 id="approIs" >

                  item 1 is
            </div>
         
            <div class="flow-box-relation" style="padding: 0.75rem 1.25rem; background-color: #d7e4e2; border: 2px solid #004080; border-radius: 6px; font-weight: bold; text-align: center; font-size: 16px; font-style: italic; color: #4f46e5;"
              id ="relationship" >
              relationship
            </div>

            <div class="flow-box-other" 
                 style="padding: 0.75rem 1.25rem; background-color: #b8b2db; border: 2px solid #8fa1b3; border-radius: 6px; font-weight: bold; text-align: center; color: #004080; cursor: pointer; hover:bg-purple-400;"
                 id="ofAppro" >
                  of item 3
            </div>          
            
        </div>
 

<div class="relationship-flow" style="display: flex; justify-content: center; align-items: center; margin: 2rem auto; gap: 1rem;">
            <div class="flow-box-other" 
                 style="padding: 0.75rem 1.25rem; background-color: #b8b2db; border: 2px solid #8fa1b3; border-radius: 6px; font-weight: bold; text-align: center; color: #004080; cursor: pointer; hover:bg-purple-400;"
                 data-subject-id="is">
                  item 4 is
            </div>
            <div class="flow-box-relation" style="padding: 0.75rem 1.25rem; background-color: #d7e4e2; border: 2px solid #004080; border-radius: 6px; font-weight: bold; text-align: center; font-size: 16px; font-style: italic; color: #4f46e5;">
              relationship 2
            </div>
            <div class="flow-box-subject" 
                 style="padding: 0.75rem 1.25rem; background-color: #60b494; border: 4px solid #004080; border-radius: 6px; font-weight: bold; text-align: center; color: #004080; cursor: pointer; hover:bg-green-400;"
                 data-subject-id="$">
               of  appro item 5
            </div>
          </div>

          <button type="submit" id="unrelateBtn" data-form="unrelateBtn" 
            class="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled>
            Break Relationship
          </button>
        </div>
 
        <!-- INFORMATION FEEDBACK -->
        <div class="bg-green-100 flex flex-col md:flex-row justify-center gap-4 pt-4 border-t border-gray-200 mt-6">
          <p class="text-lg font-bold">Information:</p>
          <p id="informationFeedback" data-relation="information-feedback"></p>
        </div>
        <div id='informationSection'>Information:</div>
      </div>
    ${petitionBreadcrumbs()} 
  `;
}