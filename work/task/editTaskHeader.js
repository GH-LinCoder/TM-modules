// ./work/tasks/editTaskForm.js
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { appState } from '../../state/appState.js';
import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';

console.log('editTaskForm.js loaded');

/* legacy
const state = {
  user: '06e0a6e6-c5b3-4b11-a9ec-3e1c1268f3df', // Replace with dynamic user ID
currentTask: null};
*/


let currentTask;
const userId = appState.query.userId;

export function render(panel, query = {}) {
  console.log('Render Edit Task Form:', panel, query);
  
  panel.innerHTML = getTemplateHTML();
  attachListeners(panel);
  
  // Initialize clipboard integration
  initClipboardIntegration(panel);
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
  
  // Use the most recent one
  const item = tasks[0];
  currentTask = item.entity.item; // full row data
  
  // Populate form
  const nameInput = panel.querySelector('#taskName');
  const descriptionInput = panel.querySelector('#taskDescription');
  const urlInput = panel.querySelector('#taskUrl');
  const nameCounter = panel.querySelector('#taskNameCounter');
  const descriptionCounter = panel.querySelector('#taskDescriptionCounter');
  
  if (nameInput && currentTask.name) {
    nameInput.value = currentTask.name;
    nameCounter.textContent = `${currentTask.name.length}/64 characters`;
    showToast(`Auto-filled from clipboard: ${currentTask.name}`, 'info');
  }
  
  if (descriptionInput && currentTask.description) {
    descriptionInput.value = currentTask.description;
    descriptionCounter.textContent = `${currentTask.description.length}/2000 characters`;
  }
  
  if (urlInput && currentTask.external_url) {
    urlInput.value = currentTask.external_url;
  }
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

            <div class="flex gap-4">
              <button id="saveTaskBtn" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
                Update Task
              </button>
              <button id="cancelBtn" class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                Cancel
              </button>
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
  const nameCounter = panel.querySelector('#taskNameCounter');
  const descriptionCounter = panel.querySelector('#taskDescriptionCounter');
  const nameError = panel.querySelector('#nameError');
  const saveBtn = panel.querySelector('#saveTaskBtn');
  const cancelBtn = panel.querySelector('#cancelBtn');

  nameInput?.addEventListener('input', e => {
    nameCounter.textContent = `${e.target.value.length}/64 characters`;
    nameError.classList.add('hidden');
    saveBtn.disabled = false;
    saveBtn.textContent = 'Update Task';
  });

  descriptionInput?.addEventListener('input', e => {
    descriptionCounter.textContent = `${e.target.value.length}/2000 characters`;
  });

  saveBtn?.addEventListener('click', handleTaskUpdate);
  cancelBtn?.addEventListener('click', () => panel.remove());
  panel.querySelector('[data-action="close-dialog"]')?.addEventListener('click', () => panel.remove());
}

async function handleTaskUpdate(e) {
  e.preventDefault();
  console.log('handleTaskUpdate');

  const name = document.querySelector('#taskName')?.value.trim();
  const description = document.querySelector('#taskDescription')?.value.trim();
  const url = document.querySelector('#taskUrl')?.value.trim();
  const saveBtn = document.querySelector('#saveTaskBtn');
  const nameError = document.querySelector('#nameError');

  if (!name || !description) {
    showToast('Name and description are required', 'error');
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = 'Checking for duplicates...';

  try {
    // Check for duplicates only if name has changed
    if (!currentTask || currentTask.name !== name) {
      const existing = await executeIfPermitted(userId, 'readTaskByName', { taskName: name });
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

    const updatedTask = await executeIfPermitted(userId, 'updateTask', {
      id: currentTask?.id,
      name,
      description,
      external_url: url // ✅ Match your DB column name
    });

    showToast('Task updated successfully!');
    saveBtn.textContent = 'Task updated!';
    
    // Update state
    currentTask = updatedTask;
    
    // Close after delay
    setTimeout(() => {
      const dialog = document.querySelector('#editTaskDialog');
      if (dialog && dialog.parentElement) {
        dialog.parentElement.remove();
      }
    }, 1500);
    
  } catch (error) {
    showToast('Failed to update task: ' + error.message, 'error');
    saveBtn.disabled = false;
    saveBtn.textContent = 'Update Task';
  }
}
