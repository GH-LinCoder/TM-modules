// Import the Supabase client. This is now a local dependency of the module.


//import { supabase } from '../../supabaseClient.js';
console.log('taskForm.js module loaded');

// HTML for the form, stored as a template literal.
// This is the combined content of your original HTML stub.



function createTaskHTML() {
const htmlTemplate = `
<div id="createTaskDialog" data-form="createTaskDialog" class="create-task-dialogue relative z-10 flex flex-col h-full">
    <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 z-10 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200">
            <div class="flex items-center justify-between">
                <h3 class="text-xl font-semibold text-gray-900" data-form="title">Create New Task</h3>
                <button
                    class="text-gray-500 hover:text-gray-700"
                    data-action="close-dialog"
                    aria-label="Close"
                >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        </div>
        <div class="p-6 space-y-6">
            <div class="bg-white rounded-lg border border-gray-200">
                <div class="p-6 border-b border-gray-200">
                    <h4 class="text-lg font-semibold text-gray-900 mb-1" data-form="subtitle">Task Details</h4>
                    <p class="text-sm text-gray-600">
                        Name and describe the task. Then click to save it. After that you can add the steps of the task or you can create a new task.
                    </p>
                </div>
                <div class="p-6">
                    <div id="taskIdDisplay" data-form="taskIdDisplay" class="mb-4 p-2 bg-blue-50 rounded-md"></div>
                    <div id="createTaskForm" data-form="createTaskForm" class="space-y-4">
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Author</label>
                                <p class="text-sm text-gray-600" id="authorName" data-form="authorName">Loading...</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Created on</label>
                                <p class="text-sm text-gray-600" id="creationDate" data-form="creationDate">Loading...</p>
                            </div>
                        </div>
                        <div class="space-y-2">
                            <label for="taskName" class="block text-sm font-medium text-gray-700">Task Name *</label>
                            <input
                                type="text"
                                id="taskName"
                                data-form="taskName"
                                class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Short & unique"
                                maxlength="64"
                                required
                            />
                            <p class="text-xs text-gray-500" id="taskNameCounter" data-form="taskNameCounter">0/64 characters</p>
                        </div>
                        <div class="space-y-2">
                            <label for="taskDescription" class="block text-sm font-medium text-gray-700">Task Description *</label>
                            <textarea
                                id="taskDescription"
                                data-form="taskDescription"
                                class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Be concise"
                                rows="3"
                                maxlength="256"
                                required
                            ></textarea>
                            <p class="text-xs text-gray-500" id="taskDescriptionCounter" data-form="taskDescriptionCounter">0/256 characters</p>
                        </div>
                        <div class="space-y-2">
                            <label for="taskUrl" class="block text-sm font-medium text-gray-700">URL (optional)</label>
                            <input
                                type="url"
                                id="taskUrl"
                                data-form="taskUrl"
                                class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Link to task instructions"
                            />
                        </div>
                        <button
                            type="submit"
                            id="saveTaskBtn"
                            data-form="saveTaskBtn"
                            class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Save Task
                        </button>
                    </div>
                </div>
            </div>
            <div id="stepsSection" data-form="stepsSection" class="bg-white rounded-lg border border-gray-200 opacity-50 pointer-events-none">
                <div class="p-6 border-b border-gray-200">
                    <h4 class="text-lg font-semibold text-gray-900 mb-1">Task Steps</h4>
                    <p class="text-sm text-gray-600">
                        Add steps that guide users through the task completion process.
                    </p>
                </div>
                <div class="p-6">
                    <div id="createdSteps" data-form="createdSteps" class="hidden mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Created Steps:</label>
                        <div id="stepsList" data-form="stepsList" class="space-y-1"></div>
                    </div>
                    <form id="createStepForm" data-form="createStepForm" class="space-y-4">
                        <div class="flex items-center gap-4 mb-4">
                            <div class="flex-1">
                                <label class="block text-sm font-medium text-gray-700 mb-1">Step Order</label>
                                <input
                                    type="number"
                                    id="stepOrder"
                                    data-form="stepOrder"
                                    class="w-20 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value="3"
                                    min="3"
                                />
                            </div>
                            <div class="flex-1">
                                <p class="text-xs text-gray-500">
                                    Abandon = step 1, Complete = step 2, Students start on step 3
                                </p>
                            </div>
                        </div>
                        <div class="space-y-2">
                            <label for="stepName" class="block text-sm font-medium text-gray-700">Step Name *</label>
                            <input
                                type="text"
                                id="stepName"
                                data-form="stepName"
                                class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Short & unique"
                                maxlength="64"
                                required
                            />
                            <p class="text-xs text-gray-500" id="stepNameCounter" data-form="stepNameCounter">0/64 characters</p>
                        </div>
                        <div class="space-y-2">
                            <label for="stepDescription" class="block text-sm font-medium text-gray-700">Step Description *</label>
                            <textarea
                                id="stepDescription"
                                data-form="stepDescription"
                                class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Be concise"
                                rows="3"
                                maxlength="256"
                                required
                            ></textarea>
                            <p class="text-xs text-gray-500" id="stepDescriptionCounter" data-form="stepDescriptionCounter">0/256 characters</p>
                        </div>
                        <div class="space-y-2">
                            <label for="stepUrl" class="block text-sm font-medium text-gray-700">URL (optional)</label>
                            <input
                                type="url"
                                id="stepUrl"
                                data-form="stepUrl"
                                class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Link to task instructions"
                            />
                        </div>
                        <div class="flex gap-2">
                            <button
                                type="button"
                                id="addStepBtn"
                                data-form="addStepBtn"
                                class="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
                            >
                                Save Step
                            </button>
                            <button
                                type="button"
                                id="addStepBtn"
                                data-form="addStepBtn"
                                class="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
                            >
                                <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
`;
return htmlTemplate;
}


function setState() {
// --- Module State and Functions ---
// All the code from your original createTask.js is now contained within this module.
const state = {
    taskId: null,
    steps: [],
    user: '06e0a6e6-c5b3-4b11-a9ec-3e1c1268f3df' // MOCK
};
}

// Functions to store listener references for proper cleanup.
const listeners = {};

function showToast(message, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast fixed bottom-4 right-4 px-4 py-3 rounded-lg text-white shadow-lg transition-opacity duration-300 ${
        type === 'error' ? 'bg-red-600' : 'bg-green-600'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

 /*
function resetFormAndState(targetElement) {
    const dialogue = targetElement.querySelector('[data-form="createTaskDialog"]');
    if (!dialogue) {
        console.warn('resetFormAndState: Dialogue not found.');
        return;
    }

    const forms = dialogue.querySelectorAll('form');
    forms.forEach(form => form.reset());

    dialogue.querySelector('#taskName')?.removeAttribute('disabled');
    dialogue.querySelector('#taskDescription')?.removeAttribute('disabled');
    dialogue.querySelector('#taskUrl')?.removeAttribute('disabled');

    dialogue.querySelector('#taskIdDisplay')?.classList.add('hidden');
    dialogue.querySelector('#stepsSection')?.classList.add('opacity-50', 'pointer-events-none');
    dialogue.querySelector('#createdSteps')?.classList.add('hidden');

    const stepOrder = dialogue.querySelector('#stepOrder');
    if (stepOrder) stepOrder.value = 3;

    dialogue.querySelector('#stepNameCounter')?.textContent = '0/64 characters';
    dialogue.querySelector('#stepDescriptionCounter')?.textContent = '0/256 characters';

    state.taskId = null;
    state.steps = [];
}
//*/

async function handleTaskSubmit(e) {
    e.preventDefault();

    const form = e.target.closest('[data-form="createTaskForm"]');
    if (!form) {
        console.warn('handleTaskSubmit: Form not found.');
        return;
    }

    const saveBtn = form.querySelector('#saveTaskBtn');
    const taskName = form.querySelector('#taskName')?.value;
    const taskDescription = form.querySelector('#taskDescription')?.value;
    const taskUrl = form.querySelector('#taskUrl')?.value;

    if (!taskName || !taskDescription) {
        showToast('Please fill in all required fields.', 'error');
        return;
    }

    // New validation check starts here
    saveBtn.disabled = true;
    saveBtn.textContent = 'Checking name...';

    // Query the database to check for an existing task with the same name.
    const { data: existingTask, error: checkError } = await supabase
        .from('task_headers')
        .select('name')
        .eq('name', taskName)
        .maybeSingle(); // Use maybeSingle() to handle both found and not found cases gracefully.

    // If an existing task is found (data is not null), show an error.
    if (existingTask) {
        showToast('This task name has been used. Please choose another.', 'error');
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Task';
        return; // Stop execution
    }

    // If there was an unexpected database error (not just 'not found'), handle it.
    if (checkError) {
        showToast('An error occurred during name validation: ' + checkError.message, 'error');
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Task';
        return;
    }

    // Now, proceed with the original insert operation, as the name is unique.
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
        form.querySelector('#taskIdDisplay').textContent = `Task ID: ${data.id}`;
        form.querySelector('#taskIdDisplay')?.classList.remove('hidden');
        form.querySelector('#stepsSection')?.classList.remove('opacity-50', 'pointer-events-none');

        form.querySelector('#taskName')?.setAttribute('disabled', true);
        form.querySelector('#taskDescription')?.setAttribute('disabled', true);
        form.querySelector('#taskUrl')?.setAttribute('disabled', true);

        showToast('Task created successfully!');
    }

    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Task';
}

async function handleStepSubmit(e) {
    e.preventDefault();

    const form = e.target.closest('[data-form="createStepForm"]');
    if (!form) {
        console.warn('handleStepSubmit: Form not found.');
        return;
    }

    const order = parseInt(form.querySelector('#stepOrder')?.value);
    const stepName = form.querySelector('#stepName')?.value;
    const stepDescription = form.querySelector('#stepDescription')?.value;
    const stepUrl = form.querySelector('#stepUrl')?.value;
    const saveBtn = form.querySelector('#addStepBtn'); // Note: 'addStepBtn' id is used for 'Save Step' button

    if (!state.taskId || !state.user) {
        showToast('Task not saved or user missing', 'error');
        return;
    }

    if (order < 3) {
        showToast('Step order must be 3 or higher', 'error');
        return;
    }

    if (!stepName || !stepDescription) {
        showToast('Please fill in all required step fields.', 'error');
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
                author_id: state.user // Note: using state.user directly
            });
        error = insertError;
    }

    if (error) {
        showToast('Failed to save step: ' + error.message, 'error');
    } else {
        state.steps.push({ name: stepName, description: stepDescription, order, external_url: stepUrl });
        updateStepsList(form);
        form.querySelector('#createdSteps')?.classList.remove('hidden');
        form.reset();
        form.querySelector('#stepOrder').value = order + 1;
        form.querySelector('#stepNameCounter').textContent = '0/64 characters';
        form.querySelector('#stepDescriptionCounter').textContent = '0/256 characters';
        showToast('Step saved!');
    }

    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Step';
}

function updateStepsList(targetElement) {
    const list = targetElement.querySelector('#stepsList');
    if (!list) return;
    list.innerHTML = '';
    state.steps.forEach(step => {
        const div = document.createElement('div');
        div.className = 'text-sm p-2 bg-gray-50 rounded';
        div.textContent = `Step ${step.order}: ${step.name}`;
        list.appendChild(div);
    });
}

function attachListeners(targetElement) {
    const dialogue = targetElement.querySelector('[data-form="createTaskDialog"]');
    if (!dialogue) return;

    // Attach listeners and store references for removal
    listeners.closeBtn = () => closeDialogue(dialogue);
    listeners.taskSubmit = (e) => handleTaskSubmit(e);
    listeners.stepSubmit = (e) => handleStepSubmit(e);
    listeners.taskNameInput = (e) => dialogue.querySelector('#taskNameCounter').textContent = `${e.target.value.length}/64 characters`;
    listeners.taskDescriptionInput = (e) => dialogue.querySelector('#taskDescriptionCounter').textContent = `${e.target.value.length}/256 characters`;
    listeners.stepNameInput = (e) => dialogue.querySelector('#stepNameCounter').textContent = `${e.target.value.length}/64 characters`;
    listeners.stepDescriptionInput = (e) => dialogue.querySelector('#stepDescriptionCounter').textContent = `${e.target.value.length}/256 characters`;

    dialogue.querySelector('[data-action="close-dialog"]')?.addEventListener('click', listeners.closeBtn);
    dialogue.querySelector('#createTaskForm')?.addEventListener('submit', listeners.taskSubmit);
    dialogue.querySelector('#createStepForm')?.addEventListener('submit', listeners.stepSubmit);
    dialogue.querySelector('#taskName')?.addEventListener('input', listeners.taskNameInput);
    dialogue.querySelector('#taskDescription')?.addEventListener('input', listeners.taskDescriptionInput);
    dialogue.querySelector('#stepName')?.addEventListener('input', listeners.stepNameInput);
    dialogue.querySelector('#stepDescription')?.addEventListener('input', listeners.stepDescriptionInput);
}

function removeListeners(targetElement) {
    const dialogue = targetElement.querySelector('[data-form="createTaskDialog"]');
    if (!dialogue) return;

    dialogue.querySelector('[data-action="close-dialog"]')?.removeEventListener('click', listeners.closeBtn);
    dialogue.querySelector('#createTaskForm')?.removeEventListener('submit', listeners.taskSubmit);
    dialogue.querySelector('#createStepForm')?.removeEventListener('submit', listeners.stepSubmit);
    dialogue.querySelector('#taskName')?.removeEventListener('input', listeners.taskNameInput);
    dialogue.querySelector('#taskDescription')?.removeEventListener('input', listeners.taskDescriptionInput);
    dialogue.querySelector('#stepName')?.removeEventListener('input', listeners.stepNameInput);
    dialogue.querySelector('#stepDescription')?.removeEventListener('input', listeners.stepDescriptionInput);
}

function closeDialogue(targetElement) {
    // You now need to remove the HTML from the DOM to properly close it.
    // The main app flow will handle this, so this function can be simplified.
    // It's here for now for clarity, but the destroy() function handles the cleanup.
    console.log('closeDialogue()');
    targetElement.innerHTML = '';
}

// The module's public interface
export default {
    render(targetElement) {
        targetElement.innerHTML = htmlTemplate;
        const dialogue = targetElement.querySelector('[data-form="createTaskDialog"]');

        const creationDate = dialogue?.querySelector('#creationDate');
        if (creationDate) creationDate.textContent = new Date().toLocaleString();

      //  resetFormAndState(targetElement);
        attachListeners(targetElement);
    },
    destroy(targetElement) {
        removeListeners(targetElement);
        targetElement.innerHTML = '';
    }
};
