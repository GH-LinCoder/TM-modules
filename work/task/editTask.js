// ./work/task/editTaskForm.js
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { appState } from '../../state/appState.js';
import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';
import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';
import {icons} from '../../registry/iconList.js';

/**
 * refactor April 19 - Only have 1 dropdown. What it displays is determined by a new tab setting
 * relate / task /survey / pay
 * 
 * the pay calls the new registry function readAllActivePaymentPlans() no params needed returns 'plans' 
 * 
 * Need to add a write to new is_visible column of automations. (So can hide answers to quizzes/tests)
* Where do we store the html for a button template is it already designed in TABLE payment_plans has an iframe_snippet but I don't think it is actually an iframe.


*/
console.log('editTask.js loaded');

import {  resolveSubject} from '../../utils/contextSubjectHideModules.js'


const subject = await resolveSubject();
console.log('subject:',subject);
// if source:'authUser' then the id is the auth user, else it could be almost anything
const state = { //This user is not correct should it be approUserId// subject.id is auth
  user: subject.id,
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
console.log('local state', state);//has the right user April 20 15:00

let stepOrder = null;
let stepId = null; // was on line 705 used for no obvious reason to replaced 'initialStepId'
// used lines 549, 1256, 1273 but always   as =stepId so always null !

let activeTab = 'tasks';  // Track active tab state
let automationsNumber = 0; //added 16:16 Nov 23

export function render(panel, query = {}) {
  console.log('editTask.render:', panel, query);
  panel.innerHTML = getTemplateHTML();
  // Initialize clipboard integration
  initClipboardIntegration(panel);
  attachListeners(panel);

  populateFromClipboardAuto(panel); //added 10:53 april 24

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
      case 'step':return 'bg-yellow-100 p-2 rounded border mb-1 text-sm font-bold ml-2';
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
 //console.log('Using clipboard item:', item);
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
     // console.log('Populating task automation dropdown with', tasks.length, 'items');
      addClipboardItemsToDropdown(tasks, taskSelect, 'task');
    }
    
    // Populate survey automation dropdown 
    const surveySelect = panel.querySelector('#surveyAutomationSelect');
    if (surveySelect) {
    //  console.log('Populating survey automation dropdown with', surveys.length, 'items');
      addClipboardItemsToDropdown(surveys, surveySelect, 'survey');
    }


    // Populate approfile automation dropdown
    const approfileSelect = panel.querySelector('#approfileAutomationSelect');
    if (approfileSelect) {
    //  console.log('Populating approfile automation dropdown with', approfiles.length, 'items');
      addClipboardItemsToDropdown(approfiles, approfileSelect, 'approfile');
    }
    
    // Populate manager automation dropdown (if you want managers in automations too)
    const managerSelect = panel.querySelector('#managerAutomationSelect');
    if (managerSelect) {
    //  console.log('Populating manager automation dropdown with', managers.length, 'items');
      addClipboardItemsToDropdown(managers, managerSelect, 'manager');
    }
    
    // Also populate the main manager dropdown in the header section
    const headerManagerSelect = panel.querySelector('#managerSelect');
    if (headerManagerSelect) {
     // console.log('Populating header manager dropdown with', managers.length, 'items');
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
    
    console.log('loadTaskSteps()',taskId);
    try {
      const steps = await executeIfPermitted(state.user, 'readTaskSteps', { taskId });
      state.steps = steps || [];
      
    //  console.log('Loaded steps:', state.steps);
      
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




// Populate the attachment dropdown for the Payments tab
async function populatePaymentPlansDropdown(panel) {
  console.log('populatePaymentPlansDropdown()');
  
  const dropdown = panel.querySelector('#attachmentSelect');
  if (!dropdown) return;
  
  // Show loading state
  dropdown.innerHTML = '<option value="">Loading plans...</option>';
  dropdown.disabled = true;
  
  try {
    // Use your EXISTING registry function (no new code needed) also done again line 800?
//    const plans = await registry.readAllActivePaymentPlans(supabase, state.user, {});
  const plans = await executeIfPermitted(state.user, 'readAllActivePaymentPlans', {});  
    if (plans?.length) {
      // Clear and add options
      dropdown.innerHTML = '<option value="">Select a plan...</option>';
      
      plans.forEach(plan => {
        const option = document.createElement('option');
        option.value = plan.id;
        // Match your display style: name + price
        option.textContent = `${plan.name} (${plan.amount} ${plan.currency})`;
        dropdown.appendChild(option);
      });
      
      dropdown.disabled = false;
      console.log(`Loaded ${plans.length} payment plans`);
    } else {
      dropdown.innerHTML = '<option value="">No payment plans found</option>';
      console.warn('⚠️ No active payment plans found');
    }
  } catch (error) {
    console.error('Failed to load payment plans:', error);
    dropdown.innerHTML = '<option value="">Error loading plans</option>';
  }
}




function getTemplateHTML() {
  return `
    <div id="editTaskDialog" class="edit-task-dialogue relative z-10 flex flex-col h-full" data-destination="new-panel">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 z-10 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-xl font-semibold text-gray-900">Edit Task  </h3>
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

<!-- NEW: Tab-based attachment system -->
<div id="attachmentControls" class="mt-6 bg-green-50 p-4 rounded border border-green-300">
  <h5 class="font-medium text-green-800 mb-3">Add Attachment</h5>
  
  <!-- Tabs -->
  <div class="flex gap-2 mb-4 border-b border-gray-200 pb-2" id="attachmentTabs">
    <button class="tab-btn px-3 py-1 text-sm rounded-t border border-transparent hover:bg-gray-100" data-tab="tasks">📋 Tasks</button>
    <button class="tab-btn px-3 py-1 text-sm rounded-t border border-transparent hover:bg-gray-100" data-tab="surveys">📝 Surveys</button>
    <button class="tab-btn px-3 py-1 text-sm rounded-t border border-transparent hover:bg-gray-100" data-tab="appros">🔗 Connections</button>
    <button class="tab-btn px-3 py-1 text-sm rounded-t border border-transparent hover:bg-gray-100" data-tab="payments">💳 Payments</button>
  </div>
  
  <!-- Dropdown + options -->
  <div class="mb-3">
    <label for="attachmentSelect" class="block text-sm font-medium text-gray-700 mb-1">Select:</label>
    <select id="attachmentSelect" class="w-full p-2 border rounded">
      <option value="">Select an item...</option>
    </select>
  </div>
  
  <!-- Relationships dropdown (only for appros tab) -->
  <div id="relationshipSelector" class="mb-3 hidden">
    <label for="relationshipSelect" class="block text-sm font-medium text-gray-700 mb-1">Relationship:</label>
    <select id="relationshipSelect" class="w-full p-2 border rounded">
      <option value="">Select relationship...</option>
    </select>
  </div>
  
  <!-- Visibility checkbox (hidden for payments) -->
  <label id="visibilityCheckbox" class="flex items-center gap-2 mb-3">
    <input type="checkbox" name="is_visible" checked class="rounded border-gray-300">
    <span class="text-sm text-gray-600">Show to users (uncheck to hide)</span>
  </label>





  <!-- Tasks tab dropdown -->
<select id="taskAutomationSelect" class="w-full p-2 border rounded">
  <option value="">Select a task...</option>
</select>

<!-- Surveys tab dropdown -->
<select id="surveyAutomationSelect" class="w-full p-2 border rounded">
  <option value="">Select a survey...</option>
</select>

<!-- Approfiles tab dropdown -->
<select id="approfileAutomationSelect" class="w-full p-2 border rounded">
  <option value="">Select an approfile...</option>
</select>



  
  
  <!-- Save button -->
  <button type="button" id="saveAttachmentBtn" class="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
    Add Attachment
  </button>
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
  //const urlInput = panel.querySelector('#taskUrl');
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
  saveTaskBtn.disabled = false;
    saveTaskBtn.textContent = 'Update Task';
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

   // console.log('Selected step order:', stepOrder);
    
    // Find step with this order (In edit survey find id)
    const step = state.steps.find(s => parseInt(s.step_order) === stepOrder);// where's this from?
  //  console.log('Found step:', step);
    
    if (step) {
      state.currentStepId = step.id; //where does step.id decalred line 30 as null. Never assigned
      // Fill form with step data
      panel.querySelector('#stepName').value = step.name || '';
      panel.querySelector('#stepDescription').value = step.description || '';
      panel.querySelector('#stepUrl').innerHTML = step.external_url || '';
      panel.querySelector('#stepOrder').value = stepOrder; 
  //    console.log('Form filled with step data');

    } else {
      // Clear form for new step
      panel.querySelector('#stepName').value = '';
      panel.querySelector('#stepDescription').value = '';
      panel.querySelector('#stepUrl').value = '';
      panel.querySelector('#stepOrder').value = stepOrder;
  //    console.log('Form cleared for new step');
    }
  });

  // Button listeners - are these redunant?
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
// ONE click listener on save button:
panel.querySelector('#saveAttachmentBtn')?.addEventListener('click', async (e) => {
  e.stopPropagation();
  
  // ✅ Get active tab
//  const activeTab = panel.querySelector('#attachmentTabs .tab-btn.border-green-600')?.dataset.tab;
   
  // ✅ Read from the correct dropdown based on active tab
  let selectedValue = null;
  let selectedDropdown = null;
  
  if (activeTab === 'payments') {
    selectedDropdown = panel.querySelector('#attachmentSelect');
  } else if (activeTab === 'tasks') {
    selectedDropdown = panel.querySelector('#taskAutomationSelect');
  } else if (activeTab === 'surveys') {
    selectedDropdown = panel.querySelector('#surveyAutomationSelect');
  } else if (activeTab === 'appros') {
    selectedDropdown = panel.querySelector('#approfileAutomationSelect');
  }
  
  selectedValue = selectedDropdown?.value;
  console.log('selected Value:',selectedValue, 'active tab:',activeTab);
  // ✅ Validate: Must have a selection in the ACTIVE tab
  if (!selectedValue) {
    showToast('Please select an item', 'error');
    return;
  }
  
  // ✅ Route to correct handler
  if (activeTab === 'payments') {
    await handlePaymentAttachmentSubmit(e, panel);
  } else if (activeTab === 'tasks') {
    await handleTaskAutomationSubmit(e, panel);
  } else if (activeTab === 'surveys') {
    await handleSurveyAutomationSubmit(e, panel);
  } else if (activeTab === 'appros') {
    await handleRelationshipAutomationSubmit(e, panel);
  }
});

//new april 19
  // Payment plan selection listener (new)
  const attachmentSelect = panel.querySelector('#attachmentSelect');
  const saveAttachmentBtn = panel.querySelector('#saveAttachmentBtn');
  
  attachmentSelect?.addEventListener('change', () => {
    if (attachmentSelect.value) {
      saveAttachmentBtn.disabled = false;
    } else {
      saveAttachmentBtn.disabled = true;
    }
  });

// ✅ ADD THESE THREE CHANGE LISTENERS (after the payments listener):

// Task dropdown change listener
panel.querySelector('#taskAutomationSelect')?.addEventListener('change', (e) => {
  const saveBtn = panel.querySelector('#saveAttachmentBtn');
  if (saveBtn) {
    saveBtn.disabled = !e.target.value;
  }
});

// Survey dropdown change listener
panel.querySelector('#surveyAutomationSelect')?.addEventListener('change', (e) => {
  const saveBtn = panel.querySelector('#saveAttachmentBtn');
  if (saveBtn) {
    saveBtn.disabled = !e.target.value;
  }
});

// Appro dropdown change listener
panel.querySelector('#approfileAutomationSelect')?.addEventListener('change', (e) => {
  const saveBtn = panel.querySelector('#saveAttachmentBtn');
  if (saveBtn) {
    saveBtn.disabled = !e.target.value;
  }
});


// april 19 reinstated 12:06 April 24 - but with this there is a false 'please select payment plan' toast

  panel.querySelectorAll('#attachmentTabs .tab-btn').forEach(btn => {
    btn?.addEventListener('click', (e) => {
      const tabId = e.currentTarget.dataset.tab;
      switchAttachmentTab(panel, tabId);
    });
  });


  // Initialize with Tasks tab active
  switchAttachmentTab(panel, 'tasks');

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
    
    const saveAttachmentBtn = panel.querySelector('#saveAttachmentBtn');
    if (!saveAttachmentBtn) {
        showToast('Save button not found', 'error');
        return;
    }
    
    saveAttachmentBtn.disabled = true;
    saveAttachmentBtn.textContent = 'Saving...'; //? 
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
   //         console.log('Found initial step_id:', state.initialStepId);  // got it 10:58 Oct 15
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

//regisrty needs     const { source_task_step_id, source_task_header_id,target_task_header_id, target_task_step_id, name, automation_number } = payload;
const result = await executeIfPermitted(state.user, 'createAutomationAddTaskByTask', { 
       source_task_step_id : state.currentStepId, //works, but in survey it is undefined  12:18 Nov 30
       //student_id: state.user, //the person being assigned to the task that person is not known when editing the automation.
       manager_id: managerData.managerId, // needs to be from the dropdown    
       target_task_header_id: selectedTaskId,
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
    
    saveAttachmentBtn.disabled = false;
    saveAttachmentBtn.textContent = 'Save Task';
}


async function handlePaymentAttachmentSubmit(e, panel) {
  console.log('handlePaymentAttachmentSubmit()');

  console.log('🚨 PAYMENT HANDLER CALLED:', {
    activeTab,
    caller: 'handlePaymentAttachmentSubmit',
    stack: new Error().stack?.split('\n').slice(1, 3).join('\n')
  });


  console.count('UI_TRIGGER'); // Log 1
  e.preventDefault();
    e.stopPropagation();
  


  const attachmentSelect = panel.querySelector('#attachmentSelect');
  const selectedPlanId = attachmentSelect?.value;
  
  const saveAttachmentBtn = panel.querySelector('#saveAttachmentBtn');
  if (!saveAttachmentBtn) {
    showToast('Save button not found', 'error');
    return;
  }
  
  if (!selectedPlanId) {
    showToast('Please select a payment plan', 'error');
    return;
  }
  
  // Disable button during save
  saveAttachmentBtn.disabled = true;
  saveAttachmentBtn.textContent = 'Saving...';
  
  try {
    // Get the selected plan details (for display) - also done on line 320?
    const plans = await executeIfPermitted(state.user, 'readAllActivePaymentPlans', {});
    const selectedPlan = plans.find(p => p.id === selectedPlanId);
    const planName = selectedPlan?.name || 'Unknown Plan';
    
    // Determine target_type: 'task' for header, 'task_step' for step
    const targetType = state.currentStepId ? 'task_step' : 'task';
    const targetId = state.currentStepId || state.currentTaskId;
    
    // Call your RPC with hardcoded registry ID (no extra lookup needed)
    const result = await executeIfPermitted(state.user, 'createAttachmentPaymentButton', {//state.user wrong id
      auto_registry_id: 'd1f2028e-95fa-4a9b-ae6f-ff4753d5913d',  
      payment_plan_id: selectedPlanId,
      planName:planName,
      target_type: targetType,
      target_id: targetId,
      source_task_header_id: state.currentTaskId,
      source_task_step_id: state.currentStepId || null,
      is_visible: true
    });
    
    // Show confirmation (matches your existing pattern)
    addInformationCard({
      'name': `${planName?.substring(0, 60) || 'Unknown Plan'}...`,
      'type': 'payment_button',
      'step': state.currentStepId || 'header',
      'planId': `${selectedPlanId?.substring(0, 8) || 'unknown'}...`,
      'id': `${result.id?.substring(0, 8) || 'unknown'}...`
    });
    
    showToast('Payment attachment saved successfully!');
    
    // Reload automations display -- not sure why this is looking for the step that the student
  
   renderTaskStructure(panel);
  
    
  } catch (error) {
    console.error('Failed to save payment attachment:', error);
    showToast('Failed to save: ' + error.message, 'error');
  }
  
  // Re-enable button
  saveAttachmentBtn.disabled = false;
  saveAttachmentBtn.textContent = 'Add Attachment';
  
  // Reset dropdown (reuse existing variable)
  if (attachmentSelect) {
    attachmentSelect.value = '';
  }
}






function addInformationCard(stepData) { 
  console.log('addInformationCard()');
  const infoSection = document.querySelector('#informationSection');
  const card = document.createElement('div');
 // card.className = 'bg-white p-2 rounded border mb-1 text-sm';
 const style = styleCardByType(stepData.type);
// console.log('style:',style);
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
//  console.log('type',stepData.type);
  const icon = getIconByType(stepData.type);
  card.textContent = icon + displayText;
  infoSection.appendChild(card);
  
  // Add to steps array
  state.steps.push(stepData);
//  console.log('steps array:', state.steps);
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
          managerId = appState.query.defaultManagerId;
          managerName = appState.query.defaultManagerName;
      }
  } else {
      // No selection or invalid selection - use default
          managerId = appState.query.defaultManagerId;
          managerName = appState.query.defaultManagerName;
  }
  
//  console.log('Selected manager:', managerId, managerName);
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
  
  const saveAttachmentBtn = panel.querySelector('#saveAttachmentBtn');
  if (!saveAttachmentBtn) {
      showToast('Save button not found', 'error');
      return;
  }
  
  saveAttachmentBtn.disabled = true;
  saveAttachmentBtn.textContent = 'Saving...'; //? 
  automationsNumber++;    
  
  //this could be a function

  const initialStep = state.steps.find(step => step.step_order === 3);
  if (initialStep && initialStep.id) {
      state.initialStepId = initialStep.id;
   //   console.log('Found initial step_id:', state.initialStepId);  // got it 10:58 Oct 15
  } else {
      throw new Error(`No initial step (step 3) found for task ${selectedTaskId}`);
  }

  
try{
console.log('state?',state,  'state.currentTask.id',state.currentTask.id,
  'state.initialStepId',state.initialStepId, //need this 
  'state.currentId',state.currentStepId, //undefined 16:34 nov 30
  'surveyId',selectedSurveyId, 
  'name',surveyCleanName, 
'auto#',automationsNumber, 'this number should be based on reading if there are already autos.');

//function needs: const { source_task_header_id, source_task_step_id, target_survey_header_id, name, automation_number } = payload;
//table needs: source_task_step_id, survey_header_id, name, automation_number

const result = await executeIfPermitted(state.user, 'createAutomationAddSurveyByTask', { 
            source_task_header_id:state.currentTask.id,
            source_task_step_id : state.currentStepId, //need this --Jan 23 seems correct? <-------------------------  
            target_survey_header_id : selectedSurveyId, //<-------------becomes undefined. was missing 'target' prefix
            name: surveyCleanName, 
            automation_number: automationsNumber
     });
     
     console.log('editSurvey-surveyByTask result',result);
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
  saveAttachmentBtn.disabled = false;
  saveAttachmentBtn.textContent = 'Save Survey';
}





//new 19:40 Nov 12

  async function handleRelationshipAutomationSubmit(e, panel) {
    console.log('handleRelationshipAutomationSubmit()');
    e.preventDefault();
    
    const approfileSelect = panel.querySelector('#approfileAutomationSelect'); // Changed ID to match task module
    const relationshipSelect = panel.querySelector('#relationshipSelect'); // Changed ID to match task module
    
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
        console.log('state.currentStepId',state.currentStepId, 'selectedApproId:', selectedApproId); //
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
       // console.log('checkIfExists:', existing);
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
//    if (!state.currentTaskId || !state.user) { //<---- the sandbox deploy is failing here. why is userId undefined?
//removed the test for state.user  (The save of task_header doesnt have this test)
    if (!state.currentTaskId) { //<---- 
          showToast('Task not loaded', 'error');
      console.log('state',state);
      return;
    }    
    const order = parseInt(panel.querySelector('#stepOrder')?.value);//but if clicked summary?
    const stepName = panel.querySelector('#stepName')?.value.trim();
    const stepDescription = panel.querySelector('#stepDescription')?.value.trim();
    const stepUrl = panel.querySelector('#stepUrl')?.value.trim();
    const saveBtn = panel.querySelector('#saveStepBtn');
  
      // Task specific that steps 1 & 2 are system steps that cannot be edited
    if (order < 3) {
      showToast('Steps 1 and 2 are system-managed and cannot be edited.', 'error');
      return;
    }  
  
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving Step...';
  
    try {
      // ✅ DEBUG: Log what we're looking for
   //   console.log('Looking for step with order:', order);
    //  console.log('Available steps:', state.steps);
      
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
    const taskBtn = panel.querySelector('#saveAttachmentBtn');
    const relBtn = panel.querySelector('#saveAttachmentBtn');
  
    [taskBtn, relBtn].forEach(btn => {
      if (btn) {
        btn.disabled = false;
        btn.style.pointerEvents = 'auto';
        btn.style.opacity = '1';
      }
    });
  }
  

function loadStepIntoEditor(panel,clickedStepId){//clicked is the id uuid
 // console.log('loadStepIntoEditor() clickedStepId:', clickedStepId, 'typeof:', typeof clickedStepId);
  //console.log('steps length:', Array.isArray(state.steps) ? state.steps.length : 'not array');
 // console.log('available ids of all the steps:', (state.steps || []).map(s => s.id));
  state.currentStepId = clickedStepId; //the card that was clicked sets the current step.
//console.log('state.currentStepId:',state.currentStepId); // should be == clickedStepId


//Task just has stps, but the module for editSurvey has to find if questions or answers, but task just has steps

const step = state.steps.find(s => s.id === clickedStepId); //extract this steps data from the array of al the steps data
//  console.log('Looking for clickedStepId:', clickedStepId, 'in', state.steps.map(s => s.id));
  
  if (step) { stepOrder = step.step_order; // console.log('state,steps:',state.steps,'stepId',stepId,'step.stepOrder:', step.step_order); // undefined 23:07 24 Nov
    // Fill form with step data
    panel.querySelector('#stepName').value = step.name || '';
    panel.querySelector('#stepDescription').value = step.description || '';
    panel.querySelector('#stepUrl').value = step.external_url || '';
    panel.querySelector('#stepOrder').value = stepOrder; // Ensure this is set
  //  console.log('Form filled with step data');
} else{console.log('Was it the header that was clicked?'); }
}


async function handleDeleteAutomationButton(panel, automationId){
  const deletedBy = state.user;  //WRONG
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
//console.log('steps listener event:', target); // responds
    const saveBtn = panel.querySelector('#saveTaskBtn');
    // Save button optional; do not hard-depend on it to load the editor
    const sectionToEditEl = panel.querySelector('#editSectionLabel'); // optional status label

    if (target.classList.contains('clickable-step')) {
      
      const clickedStepId = target.dataset.stepId; // is this an id or a DOM element?
      state.currentStepId = clickedStepId;
      
  //    console.log('target.dataset',target.dataset); //stepOrder is never set??? Dec 6
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
      
 //     console.log('Clicked the:',target.textContent);
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
  card.className = 'clickable-step hover:scale-105 transition-transform bg-gray-50 border-l-4 border-orange-400 rounded-lg p-3 mb-2 shadow-sm hover:shadow-md';
  card.innerHTML = `
    <strong>Task: ${task.name}</strong>
    ${task.description ? `<div class="text-sm text-gray-700">${task.description.substring(0,200) }...</div>` : ''}
    ${task.external_url ? `<div class="text-xs text-blue-600">${task.external_url}</div>` : ''}
  `;

  list.appendChild(card);
}


function renderStepCard(summary,step){

    const stepCard = document.createElement('div');
    //edit survey has 'type' here  
    stepCard.className = 'clickable-step hover:scale-105 transition-transform bg-blue-50 border-l-4 border-blue-400 rounded-lg p-3 mb-2 shadow-sm hover:shadow-md ml-2';
    stepCard.dataset.stepId = step.id;//stepId? Never has a value.was and is null. 
    stepCard.innerHTML = `
      <strong>Step ${step.step_order}:</strong> ${step.name}
      <span class="block text-sm text-gray-600 whitespace-pre-line">${step.description || ''}</span>
     ${step.external_url ? `<div class="text-xs text-blue-600">${step.external_url}</div>` : ''}
      `;

    summary.appendChild(stepCard);
}


function markActiveStepInSummary(panel) {
    console.log('markActiveStepInSumary()');
  panel.querySelectorAll('.clickable-step').forEach(el => {
 //   console.log('el.dataset.stepId',el.dataset.stepId, 'currentStepId',state.currentStepId);
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
  try {console.log('loadStepAutomations for stepId',stepId); // after clicking stap3 the code seems to be using step5   23:53 Jan 22
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
//console.log('automation',auto);
    // choose border color per type
    const borderClass =
      auto.taskHeaderId ? 'border-yellow-500' :
      auto.survey_header_id ? 'border-yellow-500' :
      auto.relationship ? 'border-yellow-400' : 'border-yellow-300';
    p.classList.add(borderClass);

const autoType = auto.target_data.target.type;//in display it is the kind of automation that is important
const autoName = auto.name || null;
const autoSourceStep = auto.source_data.secondary || null;
const autoApproIs = auto.target_data.payload.appro_is_id || null;
const autoRelationship = auto.target_data.payload.relationship || null;
const autoOfAppro = auto.target_data.payload.of_appro_id || null;

console.log('autoType',autoType,'autoName',autoName,'autoSourceStep',autoSourceStep,'autoApproIs',autoApproIs,'autoRelationship',autoRelationship,'autoOfAppro',autoOfAppro);
    if (autoType==='task') {
      p.innerHTML = `automation🚂🔧 <strong>Task:</strong> Assign to "${autoName || 'Unknown Task'}" → assigned to step ${autoSourceStep || 'Initial'} "${autoSourceStep}"}`;
    } 
else if (autoType ==='survey') {
      p.innerHTML = `automation🚂📜 <strong>Survey:</strong> Assign to "${auto.name || 'Unknown Survey'}" "${autoSourceStep}"`;
    } 
else if (autoType==='relate') {
      p.innerHTML = `automation🚂🖇️ <strong>Relation:</strong>  <strong>Respondent ${autoApproIs}</strong>[${autoApproIs ||'id?'} ] is → ${autoRelationship} → of <strong> ${auto.name}</strong>[id:${autoOfAppro}] "${auto.sourceSourcestep}"` ;
    } 
else if (autoType === 'payment') {
  // Payment button - render interactive button, not static card
  //const planId = auto.target_data?.target?.header || auto.payment_plan_id;
  
  // For display: show plan name (fetch from cache or use fallback)
 const planName = auto.name || 'Payment Plan';
  
  p.className = 'clickable-automation hover:scale-105 transition-transform bg-indigo-50 border-l-4 border-indigo-500 rounded-lg p-3 mb-2 shadow-sm hover:shadow-md';
  p.innerHTML = `
    <div class="flex items-center gap-2">
      <span class="text-gray-700">💳${(planName)}</span>
    </div>
  `;
  /*
  // Add the actual clickable button below the card
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'ml-2 mt-2';
  
  // Build checkout URL with runtime user info
  // Note: variantId comes from payment_plans.provider_plan_id (fetched separately)
  // For now, we'll use a placeholder - you can fetch plan details if needed
  const checkoutUrl = `#`;  // Will be updated after fetching plan details
  
  buttonContainer.innerHTML = `
    <a href="${checkoutUrl}" 
       target="_blank" 
       rel="noopener noreferrer"
       class="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition text-xs font-medium"
       data-plan-id="${planId}"
       data-automation-id="${auto.id}">
       Buy Now
    </a>
  `;
  
  // Store planId for later URL resolution
  buttonContainer.dataset.planId = planId;
  
  p.appendChild(buttonContainer);
  */
} 
else {
  p.innerHTML = `❓ <strong>Not understood:</strong> ${JSON.stringify(auto)} "${autoSourceStep}"`;
}


    /*
    if (auto.task_header_id) {
      p.innerHTML = `automation🚂🔧 <strong>Task:</strong> Assign to "${auto.name || 'Unknown Task'}" → assigned to step ${auto.task_step_id || 'Initial'} "${auto.source_task_step_id}"}`;
    } else if (auto.survey_header_id) {
      p.innerHTML = `automation🚂📜 <strong>Survey:</strong> Assign to "${auto.name || 'Unknown Survey'}" "${auto.source_task_step_id}"`;
    } else if (auto.relationship) {
      p.innerHTML = `automation🚂🖇️ <strong>Relation:</strong>  <strong>${auto.approIsName || 'Respondent'}</strong>[${auto.approIsId ||'id?'} ] is → ${auto.relationship} → of <strong> ${auto.name}</strong>[id:${auto.of_appro_id}] "${auto.source_task_step_id}"` ;
    } else {
      p.innerHTML = `❓ <strong>default:</strong> ${JSON.stringify(auto)} "${auto.source_task_step_id}"`;
    }
*/
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
    // ... end of automations.forEach ...
  
  // Resolve payment button URLs (async, but doesn't block render)
  resolvePaymentButtonUrls(container);


}

async function populateRelationshipsDropdown(panel) {
  console.log('populateRelationshipsDropdown()');
  
  const dropdown = panel.querySelector('#relationshipSelect');
  if (!dropdown) return;
  
  dropdown.innerHTML = '<option value="">Loading relationships...</option>';
  dropdown.disabled = true;
  
  try {
    // ✅ Use existing registry function:
    const relationships = await executeIfPermitted(state.user, 'readRelationships', {});
    
    if (relationships?.length) {
      dropdown.innerHTML = '<option value="">Select relationship...</option>';
      
      relationships.forEach(rel => {
        const option = document.createElement('option');
        option.value = rel.name;  // e.g., '(]member_of[)'
        option.textContent = rel.name;
        dropdown.appendChild(option);
      });
      
      dropdown.disabled = false;
      console.log(`Loaded ${relationships.length} relationships`);
    } else {
      dropdown.innerHTML = '<option value="">No relationships found</option>';
    }
  } catch (error) {
    console.error('Failed to load relationships:', error);
    dropdown.innerHTML = '<option value="">Error loading relationships</option>';
  }
}




// Resolve checkout URLs for payment buttons after render
async function resolvePaymentButtonUrls(container) {
  const buttons = container.querySelectorAll('[data-plan-id]');
  if (!buttons.length) return;
  
  // Fetch all plans once
  const plans = await executeIfPermitted(state.user, 'readAllActivePaymentPlans', {});
  
  buttons.forEach(btn => {
    const planId = btn.dataset.planId;
    const plan = plans.find(p => p.id === planId);
    
    if (plan?.provider_plan_id) {
      const variantId = plan.provider_plan_id;
      const approId = state.user;  // Runtime user ID
      const checkoutUrl = `https://myorg.lemonsqueezy.com/checkout/buy/${variantId}?embed=1&checkout[custom][appro_id]=${approId}`;
      btn.href = checkoutUrl;
      
      // Update button text with plan details
      btn.textContent = `${plan.name} - ${plan.amount} ${plan.currency}`;
    }
  });
}






//April 19
// Simple tab switcher for attachments - UI only, no data loading yet
async function switchAttachmentTab(panel, tabId) {
  console.log('switchAttachmentTab:', tabId);
  activeTab = tabId; 
  // ... existing visual tab button update code ...
  
  // ✅ Show/hide dropdowns based on active tab
  const dropdowns = {
    'tasks': panel.querySelector('#taskAutomationSelect'),
    'surveys': panel.querySelector('#surveyAutomationSelect'),
    'appros': panel.querySelector('#approfileAutomationSelect'),
    'payments': panel.querySelector('#attachmentSelect')
  };
  
  // Hide all, show active
  Object.values(dropdowns).forEach(dd => {
    if (dd) dd.classList.add('hidden');
  });
  if (dropdowns[tabId]) {
    dropdowns[tabId].classList.remove('hidden');
    dropdowns[tabId].disabled = false;
  }
  
  // ✅ ONLY reset/populate the payments dropdown (it uses #attachmentSelect)
  if (tabId === 'payments') {
    const dropdown = panel.querySelector('#attachmentSelect');
    if (dropdown) {
      dropdown.innerHTML = '<option value="">Loading plans...</option>';
      dropdown.disabled = true;
    }
    await populatePaymentPlansDropdown(panel);  // ✅ Already exists
  } else if (tabId === 'appros') {
  const approfiles = getClipboardItems({ as: 'other' });
  addClipboardItemsToDropdown(approfiles, panel.querySelector('#approfileAutomationSelect'));
  
  // ✅ Load relationships from DB using existing function
  await populateRelationshipsDropdown(panel);
  
  // Show relationship selector
  panel.querySelector('#relationshipSelector')?.classList.remove('hidden');
}
  // ✅ For other tabs: dropdowns already populated by populateFromClipboardAuto() elsewhere
  
  // Show/hide relationship selector (only for appros)
  const relationshipSelector = panel.querySelector('#relationshipSelector');
  if (relationshipSelector) {
    relationshipSelector.classList.toggle('hidden', tabId !== 'appros');
  }
  
  // Show/hide visibility checkbox (hidden for payments)
  const visibilityCheckbox = panel.querySelector('#visibilityCheckbox');
  if (visibilityCheckbox) {
    visibilityCheckbox.style.display = (tabId === 'payments') ? 'none' : 'flex';
  }
  
  // Disable save button until item selected
  const saveBtn = panel.querySelector('#saveAttachmentBtn');
  if (saveBtn) saveBtn.disabled = true;
}


