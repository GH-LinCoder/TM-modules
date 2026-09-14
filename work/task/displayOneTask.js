// ./work/tasks/displayOneTask.js
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { appState } from '../../state/appState.js';
import { resolveSubject } from '../../utils/contextSubjectHideModules.js';
import {timeStampConversion} from '../../utils/timeStampConversion.js';
import { executeAutomations } from '../../utils/executeAutomations.js';

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

export async function render(panel, query = {}, controller) {
    panelEl = panel;
    subject = await resolveSubject();
    const assignmentId = query.assignmentId || appState.query.petitioner?.assignmentId;

    autoPetition.auth_id = subject.id;
    autoPetition.appro_id = subject.approUserId;

    try {
        panel.innerHTML = '<div class="p-4 text-gray-600 flex items-center gap-2"><span class="animate-spin">⏳</span> Loading...</div>';

        const assignmentData = await executeIfPermitted(subject.approUserId, 'readThisAssignment', {
            assignment_id: assignmentId
        });
        
        if (!assignmentData || assignmentData.length === 0) {
            panel.innerHTML = `<div class="text-gray-500 text-center py-8">No task assignment found for: ${subject.name} - ${assignmentId}.</div>`;
            return;
        }
        
        assignment = assignmentData[0];
        // Initialize stepBeingDisplayed once from DB current_step
        assignment.stepBeingDisplayed = Number(assignment.current_step) || 3;
        
        await renderTask(panel);
        
    } catch (error) {
        console.error('Error loading task assignment:', error);
        panel.innerHTML = `<div class="text-red-500 text-center py-8">Failed to load task assignment for: ${subject.name} - ${assignmentId}.</div>`;
        showToast(`Failed to load task for ${subject.name}`, 'error');
    }
}

async function ensureTaskStepsCached(userId) {
    if (assignment && assignment._taskSteps) return assignment._taskSteps;

    const taskSteps = await executeIfPermitted(userId, 'readTaskWithSteps', {
        task_header_id: assignment.assignment.task_header_id
    });
    
    // Sort steps numerically by step_order to prevent array index mismatches
    taskSteps.sort((a, b) => Number(a.step_order) - Number(b.step_order));
    assignment._taskSteps = taskSteps;
    return taskSteps;
}

async function renderTask(panel) {
    const userId = subject.approUserId;
    const taskSteps = await ensureTaskStepsCached(userId);

    const stepBeingDisplayed = Number(assignment.stepBeingDisplayed);
    const stepBeingDisplayedData = taskSteps.find(s => Number(s.step_order) === stepBeingDisplayed) || taskSteps[0];

    const currentStepName = stepBeingDisplayedData.step_name || 'Unnamed Step';
    const currentStepDescription = stepBeingDisplayedData.step_description || 'No description available';

    const buttonHTML = decideButtonsToDisplay(assignment);
    loadStepAutomations(stepBeingDisplayedData.step_id);

    // Calculate previous & next step references
    const previousStep = stepBeingDisplayed === 3
        ? {
            step_name: 'New assignment',
            step_description: 'All tasks start on step 3. Previous steps are reserved for abandoned (1) or completed (2).'
          }
        : taskSteps.find(s => Number(s.step_order) === stepBeingDisplayed - 1) || null;

    const maxStep = Math.max(...taskSteps.map(s => Number(s.step_order)));
    const nextStep = stepBeingDisplayed >= maxStep
        ? taskSteps.find(s => Number(s.step_order) === 2) // Completion step
        : taskSteps.find(s => Number(s.step_order) === stepBeingDisplayed + 1);
//nextStep contains the text of the step???
    const assignedCurrentStepExternalUrl = stepBeingDisplayedData.step_external_url || null;

    const stepsHtml = `
        <div class="hidden md:block grid grid-cols-1 gap-0 md:gap-6">
            ${renderStepCard('Previous Step', previousStep, 'gray', assignment.student_name, true)}
        </div>
        <div id="taskActionButtons" class="mt-6 flex flex-col md:flex-row justify-center gap-2 border-t border-gray-200 pt-4">
            ${buttonHTML}
        </div>   
        <div class="grid grid-cols-1 gap-0 md:gap-6">
            ${renderStepCard('Current Step', {
                step_name: currentStepName,
                step_description: currentStepDescription,
                external_url: assignedCurrentStepExternalUrl  
            }, stepBeingDisplayed === 1 ? 'red' : stepBeingDisplayed === 2 ? 'green' : 'blue', assignment.student_name, false, stepBeingDisplayed, assignment.assignment_id)}
        </div>
        <div class="hidden md:block grid grid-cols-1 gap-0 md:gap-6">
            ${renderStepCard(
                stepBeingDisplayed === 2 ? 'Completed' :
                stepBeingDisplayed === 1 ? 'Abandoned' :
                stepBeingDisplayed === maxStep ? 'Completion Step' : 'Next Step',
                nextStep,
                'green',
                assignment.student_name
            )}
        </div>
        <div class="mt-4 bg-green-100 rounded-lg p-4 border border-green-200">
            <p class="text-sm font-bold text-green-800">Information:</p>
            <p class="text-sm text-green-700">There are ${taskSteps.length} steps in this task.</p>
            <p class="text-sm text-green-700">The current view step is [${stepBeingDisplayed}] (DB Step: [${assignment.current_step}])</p>
            <p class="text-sm text-blue-600">Move mode: ${assignment.move_by}</p> 
        </div>
    `;

    autoPetition.assignment_id = assignment.assignment_id;
    autoPetition.task_id = assignment.assignment.task_header;
    autoPetition.step_id = stepBeingDisplayedData.step_id;

    let bgColor = 'bg-blue-400';
    if (Number(assignment.current_step) === 1) bgColor = 'bg-red-400';
    else if (assignment.completed_at)  bgColor = 'bg-green-400';

    const card = document.createElement('div');
    card.classList.add(bgColor, 'rounded-lg', 'shadow-lg', 'p-4', 'mb-6', 'border', 'border-gray-200');
    card.dataset.assignmentId = assignment.assignment_id;

    const headerHtml = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold text-gray-900">${assignment.task_name || 'Unnamed Task'}</h3>
            <div class="text-sm text-gray-700">Manager: ${assignment.manager_name || 'Unknown'}</div>
            <div class="text-sm text-gray-700">Student: ${assignment.student_name || 'Unknown'}</div>
        </div>
        <div class="rounded-lg p-6 bg-white shadow-md border mb-4">${assignment.task_description || ''}</div>
    `;

    card.innerHTML = headerHtml + stepsHtml;
    panel.innerHTML = '';
    panel.appendChild(card);

    // Attach listener cleanly once to panel
    attachPanelEvents(panel);
}

function decideButtonsToDisplay(assignment) {
    const currentStep = Number(assignment.stepBeingDisplayed);
    const dbStep = Number(assignment.current_step);
    const numberOfSteps = Math.max(...assignment._taskSteps.map(step => Number(step.step_order) || 0));
    const moveBy = assignment.move_by || 'student';
    const assignmentId = assignment.assignment_id;
        console.log('assignment', assignment); 

        //abandoned
    const showAbandon = currentStep > 2 && moveBy === 'student' && !assignment.completed_at;
    const abandonButton = showAbandon ? `
        <button data-button="abandoned" 
        data-assignment-id="${assignmentId}" class="py-2 px-4 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700">
            Click to abandon task
        </button>` : '';

        // Previous button
    const showPrevious = currentStep > 3 && moveBy === 'student';
    const previousButton = showPrevious ? `
        <button data-button="previous" data-assignment-id="${assignmentId}" class="py-2 px-4 bg-gray-100 text-blue-700 rounded-lg hover:bg-orange-300">
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

        //messenger
    const showMessageManager = assignment.student_name !== assignment.manager_name;
    const messageManagerButton = showMessageManager ? `
        <button data-button="message-manager" data-assignment-id="${assignmentId}" 
        class="py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        data-action="bug-report">
            Message Manager
        </button>` : '';


        //Bookamrk / completed button

//Completed
//If the assignment is known in the db to be completed have a passive button that display the timestamp of when completed
if(assignment.completed_at)  { //make the button passive by not including 'data-button =**' so will not trigger a reaction
const completedAt = timeStampConversion(assignment.completed_at);
    bookmarkStepButton = `
      <div>
        <button  
                data-assignment-id="${assignmentId}"
                class="flex-1 py-0 md:py-3 px-0 md:px-6  bg-gray-600 text-xs text-white rounded-lg cursor-default"
                title="You have completed this task.">Completed at: ${completedAt}</button>
      </div>
    ` ; 

} else
//Abandoned
//If the assignment is known in the db to be abandoned have a passive button that display the timestamp of when completed
if(assignment.abandoned_at)  { //make the button passive by not including 'data-button =**' so will not trigger a reaction
const abandonedAt = timeStampConversion(assignment.abandoned_at);
    bookmarkStepButton = `
      <div>
        <button  
                data-assignment-id="${assignmentId}"
                class="flex-1 py-0 md:py-3 px-0 md:px-6  bg-gray-600 text-xs text-white rounded-lg cursor-default"
                title="You have completed this task.">Abandoned at: ${abandonedAt}</button>
      </div>
    ` ; 
}

{
  //the db says the task is still active  (not completed. not abandoned)
  let bookmarkText = 'Bookmark step:'+ currentStep;
const requestBookmarkAsCompleted = currentStep === 2; //user on the completed step so change the text from normal bookmark step: 2. Make it 'Mark task as completed'

if(requestBookmarkAsCompleted) bookmarkText = 'Mark this task as completed';
//is the displayed step different to the one in the db as current step. If so show a bookmark button

const isDisplayStepDifferentToDbStep = currentStep!=assignment.current_step;
   // if (currentStep > 1 && currentStep!=assignment.step_order ) { //what? step_order is the number of the step in task_steps how can current step != the number of the step???
const stillActiveTask = !assignment.completed_at && !assignment.abandoned_at;
const showBookmark = stillActiveTask && isDisplayStepDifferentToDbStep;

if(showBookmark){
        console.log('The step being displayed ',currentStep, ' is not the db currenstep of',assignment.current_step, ' & is still active');

    bookmarkStepButton = `
      <div>
        <button data-button="bookmark-step" 
                data-assignment-id="${assignmentId}"
                class="flex-1 py-0 md:py-3 px-0 md:px-6  bg-green-600 text-xs text-white rounded-lg hover:bg-green-700 transition"
                title="Keep your place in a task or survey with a bookmark. Can also mark the item completed">${bookmarkText}</button>
      </div>
    ` ;}

   else bookmarkStepButton =''; //don't show bookmark if that place already in the database current_step

//button if the task is moveBy=manager
const moveByManagerFromActiveStep = currentStep > 2 && moveBy === 'manager';
    let moveMeButton = '';
    if (moveByManagerFromActiveStep) {
        moveMeButton = `
            <button data-button="move-me" data-assignment-id="${assignmentId}" class="py-2 px-4 bg-green-600 text-xs text-white rounded-lg hover:bg-green-700">
                Request to move to the next Step
            </button>`;
    }

    return messageManagerButton + previousButton + nextButton + abandonButton + bookmarkStepButton + moveMeButton;
 }  
}

// Global delegated listener attachment preventing memory/toast leaks
function attachPanelEvents(panel) {
    if (panel._hasClickListener) return;
    panel._hasClickListener = true;

    panel.addEventListener('click', (e) => {
        const button = e.target.closest('[data-button]');
        if (!button) return;

if (button.disabled) return; //21:10 Sept 12 -disabled button was still being processed. Still reacts

        const action = button.dataset.button;
                console.log('listener heard click', action);
        const assignmentId = button.dataset.assignmentId;

        switch (action) {
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
            case 'move-me':
                handleMoveMe(button, assignmentId);
                break;
        }

    });
}

function handlePreviousStep(assignmentId) {
    if (!assignmentId || assignment.stepBeingDisplayed <= 3) return;
    assignment.stepBeingDisplayed -= 1;
    renderTask(panelEl);
}

function handleNextStep(assignmentId) {
    if (!assignmentId) return;
    const maxStep = Math.max(...assignment._taskSteps.map(s => Number(s.step_order)));
    
    if (assignment.stepBeingDisplayed >= maxStep) {   
    assignment.stepBeingDisplayed = 2; //the step after maxstep is 'completion' which is step = 2
    renderTask(panelEl);
        return;
    }
    
    assignment.stepBeingDisplayed += 1;
    renderTask(panelEl);
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


function handleMoveMe(button, assignmentId) {
    updateDbTaskStep(assignmentId, assignment.stepBeingDisplayed, 'MOVE_ME')
        .then((res) => {
            if (res.status === 'error') {
                showToast(res.message, 'error');
            } else {
                showToast('Move request registered on assignment');
            }
        })
        .catch(error => showToast('Failed to request move', 'error'));
}

function handleAbandonTask(button, assignmentId) {
    if (button.textContent.includes('Click to abandon')) {
        button.textContent = 'Confirm abandoning this task';
    } else {
        updateDbTaskStep(assignmentId, 1, 'BOOKMARK')
            .then(() => {
                assignment.current_step = 1;
                assignment.stepBeingDisplayed = 1;
                renderTask(panelEl);
            });
    }
}

async function handleCompleteTask(button, assignmentId) {
    console.log('handleCompleteTask()',button.textContent);
 if (assignment.current_step === 2) return; //the db already has this marked as completed
    //fails. Looks like there is a control char at start of that button.text
    if (button.textContent === 'Mark this task as completed') {
        button.textContent = 'Click to confirm completion';
                showToast("The next step is to confirm you want to register completion.");
    } else if (button.textContent === 'Click to confirm completion') {
       
       try{
       await updateDbTaskStep(assignmentId, 2);
       }catch(error){console.log('error marking as complete', error)};
       button.textContent = 'Completed';
       button.disabled = true; //not disabled

    }
}


function handleMessageManager(button, assignmentId) {
    showToast('Manager contact initiated');
    //should put managerId on clipboard, but we don't know that id here.
}

async function updateDbTaskStep(assignmentId, destinationStep, actionType = 'BOOKMARK') {
   if(actionType === 'MOVE_ME') // it is a request to move to next step by a student on a manager controlled task
try { console.log('studentRequestMoveMe', actionType);
        return await executeIfPermitted(null, 'studentRequestMoveMe', {
            assignmentId: assignmentId,
            bookmark: destinationStep
        });
    } catch (error) {
        console.error('Failed to execute step RPC:', error);
        throw error;
    }
else //assumes 'BOOKMARK'
 try { console.log('bookmark this step', actionType);
        return await executeIfPermitted(null, 'studentBookmarkStep', {
            assignmentId: assignmentId,
            bookmark: destinationStep

        });
    } catch (error) {
        console.error('Failed to execute step RPC:', error);
        throw error;
    }
}

function renderStepCard(title, step, color, studentName = null, showCheckmark = false, stepNumber = null, assignmentId = null) {
    if (!step) return '';
    
    const name = step.step_name || 'Unnamed';
    const description = step.step_description || '';
    
    return `
        <div class="bg-white rounded-lg p-6 shadow-md border border-gray-200 relative">
            <div class="text-sm font-semibold text-gray-600 mb-2">
                ${stepNumber !== null ? `Step ${stepNumber}: ` : ''}${title}
            </div>
            <h4 class="text-lg font-bold">${name}</h4>
            <p class="text-sm text-gray-600 mt-1 whitespace-pre-line">${description}</p>
        </div>
    `;
}

async function loadStepAutomations(stepId) {
    try {
        await executeIfPermitted(subject.approUserId, 'readTaskAutomations', {
            source_task_step_id: stepId
        });
    } catch (err) {
        console.error('Error loading automations:', err);
    }
}