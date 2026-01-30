import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { appState } from '../../state/appState.js';

import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';
import { icons } from '../../registry/iconList.js'; 
import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';
import {  detectContext,resolveSubject, applyPresentationRules} from '../../utils/contextSubjectHideModules.js'


console.log('displayTasksManager.js loaded 12:45 Oct 26');

let manager = null;
let managerId = null;
const userId = appState.query.userId;
let panelEl = null;
let managerName = null;

let autoPetition = {
    auth_id:'',  // from resolveSubject
    appro_id:'',  // from resolveSubject
    task_id:'',//from task_assignment table
    step_id:'',//from task_assignment table
    survey_id:null, //
    survey_answer_id:null, //
    assignment_id:'',  //from task_assignments
    automation_id:'' //from  next file executeAutomations?
}

onClipboardUpdate(() => {
  console.log('onClipboardUpdate');
// let manager = resolveSubject();
// managerId =manager.id;
// managerName = manager.name;
 
  render(panelEl);  // I made it a global to have the onclick outside the render function
//  if (!isMyDash) populateApprofileSelect(panel); // optional
});

//if (!isMyDash) { // do stuff if this module has an admin user version
//   populateApprofileSelect(panel);
//   attachDropdownListener(panel);
//   attachClickItemListener(panel); //allows click on the display to change subject of display
//}



export async function render(panel, query = {}) {
      console.log('displayTaskManager.js render()');

let manager = await resolveSubject();
 managerId =manager.approUserId;
 managerName = manager.name;
 


    if (!panel || !panel.isConnected) {
        console.warn('Render target not found or disconnected');
        return;
      }
      

    const userId = appState.query.userId;
    panelEl = panel;
    // Fix HTML duplication:
    panel.innerHTML = `
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
          background-color: rgb(10, 30, 71);
        }
        .advance-button.armed {
          background-color: #10b981; /* Green when armed */
        }
        </style>

        <div class="bg-indigo-50 p-4 rounded-lg border border-indigo-200 mb-6">
            <h3 class="text-xl font-bold mb-4 text-indigo-800">Tasks You Manage </h3>
        <div class="text-xl font-bold mb-4 text-indigo-800" data-manager='manager-name'> Manager:${managerName} id: ${managerId} version 20:20 Oct 27</div>
            <div class="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 class="text-ml font-bold text-blue-500 mb-4">Moving the student -</h4>
                <ul class="list-disc list-inside mt-2 text-sm text-blue-500">
                    <li>As a manager of a task, you can move the student to the next step</li>
                    <li>To move the student to the next step click on the arrow between the current => and next step</li>
                    <li>You have a few seconds to cancel the move by clicking the arrow again</li>
                    <li>The arrow changes direction after being clicked</li>
                    <li>If you don't cancel the move the move will be written to the database and you can't change it</li>
                    <li>If it was a mistake, you will need to message the admin who has permission to make the changes</li>
                    <li>When you judge that the student has finished the final step, moving forward marks the task as completed</li>
                    <li>You can't jump straight to 'completed,' this can only be reached step by step.</li>
                    <li>Once abandoned, the only way to recover is to assign the task again</li>
                    <li>If you are managing a task that you are on you have complete control of progress</li>
                    <li>Moving yourself through a task is done in this section</li>
                </ul>  
            </div>

            <div id="managerTaskCards" class="space-y-6"></div>
        </div>
    `;
if(manager.type ==='relations')  {panel.innerHTML += `<div class="text-gray-500 text-center py-8">You are not managing any tasks.</div>`;
            return;} 
            else 
    try {console.log('try readManagerAss..',managerId);
        const assignments = await executeIfPermitted(userId, 'readManagerAssignments', {
            manager_id: managerId
        });

        if (!assignments || assignments.length === 0) {
            panel.innerHTML += `<div class="text-gray-500 text-center py-8">You are not managing any tasks.</div>`;
            return;
        }

        const cardContainer = panel.querySelector('#managerTaskCards');
        
        for (const assignment of assignments) {
            console.log('task header:',assignment.task_header);
            const taskSteps = await executeIfPermitted(userId, 'readTaskWithSteps', {
                task_header_id: assignment.assignment.task_header
            });

 const taskExternalURL = assignment.task_external_url;
                  console.log('assignment.',assignment,'   ',assignment.assignment);


            const currentStep_order = assignment.current_step;//student uses this as currentStep
           //   const currentStep = assignment.step_order; // in student this works. Odd
            const currentStep = taskSteps.find(s => s.step_order === currentStep_order);//different
            const numberOfSteps = taskSteps.length;
            const abandonStep = taskSteps.find(s => s.step_order === 1);
            //const taskDescription = assignment.task_description;
                 
            const previousStep = currentStep_order > 3
                ? taskSteps.find(s => s.step_order === currentStep_order - 1)
                : currentStep_order === 3
                    ? {
                        step_name: 'New assignment',
                        step_description: 'All tasks start on step 3. Earlier steps are reserved for abandoned or completed.'
                    }
                    : null;

            const nextStep = (() => {
                if (currentStep_order === 1 || currentStep_order === 2) return null;
                if (currentStep_order === numberOfSteps) return taskSteps.find(s => s.step_order === 2);
                return taskSteps.find(s => s.step_order === currentStep_order + 1);
            })();


        // Decide how to render the external URL
    let externalContent = ''; console.log('taskExternalURL:',taskExternalURL);
    if (taskExternalURL) { console.log('taskExternalURL: true');
      if (taskExternalURL.startsWith('<iframe')) { console.log('startsWith(<iframe');//okay to here
        // Treat as raw iframe markup
        externalContent = `
          <div class="mt-4">
            ${taskExternalURL}
          </div>`;
      } else if (taskExternalURL.startsWith('http')) {
        // Treat as plain link
        externalContent = `
          <div class="mt-4">
            <a href="${taskExternalURL}" target="_blank" rel="noopener noreferrer"
               class="text-blue-600 underline hover:text-blue-800">
              Open external resource
            </a>
          </div>`;
      }
    }



            const card = document.createElement('div');
            card.className = 'bg-white rounded-lg shadow-lg p-6 mb-8 border border-indigo-500';

            // Fix missing quote and improve button HTML:
            card.innerHTML = `
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold text-gray-900">${assignment.task_name}</h3>
                    <div class="text-sm text-gray-500">Student: ${assignment.student_name}</div>
                </div>

    <div class="rounded-lg p-6 shadow-md border relative"> ${assignment.task_description}</div> 
    ${externalContent}
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
                                    data-step="${nextStep?.step_id}"  
                                    aria-label="Advance task to next step" title='Click to activate the move student button, then confirm'>
                                🛼🧑‍🎓=>
                            </button>
                        </div>
                        `
                        : ''
                    }

                    ${renderStepCard(nextStep, 'green', 'Next Step', assignment.student_name)}
                </div>

                <div class="mt-6 flex flex-col md:flex-row justify-center gap-4 border-t border-gray-200 pt-4">
                    <div class="flex flex-col md:flex-row justify-center gap-4 pt-4 border-t border-gray-200">
                        <button data-button="message-student" 
                                data-assignment="${assignment.assignment_id}"
                                class="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition" data-action="bug-report">
                            Message Student
                        </button>
                        
                        <button data-action="abandon" 
                                data-state="idle"
                                data-assignment="${assignment.assignment_id}"
                                data-step="${abandonStep?.step_id}"
                                title='Click to activate the button, then confirm to mark the task as abandoned'
                                class="flex-1 py-3 px-6 bg-red-600 text-white rounded-lg hover:bg-red-900 transition">
                            Click to be able to abandon 
                        </button>

                        <button data-button="message-admin" 
                                data-assignment="${assignment.assignment_id}"
                                class="flex-1 py-3 px-6 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition" data-action="bug-report">
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
            ${petitionBreadcrumbs()} `

            cardContainer.appendChild(card);
        }

        // Attach event listeners AFTER all cards are rendered:
        attachEventListeners(panel, userId);

    } catch (error) {
        console.error('Error loading manager tasks:', error);
        panel.innerHTML += `<div class="text-red-500 text-center py-8">Failed to load tasks.</div>`;
        showToast('Failed to load manager tasks', 'error');
    }
}

function renderStepCard(theStep, color, title, studentName) {
  //  console.log('renderCardStep', theStep, ' ', color, ' ', title, ' ', studentName);

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
                <div data-badge='student-name' class="absolute -top-4 -left-4 bg-white rounded-full p-2 text-xs font-medium text-gray-700 shadow border border-gray-200">
                    Student: ${studentName}
                </div>
            ` : ''}
        </div>
    `;
}

function attachEventListeners(panel, userId) {
    panel.addEventListener('click', async (e) => {
        const button = e.target.closest('[data-action]');
        if (!button) return;

        const action = button.getAttribute('data-action');
        const assignmentId = button.getAttribute('data-assignment');
        const stepId = button.getAttribute('data-step');
        const currentState = button.getAttribute('data-state');

        if (action === 'advance') {
            const isArmed = currentState === 'armed';
            
            if (isArmed) {
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
                    
                    // Re-render the entire panel to show updated state:
                    await render(panel, {}); // Pass empty query since userId is in appState
                    
                } catch (error) {
                    showToast('Failed to move student: ' + error.message, 'error');
                    button.disabled = false;
                    button.textContent = '🛼🧑‍🎓'; // Reset button
                }
                
            } else {
                // ARM THE BUTTON:
                button.setAttribute('data-state', 'armed');
                button.classList.remove('opacity-50');
                button.classList.add('armed', 'bg-green-500');
                button.textContent = '🛼🧑‍🎓'; // Strong visual change
                
                // SET TIMEOUT TO RESET:
                button._timeoutId = setTimeout(() => {
                    button.setAttribute('data-state', 'idle');
                    button.classList.remove('armed', 'bg-green-500');
                    button.classList.add('opacity-50');
                    button.textContent = '🛼🧑‍🎓';
                }, 3000); // 3 seconds to confirm
            }
        }

        if (action === 'abandon') {
            showToast('Task marked as abandoned', 'warning');
            // Re-render to show updated state:
            await render(panel, {});
        }

        // Handle message buttons:
        const messageStudentBtn = e.target.closest('[data-button="message-student"]');
        const messageAdminBtn = e.target.closest('[data-button="message-admin"]');
        
        if (messageStudentBtn) {
            const assignmentId = messageStudentBtn.dataset.assignment;
            showToast(`Messaging student for assignment: ${assignmentId.substring(0, 8)}...`, 'info');
        }
        
        if (messageAdminBtn) {
            const assignmentId = messageAdminBtn.dataset.assignment;
            showToast(`Messaging admin for assignment: ${assignmentId.substring(0, 8)}...`, 'info');
        }
    });
}