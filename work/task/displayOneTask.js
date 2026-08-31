// ./work/tasks/displayOneTask.js
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { appState } from '../../state/appState.js';
import { resolveSubject } from '../../utils/contextSubjectHideModules.js';
import { executeAutomations } from '../../utils/executeAutomations.js'

let subject = null;
let assignment = null;
let panelEl = null;
let bookmarkStepButton = '';

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
//console.log(' From readThisAssignmnet() assignmentData', assignmentData, 'assignment', assignment);


        // Store as global source of truth
//        assignment = assignmentData;
        
        renderTask(panel);
        
    } catch (error) {
        console.error('Error loading task assignment:', error);
        panel.innerHTML = `<div class="text-red-500 text-center py-8">Failed to load task assignment for: ${subject.name} - ${assignmentId}.</div>`;
        showToast(`No task assignments found for: ${subject.name}`, 'error');
    }

}

async function ensureTaskStepsCached(userId) {
    if (assignment && assignment._taskSteps) return assignment._taskSteps;

    console.log('Fetching and caching task steps from DB... with assignment.task_header');
    const taskSteps = await executeIfPermitted(userId, 'readTaskWithSteps', {
        task_header_id: assignment.assignment.task_header_id
    });
    
    assignment._taskSteps = taskSteps;
    return taskSteps;
}


async function renderTask(panel) { //should not be plural
console.log('renderTask');
    const userId = subject.approUserId

    panel.innerHTML = '';
  //  console.log('renderTask() assignment', assignment);//assignment is a module global
//    for (const assignment of assignments) { //this is for an array. We don't have an array
        


//STEPS  Changed 15:18 Aug 23. stepBeingDisplayed had been set to step_order which is whatever step is listed first in the view
// Initialize stepBeingDisplayed if not already set.  assignment is [0] of the steps??? so is always number 3 But we want to display current_step
//console.log('step_order', assignment.step_order); // Changed to use .current_step. Now reacts to the changes made by bookmark
        if (assignment.stepBeingDisplayed === undefined) {
            assignment.stepBeingDisplayed = assignment.current_step; //step_order is the number of a step. Each step's number 'step_order' 
        }        //this is just storing the the number of whatever step is being handled right now
      //so how does the code know which step?
      
       // console.log('calling readTaskWithSteps');
        const taskSteps = await ensureTaskStepsCached(userId);
       
       
       
        // Cache task steps for later use
        assignment._taskSteps = taskSteps;


           //   console.log('stepBeingDisplayed',assignment.stepBeingDisplayed); 

if(!assignment.stepBeingDisplayed) {assignment.stepBeingDisplayed =3;

 };//should assume step 3 and find step 3 - this works for step 3 but breaks if user clicks next button

const stepBeingDisplayedData = taskSteps.find(s => s.step_order === assignment.stepBeingDisplayed);


        const currentStepName = stepBeingDisplayedData.step_name || 'Unnamed Step';
        const currentStepDescription = stepBeingDisplayedData.step_description || 'No description available';

        // Generate buttons using assignment object directly
        const buttonHTML = decideButtonsToDisplay(assignment, taskSteps);
        
        loadStepAutomations(assignment.step_id);  //temp removed while debugging display
        
        // Calculate previous and next steps
        const previousStep = assignment.stepBeingDisplayed === 3
            ? {
                step_name: 'New assignment',
                step_description: 'All tasks start on step 3. The previous steps are reserved to mark the assignment as abandoned (step 1) or completed (step 2).'
            }
            : assignment.stepBeingDisplayed === 2
                ? taskSteps.reduce((max, step) => step.step_order > max.step_order ? step : max, taskSteps[0])
                : assignment.stepBeingDisplayed > 3
                    ? taskSteps.find(s => s.step_order === assignment.stepBeingDisplayed - 1)
                    : null;
        
        const nextStep = (() => {
            if (assignment.stepBeingDisplayed === 1 || assignment.stepBeingDisplayed === 2) return null;
            if (assignment.stepBeingDisplayed === taskSteps.length) return taskSteps.find(s => s.step_order === 2);
            if (assignment.stepBeingDisplayed < taskSteps.length) return taskSteps.find(s => s.step_order === assignment.stepBeingDisplayed + 1);
            return null;
        })();
//console.log('taskSteps',taskSteps,'stepExternalURL', taskSteps[2].step_external_url);//ok but later is lost

//to display the video for current step in the step need taskSteps and step_order ?  
//const stepUrl = taskSteps[assignment.assignment.step_order].step_external_url;
//const arrayElementForStepExertalUrl = assignment.current_step-1;
//const assignedCurrentStepExternalUrl = taskSteps[assignment.current_step-1].step_external_url
//BUG 18:13 March 28 current_step undefined when logged in as newSignup (but okay as lin Coder) Changed rpc to inlcude setting this to 3
//BUG 22:00 April 11. When student clicks to different step the video is still the original video
// problem that the above always looks at the original
// Use stepBeingDisplayed (the step user is viewing), with safety check
const stepIndex = assignment.stepBeingDisplayed - 1;
const assignedCurrentStepExternalUrl = (stepIndex >= 0 && stepIndex < taskSteps.length) 
    ? taskSteps[stepIndex].step_external_url 
    : null;


//console.log('taskSteps',taskSteps, 'assignment',assignment,'current_step',assignment.current_step, taskSteps[assignment.current_step-1].step_external_url, 'stepUrl?');

   const stepsHtml = `<!-- steps -->
            <div class="hidden md:block  grid grid-cols-1  gap-0 md:gap-6">
                ${renderStepCard('Previous Step', previousStep, 'gray', assignment.student_name, true)}
            </div>
            <div id="taskActionButtons" class="mt-6 flex flex-col md:flex-row justify-center gap-0 md:gap-2 md:p-4" border-t border-gray-200 pt-4">
                ${buttonHTML}
            </div>   
            <div  grid grid-cols-1  gap-0 md:gap-6>   ${renderStepCard('Current Step', {
                    step_name: currentStepName,
                    step_description: currentStepDescription,
                    external_url: assignedCurrentStepExternalUrl  
                }, assignment.stepBeingDisplayed === 1 ? 'red' : assignment.stepBeingDisplayed === 2 ? 'green' : 'blue', assignment.student_name, false, assignment.stepBeingDisplayed, assignment.assignment_id)}
            </div>

            <div class="hidden md:block  grid grid-cols-1 gap-0 md:gap-6">
                ${renderStepCard(
                    assignment.stepBeingDisplayed === 2 ? 'Completed' :
                    assignment.stepBeingDisplayed === 1 ? 'Abandoned' :
                    assignment.stepBeingDisplayed === taskSteps.length ? 'Completion Step' : 'Next Step',
                    nextStep,
                    'green',
                    assignment.student_name
                )}
            </div>
<!--moved buttons from here to put them below current step 17>25 Aug 14 -->

            <div class="mt-4 bg-green-100 rounded-lg class="p-2 md:p-4" border border-green-200">
                <p class="text-sm font-bold text-green-800">Information:</p>
                <p class="text-sm text-green-700">There are ${taskSteps.length} steps in this task.</p>
                <p class="text-sm text-green-700">The current step is [${assignment.stepBeingDisplayed}]</p>
                ${assignment.stepBeingDisplayed === 1 ? '<p class="text-sm text-red-600">This step means abandoned.</p>' : ''}
                ${assignment.stepBeingDisplayed === 2 ? '<p class="text-sm text-blue-600">This step means completed.</p>' : ''}
                ${assignment.stepBeingDisplayed === taskSteps.length ? '<p class="text-sm text-purple-600">This is the final step. Advancing will complete the task.</p>' : ''}
                <p class="text-sm text-blue-600">Move by ${assignment.move_by}</p> 
            </div>
        `;



//Prepare autoPetition for the permission system. To be matched against database table entries. 
//only change these if you have updated the db
        autoPetition.assignment_id = assignment.assignment_id;
        autoPetition.task_id = assignment.assignment.task_header;
        autoPetition.step_id = assignment.step_id;
        

//Header
        const taskExternalURL = assignment.task_external_url;
        const taskName = assignment.task_name || 'Unnamed Task';
        const taskDescription = assignment.task_description;
        // Render external URL content - 
        let taskExternalContent = '';
        if (taskExternalURL) {
            if (taskExternalURL.startsWith('<iframe')) {
                taskExternalContent = `<div="flex place-content-center mb-4">${taskExternalURL}</div>`;
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
//change background color.  active - blue,  completed-green, abandoned-red 

let bgColor='bg-blue-400'; if(assignment.current_step === 1) bgColor = 'bg-red-400'; else if(assignment.current_step === 2) bgColor = 'bg-green-400';  
        const card = document.createElement('div');
        card.classList.add(bgColor, 'rounded-lg', 'shadow-lg', 'p-1','md:p-6', 'mb-1', 'md:mb-8', 'border', 'border-gray-200', 'text-left');
        card.dataset.assignmentId = assignment.assignment_id; // Store assignment ID
        //console.log('assignment url ?',assignment, assignment.external_url); //says which step is assigned. step_order is available

        const headerHtml =`
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-semibold text-gray-900">${taskName}</h3>
                <div class="text-sm text-gray-500"> Manager: ${assignment.manager_name || 'Unknown Manager'}</div>
                <div class="text-sm text-gray-500 hidden md:block">${assignment.assignment.task_header}</div>
                <div class="text-sm text-gray-500"> Student: ${assignment.student_name || 'Unknown Student'}</div>
            </div>
            <div class="rounded-lg p-6 bg-white shadow-md border relative whitespace-pre-line">${taskDescription}</div>
            <div class="flex place-content-center mb-4">
            ${taskExternalContent}
            </div>`;
            

 card.innerHTML = headerHtml+stepsHtml;


 const displayArea = document.querySelector(`[data-section="display-area"]`); 
// console.log('displayArea', displayArea),

 displayArea.appendChild(card); //need to append it to the destination which is 'display-area'    
 addEventListenerToButtons(panel);
}

function decideButtonsToDisplay(assignment) {
    const currentStep = assignment.stepBeingDisplayed;
  //  const numberOfSteps = taskSteps.length; //wrong because array can have the same step > once if it has > 1 automations

 const numberOfSteps = Math.max(...assignment._taskSteps.map(step => Number(step.step_order) || 0));
        
    
    let moveBy = assignment.move_by;
    if(!moveBy) moveBy = 'student'; //Missing value assume permissive behaviour of allowing the student to navigate
   // console.log('moveBy',moveBy, 'numberOfSteps:',numberOfSteps);
    const studentName = assignment.student_name;
    const managerName = assignment.manager_name;
   // const taskId = assignment.assignment.task_header;
   // const stepId = assignment.step_id;
   // const taskName = assignment.task_name;
    const assignmentId = assignment.assignment_id;
    
    // Abandon button
    const showAbandonButton = currentStep !== 1 && currentStep !== 2 && moveBy === 'student';
    const abandonButton = showAbandonButton ? `
        <button 
                data-button="abandoned" 
                data-assignment-id="${assignmentId}"
                class="hidden md:inline-block w-1/5  text-xs py-0 md:py-3 px-6 bg-red-600 text-white rounded-lg hover:bg-red-700 transition" 
                title="Two step process. First click, consider, then confirm or ignore. Second click cannot be reversed. An abandoned is closed. To return to it requires a new assignment"
                >Click to abandon task</button>` : '';
    
    // Previous button
    const showPreviousButton = (currentStep > 3 && moveBy === 'student');
    const previousButton = showPreviousButton ? `
        <button data-button="previous" 
                data-assignment-id="${assignmentId}"
                class="flex-1 py-0 md:py-3 px-0 md:px-6 bg-gray-100 text-blue rounded-lg hover:bg-orange-300 transition">
            ◀️ Previous Step ${currentStep - 1}
        </button>` : '';
    
    // Next button
    const showNextButton = (currentStep < numberOfSteps + 1 && moveBy === 'student' && currentStep>1);
    let nextButtonText ='' ;
    if(currentStep===2) nextButtonText ='Return to step 3'; 
     else if (currentStep===numberOfSteps) nextButtonText ='Move to completed'; 
     else nextButtonText = `Next Step ${currentStep + 1}`;
    const nextButton = showNextButton ? `
        <button data-button="next" 
                data-assignment-id="${assignmentId}"
                class="flex-1 py-0 md:py-3 px-0 md:px-6 bg-gray-100 text-blue rounded-lg hover:bg-blue-300 transition">
            ${nextButtonText}  ▶️
        </button>` : '';
    
    // Message manager button
    const showMessageManager = (studentName !== managerName);
    const messageManagerButton = showMessageManager ? `
        <button data-button="message-manager" 
                data-assignment-id="${assignmentId}"
                class="flex-1 py-0 md:py-3 px-0 md:px-6 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition" 
                data-action="bug-report">
            Message Manager
        </button>` : '';
    

 // console.log('Conside bookmark button:'); //need to know card title not assignment.  Only display the button 
     
 // console.log('currentStep:', currentStep, ' assignment.step_order',assignment.step_order);
  let bookmarkText = 'Bookmark:'+currentStep.toString()
if(currentStep === 2) bookmarkText = 'Mark as completed';
//console.log('bookmarkText',bookmarkText);
  if (currentStep > 1 && currentStep!=assignment.step_order ) { 
   // console.log('The step being displayed is>1 & not the db currenstep of',assignment.step_order);
//added hidden md:block  16:26 Aug 14 // not showing on phone
    bookmarkStepButton = `
      <div class=" md:block">
        <button data-button="bookmark-step" 
                data-assignment-id="${assignmentId}"
                class="flex-1 py-0 md:py-3 px-0 md:px-6  bg-green-600 text-xs text-white rounded-lg hover:bg-green-700 transition"
                title="Keep your place in a task or survey with a bookmark. Can also mark the item completed">${bookmarkText}</button>
      </div>
    ` ;
  } else bookmarkStepButton =''; //don't show bookmark if that place already in the database current_step



        
 
    return  messageManagerButton + previousButton + nextButton +  abandonButton + bookmarkStepButton;
}

function addEventListenerToButtons(panel) {
    const buttonContainers = panel.querySelectorAll('#taskActionButtons');
    
    buttonContainers.forEach(container => {
        container.addEventListener('click', (e) => {
            const button = e.target.closest('[data-button]');
            if (!button) return;
            const action = button.dataset.button;
            const assignmentId = button.dataset.assignmentId;
         //   console.log('button action', action);
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
                case 'bookmark-step':
                    handleBookmarkStep(button, assignmentId);
                    break;
            }
        });
    });
}

function handleAbandonTask(button, assignmentId) {
    console.log('handleAbandonTask()',button.textContent);
    
    if (button.textContent === 'Click to abandon task') {
        button.textContent = 'Confirm abandoning this task';
    } else if (button.textContent === 'Confirm abandoning this task') {
        updateDbTaskStep(assignmentId, 1);
        // Update displayed state
     //   const assignment = assignments.find(a => a.assignment_id === assignmentId); //we already know the assignment
        if (assignment) {
            assignment.stepBeingDisplayed = 1;
            reRenderAssignmentCard(assignmentId);
        }
    }
}


function handleCompleteTask(button, assignmentId) {
    console.log('handleCompleteTask()',button.textContent);
    //fails. Looks like there is a control char at start of that button.text
    if (button.textContent === 'Mark as completed') {
        button.textContent = 'Confirm completed';
    } else if (button.textContent === 'Confirm completed') {
        updateDbTaskStep(assignmentId, 2);
        // Update displayed state
     //   const assignment = assignments.find(a => a.assignment_id === assignmentId); //we already know the assignment
        if (assignment) {  //why?
            assignment.stepBeingDisplayed = 2;
            reRenderAssignmentCard(assignmentId);
        }
    }
}

function handlePreviousStep(assignmentId) {
    console.log('handlePreviousStep()');
//    const assignment = assignments.find(a => a.assignment_id === assignmentId); //we are not handling an array
    
    if (!assignment || assignment.stepBeingDisplayed <= 3) return;
    
    assignment.stepBeingDisplayed = assignment.stepBeingDisplayed - 1;
    reRenderAssignmentCard(assignmentId);
}

function handleNextStep(assignmentId) {
    console.log('handleNextStep() step:',assignment.stepBeingDisplayed);
  //  const assignment = assignments.find(a => a.assignment_id === assignmentId); //we are not handling an array
    
    if (!assignment || assignment.stepBeingDisplayed <= 1) return; //if saved as completed or abandonded can't repeat until assigned again.
    //but has been changed to aloow repeat from completed.  This is supposed to only be for someone who has clicked through the steps.
    //should not be for a task marked 'completed' in the db.  Need change code here to diferentiate. Aug 13 2026
    
    let newStep; // teskSteps.length includes steps 1 & 2. User normally sees step 3 and greater. If user clicks next on the last step, we want to go to step 2 (completed) not step 1 (abandoned)
    if (assignment.stepBeingDisplayed === assignment._taskSteps.length) { // only make this happen if user clicks "step completed"
        showToast("The next step is completion. ");  //If you want to mark it completed click the save button
        newStep = 2; // completion  //added back 11:40 Augu 13. Because user needs to see this after going through steps.
    } else {
        newStep = assignment.stepBeingDisplayed + 1;
    }
    
    assignment.stepBeingDisplayed = newStep;
    reRenderAssignmentCard(assignmentId);
}

function handleBookmarkStep(button, assignmentId) {
   console.log('handleBookmarkStep()'); // not initialized???
//    const assignmentLocal = assignment.find(a => a.assignment_id === assignmentId);
    
    if (assignment.stepBeingDisplayed === 2) handleCompleteTask(button, assignmentId); //need to do 2nd confirm that wants to 'complete'
    else
    // Update database
    updateDbTaskStep(assignmentId, assignment.stepBeingDisplayed)
        .then(() => {
            showToast(assignment.stepBeingDisplayed === 2 ? 'Task completed ✨' : 'Step bookmarked');
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
    console.log('updateDbTaskStep() assignmentID destinationStep:',assignmentId, destinationStep);
    try {
        await executeIfPermitted(null, 'updateAssignmentSystem', {
            assignmentId: assignmentId,
            bookmark: destinationStep
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
        const buttonHTML = decideButtonsToDisplay(assignment);
        const buttonContainer = card.querySelector('#taskActionButtons');
        if (buttonContainer) {
            buttonContainer.innerHTML = buttonHTML;
        }
       renderTask(panelEl); 
    }
}
// being sent  'Current Step', {step_name: currentStepName,step_description: currentStepDescription, external_url: assignedCurrentStepExternalUrl}
//assignment.student_name, false, assignment.stepBeingDisplayed, assignment.assignment_id)}  How does this function handle this???
//The video on the assigned card now displays. 17:38 March 25
// being sent 'Previous Step', previousStep, assignment.student_name, true, 'gray'  - in wrong order (how does it work?). Not sent the video url
function renderStepCard(title, step, color, studentName = null, showCheckmark = false, stepNumber = null, assignmentId = null) {
    if (!step) return '';
    
    const name = step.step_name || 'Unnamed';
    const description = step.step_description || 'No description available';
    const stepExternalURL = step.external_url || null;
//console.log('step',step,'stepExternalURL', stepExternalURL, 'stepNumber',stepNumber);// why is external_url undefined here but was oky in steps?
        let stepExternalContent = '';
        if (stepExternalURL) {
            if (stepExternalURL.startsWith('<iframe')) {
                stepExternalContent = `<div class="flex place-content-center mb-4">${stepExternalURL}</div>`;
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

//console.log('renderStepCard() title:',title, 'Length:',title.length);
  if (title ==='Current Step') console.log('The title is Current Step');
 // console.log('stepNumber:', stepNumber, ' assignment.step_order',assignment.step_order);

  /*
  if (title ==='Current Step' && stepNumber > 1 && stepNumber!=assignment.step_order ) { 
    console.log('The step being displayed as current & is>1 & not the db currenstep of',assignment.step_order);
//added hidden md:block  16:26 Aug 14 // not showing on phone
    bookmarkStepButton = `
      <div class="mt-4 hidden md:block">
        <button data-button="bookmark-step" 
                data-assignment-id="${assignmentId}"
                class="w-1/4 py-2 px-0 md:px-4 bg-green-600 text-xs text-white rounded-lg hover:bg-green-700 transition"
                title="The bookmark stores your current position.">
          Bookmark Step ${stepNumber} . 
        </button>
      </div>
    ` ;
    //console.log('complete button', bookmarkStepButton);
  }
  */




    const bgColor = {
        gray: 'bg-gray-50 border-gray-200',
        blue: 'bg-blue-50 border-blue-200',
        green: 'bg-green-50 border-green-200',
        red: 'bg-red-50 border-red-200'
    }[color] || 'bg-white border-gray-200';
    

    if (stepExternalURL) {
        if (stepExternalURL.startsWith('<iframe')) {
            stepExternalContent = `<div class="flex place-content-center mb-4">${stepExternalURL}</div>`;
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
    let displayDescription = description;
//    if( title !== 'Current Step') displayDescription = description.substring(0,100)+'...';
    if( title !== 'Current Step') displayDescription = '';
    return `
        <div class="${bgColor} rounded-lg p-6 shadow-md border relative">
            <div class="text-sm font-semibold text-${color}-600 mb-2">
                ${stepNumber !== null ? `Step ${stepNumber}: ` : ''}${title}
            </div>
            <h4 class="text-lg font-bold">${name}</h4>
            <p class="text-sm text-gray-600 mt-1 whitespace-pre-line">${displayDescription}</p>
            ${stepExternalContent}
           
            ${studentName && title === 'Current Step' ? `
            <div class="absolute -bottom-3 -left-3 bg-white px-3 py-1 rounded-full text-xs font-medium text-gray-700 shadow border border-gray-200 z-10">
    Student: Lin Coder
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