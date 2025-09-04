//  ./work/task/createTask.js
import { supabase } from '../../supabaseClient.js';
console.log('createTask.js loaded');



const state = {
  taskId: null,
  steps: [],
  user: '06e0a6e6-c5b3-4b11-a9ec-3e1c1268f3df' // MOCK
};

// 🧠 Utility
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

function resetFormAndState() {
  console.log('ResetFormAndState()');
  document.querySelector('#createTaskForm')?.reset();
  document.querySelector('#createStepForm')?.reset();

  document.querySelector('#taskName')?.removeAttribute('disabled');
  document.querySelector('#taskDescription')?.removeAttribute('disabled');
  document.querySelector('#taskUrl')?.removeAttribute('disabled');

  document.querySelector('#taskIdDisplay')?.classList.add('hidden');
  document.querySelector('#stepsSection')?.classList.add('opacity-50', 'pointer-events-none');
  document.querySelector('#createdSteps')?.classList.add('hidden');

  const stepOrder = document.querySelector('#stepOrder');
  if (stepOrder) stepOrder.value = 3;    //  why?

  const stepNameCounter = document.querySelector('#stepNameCounter');
  if (stepNameCounter) stepNameCounter.textContent = '0/64 characters';

  const stepDescriptionCounter = document.querySelector('#stepDescriptionCounter');
  if (stepDescriptionCounter) stepDescriptionCounter.textContent = '0/256 characters';

  state.taskId = null;
  state.steps = [];// on reset why null? The start position is that there are 3 steps
}

export function openDialogue(formName) {
  console.log('openDialogue(', formName, ')');
  const selector =`[data-form="${formName}"]`;
    const dialogue = document.querySelector(selector);


//  const selector = `.${formName}`;
 // const dialogue = document.querySelector(selector);

  if (!dialogue) {
    console.warn(`Modal not found for selector: ${selector}`);
    return;
  }

  console.log('Opening modal:', selector);
  dialogue.classList.remove('hidden');
  dialogue.classList.add('flex');

  const creationDate = dialogue.querySelector('#creationDate'); //what is this???
  if (creationDate) creationDate.textContent = new Date().toLocaleString(); ///what is this???

  resetFormAndState(dialogue); // optionally pass the modal to reset only its form
}


function closeDialogue() {
  console.log('closeDialogue()');
  const dialogue = document.querySelector('.create-task-dialogue');/// .create is probably wrong
  if (!dialogue) return;   // why is this function looking in the DOM? Why not pass it?

  dialogue.classList.add('hidden');
  dialogue.classList.remove('flex');
  resetFormAndState();
}

// 📝 Task Creation
async function handleTaskSubmit(e) {
  console.log('handleTaskSubmit()');
  
  e.preventDefault();  //Why prevent default?

  const saveBtn = document.querySelector('#saveTaskBtn');
  const taskName = document.querySelector('#taskName')?.value;
  const taskDescription = document.querySelector('#taskDescription')?.value;
  const taskUrl = document.querySelector('#taskUrl')?.value;
// this gives no chance to validate anything. This is stupid
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving Task...';

  const { error, data } = await supabase
    .from('task_headers')
    .insert({
      name: taskName,
      description: taskDescription,
      external_url: taskUrl || null,
      author_id: user
    })
    .select()
    .single();

  if (error) {
    showToast('Failed to create task: ' + error.message, 'error');
  } else {
    state.taskId = data.id;
    document.querySelector('#taskIdDisplay').textContent = `Task ID: ${data.id}`;
    document.querySelector('#taskIdDisplay')?.classList.remove('hidden');
    document.querySelector('#stepsSection')?.classList.remove('opacity-50', 'pointer-events-none');

    document.querySelector('#taskName')?.setAttribute('disabled', true);
    document.querySelector('#taskDescription')?.setAttribute('disabled', true);
    document.querySelector('#taskUrl')?.setAttribute('disabled', true);

    showToast('Task created successfully!');
  }

  saveBtn.disabled = false;
  saveBtn.textContent = 'Save Task';
}

// 🧩 Step Creation
async function handleStepSubmit(e) {
  e.preventDefault();
console.log('handleStepSubmit()');
  const order = parseInt(document.querySelector('#stepOrder')?.value);
  const stepName = document.querySelector('#stepName')?.value;
  const stepDescription = document.querySelector('#stepDescription')?.value;
  const stepUrl = document.querySelector('#stepUrl')?.value;
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
        author_id: state.user.id
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
    document.querySelector('#stepNameCounter').textContent = '0/64 characters';
    document.querySelector('#stepDescriptionCounter').textContent = '0/256 characters';
    showToast('Step saved!');
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


// ✍️ Form Listeners
document.querySelector('#createTaskForm')?.addEventListener('submit', handleTaskSubmit);
document.querySelector('#createStepForm')?.addEventListener('submit', handleStepSubmit);

// ✏️ Character Counters
document.querySelector('#taskName')?.addEventListener('input', (e) => {
  document.querySelector('#taskNameCounter').textContent = `${e.target.value.length}/64 characters`;
});
document.querySelector('#taskDescription')?.addEventListener('input', (e) => {
  document.querySelector('#taskDescriptionCounter').textContent = `${e.target.value.length}/256 characters`;
});
document.querySelector('#stepName')?.addEventListener('input', (e) => {
  document.querySelector('#stepNameCounter').textContent = `${e.target.value.length}/64 characters`;
});
document.querySelector('#stepDescription')?.addEventListener('input', (e) => {
  document.querySelector('#stepDescriptionCounter').textContent = `${e.target.value.length}/256 characters`;
});
