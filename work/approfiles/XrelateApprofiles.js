console.log('relateApprofiles.js');
import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';

/*
export function render(panel, query = {}) { //query is not currently used, but may be important for permissions
  console.log('Relate Approfiles  Render(', panel, query,')');
//  panel.innerHTML = "TEST TEST TEST";//working 16:05 3 sept 2025
  panel.innerHTML = getTemplateHTML();
 // attachListeners(panel);

}
*/

// At the top of relateApprofiles.js, after imports
let approfile1Select;
let approfile2Select;
let relationshipSelect;
let relateBtn;
let informationFeedback;


function getTemplateHTML() { console.log('getTemplateHTML()');
  return `
<!--div class="bg-gray-100 font-sans p-8 flex items-center justify-center "-->
<div class="bg-gray-200 font-sans" data-module="relate-approfiles">
  <div class="bg-white rounded-xl shadow-lg     relative w-full h-full  items-center justify-center">
    <h1 class="text-3xl font-bold text-gray-800 text-center mb-6">Establish a New Relationship</h1>
    
    <!-- Main Relationship Cards Container -->
    <div class="flex flex-col md:flex-row items-center justify-between gap-6" data-section="relations">

      <!-- Card 1: 'is' entity -->
      <div id="is-card" data-card-name="is" class="w-full md:w-1/3 min-h-[150px] bg-gray-50 rounded-lg p-6 flex flex-col items-center justify-center text-center border-2 border-transparent transition-all duration-200">
        <h2 id="is-name" class="text-xl font-bold text-gray-700 mb-2">Name</h2>
        <p id="is-description" class="text-sm text-gray-500">Description</p>
      </div>

      <!-- Card 2: Relationship dropdown -->
      <div class="w-full md:w-1/3 flex flex-col items-center justify-center">
        <select id="relationships-dropdown" class="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-blue-500 transition">
          <option value="" disabled selected>Select relationship</option>
          <!-- Options will be populated by JavaScript -->
        </select>
      </div>

      <!-- Card 3: 'of' entity -->
      <div id="of-card" data-card-name="of" class="w-full md:w-1/3 min-h-[150px] bg-gray-50 rounded-lg p-6 flex flex-col items-center justify-center text-center border-2 border-transparent transition-all duration-200">
        <h2 id="of-name" class="text-xl font-bold text-gray-700 mb-2">Name</h2>
        <p id="of-description" class="text-sm text-gray-500">Description</p>
      </div>

    </div>

    <!-- Action Buttons -->
    <div class="mt-8 flex flex-col md:flex-row justify-center gap-4" data-section="buttons">
      <button id="select-is-btn" class="flex-1 py-3 px-6 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition">
        Select 'is'
      </button>
      <button id="confirm-btn" class="flex-1 py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition">
        Confirm
      </button>
      <button id="select-of-btn" class="flex-1 py-3 px-6 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition">
        Select 'of'
      </button>
    </div>

  </div>

  <!-- Modal for selecting entities -->
  <div id="select-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black/80" data-action="close-modal"></div>
    
    <!-- Modal Container -->
    <div class="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 z-10 p-6">
      <h3 id="modal-title" class="text-xl font-semibold text-gray-900 mb-4">Select Entity</h3>
      <div id="modal-list" class="space-y-2 max-h-80 overflow-y-auto">
        <!-- List items will be populated by JavaScript -->
      </div>
      <button data-action="close-modal" class="mt-6 w-full py-3 px-6 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition">
        Cancel
      </button>
    </div>
  </div>
 </div>
</div>`;
}




    // --- Simulated Database Tables ---
    const approfile = [
      { id: 1, name: 'John Smith', description: 'A software engineer at Acme Corp.' },
      { id: 2, name: 'Acme Corp.', description: 'A large multinational technology company.' },
      { id: 3, name: 'Project Atlas', description: 'A secret project to build a new AI model.' },
      { id: 4, name: 'Sarah Miller', description: 'A data scientist on the research team.' },
      { id: 5, name: 'The Marketing Department', description: 'Responsible for all public relations and advertising.' },
    ];

    const relationships = [
      'employee', 'subsidiary', 'parent_company', 'member', 'owner', 'manager', 'task_owner'
    ];
    // --- End of Simulated Database Tables ---

    export function render(panel, query = {}) {
        console.log('realateApprofiles Render(', panel, query, ')');
        panel.innerHTML = getTemplateHTML();
      
        
        const isCard = panel.querySelector('#is-card');
        const ofCard = panel.querySelector('#of-card');
        const isName = panel.querySelector('#is-name');
        const isDescription = panel.querySelector('#is-description');
        const ofName = panel.querySelector('#of-name');
        const ofDescription = panel.querySelector('#of-description');
        const relationshipsDropdown = panel.querySelector('#relationships-dropdown');
        const selectIsBtn = panel.querySelector('#select-is-btn');
        const selectOfBtn = panel.querySelector('#select-of-btn');
        const confirmBtn = panel.querySelector('#confirm-btn');
        const selectModal = panel.querySelector('#select-modal');
        const modalTitle = panel.querySelector('#modal-title');
        const modalList = panel.querySelector('#modal-list');
      
        // State variables
        let selectedIsEntity = null;
        let selectedOfEntity = null;

        approfile1Select = panel.querySelector('[data-form="approfile1Select"]');
        approfile2Select = panel.querySelector('[data-form="approfile2Select"]');
        relationshipSelect = panel.querySelector('[data-form="relationshipSelect"]');
        relateBtn = panel.querySelector('[data-form="relateBtn"]');
        informationFeedback = panel.querySelector('[data-task="information-feedback"]');




      // new 19:17 sept 23 2025  (I also added 'function' as this is not inside a class

      async function populateRelationshipsDropdown() {
        try {
          const relationships = await executeIfPermitted(userId, 'readRelationships');
          
          if (!relationships || relationships.length === 0) {
            throw new Error('No relationships found');
          }
      
          // ✅ Clear existing options
          relationshipSelect.innerHTML = '<option value="" disabled selected>Select relationship</option>';
          
          // ✅ Loop through relationships and add options
          relationships.forEach(rel => {
            const option = document.createElement('option');
            option.value = rel.name; // ✅ Assuming the relationship object has a 'name' property
            option.textContent = rel.name;
            relationshipSelect.appendChild(option);
          });
          
        } catch (error) {
          console.error('Error populating relationships dropdown:', error);
          showToast('Failed to load relationships', 'error');
        }
      }


   function   addClipboardItemsToDropdown(items, selectElement) {
        if (!items || items.length === 0) return;
        
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


// In relateApprofiles.js init()
function populateFromClipboard() {
  const approfiles = getClipboardItems({ type: 'app-human' })
    .concat(getClipboardItems({ type: 'app-task' }))
    .concat(getClipboardItems({ type: 'app-abstract' }));
  
  // Auto-fill if exactly two items
  if (approfiles.length === 2 && !approfile1Select.value && !approfile2Select.value) {
    approfile1Select.value = approfiles[0].entity.id;
    approfile2Select.value = approfiles[1].entity.id;
  }
  
  // Add to dropdowns
  addClipboardItemsToDropdown(approfiles, approfile1Select);
  addClipboardItemsToDropdown(approfiles, approfile2Select);
}
      //end of new



      
        function openModal(cardType) {
          modalList.innerHTML = '';
          modalTitle.textContent = `Select Entity for '${cardType}'`;
      
          approfile.forEach(profile => {
            const listItem = document.createElement('div');
            listItem.classList.add('cursor-pointer', 'p-3', 'rounded-lg', 'border', 'border-gray-200', 'hover:bg-blue-100', 'transition', 'flex', 'flex-col');
            
            const nameEl = document.createElement('h4');
            nameEl.classList.add('font-semibold', 'text-gray-800');
            nameEl.textContent = profile.name;
            
            const descEl = document.createElement('p');
            descEl.classList.add('text-sm', 'text-gray-500');
            descEl.textContent = profile.description;
            
            listItem.appendChild(nameEl);
            listItem.appendChild(descEl);
      
            listItem.addEventListener('click', () => {
              if (cardType === 'is') {
                selectedIsEntity = profile;
                updateIsCard();
              } else {
                selectedOfEntity = profile;
                updateOfCard();
              }
              closeModal();
            });
            modalList.appendChild(listItem);
          });
      
          selectModal.classList.remove('hidden');
        }
      
        function updateIsCard() {
          if (selectedIsEntity) {
            isName.textContent = selectedIsEntity.name;
            isDescription.textContent = selectedIsEntity.description;
            isCard.classList.add('card-selected');
          } else {
            isName.textContent = "Name";
            isDescription.textContent = "Description";
            isCard.classList.remove('card-selected');
          }
        }
      
        function updateOfCard() {
          if (selectedOfEntity) {
            ofName.textContent = selectedOfEntity.name;
            ofDescription.textContent = selectedOfEntity.description;
            ofCard.classList.add('card-selected');
          } else {
            ofName.textContent = "Name";
            ofDescription.textContent = "Description";
            ofCard.classList.remove('card-selected');
          }
        }
      
        function closeModal() {
          selectModal.classList.add('hidden');
        }
      
        function handleConfirm() {
          const relationship = relationshipsDropdown.value;
      
          if (!selectedIsEntity) {
            alert("Please select the 'is' entity first.");
            return;
          }
      
          if (!selectedOfEntity) {
            alert("Please select the 'of' entity first.");
            return;
          }
          
          if (!relationship) {
            alert("Please select a relationship.");
            return;
          }
      
          const logMessage = `${selectedIsEntity.name} IS a '${relationship}' OF ${selectedOfEntity.name}.`;
          console.log(logMessage);
          
          console.log("Simulating database write for this relationship...");
          
          selectedIsEntity = null;
          selectedOfEntity = null;
          updateIsCard();
          updateOfCard();
          
          relationshipsDropdown.value = "";
          
          alert("Relationship confirmed and saved!");
        }
      
        // --- Initialize ---
      
        // Simulated data
        const approfile = [
          { id: 1, name: 'John Smith', description: 'A software engineer at Acme Corp.' },
          { id: 2, name: 'Acme Corp.', description: 'A large multinational technology company.' },
          { id: 3, name: 'Project Atlas', description: 'A secret project to build a new AI model.' },
          { id: 4, name: 'Sarah Miller', description: 'A data scientist on the research team.' },
          { id: 5, name: 'The Marketing Department', description: 'Responsible for all public relations and advertising.' },
        ];
      
        const relationships = [
          'employee', 'subsidiary', 'parent_company', 'member', 'owner', 'manager', 'task_owner'
        ];
      
        // Populate dropdown
      //  populateRelationshipsDropdown();
      
      //new
      populateFromClipboard();


        // Attach event listeners
        selectIsBtn.addEventListener('click', () => openModal('is'));
        selectOfBtn.addEventListener('click', () => openModal('of'));
        confirmBtn.addEventListener('click', handleConfirm);
        
        // Close modal
        panel.querySelectorAll('[data-action="close-modal"]').forEach(btn => {
          btn.addEventListener('click', closeModal);
        });
      }

  