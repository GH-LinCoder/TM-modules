// ./work/task/editTaskForm.js
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { appState } from '../../state/appState.js';
import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';
import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';
import {icons} from '../../registry/iconList.js';

console.log('editTask.js loaded');

const state = {
  user: appState.query.userId,
  currentTask: null,
  currentTaskId: null, //different to editSurvey
  //questions: [], //only used in edit Survey.
  steps: [],
  currentStepId: null,   //
  currentStepOrder: null, // optional, but helpful
  currentAutomationId: null, //added 22:57 Nov 29
  initialStepId: null
};
let stepOrder = null;
let stepId = null; // was on line 705 used for no obvious reason to replaced 'initialStepId'
// used lines 549, 1256, 1273 but always   as =stepId so always null !


let automationsNumber = 0; //added 16:16 Nov 23

export function render(panel, query = {}) {
  console.log('editTask.render:', panel, query);
  panel.innerHTML = getTemplateHTML();
  // Initialize clipboard integration
  initClipboardIntegration(panel);
  attachListeners(panel);
  
  //taskSelect = panel.querySelector('[data-form="taskSelect"]');//surveys has nothing here
}


function getIconByType(type) {
    switch(type){
      case 'task': return icons.task;
      case 'step': return icons.step;
      case 'step-create': return icons.step_create;
      case 'step-update': return icons.step_update;
      case 'manager': return icons.manager;
      case 'manager-assigned': return icons.manager_assigned;
      case 'assignTask': return icons.assignTask;
      case 'automation_task': return icons.automation_task;
      case 'automation_survey': return icons.automation_survey;
      case 'automation_appro': return icons.automation_appro;
      case 'Task automation': return icons.automation_task;
      case 'survey':return icons.surveys;

      default: return icons.question;
    }
  }

function styleCardByType(type){
  console.log('styleCardByType()',type);
  switch(type){
      case 'task':return 'bg-white p-2 rounded border mb-3 text-lg font-bold';
      case 'step':return 'bg-yellow-100 p-2 rounded border mb-1 text-sm font-bold';
      case 'manager-assigned':return 'bg-orange-100 p-2 rounded border mb-1 text-sm font-style: italic ml-4';
      case 'automation_task':return 'bg-blue-100 p-2 border-dotted border-blue-500 rounded border mb-1 text-sm ml-6';    
      case 'automation_survey':return 'bg-green-100 p-2 border-dotted border-green-500 rounded border mb-1 text-sm ml-6';
      case 'automation_appro':return 'bg-green-100 p-2 border-dotted border-green-500 rounded border mb-1 text-sm ml-6';

      default:return 'bg-gray-100 p-2 rounded border mb-1 text-sm';
  }   
}


function initClipboardIntegration(panel) {
    console.log('initClipboardIntegration()');
  // Check clipboard immediately
  populateFromClipboard(panel);
  // Listen for future changes
  onClipboardUpdate(() => {
    populateFromClipboard(panel);
    populateFromClipboardAuto(panel);
  });
}


function populateFromClipboard(panel) {
  console.log('populateFromClipboard()');
  
  // Get tasks or surveys from clipboard
  const tasks = getClipboardItems({ as: 'task', type: 'tasks' });
  
  
  if (tasks.length === 0) return;
  const taskSelect = panel.querySelector('#taskSelect'); //added 16:44 Dec 5
  addClipboardItemsToDropdown(tasks, taskSelect);
  //moved 10:00 dec 4 from below
  if (tasks.length === 1 && !taskSelect.value) { 
    taskSelect.value = tasks[0].entity.id;
    const infoSection = document.querySelector('#informationSection');
    infoSection.innerHTML += `<div class="p-1 text-sm bg-blue-50 border border-blue-200 rounded">Auto-filled task: ${tasks[0].entity.name}</div>`;
  }
  
 const item = taskSelect.value ? tasks.find(t => t.entity.id === taskSelect.value) : tasks[0];
 if (!item) return;
 console.log('Using clipboard item:', item);
  state.currentTask = item.entity.item; // full row data
  state.currentTaskId = item.entity.id;
  
  // Populate form
  const nameInput = panel.querySelector('#taskName');
  const descriptionInput = panel.querySelector('#taskDescription');
  const urlInput = panel.querySelector('#taskUrl');
  const nameCounter = panel.querySelector('#taskNameCounter');
  const descriptionCounter = panel.querySelector('#taskDescriptionCounter');
  
  if (nameInput && state.currentTask.name) {
    nameInput.value = state.currentTask.name;
    nameCounter.textContent = `${state.currentTask.name.length}/64 characters`;
    showToast(`Auto-filled from clipboard: ${state.currentTask.name}`, 'info');
  }
  
  if (descriptionInput && state.currentTask.description) {
    descriptionInput.value = state.currentTask.description;
    descriptionCounter.textContent = `${state.currentTask.description.length}/2000 characters`;
  }
  
  if (urlInput && state.currentTask.external_url) {
    urlInput.value = state.currentTask.external_url;
  }
  
  // Load steps if task ID is available
  if (state.currentTaskId) {
    loadTaskSteps(panel, state.currentTaskId);
  }
}


//New 19:38 Nov 12
function populateFromClipboardAuto(panel) {
    console.log('populateFromClipboard()');
    
    // Get clipboard items
    const tasks = getClipboardItems({ as: 'task' });
    const surveys = getClipboardItems({ as: 'survey' });
    const approfiles = getClipboardItems({ as: 'other' });
    const managers = getClipboardItems({ as: 'manager' });

    
    console.log('Clipboard items loaded:', {
      tasks: tasks.length,
      surveys: surveys.length,
      approfiles: approfiles.length,
      managers: managers.length
    });
    
    // Populate task automation dropdown
    const taskSelect = panel.querySelector('#taskAutomationSelect');
    if (taskSelect) {
      console.log('Populating task automation dropdown with', tasks.length, 'items');
      addClipboardItemsToDropdown(tasks, taskSelect, 'task');
    }
    
    // Populate survey automation dropdown 
    const surveySelect = panel.querySelector('#surveyAutomationSelect');
    if (surveySelect) {
      console.log('Populating survey automation dropdown with', surveys.length, 'items');
      addClipboardItemsToDropdown(surveys, surveySelect, 'survey');
    }


    // Populate approfile automation dropdown
    const approfileSelect = panel.querySelector('#approfileAutomationSelect');
    if (approfileSelect) {
      console.log('Populating approfile automation dropdown with', approfiles.length, 'items');
      addClipboardItemsToDropdown(approfiles, approfileSelect, 'approfile');
    }
    
    // Populate manager automation dropdown (if you want managers in automations too)
    const managerSelect = panel.querySelector('#managerAutomationSelect');
    if (managerSelect) {
      console.log('Populating manager automation dropdown with', managers.length, 'items');
      addClipboardItemsToDropdown(managers, managerSelect, 'manager');
    }
    
    // Also populate the main manager dropdown in the header section
    const headerManagerSelect = panel.querySelector('#managerSelect');
    if (headerManagerSelect) {
      console.log('Populating header manager dropdown with', managers.length, 'items');
      addClipboardItemsToDropdown(managers, headerManagerSelect, 'manager');
    }
  }


function addClipboardItemsToDropdown(items, selectElement) {
    console.log('addClipboardItemsToDropdown()');
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


//Originally the header is loaded from the clipboard & then the steps and automations are read from the db
//but if we reload the task after making any changes we need to read it all from the data base, this requires reading the header, placing the data in the form
//and then calling the steps and automations functions



async function reloadTaskData(panel){
//is the header not reloaded?
  loadTaskSteps(panel, state.currentTaskId);

}


//in edit survey this called loadSurveyQuestions
async function loadTaskSteps(panel, taskId) { //readTaskSteps 'id, name, description, step_order, external_url' excludes automations
    
    console.log('loadTaskSteps()');
    try {
      const steps = await executeIfPermitted(state.user, 'readTaskSteps', { taskId });
      state.steps = steps || [];
      
      console.log('Loaded steps:', state.steps);
      
      // Enable steps section
      const stepsSection = panel.querySelector('#stepsSection');
      if (stepsSection) {
        stepsSection.classList.remove('opacity-50', 'pointer-events-none');
      }
      
    } catch (error) {
      console.error('Error loading task steps:', error);
      showToast('Failed to load task steps', 'error');
      return;
    }
          // Populate steps list
      renderTaskStructure(panel); //which also does output of automations
      
      // Populate step select dropdown
      populateStepSelect(panel);
  }


//in edit survey this called populateQuestionSelect
function populateStepSelect(panel) {
    console.log('populateStepSelect()');
  const stepSelect = panel.querySelector('#stepSelect');
  if (!stepSelect) return;
  
  stepSelect.innerHTML = '<option value="">Select a step to edit</option>';
  
  // Add all editable steps (order >= 3)
  state.steps
    .filter(step => step.step_order >= 3)
    .sort((a, b) => a.step_order - b.step_order)
    .forEach(step => {
      const option = document.createElement('option');
      option.value = step.step_order;
      option.textContent = `Step ${step.step_order}: ${step.name}`;
      stepSelect.appendChild(option);
    });
  
  // Add option for new step
  const maxStep = Math.max(...state.steps.map(s => s.step_order), 2);
  const newStepOption = document.createElement('option');
  newStepOption.value = maxStep + 1;
  //newStepOption.dataset.new = "true"; //used in editSurvey to tell a uuid (existing ) from an integer (new)


  newStepOption.textContent = `New Step ${maxStep + 1}`;
  stepSelect.appendChild(newStepOption);
}

function getTemplateHTML() {
  return `
    <div id="editTaskDialog" class="edit-task-dialogue relative z-10 flex flex-col h-full" data-destination="new-panel">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 z-10 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-xl font-semibold text-gray-900">Edit Task  19:31 Nov 30</h3>
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
          <div class="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200" data-action="selector-dialogue">
            <h4 class="font-medium text-blue-800 mb-2">Instructions:</h4>
           
            <ul class="text-blue-700 text-sm mt-2 space-y-1">
              <li>📋 Auto-fill from clipboard. Click the [Select] menu button </li>  
              <li>• You can modify the name, description, and URL</li>
              <li>• The name must be unique across all existing tasks</li>
              <li>• Click "Update Task" to save your changes</li>
              <li>• Create a new step with the dropdown</li>
              <li>• Edit existing steps by clicking the summary or use the dropdown</li>
              <li>• Click "Save step" to save your changes to steps</li>
              <li>• Automations are added in the section below the summary</li>
              <li>• Click "Save" Automation to add it to the displayed step</li>        
            </ul>
          </div>


          <div id="editTaskForm" class="space-y-6 bg-gray-50 p-6 rounded-lg">
            <div>
              <label for="taskName" class="block text-sm font-medium text-gray-700 mb-1">
                Task Name *
              </label>
              <input id="taskName" placeholder="Short & unique task name" maxlength="64" required class="w-full p-2 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              <p id="taskNameCounter" class="text-xs text-gray-500 mt-1">0/64 characters</p>
              <p id="nameError" class="text-xs text-red-500 mt-1 hidden">This name already exists. Please choose a different name.</p>
            </div>

            <div>
              <label for="taskDescription" class="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea id="taskDescription" placeholder="Task description" rows="4" maxlength="2000" required class="w-full p-2 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
              <p id="taskDescriptionCounter" class="text-xs text-gray-500 mt-1">0/2000 characters</p>
            </div>

            <div>
              <label for="taskUrl" class="block text-sm font-medium text-gray-700 mb-1">
                URL (Optional)
              </label>
              <input id="taskUrl" type="url" placeholder="https://example.com" class="w-full p-2 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>

            <button id="saveTaskBtn" class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
              Update Task
            </button>
          </div>

          <div id="stepsSection" class="opacity-50 pointer-events-none mt-6">
            <h4 class="text-lg font-medium mb-4">Edit Task Steps</h4>
            <div class="bg-white p-4 rounded border">
              <form id="editStepForm" class="space-y-4">
                <div class="flex items-center gap-4">
                  <label for="stepSelect" class="block text-sm font-medium text-gray-700">Add a Step:</label>
                  <select id="stepSelect" class="w-full p-2 border rounded">
                    <option value="">New step, or select a step</option>
                  </select>
                </div>
                <div>
                  <label for="stepName" class="block text-sm font-medium text-gray-700">Step Name *</label>
                  <input id="stepName" maxlength="64" placeholder="Step name" required class="w-full p-2 border rounded" />
                  <p id="stepNameCounter" class="text-xs text-gray-500">0/64 characters</p>
                </div>
                <div>
                  <label for="stepDescription" class="block text-sm font-medium text-gray-700">Step Description *</label>
                  <textarea id="stepDescription" maxlength="2000" placeholder="Step description" rows="3" required class="w-full p-2 border rounded"></textarea>
                  <p id="stepDescriptionCounter" class="text-xs text-gray-500">0/2000 characters</p>
                </div>
                <div>
                  <label for="stepUrl" class="block text-sm font-medium text-gray-700">Step URL (Optional)</label>
                  <input id="stepUrl" type="url" placeholder="https://example.com" class="w-full p-2 border rounded" />
                </div>

                <div>  <!-- new 19:23 Nov 24 20025 -->
                  <label for="stepAutomationS" class="block text-sm font-medium text-gray-700">Step Automations</label>
                  <input id="stepAutomationS" class="text-xs text-gray-500" />
                </div>

                <!-- Hidden input for form submission -->
                <input id="stepOrder" type="hidden" />
                <input id="stepId" type="hidden" />
                <button id="saveStepBtn" class="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
                  Save Step
                </button>
              </form>

              <div id="createdSteps" class="hidden mt-4">
                <h5 class="text-md font-medium mb-2">Existing Steps:</h5>
                <div id="taskSummary" class="space-y-2"></div>
              </div>

              <!--new 19:18 Nov 12 -->

<div id="automationControls" class="mt-6 bg-green-50 p-4 rounded border border-green-300">
  <h5 class="font-medium text-green-800 mb-2">Add Step Automations</h5>

  <div class="mb-4">
    <label for="taskAutomationSelect" class="block text-sm font-medium text-gray-700">Assign a Task</label>
    <select id="taskAutomationSelect" class="w-full p-2 border rounded">
      <option value="">Select a task to assign</option>
    </select>
    <button type="button" id="saveTaskAutomationBtn" class="mt-2 bg-purple-600 text-white py-1 px-3 rounded hover:bg-purple-700 opacity-50" style="pointer-events: none;">
      Save Task Automation
    </button>
  </div>
<!-- Assign Survey Section -->
              <div class="mt-4 p-3 bg-white rounded border mb-4">
                <h5 class="font-medium text-gray-800 mb-2">Assign a survey</h5>
                <div class="flex gap-2">
                  <select id="surveyAutomationSelect" class="flex-1 p-2 border border-gray-300 rounded text-sm">
                    <option value="">Select a survey to assign</option>
                  </select>
                </div>
                  <button type="button" id="saveSurveyAutomationBtn" class="bg-purple-400 text-white py-1 px-3 rounded hover:bg-blue-700 opacity-50" style="pointer-events: none;">
                    Save Survey Assignment automation
                  </button>
              </div>    
  <div>
    <label for="approfileAutomationSelect" class="block text-sm font-medium text-gray-700">Relate to a Category</label>
    <select id="approfileAutomationSelect" class="w-full p-2 border rounded mb-2">
      <option value="">Select an appro</option>
    </select>
    <select id="relationshipAutomationSelect" class="w-full p-2 border rounded mb-2">
      <option value="">Select relationship</option>
      <option value="a member">a member</option>
      <option value="customer">customer</option>
      <option value="explanation">explanation</option>
    </select>
    <button type="button" id="saveRelationshipAutomationBtn" class="bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700 opacity-50" style="pointer-events: none;">
      Save Relationship Automation
    </button>
  </div>
</div>



<div id="automationSection" class="mt-6">
  <h5 class="text-md font-medium mb-2">Step Automations:</h5>
  <div id="automationCards" class="space-y-2"></div>
</div>


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

function attachListeners(panel) {
    console.log('attachListeners()');
  const nameInput = panel.querySelector('#taskName');
  const descriptionInput = panel.querySelector('#taskDescription');
  const urlInput = panel.querySelector('#taskUrl');
  const stepNameInput = panel.querySelector('#stepName');
  const stepDescriptionInput = panel.querySelector('#stepDescription');
  const stepSelect = panel.querySelector('#stepSelect');
  
  const nameCounter = panel.querySelector('#taskNameCounter');
  const descriptionCounter = panel.querySelector('#taskDescriptionCounter');
  const stepNameCounter = panel.querySelector('#stepNameCounter');
  const stepDescriptionCounter = panel.querySelector('#stepDescriptionCounter');
  
  const nameError = panel.querySelector('#nameError');
  const saveTaskBtn = panel.querySelector('#saveTaskBtn');
  const saveStepBtn = panel.querySelector('#saveStepBtn');

  // Task header field listeners
  nameInput?.addEventListener('input', e => {
    nameCounter.textContent = `${e.target.value.length}/64 characters`;
    nameError.classList.add('hidden');
    saveTaskBtn.disabled = false;
    saveTaskBtn.textContent = 'Update Task';
  });

  descriptionInput?.addEventListener('input', e => {
    descriptionCounter.textContent = `${e.target.value.length}/2000 characters`;
  });

  // Step field listeners
  stepNameInput?.addEventListener('input', e => {
    stepNameCounter.textContent = `${e.target.value.length}/64 characters`;
  });

  stepDescriptionInput?.addEventListener('input', e => {
    stepDescriptionCounter.textContent = `${e.target.value.length}/2000 characters`;
  });

  // Step selection listener
  // In attachListeners, update the stepSelect change handler:
stepSelect?.addEventListener('change', (e) => {
    const stepOrder = parseInt(e.target.value); // stepOrder is read from the summary (wheras in edit survey finds questionId)
    if (!stepOrder) return;
    

    console.log('Selected step order:', stepOrder);
    
    // Find step with this order (In edit survey find id)
    const step = state.steps.find(s => parseInt(s.step_order) === stepOrder);// where's this from?
    console.log('Found step:', step);
    
    if (step) {
      state.currentStepId = step.id; //where does step.id decalred line 30 as null. Never assigned
      // Fill form with step data
      panel.querySelector('#stepName').value = step.name || '';
      panel.querySelector('#stepDescription').value = step.description || '';
      panel.querySelector('#stepUrl').value = step.external_url || '';
      panel.querySelector('#stepOrder').value = stepOrder; 
      console.log('Form filled with step data');

    } else {
      // Clear form for new step
      panel.querySelector('#stepName').value = '';
      panel.querySelector('#stepDescription').value = '';
      panel.querySelector('#stepUrl').value = '';
      panel.querySelector('#stepOrder').value = stepOrder;
      console.log('Form cleared for new step');
    }
  });

  // Button listeners
  saveTaskBtn?.addEventListener('click', (e) => handleTaskUpdate(e, panel));
  saveStepBtn?.addEventListener('click', (e) => handleStepUpdate(e, panel));
  panel.querySelector('[data-action="close-dialog"]')?.addEventListener('click', () => panel.remove());


  const taskSelect = panel.querySelector('#taskSelect');

  taskSelect?.addEventListener('change', (e) => {
    const selectedId = e.target.value;
    const tasks = getClipboardItems({ as: 'task', type: 'tasks' });
    const selectedItem = tasks.find(t => t.entity.id === selectedId);
    if (!selectedItem) return;
  
    const task = selectedItem.entity.item;
    panel.querySelector('#taskName').value = task.name || '';
    panel.querySelector('#taskDescription').value = task.description || '';
    panel.querySelector('#taskUrl').value = task.external_url || '';
  
    panel.querySelector('#taskNameCounter').textContent = `${(task.name || '').length}/64 characters`;
    panel.querySelector('#taskDescriptionCounter').textContent = `${(task.description || '').length}/2000 characters`;
  
    state.currentTask = task;
    state.currentTaskId = selectedItem.entity.id;
  
    loadTaskSteps(panel, state.currentTaskId);
  });
//end new 17:39 oct 4  
const surveySelect = panel.querySelector('#surveyAutomationSelect');
const saveSurveyAutomationBtn = panel.querySelector('#saveSurveyAutomationBtn');

surveySelect?.addEventListener('change', () => {
  if (surveySelect.value) {
    saveSurveyAutomationBtn.disabled = false;
    saveSurveyAutomationBtn.style.pointerEvents = 'auto';
    saveSurveyAutomationBtn.classList.remove('opacity-50');
  } else {
    saveSurveyAutomationBtn.disabled = true;
    saveSurveyAutomationBtn.style.pointerEvents = 'none';
    saveSurveyAutomationBtn.classList.add('opacity-50');
  }
});

const taskAutoSelect = panel.querySelector('#taskAutomationSelect');
const saveTaskAutomationBtn = panel.querySelector('#saveTaskAutomationBtn');

taskAutoSelect?.addEventListener('change', () => {
  if (taskAutoSelect.value) {
    saveTaskAutomationBtn.disabled = false;
    saveTaskAutomationBtn.style.pointerEvents = 'auto';
    saveTaskAutomationBtn.classList.remove('opacity-50');
  } else {
    saveTaskAutomationBtn.disabled = true;
    saveTaskAutomationBtn.style.pointerEvents = 'none';
    saveTaskAutomationBtn.classList.add('opacity-50');
  }
});

const approSelect = panel.querySelector('#approfileAutomationSelect');
const saveRelateAutomationBtn = panel.querySelector('#saveRelationshipAutomationBtn');

approSelect?.addEventListener('change', () => {
  if (approSelect.value) {
    saveRelateAutomationBtn.disabled = false;
    saveRelateAutomationBtn.style.pointerEvents = 'auto';
    saveRelateAutomationBtn.classList.remove('opacity-50');
  } else {
    saveRelateAutomationBtn.disabled = true;
    saveRelateAutomationBtn.style.pointerEvents = 'none';
    saveRelateAutomationBtn.classList.add('opacity-50');
  }
});


 //new 19:25 Nov 12
  panel.querySelector('#saveTaskAutomationBtn')?.addEventListener('click', (e) => handleTaskAutomationSubmit(e, panel));
  panel.querySelector('#saveSurveyAutomationBtn')?.addEventListener('click', (e) => handleSurveyAutomationSubmit(e, panel));
  panel.querySelector('#saveRelationshipAutomationBtn')?.addEventListener('click', (e) => handleRelationshipAutomationSubmit(e, panel));

}
//new 19:40 Nov 12
    // ========================================
    // DATA OPERATIONS - AUTOMATIONS
    // ========================================

async function handleTaskAutomationSubmit(e, panel) {
    console.log('handleTaskAutomationSubmit()');
    e.preventDefault();
    
    // BETTER: Check if we have required context first
  //  if (!answerId || !questionId) {
  //      showToast('Please save the answer first', 'error');
  //      return;
   // }
    
    const taskSelect = panel.querySelector('#taskAutomationSelect');
    const selectedTaskId = taskSelect?.value;
    
    // Get the selected option text
    const selectedOption = taskSelect?.options[taskSelect.selectedIndex];
    const taskCleanName = selectedOption?.textContent?.replace(' (clipboard)', '');
    
    const saveTaskAutomationBtn = panel.querySelector('#saveTaskAutomationBtn');
    if (!saveTaskAutomationBtn) {
        showToast('Save button not found', 'error');
        return;
    }
    
    saveTaskAutomationBtn.disabled = true;
    saveTaskAutomationBtn.textContent = 'Saving...'; //? 
    automationsNumber++;    
    
    const managerSelect = panel.querySelector('#managerAutomationSelect'); 
    const managerData = getManagerName(managerSelect);

//making global 14:18 Oct 18
//const stepOrder = currentStepId ? currentStepId.substring(0, 8) : 'unknown'; //unknown  23:12 Oct 17
//cstepOrder = currentStepId ? currentStepId.substring(0, 8) : 'unknown'; //unknown  23:12 Oct 17
// Instead of just showing manager info, show complete context:
addInformationCard({
  'name': `${managerData.managerName}`,
  'id': `${managerData.managerId?.substring(0, 8) || 'unknown'}`,
  'type': 'manager-assigned',
  'for-task': `${taskCleanName?.substring(0, 30) || 'Unknown Task'}`,  // Show which task
  'on-step': stepOrder || 3,  // Show current step number
  'autoNumber': automationsNumber 
});

    //We need to find the id of step3 of the task we are applying as automation. 
    try { 
        // LOOK UP ALL STEPS FOR THIS TASK
        console.log('Looking up steps for task:', selectedTaskId);
        const steps = await executeIfPermitted(state.user, 'readTaskSteps', {
            taskId: selectedTaskId
        });
        
        // FIND STEP 3 (initial step) - WHY? why are we finding step 3????
        //we need the current step. Where is current step stored????
        
        const initialStep = steps.find(step => step.step_order === 3);
        if (initialStep && initialStep.id) {
            state.initialStepId = initialStep.id;
            console.log('Found initial step_id:', state.initialStepId);  // got it 10:58 Oct 15
        } else {
            throw new Error(`No initial step (step 3) found for task ${selectedTaskId}`);
        }
        console.log(

          'state.initialStepId,:', state.initialStepId,
          'state.user:', state.user, //should be null because usually this is a future unknown person
          'managerData.managerId:', managerData.managerId,     
          'selectedTaskId:', selectedTaskId,
          'taskCleanName:', taskCleanName,
          'currentStepId',state.currentStepId, 
          'auto#:', automationsNumber 
        ); 
// we don't know the currentStepId !!! 


const result = await executeIfPermitted(state.user, 'createAutomationAddTaskByTask', { 
       source_task_step_id : state.currentStepId, //works, but in survey it is undefined  12:18 Nov 30
       student_id: state.user, //the person being assigned to the task
       manager_id: managerData.managerId, // needs to be from the dropdown    
       task_header_id: selectedTaskId,
            task_step_id: state.initialStepId, // 
            name: taskCleanName || 'Unknown Task', // 
            automation_number: automationsNumber
        });

        
        addInformationCard({
          'name': `${taskCleanName?.substring(0, 60) || 'Unknown Task'}...`,
          'type': 'automation_task',
          'step': stepOrder,  // unknown  23:13  Oct 17
          'taskId': `${selectedTaskId?.substring(0, 8) || 'unknown'}...`,
          'id': `${result.id?.substring(0, 8) || 'unknown'}...`
        });
        
        
        showToast('Task automation saved successfully!');
        reloadTaskData(panel);  // new 20:47 Nov 29
    } catch (error) { console.log(error.message);
        showToast('Failed to save task automation: ' + error.message, 'error');
         automationsNumber--; // ROLLBACK: Decrement on failure
    }
    
    saveTaskAutomationBtn.disabled = false;
    saveTaskAutomationBtn.textContent = 'Save Task';
}

function addInformationCard(stepData) { 
  console.log('addInformationCard()');
  const infoSection = document.querySelector('#informationSection');
  const card = document.createElement('div');
 // card.className = 'bg-white p-2 rounded border mb-1 text-sm';
 const style = styleCardByType(stepData.type);
 console.log('style:',style);
 card.className= style;
//       card.className = styleCardByType(stepData.type); //not calling the function
  // Create display text by iterating through all properties
  let displayText = ''; // used to be 'Saved' but seems redundant
  
  // Iterate through all properties in the object
  for (const [key, value] of Object.entries(stepData)) {
      if (key !== 'timestamp') {
          displayText += `, ${key}: ${value}`;
      }
  }
  console.log('type',stepData.type);
  const icon = getIconByType(stepData.type);
  card.textContent = icon + displayText;
  infoSection.appendChild(card);
  
  // Add to steps array
  state.steps.push(stepData);
  console.log('steps array:', state.steps);
}


function getManagerName(managerSelect) {
    console.log('getManagerName()');
  // BETTER MANAGER SELECTION:
  let managerId, managerName;
  
  // Check if we have a valid selection first
  if (managerSelect && managerSelect.value && managerSelect.selectedIndex > 0) {
      // Valid selection made
      const selectedOption = managerSelect.options[managerSelect.selectedIndex];
      const rawName = selectedOption?.textContent;
      
      // Only process if we got a real name
      if (rawName && rawName !== 'Select a manager (optional)' && rawName !== 'Select a manager') {
          managerName = rawName.replace(' (clipboard)', '');
          managerId = selectedOption.value;
      } else {
          // Got placeholder text or empty - use default
          managerId = state.user;
          managerName = 'The Author';
      }
  } else {
      // No selection or invalid selection - use default
      managerId = state.user;
      managerName = 'The Author';
  }
  
  console.log('Selected manager:', managerId, managerName);
  return { managerName: managerName, managerId: managerId };
}



async function handleSurveyAutomationSubmit(e, panel) {
  console.log('handleSurveyAutomationSubmit()');
  e.preventDefault();
  
  const taskSelect = panel.querySelector('#taskAutomationSelect');
  const selectedTaskId = taskSelect?.value;

  const surveySelect = panel.querySelector('#surveyAutomationSelect');
  const selectedSurveyId = surveySelect?.value;
  
  // Get the selected option text
  const selectedOption = surveySelect?.options[surveySelect.selectedIndex];
  const surveyCleanName = selectedOption?.textContent?.replace(' (clipboard)', '');
  
  const saveSurveyAutomationBtn = panel.querySelector('#saveSurveyAutomationBtn');
  if (!saveSurveyAutomationBtn) {
      showToast('Save button not found', 'error');
      return;
  }
  
  saveSurveyAutomationBtn.disabled = true;
  saveSurveyAutomationBtn.textContent = 'Saving...'; //? 
  automationsNumber++;    
  
  //this could be a function

  const initialStep = state.steps.find(step => step.step_order === 3);
  if (initialStep && initialStep.id) {
      state.initialStepId = initialStep.id;
      console.log('Found initial step_id:', state.initialStepId);  // got it 10:58 Oct 15
  } else {
      throw new Error(`No initial step (step 3) found for task ${selectedTaskId}`);
  }

  
try{
console.log('state.initialStepId',state.initialStepId, //need this 
  'state.currentId',state.currentStepId, //undefined 16:34 nov 30
  'surveyId',selectedSurveyId, 
  'name',surveyCleanName, 
'auto#',automationsNumber);

//function needs: source_task_step_id, survey_header_id, name , automation_number
//table needs: source_task_step_id, survey_header_id, name, automation_number

const result = await executeIfPermitted(state.user, 'createAutomationAddSurveyByTask', { 
            source_task_step_id : state.currentStepId, //need this 
            survey_header_id : selectedSurveyId, 
            name: surveyCleanName, 
            automation_number: automationsNumber
     });
     
     
     addInformationCard({
      'name': `${surveyCleanName}`,
      'type': 'automation_survey',
      'step': stepOrder || 3,  // Show current step number
      'state.initialStepId':state.initialStepId?.substring(0, 8),
      'autoNumber': automationsNumber, 
      'survey id': `${selectedSurveyId?.substring(0, 8) || 'unknown'}`
      });
     
     showToast('Survey automation saved successfully!');
     reloadTaskData(panel);
 } catch (error) {
     showToast('Failed to save survey automation: ' + error.message, 'error');
      automationsNumber--; // ROLLBACK: Decrement on failure
 }
  saveSurveyAutomationBtn.disabled = false;
  saveSurveyAutomationBtn.textContent = 'Save Survey';
}





//new 19:40 Nov 12

  async function handleRelationshipAutomationSubmit(e, panel) {
    console.log('handleRelationshipAutomationSubmit()');
    e.preventDefault();
    
    const approfileSelect = panel.querySelector('#approfileAutomationSelect'); // Changed ID to match task module
    const relationshipSelect = panel.querySelector('#relationshipAutomationSelect'); // Changed ID to match task module
    
    const selectedApproId = approfileSelect?.value;
    // Get the selected option text
    const selectedOption = approfileSelect?.options[approfileSelect.selectedIndex];
    const cleanName = selectedOption?.textContent?.replace(' (clipboard)', '') || 'Unknown Approfile';
    
    const selectedRelationship = relationshipSelect?.value;
    
    if (!selectedApproId) {
        showToast('Please select an approfile first', 'error');
        return;
    }
    
    if (!selectedRelationship) {
        showToast('Please select a relationship type', 'error');
        return;
    }
    
    e.target.disabled = true;
    e.target.textContent = 'Saving...';

    automationsNumber++;        
    
    try {  
        // Save relationship automation to database
//function needs: source_task_step_id, appro_is_id, relationship, of_appro_id, name, automation_number
//db needs 
        console.log('state.currentStepId',state.currentStepId, 'selectedApproId:', selectedApproId); //undefined here 16:15 Nov 26
        const result = await executeIfPermitted(state.user, 'createAutomationRelateByTask', { 
            source_task_step_id:  state.currentStepId,    // NULL
            of_appro_id: selectedApproId,       //of_appro_id     
            name: cleanName,                        
            relationship: selectedRelationship,         
            automation_number: automationsNumber   
        });
        
        // Add information card - ADAPTED FOR TASKS
         addInformationCard({
            'name': `${result.name?.substring(0, 60) || cleanName?.substring(0, 60) || 'Unknown'}...`,
            'relationship': `${result.relationship?.substring(0, 8) || selectedRelationship?.substring(0, 8) || 'unknown'}...`,
            'type': 'automation_appro', 
            'number':  automationsNumber, 
           'step':  stepOrder,  // 
          'state.currentStepId': state.currentStepId?.substring(0,8) || 'unknown',
            'result.id': `${result.id?.substring(0, 8) || 'unknown'}...`,
          'of_aapro_id':  selectedApproId?.substring(0, 8) || 'unknown'  //
        });            
        
        showToast('Relationship automation saved successfully!');
        reloadTaskData(panel);
    } catch (error) {
        showToast('Failed to save relationship automation: ' + error.message, 'error');
         automationsNumber--; // Rollback on error
    }
    
     // Re-enable the button:
     e.target.disabled = false;
     e.target.textContent = 'Save Relationship';
}






//New 19:38 Nov 12
async function handleTaskUpdate(e, panel) {
    e.preventDefault();
    console.log('handleTaskUpdate()');
  
    const name = panel.querySelector('#taskName')?.value.trim();
    const description = panel.querySelector('#taskDescription')?.value.trim();

    const url = panel.querySelector('#taskUrl')?.value.trim();
    const saveBtn = panel.querySelector('#saveTaskBtn');
    const nameError = panel.querySelector('#nameError');
  
    if (!name || !description) {
      showToast('Name and description are required', 'error');
      return;
    }
  
    saveBtn.disabled = true;
    saveBtn.textContent = 'Checking for duplicates...';
  
    try {
      // Check for duplicates only if name has changed
      if (!state.currentTask || state.currentTask.name !== name) {
        const existing = await executeIfPermitted(state.user, 'readTaskHeaders', { taskName: name });
        console.log('checkIfExists:', existing);
        


        if (existing && existing.length > 0) {
          nameError.classList.remove('hidden');
          showToast('A task with this name already exists', 'error');
          saveBtn.disabled = false;
          saveBtn.textContent = 'Choose a different name';
          return;
        }
      }
  
      saveBtn.textContent = 'Updating Task...';
  

      const updatedTask = await executeIfPermitted(state.user, 'updateTask', {
        id: state.currentTaskId,
        name,
        description,
        external_url: url
      });
  
      showToast('Task updated successfully!');
      saveBtn.textContent = 'Task updated!';
      
      // Update state
      state.currentTask = updatedTask;
  

      // Enable steps section if not already enabled
      const stepsSection = panel.querySelector('#stepsSection');
      if (stepsSection && stepsSection.classList.contains('opacity-50')) {
        stepsSection.classList.remove('opacity-50', 'pointer-events-none');
        loadTaskSteps(panel, state.currentTaskId);
      }
      
    } catch (error) {
      showToast('Failed to update task: ' + error.message, 'error');
      saveBtn.disabled = false;
      saveBtn.textContent = 'Update Task';
    }
  }
  


  async function handleStepUpdate(e, panel) {
    e.preventDefault();
    console.log('handleStepUpdate');
    if (!state.currentTaskId || !state.user) {
      showToast('Task not loaded or user missing', 'error');
      return;
    }
  
      // Task specific that steps 1 & 2 are system steps that cannot be edited
    if (order < 3) {
      showToast('Steps 1 and 2 are system-managed and cannot be edited.', 'error');
      return;
    }
    
    const order = parseInt(panel.querySelector('#stepOrder')?.value);//but if clicked summary?
    const stepName = panel.querySelector('#stepName')?.value.trim();
    const stepDescription = panel.querySelector('#stepDescription')?.value.trim();
    const stepUrl = panel.querySelector('#stepUrl')?.value.trim();
    const saveBtn = panel.querySelector('#saveStepBtn');
  
  
  
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving Step...';
  
    try {
      // ✅ DEBUG: Log what we're looking for
      console.log('Looking for step with order:', order);
      console.log('Available steps:', state.steps);
      
      // ✅ More robust step detection - ensure we're comparing numbers
      const existingStep = state.steps.find(s => parseInt(s.step_order) === order);
      
      // ✅ DEBUG: Log result
      console.log('Found existing step:', existingStep);
  
//Edit survey has very different code here      










//

      if (existingStep) { //edit survey uses isNew & reacts to new first
        // ✅ Update existing step
        console.log('Updating existing step:', order, 'stepName:', stepName, 'stepDescription:', stepDescription);
        await executeIfPermitted(state.user, 'updateTaskStep', {
          taskId: state.currentTaskId,
          stepOrder: order, // This should be a number-19:20 Nov 25  null. Probably the click on the step isn't setting the relevant value the way the drop down would
          stepName,
          stepDescription,
          stepUrl
        });
        showToast('Step updated successfully!', 'success');
      } else {
        // ✅ Create new step
        console.log('Creating new step:', order);
        await executeIfPermitted(state.user, 'createTaskStep', {
          taskId: state.currentTaskId,
          stepOrder: order, // This should be a number 
          stepName,
          stepDescription,
          stepUrl
        });
        showToast('New step created!', 'success');
      }

      
  
      // Reload steps to reflect changes
      await loadTaskSteps(panel, state.currentTaskId);
      
    } catch (error) {
      console.error('Error saving step:', error);
      showToast('Failed to save step: ' + error.message, 'error');
    }
  

    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Step';
//new 19:39 Nov 12
enableAutomationControls(panel);
  }


  function enableAutomationControls(panel) {
    console.log('enableAutomationControls()');
    const taskBtn = panel.querySelector('#saveTaskAutomationBtn');
    const relBtn = panel.querySelector('#saveRelationshipAutomationBtn');
  
    [taskBtn, relBtn].forEach(btn => {
      if (btn) {
        btn.disabled = false;
        btn.style.pointerEvents = 'auto';
        btn.style.opacity = '1';
      }
    });
  }
  

function loadStepIntoEditor(panel,clickedStepId){//clicked is the id uuid
  console.log('loadStepIntoEditor() clickedStepId:', clickedStepId, 'typeof:', typeof clickedStepId);
  //console.log('steps length:', Array.isArray(state.steps) ? state.steps.length : 'not array');
  console.log('available ids of all the steps:', (state.steps || []).map(s => s.id));
  state.currentStepId = clickedStepId; //the card that was clicked sets the current step.
console.log('state.currentStepId:',state.currentStepId); // should be == clickedStepId


//Task just has stps, but the module for editSurvey has to find if questions or answers, but task just has steps

const step = state.steps.find(s => s.id === clickedStepId); //extract this steps data from the array of al the steps data
  console.log('Looking for clickedStepId:', clickedStepId, 'in', state.steps.map(s => s.id));
  

    

 
  
  if (step) { stepOrder = step.step_order;  console.log('state,steps:',state.steps,'stepId',stepId,'step.stepOrder:', step.step_order); // undefined 23:07 24 Nov
    // Fill form with step data
    panel.querySelector('#stepName').value = step.name || '';
    panel.querySelector('#stepDescription').value = step.description || '';
    panel.querySelector('#stepUrl').value = step.external_url || '';
    panel.querySelector('#stepOrder').value = stepOrder; // Ensure this is set
    console.log('Form filled with step data');
} else{console.log('Was it the header that was clicked?'); }
}


async function handleDeleteAutomationButton(panel, automationId){
  const deletedBy = state.user;
  console.log('handleDelete  button of', automationId, 'by', deletedBy);
  try {
    await executeIfPermitted(state.user, 'softDeleteAutomation', { automationId, deletedBy });
    showToast('Automation deleted');
    
reloadTaskData(panel);
     }catch(error) {       console.error('Error deleting:', error);
    showToast('Failed to delete automation', 'error');
  }
}


// Attach listeners to the summary panel
function attachStepsListeners(panel) {
  console.log('attachStepsListeners()');

  panel.addEventListener('click', (e) => {
    const target = e.target.closest(
      '.clickable-step, .clickable-automation, .deleteAutomationBtn, #addStepBtn'
    );
    if (!target) return;
console.log('steps listener event:', target); // responds
    const saveBtn = panel.querySelector('#saveTaskBtn');
    // Save button optional; do not hard-depend on it to load the editor
    const sectionToEditEl = panel.querySelector('#editSectionLabel'); // optional status label

    if (target.classList.contains('clickable-step')) {
      
      const clickedStepId = target.dataset.stepId; // is this an id or a DOM element?
      state.currentStepId = clickedStepId;
      
      console.log('target.dataset',target.dataset); //stepOrder is never set??? Dec 6
      panel.querySelector('#stepOrder').value = stepOrder; // Ensure this is set to a number not an id
      if (saveBtn) { saveBtn.textContent = 'Edit step'; saveBtn.disabled = false; }
      if (sectionToEditEl) sectionToEditEl.textContent = 'step';
      
      loadStepIntoEditor(panel, clickedStepId); //  
      markActiveStepInSummary(panel);
    //  hideAutomationsUI(panel);

    } else if (target.classList.contains('clickable-automation')) {
      const clickedStepId = target.dataset.stepId;
      const automationId = target.dataset.automationId;
      state.currentStepId = clickedStepId;
      state.currentAutomationId = automationId;
      if (saveBtn) { saveBtn.textContent = 'Manage automations'; saveBtn.disabled = false; }
      if (sectionToEditEl) sectionToEditEl.textContent = 'automation';
     

    } else if (target.classList.contains('deleteAutomationBtn')) {
      
      console.log('Clicked the:',target.textContent);
      const automationId = target.dataset.id;
     
      if(target.textContent ==   'Click to confirm Delete this automation') {handleDeleteAutomationButton(panel, automationId)}
      else target.textContent = 'Click to confirm Delete this automation' ;

    } else if (target.id === 'addStepBtn') {
    //  handleAddStep(panel);
    }
  });
}


function renderTaskHeaderCard(list, task) {
  if (!task) return;

  //const summary = panel.querySelector('#surveySummary');
  //if (!summary) return;

  const card = document.createElement('div');
   card.dataset.stepOrder='0';//steps start at a stepOrder of 1. 0 being used to say 'header'
   //   card.dataset.taskId = task.id;//copied not tested dec 6
   //  card.dataset.type = 'header'; //copied not tested  dec 6
   // card.className = styleCardByType('survey');
  card.className = 'clickable-step hover:scale-105 transition-transform bg-gray-50 border-l-4 border-blue-400 rounded-lg p-3 mb-2 shadow-sm hover:shadow-md';
  card.innerHTML = `
    <strong>Task: ${task.name}</strong>
    ${task.description ? `<div class="text-sm text-gray-700">${task.description.substring(0,200) }...</div>` : ''}
    ${task.external_url ? `<div class="text-xs text-blue-600">${task.external_url}</div>` : ''}
  `;

  list.appendChild(card);
}


function renderStepCard(summary,step){

    const stepCard = document.createElement('p');
    //edit survey has 'type' here  
    stepCard.className = 'clickable-step hover:scale-105 transition-transform bg-blue-50 border-l-4 border-blue-400 rounded-lg p-3 mb-2 shadow-sm hover:shadow-md';
    stepCard.dataset.stepId = step.id;//stepId? Never has a value.was and is null. 
    stepCard.innerHTML = `
      <strong>Step ${step.step_order}:</strong> ${step.name}
      <span class="block text-sm text-gray-600 whitespace-pre-line">${step.description || ''}</span>
    `;

    summary.appendChild(stepCard);
}


function markActiveStepInSummary(panel) {
    console.log('markActiveStepInSumary()');
  panel.querySelectorAll('.clickable-step').forEach(el => {
    console.log('el.dataset.stepId',el.dataset.stepId, 'currentStepId',state.currentStepId);
    el.classList.toggle('ring-4', el.dataset.stepId === String(state.currentStepId));
    el.classList.toggle('ring-blue-500', el.dataset.stepId === String(state.currentStepId));
    el.classList.toggle('bg-blue-100', el.dataset.stepId === String(state.currentStepId));
  });
}


function renderTaskStructure(panel) {
  const list = panel.querySelector('#taskSummary');
  if (!list) return;

console.log('renderTaskStructure()-state:', state, 'stepOrder:', stepOrder, 'stepId',stepId);


  list.innerHTML = '<h3>Summary:</h3><br>';
    renderTaskHeaderCard(list,state.currentTask)
  state.steps.forEach(step => {
renderStepCard(list,step);
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
    list.appendChild(autosContainer);
    loadStepAutomations(autosContainer, step.id); //is stepId always null?
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
    row.appendChild(del);
    row.appendChild(p);
    

    container.appendChild(row);
  });
}
