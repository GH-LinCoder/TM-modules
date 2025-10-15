// ./work/tasks/createTaskForm.js
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { appState } from '../../state/appState.js';
import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';
import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';
import {icons} from '../../registry/iconList.js';

console.log('createTaskForm.js loaded');

const userId = appState.query.userId;
let automationsNumber = 0;
let currentStep = 3;  // this was "currentStepId = 3" which was a stupid name.  A step id is :uuid not an integer.
let  currentStepId = null;
// Module-level state (instead of class properties)
let taskId = null;
let steps = [];

export function render(panel, query = {}) {
  console.log('Render(', panel, query, ')');
  panel.innerHTML = getTemplateHTML();
  attachListeners(panel);
  
  // Initialize clipboard integration
  initClipboardIntegration(panel);
}

// Need to change this to suit new location
function styleCardByType(type){
    console.log('styleCardByType()',type);
    switch(type){
        case 'survey':return 'bg-white p-2 rounded border mb-3 text-lg font-bold';
        case 'Question':return 'bg-yellow-100 p-2 rounded border mb-1 text-sm font-bold';
        case 'Answer':return 'bg-orange-100 p-2 rounded border mb-1 text-sm font-style: italic ml-4';
        case 'Task automation':return 'bg-blue-100 p-2 border-dotted border-blue-500 rounded border mb-1 text-sm ml-6';    
        case 'Appro automation':return 'bg-green-100 p-2 border-dotted border-green-500 rounded border mb-1 text-sm ml-6';
    default:return 'bg-gray-100 p-2 rounded border mb-1 text-sm';
    }   
}

function getIconByType(type) {
    switch(type){
      case 'task': return icons.task;
      //case 'Question': return icons.question
      //case 'Answer': return icons.answer;
      //case assignTask: return icons.assignTask;
      //case 'Task automation': return icons.task;
      //case 'Appro automation': return icons.relationships;
      default: return icons.display;
    }
  }

function initClipboardIntegration(panel) {
  // Populate from clipboard immediately
  populateFromClipboard(panel);
  
  // Listen for clipboard updates
  onClipboardUpdate(() => {
    populateFromClipboard(panel);
  });
   //       panel.innerHTML+=petitionBreadcrumbs();//this reads 'petition' and prints the values at bottom of the render panel
  
}
function populateFromClipboard(panel) {
    console.log('populateFromClipboard()');
    
    // Get clipboard items
    const tasks = getClipboardItems({ as: 'task' });
    const approfiles = getClipboardItems({ as: 'other' });
    const managers = getClipboardItems({ as: 'manager' });
    
    console.log('Clipboard items loaded:', {
      tasks: tasks.length,
      approfiles: approfiles.length,
      managers: managers.length
    });
    
    // Populate task automation dropdown
    const taskSelect = panel.querySelector('#taskAutomationSelect');
    if (taskSelect) {
      console.log('Populating task automation dropdown with', tasks.length, 'items');
      addClipboardItemsToDropdown(tasks, taskSelect, 'task');
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


  function addClipboardItemsToDropdown(items, selectElement, type) {
    console.log('addClipboardItemsToDropdown()', type, items.length);
    
    if (!items || items.length === 0) return;
    
    // Clear existing clipboard options (keep the default option)
    const existingClipboardOptions = Array.from(selectElement.querySelectorAll('option[data-source="clipboard"]'));
    existingClipboardOptions.forEach(option => option.remove());
    
    // Add new clipboard items
    items.forEach(item => {
      const option = document.createElement('option');
      option.value = item.entity.id;
      option.textContent = `${item.entity.name} (clipboard)`;  //why are we adding clipboard to the display? (Which we then have to remove)
      option.dataset.source = 'clipboard';
      option.dataset.name = item.entity.name;
      selectElement.appendChild(option);
    });
    
    console.log('Added', items.length, 'clipboard items to', type, 'dropdown');
  }



// In createTaskForm.js, modify the getTemplateHTML function to include automation cards:
function getTemplateHTML() {
    return `
      <div id="createTaskDialog" class="create-task-dialogue relative z-10 flex flex-col h-full">
        <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 z-10 max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b border-gray-200 flex justify-between items-center">
            <h3 class="text-xl font-semibold text-gray-900">Create New Task  17:00 Oct 15</h3>
            <button data-action="close-dialog" class="text-gray-500 hover:text-gray-700" aria-label="Close">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
<!--  INSTRUCTIONS  TASKS  -->                           
                    <div class="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                       <h4 class="text-ml font-bold text-blue-500 mb-4">There are many types of task</h4>
                       <ul class="list-disc list-inside mt-2 text-sm text-blue-500">
                        
                        <li> A text heavy or video training course</li>
                        <li> An empty set of markers to track the progress of some process</li>
                        <li> A self-managed process</li>
                        <li> A supervised process managed by someone else</li>
                        <li> A computer only process with no human involvement</li>
                        <li> You can build your own tasks and attach automations</li>
                        <li> The first step is to have a unique and meaningful name for your new task</li>
                        </li><li>For more guidance click [How?] </li>
                       </ul>  
                    </div>



          <div class="p-6">
            <div class="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 class="font-medium text-blue-800 mb-2">Instructions:</h4>
              <p class="text-blue-700 text-sm">
                . 
                First check if a suitable task already exists. 
                Plan your task. You may want to copy paste from an editor.
                Try to have a name that has obvious meaning and appeal.
              </p>
              <p class="text-blue-700 text-sm mt-2">
                📋 Managers from your clipboard are available for assignment when you create steps.
              </p>
            </div>
  
            <!--  Manager Select  -->
            <div class="space-y-2">
              <label for="managerSelect" class="block text-sm font-medium text-gray-700">Select Manager</label>
              <select id="managerSelect" data-form="managerSelect" class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Select a manager (optional)</option>
              </select>
            </div>
  
            <div id="createTaskForm" class="space-y-6 bg-gray-50 p-6 rounded-lg">
              <div>
                <label for="taskName" class="block text-sm font-medium text-gray-700 mb-1">
                  Task Name *
                </label>
                <input id="taskName" placeholder="Short & unique appealing task name" maxlength="64" required class="w-full p-2 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                <p id="taskNameCounter" class="text-xs text-gray-500 mt-1">0/64 characters</p>
              </div>
  
              <div>
                <label for="taskDescription" class="block text-sm font-medium text-gray-700 mb-1">
                  Task Description *
                </label>
                <textarea id="taskDescription" placeholder="Task description" rows="4" maxlength="2000" required class="w-full p-2 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
                <p id="taskDescriptionCounter" class="text-xs text-gray-500 mt-1">0/2000 characters</p>
              </div>
  
              <div>
                <label for="taskUrl" class="block text-sm font-medium text-gray-700 mb-1">
                  URL (Optional)
                </label>
                <input id="taskUrl" type="url" placeholder="https://example.com  " class="w-full p-2 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
  
              <button id="saveTaskBtn" class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
                Save Task
              </button>
            </div>
  
            <div id="stepsSection" class="opacity-50 pointer-events-none mt-6">
              <h4 class="text-lg font-medium mb-4">Create Task Steps</h4>
              <div class="bg-white p-4 rounded border">
                <form id="createStepForm" class="space-y-4">
                  <div class="flex items-center gap-4">
                    <label for="stepOrder" class="block text-sm font-medium text-gray-700">Step Order:</label>
                    <input id="stepOrder" type="number" value="3" min="3" class="w-20 p-2 border rounded" />
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
                    <input id="stepUrl" type="url" placeholder="https://example.com  " class="w-full p-2 border rounded" />
                  </div>
                  <button id="saveStepBtn" class="w-full bg-gray-200 py-2 px-4 rounded hover:bg-gray-300">
                    Save Step
                  </button>
                </form>
  
                <div id="createdSteps" class="hidden mt-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Created Steps:</label>
                  <div id="stepsList" class="space-y-1"></div>
                </div>
              </div>
            </div>
  
            <!-- AUTOMATIONS CARD - NEW ADDITION -->
            <div id="taskAutomationsCard" class="bg-green-50 p-4 rounded-lg border border-green-300 opacity-20 mt-6" style="pointer-events: none;">
              <h4 class="font-medium text-green-800 mb-2">Step Automations</h4>


<!--  INSTRUCTIONS  TASK AUTOMATION   -->                           
                    <div class="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                       <h4 class="text-ml font-bold text-blue-500 mb-4">Automations</h4>
                       <ul class="list-disc list-inside mt-2 text-sm text-blue-500">
                        <li> There are many different ways to use a task</li>
                        <li> You can attach automatic events that will run when a person moves to a step</li>
                        <li> To do this click the [Select] menu button</li>
                        <li> You can choose from any of the existing tasks</li>
                        <li> Which you can attach to the current step as an 'automation'</li>
                        <li> Later when someone is on your new task and reaches this step, 
                        your chosen action will automatically happen.
                        </li><li>For more guidance click [How?] </li>
                       </ul>  
                    </div>





              <p class="text-green-700 text-sm mb-4">
                When the person on the task reaches this step, I want the following actions to be performed automatically:
              </p>
              
              <!-- Assign Task Section -->
              <div class="mt-4 p-3 bg-white rounded border mb-4">
                <h5 class="font-medium text-gray-800 mb-2">Assign a task</h5>
                <div class="flex gap-2">
                  <select id="taskAutomationSelect" 
                          class="flex-1 p-2 border border-gray-300 rounded text-sm">
                    <option value="">Select a task to assign</option>
                  </select>
              </div>


             <!-- Manager Assignment Section -->
              <!div class="p-3 bg-white rounded border">
                <h5 class="font-medium text-gray-800 mb-2">Tasks have a manager, but you can appoint another one instead</h5>
                <div class="flex gap-2">
                  <select id="managerAutomationSelect" 
                          class="flex-1 p-2 border border-gray-300 rounded text-sm">
                    <option value="">Appoint a new manager</option>
                  </select>

                  <!--button type="button" id="saveManagerAutomationBtn" class="bg-purple-600 text-white py-1 px-3 rounded hover:bg-purple-700 opacity-50" style="pointer-events: none;">
                    Save Manager
                  </button-->              
              



                  <button type="button" id="saveTaskAutomationBtn" class="bg-purple-600 text-white py-1 px-3 rounded hover:bg-blue-700 opacity-50" style="pointer-events: none;">
                    Save Task Assignment automation
                  </button>
                  </div>
                </div>
              </div>
              

<!--  INSTRUCTIONS  APPRO -->                           
                    <div class="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                       <h4 class="text-ml font-bold text-blue-500 mb-4">Surveys</h4>
                       <ul class="list-disc list-inside mt-2 text-sm text-blue-500">
                        <li> Another kind of automation is to relate the student with some group or an abstract concept</li>
                        <li> If you attach a 'relate' automatic events this will happen when a person moves to this step</li>
                        <li> To do this click the [Select] menu button</li>
                        <li> You can choose from any of the 'appros' and then use the relationship dropdown to describe the relationship</li>
                        <li> You can then click to attach this automation to the current step</li>
                        <li> Later when someone is on your new task and reaches this step, 
                        your chosen action will automatically happen.
                        </li><li>For more guidance click [How?] </li>
                       </ul>  
                    </div>



              <!-- Relate to Category Section -->
              <div class="p-3 bg-white rounded border mb-4">
                <h5 class="font-medium text-gray-800 mb-2">Relate to a category</h5>
                <div class="flex gap-2 mb-2">
                  <select id="approfileAutomationSelect" 
                          class="flex-1 p-2 border border-gray-300 rounded text-sm">
                    <option value="">Select an appro</option>
                  </select>
                </div>
                <div class="flex gap-2">
                  <select id="relationshipAutomationSelect" 
                          class="flex-1 p-2 border border-gray-300 rounded text-sm">
                    <option value="">Select relationship</option>
                    <option value="member">member</option>
                    <option value="customer">customer</option>
                    <option value="explanation">explanation</option>
                    <option value="trainer">trainer</option>
                    <option value="trainee">trainee</option>
                  </select>
                  <button type="button" id="saveRelationshipAutomationBtn" class="bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700 opacity-50" style="pointer-events: none;">
                    Save Relationship automation
                  </button>
                </div>
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
       ${petitionBreadcrumbs()} 
      `;
  }

function attachListeners(panel) {   //managerAutomationSelect  
  console.log('attachListeners()', panel);
  
  panel.querySelector('#taskName')?.addEventListener('input', e => {
    panel.querySelector('#taskNameCounter').textContent = `${e.target.value.length}/64 characters`;
  });

  panel.querySelector('#taskDescription')?.addEventListener('input', e => {
    panel.querySelector('#taskDescriptionCounter').textContent = `${e.target.value.length}/2000 characters`;
  });

  panel.querySelector('#stepName')?.addEventListener('input', e => {
    panel.querySelector('#stepNameCounter').textContent = `${e.target.value.length}/64 characters`;
  });

  panel.querySelector('#stepDescription')?.addEventListener('input', e => {
    panel.querySelector('#stepDescriptionCounter').textContent = `${e.target.value.length}/2000 characters`;
  });

  panel.querySelector('#saveTaskBtn')?.addEventListener('click', (e) => handleTaskSubmit(e, panel));
  panel.querySelector('#saveStepBtn')?.addEventListener('click', (e) => handleStepSubmit(e, panel));
  panel.querySelector('[data-action="close-dialog"]')?.addEventListener('click', () => panel.remove());

        // Save task automation button
  panel.querySelector('#saveTaskAutomationBtn')?.addEventListener('click', (e) => handleTaskAutomationSubmit(e, panel));
 // panel.relationshipBtn.addEventListener('click', (e) => handleRelationshipAutomationSubmit(e, panel));



}

async function handleTaskSubmit(e, panel) {
  e.preventDefault();
  console.log('handleTaskSubmit(e)');

  const taskName = panel.querySelector('#taskName')?.value.trim();
  const taskDescription = panel.querySelector('#taskDescription')?.value.trim();
  const taskUrl = panel.querySelector('#taskUrl')?.value.trim();
  const saveBtn = panel.querySelector('#saveTaskBtn');

  if (!taskName || !taskDescription) {
    showToast('Task name and description are required', 'error');
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving Task...';

  try {
    const newTask = await executeIfPermitted(userId, 'createTask', {
      taskName: taskName,
      taskDescription: taskDescription,
      taskUrl: taskUrl
    });

    taskId = newTask.id;
    
    // Enable steps section
    const stepsSection = panel.querySelector('#stepsSection');
    if (stepsSection) {
      stepsSection.classList.remove('opacity-50', 'pointer-events-none');
    }
    
    showToast('Task created successfully!');
    
    // Load steps (including step 3)
    const loadedSteps = await executeIfPermitted(userId, 'readTaskSteps', { taskId: taskId });
    steps = loadedSteps || [];
    
    // Pre-fill step 3 if it exists
    const step3 = steps.find(s => s.step_order === 3);
    if (step3) {
      panel.querySelector('#stepName').value = step3.name || '';
      panel.querySelector('#stepDescription').value = step3.description || '';
      panel.querySelector('#stepUrl').value = step3.external_url || '';
    }
    
    updateStepsList(panel);
    
  } catch (error) {
    showToast('Failed to create task: ' + error.message, 'error');
  }

  saveBtn.disabled = false;
  saveBtn.textContent = 'Save Task';
}

// In your handleStepSubmit function, after successfully saving a step:
async function handleStepSubmit(e, panel) {
    console.log('handleStepSubmit()');
    e.preventDefault();
    
    const stepOrder = parseInt(panel.querySelector('#stepOrder')?.value);
    const stepName = panel.querySelector('#stepName')?.value.trim();
    const stepDescription = panel.querySelector('#stepDescription')?.value.trim();
    const stepUrl = panel.querySelector('#stepUrl')?.value.trim();
    const saveBtn = panel.querySelector('#saveStepBtn');
    
    if (!stepName || !stepDescription) {
      showToast('Step name and description are required', 'error');
      return;
    }
    
    if (!taskId) {
      showToast('Please save the task header first', 'error');
      return;
    }
    
    if (stepOrder < 3) {
      showToast('Steps 1 and 2 are system-managed and cannot be edited.', 'error');
      return;
    }
    
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving Step...';
    
    try {
      let result;
      const existingStep = steps.find(s => s.step_order === stepOrder);
      
      if (existingStep) {  // I don't know why this is here
        // Update existing step
        result = await executeIfPermitted(userId, 'updateTaskStep', {
          taskId: taskId,
          stepOrder: stepOrder,
          stepName: stepName,
          stepDescription: stepDescription,
          stepUrl: stepUrl
        });
      } else {
        // Create new step
        result = await executeIfPermitted(userId, 'createTaskStep', {  // this has been duplicated
          taskId: taskId,
          stepOrder: stepOrder,
          stepName: stepName,
          stepDescription: stepDescription,
          stepUrl: stepUrl
        });

        addInformationCard({
          'name': `${result.name?.substring(0, 60) || cleanName?.substring(0, 60) || 'Unknown'}...`,
          'with id': `${result.id?.substring(0, 8) || 'unknown'}...`,
          'This is a': 'Task automation ',
          'autoNumber':  automationsNumber, 
          'stepNumber':  currentStepId 
      });


      }
      console.log('result:',result); // just says success 22:48 Oct 14
      // Store current step ID for automations
//      currentStepId = result.id || result.step_id;   //<--- used to be impossible as the function was not returning data

      // Reload steps to get updated data
      const loadedSteps = await executeIfPermitted(userId, 'readTaskSteps', { taskId: taskId });
      steps = loadedSteps || [];
      
      updateStepsList(panel);
      
      // Reset form + increment step order
      panel.querySelector('#createStepForm')?.reset();
      panel.querySelector('#stepOrder').value = stepOrder + 1;
      panel.querySelector('#stepName').value = 'Name...';
      panel.querySelector('#stepDescription').value = 'Description...';
      
      console.log('Step saved successfully, enabling automations card');
      console.log('Current step ID:', currentStep);  // 22:44 Oct 14 UNDEFINED because line 445 was junk and this was logging currentStepId
      console.log('Panel element:', panel);



      // ENABLE AUTOMATIONS CARD HERE - This is the key addition!
      enableAutomationsCard(panel);
      
      showToast(existingStep ? 'Step updated!' : 'New step created!');
      
    } catch (error) {
      showToast('Failed to save step: ' + error.message, 'error');
    }
    
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Step';
  }
  
  // Add this new function to enable the automations card:
  function enableAutomationsCard(panel) {
    console.log('enableAutomationsCard()', panel);
    
    const automationsCard = panel.querySelector('#taskAutomationsCard');
    if (!automationsCard) {
      console.log('Automations card not found');
      return;
    }
    
    // Enable the card visually
    automationsCard.style.opacity = '1';
    automationsCard.style.pointerEvents = 'auto';
    
    // Enable the automation buttons
    const saveTaskAutomationBtn = panel.querySelector('#saveTaskAutomationBtn');
    if (saveTaskAutomationBtn) {
      saveTaskAutomationBtn.disabled = false;
      saveTaskAutomationBtn.style.opacity = '1';
      saveTaskAutomationBtn.style.pointerEvents = 'auto';
      saveTaskAutomationBtn.textContent = 'Save Task Assignment';
    }
    
    const saveRelationshipAutomationBtn = panel.querySelector('#saveRelationshipAutomationBtn');
    if (saveRelationshipAutomationBtn) {
      saveRelationshipAutomationBtn.disabled = false;
      saveRelationshipAutomationBtn.style.opacity = '1';
      saveRelationshipAutomationBtn.style.pointerEvents = 'auto';
      saveRelationshipAutomationBtn.textContent = 'Save Relationship';
    }
    
    const saveManagerAutomationBtn = panel.querySelector('#saveManagerAutomationBtn');
    if (saveManagerAutomationBtn) {
      saveManagerAutomationBtn.disabled = false;
      saveManagerAutomationBtn.style.opacity = '1';
      saveManagerAutomationBtn.style.pointerEvents = 'auto';
      saveManagerAutomationBtn.textContent = 'Save Manager';
    }
    
    console.log('Automations card enabled');
  }
  
  // Also add a function to disable/reset the automations card:
  function resetAutomationsCard(panel) {
    console.log('resetAutomationsCard()');
    
    const automationsCard = panel.querySelector('#taskAutomationsCard');
    if (!automationsCard) return;
    
    // Disable the card visually
    automationsCard.style.opacity = '0.2';
    automationsCard.style.pointerEvents = 'none';
    
    // Disable the automation buttons
    const saveTaskAutomationBtn = panel.querySelector('#saveTaskAutomationBtn');
    if (saveTaskAutomationBtn) {
      saveTaskAutomationBtn.disabled = true;
      saveTaskAutomationBtn.style.opacity = '0.5';
      saveTaskAutomationBtn.style.pointerEvents = 'none';
      saveTaskAutomationBtn.textContent = 'Save Task Assignment';
    }
    
    const saveRelationshipAutomationBtn = panel.querySelector('#saveRelationshipAutomationBtn');
    if (saveRelationshipAutomationBtn) {
      saveRelationshipAutomationBtn.disabled = true;
      saveRelationshipAutomationBtn.style.opacity = '0.5';
      saveRelationshipAutomationBtn.style.pointerEvents = 'none';
      saveRelationshipAutomationBtn.textContent = 'Save Relationship';
    }
    
    const saveManagerAutomationBtn = panel.querySelector('#saveManagerAutomationBtn'); // There is no such button
    if (saveManagerAutomationBtn) {
      saveManagerAutomationBtn.disabled = true;
      saveManagerAutomationBtn.style.opacity = '0.5';
      saveManagerAutomationBtn.style.pointerEvents = 'none';
      saveManagerAutomationBtn.textContent = 'Save Manager';
    }
    
    console.log('Automations card reset');
  }
  





function updateStepsList(panel) {
  console.log('updateStepsList()');
  const list = panel.querySelector('#stepsList');
  if (!list) return;

  list.innerHTML = '';
  steps.forEach(step => {
    const div = document.createElement('div');
    div.className = 'text-sm p-2 bg-gray-50 rounded';
    div.textContent = `Step ${step.step_order}: ${step.name}`;
    list.appendChild(div);
  });
  
  const createdSteps = panel.querySelector('#createdSteps');
  if (createdSteps && steps.length > 0) {
    createdSteps.classList.remove('hidden');
  }
}

function addInformationCard(stepData) { 
  console.log('addInformationCard()');
  const infoSection = document.querySelector('#informationSection');
  const card = document.createElement('div');
 // card.className = 'bg-white p-2 rounded border mb-1 text-sm';
 const style = styleCardByType(stepData.type);
 console.log('style:',style);
 card.className= style;
//       card.className = this.styleCardByType(stepData.type); //not calling the function
  // Create display text by iterating through all properties
  let displayText = ''; // used to be 'Saved' but seems redundant
  
  // Iterate through all properties in the object
  for (const [key, value] of Object.entries(stepData)) {
      if (key !== 'timestamp') {
          displayText += `, ${key}: ${value}`;
      }
  }
  const icon = getIconByType(stepData.type);
  card.textContent = icon + displayText;
  infoSection.appendChild(card);
  
  // Add to steps array
  steps.push(stepData);
  console.log('steps array:', steps);
}
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
    
    const taskSelect = panel.querySelector('#taskAutomationSelect'); // FIXED: Correct ID
    const selectedTaskId = taskSelect?.value;
    
    // Get the selected option text
    const selectedOption = taskSelect?.options[taskSelect.selectedIndex];
    const cleanName = selectedOption?.textContent?.replace(' (clipboard)', '');
    
    if (!selectedTaskId) {
        showToast('Please select a task first', 'error');
        return;
    }
    
    const saveTaskAutomationBtn = panel.querySelector('#saveTaskAutomationBtn');
    saveTaskAutomationBtn.disabled = true;
    saveTaskAutomationBtn.textContent = 'Saving...';
    automationsNumber++;   
    
    
// ADD MANAGER SELECTION:
const managerSelect = panel.querySelector('#managerAutomationSelect');
console.log('Manager select element:', managerSelect);

const manager_id = managerSelect?.value || null;  // null 13:40 oct 15
const selectedManagerOption = managerSelect?.options[managerSelect.selectedIndex]; // why? getting the task name didn't do this Line 628
const cleanManagerName = selectedManagerOption?.textContent?.replace(' (clipboard)', '') || null; 






console.log('Selected manager:', manager_id, cleanManagerName);  //null null  13:40 oct 15

addInformationCard({
  'name': `${cleanManagerName}`,
  'with id': `${manager_id}`,
  'type': 'Manager',
  'autoNumber':  automationsNumber, 
  'stepNumber':  currentStepId 
   

});


// we had currentStepId which isn't an id.  It is an integer, but is it used properly anywhere? 
// the following was added 10:50? Oct 15.  It was an atempt to solve a problem, but the problem was use of wrong variable names. Not sure that 
//this is in the right place , Perhaps it is duplicated somewhere else in the module

if (stepOrder > 3) {
  // Manual creation - get ID from return value
  const result = await executeIfPermitted(userId, 'createTaskStep', {
      taskId: taskId,
      stepOrder: stepOrder,
      stepName: stepName,
      stepDescription: stepDescription,
      stepUrl: stepUrl
  });
  currentStepId = result.id; // ✅ Direct from return object
} else if (stepOrder === 3) {
  // Auto-created - must query for ID
  const step3Result = await executeIfPermitted(userId, 'readStep3Id', {
      task_header_id: taskId
  });
  currentStepId = step3Result.id; // ✅ From separate query
}



    
    try { 
        // LOOK UP ALL STEPS FOR THIS TASK
        console.log('Looking up steps for task:', selectedTaskId);
        const steps = await executeIfPermitted(userId, 'readTaskSteps', {
            taskId: selectedTaskId
        });
        
        // FIND STEP 3 (initial step) - IMPROVED ERROR HANDLING
        let stepId = null;
        const initialStep = steps.find(step => step.step_order === 3);
        if (initialStep && initialStep.id) {
            stepId = initialStep.id;
            console.log('Found initial step_id:', stepId);  // got it 10:58 Oct 15
        } else {
            throw new Error(`No initial step (step 3) found for task ${selectedTaskId}`);
        }
        console.log('currentStepId:', currentStepId);  // NULL  10:58 Oct 15  Different name !
//        console.log('source_task_step_id:', source_task_step_id);
        // Save task automation to database WITH step_id
        const result = await executeIfPermitted(userId, 'createSurveyAutomation', { 
       //     surveyAnswerId: answerId,  <---------  we need the current task step id
       source_task_step_id : stepId, // is that the correct step we are adding the automation to? No wrong name was being used here 'currentStepId'
       student_id: userId, //the person being assigned to the task
       manager_id: manager_id, // needs to be from the dropdown    
       taskId: selectedTaskId,
            task_step_id: stepId, // Ensure this matches your DB column name
            itemName: cleanName || 'Unknown Task', // BETTER: Default fallback
            automation_number: automationsNumber
        });
        
  addInformationCard({
            'name': `${result.name?.substring(0, 60) || cleanName?.substring(0, 60) || 'Unknown'}...`,
            'with id': `${result.id?.substring(0, 8) || 'unknown'}...`,
            'This is a': 'Task automation ',
            'autoNumber':  automationsNumber, 
            'stepNumber':  currentStepId 
        });
        
        showToast('Task automation saved successfully!');
        
    } catch (error) {
        showToast('Failed to save task automation: ' + error.message, 'error');
         automationsNumber--; // ROLLBACK: Decrement on failure
    }
    
    saveTaskAutomationBtn.disabled = false;
    saveTaskAutomationBtn.textContent = 'Save Task';
}

/*

create table public.automations (
  id uuid not null default gen_random_uuid (),
  task_step_id uuid null,
  survey_answer_id uuid null,
  name text null default '''unknown'''::text,
  description text null,
  task_header_id uuid null,
  student_id uuid null,
  from_step integer null,
  to_step integer null,
  appro_is_id uuid null,
  relationship text null,
  of_appro_id uuid null,
  appro_relations_id uuid null,
  created_at timestamp with time zone not null default now(),
  last_updated_at timestamp with time zone null,
  automation_number integer null,
  source_task_step_id uuid null,
  manager_id uuid null,
  task_assignment_id uuid null,
  constraint automations_pkey primary key (id),
  constraint automations_appro_relations_id_fkey foreign KEY (appro_relations_id) references approfile_relations (id) on update CASCADE on delete CASCADE,
  constraint automations_manager_id_fkey foreign KEY (manager_id) references app_profiles (id) on update CASCADE on delete CASCADE,
  constraint automations_of_appro_id_fkey foreign KEY (of_appro_id) references app_profiles (id) on update CASCADE on delete CASCADE,
  constraint automations_relationship_fkey foreign KEY (relationship) references relationships (name) on update CASCADE on delete CASCADE,
  constraint automations_source_task_step_id_fkey foreign KEY (source_task_step_id) references task_steps (id) on update CASCADE on delete CASCADE,
  constraint automations_student_id_fkey foreign KEY (student_id) references app_profiles (id) on update CASCADE on delete CASCADE,
  constraint automations_survey_answer_id_fkey foreign KEY (survey_answer_id) references survey_answers (id) on update CASCADE on delete CASCADE,
  constraint automations_task_assignment_id_fkey foreign KEY (task_assignment_id) references task_assignments (id) on update CASCADE on delete CASCADE,
  constraint automations_task_header_id_fkey foreign KEY (task_header_id) references task_headers (id),
  constraint automations_appro_is_id_fkey foreign KEY (appro_is_id) references app_profiles (id) on update CASCADE on delete CASCADE,
  constraint automations_task_step_id_fkey foreign KEY (task_step_id) references task_steps (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;

create trigger log_app_event_automations
after INSERT
or DELETE
or
update on automations for EACH row
execute FUNCTION log_all_events ();

*/