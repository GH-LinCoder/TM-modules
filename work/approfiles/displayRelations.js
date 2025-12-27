// ./work/approfiles/displayRelations.js
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { appState } from '../../state/appState.js';
import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';
import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';
import {  detectContext,resolveSubject, applyPresentationRules} from '../../utils/contextSubjectHideModules.js'

import {getClipboardAppros} from './getClipboardAppros.js';

console.log('displayRelations.js loaded 12:45 Oct 26');

const userId = appState.query.userId;

const defaultId=appState.query.userId;
//const defaultName='default';
let currentSelection=defaultId;


function attachDropdownListener(panel) {
    const select = panel.querySelector('[data-role="subject-dropdown"]'); //change 16:17 Oct 27

  if (!select) return;

  // Check if listener already attached
  if (select.dataset.listenerAttached === 'true') {
   // console.log('Listener already attached, skipping');
    return;
  }

  // Add the listener
  select.addEventListener('change', async (e) => {
   // console.log('DropdownChange,NameFound calling loadAndRender');
    const approfileId = e.target.value;
    const selectedName = e.target.options[e.target.selectedIndex].textContent;
    if (approfileId) { console.log('approfileId:',approfileId); 
      await loadAndRenderRelationships(panel, approfileId, selectedName); 
    } else {
      renderRelationships(panel, null, null); 
    }
  });

  // Mark as attached AFTER successfully adding listener
  select.dataset.listenerAttached = 'true';
//  console.log('Dropdown listener attached');
}

function attachClickItemListener(panel) {
  // ATTACH CLICK LISTENER TO PANEL (persists through re-renders)
  panel.addEventListener('click', async (e) => {
    const flowBox = e.target.closest('.flow-box-subject, .flow-box-other');
    if (flowBox && flowBox.dataset.subjectId) {
      const subjectId = flowBox.dataset.subjectId;
      const subjectName = flowBox.textContent.replace(' is', '').replace('of ', '').trim();
     // console.log('Exploring subject:', subjectId, subjectName);
    //  console.log('FlowBox Clicked - calling laodAndRender');

      await loadAndRenderRelationships(panel, subjectId, subjectName);
    }
  });


}

export function render(panel, query = {}) { //Called from loader (standard interface) 
  console.log('displayRelations.render()', panel, query);
  if (!panel || !panel.isConnected) {
    console.warn('Render target not found or disconnected');
    return;
  }
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
<select data-role="subject-dropdown" class="w-full p-2 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500">

            <option value="">Select an approfile from clipboard...</option>
          </select>
        </div>

        <div id="relationshipsContainer" class="min-h-32">
          <div class="text-gray-500 text-center py-8">
            waiting for database or waiting for you to use [Select] module to choose what to display
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



function showInformation(panel, approName) {
const  informationFeedback = panel.querySelector('informationFeedback');
if(!informationFeedback) return;
  informationFeedback.innerHTML += `<div class="my-2 p-3 bg-white border rounded shadow-sm flex items-center justify-between">
        <div>
          <div class="font-medium">${approName}</div>
          
        </div>
      </div>
    `
  }
 
/*
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
    const dropdownContainer = panel.querySelector('[data-role="subject-dropdown"]')?.closest('div');
    const instructions = panel.querySelector('[data-action="selector-dialogue"]');
    if (isMyDash) {
      if (dropdownContainer) dropdownContainer.style.display = 'none';
      if (instructions) instructions.style.display = 'none';
    } //else {
     // if (dropdownContainer) dropdownContainer.style.display = '';
    //  if (instructions) instructions.style.display = '';
    //}
    
  } */
//moved the above to own file 16:47 Oct 27


async  function init(panel) { // called from render() 2nd function to run
    console.log('init()');

    const isMyDash = detectContext(panel);
    applyPresentationRules(panel, isMyDash);
  
    const subject = await resolveSubject();
    console.log('subject',subject);
    if(subject.type==='relation') 
    loadFromRelations(panel, subject.id); 
    else
    loadAndRenderRelationships(panel, subject.id, subject.name);
  
    onClipboardUpdate(() => {
checkClipboardThenNormalRender(panel);
//      loadAndRenderRelationships(panel,subject.id, subject.name);
     // if (!isMyDash) populateApprofileSelect(panel); // optional
    });
  
    if (!isMyDash) {
      populateApprofileSelect(panel);
      attachDropdownListener(panel);
      attachClickItemListener(panel); //allows click on the display to change subject of display
    }
  }
    
async function checkClipboardThenNormalRender(panel){
const subject = await resolveSubject();
      loadAndRenderRelationships(panel,subject.id, subject.name);

}


function loadFromRelations(panel, subjectId){
//needs to display the one relation referred to.
console.log('needs to display the one relation referred to');

}

async function populateApprofileSelect(panel) {

  const approfiles = getClipboardAppros();//replaced 19:45 Nov 27
  /*
  const approfiles = getClipboardItems({ type: 'app-human' })
    .concat(getClipboardItems({ type: 'app-task' }))
    .concat(getClipboardItems({ type: 'app-abstract' }));
  */
console.log('populateappro select()');

  const select = panel.querySelector('[data-role="subject-dropdown"]');
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
 if(!approfileId) {
  const approfile = await resolveSubject(); approfileId=approfile.id, approfileName = approfile.name; 
console.log('subject',approfile);

  if(approfile.type ==='relations') loadFromRelations(panel, approfile.id); return};// should render the one relationship


  console.log('loadAndRenderRelationships approfileId()');

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
  
//console.log('Raw result:', result);// object { is:[] , of:[] , iconMap:{} }
  return result || { is: [], of: [], iconMap:{} };
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
  const iconMap = relationshipsData.iconMap || {};
  //console.log('isRel:',isRelationships, 'array[0].approfile_is:', isRelationships[0]?.approfile_is);

  if (isRelationships.length === 0 && ofRelationships.length === 0) {
    container.innerHTML = `
      <div class="bg-yellow-50 border border-yellow-200 rounded p-4 text-center">
        <p class="text-yellow-800">No relationships found for this approfile.</p>
        <p class="text-gray-500 text-center py-8">"<i>${approfileName}</i>"</p>
  
        <p class="text-yellow-800">No one is an island; you can use Create a Relationship to connect this lonely appro.</p>
      </div>
    `;
    return;
  }
  
  // Group and sort relationships by type (alphabetically)
  const groupRelationships = (rels) => {
    const groups = {};
    rels.forEach(rel => {
       if (rel.is_deleted) { //console.log('This:',rel.relationship,'is deleted', rel.is_deleted); 
        return; }//don't display deleted items
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
          ${approfileName}  is
        </div>
    `;
    
    groupedIs.forEach(group => {
      html += `
        <div class="relationship-type" style="font-size: 16px; font-weight: bold; margin-bottom: 4px; color: #4f46e5; padding-bottom: 4px;">
          ${group.relationship}
        </div>
      `;
      
      group.items.forEach(rel => { //console.log('rel:',rel);
     //  console.log('forEach rel.is_deleted:',rel.relationship, rel.is_deleted); 
       if (rel.is_deleted) { console.log('This:',rel.relationship,'is deleted', rel.is_deleted); 
        return; }//don't display deleted items
       const subject = rel.approfile_is_name || rel.approfile_is;
       const subjectIcon = iconMap[rel.approfile_is] || '🫗';

        const object = rel.of_approfile_name || rel.of_approfile;
        const objectIcon = iconMap[rel.of_approfile] || '🫗';
        html += `
          <div class="relationship-flow" style="display: flex; justify-content: center; align-items: center; margin: 2rem auto; gap: 1rem;">
            <div class="flow-box-subject" 
                 style="padding: 0.75rem 1.25rem; background-color: #60b494; border: 4px solid #004080; border-radius: 6px; font-weight: bold; text-align: center; color: #004080; cursor: pointer; hover:bg-green-400;"
                 data-subject-id="${rel.approfile_is}"
                 title="Click to explore ${subject}">
            ${subjectIcon}  ${subject}  is
            </div>
            <div class="flow-box-relation" style="padding: 0.75rem 1.25rem; background-color: #d7e4e2; border: 2px solid #004080; border-radius: 6px; font-weight: bold; text-align: center; font-size: 16px; font-style: italic; color: #4f46e5;">
              ${rel.relationship}
            </div>
            <div class="flow-box-other" 
                 style="padding: 0.75rem 1.25rem; background-color: #b8b2db; border: 2px solid #8fa1b3; border-radius: 6px; font-weight: bold; text-align: center; color: #004080; cursor: pointer; hover:bg-purple-400;"
                 data-subject-id="${rel.of_approfile}"
                 title="Click to explore ${object}">
              of ${object} ${objectIcon}
            </div>

          </div>
        `;
      });
    }); 
    html += ` </div>`;
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
      
      group.items.forEach(rel => { //if deleted the section name is displayed still 19:23 dec 13
         if (rel.is_deleted) { console.log('This:',rel.relationship,'is deleted', rel.is_deleted); 
          return; }//don't display deleted items
        const subject = rel.approfile_is_name || rel.approfile_is;
        const subjectIcon = iconMap[rel.approfile_is] || '🫗';
        const object = rel.of_approfile_name || rel.of_approfile;
        const objectIcon = iconMap[rel.of_approfile] || '🫗';

        html += `
          <div class="relationship-flow" style="display: flex; justify-content: center; align-items: center; margin: 2rem auto; gap: 1rem;">
            <div class="flow-box-other" 
                 style="padding: 0.75rem 1.25rem; background-color: #b8b2db; border: 2px solid #8fa1b3; border-radius: 6px; font-weight: bold; text-align: center; color: #004080; cursor: pointer; hover:bg-purple-400;"
                 data-subject-id="${rel.approfile_is}"
                 title="Click to explore ${subject}">
                 ${subjectIcon} ${subject} is
            </div>
            <div class="flow-box-relation" style="padding: 0.75rem 1.25rem; background-color: #d7e4e2; border: 2px solid #004080; border-radius: 6px; font-weight: bold; text-align: center; font-size: 16px; font-style: italic; color: #4f46e5;">
              ${rel.relationship}
            </div>
            <div class="flow-box-subject" 
                 style="padding: 0.75rem 1.25rem; background-color: #60b494; border: 4px solid #004080; border-radius: 6px; font-weight: bold; text-align: center; color: #004080; cursor: pointer; hover:bg-green-400;"
                 data-subject-id="${rel.of_approfile}"
                 title="Click to explore ${object}">
              of  ${object} ${objectIcon}
            </div>

            </div>
        `;
      });
    });
    html += `</div>`;
  }
  showInformation(panel, approfileName);

  container.innerHTML = html;

  

}

