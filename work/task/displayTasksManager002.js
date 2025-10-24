import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { appState } from '../../state/appState.js';

export async function render(panel, query = {}) {
  const userId = appState.query.userId;
  panel.innerHTML = panel.innerHTML = `
  <div class="bg-indigo-50 p-4 rounded-lg border border-indigo-200 mb-6">
    <h3 class="text-xl font-bold mb-4 text-indigo-800">Tasks You Manage</h3>
 
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

      const previousStep = currentStep > 3
        ? taskSteps.find(s => s.step_order === currentStep - 1)
        : currentStep === 3
          ? {
              step_name: 'New assignment',
              step_description: 'All tasks start on step 3. Earlier steps are reserved for abandoned or completed.'
            }
          : null;

      const nextStep = (() => {
        if (currentStep === 1 || currentStep === 2) return null;
        if (currentStep === numberOfSteps) return taskSteps.find(s => s.step_order === 2);
        return taskSteps.find(s => s.step_order === currentStep + 1);
      })();

      const card = document.createElement('div');
      card.className = 'bg-white rounded-lg shadow-lg p-6 mb-8 border border-indigo-500';

      card.innerHTML = `
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold text-gray-900">${assignment.task_name}</h3>
          <div class="text-sm text-gray-500">Student: ${assignment.student_name}</div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${renderStepCard('Previous Step', previousStep, 'gray')}
          ${renderStepCard('Current Step', {
            step_name: assignment.step_name,
            step_description: assignment.step_description
          }, 'blue', assignment.step_order, assignment.student_name)}
          ${renderStepCard(
            currentStep === 2 ? 'Completed' :
            currentStep === 1 ? 'Abandoned' :
            currentStep === numberOfSteps ? 'Completion Step' : 'Next Step',
            nextStep,
            'green'
          )}
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

//      panel.appendChild(card);

const cardContainer = panel.querySelector('#managerTaskCards');
cardContainer.appendChild(card);


    }

  } catch (error) {
    console.error('Error loading manager tasks:', error);
    panel.innerHTML += `<div class="text-red-500 text-center py-8">Failed to load tasks.</div>`;
    showToast('Failed to load manager tasks', 'error');
  }
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
