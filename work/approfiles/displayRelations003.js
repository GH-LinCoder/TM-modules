// ./work/approfiles/displayRelations.js
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { appState } from '../../state/appState.js';
import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';
import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';
console.log('displayRelations.js loaded 12:45 Oct 26');

const userId = appState.query.userId;

const defaultId=appState.query.userId;
const defaultName='default';
let currentSelection=defaultId;


function attachDropdownListener(panel) {
  const select = panel.querySelector('#approfileSelect');
  if (!select) return;

  // Check if listener already attached
  if (select.dataset.listenerAttached === 'true') {
    console.log('Listener already attached, skipping');
    return;
  }

  // Add the listener
  select.addEventListener('change', async (e) => {
    console.log('DropdownChange,NameFound calling loadAndRender');
    const approfileId = e.target.value;
    const selectedName = e.target.options[e.target.selectedIndex].textContent;
    if (approfileId) { console.log('approfileId:',approfileId); 
      await loadAndRenderRelationships(panel, approfileId, selectedName); //what is 'dropdown - the function doesn't accept a 4th arg
    } else {
      renderRelationships(panel, null, null); //what was 'dropdown - the function doesn't accept a 4th arg Deleted 15:30 Oct 27
    }
  });

  // Mark as attached AFTER successfully adding listener
  select.dataset.listenerAttached = 'true';
  console.log('Dropdown listener attached');
}



export function render(panel, query = {}) {
  console.log('displayRelations.render()', panel, query);
  panel.innerHTML = getTemplateHTML();
  init(panel, query);
      //    panel.innerHTML+=petitionBreadcrumbs();//this reads 'petition' and prints the values at bottom of the render panel
}

function getTemplateHTML() {
  return `

    <div  class="edit-task-dialogue relative z-10 flex flex-col h-full" data-destination="new-panel">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 z-10 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-xl font-semibold text-gray-900">Display Relations 🖇️  20:50 Oct 23</h3>
          <button data-action="close-dialog" class="text-gray-500 hover:text-gray-700" aria-label="Close">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>




          <div class="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200" data-action="selector-dialogue">
            <h4 class="font-medium text-blue-800 mb-2">Instructions:</h4>
            <p class="text-blue-700 text-sm">
              Select an approfile from your clipboard below.
            </p>
            <ul class="text-blue-700 text-sm mt-2 space-y-1">
              <li>• You can view how any one appro is related to others</li>
              <li>• You will probably need to click to open the [Select] module</li>
              <li>• Then the dropdown will fill with whatever you select in that module</li>
              <li>If the slection has already been made then the dropdown Auto-fills from the clipboard.</li>
              <li> Click the [Select] menu button or click here to open the Selector</li>
            </ul>
          </div>



      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">loadAndRenderRelationships
            Select Approfile:
          </label>
          <select id="approfileSelect" class="w-full p-2 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500">
            <option value="">Select an approfile from clipboard...</option>
          </select>
        </div>

        <div id="relationshipsContainer" class="min-h-32">
          <div class="text-gray-500 text-center py-8">
            No approfile selected. Please select an approfile.
          </div>
        </div>
      </div>
    </div>

        <!-- INFORMATION FEEDBACK -->
        <div class="bg-green-100 flex flex-col md:flex-row justify-center gap-4 pt-4 border-t border-gray-200 mt-6">
          <p class="text-lg font-bold">Information:</p>
          <p id="informationFeedback" data-task="information-feedback"></p>
        </div>
      </div>


    ${petitionBreadcrumbs()} 
  `;
}



/*
async function init(panel, query) {
  console.log('displayRelations.init()');
//set defualt values if nothing else used


  //////////  myDASH change behaviour  // data-module='myDash' is in the myDash HTML
const moduleContext = panel.closest('[data-module]')?.dataset.module || 'standalone';// standalone?? what is that? - never used
const isMyDash = moduleContext === 'myDash';
console.log('moduleContext:', moduleContext);
if (isMyDash) {
    const instructions = panel.querySelector('[data-action="selector-dialogue"]');
    const dropdownContainer = panel.querySelector('#approfileSelect')?.closest('div');
    if (instructions) instructions.style.display = 'none';
    if (dropdownContainer) dropdownContainer.style.display = 'none';
  }
  else console.log('not myDash');
  // Initialize with empty state
  renderRelationships(panel, null, null);
  
  // Load approfiles from clipboard
  const approfileLength= populateApprofileSelect(panel);
if (isMyDash && approfileLength<1){loadAndRenderRelationships(panel,defaultId,defaultName);}
  
  // Listen for clipboard updates
  onClipboardUpdate(() => {
    populateApprofileSelect(panel);
  });
  
  // ATTACH CLICK LISTENER TO PANEL (persists through re-renders)
  panel.addEventListener('click', async (e) => {
    const flowBox = e.target.closest('.flow-box-subject, .flow-box-other');
    if (flowBox && flowBox.dataset.subjectId) {
      const subjectId = flowBox.dataset.subjectId;
      const subjectName = flowBox.textContent.replace(' is', '').replace('of ', '').trim();
     // console.log('Exploring subject:', subjectId, subjectName);
      console.log('FlowBox Clicked - calling laodAndRender');

      await loadAndRenderRelationships(panel, subjectId, subjectName);
    }
  });
//  if (isMyDash))
  panel.querySelector('[data-action="close-dialog"]')?.addEventListener('click', () => panel.remove());
 // Handle approfile selection from dropdown 
 attachDropdownListener(panel);

 informationFeedback = panel.querySelector('#informationFeedback');

}
*/

function showInformation(approName) {
  informationFeedback.innerHTML += `<div class="my-2 p-3 bg-white border rounded shadow-sm flex items-center justify-between">
        <div>
          <div class="font-medium">${approName}</div>
          
        </div>
      </div>
    `
  }


  // new functions to find data - these should be in external file to be imported by each module
  function detectContext(panel) {
    let context = panel.closest('[data-module]')?.dataset.module === 'myDash'
    console.log('context', context);
    return context;

  }

  function resolveSubject() {
    const clipboardItems = getClipboardItems(); // no type filter
    console.log('clipboardItems', clipboardItems);
  
    if (clipboardItems.length > 0) {
      const entity = clipboardItems[0].entity;
      return {
        id: entity.id,
        name: entity.name || entity.id // fallback to ID if name is missing
      };
    }
  
    return {
      id: appState.query.userId,
      name: appState.query.userName // or use appState.query.userName if available
    };
  }
  

  function applyPresentationRules(panel, isMyDash) {
    const dropdownContainer = panel.querySelector('#approfileSelect')?.closest('div');
    const instructions = panel.querySelector('[data-action="selector-dialogue"]');
    if (isMyDash) {
      if (dropdownContainer) dropdownContainer.style.display = 'none';
      if (instructions) instructions.style.display = 'none';
    } //else {
     // if (dropdownContainer) dropdownContainer.style.display = '';
    //  if (instructions) instructions.style.display = '';
    //}
    
  }

  function init(panel) {
    const isMyDash = detectContext(panel);
    applyPresentationRules(panel, isMyDash);
  
    const subject = resolveSubject();
    console.log('subjectId', subject.id);
    loadAndRenderRelationships(panel, subject.id, subject.name);
  
    onClipboardUpdate(() => {
      const updatedSubject = resolveSubject();
      loadAndRenderRelationships(panel, updatedSubject.id, updatedSubject.name);
      if (!isMyDash) populateApprofileSelect(panel); // optional
    });
  
    if (!isMyDash) {
      populateApprofileSelect(panel);
      attachDropdownListener(panel);
    }
  }
    


async function populateApprofileSelect(panel) {
  const approfiles = getClipboardItems({ type: 'app-human' })
    .concat(getClipboardItems({ type: 'app-task' }))
    .concat(getClipboardItems({ type: 'app-abstract' }));
  
console.log('length:',approfiles.length);

  const select = panel.querySelector('#approfileSelect');
  if (!select) {currentSelection = defaultId } // previously return    changed 12:00 Oct 27
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
    await loadAndRenderRelationships(panel, approfiles[0].entity.id, approfiles[0].entity.name);
  }
  attachDropdownListener(panel);

  return approfiles.length

}

async function loadAndRenderRelationships(panel, approfileId, approfileName) {  // aprofileId is an object ?
 
  console.log('loadAndRenderRelationships approfileId:',approfileId, 'name', approfileName);
  try {
    const relationships = await loadRelationships(approfileId);
    renderRelationships(panel, relationships, approfileName);
  } catch (error) {
    console.error('Error loading relationships:', error);
    showToast('Failed to load relationships: ' + error.message, 'error');
    renderRelationships(panel, { is: [], of: [] }, approfileName);
  }
  
}

async function loadRelationships(approfileId) {
  console.log('loadRelationships for approfileId:', approfileId);
  
  if (!approfileId) {
    throw new Error('approfileId is required');
  }
  
  const result = await executeIfPermitted(userId, 'readApprofileRelationships', { 
    approfileId: approfileId 
  });
  
//  console.log('Raw result:', result);
  return result || { is: [], of: [] };
}

function renderRelationships(panel, relationshipsData, approfileName) { // aprofileName is used at head of the display.
  const container = panel.querySelector('#relationshipsContainer');
  if (!container) return;

  // Handle case where no approfile is selected
  if (relationshipsData === null || approfileName === null) {
    container.innerHTML = `
      <div class="text-gray-500 text-center py-8">
        No approfile selected. Please select an approfile.
      </div>
    `;
    return;
  }
  
  const isRelationships = relationshipsData.is || [];
  const ofRelationships = relationshipsData.of || [];
  
  if (isRelationships.length === 0 && ofRelationships.length === 0) {
    container.innerHTML = `
      <div class="bg-yellow-50 border border-yellow-200 rounded p-4 text-center">
        <p class="text-yellow-800">No relationships found for this approfile.</p>
        <p class="text-yellow-800">No one is an island; you can use Create a Relationship to connect this lonely appro.</p>
      </div>
    `;
    return;
  }
  
  // Group and sort relationships by type (alphabetically)
  const groupRelationships = (rels) => {
    const groups = {};
    rels.forEach(rel => {
      const relType = rel.relationship;
      if (!groups[relType]) groups[relType] = [];
      groups[relType].push(rel);
    });
    
    // Sort relationship types alphabetically
    return Object.keys(groups)
      .sort()
      .map(relType => ({
        relationship: relType,
        items: groups[relType]
      }));
  };
  
  const groupedIs = groupRelationships(isRelationships);
  const groupedOf = groupRelationships(ofRelationships);
  
  let html = '';
  
  // IS SECTION
  // Always show IS section (even if empty)
  if (groupedIs.length  === 0){
html += `
<div class="section" style="margin-bottom: 24px; border: 1px solid #2a0985; border-radius: 24px; padding: 16px;"  data-action="relate-approfiles-dialogue">
  <div class="section-title" style="font-size: 18px; font-weight: bold; margin-bottom: 8px; color: #374151; text-align: center;">
    ${approfileName} is EMPTY no example of what this appro "is" 🏝️
  </div><p style ="text-align: center;">No one is an island;you can use click to relate this lonely appro.</p>
  </div>
`};
  
  if (groupedIs.length > 0) {
    html += `
      <div class="section" style="margin-bottom: 24px; border: 1px solid #2a0985; border-radius: 24px; padding: 16px;">
        <div class="section-title" style="font-size: 18px; font-weight: bold; margin-bottom: 8px; color: #374151; text-align: center;">
          ${approfileName} is
        </div>
    `;
    
    groupedIs.forEach(group => {
      html += `
        <div class="relationship-type" style="font-size: 16px; font-weight: bold; margin-bottom: 4px; color: #4f46e5; padding-bottom: 4px;">
          ${group.relationship}
        </div>
      `;
      
      group.items.forEach(rel => {
        const subject = rel.approfile_is_name || rel.approfile_is;
        const object = rel.of_approfile_name || rel.of_approfile;
        html += `
          <div class="relationship-flow" style="display: flex; justify-content: center; align-items: center; margin: 2rem auto; gap: 1rem;">
            <div class="flow-box-subject" 
                 style="padding: 0.75rem 1.25rem; background-color: #60b494; border: 4px solid #004080; border-radius: 6px; font-weight: bold; text-align: center; color: #004080; cursor: pointer; hover:bg-green-400;"
                 data-subject-id="${rel.approfile_is}"
                 title="Click to explore ${subject}">
              ${subject} is
            </div>
            <div class="flow-box-relation" style="padding: 0.75rem 1.25rem; background-color: #d7e4e2; border: 2px solid #004080; border-radius: 6px; font-weight: bold; text-align: center; font-size: 16px; font-style: italic; color: #4f46e5;">
              ${rel.relationship}
            </div>
            <div class="flow-box-other" 
                 style="padding: 0.75rem 1.25rem; background-color: #b8b2db; border: 2px solid #8fa1b3; border-radius: 6px; font-weight: bold; text-align: center; color: #004080; cursor: pointer; hover:bg-purple-400;"
                 data-subject-id="${rel.of_approfile}"
                 title="Click to explore ${object}">
              of ${object}
            </div>
          </div>
        `;
      });
    });
    html += `</div>`;
  }
  
  // OF SECTION

  if (groupedOf.length  === 0){
    html += `
    <div class="section" style="margin-bottom: 24px; border: 1px solid #2a0985; border-radius: 24px; padding: 16px;" data-action="relate-approfiles-dialogue">
      <div class="section-title" style="font-size: 18px; font-weight: bold; margin-bottom: 8px; color: #374151; text-align: center;">
        ${approfileName} is EMPTY no example of anything being "of" this appro
      </div><p style ="text-align: center;">No one is an island; 🏝️ you can use Click to relate this lonely appro.</p>
      </div>
    `};


  if (groupedOf.length > 0) {
    html += `
      <div class="section" style="margin-bottom: 24px; border: 1px solid #2a0985; border-radius: 24px; padding: 16px;">
        <div class="section-title" style="font-size: 18px; font-weight: bold; margin-bottom: 8px; color: #374151; text-align: center;">
          of ${approfileName}
        </div>
    `;
    
    groupedOf.forEach(group => {
      html += `
        <div class="relationship-type" style="font-size: 16px; font-weight: bold; margin-bottom: 4px; color: #4f46e5; padding-bottom: 4px;">
          ${group.relationship}
        </div>
      `;
      
      group.items.forEach(rel => {
        const subject = rel.approfile_is_name || rel.approfile_is;
        const object = rel.of_approfile_name || rel.of_approfile;
        html += `
          <div class="relationship-flow" style="display: flex; justify-content: center; align-items: center; margin: 2rem auto; gap: 1rem;">
            <div class="flow-box-other" 
                 style="padding: 0.75rem 1.25rem; background-color: #b8b2db; border: 2px solid #8fa1b3; border-radius: 6px; font-weight: bold; text-align: center; color: #004080; cursor: pointer; hover:bg-purple-400;"
                 data-subject-id="${rel.approfile_is}"
                 title="Click to explore ${subject}">
              ${subject} is
            </div>
            <div class="flow-box-relation" style="padding: 0.75rem 1.25rem; background-color: #d7e4e2; border: 2px solid #004080; border-radius: 6px; font-weight: bold; text-align: center; font-size: 16px; font-style: italic; color: #4f46e5;">
              ${rel.relationship}
            </div>
            <div class="flow-box-subject" 
                 style="padding: 0.75rem 1.25rem; background-color: #60b494; border: 4px solid #004080; border-radius: 6px; font-weight: bold; text-align: center; color: #004080; cursor: pointer; hover:bg-green-400;"
                 data-subject-id="${rel.of_approfile}"
                 title="Click to explore ${object}">
              of ${object}
            </div>
          </div>
        `;
      });
    });
    html += `</div>`;
  }
  showInformation(approfileName);

  container.innerHTML = html;

  

}

