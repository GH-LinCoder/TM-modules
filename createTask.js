import { supabase } from '../../supabaseClient.js';

console.log('createTaskForm.js loaded');

const state = {
  taskId: null,
  steps: [],
  user: '06e0a6e6-c5b3-4b11-a9ec-3e1c1268f3df' // Replace with dynamic user ID
};

export function render(container, context = {}) {
  container.innerHTML = getTemplateHTML();
  attachListeners(container, context);
  updatePanelLayout();
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

        <div class="p-6 space-y-6">
          <div class="space-y-4" id="createTaskForm">
            <input id="taskName" placeholder="Task name" maxlength="64" required class="w-full p-2 border rounded" />
            <p id="taskNameCounter" class="text-xs text-gray-500">0/64 characters</p>

            <textarea id="taskDescription" placeholder="Task description" rows="3" maxlength="256" required class="w-full p-2 border rounded"></textarea>
            <p id="taskDescriptionCounter" class="text-xs text-gray-500">0/256 characters</p>

            <input id="taskUrl" type="url" placeholder="Optional URL" class="w-full p-2 border rounded" />

            <button id="saveTaskBtn" class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">Save Task</button>
          </div>

          <div id="stepsSection" class="opacity-50 pointer-events-none">
            <form id="createStepForm" class="space-y-4">
              <input id="stepOrder" type="number" value="3" min="3" class="w-20 p-2 border rounded" />
              <input id="stepName" maxlength="64" placeholder="Step name" required class="w-full p-2 border rounded" />
              <p id="stepNameCounter" class="text-xs text-gray-500">0/64 characters</p>

              <textarea id="stepDescription" maxlength="256" placeholder="Step description" rows="3" required class="w-full p-2 border rounded"></textarea>
              <p id="stepDescriptionCounter" class="text-xs text-gray-500">0/256 characters</p>

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

function attachListeners(container, context) {
  container.querySelector('#taskName')?.addEventListener('input', e => {
    container.querySelector('#taskNameCounter').textContent = `${e.target.value.length}/64 characters`;
  });

  container.querySelector('#taskDescription')?.addEventListener('input', e => {
    container.querySelector('#taskDescriptionCounter').textContent = `${e.target.value.length}/256 characters`;
  });

  container.querySelector('#stepName')?.addEventListener('input', e => {
    container.querySelector('#stepNameCounter').textContent = `${e.target.value.length}/64 characters`;
  });

  container.querySelector('#stepDescription')?.addEventListener('input', e => {
    container.querySelector('#stepDescriptionCounter').textContent = `${e.target.value.length}/256 characters`;
  });

  container.querySelector('#saveTaskBtn')?.addEventListener('click', handleTaskSubmit);
  container.querySelector('#saveStepBtn')?.addEventListener('click', handleStepSubmit);
  container.querySelector('[data-action="close-dialog"]')?.addEventListener('click', () => container.remove());
}

async function handleTaskSubmit(e) {
  e.preventDefault();

  const taskName = document.querySelector('#taskName')?.value.trim();
  const taskDescription = document.querySelector('#taskDescription')?.value.trim();
  const taskUrl = document.querySelector('#taskUrl')?.value.trim();
  const saveBtn = document.querySelector('#saveTaskBtn');

  if (!taskName || !taskDescription) {
    showToast('Task name and description are required', 'error');
    return;
  }

  const { data: existingTask, error: fetchError } = await supabase
    .from('task_headers')
    .select('id')
    .eq('name', taskName)
    .single();

  if (existingTask) {
    showToast('That name has already been used. Please choose a different one.', 'error');
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving Task...';

  const { error, data } = await supabase
    .from('task_headers')
    .insert({
      name: taskName,
      description: taskDescription,
      external_url: taskUrl || null,
      author_id: state.user
    })
    .select()
    .single();

  if (error) {
    showToast('Failed to create task: ' + error.message, 'error');
  } else {
    state.taskId = data.id;
    document.querySelector('#stepsSection')?.classList.remove('opacity-50', 'pointer-events-none');
    showToast('Task created successfully!');
  }

  saveBtn.disabled = false;
  saveBtn.textContent = 'Save Task';
}

async function handleStepSubmit(e) {
  e.preventDefault();

  const order = parseInt(document.querySelector('#stepOrder')?.value);
  const stepName = document.querySelector('#stepName')?.value.trim();
  const stepDescription = document.querySelector('#stepDescription')?.value.trim();
  const stepUrl = document.querySelector('#stepUrl')?.value.trim();
  const saveBtn = document.querySelector('#saveStepBtn');

  if (!state.taskId || !state.user) {
    showToast('Task not saved or user missing', 'error');
    return;
  }

  if (order < 3) {
    showToast('Step order must be 3 or higher', 'error');
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving Step...';

  let error;
  if (order === 3) {
    const { error: updateError } = await supabase
      .from('task_steps')
      .update({
        name: stepName,
        description: stepDescription,
        external_url: stepUrl || null
      })
      .eq('task_header_id', state.taskId)
      .eq('step_order', 3);
    error = updateError;
  } else {
    const { error: insertError } = await supabase
      .from('task_steps')
      .insert({
        name: stepName,
        description: stepDescription,
        external_url: stepUrl || null,
        step_order: order,
        task_header_id: state.taskId,
        author_id: state.user
      });
    error = insertError;
  }

  if (error) {
    showToast('Failed to save step: ' + error.message, 'error');
  } else {
    state.steps.push({ name: stepName, description: stepDescription, order, external_url: stepUrl });
    updateStepsList();
    document.querySelector('#createdSteps')?.classList.remove('hidden');
    document.querySelector('#createStepForm')?.reset();
    document.querySelector('#stepOrder').value = order + 1;
    showToast('Step saved!');
  }

  saveBtn.disabled = false;
  saveBtn.textContent = 'Save Step';
}

function updateStepsList() {
  const list = document.querySelector('#stepsList');
  if (!list) return;
  list.innerHTML = '';
  state.steps.forEach(step => {
    const div = document.create
