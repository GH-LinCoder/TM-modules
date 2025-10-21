import{executeIfPermitted} from '../../registry/executeIfPermitted.js';
import{showToast} from '../../ui/showToast.js';
import { appState } from '../../state/appState.js'; // modules interact through appState
import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';
import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';


export async function render(panel, query = {}) { // stop passing query? use appState?
console.log('render()',query); // only receiving petitioner not the whole query{}


  console.log('displayStudentTask.js render() called');
  const dialog = new displayStudentTask();
  dialog.render(panel, query);
  }

/////////////////////////////////////          CLASS               ////////////////////////////////////////////

    class displayStudentTask {

      next_step_id;
      abandonedClicked = false;//toggle if the abandoned button is clicked

  userId= appState.query.userId;

      constructor() {


        // DOM references - will be set when show is called
        this.dialog = null;
     
        this.closeButtons = null;
        this.actionButtons = null;
        this.studentNameEl = null;
        this.nextstudentNameEl = null;
        this.currentStepCheckmark = null;
     

        // State
        this.commitTimeout = null;
        this.pendingAdvance = false;
        this.advanceConfirmed = false;
        this.resolvePromise = null;
        this.rejectPromise = null;
        this.promise = null;
        this.controller = null;

        this.setupClipboardListener();

      } //end of constructor

      showError(message) {
        console.error('Error:', message);
        if (this.informationFeedback) {
          this.informationFeedback.innerHTML = `<div class="text-red-500 font-bold">Error: ${message}</div>`;
        }
        showToast(message, 'error');
      }


//////////////////////////////////  Clipboard /////////////////////


setupClipboardListener() {  // may not be relevant
  onClipboardUpdate(async () => {
    console.log('clipboard update detected in listener');
    
    try {
      // Reload and update the display with new assignment data
      await this.displayTaskData();
      console.log('Display updated with new clipboard data');
    } catch (error) {
      console.error('Error updating display after clipboard change:', error);
      if (this.showError) {
        this.showError('Failed to update display: ' + error.message);
      }
    }
  });
}




// GET ASSIGNMENT ID FROM CLIPBOARD OR USE DEFAULT
// Fix the getAssignmentId method to properly extract the assignment ID:
getAssignmentId() {
  // Look for clipboard items that represent assignments
  const clipboardAssignments = getClipboardItems({ as: 'assignment' });
  const clipboardOther = getClipboardItems({ as: 'other' });
  
  console.log('Clipboard assignments:', clipboardAssignments);
  console.log('Clipboard other:', clipboardOther);
  
  if (clipboardAssignments.length > 0) {
    const clipboardItem = clipboardAssignments[0];
    console.log('Clipboard item:', clipboardItem);
    
    // Access the full row data
    const rowData = clipboardItem.entity.item;
    console.log('Row data:', rowData);
    
    // Look for assignment_id in the row data
    if (rowData.assignment_id) {
      console.log('Found assignment_id:', rowData.assignment_id);
      return rowData.assignment_id;
    } else if (rowData.id) {
      console.log('Found id:', rowData.id);
      return rowData.id;
    }
  }

  if (clipboardOther.length > 0) {
    const clipboardItem = clipboardOther[0];
    // Check if the 'other' item is actually an assignment
    if (clipboardItem.entity.type === 'assignment' || 
        clipboardItem.entity.type === 'task-assignment') {
      if (clipboardItem.entity.assignment_id) {
        return clipboardItem.entity.assignment_id;
      } else if (clipboardItem.entity.id) {
        return clipboardItem.entity.id;
      }
    }
  }
  
  // This assignment is a default one with a default task that can always be used
  const DEFAULT_ASSIGNMENT_ID = 'cc807827-ff24-4418-bbaa-ffe04e868988';
  console.log('Using default assignment');
  return DEFAULT_ASSIGNMENT_ID;
//need to disabled the advance button

}

async readassignmentObject(assignment_id){
  const assignmentArray = await executeIfPermitted(this.userId, 'readThisAssignment', {
  assignment_id:assignment_id }); // Returns in an array. Could be >1 if error of duplicates
  if (assignmentArray.length === 0) {
    this.showError('No assignment found');
    return;
  }

const assignmentObject = assignmentArray[0];
if(assignmentObject){ console.log('MoveStudent... assignmentObject from db:', assignmentObject); } else console.log('not found assignment data');
return assignmentObject;
}


////////////////////////////////  RENDER   //////////////////////////////////      
      /**
       * Creates the dialog element and injects it into the DOM
       * @returns {Promise<boolean>} Resolves with true if student was moved, false otherwise
       */
      async render(panel) {
        console.log('displayStudentTask render()');
        // Inject dialog HTML
        panel.innerHTML = this.getTemplateHTML();

        // Get DOM references
        this.dialog = panel.querySelector('#displayStudentTask');

        //this.advanceButton = this.dialog.querySelector('#advanceButton');
        this.closeButtons = this.dialog.querySelectorAll('[data-action="close-dialog"]');
        this.actionButtons = this.dialog.querySelectorAll('[data-button]');
       // this.forwardArrow = this.dialog.querySelector('#forwardArrow');
       // this.backwardArrow = this.dialog.querySelector('#backwardArrow');

        this.currentStepCheckmark = this.dialog.querySelector('#currentStepCheckmark');

        this.abandonedButton = this.dialog.querySelector('[data-button="abandoned"]');

        this.taskNameEl = this.dialog.querySelector('[data-task="name-of-task"]'); 


        this.previous_stepEl = this.dialog.querySelector('[data-step="previous"]');
        this.previous_step_nameEl = this.dialog.querySelector('[data-previous-title]');
        this.previous_step_descriptionEl = this.dialog.querySelector('[data-previous-description]');
        //console.log('previous_stepEl', this.previous_stepEl);

        this.studentNameEl = this.dialog.querySelector('[data-task="student-name-current"]'); 
        this.stepNumberEl = this.dialog.querySelector('[data-task="current-step-number"]'); 
        this.stepNameEl = this.dialog.querySelector('[data-task="current-step-name"]'); 
        this.stepDescriptionEl = this.dialog.querySelector('[data-task="current-step-description"]'); 
        //console.log(this.stepDescriptionEl); // seems to be correct element        

        this.next_stepEl = this.dialog.querySelector('[data-step="next"]'); 
        this.next_step_nameEl = this.dialog.querySelector('[data-next-title]');
        this.next_step_descriptionEl = this.dialog.querySelector('[data-next-description]');
        this.next_studentNameEl = this.dialog.querySelector('[data-task="student-name-next"]'); 


        this.informationFeedback = this.dialog.querySelector('[data-task="information-feedback"]'); 
        //need the three other buttons

        // Create promise for the result
        this.promise = new Promise((resolve, reject) => {
          this.resolvePromise = resolve;
          this.rejectPromise = reject;
        });

        // Reset state
        this.pendingAdvance = false;
        this.advanceConfirmed = false;
        
        // Show the dialog
        this.dialog.style.display = 'flex';
        
//tried to do clipboard update here - but not detected


        // Initialize event listeners
        this.initEventListeners();

        //tried to do clipboard update here - but not detected
        
  // Initial load of assignment data
  await this.displayTaskData();


        return this.promise;
      }
  


  async findTaskSteps(userId, task_header_id){
    
    const taskSteps = await executeIfPermitted(userId, 'readTaskWithSteps', {
         //  manager_id: manager_id || null,
      task_header_id: task_header_id   
    });
    console.log('findTasksteps()',taskSteps);
    return taskSteps ||[];
  }    

  displayCompletedAssignment(currentStep,taskSteps){
    if(currentStep!=2) return; // should never happen
  //  this.forwardArrow.classList.add('hidden');

    this.previous_stepEl.hidden=true;

    const completionStepNumber = 2; // that is the number of the completion step
    const completionStep = taskSteps.find(step => step.step_order === completionStepNumber);

    const completionStepName = completionStep.step_name;
    const completionStepDescription= completionStep.step_description;
    //this.previous_step_id = completionStep.step_id;
    console.log(completionStepNumber, completionStepName, completionStepDescription);
  
  //  this.completion_stepEl.innerHTML=  ; 
    this.next_step_nameEl.innerHTML= completionStepName;
    this.next_step_descriptionEl.innerHTML= completionStepDescription;

    this.next_stepEl.hidden = true;

  };



  displayCompletionStep(currentStep,taskSteps){// should only come here if advancing from current step when currentStep is the final step

    if(currentStep!=taskSteps.length) return; // should never happen
    
    const completionStepNumber = 2; // that is the number of the completion step
    const completionStep = taskSteps.find(step => step.step_order === completionStepNumber);
    this.next_step_id = completionStep.step_id;
    const completionStepName = completionStep.step_name;
    const completionStepDescription= completionStep.step_description;
    //this.previous_step_id = completionStep.step_id;
    console.log('CompletionStep:',completionStepNumber , completionStepName, completionStepDescription);
  
  //  this.completion_stepEl.innerHTML=  ; 
    this.next_step_nameEl.innerHTML= completionStepName;
    this.next_step_descriptionEl.innerHTML= completionStepDescription;


  }


//////////////////  PREVIOUS STEP  ////////////////////  
async displayPreviousStep(currentStep,taskSteps){// only called if numberOfSteps>3
    if(currentStep<4) return; // should never happen
  
    const previousStep = taskSteps.find(step => step.step_order === currentStep - 1);
    const previousStepNumber = previousStep.step_order;
    const previousStepName = previousStep.step_name;
    const previousStepDescription= previousStep.step_description;
    this.previous_step_id = previousStep.step_id;
    console.log('PreviousStep:',previousStepNumber, previousStepName, previousStepDescription);
  //  this.next_stepEl.innerHTML=  ; 
    this.previous_step_nameEl.innerHTML= previousStepName;
    this.previous_step_descriptionEl.innerHTML= previousStepDescription;
}


//////////////////  CURRENT STEP  ////////////////////  
async displayCurrentStep(currentStep, assignmentObject){
  this.studentNameEl.innerHTML='Student:'+ assignmentObject.student_name;//works 16:40 sept 16
  this.stepNumberEl.innerHTML='Step:' + assignmentObject.step_order;//works 16:40 sept 16
  this.stepNameEl.innerHTML=assignmentObject.step_name;//works 16:40 sept 16
  this.stepDescriptionEl.innerHTML = assignmentObject.step_description.slice(0,300);
    //console.log(assignmentObject.step_description); //value correct
}


//////////////////  NEXT STEP  ////////////////////  
async displayNextStep(currentStep,taskSteps){// only called if numberOfSteps>currentStep
  if(currentStep>=taskSteps.length) return; // should never happen
  const nextStep = taskSteps.find(step => step.step_order === currentStep + 1);
  const nextStepNumber = nextStep.step_order;
  const nextStepName = nextStep.step_name;
  const nextStepDescription= nextStep.step_description;
  this.next_step_id = nextStep.step_id;
  console.log('nextStep:',nextStepNumber, nextStepName, nextStepDescription);
    //  this.next_stepEl.innerHTML=  ; 
  this.next_step_nameEl.innerHTML= nextStepName;
  this.next_step_descriptionEl.innerHTML= nextStepDescription;
}

displayAbandonedNextStep(currentStep,taskSteps){
  if(currentStep>=taskSteps.length) return; // should never happen
  const nextStep = taskSteps.find(step => step.step_order === 1);
  const nextStepNumber = nextStep.step_order;
  const nextStepName = nextStep.step_name;
  const nextStepDescription= nextStep.step_description;
  this.next_step_id = nextStep.step_id;
  console.log('abandonedStep:',nextStepNumber, nextStepName, nextStepDescription);
    //  this.next_stepEl.innerHTML=  ; 
  this.next_step_nameEl.innerHTML= nextStepName;
  this.next_step_descriptionEl.innerHTML= nextStepDescription;  
}


displayAbandoned(currentStep,taskSteps){
  if(currentStep != 1) return; // should never happen
  this.previous_stepEl.hidden=true;
  this.next_stepEl.hidden = true;

 // this.forwardArrow.classList.add('hidden');
  const nextStep = taskSteps.find(step => step.step_order === 1);
  const nextStepNumber = nextStep.step_order;
  const nextStepName = nextStep.step_name;
  const nextStepDescription= nextStep.step_description;
  this.next_step_id = nextStep.step_id;
  console.log('DisplayAbandoned:',nextStepNumber, nextStepName, nextStepDescription);
    //  this.next_stepEl.innerHTML=  ; 
  this.next_step_nameEl.innerHTML= nextStepName;
  this.next_step_descriptionEl.innerHTML= nextStepDescription;  
  
}

async displayTaskData() {
  console.log('displayTaskData');
  
  try {
    const assignment_id = this.getAssignmentId();
    console.log('assignment_id:', assignment_id);
    
    // Validate that we have a valid assignment ID
    if (!assignment_id || assignment_id === 'undefined') {
      this.showError('Invalid assignment ID. Please select a valid assignment from the clipboard.');
      return;
    }

    // Store the assignment_id for later use
    this.assignment_id = assignment_id;
    

    // Load the assignment data
    const assignmentArray = await executeIfPermitted(this.userId, 'readThisAssignment', {
      assignment_id: assignment_id
    });
    
    if (!assignmentArray || assignmentArray.length === 0) {
      this.showError('No assignment found');
      return;
    }
    
    const assignmentObject = assignmentArray[0];
    console.log('Assignment object:', assignmentObject);
    
    // Update the UI with assignment data
    this.taskNameEl.innerHTML = assignmentObject.task_name || 'Unknown Task';
    this.studentNameEl.innerHTML = 'Student: ' + (assignmentObject.student_name || 'Unknown Student');
    this.next_studentNameEl.innerHTML = 'Student: ' + (assignmentObject.student_name || 'Unknown Student');
    
    const currentStep = assignmentObject.step_order;
    this.displayCurrentStep(currentStep, assignmentObject);
    
    // Load task steps for navigation
    const taskSteps = await this.findTaskSteps(this.userId, assignmentObject.task_header_id);
    const numberOfSteps = taskSteps.length;
    
    // Update information feedback
    this.informationFeedback.innerHTML = `There are ${numberOfSteps} steps in this task.`;
    this.informationFeedback.innerHTML += `<p>The current step is [${currentStep}]</p>`;
    
    // Handle different step scenarios
    if (currentStep === 1) {
      this.informationFeedback.innerHTML += '<p>The current step of [1] means abandoned</p>';
      this.displayAbandoned(currentStep, taskSteps);
    } else if (currentStep === 2) {
      this.informationFeedback.innerHTML += '<p>The current step is [2] which means completed</p>';
      this.displayCompletedAssignment(currentStep, taskSteps);
    } else if (currentStep === numberOfSteps) {
      this.informationFeedback.innerHTML += `<p>The current step is [${currentStep}] which is the final step. That means advancing to completion.</p>`;
      this.displayCompletionStep(currentStep, taskSteps);
    }
    
    // Display navigation steps
    if (currentStep > 3) {
      this.previous_stepEl.hidden = false;
      this.displayPreviousStep(currentStep, taskSteps);
    } else {
      this.previous_stepEl.hidden = true;
    }
    
    if (this.abandonedClicked) {
      this.displayAbandonedNextStep(currentStep, taskSteps);
    } else if (numberOfSteps > currentStep) {
      this.displayNextStep(currentStep, taskSteps);
    }
    
  } catch (error) {
    console.error('Error loading assignment data:', error);
    this.showError('Failed to load assignment data: ' + error.message);
  }
}


 getTemplateHTML() { console.log('getTemplateHTML()');
    return `   <style>
    /* Custom style for the arrow button */
    .advance-button {
      background-color: #3b82f6; /* Blue-600 */
      color: white;
      transition: background-color 0.2s ease-in-out;
      border-radius: 9999px; /* Full rounded */
      padding: 0.75rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      flex-shrink: 0;
    }
    .advance-button:hover {
      background-color: #2563eb; /* Blue-700 */
    }
  </style>

<div class="bg-gray-100 font-sans" data-module="advance-student-step" >


  <!-- Advance Task Dialogue -->
  <div id="displayStudentTask" data-form="displayStudentTask" class=" relative w-full h-full flex items-center justify-center">
    <!--div id="advanceTaskDialog" data-form="advanceTaskDialog" class="relative z-10 w-full"-->
    <!-- Backdrop -->
    <!--div class="fixed inset-0 bg-black/80" data-action="close-dialog"></div-->

    <!-- Dialog Container -->
    <!--div class="bg-white rounded-lg shadow-lg w-full max-w-5xl mx-4 z-10 max-h-[90vh] overflow-y-auto"-->
    <div class="bg-white rounded-lg shadow-lg w-full mx-0 z-10">
      
      <!-- Close Button and Title -->
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-semibold text-gray-900" data-form="title">🧑‍🎓 21:56 Oct 21</h3>
          <div class="text-xl font-semibold text-gray-900" data-task="name-of-task">name of task</div>
          <button
            class="text-gray-500 hover:text-gray-700"
            data-action="close-dialog"
            aria-label="Close"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Main Content and Cards -->
      <div class="p-6 space-y-8">
        
        <!-- Step Cards and Advance Button -->
        <div class="flex flex-row items-center justify-center gap-6">

          <!-- Previous Step Card -->
          <div class="w-1/3 bg-gray-50 rounded-lg p-6 shadow-md border border-gray-200 relative" data-step="previous">
            <div class="text-sm font-semibold text-gray-600 mb-2">Previous Step</div>
            <h4 class="text-lg font-bold" data-previous-title>name of previous step</h4>
            <p class="text-sm text-gray-500 mt-1" data-previous-description>
              Brief description of the previous task step.
            </p>
            <!-- Checkmark for previous step (always visible) -->
            <div class="absolute top-2 right-2 text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2l4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <!-- Current Step Card -->
          <div class="w-1/3 bg-blue-50 rounded-lg p-6 shadow-md border border-blue-200 relative" data-step='current'>
            <div class="text-sm font-semibold text-blue-600 mb-2" data-task="current-step-number">Current Step</div>
            <h4 class="text-lg font-bold" data-task= "current-step-name">???</h4>
            <p class="text-sm text-gray-600 mt-1" data-task="current-step-description">
            ???
            </p>
            <!-- Student card inside the current step -->
            <div id="studentName" data-task="student-name-current" class="absolute -top-4 -left-4 bg-white rounded-full p-2 text-xs font-medium text-gray-700 shadow border border-gray-200">
              Student: ???
            </div>
            <!-- Checkmark for current step (initially hidden) -->
            <div id="currentStepCheckmark" class="hidden absolute top-2 right-2 text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2l4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <!-- Advance/Reverse Button Container -->
          <div class="relative">
            <button id="advanceButton" class="advance-button" data-action="advance" aria-label="Advance task to next step">
              <!--svg id="forwardArrow" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 5l7 7-7 7M5 12h14" />
              </svg-->
              <!--svg id="backwardArrow" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11 19l-7-7 7-7M19 12h-14" />
              </svg-->
              
            </button>
          </div>

          <!-- Next Step Card -->
          <div class="w-1/3 bg-green-50 rounded-lg p-6 shadow-md border border-green-200 relative" data-step="next">
            <div class="text-sm font-semibold text-green-600 mb-2">Next Step</div>
            <h4 class="text-lg font-bold" data-next-title>Step 3: State Management</h4>
            <p class="text-sm text-gray-600 mt-1" data-next-description>
              Implement state management solutions with React Context or Redux.
            </p>
            <!-- Student card inside the next step -->
            <div id="nextStudentName" data-task="student-name-next" class="hidden absolute -top-4 -right-4 bg-white rounded-full p-2 text-xs font-medium text-gray-700 shadow border border-gray-200">
              Student: ???
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col md:flex-row justify-center gap-4 pt-4 border-t border-gray-200">
          <!--button data-button="message-student" class="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Message Student
          </button-->
          <button data-button="abandoned" class="flex-1 py-3 px-6 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
            Abandoned
          </button>
          <button data-button="message-manager" class="flex-1 py-3 px-6 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
            Message Manager
          </button>
        </div>
      </div><!--end main content & cards -->
       <div class="bg-green-100 flex flex-col md:flex-row justify-center gap-4 pt-4 border-t border-gray-200">
       <p class="text-lg font-bold"> Information:</p><p data-task="information-feedback">??</>
       </div>    
    </div><!--end dialog -->
  
    </div>
</div> 
   ${petitionBreadcrumbs()} 
    `;} // end of html

routeAction(actionType) {
//  console.log('action:',actionType);
  switch (actionType) {
    
    case 'abandoned':    
  //  console.log('case:',actionType);
  if(this.abandonedClicked) this.abandonedClicked=false;
  else this.abandonedClicked=true; //  toggle vallue - consistent button behaviour
this.displayTaskData();    
      break;



    case 'message-manager':
      this.informationFeedback.innerHTML +=`<p>The message functions not yet implemented [${actionType}]`;
      this.onAction(actionType); // external handler
      break;

    default:
      console.warn(`Unknown action type: ${actionType}`);
  }
}



      initEventListeners() {
        // Remove existing listeners
        if (this.controller) {
          this.controller.abort();
        }
        
        this.controller = new AbortController();

        // Close buttons
        this.closeButtons.forEach(button => {
          button.addEventListener('click', (e) => {
            e.preventDefault();
            this.hide();
            this.onClose();
            
            // Resolve with false when closed
            if (this.resolvePromise) {
              this.resolvePromise(false);
              this.resolvePromise = null;
              this.rejectPromise = null;
            }
          }, { signal: this.controller.signal });
        });

        // Action buttons
        this.actionButtons.forEach(button => {
          button.addEventListener('click', (e) => {
            e.preventDefault();
            const action = e.target.getAttribute('data-button');
            this.routeAction(action);
          }, { signal: this.controller.signal });
        });
    }


      hide() {
        if (this.dialog) {
          this.dialog.style.display = 'none';
        }
        this.onClose();
      }

      destroy() {
        clearTimeout(this.commitTimeout);
        
        if (this.controller) {
          this.controller.abort();
        }
        
        // Remove dialog from DOM
        if (this.dialog && this.dialog.parentElement) {
          this.dialog.parentElement.removeChild(this.dialog);
        }
        
        // Reject promise if it exists
        if (this.rejectPromise) {
          this.rejectPromise(new Error('Dialog destroyed'));
          this.resolvePromise = null;
          this.rejectPromise = null;
        }
      }
    }


    



    export {displayStudentTask}


