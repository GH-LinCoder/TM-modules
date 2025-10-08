// ./work/tasks/editTaskForm.js
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { appState } from '../../state/appState.js';
import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';
import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';

console.log('editTaskForm.js loaded');

const state = {
  user: appState.query.userId,
  currentTask: null,
  currentTaskId: null,
  steps: []
};

export function render(panel, query = {}) {
  console.log('Render Edit Task Form:', panel, query);
  
  panel.innerHTML = getTemplateHTML();

  // Initialize clipboard integration
  initClipboardIntegration(panel);

  attachListeners(panel);
  


  taskSelect = panel.querySelector('[data-form="taskSelect"]');

        panel.innerHTML+=petitionBreadcrumbs();//this reads 'petition' and prints the values at bottom of the render panel

}

function initClipboardIntegration(panel) {
  // Check clipboard immediately
  populateFromClipboard(panel);
  
  // Listen for future changes
  onClipboardUpdate(() => {
    populateFromClipboard(panel);
  });
}

function populateFromClipboard(panel) {
  console.log('populateFromClipboard()');
  
  // Get tasks from clipboard
  const tasks = getClipboardItems({ as: 'task', type: 'tasks' });
  
  if (tasks.length === 0) return;

  //new 16:03 oct 4
  if (tasks.length === 1 && !taskSelect.value) {  //what is this?
    taskSelect.value = tasks[0].entity.id;
    informationFeedback.innerHTML += `<div class="p-1 text-sm bg-blue-50 border border-blue-200 rounded">Auto-filled task: ${tasks[0].entity.name}</div>`;
  }
  addClipboardItemsToDropdown(tasks, taskSelect);
  



  // Use the most recent one      const task_header_id = taskSelect.value;
 // const item = tasks[0];
 //const item = taskSelect.value ;

/*
 console.log('tasks:',tasks); 
console.log('---');
console.log('tasks[0]:',tasks[0]); 
console.log('---');
console.log('tasks[0].entity:',tasks[0].entity); 
console.log('---');
console.log('tasks[0].entity.item:',tasks[0].entity.item); // this contains the row of information:
//  id, name, description, external_url, author_id, created_at, 
console.log('---');
console.log('taskSelect.value:',taskSelect.value);
*/

//return;
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

function addClipboardItemsToDropdown(items, selectElement) {
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





async function loadTaskSteps(panel, taskId) {
    try {
      const steps = await executeIfPermitted(state.user, 'readTaskSteps', { taskId });
      state.steps = steps || [];
      
      // ✅ DEBUG: Log loaded steps
      console.log('Loaded steps:', state.steps);
      
      // Enable steps section
      const stepsSection = panel.querySelector('#stepsSection');
      if (stepsSection) {
        stepsSection.classList.remove('opacity-50', 'pointer-events-none');
      }
      
      // Populate steps list
      updateStepsList(panel);
      
      // Populate step select dropdown
      populateStepSelect(panel);
      
    } catch (error) {
      console.error('Error loading task steps:', error);
      showToast('Failed to load task steps', 'error');
    }
  }

function populateStepSelect(panel) {
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
  newStepOption.textContent = `New Step ${maxStep + 1}`;
  stepSelect.appendChild(newStepOption);
}

function getTemplateHTML() {
  return `
    <div id="editTaskDialog" class="edit-task-dialogue relative z-10 flex flex-col h-full" data-destination="new panel">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 z-10 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-xl font-semibold text-gray-900">Edit Task</h3>
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
              Edit the details of this task. The name must remain unique across all tasks.
            </p>
            <ul class="text-blue-700 text-sm mt-2 space-y-1">
              <li>• You can modify the name, description, and URL</li>
              <li>• The name must be unique across all existing tasks</li>
              <li>• Click "Update Task" to save your changes</li>
              <li>📋 Auto-filled from clipboard if available</li>
            </ul>
          </div>


            <div class="space-y-2">
              <label for="taskSelect" class="block text-sm font-medium text-gray-700">Select Task</label>
              <select id="taskSelect" data-form="taskSelect" class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
                <option value="">Select a task</option>
              </select>
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
                  <label for="stepSelect" class="block text-sm font-medium text-gray-700">Edit Step:</label>
                  <select id="stepSelect" class="w-full p-2 border rounded">
                    <option value="">Select a step to edit</option>
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
                <!-- Hidden input for form submission -->
                <input id="stepOrder" type="hidden" />
                <button id="saveStepBtn" class="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
                  Save Step
                </button>
              </form>

              <div id="createdSteps" class="hidden mt-4">
                <h5 class="text-md font-medium mb-2">Existing Steps:</h5>
                <div id="stepsList" class="space-y-2"></div>
              </div>
            </div>
                      <div class="bg-green-100 flex flex-col md:flex-row justify-center gap-4 pt-4 border-t border-gray-200">
            <p class="text-lg font-bold">Information:</p>
            <p data-task="information-feedback"></p>
          </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function attachListeners(panel) {
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
    const stepOrder = parseInt(e.target.value);
    if (!stepOrder) return;
    
    // ✅ DEBUG: Log the selected step order
    console.log('Selected step order:', stepOrder);
    
    // Find step with this order
    const step = state.steps.find(s => parseInt(s.step_order) === stepOrder);
    
    // ✅ DEBUG: Log found step
    console.log('Found step:', step);
    
    if (step) {
      // Fill form with step data
      panel.querySelector('#stepName').value = step.name || '';
      panel.querySelector('#stepDescription').value = step.description || '';
      panel.querySelector('#stepUrl').value = step.external_url || '';
      panel.querySelector('#stepOrder').value = stepOrder; // Ensure this is set
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


// new 17:39 oct 4

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



}


async function handleTaskUpdate(e, panel) {
    e.preventDefault();
    console.log('handleTaskUpdate');
  
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
        const existing = await executeIfPermitted(state.user, 'readTaskByName', { taskName: name });
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
  
      // ✅ Use updateTask function (you'll need to create it as shown above)
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
  
    const order = parseInt(panel.querySelector('#stepOrder')?.value);
    const stepName = panel.querySelector('#stepName')?.value.trim();
    const stepDescription = panel.querySelector('#stepDescription')?.value.trim();
    const stepUrl = panel.querySelector('#stepUrl')?.value.trim();
    const saveBtn = panel.querySelector('#saveStepBtn');
  
    if (!state.currentTaskId || !state.user) {
      showToast('Task not loaded or user missing', 'error');
      return;
    }
  
    // ENFORCE BUSINESS RULE: Steps 1-2 are not editable
    if (order < 3) {
      showToast('Steps 1 and 2 are system-managed and cannot be edited.', 'error');
      return;
    }
  
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
      
      if (existingStep) {
        // ✅ Update existing step
        console.log('Updating existing step:', order);
        await executeIfPermitted(state.user, 'updateTaskStep', {
          taskId: state.currentTaskId,
          stepOrder: order, // This should be a number
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
  }

/* replaced
async function handleTaskUpdate(e, panel) {
  e.preventDefault();
  console.log('handleTaskUpdate');

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
      const existing = await executeIfPermitted(state.user, 'readTaskByName', { taskName: name });
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

  const order = parseInt(panel.querySelector('#stepOrder')?.value);
  const stepName = panel.querySelector('#stepName')?.value.trim();
  const stepDescription = panel.querySelector('#stepDescription')?.value.trim();
  const stepUrl = panel.querySelector('#stepUrl')?.value.trim();
  const saveBtn = panel.querySelector('#saveStepBtn');

  if (!state.currentTaskId || !state.user) {
    showToast('Task not loaded or user missing', 'error');
    return;
  }

  // ENFORCE BUSINESS RULE: Steps 1-2 are not editable
  if (order < 3) {
    showToast('Steps 1 and 2 are system-managed and cannot be edited.', 'error');
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving Step...';

  try {
    let result;
    // Check if step exists
    const existingStep = state.steps.find(s => s.step_order === order);
    
    if (existingStep) {
      // Update existing step
      result = await executeIfPermitted(state.user, 'updateTaskStep', {
        taskId: state.currentTaskId,
        stepOrder: order,
        stepName,
        stepDescription,
        stepUrl
      });
    } else {
      // Create new step
      result = await executeIfPermitted(state.user, 'createTaskStep', {
        taskId: state.currentTaskId,
        stepOrder: order,
        stepName,
        stepDescription,
        stepUrl
      });
    }

    // Reload steps to reflect changes
    await loadTaskSteps(panel, state.currentTaskId);
    
    // Show success
    showToast(existingStep ? 'Step updated!' : 'New step created!');
    
  } catch (error) {
    showToast('Failed to save step: ' + error.message, 'error');
  }

  saveBtn.disabled = false;
  saveBtn.textContent = 'Save Step';
}
*/



function updateStepsList(panel) {
  console.log('updateStepsList()');
  const list = panel.querySelector('#stepsList');
  if (!list) return;

  list.innerHTML = '';
  state.steps.forEach(step => {
    const div = document.createElement('div');
    div.className = 'p-2 bg-gray-50 rounded border';
    div.innerHTML = `
      <div class="font-medium">Step ${step.step_order}: ${step.name}</div>
      <div class="text-sm text-gray-600">${step.description}</div>
    `;
    list.appendChild(div);
  });
  
  const createdSteps = panel.querySelector('#createdSteps');
  if (createdSteps && state.steps.length > 0) {
    createdSteps.classList.remove('hidden');
  }
}