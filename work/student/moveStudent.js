console.log('moveStudent.js loaded');

// The module needs the id:uuid for the row in task_assignments
// but I only realsied that after coding. I assumed the module would receive the task_header_id
// there is a function to return any rows that have used a specific task_header_id
//but move student should assume a specific assignment
//this assignment_id must be passed to the function
//have not yet worked out details of how to store this in appState  14:40 Spet 16 2025
//Module=moveStudentStep, Section=??? ,Action=???  , Destination= ???
//const userId = "06e0a6e6-c5b3-4b11-a9ec-3e1c1268f3df"; //DEV id for user 'profilia'

  /*​ Assignment view
0: "step_id"
1: "step_name"
2: "task_name"
3: "manager_id"
4: "step_order"
5: "student_id"
6: "assigned_at"
7: "abandoned_at"
8: "completed_at"
9: "manager_name"
10: "student_name"
11: "assignment_id"
12: "task_header_id"
13: "task_description"
length: 14
  */


import{executeIfPermitted} from '../../registry/executeIfPermitted.js';
import{showToast} from '../../ui/showToast.js';
import { appState } from '../../state/appState.js'; // modules interact through appState


export async function render(panel, query = {}) { // stop passing query? use appState?
console.log('render()',query); // only receiving petitioner not the whole query{}


  console.log('moveStudentStep.js render() called');
  const dialog = new moveStudentStep({
    onAdvance: () => console.log('User clicked next - need write to db'),  
    onReverse: () => console.log('User clicked back'), //never happens. Clicks of reverse don't get noticed because timeout both register when click forward & then prevents click back
    onClose: () => console.log('Form closed'),
    onAction: (actionType) => {console.log(`Action triggered: ${actionType}`);}
  });
  dialog.render(panel, query);
  }

/////////////////////////////////////          CLASS               ////////////////////////////////////////////

    class moveStudentStep {

      next_step_id;
      abandonedClicked = false;//toggle if the abandoned button is clicked
      assignment_id = 'acb9283b-1745-4eea-8ec5-62d646cfadb4'; //this is a specific assignment of the 'Welcome' task to a specific student

      constructor({ onAdvance, onReverse, onClose, onAction } = {}) {
        // Callback functions with defaults
        this.onAdvance = onAdvance || (() => {});
        this.onReverse = onReverse || (() => {});
        this.onClose = onClose || (() => {});
        this.onAction = onAction || (() => {}); // what happens?

        // DOM references - will be set when show is called
        this.dialog = null;
        this.advanceButton = null;
        this.closeButtons = null;
        this.actionButtons = null;
        this.studentNameEl = null;
        this.nextstudentNameEl = null;
        this.currentStepCheckmark = null;
        this.forwardArrow = null;
        this.backwardArrow = null;

        // State
        this.commitTimeout = null;
        this.pendingAdvance = false;
        this.advanceConfirmed = false;
        this.resolvePromise = null;
        this.rejectPromise = null;
        this.promise = null;
        this.controller = null;
      } //end of constructor


////////////////////////////////  RENDER   //////////////////////////////////      
      /**
       * Creates the dialog element and injects it into the DOM
       * @returns {Promise<boolean>} Resolves with true if student was moved, false otherwise
       */
      async render(panel) {
        // Inject dialog HTML
        panel.innerHTML = this.getTemplateHTML();

        // Get DOM references
        this.dialog = panel.querySelector('#moveStudentStep');

        this.advanceButton = this.dialog.querySelector('#advanceButton');
        this.closeButtons = this.dialog.querySelectorAll('[data-action="close-dialog"]');
        this.actionButtons = this.dialog.querySelectorAll('[data-button]');
        this.forwardArrow = this.dialog.querySelector('#forwardArrow');
        this.backwardArrow = this.dialog.querySelector('#backwardArrow');

        this.currentStepCheckmark = this.dialog.querySelector('#currentStepCheckmark');

        //this.studentNameEl = this.dialog.querySelector('#studentName');
 
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
//        this.nextstudentNameEl = this.dialog.querySelector('#nextStudentName'); // old designation
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
        
        // Initialize event listeners
        this.initEventListeners();
        
        this.displayTaskData();


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
    this.forwardArrow.classList.add('hidden');

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
async displayCurrentStep(assignmentData){
  this.studentNameEl.innerHTML='Student:'+ assignmentData.student_name;//works 16:40 sept 16
  this.stepNumberEl.innerHTML='Step:' + assignmentData.step_order;//works 16:40 sept 16
  this.stepNameEl.innerHTML=assignmentData.step_name;//works 16:40 sept 16
  this.stepDescriptionEl.innerHTML = assignmentData.step_description.slice(0,300);
    //console.log(assignmentData.step_description); //value correct
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

  this.forwardArrow.classList.add('hidden');
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

  const student_id = "1c8557ab-12a5-4199-81b2-12aa26a61ec5";//DEV id for user 'noomwild'
  const task_header_id = 'dc9a0e71-4adf-42e7-8649-3620089e4df8';//DEV id for task 'Welcome' but isn't the assignment id
// problem: there may be several different assignments of this task. 
  
  const userId = appState.query.userId;// first use of the global userId 15:15 sept 16

  // not yet sure how going to get student & task id
  
  //what args? need student_id, task_id  
  // read task_assignment_view to get details
  
  const assignmentArray = await executeIfPermitted(userId, 'readThisAssignment', {//from a task id. Why not from an assignment id???
          assignment_id:this.assignment_id,
        //  manager_id: manager_id || null,
       //   task_header_id:task_header_id   
        }); // correctly finds the data. Returns in an array. Could be >1 if error of duplicates
        if (assignmentArray.length === 0) {
          this.showError('No assignment found');
          return;
        }

  //else ? warn
  const assignmentData = assignmentArray[0];
  if(assignmentData) console.log('MoveStudent... assignmentData from db:', assignmentData); // worked 14:45 sept 16
  this.taskNameEl.innerHTML=assignmentData.task_name;  //works 16:40 sept 16

  const currentStep = assignmentData.step_order;
  this.displayCurrentStep(assignmentData);



  /////////////////// NEXT STEP     ////////////////////
this.next_studentNameEl.innerHTML='Student:'+ assignmentData.student_name;


const taskSteps = await this.findTaskSteps(userId,task_header_id);// an array of objects of length = number of steps
// taskSteps[0] = abandoned,
// taskSteps[1] = completed,
//taskSteps[3] = initial position when first on the task
const numberOfSteps = taskSteps.length;
console.log('numberOfSteps:', numberOfSteps);
let previousStepVisible = true; 

this.informationFeedback.innerHTML =`There are ${numberOfSteps} steps in this task.`;
this.informationFeedback.innerHTML +=`<p>The current step is [${currentStep}]`;

if(currentStep === 1) {this.informationFeedback.innerHTML += '<p>The current step of [1] means abandoned</p>';
  this.displayAbandoned(currentStep,taskSteps);
}
else
if(currentStep === 2) this.informationFeedback.innerHTML += '<p>The current step is [2] which means completed</p>';
else
if(currentStep === numberOfSteps) this.informationFeedback.innerHTML += `<p>The current step is [${currentStep}] which is the final step. That means advancing to completion.</p>`;
if(currentStep === 3) {this.informationFeedback.innerHTML += `<p>(Every task starts on step 3)</p>`;
previousStepVisible = false; this.previous_stepEl.hidden=true} 
else if(currentStep>3) {previousStepVisible =true; this.previous_stepEl.hidden=false;} 
// there is no rational previous step as steps 1 & 2 are final steps not starting steps

if(currentStep===2) {this.displayCompletedAssignment(currentStep,taskSteps); 
  this.informationFeedback.innerHTML += `<p>(Step 2 is the Completed step.)</p> <div class="top-2 right-2 text-2xl animate-bounce">🎉</div>'` ; }

if(currentStep===numberOfSteps) {this.displayCompletionStep(currentStep,taskSteps);}

if (currentStep>3)this.displayPreviousStep(currentStep,taskSteps); 
console.log('this.abandonedClicked',this.abandonedClicked);
if (this.abandonedClicked) this.displayAbandonedNextStep(currentStep,taskSteps);
else if (numberOfSteps>currentStep) this.displayNextStep(currentStep,taskSteps);




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
  <div id="moveStudentStep" data-form="moveStudentStep" class=" relative w-full h-full flex items-center justify-center">
    <!--div id="advanceTaskDialog" data-form="advanceTaskDialog" class="relative z-10 w-full"-->
    <!-- Backdrop -->
    <!--div class="fixed inset-0 bg-black/80" data-action="close-dialog"></div-->

    <!-- Dialog Container -->
    <!--div class="bg-white rounded-lg shadow-lg w-full max-w-5xl mx-4 z-10 max-h-[90vh] overflow-y-auto"-->
    <div class="bg-white rounded-lg shadow-lg w-full mx-0 z-10">
      
      <!-- Close Button and Title -->
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-semibold text-gray-900" data-form="title">Advance Student Step</h3>
          <div class="text-gray-500 hover:text-gray-700" data-task="name-of-task">name of task</div>
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
              <svg id="forwardArrow" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 5l7 7-7 7M5 12h14" />
              </svg>
              <svg id="backwardArrow" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11 19l-7-7 7-7M19 12h-14" />
              </svg>
              
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
          <button data-button="message-student" class="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Message Student
          </button>
          <button data-button="abandoned" class="flex-1 py-3 px-6 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
            Abandoned
          </button>
          <button data-button="message-admin" class="flex-1 py-3 px-6 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
            Message Admin
          </button>
        </div>
      </div><!--end main content & cards -->
       <div class="bg-green-100 flex flex-col md:flex-row justify-center gap-4 pt-4 border-t border-gray-200">
       <p class="text-lg font-bold"> Information:</p><p data-task="information-feedback">??</>
       </div>    
    </div><!--end dialog -->
  
    </div>
</div>  `;} // end of html

async writeToDb(step_id){
  const userId =appState.query.userId;
  console.log('writeToDb( step_id:',step_id,'this.assignment_id:',this.assignment_id);// both okay 13:03 Sept 17  '90ef...' 'acb9...'
  const data = await executeIfPermitted(userId, 'assignmentUpdateStep', {
    step_id:step_id,
    assignment_id:this.assignment_id   
  });
//what does it return? An empty array. Length 0.
console.log('WriteToDb return:',data);
this.displayTaskData();
this.revertStudent();//put student on middle card
this.currentStepCheckmark.classList.add('hidden');//remove the green tick from current step
this.hideBackArrow();//remove the clickable arrow. Means you can't do anything more (you have to refresh page to restore arrow)

}

routeAction(actionType) {
//  console.log('action:',actionType);
  switch (actionType) {
    
    case 'abandoned':    
  //  console.log('case:',actionType);
  if(this.abandonedClicked) this.abandonedClicked=false;
  else this.abandonedClicked=true; //  toggle vallue - consistent button behaviour
this.displayTaskData();    
      break;


    case 'message-student':
    case 'message-admin':
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

        // Advance/reverse button
        this.advanceButton.addEventListener('click', (e) => {
          e.preventDefault();
          const action = this.advanceButton.getAttribute('data-action');
          if (action === 'advance') {
            this.handleAdvance();
          } else if (action === 'reverse') {
            this.handleReverse();
          }
        }, { signal: this.controller.signal });

        // Action buttons
        this.actionButtons.forEach(button => {
          button.addEventListener('click', (e) => {
            e.preventDefault();
            const action = e.target.getAttribute('data-button');
            this.routeAction(action);
          }, { signal: this.controller.signal });
        });


    }

      handleAdvance() {
        this.pendingAdvance = true;

        // Visual feedback
        this.studentNameEl.classList.add('scale-110');
        setTimeout(() => {
          this.studentNameEl.classList.remove('scale-110');
        }, 200); // 200 what units? miliseconds?

        this.studentNameEl.classList.add('hidden');
        this.next_studentNameEl.classList.remove('hidden');
        this.currentStepCheckmark.classList.remove('hidden');

        this.advanceButton.setAttribute('data-action', 'reverse');
        this.forwardArrow.classList.add('hidden');
        this.backwardArrow.classList.remove('hidden');

        // Set timeout to commit the advance
        this.commitTimeout = setTimeout(() => {
          this.pendingAdvance = false;
          this.advanceConfirmed = true;

          if (this.advanceConfirmed) this.writeToDb(this.next_step_id);
          
          // Disable the button
          this.advanceButton.disabled = true;
          this.advanceButton.style.opacity = '0.5';
          this.advanceButton.style.cursor = 'not-allowed';
          
          // Trigger callback and resolve promise
          this.onAdvance();
          if (this.resolvePromise) {
            this.resolvePromise(true);
            this.resolvePromise = null;
            this.rejectPromise = null;
          }
        }, 2000);
      }



      handleReverse() {
        if (this.pendingAdvance) {
          clearTimeout(this.commitTimeout);
          this.pendingAdvance = false;
          this.revertVisuals();
          
          // Enable the button
          this.advanceButton.disabled = false;
          this.advanceButton.style.opacity = '1';
          this.advanceButton.style.cursor = 'pointer';
          
          return;
        }

        if (this.advanceConfirmed) {
          this.advanceConfirmed = false; //reverse the decision
          this.revertVisuals();
          
          // Enable the button
          this.advanceButton.disabled = false;
          this.advanceButton.style.opacity = '1';
          this.advanceButton.style.cursor = 'pointer';
          
          // Resolve with false
          if (this.resolvePromise) {
            this.resolvePromise(false);
            this.resolvePromise = null;
            this.rejectPromise = null;
          }
          
          this.onReverse();
        }
      }

revertStudent(){
  this.studentNameEl.classList.remove('hidden');
  this.next_studentNameEl.classList.add('hidden');
  this.currentStepCheckmark.classList.add('hidden');


}

hideBackArrow(){
  this.backwardArrow.classList.add('hidden');
}

      revertVisuals() {
        this.revertStudent();
       // this.studentNameEl.classList.remove('hidden');
       // this.next_studentNameEl.classList.add('hidden');
       // this.currentStepCheckmark.classList.add('hidden');

        this.advanceButton.setAttribute('data-action', 'advance');
        this.forwardArrow.classList.remove('hidden');
        this.backwardArrow.classList.add('hidden');
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


    



    export {moveStudentStep}


