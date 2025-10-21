import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { appState } from '../../state/appState.js';

export async function render(panel, query = {}) {
  console.log('displayAllStudentTasks.js render() called');

 // const userId = appState.query.userId;
 //const userId='e9b82fd0-067e-43f1-b514-c2dbbfd10cba';//Jubbul
const userId ='ca1e9188-b3d6-4752-a4ed-d0cbdd62c044';//Keki
//const userId ='e44dfc8a-1ded-4c39-aa3b-957c15fa2cf7';//hwbdygg
//const userId='a42c8756-a0ef-41e6-b073-bf20fbd8b7fb';//
//const userId = '87a90183-88b6-450a-94d2-7838ffbbf61b';//girdenjeeko dmin dasboard 3 - completion

 const studentId = userId;

  try {
    const assignments = await executeIfPermitted(userId, 'readStudentAssignments', {
      student_id: studentId,
      type: 'task'
    });

    if (!assignments || assignments.length === 0) {
      panel.innerHTML = `<div class="text-gray-500 text-center py-8">No task assignments found.</div>`;
      return;
    }

    panel.innerHTML = ''; // Clear panel

    for (const assignment of assignments) {
      const taskSteps = await executeIfPermitted(userId, 'readTaskWithSteps', {
        task_header_id: assignment.task_header_id
      });

      const currentStep = assignment.step_order;
      const numberOfSteps = taskSteps.length;
      const studentName = assignment.student_name || 'Unknown Student';
      const taskName = assignment.task_name || 'Unnamed Task';
      const currentStepName = assignment.step_name || 'Unnamed Step';
      const currentStepDescription = assignment.step_description || 'No description available';

      const previousStep = currentStep >= 4
        ? taskSteps.find(s => s.step_order === currentStep - 1)
        : null;

      const nextStep = (() => {
        if (currentStep === 1) return taskSteps.find(s => s.step_order === 1);
        if (currentStep === 2) return taskSteps.find(s => s.step_order === 2);
        if (currentStep === numberOfSteps) return taskSteps.find(s => s.step_order === 2);
        if (currentStep < numberOfSteps) return taskSteps.find(s => s.step_order === currentStep + 1);
        return null;
      })();

      const card = document.createElement('div');
      card.classList.add('bg-white', 'rounded-lg', 'shadow-lg', 'p-6', 'mb-8', 'border', 'border-gray-200');

      card.innerHTML = `
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold text-gray-900">${taskName}</h3>
          <div class="text-sm text-gray-500">Student: ${studentName}</div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

          ${renderStepCard('Previous Step', previousStep, 'gray')}

          ${renderStepCard('Current Step', {
            step_name: currentStepName,
            step_description: currentStepDescription
          }, 'blue', studentName, true, currentStep)}

          ${renderStepCard(
            currentStep === 2 ? 'Completed' :
            currentStep === 1 ? 'Abandoned' :
            currentStep === numberOfSteps ? 'Completion Step' : 'Next Step',
            nextStep,
            'green',
            studentName
          )}
        </div>

        <div class="mt-6 flex flex-col md:flex-row justify-center gap-4 border-t border-gray-200 pt-4">
          <button data-button="abandoned" class="flex-1 py-3 px-6 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
            Abandoned
          </button>
          <button data-button="message-manager" class="flex-1 py-3 px-6 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
            Message Manager
          </button>
        </div>

        <div class="mt-4 bg-green-100 rounded-lg p-4 border border-green-200">
          <p class="text-sm font-bold text-green-800">Information:</p>
          <p class="text-sm text-green-700">There are ${numberOfSteps} steps in this task.</p>
          <p class="text-sm text-green-700">The current step is [${currentStep}]</p>
          ${currentStep === 1 ? '<p class="text-sm text-red-600">This step means abandoned.</p>' : ''}
          ${currentStep === 2 ? '<p class="text-sm text-blue-600">This step means completed.</p>' : ''}
          ${currentStep === numberOfSteps ? '<p class="text-sm text-purple-600">This is the final step. Advancing will complete the task.</p>' : ''}
        </div>
      `;

      panel.appendChild(card);
    }

  } catch (error) {
    console.error('Error loading task assignments:', error);
    panel.innerHTML = `<div class="text-red-500 text-center py-8">Failed to load task assignments.</div>`;
    showToast('Failed to load task assignments', 'error');
  }
}

function renderStepCard(title, step, color, studentName = null, showCheckmark = false, stepNumber = null) {
    if (!step) return '';
  
    const name = step.step_name || 'Unnamed';
    const description = step.step_description || 'No description available';
  
    const bgColor = {
      gray: 'bg-gray-50 border-gray-200',
      blue: 'bg-blue-50 border-blue-200',
      green: 'bg-green-50 border-green-200'
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
                  ${showCheckmark ? `
          <div class="absolute top-2 right-2 text-green-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2l4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>` : ''}
      </div>
    `;
  }
  
