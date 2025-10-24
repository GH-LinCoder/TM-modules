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
  background-color:rgb(10, 30, 71);
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

// 'assignment_id', 'student_id', 'student_name', 'task_header_id', 'task_name', 'task_description', 
//      'step_order', 'step_name', 'step_description', 'manager_id', 'manager_name', 'assigned_at'
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

      const currentStep_order = assignment.step_order; //
      const currentStep = taskSteps.find(s => s.step_order === currentStep_order);
      const numberOfSteps = taskSteps.length;
      const abandonStep = taskSteps.find(s => s.step_order === 1); // why??


      const previousStep = currentStep_order > 3
        ? taskSteps.find(s => s.step_order === currentStep_order - 1) //if on step4+ get the actual previous step
        : currentStep_order === 3  // if on step 3 fabricate an explanation to show instead of a previous step
          ? {
              step_name: 'New assignment',
              step_description: 'All tasks start on step 3. Earlier steps are reserved for abandoned or completed.'
            }
          : null;  //if <3 its 1 or 2 and there is nothing to show previously 

      const nextStep = (() => {
        if (currentStep_order === 1 || currentStep_order === 2) return null; // when abandoned or completed don't show a next step
        if (currentStep_order === numberOfSteps) return taskSteps.find(s => s.step_order === 2);//current step is the final step so show the next step as 'completed'
        return taskSteps.find(s => s.step_order === currentStep_order + 1); //all other cases get the actual next step
      })();




      
      const card = document.createElement('div');
      card.className = 'bg-white rounded-lg shadow-lg p-6 mb-8 border border-indigo-500';

      card.innerHTML = `
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold text-gray-900">${assignment.task_name}</h3>
          <div class="text-sm text-gray-500">Student: ${assignment.student_name}</div>
        </div>

        <div class="flex flex-row items-center justify-center gap-6">
          
        ${renderStepCard(previousStep, 'gray', 'Previous Step')}
${renderStepCard(currentStep, 'blue', 'Current Step', assignment.student_name)}

<!-- advance arrow -->
${nextStep?.step_id
  ? `
<div class="relative flex justify-center items-center">
  <button class="advance-button opacity-50 hover:opacity-100 transition-opacity" 
        data-action="advance" 
        data-state="idle"
    data-assignment="${assignment.assignment_id}"
    data-step="${nextStep?.step_id}
    aria-label="Advance task to next step"
  >
  🛼🧑‍🎓
  </button>
</div>
  `
  : ''}


    ${renderStepCard(nextStep, 'green', 'nextStep', assignment.student_name)}

        </div>

<div class="mt-6 flex flex-col md:flex-row justify-center gap-4 border-t border-gray-200 pt-4">
      


        <!-- Action Buttons -->
        <div class="flex flex-col md:flex-row justify-center gap-4 pt-4 border-t border-gray-200">
          <button data-button="message-student" class="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Message Student
          </button>
          
<button data-action="abandon" data-state="idle"
        data-assignment="${assignment.assignment_id}"
        data-step="${abandonStep?.step_id}"
        class="flex-1 py-3 px-6 bg-red-600 text-white rounded-lg hover:bg-red-900 transition"">
  Click to be able to abandon 
</button>


          <button data-button="message-admin" class="flex-1 py-3 px-6 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
            Message Admin
          </button>
        </div>
    </div>

        <div class="mt-4 bg-green-100 rounded-lg p-4 border border-green-200">
          <p class="text-sm font-bold text-green-800">Information:</p>
          <p class="text-sm text-green-700">There are ${numberOfSteps} steps in this task.</p>
          <p class="text-sm text-green-700">Current step: ${currentStep_order}</p>
          ${currentStep_order === 1 ? '<p class="text-sm text-red-600">This step means abandoned.</p>' : ''}
          ${currentStep_order === 2 ? '<p class="text-sm text-blue-600">This step means completed.</p>' : ''}
          ${currentStep_order === numberOfSteps ? '<p class="text-sm text-purple-600">This is the final step. Advancing will complete the task.</p>' : ''}
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
  
    if (action === 'advance') 
    
    if (currentState === 'armed') {
        // CONFIRM THE MOVE:
        clearTimeout(button._timeoutId);
        button.disabled = true;
        button.textContent = 'Moving...';
        
        try {
            await executeIfPermitted(userId, 'assignmentUpdateStep', {
                assignment_id: assignmentId,
                step_id: stepId
            });
            
            showToast('Student moved to next step!', 'success');
            await this.render(panel, query); // Refresh display
            
        } catch (error) {
            showToast('Failed to move student: ' + error.message, 'error');
            button.disabled = false;
            button.textContent = '▶️'; // Reset button
        }
        
    } else {
        // ARM THE BUTTON:
        button.setAttribute('data-state', 'armed');
        button.classList.remove('opacity-50');
        button.classList.add('bg-green-500', 'text-white');
        button.textContent = '🛼🧑‍🎓'; // Strong visual change
        
        // SET TIMEOUT TO RESET:
        button._timeoutId = setTimeout(() => {
            button.setAttribute('data-state', 'idle');
            button.classList.remove('bg-green-500', 'text-white');
            button.classList.add('opacity-50');
            button.textContent = '🛼🧑‍🎓';
        }, 3000); // 3 seconds to confirm
    }

  
/* The move student process
1) The blue circle has an arrow and '?'   => ?
2) Clicking the circle changes the color to green and the ? is replaced by the arrow =>
    2a) The student badge moves from the middle card to the right hand card
3) A timer starts and within T seconds the button reverts to grey with '=>?' and the badge moves back
4) If clicked within those T seconds the db is written moving the student from the current step to the next step    
*/



/* The abandon process:
1. The gray button says 'click to arm (abandon)'
2. If clicked the color changes to red and the text changes to 'Click to abandon'
3. A timer starts and within T seconds the button reverts to gray 'Click to arm (abandon)
4. If clicked within those T seconds then the database is written changing the step to = 1
5. The button is disabled and say "The task was abandoned"
*/

/* The abandon button should not be active if the task is abandoned or completed

*/
    if (action === 'abandon') {
  /*
      await executeIfPermitted(userId, 'assignmentUpdateStep', {
        assignment_id: assignmentId,
        step_id: stepId
      });
  */
      showToast('Task marked as abandoned', 'warning'); 
      render(panel);
    }
  
    // Add other actions here (message-student, message-admin, etc.)
  }); // end of listeners
}





function renderStepCard(theStep, color, title, studentName) {

console.log('renderCardStep',theStep,' ', color,' ', title,' ', studentName);

    if (!theStep) return '';
  
    const { step_name, step_description, step_order } = theStep;
    const bgColor = `bg-${color}-50`;
  
    return `
      <div class="${bgColor} rounded-lg p-6 shadow-md border relative">
        <div class="text-sm font-semibold text-${color}-600 mb-2">
            ${typeof step_order === 'number' ? `Step ${step_order}: ` : ''}${title}
        </div>
        <h4 class="text-lg font-bold">${step_name}</h4>
        <p class="text-sm text-gray-600 mt-1">${step_description}</p>
         ${studentName && title === 'Current Step' ? `
      <div  data-badge ='student-name' class="absolute -top-4 -left-4 bg-white rounded-full p-2 text-xs font-medium text-gray-700 shadow border border-gray-200">
        Student: ${studentName}
      </div>` : ''}
      </div>
    `;
  }
  

// 'assignment_id', 'student_id', 'student_name', 'task_header_id', 'task_name', 'task_description', 
//      'step_order', 'step_name', 'step_description', 'manager_id', 'manager_name', 'assigned_at'