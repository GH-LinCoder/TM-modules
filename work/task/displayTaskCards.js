// ./work/tasks/displayTaskCards.js
// New module: renders clickable task cards for myDash

import { appState } from '../../state/appState.js';
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
// Add this import
import { render as renderOneTask } from './displayOneTask.js';

//need resolve if use the function from loadMyDashWithData
import { detectMyDash,resolveSubject, myDashOrAdminDashDisplay} from '../../utils/contextSubjectHideModules.js'

console.log('displayTasksCards.js loaded');

function clearContainer(container){//trying to empty the display area when subject changes. Failed
container.innerHTML='';
}


export async function render(panel, petition = {}) {
    console.log('displayTasksCards.render(', panel, petition, ')');

    const userId = petition.student;
    if (!userId) {
        panel.innerHTML = `<div class="text-red-600 p-4">No user ID provided.</div>`;
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

const tasksAndSurveys = await executeIfPermitted(
                subject.id, 
                'readStudentAssignments', 
                { student_id: subject.approUserId, type: subject.type } //if send type 'app-human' the registry will not look for assignments !! 22:36 March 13  WHY?
            );    
    
        /* 
        assignments = await executeIfPermitted(
            userId,
            'readAssignmentsTasks',
            { student_id: userId }
        );
    */

console.log('tasksAndSurveys',tasksAndSurveys);
        assignments = tasksAndSurveys.taskData; //because readStudentAssignments returns both tasks and surveys, we need to specify which one we want. 22:36 March 13    
    
    } catch (err) {
        console.error('Error reading assignments:', err);
        panel.innerHTML = `<div class="text-red-600 p-4">Error loading tasks.</div>`;
        return;
    }
console.log('assignments', assignments, 'assignments.length',assignments.length); // okay - we have assignment_id at this line
    if (!assignments || assignments.length === 0) {
        panel.innerHTML = `
            <div class="text-gray-500 text-center py-8">
                No task assignments found.
            </div>`;
        return;
    }

    // Render cards
    panel.innerHTML = `
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-3" data-list="my-tasks-abbrev"></div>
    `;

    const container = panel.querySelector('[data-list="my-tasks-abbrev"]');

container.innerHTML=''; //FAILS - I want to clear the card area because old cards stay here even if the subject has been changed via the selection module  BUG
    //I don't think this is being called at all when the subject gets changed via the selection module. Profile changes.
assignments.forEach(task => {
        console.log('task', task, 'task.assignment_id',task.assignment_id);//task.assignment_id 
         const card = document.createElement('div');

  card.className =
    'bg-blue-50 border border-blue-200 rounded-lg p-3 cursor-pointer ' +
    'hover:shadow-md flex justify-between items-center';

  card.dataset.action = 'display-one-task'; //this needs to be listed in the registryLoadModule.
  card.dataset.entityType = 'task';
  card.dataset.assignmentId = task.assignment_id;   // Use assignment_id
  //card.dataset.module = 'displayTaskCard'; //The module is already defined in the myDash HTML as:  data-module="myDash"
  //card.dataset.section = 'task-card'; //the section is already defined in the myDash HTML as: data-section = "tasks-section"
  card.dataset.destination = 'display-area';
//To properly display this student's task we need task.assignmentId. Otherwise the display woulnd't know which step the student is on, and would not be able to write back to the db if the student changes the step
  
card.innerHTML = `
    <div>
      <h4 class="text-sm font-semibold text-blue-800">${task.task_name}</h4>
      <p class="text-xs text-gray-600">
        Step ${task.current_step}
        ${task.step_name ? `— ${task.step_name}` : ''}
      </p>
    </div>
    <span class="text-blue-500 text-lg">›</span>
  `;


card.addEventListener('click', (e) => {
    e.stopPropagation(); // Keep this — prevents bubbling duplication
    
    const assignmentId = e.currentTarget.dataset.assignmentId;
    console.log('🖱️ Card clicked, loading directly:', assignmentId);
    
    // ✅ Find the detail panel target
    const detailPanel = document.querySelector('[data-section="display-area"]');
    if (!detailPanel) {
        console.error('Detail panel not found');
        return;
    }
    
    // ✅ Call the render function directly with a custom query object
    renderOneTask(detailPanel, {
        assignmentId: assignmentId,
        entityType: 'task',
        // Pass any other context the render function needs
        student: petition.student // if needed
    });
});

/* this module used to use petition, but that wasa mistake. 2nd click closes panel
  card.addEventListener('click', () => {
        const assignmentId = event.currentTarget.dataset.assignmentId;
    console.log('assignment_id', assignmentId),
    appState.setQuery({
      petitioner: {
        Module: 'myDash',
        Section: 'tasks',
        Action: 'display-one-task',
        Destination: 'display-area',
        entityType: 'task',
        assignmentId: assignmentId
      }
    });
  }); */ 

        container.appendChild(card);
    });
}
