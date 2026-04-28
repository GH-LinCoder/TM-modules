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
      //  const stepExternalURL = taskSteps.step_external_url;  //is an array
console.log('taskSteps',taskSteps,'stepExternalURL', taskSteps[2].step_external_url);//ok but later is lost
        // Set up autoPetition - I have forgotten what this is March 8
        autoPetition.assignment_id = assignment.assignment_id;
        autoPetition.task_id = assignment.assignment.task_header;
        autoPetition.step_id = assignment.step_id;
        

        
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
        
        // Render external URL content - 
        let taskExternalContent = '';
        if (taskExternalURL) {
            if (taskExternalURL.startsWith('<iframe')) {
                taskExternalContent = `<div class="mt-4">${taskExternalURL}</div>`;
            } else if (taskExternalURL.startsWith('http')) {
                taskExternalContent = `
                    <div class="mt-4">
                        <a href="${taskExternalURL}" target="_blank" rel="noopener noreferrer"
                           class="text-blue-600 underline hover:text-blue-800">
                            Open external resource
                        </a>
                    </div>`;
            }
        }
//to display the video for current step in the step need taskSteps and step_order ?  
//const stepUrl = taskSteps[assignment.assignment.step_order].step_external_url;
//const arrayElementForStepExertalUrl = assignment.current_step-1;
//const assignedCurrentStepExternalUrl = taskSteps[assignment.current_step-1].step_external_url
//BUG 18:13 March 28 current_step undefined when logged in as newSignup (but okay as lin Coder) Changed rpc to inlcude setting this to 3
//BUG 22:00 April 11. When student clicks to different step the video is still the original video
// problem that the above always looks at the original
// Use displayedStep (the step user is viewing), with safety check
const stepIndex = assignment.displayedStep - 1;
const assignedCurrentStepExternalUrl = (stepIndex >= 0 && stepIndex < taskSteps.length) 
    ? taskSteps[stepIndex].step_external_url 
    : null;


console.log('taskSteps',taskSteps, 'assignment',assignment,'current_step',assignment.current_step, taskSteps[assignment.current_step-1].step_external_url, 'stepUrl?');
        
        const card = document.createElement('div');
        card.classList.add('bg-white', 'rounded-lg', 'shadow-lg', 'p-6', 'mb-8', 'border', 'border-gray-200');
        card.dataset.assignmentId = assignment.assignment_id; // Store assignment ID
        //console.log('assignment url ?',assignment, assignment.external_url); //says which step is assigned. step_order is available
        card.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-semibold text-gray-900">${taskName}</h3>

<div id="taskActionButtons" class="mt-6 flex flex-col md:flex-row justify-center gap-4 border-t border-gray-200 pt-4">
    ${buttonHTML}
  </div>

                <div class="text-sm text-gray-500"> Manager: ${assignment.manager_name || 'Unknown Manager'}</div>
                <div class="text-sm text-gray-500">${assignment.assignment.task_header}</div>
                <div class="text-sm text-gray-500"> Student: ${assignment.student_name || 'Unknown Student'}</div>
            </div>
            <div class="rounded-lg p-6 shadow-md border relative whitespace-pre-line">${taskDescription}</div>
            ${taskExternalContent}
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                ${renderStepCard('Previous Step', previousStep, 'gray', assignment.student_name, true)}
                ${renderStepCard('Current Step', {
                    step_name: currentStepName,
                    step_description: currentStepDescription,
                    external_url: assignedCurrentStepExternalUrl  
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

         loadStepAutomations(assignment.step_id, card);  // ✅ Pass 'card'
}

function decideButtonsToDisplay(assignment, taskSteps) {
    const currentStep = assignment.displayedStep;
    const numberOfSteps = taskSteps.length;
    const moveBy = assignment.move_by;
    console.log('move_by',moveBy);
    const studentName = assignment.student_name;
    const managerName = assignment.manager_name;
   // const taskId = assignment.assignment.task_header;
   // const stepId = assignment.step_id;
   // const taskName = assignment.task_name;
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
// being sent  'Current Step', {step_name: currentStepName,step_description: currentStepDescription, external_url: assignedCurrentStepExternalUrl}
//assignment.student_name, false, assignment.displayedStep, assignment.assignment_id)}  How does this function handle this???
//The video on the assigned card now displays. 17:38 March 25
// being sent 'Previous Step', previousStep, assignment.student_name, true, 'gray'  - in wrong order (how does it work?). Not sent the video url
function renderStepCard(title, step, color, studentName = null, showCheckmark = false, stepNumber = null, assignmentId = null) {
    if (!step) return '';
    
    const name = step.step_name || 'Unnamed';
    const description = step.step_description || 'No description available';
    const stepExternalURL = step.external_url || null;
console.log('step',step,'stepExternalURL', stepExternalURL);// why is external_url undefined here but was oky in steps?
        let stepExternalContent = '';
        if (stepExternalURL) {
            if (stepExternalURL.startsWith('<iframe')) {
                stepExternalContent = `<div class="mt-4">${stepExternalURL}</div>`;
            } else if (stepExternalURL.startsWith('http')) {
                stepExternalContent = `
                    <div class="mt-4">
                        <a href="${stepExternalURL}" target="_blank" rel="noopener noreferrer"
                           class="text-blue-600 underline hover:text-blue-800">
                            Open external resource
                        </a>
                    </div>`;
            }
        }



    
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
      </div>    `;
    //console.log('complete button', completeButton);
  }
  
    const bgColor = {
        gray: 'bg-gray-50 border-gray-200',
        blue: 'bg-blue-50 border-blue-200',
        green: 'bg-green-50 border-green-200',
        red: 'bg-red-50 border-red-200'
    }[color] || 'bg-white border-gray-200';
    

    if (stepExternalURL) {
        if (stepExternalURL.startsWith('<iframe')) {
            stepExternalContent = `<div class="mt-4">${stepExternalURL}</div>`;
        } else if (stepExternalURL.startsWith('http')) {
            stepExternalContent = `
                <div class="mt-4">
                    <a href="${stepExternalURL}" target="_blank" rel="noopener noreferrer"
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
            ${stepExternalContent}
            ${completeButton}


        <!--  Payment buttons (prominent) -->
        ${title === 'Current Step' ? '<div id="stepPaymentButtons" class="mt-4"></div>' : ''}


            <!--  Automations (subtle) -->
        ${title === 'Current Step' ? '<div id="stepAutomations" class="mt-4"></div>' : ''}
        



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

async function XloadStepAutomations(stepId) {
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

async function loadStepAutomations(stepId, card) {
  console.log('loadStepAutomations()', stepId);
  
  const autoContainer = card.querySelector('#stepAutomations');
  const paymentContainer = card.querySelector('#stepPaymentButtons');
  
  if (autoContainer) {
    await renderAutomationsForDisplay(stepId, autoContainer);
  }
  
  if (paymentContainer) {
    await renderPaymentButtonsForDisplay(stepId, paymentContainer);
  }
}

// ============================================
// DISPLAY-ONLY AUTOMATION RENDERER  -14:22 April 24
// ============================================
async function renderAutomationsForDisplay(stepId, container) {
  console.log('renderAutomationsForDisplay()', stepId);
  
  if (!container) return;
  container.innerHTML = '';
  
  try {
    const automations = await executeIfPermitted(subject.approUserId, 'readTaskAutomations', {
      source_task_step_id: stepId
    });
    
    if (!automations?.length) {
      container.innerHTML = '';  // Empty if none
      return;
    }
    
    // ✅ Filter OUT payments
    const nonPaymentAutos = automations.filter(a => a.target_data?.target?.type !== 'payment');
    
    if (!nonPaymentAutos.length) {
      container.innerHTML = '';
      return;
    }
    
    // ✅ Section header (subtle)
    const header = document.createElement('div');
    header.className = 'text-xs text-gray-400 uppercase tracking-wide mb-2';
    header.textContent = 'Automations that run in the background:';
    container.appendChild(header);
    
    nonPaymentAutos.forEach(auto => {
      const autoType = auto.target_data?.target?.type;
      const autoName = auto.name || 'Unknown';
      const isHidden = auto.is_visible === false;
      
      if (isHidden) {
        const card = document.createElement('div');
        card.className = 'flex items-center gap-2 p-1.5 bg-gray-50 rounded text-xs text-gray-300';
        card.innerHTML = `
          <span class="opacity-30">🔗</span>
          <span class="font-mono">${auto.id?.substring(0, 6)}...</span>
        `;
        container.appendChild(card);
        return;
      }
      
      const icon = autoType === 'task' ? '📋' : autoType === 'survey' ? '📝' : autoType === 'relate' ? '🔗' : '•';
      
      // ✅ SUBTLE CARD (small, grey, no bold)
      const card = document.createElement('div');
      card.className = 'flex items-start gap-2 p-2 bg-gray-50 rounded border border-gray-100';
      card.innerHTML = `
        <span class="text-sm opacity-50">${icon}</span>
        <div class="text-xs text-gray-500 leading-relaxed">
          ${autoName}
        </div>
      `;
      container.appendChild(card);
    });
    
  } catch (error) {
    console.error('Failed to load automations:', error);
  }
}

async function renderPaymentButtonsForDisplay(stepId, container) {
  console.log('renderPaymentButtonsForDisplay()', stepId);
  
  if (!container) return;
  container.innerHTML = '';
  
  try {
    const automations = await executeIfPermitted(subject.approUserId, 'readTaskAutomations', {
      source_task_step_id: stepId
    });
    
    // ✅ Filter ONLY payments
    const paymentAutos = automations.filter(a => a.target_data?.target?.type === 'payment');
    
    if (!paymentAutos.length) {
      container.style.display = 'none';
      return;
    }
    
    container.style.display = 'block';
    
    let paymentPlans = [];
    try {
      paymentPlans = await executeIfPermitted(subject.approUserId, 'readAllActivePaymentPlans', {});
    } catch (e) {
      console.warn('Could not load payment plans', e);
    }
    
    paymentAutos.forEach(auto => {
const planId = auto.target_data?.target?.header || auto.payment_plan_id;
const plan = paymentPlans.find(p => p.id === planId);
const planName = auto.name || plan?.name || 'Payment';
const amount = plan?.amount || '';
const currency = plan?.currency || '';

// ✅ NEW: Use the stored html_button URL + append user params
const baseUrl = plan?.html_button || auto.html_button || '#';
const checkoutUrl = baseUrl !== '#' && baseUrl 
  ? `${baseUrl}?embed=1&checkout[custom][appro_id]=${subject.approUserId}`
  : '#';
      
      // ✅ PROMINENT CARD (gradient, bold, large button)
      const card = document.createElement('div');
      card.className = 'p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg text-white mt-4';
      card.innerHTML = `
        <div class="flex items-center justify-between">
          <div>
            <div class="font-bold text-lg">💳 ${planName}</div>
            ${amount ? `<div class="text-indigo-100 text-sm">${amount} ${currency}</div>` : ''}
          </div>
          <a href="${checkoutUrl}" 
             target="_blank" 
             rel="noopener noreferrer"
             class="px-5 py-2.5 bg-white text-indigo-600 rounded-md hover:bg-indigo-50 transition font-semibold shadow text-sm">
            Buy Now
          </a>
        </div>
      `;
      container.appendChild(card);
    });
    
  } catch (error) {
    console.error('Failed to load payment buttons:', error);
  }
}

