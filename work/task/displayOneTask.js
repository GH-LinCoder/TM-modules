// ./work/tasks/displayOneTask.js
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { appState } from '../../state/appState.js';
import { resolveSubject } from '../../utils/contextSubjectHideModules.js';
import { executeAutomations } from '../../utils/executeAutomations.js'

let subject = null;
let assignment = null;
let panelEl = null;


const autoPetition = {
    auth_id: '',
    appro_id: '',
    task_id: '',
    step_id: '',
    survey_id: null,
    survey_answer_id: null,
    assignment_id: '',
    automation_id: ''
};



export async function render(panel, query = {}) {
    console.log('displayOneTask.js render() panel',panel);
    panelEl = panel;

subject = await resolveSubject();
   const assignmentId = query.assignmentId || appState.query.petitioner?.assignmentId;

    // Set up autoPetition
    autoPetition.auth_id = subject.id;
    autoPetition.appro_id = subject.approUserId;



try { //the registry function needs: const { assignment_id} = payload; 
// reads: assignments_task_view
//delivers: 'task_name,student_name,manager_id,step_id,step_name,assigned_at,abandoned_at,completed_at
        const assignmentData = await executeIfPermitted(subject.approUserId, 'readThisAssignment', {
            assignment_id: assignmentId
        });
        
        if (!assignmentData || assignmentData.length === 0) {
            panel.innerHTML = `<div class="text-gray-500 text-center py-8">No task assignment found for: ${subject.name} - ${assignmentId}.</div>`;
            return;
        }
        assignment = assignmentData[0]; //how does taking [0] work? what's in [n]?
        // Store as global source of truth
//        assignment = assignmentData;
        
        renderLargeCards(panel);
        
    } catch (error) {
        console.error('Error loading task assignment:', error);
        panel.innerHTML = `<div class="text-red-500 text-center py-8">Failed to load task assignment for: ${subject.name} - ${assignmentId}.</div>`;
        showToast(`No task assignments found for: ${subject.name}`, 'error');
    }

}





async function renderLargeCards(panel) { //should not be plural

    const userId = subject.approUserId

    panel.innerHTML = '';
    console.log('assignmentData', assignment);
//    for (const assignment of assignments) { //this is for an array. We don't have an array
        // Initialize displayedStep if not already set
        if (assignment.displayedStep === undefined) {
            assignment.displayedStep = assignment.step_order;
        }
        
        console.log('calling readTaskWithSteps');
        const taskSteps = await executeIfPermitted(userId, 'readTaskWithSteps', {
            task_header_id: assignment.assignment.task_header
        });
        
        // Cache task steps for later use
        assignment._taskSteps = taskSteps;
        
        const taskExternalURL = assignment.task_external_url;
        const taskName = assignment.task_name || 'Unnamed Task';
        const taskDescription = assignment.task_description;
        const currentStepName = assignment.step_name || 'Unnamed Step';
        const currentStepDescription = assignment.step_description || 'No description available';
        
        // Set up autoPetition - I have forgotten what this is March 8
        autoPetition.assignment_id = assignment.assignment_id;
        autoPetition.task_id = assignment.assignment.task_header;
        autoPetition.step_id = assignment.step_id;
        
        loadStepAutomations(assignment.step_id);  //temp removed while debugging display
        
        // Calculate previous and next steps
        const previousStep = assignment.displayedStep === 3
            ? {
                step_name: 'New assignment',
                step_description: 'All tasks start on step 3. The previous steps are reserved to mark the assignment as abandoned (step 1) or completed (step 2).'
            }
            : assignment.displayedStep === 2
                ? taskSteps.reduce((max, step) => step.step_order > max.step_order ? step : max, taskSteps[0])
                : assignment.displayedStep > 3
                    ? taskSteps.find(s => s.step_order === assignment.displayedStep - 1)
                    : null;
        
        const nextStep = (() => {
            if (assignment.displayedStep === 1 || assignment.displayedStep === 2) return null;
            if (assignment.displayedStep === taskSteps.length) return taskSteps.find(s => s.step_order === 2);
            if (assignment.displayedStep < taskSteps.length) return taskSteps.find(s => s.step_order === assignment.displayedStep + 1);
            return null;
        })();
        
        // Generate buttons using assignment object directly
        const buttonHTML = decideButtonsToDisplay(assignment, taskSteps);
        
        // Render external URL content
        let externalContent = '';
        if (taskExternalURL) {
            if (taskExternalURL.startsWith('<iframe')) {
                externalContent = `<div class="mt-4">${taskExternalURL}</div>`;
            } else if (taskExternalURL.startsWith('http')) {
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
        card.classList.add('bg-white', 'rounded-lg', 'shadow-lg', 'p-6', 'mb-8', 'border', 'border-gray-200');
        card.dataset.assignmentId = assignment.assignment_id; // Store assignment ID
        
        card.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-semibold text-gray-900">${taskName}</h3>
                <div class="text-sm text-gray-500"> Manager: ${assignment.manager_name || 'Unknown Manager'}</div>
                <div class="text-sm text-gray-500">${assignment.assignment.task_header}</div>
                <div class="text-sm text-gray-500"> Student: ${assignment.student_name || 'Unknown Student'}</div>
            </div>
            <div class="rounded-lg p-6 shadow-md border relative whitespace-pre-line">${taskDescription}</div>
            ${externalContent}
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                ${renderStepCard('Previous Step', previousStep, assignment.student_name, true, 'gray')}
                ${renderStepCard('Current Step', {
                    step_name: currentStepName,
                    step_description: currentStepDescription,
                    external_url: assignment.external_url  
                }, assignment.displayedStep === 1 ? 'red' : assignment.displayedStep === 2 ? 'green' : 'blue', assignment.student_name, false, assignment.displayedStep, assignment.assignment_id)}
                ${renderStepCard(
                    assignment.displayedStep === 2 ? 'Completed' :
                    assignment.displayedStep === 1 ? 'Abandoned' :
                    assignment.displayedStep === taskSteps.length ? 'Completion Step' : 'Next Step',
                    nextStep,
                    'green',
                    assignment.student_name
                )}
            </div>
            <div id="taskActionButtons" class="mt-6 flex flex-col md:flex-row justify-center gap-4 border-t border-gray-200 pt-4">
                ${buttonHTML}
            </div>
            <div class="mt-4 bg-green-100 rounded-lg p-4 border border-green-200">
                <p class="text-sm font-bold text-green-800">Information:</p>
                <p class="text-sm text-green-700">There are ${taskSteps.length} steps in this task.</p>
                <p class="text-sm text-green-700">The current step is [${assignment.displayedStep}]</p>
                ${assignment.displayedStep === 1 ? '<p class="text-sm text-red-600">This step means abandoned.</p>' : ''}
                ${assignment.displayedStep === 2 ? '<p class="text-sm text-blue-600">This step means completed.</p>' : ''}
                ${assignment.displayedStep === taskSteps.length ? '<p class="text-sm text-purple-600">This is the final step. Advancing will complete the task.</p>' : ''}
                <p class="text-sm text-blue-600">Move by ${assignment.move_by}</p> 
            </div>
        `;
      const displayArea = document.querySelector(`[data-section="display-area"]`); 
 //const section = document.querySelector('[data-section="display-area"]');
//const displayArea = section?.querySelector('[data-panel="inject-here"]'); // null

 
 console.log('displayArea', displayArea),
        displayArea.appendChild(card); //need to append it to the destination which is 'display-area'
   // }  this was forEach - but not using ana array
    
    addEventListenerToButtons(panel);
}

function decideButtonsToDisplay(assignment, taskSteps) {
    const currentStep = assignment.displayedStep;
    const numberOfSteps = taskSteps.length;
    const moveBy = assignment.move_by;
    const studentName = assignment.student_name;
    const managerName = assignment.manager_name;
    const taskId = assignment.assignment.task_header;
    const stepId = assignment.step_id;
    const taskName = assignment.task_name;
    const assignmentId = assignment.assignment_id;
    
    // Abandon button
    const showAbandonButton = currentStep !== 1 && currentStep !== 2 && moveBy === 'student';
    const abandonButton = showAbandonButton ? `
        <button data-button="abandoned" 
                data-assignment-id="${assignmentId}"
                class="flex-1 py-3 px-6 bg-red-600 text-white rounded-lg hover:bg-red-700 transition" 
                title="Two step process. First click, consider, then confirm or ignore. Second click cannot be reversed. An abandoned is closed. To return to it requires a new assignment"
                >Click to abandon this task</button>` : '';
    
    // Previous button
    const showPreviousButton = (currentStep > 3 && moveBy === 'student');
    const previousButton = showPreviousButton ? `
        <button data-button="previous" 
                data-assignment-id="${assignmentId}"
                class="flex-1 py-3 px-6 bg-gray-100 text-blue rounded-lg hover:bg-gray-300 transition">
            ◀️ Look at Previous Step
        </button>` : '';
    
    // Next button
    const showNextButton = (currentStep < numberOfSteps + 1 && moveBy === 'student' && currentStep>2);
    const nextButton = showNextButton ? `
        <button data-button="next" 
                data-assignment-id="${assignmentId}"
                class="flex-1 py-3 px-6 bg-gray-100 text-blue rounded-lg hover:bg-gray-300 transition">
            Look at Next Step ▶️
        </button>` : '';
    
    // Message manager button
    const showMessageManager = (studentName !== managerName);
    const messageManagerButton = showMessageManager ? `
        <button data-button="message-manager" 
                data-assignment-id="${assignmentId}"
                class="flex-1 py-3 px-6 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition" 
                data-action="bug-report">
            Message Manager
        </button>` : '';
    
    // Complete step button
/*    const showCompleteButton = (moveBy === 'student' && currentStep > 2 && currentStep !== 2);
    const completeButton = showCompleteButton ? `
        <button data-button="complete" 
                data-assignment-id="${assignmentId}"
                class="flex-1 py-3 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
            ✓ Mark Step Complete
        </button>` : '';  */
    
    return abandonButton + previousButton + nextButton + messageManagerButton;// + completeButton;
}

function addEventListenerToButtons(panel) {
    const buttonContainers = panel.querySelectorAll('#taskActionButtons');
    
    buttonContainers.forEach(container => {
        container.addEventListener('click', (e) => {
            const button = e.target.closest('[data-button]');
            if (!button) return;
            
            const action = button.dataset.button;
            const assignmentId = button.dataset.assignmentId;
            
            switch(action) {
                case 'abandoned':
                    handleAbandonTask(button, assignmentId);
                    break;
                case 'previous':
                    handlePreviousStep(assignmentId);
                    break;
                case 'next':
                    handleNextStep(assignmentId);
                    break;
                case 'message-manager':
                    handleMessageManager(button, assignmentId);
                    break;
                case 'complete':
                    handleCompleteStep(assignmentId);
                    break;
            }
        });
    });
}

function handleAbandonTask(button, assignmentId) {
    console.log('handleAbandonTask()');
    
    if (button.textContent === 'Click to abandon this task') {
        button.textContent = 'Confirm abandoning this task';
    } else if (button.textContent === 'Confirm abandoning this task') {
        updateDbTaskStep(assignmentId, 1);
        // Update displayed state
     //   const assignment = assignments.find(a => a.assignment_id === assignmentId); //we already know the assignment
        if (assignment) {
            assignment.displayedStep = 1;
            reRenderAssignmentCard(assignmentId);
        }
    }
}

function handlePreviousStep(assignmentId) {
    console.log('handlePreviousStep()');
//    const assignment = assignments.find(a => a.assignment_id === assignmentId); //we are not handling an array
    
    if (!assignment || assignment.displayedStep <= 3) return;
    
    assignment.displayedStep = assignment.displayedStep - 1;
    reRenderAssignmentCard(assignmentId);
}

function handleNextStep(assignmentId) {
    console.log('handleNextStep()');
  //  const assignment = assignments.find(a => a.assignment_id === assignmentId); //we are not handling an array
    
    if (!assignment || assignment.displayedStep <= 2) return;
    
    let newStep;
    if (assignment.displayedStep === assignment._taskSteps.length) { // only make this happen if user clicks "step completed"
        showToast("The next step is completion. If you want to mark it completed click the completed button");
        //newStep = 2; // completion
    } else {
        newStep = assignment.displayedStep + 1;
    }
    
    assignment.displayedStep = newStep;
    reRenderAssignmentCard(assignmentId);
}

function handleCompleteStep(assignmentId) {
    console.log('handleCompleteStep()');
//    const assignment = assignment.find(a => a.assignment_id === assignmentId);
    
    if (!assignment || assignment.displayedStep <= 2) return;
    
    // Update database
    updateDbTaskStep(assignmentId, assignment.displayedStep)
        .then(() => {
            showToast('Step marked as complete!', 'success');
        })
        .catch(error => {
            showToast('Failed to save progress', error);
        });
}

function handleMessageManager(button, assignmentId) {
    console.log('handleMessageManager()');
    // Add manager details to clipboard for messaging module
}

async function updateDbTaskStep(assignmentId, destinationStep) {
    console.log('updateDbTaskStep() destinationStep:', destinationStep);
    try {
        await executeIfPermitted(null, 'updateTaskAssignmentStep', {
            assignment_id: assignmentId,
            step_id: destinationStep
        });
    } catch (error) {
        console.error('Failed to update task step:', error);
        throw error;
    }
}

function reRenderAssignmentCard(assignmentId) {
  //  const assignment = assignment.find(a => a.assignment_id === assignmentId);
    const card = document.querySelector(`[data-assignment-id="${assignmentId}"]`);
    
    if (card && assignment) {
        const buttonHTML = decideButtonsToDisplay(assignment, assignment._taskSteps);
        const buttonContainer = card.querySelector('#taskActionButtons');
        if (buttonContainer) {
            buttonContainer.innerHTML = buttonHTML;
        }
       renderLargeCards(panelEl); 
    }
}

function renderStepCard(title, step, color, studentName = null, showCheckmark = false, stepNumber = null, assignmentId = null) {
    if (!step) return '';
    
    const name = step.step_name || 'Unnamed';
    const description = step.step_description || 'No description available';
    const externalUrl = step.external_url || null;
    
console.log('renderStepCard() title:',title, 'length',title.length);
  let completeButton = '';
  if (title ==='Current Step' && stepNumber > 2) { console.log('Current step & >2');
    completeButton = `
      <div class="mt-4">
        <button data-button="complete-step" 
                data-assignment-id="${assignmentId}"
                class="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
          Mark this step completed ${stepNumber}
        </button>
      </div>
    `;
    console.log('complete button', completeButton);
  }
  




    const bgColor = {
        gray: 'bg-gray-50 border-gray-200',
        blue: 'bg-blue-50 border-blue-200',
        green: 'bg-green-50 border-green-200',
        red: 'bg-red-50 border-red-200'
    }[color] || 'bg-white border-gray-200';
    
    let externalContent = '';
    if (externalUrl) {
        if (externalUrl.startsWith('<iframe')) {
            externalContent = `<div class="mt-4">${externalUrl}</div>`;
        } else if (externalUrl.startsWith('http')) {
            externalContent = `
                <div class="mt-4">
                    <a href="${externalUrl}" target="_blank" rel="noopener noreferrer"
                       class="text-blue-600 underline hover:text-blue-800">
                        Open external resource
                    </a>
                </div>`;
        }
    }
    
    return `
        <div class="${bgColor} rounded-lg p-6 shadow-md border relative">
            <div class="text-sm font-semibold text-${color}-600 mb-2">
                ${stepNumber !== null ? `Step ${stepNumber}: ` : ''}${title}
            </div>
            <h4 class="text-lg font-bold">${name}</h4>
            <p class="text-sm text-gray-600 mt-1 whitespace-pre-line">${description}</p>
            ${externalContent}
            ${completeButton}
            ${studentName && title === 'Current Step' ? `
                <div class="absolute -top-4 -left-4 bg-white rounded-full p-2 text-xs font-medium text-gray-700 shadow border border-gray-200">
                    Student: ${studentName}
                </div>` : ''}
            ${showCheckmark && stepNumber !== 1 ? `
                <div class="absolute top-2 right-2 text-green-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2l4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                     
                </div>` : ''}
        </div>
    `;
}

async function loadStepAutomations(stepId) {
    console.log('loadStepAutomations()', 'subject',subject);
    try {
        const automations = await executeIfPermitted(subject.approUserId, 'readTaskAutomations', {
            source_task_step_id: stepId
        });
        executeAutomations(automations, subject, autoPetition);
    } catch (error) {
        console.error('Failed to load automations:', error);
        showToast('Could not load automations', 'error');
    }
}