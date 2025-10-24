import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { appState } from '../../state/appState.js';

export async function render(panel, query = {}) {
  const userId = appState.query.userId;
  panel.innerHTML = panel.innerHTML = `

<style>
.advance-button {
  background-color: #3b82f6;
  color: white;
  transition: background-color 0.2s ease-in-out;
  border-radius: 9999px;
  padding: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.advance-button:hover {
  background-color: #2563eb;
}
</style>


  <div class="bg-indigo-50 p-4 rounded-lg border border-indigo-200 mb-6">
    <h3 class="text-xl font-bold mb-4 text-indigo-800">Tasks You Manage</h3>
 
<div class="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                       <h4 class="text-ml font-bold text-blue-500 mb-4">Moving the student</h4>
                       <ul class="list-disc list-inside mt-2 text-sm text-blue-500">
                       <li>As a manger of a task, you can move the student to the next step</li>
                       <li>To move the student to the next step click on the arrow btween the current => and next step</li>
                       <li>You have a few seconds to cancel the move by clicking the arrow again</li>
                        <li> The arrow changes direction after being clicked</li>
                        <li> If you don't cancel the move the move will be written to the database and you can't change it</li>
                        <li> If it was a mistake, you will need to message the admin who has permission to make the changes</li>
                        <li> When you judge that the student has finished the final step, moving forward marks the task as completed</li>
                        <li>You can't jump straight to 'completed,' this can only be reached step by step.</li>
                        <li>Once abandoned, the only way to recover is to assign the task again</li>
                      <li>If you are managing a task that you are on you have complete control of progress'</li>
                      <li>Moving yourself through a task is done in this section</li>
                    
                        </ul>  
                    </div>





    <div id="managerTaskCards" class="space-y-6"></div>
 
    </div>
`;


  try {
    const assignments = await executeIfPermitted(userId, 'readManagerAssignments', {
      manager_id: userId
    });

    if (!assignments || assignments.length === 0) {
      panel.innerHTML += `<div class="text-gray-500 text-center py-8">You are not managing any tasks.</div>`;
      return;
    }

    for (const assignment of assignments) {
      const taskSteps = await executeIfPermitted(userId, 'readTaskWithSteps', {
        task_header_id: assignment.task_header_id
      });

      const currentStep = assignment.step_order;
      const numberOfSteps = taskSteps.length;
      const abandonStep = taskSteps.find(s => s.step_order === 1);


      const previousStep = currentStep > 3
        ? taskSteps.find(s => s.step_order === currentStep - 1) //if on step4+ get the actual previous step
        : currentStep === 3  // if on step 3 fabricate an explanation to show instead of a previous step
          ? {
              step_name: 'New assignment',
              step_description: 'All tasks start on step 3. Earlier steps are reserved for abandoned or completed.'
            }
          : null;  //if <3 its 1 or 2 and there is nothing to show previously 

      const nextStep = (() => {
        if (currentStep === 1 || currentStep === 2) return null; // when abandoned or completed don't show a next step
        if (currentStep === numberOfSteps) return taskSteps.find(s => s.step_order === 2);//current step is the final step so show the next step as 'completed'
        return taskSteps.find(s => s.step_order === currentStep + 1); //all other cases get the actual next step
      })();




      
      const card = document.createElement('div');
      card.className = 'bg-white rounded-lg shadow-lg p-6 mb-8 border border-indigo-500';

      card.innerHTML = `
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold text-gray-900">${assignment.task_name}</h3>
          <div class="text-sm text-gray-500">Student: ${assignment.student_name}</div>
        </div>

        <div class="flex flex-row items-center justify-center gap-6">
          ${renderStepCard('Previous Step', previousStep, 'gray')}
          
      
          ${renderStepCard('Current Step', {  
            step_name: assignment.step_name,
            step_description: assignment.step_description
          }, 'blue', assignment.step_order, assignment.student_name)}

<!-- advance arrow -->
${nextStep?.step_id
  ? `
<div class="relative flex justify-center items-center">
  <button
    class="advance-button"
    data-action="advance"
    data-assignment="${assignment.assignment_id}"
    data-step="${nextStep?.step_id}"
      data-state="idle"
    aria-label="Advance task to next step"
  >
    <svg id="forwardArrow" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M13 5l7 7-7 7M5 12h14" />
    </svg>
    <svg id="backwardArrow" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M11 19l-7-7 7-7M19 12h-14" />
    </svg>
  </button>
</div>
  `
  : ''}


          ${renderStepCard(   // this renders next step
            currentStep === 2 ? 'Completed' :
            currentStep === 1 ? 'Abandoned' :
            currentStep === numberOfSteps ? 'Completion Step' : 'Next Step',
            nextStep,
            'green'
          )}
        </div>

<div class="mt-6 flex flex-col md:flex-row justify-center gap-4 border-t border-gray-200 pt-4">
      
<button data-action="abandon"
        data-assignment="${assignment.assignment_id}"
        data-step="${abandonStep?.step_id}"
        class="...">
  Mark as Abandoned
</button>

      <!-- other buttons -->
    </div>


        <div class="mt-4 bg-green-100 rounded-lg p-4 border border-green-200">
          <p class="text-sm font-bold text-green-800">Information:</p>
          <p class="text-sm text-green-700">There are ${numberOfSteps} steps in this task.</p>
          <p class="text-sm text-green-700">Current step: ${currentStep}</p>
          ${currentStep === 1 ? '<p class="text-sm text-red-600">This step means abandoned.</p>' : ''}
          ${currentStep === 2 ? '<p class="text-sm text-blue-600">This step means completed.</p>' : ''}
          ${currentStep === numberOfSteps ? '<p class="text-sm text-purple-600">This is the final step. Advancing will complete the task.</p>' : ''}
        </div>
      `;

const cardContainer = panel.querySelector('#managerTaskCards');
cardContainer.appendChild(card);

}

} catch (error) {
  console.error('Error loading manager tasks:', error);
  panel.innerHTML += `<div class="text-red-500 text-center py-8">Failed to load tasks.</div>`;
  showToast('Failed to load manager tasks', 'error');
}

panel.addEventListener('click', async (e) => {
    const button = e.target.closest('[data-action]');
    if (!button) return;
  
    const action = button.getAttribute('data-action');
    const assignmentId = button.getAttribute('data-assignment');
    const stepId = button.getAttribute('data-step');
    const currentState = button.getAttribute('data-state');
  
    if (action === 'advance') {
      const forwardArrow = button.querySelector('#forwardArrow');
      const backwardArrow = button.querySelector('#backwardArrow');
  
     console.log('button when clicked had current state:', currentState); //logs what the value was when clicked
  
      if (currentState === 'pending') {
        clearTimeout(button._advanceTimeout);
        button.setAttribute('data-state', 'idle');
        forwardArrow?.classList.remove('hidden');
        backwardArrow?.classList.add('hidden');
        showToast('Advance cancelled', 'info');
        console.log('after code to change state inside button:', button.getAttribute('data-state'));//
        return;
      }
  
      button.setAttribute('data-state', 'pending');
      forwardArrow?.classList.add('hidden');
      backwardArrow?.classList.remove('hidden');
  
      console.log('after code to change state inside button:', button.getAttribute('data-state'));//

      button._advanceTimeout = setTimeout(async () => {
        if (button.getAttribute('data-state') !== 'pending') return;
  
        await executeIfPermitted(userId, 'assignmentUpdateStep', {
          assignment_id: assignmentId,
          step_id: stepId
        });
  
        showToast('Student advanced to next step', 'success');
        render(panel);
      }, 5000);
    }
  
    if (action === 'abandon') {
      const confirmed = confirm('Are you sure you want to mark this task as abandoned?');
      if (!confirmed) return;
  
      await executeIfPermitted(userId, 'assignmentUpdateStep', {
        assignment_id: assignmentId,
        step_id: stepId
      });
  
      showToast('Task marked as abandoned', 'warning');
      render(panel);
    }
  
    // Add other actions here (message-student, message-admin, etc.)
  });
  

}

function renderStepCard(title, step, color, stepNumber = null, studentName = null) {
  if (!step) return '';

  const name = step.step_name || 'Unnamed';
  const description = step.step_description || 'No description available';

  const bgColor = {
    gray: 'bg-gray-50 border-gray-200',
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    red: 'bg-red-50 border-red-200'
  }[color] || 'bg-white border-gray-200';

  return `
  <div class="${bgColor} rounded-lg p-6 shadow-md border relative">
    <div class="text-sm font-semibold text-${color}-600 mb-2">
      ${stepNumber !== null ? `Step ${stepNumber}: ` : ''}${title}
    </div>
    <h4 class="text-lg font-bold">${name}</h4>
    <p class="text-sm text-gray-600 mt-1">${description}</p>
    ${studentName && title === 'Current Step' ? `
      <div class="absolute -top-4 -left-4 bg-white rounded-full p-2 text-xs font-medium text-gray-700 shadow border border-gray-200">
        Student: ${studentName}
      </div>` : ''}
  </div>
`;
}
