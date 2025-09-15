
//import{createSupabaseClient} from '../../db/supabase.js';
import{executeIfPermitted} from '../../registry/executeIfPermitted.js';
import{showToast} from '../../ui/showToast.js';

console.log('createTaskForm.js loaded');

const state = {
  taskId: null,
  steps: [],
  user: '06e0a6e6-c5b3-4b11-a9ec-3e1c1268f3df' // Replace with dynamic user ID
};

export function render(panel, query = {}) { //query is not currently used, but may be important for permissions
  console.log('Render(', panel, query,')');
//  panel.innerHTML = "TEST TEST TEST";//working 16:05 3 sept 2025
  panel.innerHTML = getTemplateHTML();
  attachListeners(panel);
  //updatePanelLayout();
}

function getTemplateHTML() { console.log('getTemplateHTML()');
  return `
    <div id="createTaskDialog" class="create-task-dialogue relative z-10 flex flex-col h-full">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 z-10 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-xl font-semibold text-gray-900">Create New Task</h3>

          <!-- close x -->
          <button data-action="close-dialog" class="text-gray-500 hover:text-gray-700" aria-label="Close">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          </div>
          
          <div>  <!--  Concise instructions   -->
          <p>To track the progress of some process, or to create a training course. 
          First check if a suitable task already exists. 
          Plan your task. You may want to copy paste from an editor.
          Try to have a name that has obvious meaning and appeal.
          Click the how? menu button for more guidance.
          </p>
          </div>

        <div class="bg-gray-200 p-6 space-y-6">
          <div class=" space-y-4" id="createTaskForm">
            <input id="taskName" placeholder="Short & unique appealing task name" maxlength="64" required class="w-full p-2 border rounded" />
            <p id="taskNameCounter" class="text-xs text-gray-500">0/64 characters</p>

            <textarea id="taskDescription" placeholder="Task description" rows="3" maxlength="2000" required class="  w-full p-2 min-h-80 border rounded"></textarea>
            <p id="taskDescriptionCounter" class="text-xs text-gray-500">0/2000 characters</p>

            <input id="taskUrl" type="url" placeholder="Optional URL" class="w-full p-2 border rounded" />

            <button id="saveTaskBtn" class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">Save Task</button>
          </div>

          <div id="stepsSection" class="opacity-50 pointer-events-none">
            <form id="createStepForm" class="space-y-4">
              <input id="stepOrder" type="number" value="3" min="3" class="w-20 p-2 border rounded" />
              <input id="stepName" maxlength="64" placeholder="Step name" required class="w-full p-2 border rounded" />
              <p id="stepNameCounter" class="text-xs text-gray-500">0/64 characters</p>

              <textarea id="stepDescription" maxlength="2000" placeholder="Step description" rows="3" required class="w-full p-2 min-h-80 border rounded"></textarea>
              <p id="stepDescriptionCounter" class="text-xs text-gray-500">0/2000 characters</p>

              <input id="stepUrl" type="url" placeholder="Optional URL" class="w-full p-2 border rounded" />

              <button id="saveStepBtn" class="bg-gray-200 py-2 px-4 rounded hover:bg-gray-300">Save Step</button>
            </form>

            <div id="createdSteps" class="hidden mt-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Created Steps:</label>
              <div id="stepsList" class="space-y-1"></div>
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
    panel.querySelector('#taskDescriptionCounter').textContent = `${e.target.value.length}/256 characters`;
  });

  panel.querySelector('#stepName')?.addEventListener('input', e => {
    panel.querySelector('#stepNameCounter').textContent = `${e.target.value.length}/64 characters`;
  });

  panel.querySelector('#stepDescription')?.addEventListener('input', e => {
    panel.querySelector('#stepDescriptionCounter').textContent = `${e.target.value.length}/256 characters`;
  });

  panel.querySelector('#saveTaskBtn')?.addEventListener('click', handleTaskSubmit);
  panel.querySelector('#saveStepBtn')?.addEventListener('click', handleStepSubmit);
  panel.querySelector('[data-action="close-dialog"]')?.addEventListener('click', () => panel.remove());
}

// In handleTaskSubmit
async function handleTaskSubmit(e) {
  e.preventDefault();
  console.log('handleTaskSubmit(e)');

  const taskName = document.querySelector('#taskName')?.value.trim();
  const taskDescription = document.querySelector('#taskDescription')?.value.trim();
  const taskUrl = document.querySelector('#taskUrl')?.value.trim();
  const saveBtn = document.querySelector('#saveTaskBtn');

  if (!taskName || !taskDescription) {
    showToast('Task name and description are required', 'error');
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving Task...';

  try {
    // ✅ NEW — use executeIfPermitted
    const newTask = await executeIfPermitted(state.user, 'createTask', {
      taskName:taskName,
      taskDescription:taskDescription,
      taskUrl:taskUrl
    });

    state.taskId = newTask.id; // ← store the new task ID
    document.querySelector('#stepsSection')?.classList.remove('opacity-50', 'pointer-events-none');
    showToast('Task created successfully!');
  } catch (error) {
    showToast('Failed to create task: ' + error.message, 'error');
  }

  saveBtn.disabled = false;
  saveBtn.textContent = 'Save Task';

  //read db steps of newly created task and display step 3 as confirmation
  const steps = await executeIfPermitted(state.user, 'readTaskSteps', { taskId: state.taskId });
  const step3 = steps.find(s => s.step_order === 3);
  if (step3) {
    // Pre-fill step 3 form
    document.querySelector('#stepName').value = step3.name;
    document.querySelector('#stepDescription').value = step3.description;
  }



}


async function handleStepSubmit(e) {
  e.preventDefault();
  console.log('handleStepSubmit(e)');

  const order = parseInt(document.querySelector('#stepOrder')?.value);
  const stepName = document.querySelector('#stepName')?.value.trim();
  const stepDescription = document.querySelector('#stepDescription')?.value.trim();
  const stepUrl = document.querySelector('#stepUrl')?.value.trim();
  const saveBtn = document.querySelector('#saveStepBtn');

  if (!state.taskId || !state.user) {
    showToast('Task not saved or user missing', 'error');
    return;
  }

  // ✅ ENFORCE BUSINESS RULE: Steps 1-2 are not editable
  if (order < 3) {
    showToast('Steps 1 and 2 are system-managed and cannot be edited.', 'error');
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving Step...';

  try {
    let result;
    if (order === 3) {
      // ✅ Update existing step 3
      result = await executeIfPermitted(state.user, 'updateTaskStep', {
        taskId: state.taskId,
        stepOrder: 3,
        stepName,
        stepDescription,
        stepUrl
      });
    } else {
      // ✅ Create new step (4+)
      result = await executeIfPermitted(state.user, 'createTaskStep', {
        taskId: state.taskId,
        stepOrder: order,
        stepName,
        stepDescription,
        stepUrl
      });
    }

    // Update local state
    state.steps.push({ name: stepName, description: stepDescription, order, external_url: stepUrl });
    updateStepsList();
    document.querySelector('#createdSteps')?.classList.remove('hidden');
    
    // Reset form + increment step order
    document.querySelector('#createStepForm')?.reset();
    document.querySelector('#stepOrder').value = order + 1;
    
    // ✅ Set placeholder text for next step
    document.querySelector('#stepName').value = 'Name...';
    document.querySelector('#stepDescription').value = 'Description...';
    
    showToast('Step saved!');
  } catch (error) {
    showToast('Failed to save step: ' + error.message, 'error');
  }

  saveBtn.disabled = false;
  saveBtn.textContent = 'Save Step';
}




function updateStepsList() {

  console.log('updateStepsList()');
  const list = document.querySelector('#stepsList');
  if (!list) return;

  list.innerHTML = '';
  state.steps.forEach(step => {
    const div = document.createElement('div');
    div.className = 'text-sm p-2 bg-gray-50 rounded';
    div.textContent = `Step ${step.order}: ${step.name}`;
    list.appendChild(div);
  });
}