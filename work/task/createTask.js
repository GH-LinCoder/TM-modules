// ./work/tasks/createTaskForm.js
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { appState } from '../../state/appState.js';
import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';
import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';

console.log('createTaskForm.js loaded');

const userId = appState.query.userId;

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

function initClipboardIntegration(panel) {
  // Populate from clipboard immediately
  populateFromClipboard(panel);
  
  // Listen for clipboard updates
  onClipboardUpdate(() => {
    populateFromClipboard(panel);
  });
          panel.innerHTML+=petitionBreadcrumbs();//this reads 'petition' and prints the values at bottom of the render panel
  
}

function populateFromClipboard(panel) {
  console.log('populateFromClipboard()');
  
  // Get managers from clipboard (app-human with AS manager)
  const managers = getClipboardItems({ as: 'manager', type: 'app-human' });
  
  // Note: CreateTask doesn't directly use managers in the header form,
  // but you might want to auto-fill step forms or show manager info
  // For now, we'll just log that managers are available
  
  if (managers.length > 0) {
    console.log('Managers available in clipboard:', managers);
    // You could show a notification or use this in step creation later
  }
}

function getTemplateHTML() {
  return `
    <div id="createTaskDialog" class="create-task-dialogue relative z-10 flex flex-col h-full">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 z-10 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-xl font-semibold text-gray-900">Create New Task</h3>
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
              To track the progress of some process, or to create a training course. 
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
              <input id="taskUrl" type="url" placeholder="https://example.com" class="w-full p-2 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
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
                  <input id="stepUrl" type="url" placeholder="https://example.com" class="w-full p-2 border rounded" />
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
        </div>
      </div>
    </div>
  `;
}

function attachListeners(panel) {
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

async function handleStepSubmit(e, panel) {
  e.preventDefault();
  console.log('handleStepSubmit(e)');

  const order = parseInt(panel.querySelector('#stepOrder')?.value);
  const stepName = panel.querySelector('#stepName')?.value.trim();
  const stepDescription = panel.querySelector('#stepDescription')?.value.trim();
  const stepUrl = panel.querySelector('#stepUrl')?.value.trim();
  const saveBtn = panel.querySelector('#saveStepBtn');

  if (!taskId || !userId) {
    showToast('Task not saved or user missing', 'error');
    return;
  }

  if (order < 3) {
    showToast('Steps 1 and 2 are system-managed and cannot be edited.', 'error');
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving Step...';

  try {
    let result;
    const existingStep = steps.find(s => s.step_order === order);
    
    if (existingStep) {
      // Update existing step
      result = await executeIfPermitted(userId, 'updateTaskStep', {
        taskId: taskId,
        stepOrder: order,
        stepName,
        stepDescription,
        stepUrl
      });
    } else {
      // Create new step
      result = await executeIfPermitted(userId, 'createTaskStep', {
        taskId: taskId,
        stepOrder: order,
        stepName,
        stepDescription,
        stepUrl
      });
    }

    // Reload steps to get updated data
    const loadedSteps = await executeIfPermitted(userId, 'readTaskSteps', { taskId: taskId });
    steps = loadedSteps || [];
    
    updateStepsList(panel);
    
    // Reset form + increment step order
    panel.querySelector('#createStepForm')?.reset();
    panel.querySelector('#stepOrder').value = order + 1;
    panel.querySelector('#stepName').value = 'Name...';
    panel.querySelector('#stepDescription').value = 'Description...';
    
    showToast(existingStep ? 'Step updated!' : 'New step created!');
    
  } catch (error) {
    showToast('Failed to save step: ' + error.message, 'error');
  }

  saveBtn.disabled = false;
  saveBtn.textContent = 'Save Step';
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