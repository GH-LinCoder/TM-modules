import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { appState } from '../../state/appState.js';
import {  resolveSubject} from '../../utils/contextSubjectHideModules.js'
import { executeAutomations } from '../../utils/executeAutomations.js'; // from DISPLAY_TASK

import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';
//import { icons } from '../../registry/iconList.js'; 
//import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';
//NOTE: the automation functions herein read from the automations Table
//BUT those functions also exist in an importable version which expect different names for variables because
// the importable version is built to use data from survey_view or task_view which clearly distinguish
//between source-columns and target-columns (Is the stepId from the source task or from the task you want to assign?)
//At some time this module should refator to use the task_view instead of direct table access Dec 25 20252

console.log('displayTasksStudent.js loaded 19:54 Oct 27');

let subject = null;
let subjectId = null;
const authUserId = appState.query.defaultManagerId; //??????
let panelEl = null;

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

 
  render(panelEl);  // I made it a global to have the onclick outside the render function
//  if (!isMyDash) populateApprofileSelect(panel); // optional
});

//if (!isMyDash) { // do stuff if this module has an admin user version
//   populateApprofileSelect(panel);
//   attachDropdownListener(panel);
//   attachClickItemListener(panel); //allows click on the display to change subject of display
//}

async function renderSmallCards(userId, assignments, panel){






}






async function renderLargeCards(userId, assignments, panel){

        //the new design is to render the tasks initially in abbreviated cards which can be clicked to expand
    //the loop to read each assignment and render the task in large detailed cards
     // does not display
//console.log('panel:',panel); // logs a div "page-panel" 22:39 oct 27
  console.log('assignments:',assignments, 'assignment.length', assignments.length,'assignments[0].assignment_id', assignments[0].assignment_id);//logs ok 22:39 oct 27

panel.innerHTML = ''; // Clear panel 



for (const assignment of assignments) { // this only displays one assignment
//console.log('assignment',assignment, '.task_header',assignment.assignment.task_header );
  console.log('calling readTaskWithSteps');
  const taskSteps = await executeIfPermitted(userId, 'readTaskWithSteps', { // reads (*) from task_view  Dec 23 23:07
        task_header_id: assignment.assignment.task_header
      });  //why is that table being read? What is it being used for?

 const taskExternalURL = assignment.task_external_url;
                 console.log('assignment.task_external_url',assignment.task_external_url);


//console.log('assignment:', assignment);
const assignmentId = assignments[0].assignment_id;
      const currentStep = assignment.step_order; //important: to decide when to execute automations
      const numberOfSteps = taskSteps.length; //how many steps there are in this task
      const studentName = assignment.student_name || 'Unknown Student';
      const managerName = assignment.manager_name || 'Unknown Manager'; // new 20:39 dec 20
      const taskName = assignment.task_name || 'Unnamed Task';
      const taskDescription = assignment.task_description;
      const taskId = assignment.assignment.task_header;
      const stepId = assignment.step_id;

//2.autoPetition add asignment id 
        autoPetition.assignment_id = assignmentId; //collect data to be sent to permission_judge
//3.autoPetition add task and step id
        autoPetition.task_id = taskId;
        autoPetition.step_id = stepId;
        console.log('autoPetition:',autoPetition);//

      loadStepAutomations(stepId); //new 22:13 dec 23 func needs stepId

      const currentStepName = assignment.step_name || 'Unnamed Step';
      const currentStepDescription = assignment.step_description || 'No description available';

      const previousStep = currentStep === 3   // new 14:09 Oct 22
      ? {
          step_name: 'New assignment',
          step_description: 'All tasks start on step 3. The previous steps are reserved to mark the assignment as abandoned (step 1) or completed (step 2).'
        }
        : currentStep === 2
    ? taskSteps.reduce((max, step) => step.step_order > max.step_order ? step : max, taskSteps[0])
      : currentStep > 3
        ? taskSteps.find(s => s.step_order === currentStep - 1)
        : null;
  
        const nextStep = (() => {
          if (currentStep === 1 || currentStep === 2) return null; // prevent duplicate abandoned/completed card
          if (currentStep === numberOfSteps) return taskSteps.find(s => s.step_order === 2);
          if (currentStep < numberOfSteps) return taskSteps.find(s => s.step_order === currentStep + 1);
          return null;
        })();
          
        const showAbandonButton = currentStep !== 1 && currentStep !== 2;
        const buttonGroup = showAbandonButton ? `
          <button data-button="abandoned" class="flex-1 py-3 px-6 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
            Abandoned
          </button>` : '';
        
        // Decide how to render the external URL
    let externalContent = '';// console.log('taskExternalURL:',taskExternalURL);
    if (taskExternalURL) { //console.log('taskExternalURL: true');
      if (taskExternalURL.startsWith('<iframe')) { //console.log('startsWith(<iframe');//okay to here
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
      card.classList.add('bg-white', 'rounded-lg', 'shadow-lg', 'p-6', 'mb-8', 'border', 'border-gray-200');
    // console.log('checking consoleflow', card);  // 
      //confirmed that program flows to here on first save & card =  <div class="bg-white rounded-lg shad… border border-gray-200">      
      
      card.innerHTML = `
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold text-gray-900">${taskName}</h3>
          <div class="text-sm text-gray-500"> Manager: ${managerName}</div><div class="text-sm text-gray-500">${taskId}</div><div class="text-sm text-gray-500"> Student: ${studentName}</div>
        </div>
        <div class="rounded-lg p-6 shadow-md border relative  whitespace-pre-line"> ${taskDescription}</div>
${externalContent}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${renderStepCard('Previous Step', previousStep, studentName , true, 'gray')}
<!-- need to pass the contents of the 'external_ url' column so the url can be displayed just for the current step -->

          ${renderStepCard('Current Step', {
            step_name: currentStepName,
            step_description: currentStepDescription,
            external_url: assignment.external_url  //new paramter 15:00 Nov 21 2025
          }, currentStep === 1 ? 'red' : currentStep === 2 ? 'green' : 'blue', studentName, false, currentStep)}

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
    ${buttonGroup}
    <button data-button="message-manager" class="flex-1 py-3 px-6 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition" data-action="bug-report">
      Message Manager
    </button>
  </div>

          <!--button data-button="message-manager" class="flex-1 py-3 px-6 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
            Message Manager
          </button-->
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
//console.log('panel', panel);  // <div class="page-panel" data-page-name="display-tasks" style="flex: 1 1 calc(20% - 1rem);">
//console.log('Before append, panel connected:', panel.isConnected);
panel.appendChild(card);
//console.log('After append, panel connected:', panel.isConnected);

    }//eo for (const assignment)

}

export async function render(panel, query = {}) {
  console.log('displayTaskStudent.js render()');
 subject = await resolveSubject();

 // 1: add subject to petition
    autoPetition.auth_id = subject.id; // prepare all the params to be sent to the rpc function permissions_judge
    autoPetition.appro_id = subject.approUserId;
    console.log('autoPetition',autoPetition);


//console.log('resolved subject:',subject);

 subjectId =subject.approUserId;

  if (!panel || !panel.isConnected) {
    console.warn('Render target not found or disconnected');
    return;
  }
  
const userId = appState.query.userId;  
panelEl=panel;
//console.log('calling readStudentAssignments with id:', subjectId);

if(subject.type==='relations'){panel.innerHTML=''; //??
            return;}
else
try {console.log('calling readAssignmentsTasks');
    const assignments = await executeIfPermitted(subjectId, 'readAssignmentsTasks', {//from task_assignement_view
      student_id: subjectId
    });//when seeing myDash for first time subjectId not assigned
if (!assignments || assignments.length === 0) {
      panel.innerHTML = `<div class="text-gray-500 text-center py-8">No task assignments found for: ${subject.name}.</div>`;
      return;
    }
renderSmallCards(userId, assignments, panel);


renderLargeCards(userId, assignments, panel);

  } catch (error) {
    console.error('Error loading task assignments:', error);
    panel.innerHTML = `<div class="text-red-500 text-center py-8">Failed to load task assignments for: ${subject.name}.</div>`;
    showToast(`No task assignments found for: ${subject.name}`,  'error');
  }
}

//new function 15:00 Nov 21 2025

function renderStepCard(title, step, color, studentName = null, showCheckmark = false, stepNumber = null) {
    if (!step) return '';
  
    const name = step.step_name || 'Unnamed';
    const description = step.step_description || 'No description available';
    const externalUrl = step.external_url || null;

   
  
  const bgColor = {
      gray: 'bg-gray-50 border-gray-200',
      blue: 'bg-blue-50 border-blue-200',
      green: 'bg-green-50 border-green-200',
      red: 'bg-red-50 border-red-200'
    }[color] || 'bg-white border-gray-200';
  
    // Decide how to render the external URL
    let externalContent = '';
    if (externalUrl) {
      if (externalUrl.startsWith('<iframe')) {
        // Treat as raw iframe markup
        externalContent = `
          <div class="mt-4">
            ${externalUrl}
          </div>`;
      } else if (externalUrl.startsWith('http')) {
        // Treat as plain link
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
        <p class="text-sm text-gray-600 mt-1  whitespace-pre-line">${description}</p>
  
        ${externalContent}
  
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
  
  //NEEDS TO EXECUTE AUTOMATIONS if found on current step of the task, but is autoPetion assigned values yet? 

async function loadStepAutomations(stepId) {
console.log('loadStepAutomations for currentStep',stepId, 'autoPetiton',autoPetition); //console.log('currentStep', currentStep, 'taskName',taskName, 'stepId', stepId );
  try {console.log('caalling readTaskAssignments');
    const automations = await executeIfPermitted(subjectId, 'readTaskAutomations', {
      source_task_step_id: stepId
    });
    console.log('automations read from db:',automations, 'autoPetition:',autoPetition);
 executeAutomations(automations, subject,autoPetition);
    // renderAutomationCards(container, automations);
  } catch (error) {
    console.error('Failed to load automations:', error);
    showToast('Could not load automations', 'error');
  }
}



