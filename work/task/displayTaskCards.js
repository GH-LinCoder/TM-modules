// ./work/tasks/displayTaskCards.js
// Renders clickable task cards for myDash

import { appState } from '../../state/appState.js';
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
//need resolve if use the function from loadMyDashWithData
import {resolveSubject} from '../../utils/resolveSubjectPlus2.js'

// Import the shared panel tracking

console.log('displayTasksCards.js loaded');


let itemCounts = {};

export async function renderCompletedAbandonedTasks(panel, petition = {},controller, renderType) { //21:10 Sept 3: needs new argument userRole = 'student'
console.log('displayCompletedTaskCards.render()'); // petition is empty

console.log('renderType:',renderType);
render(panel, petition,controller, renderType);
//need to set the param  'completed' and adjust the render to be able to handle type of render
//but error no user id - not in petition?

}


export async function render(panel, petition = {} , controller, renderType='active') { //normal entry point
    //console.log('displayTasksCards.render(', panel, petition, ')');
console.log('displayTasksCards.render()');
    const userId = petition.studentId;
    if (!userId) {
        panel.innerHTML = `<div class="text-red-600 p-4">No user ID provided. Please login.</div>`;
        return;
    }
    // Read assignments   In loadMyDashWithData readStudentAssignments finds all the assignments and delivers them in two arrays
    let assignments = [];
    try {console.log('render() readAssignmentTasks with student_id:',userId);
     
//changing the function called. The old one fails on a new user. I don't know why. It works for old Lin Coder
//the new one works within the other file loadMyDashWithData even with the new user
//so trying it here to see if it works. But return is different.
//needs subject
const subject = await resolveSubject();
panel.innerHTML = '<div class="p-4 text-gray-600 flex items-center gap-2"><span class="animate-spin">⏳</span> Loading...</div>';
console.log('subject',subject);
//21:10 Sept 3: This is for userRole = 'student'  There will also be userRole = 'manager' which needs a different search of db - see the file moveStudentManager.js
const tasksAndSurveys = await executeIfPermitted(
                subject.id, 
                'readStudentAssignments', 
                { student_id: subject.approUserId, type: subject.type } //if send type 'app-human' the registry will not look for assignments !! 22:36 March 13  WHY?
            );    
    
 //21:10 Sept 3: else... userRole = 'manager'

//console.log('tasksAndSurveys',tasksAndSurveys);
        assignments = tasksAndSurveys.taskData; //because readStudentAssignments returns both tasks and surveys, we need to specify which one we want. 22:36 March 13        
    } catch (err) {
        console.error('Error reading assignments:', err);
        panel.innerHTML = `<div class="text-red-600 p-4">Error loading tasks.</div>`;
        return;
    }

    //21:10 Sept 3: this section is only for students we will not be displaying completed abandoned or deleted assignments
//console.log('assignments',assignments);
//need to filter active completed abandonded onlyshow relevant group
//assignments.forEach(task => {
  let activeColors = 'bg-blue-50 border border-blue-200 rounded-l-2xl p-3 cursor-pointer '; 
  let displayNumberEl = null;
switch(renderType)
{
  case 'completed':
    // code block  // if there is a completed_at 
    assignments = assignments.filter(item => item.completed_at !== null);
    itemCounts.completed = assignments.length;
    activeColors = 'bg-green-200 border border-green-400 rounded-lg p-3 cursor-pointer ';
    displayNumberEl = document.querySelector('[data-value="completed-tasks"]');
    displayNumberEl.textContent = itemCounts.completed; 
    break;
  case 'abandoned':
    // code block //if there is an abandoned_at
    assignments = assignments.filter(item => item.abandoned_at !== null);
    itemCounts.abandoned = assignments.length;
    activeColors = 'bg-red-100 border border-red-400 rounded-lg p-3 cursor-pointer '; 
    displayNumberEl = document.querySelector('[data-value="abandoned-tasks"]');
    displayNumberEl.textContent = itemCounts.abandoned; 
   
    break;
  default:
    // active code block
    assignments = assignments.filter(item => item.completed_at === null && item.abandoned_at === null && item.is_deleted ===null);}
    itemCounts.active = assignments.length;
     //keep default values for active colors 
//}); // end of forEach


//21:10 Sept 3: this may be relevant to 'manager'
    //console.log('assignments', assignments, 'assignments.length',assignments.length); // okay - we have assignment_id at this line
    if (!assignments || assignments.length === 0) {
        panel.innerHTML = `
            <div class="text-gray-500 text-center py-8">
                No ${renderType} task assignments found
            </div>`;
        return;
    }

    // Render cards
    panel.innerHTML = `
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-3" data-list="my-tasks-abbrev"></div>
    `;

    const container = panel.querySelector('[data-list="my-tasks-abbrev"]');

container.innerHTML=''; 

assignments.forEach(task => {
    //    console.log('task', task, 'task.assignment_id',task.assignment_id);//task.assignment_id 
         const card = document.createElement('div');

         // removed // 'bg-blue-50 border border-blue-200 rounded-lg p-3 cursor-pointer ' +
  card.className = activeColors +'hover:shadow-md hover:bg-blue-200 flex justify-between items-center';
//21:10 Sept 3: the dataset.action is different for 'manager' where it calls the kanban style display module not the student displayOneTask module
  card.dataset.action = 'display-one-task'; //this needs to be listed in the registryLoadModule.
  card.dataset.entityType = 'task';
  card.dataset.assignmentId = task.assignment_id;   // Use assignment_id
  card.dataset.destination = 'display-area';

  card.innerHTML = `
    <div>
      <h4 class="text-sm font-semibold text-blue-800">${task.task_name}</h4>
      <p class="text-xs text-gray-600">
        Step ${task.current_step} ${task.step_name ? `— ${task.step_name}` : ''}
      </p>
    </div>
    <span class="text-blue-500 text-lg">›</span>
  `;

///* this module used to use petition, but that wasa mistake. 2nd click closes panel
 card.addEventListener('click', () => {
    appState.displaySurveysTasks.assignmentId = task.assignment_id
  });
        container.appendChild(card);
    });
//scroll to displayArea  10:00 April 10
}
