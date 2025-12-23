// ./work/task/taskSummaryRender.js
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { appState } from '../../state/appState.js';
import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';
import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';
//import {icons} from '../../registry/iconList.js';

console.log('taskSummaryRender.js loaded');
const state = {
  user: appState.query.userId,
  currentTask: null,
  currentTaskId: null, //different to editSurvey
  //questions: [], //only used in edit Survey.
  //answer:[], //only in edit survey
  steps: [],
  currentStepId: null,   //
  currentStepOrder: null, // optional, but helpful
  //currentItemType, //in surveys to tell questions from answers and header
  currentAutomationId: null, //added 22:57 Nov 29
  initialStepId: null
};
let stepOrder = null;
let stepId = null; // was on line 705 used for no obvious reason to replaced 'initialStepId'
// used lines 549, 1256, 1273 but always   as =stepId so always null !

export async function render(panel, query = {}) {
  console.log('editTask.render:', panel, query);
  panel.innerHTML = getTemplateHTML();
  // Initialize clipboard integration
 // initClipboardIntegration(panel);
 attachListeners(panel);
  

// state.currentTask = await readTaskFromDb('05f6efe7-376f-434d-86a5-0877d624bd05');

// state.currentTask = await readTaskFromDb('abc9ae7f-5948-4079-862c-eaa73053f0ce');

 initClipboardIntegration(panel);
//await loadAndDisplay(panel, 'abc9ae7f-5948-4079-862c-eaa73053f0ce');
//console.log ('task',state.currentTask);  //array equal to number of steps maybe?
/*
each element repeats the header details + have a step associated? includes step 1 & tep 2
so array[0] is abandonded
array[1] is completed
array[2] is step 3

*/ 
  //renderTaskStructure(panel); 
  //initClipboardIntegration(panel);
}

async function loadAndDisplay(panel, taskId){
state.currentTask = await readTaskFromDb(taskId);
console.log ('taskId', taskId,'task',state.currentTask);  //array equal to number of steps maybe?

  renderTaskStructure(panel); 
 

}



///// CLIPBOARD AWARE ////

function initClipboardIntegration(panel) {
    console.log('initClipboardIntegration()');
  // Check clipboard immediately
  populateFromClipboard(panel);
  // Listen for future changes
  onClipboardUpdate(() => {
    populateFromClipboard(panel);
  
  });
}

function ifOnlyOneItemInDropdownloadAndRenderSurvey(panel, tasks, taskSelect){
console.log('ifonlyOneItem...');
  if (tasks.length === 1 && !taskSelect.value) {
    const taskId =  tasks[0].entity.id;
    taskSelect.value = taskId;
    const infoSection = document.querySelector('#informationSection');
    if(infoSection) infoSection.innerHTML += `<div class="p-1 text-sm bg-blue-50 border border-blue-200 rounded">Auto-filled Survey: ${tasks[0].entity.name}</div>`;
  //  console.log('surveySelect.value',surveySelect.value);//uuid
    //state.currentTaskHeaderId = taskSelect.value;
console.log('taskId',taskId);
    loadAndDisplay(panel, taskId)// this displays summary if/when there is a single item in the dropdown
    //but no display of new task 13:19 Dec 14 - it is displaying it appending to previous summary.
    //need to reset to ''
    }
}




function populateFromClipboard(panel) {
  // Get items from clipboard (adjust type/as as needed)
  const items = getClipboardItems({ as: 'task', type: 'tasks' });
    if (items.length === 0) return;
  
  const taskSelect = panel.querySelector('#taskSelect');
  if(!taskSelect) return;
  addClipboardItemsToDropdown(items, taskSelect);

  ifOnlyOneItemInDropdownloadAndRenderSurvey(panel, items, taskSelect)


}

function addClipboardItemsToDropdown(items, selectElement) {
    console.log('addClipboardItemsToDropdown()');
  if (!items || items.length === 0) return;
  
  items.forEach(item => {
    const existingOption = Array.from(selectElement.options).find(opt => opt.value === item.entity.id);
    if (!existingOption) {
      const option = document.createElement('option');
      option.value = item.entity.id;
      option.textContent = `${item.entity.name}`;
      option.dataset.source = 'clipboard';
      selectElement.appendChild(option);
    }
  });
}





/// eof clipboard


async function readTaskFromDb(taskId){
     try {console.log('readTaskFromDb', taskId);
      //func needs: const { task_header_id } = payload;

    const task = await executeIfPermitted(state.user, 'readTaskWithSteps', {
     task_header_id :  taskId
    });
    return task;
  } catch (error) {
    console.error('Failed to read task from db:', error);
    showToast('Could not read db', 'error');
  }
}
/*
function loadHeaderIntoDisplay(panel,clickedHeaderId){//clicked is the id uuid
  console.log('loadHeaderIntoDisplay() clickedHeaderId:', clickedHeaderId, 'typeof:', typeof clickedHeaderId);
  //console.log('steps length:', Array.isArray(state.steps) ? state.steps.length : 'not array');
 // console.log('available ids of all the steps:', (state.steps || []).map(s => s.id));
  state.currentHeaderId = clickedHeaderId; //the card that was clicked sets the current step.
console.log('state.currentHeaderId:',state.currentHeaderId); // should be == clickedHeaderId
const header = state.currentTask[0];

//Task just has steps, but the module for editSurvey has to find if questions or answers, but task just has steps

  
    // Fill form with task data
    panel.querySelector('#taskName').value = header.task_name || '';
    panel.querySelector('#taskDescription').value = header.task_description || '';
    panel.querySelector('#taskUrl').innerHTML = header.task_external_url;
panel.querySelector('#taskNameCounter').textContent = `${header.task_name.length}/64 characters`;
panel.querySelector('#taskDescriptionCounter').textContent = `${header.task_description.length}/64 characters`;

    console.log('Form filled with step data');

}

*/
/*
function loadStepIntoDisplay(panel,clickedStepId){//clicked is the id uuid
  console.log('loadStepIntoDisplay() clickedStepId:', clickedStepId, 'typeof:', typeof clickedStepId);
  //console.log('steps length:', Array.isArray(state.steps) ? state.steps.length : 'not array');
 // console.log('available ids of all the steps:', (state.steps || []).map(s => s.id));
  state.currentStepId = clickedStepId; //the card that was clicked sets the current step.
console.log('state.currentStepId:',state.currentStepId); // should be == clickedStepId


//Task just has steps, but the module for editSurvey has to find if questions or answers, but task just has steps

const step = state.currentTask.find(s => s.step_id === clickedStepId); //extract this steps data from the array of al the steps data
  console.log('Looking for clickedStepId:', clickedStepId, 'in', state.currentTask, 'step:', step);// that array is empty 22:21 dec 14
  
  if (step) { stepOrder = step.step_order;  console.log('stepOrder:', step.step_order); // undefined 23:07 24 Nov
    // Fill form with step data
    panel.querySelector('#stepName').value = step.step_name || '';
    panel.querySelector('#stepDescription').value = step.step_description || '';
    panel.querySelector('#stepUrl').value = step.step_external_url || '';
    panel.querySelector('#stepOrder').value = stepOrder; // Ensure this is set

panel.querySelector('#stepNameCounter').textContent = `${step.step_name.length}/64 characters`;
panel.querySelector('#stepDescriptionCounter').textContent = `${step.step_description.length}/64 characters`;

    console.log('Form filled with step data');
} else{console.log('Was it the header that was clicked?'); }
}

*/

//attach listener to dropdown

function attachListeners(panel){
  console.log('attachDropdownListeners()');
const  taskSelect = panel.querySelector('#taskSelect');

    taskSelect?.addEventListener('change', (e) => {
      const selectedId = e.target.value;
console.log('selectedItem',selectedId);//logs 12:30 dec 15
loadAndDisplay(panel, selectedId)
    });

}




// Attach listeners to the summary panel
function attachStepsListeners(panel) {
  console.log('attachStepsListeners()');

  panel.addEventListener('click', (e) => {
    const target = e.target.closest(
      '.clickable-step'
    );
    if (!target) return;
//console.log('steps listener event:', target); // responds
   // const saveBtn = panel.querySelector('#saveTaskBtn');
    // Save button optional; do not hard-depend on it to load the editor
  //  const sectionToView = panel.querySelector('#editSectionLabel'); // optional status label

    if (target.classList.contains('clickable-step')) {
      
      const clickedStepId = target.dataset.stepId; // is this an id or a DOM element?
      state.currentStepId = clickedStepId; //display only marks the step as clicked there is no other function
      
//      console.log('target.dataset',target.dataset); 
      //if step_oder =0 it's the header dec 14
      
      //stepOrder is never set??? Dec 6
     // panel.querySelector('#stepOrder').value = stepOrder; // Ensure this is set to a number not an id
     // if (saveBtn) { saveBtn.textContent = 'Edit step'; saveBtn.disabled = false; }
    //  if (sectionToEditEl) sectionToEditEl.textContent = 'step';
    /*
    if(target.dataset.stepOrder)loadHeaderIntoDisplay(panel, clickedStepId);//not 23:17 dec 14
    else if(target.dataset.stepId) loadStepIntoDisplay(panel, clickedStepId); // ok dec 14
    else console.log('Error in header or card');
*/
      markActiveStepInSummary(panel);
    //  hideAutomationsUI(panel);

    } else if (target.classList.contains('clickable-automation')) {
      const clickedStepId = target.dataset.stepId;
      const automationId = target.dataset.automationId;
      state.currentStepId = clickedStepId;
      state.currentAutomationId = automationId;
     // if (saveBtn) { saveBtn.textContent = 'Manage automations'; saveBtn.disabled = false; }
     // if (sectionToEditEl) sectionToEditEl.textContent = 'automation';
     

    } //else if (target.classList.contains('deleteAutomationBtn')) {
      
    //  console.log('Clicked the:',target.textContent);
    //  const automationId = target.dataset.id;
     
     // if(target.textContent ==   'Click to confirm Delete this automation') {handleDeleteAutomationButton(panel, automationId)}
     // else target.textContent = 'Click to confirm Delete this automation' ;

   // } else if (target.id === 'addStepBtn') {
    //  handleAddStep(panel);
    //}
  });

  
}


function renderTaskHeaderCard(list, taskData) {
    console.log('renderTaskHeaderCard()');
  if (!taskData) return;

list.innerHTML=''; // there may be a previous task displayted in the list

  //const summary = panel.querySelector('#surveySummary');
  //if (!summary) return;
const header = taskData[0];
  const card = document.createElement('div');
   card.dataset.stepOrder='0';//steps start at a stepOrder of 1. 0 being used to say 'header'
   //   card.dataset.taskId = task.id;//copied not tested dec 6
   //  card.dataset.type = 'header'; //copied not tested  dec 6
   // card.className = styleCardByType('survey');
  card.className = 'clickable-step hover:scale-105 transition-transform bg-orange-50 border-l-4 border-orange-400 rounded-lg p-3 mb-2 shadow-sm hover:shadow-md';
  card.innerHTML = `
    <strong>Task: ${header.task_name}</strong>
      ${header.task_description ? `<div class="text-sm text-gray-700  whitespace-pre-line">${header.task_description }</div>` : ''}
 ${header.task_external_url ? `<div class="text-xs text-blue-600">${header.task_external_url}</div>` : ''}
  `;


  
  list.appendChild(card);
  console.log('name, description etc',header);
}


function renderStepCard(summary,step){
console.log('renderStepCard()');
const stepId = step.step_id;
const stepOrder = step.step_order;
const stepName = step.step_name;
const stepDescription = step.step_description;
const stepUrl = step.step_external_url;
    const stepCard = document.createElement('p');
    //edit survey has 'type' here  
    stepCard.className = 'clickable-step hover:scale-105 transition-transform bg-blue-50 border-l-4 border-blue-400 rounded-lg p-3 mb-2 shadow-sm hover:shadow-md ml-2';
    stepCard.dataset.stepId = stepId;//stepId? Never has a value.was and is null. 
    stepCard.innerHTML = `
      <strong>Step ${stepOrder}:</strong> ${stepName}
      <div class="block text-sm text-gray-600 whitespace-pre-line">${stepDescription || ''}</div>
      ${stepUrl ? `<div class="text-xs text-blue-600">${stepUrl}</div>` : ''}
    `;

    summary.appendChild(stepCard);
}


function markActiveStepInSummary(panel) {
    console.log('markActiveStepInSummary()');
  panel.querySelectorAll('.clickable-step').forEach(el => {
    console.log('el.dataset.stepId',el.dataset.stepId, 'currentStepId',state.currentStepId);
    el.classList.toggle('ring-4', el.dataset.stepId === String(state.currentStepId));
    el.classList.toggle('ring-blue-500', el.dataset.stepId === String(state.currentStepId));
    el.classList.toggle('bg-blue-100', el.dataset.stepId === String(state.currentStepId));
  });
}


function renderTaskStructure(panel) {
    console.log('renderTaskStructure()');
  const summaryEl = panel.querySelector('#taskSummary');
  if (!summaryEl) return;
const task = state.currentTask;//14:00 Dec 21 almost all null
console.log('renderTaskStructure()-state:', state, 'stepOrder:', stepOrder, 'stepId',stepId);

  //summaryEl.innerHTML = '<h3>Summary:</h3><br>';
    renderTaskHeaderCard(summaryEl,task); //renders 21:30 dec 14

//sort the array by sortOrder so that the steps are listed form 1,2,3... n
if(!task) return; //perhaps the dropdown has been rest to no selection
task.sort((a, b) => a.step_order - b.step_order);

  task.forEach(step => {
    console.log('step',step);
renderStepCard(summaryEl,step);
/*
const stepCard = document.createElement('p');
    stepCard.className = 'clickable-step hover:scale-105 transition-transform bg-blue-50 border-l-4 border-blue-400 rounded-lg p-3 mb-2 shadow-sm hover:shadow-md';
    stepCard.dataset.stepId = step.id;//stepId? Never has a value.was and is null.
    
    stepCard.innerHTML = `
      <strong>Step ${step.step_order}:</strong> ${step.name}
      <span class="block text-sm text-gray-600 whitespace-pre-line">${step.description || ''}</span>
    `;

    list.appendChild(stepCard);
*/
    // Inline automations under the step (styled like survey answers/automations)
    const autosContainer = document.createElement('div');
    autosContainer.className = 'ml-4';
    summaryEl.appendChild(autosContainer);
    loadStepAutomations(autosContainer, step.step_id); //is stepId always null?
  });

  const createdSteps = panel.querySelector('#createdSteps');
  if (createdSteps && state.steps.length > 0) createdSteps.classList.remove('hidden');


 if(!panel._listenerAttached) { //renderTaskStructure is called many times, but only want one listener
  attachStepsListeners(panel); 
  panel._listenerAttached = true; 
}
}


async function loadStepAutomations(container, stepId) {
  try {console.log('loadStepAutomations for stepId',stepId);
    const automations = await executeIfPermitted(state.user, 'readTaskAutomations', {
      source_task_step_id: stepId
    });
    renderAutomationCards(container, automations);
  } catch (error) {
    console.error('Failed to load automations:', error);
    showToast('Could not load automations', 'error');
  }
}

function renderAutomationCards(container, automations) {
    console.log('renderAutomationCards()');
  if (!automations || automations.length === 0) {
    container.innerHTML += `<p class="text-gray-500"><em>No automations</em></p>`;
    return;
  }

  automations.forEach(auto => {
    const p = document.createElement('p');
    p.className = 'clickable-automation hover:scale-105 transition-transform bg-yellow-50 border-l-4 rounded-lg p-3 mb-2 shadow-sm hover:shadow-md';
    p.dataset.stepId = auto.source_task_step_id;
    p.dataset.automationId = auto.id;
console.log('automation',auto);
    // choose border color per type
    const borderClass =
      auto.taskHeaderId ? 'border-yellow-500' :
      auto.survey_header_id ? 'border-yellow-500' :
      auto.relationship ? 'border-yellow-400' : 'border-yellow-300';
    p.classList.add(borderClass);

    if (auto.task_header_id) {
      p.innerHTML = `automation🚂🔧 <strong>Task:</strong> Assign to "${auto.name || 'Unknown Task'}" → assigned to step ${auto.task_step_id || 'Initial'} "${auto.source_task_step_id}"}`;
    } else if (auto.survey_header_id) {
      p.innerHTML = `automation🚂📜 <strong>Survey:</strong> Assign to "${auto.name || 'Unknown Survey'}" "${auto.source_task_step_id}"`;
    } else if (auto.relationship) {
      p.innerHTML = `automation🚂🖇️ <strong>Relation:</strong>  <strong>${auto.approIsName || 'Respondent'}</strong>[${auto.approIsId ||'id?'} ] is → ${auto.relationship} → of <strong> ${auto.name}</strong>[id:${auto.of_appro_id}] "${auto.source_task_step_id}"` ;
    } else {
      p.innerHTML = `❓ <strong>default:</strong> ${JSON.stringify(auto)} "${auto.source_task_step_id}"`;
    }

    const del = document.createElement('button');
    del.className = 'deleteAutomationBtn text-red-600 text-sm ml-4';
    del.dataset.id = auto.id;
    del.dataset.stepId = auto.source_task_step_id;
    del.textContent = 'Delete';

    const row = document.createElement('div');
    row.className = 'ml-6 flex items-center gap-2';
   // row.appendChild(del);
    row.appendChild(p);
    

    container.appendChild(row);
  });
}


function getTemplateHTML() {console.log('getTemplateHTML()');
  return `
    <div id="editTaskDialog" class="edit-task-dialogue relative z-10 flex flex-col h-full" data-destination="new-panel">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 z-10 max-h-[90vh] overflow-y-auto">

        <div class="p-6 border-b border-gray-200 flex justify-between items-center">

            <h3 class="text-xl font-semibold text-gray-900">Display a Task  20:00 Dec 14</h3>

            <div class="space-y-2">
              <!--label for="taskSelect" class="block text-sm font-medium text-gray-700">Use [Select] menu to choose tasks then this dropdown to load a Task</label-->
              <select id="taskSelect" data-form="taskSelect" class="flex-1 p-2 border border-gray-300 rounded text-sm">
                <option value="">Use the menu [Select] button then this dropdown to select Task</option>
              </select>
             </div>


          <button data-action="close-dialog" class="text-gray-500 hover:text-gray-700" aria-label="Close">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="p-6">
          
                <div id="taskSummary" class="space-y-2">
                </div>
          



            <div class="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200" data-action="selector-dialogue">
                <h4 class="font-medium text-blue-800 mb-2">Instructions:</h4>
           
                <ul class="text-blue-700 text-sm mt-2 space-y-1">
              <li>📋 Auto-fill from clipboard. Click the [Select] menu button </li>  
              <li>• You can view the name, description, and URL</li>
              <li>• View any step by clicking the summary</li>  
              <li>• Automations are shown below each card</li>
                <li>• </li>        
                </ul>
            </div>
            <div class="bg-green-100 flex flex-col md:flex-row justify-center gap-4 pt-4 border-t border-gray-200">
                            <p class="text-lg font-bold">Information:</p>
                            <div id="informationSection" class="w-full">
                                <!-- Information cards will be added here -->
                            </div>
            </div>





          


          </div>
        </div>
      </div>
    </div>
       ${petitionBreadcrumbs()} 
  `;
}