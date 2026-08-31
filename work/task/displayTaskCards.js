// ./work/tasks/displayTaskCards.js
// New module: renders clickable task cards for myDash

import { appState } from '../../state/appState.js';
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
// Add this import
import { render as renderOneTask } from './displayOneTask.js';

//need resolve if use the function from loadMyDashWithData
import { detectMyDash,resolveSubject, myDashOrAdminDashDisplay} from '../../utils/contextSubjectHideModules.js'

// Import the shared panel tracking

console.log('displayTasksCards.js loaded');

let itemOnDisplay = null; // to be able to close the item when the button has a 2nd click

let itemCounts = {};

function clearContainer(container){//trying to empty the display area when subject changes. Failed
container.innerHTML='';
}

export async function renderCompletedAbandonedTasks(panel, petition = {}, renderType) {
console.log('displayCompletedTaskCards.render()'); // petition is empty

//console.log('renderType:',renderType);
render(panel, petition, renderType);
//need to set the param  'completed' and adjust the render to be able to handle type of render
//but error no user id - not in petition?
}



export async function render(panel, petition = {} , renderType='active') {
    //console.log('displayTasksCards.render(', panel, petition, ')');
console.log('displayTasksCards.render()');
    const userId = petition.student;
    if (!userId) {
        panel.innerHTML = `<div class="text-red-600 p-4">No user ID provided.</div>`;
        return;
    }

    // Read assignments   In loadMyDashWithData readStudentAssignments finds all the assignments and delivers them in two arrays



    let assignments = [];
    try {//console.log('render() readAssignmentTasks with student_id:',userId);
     
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
    
 

//console.log('tasksAndSurveys',tasksAndSurveys);
        assignments = tasksAndSurveys.taskData; //because readStudentAssignments returns both tasks and surveys, we need to specify which one we want. 22:36 March 13        
    } catch (err) {
        console.error('Error reading assignments:', err);
        panel.innerHTML = `<div class="text-red-600 p-4">Error loading tasks.</div>`;
        return;
    }
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

container.innerHTML=''; //FAILS - I want to clear the card area because old cards stay here even if the subject has been changed via the selection module  BUG
    //I don't think this is being called at all when the subject gets changed via the selection module. Profile changes.
assignments.forEach(task => {
    //    console.log('task', task, 'task.assignment_id',task.assignment_id);//task.assignment_id 
         const card = document.createElement('div');

         // removed // 'bg-blue-50 border border-blue-200 rounded-lg p-3 cursor-pointer ' +
  card.className =   
    activeColors +
    'hover:shadow-md flex justify-between items-center';

  card.dataset.action = 'display-one-task'; //this needs to be listed in the registryLoadModule.
  card.dataset.entityType = 'task';
  card.dataset.assignmentId = task.assignment_id;   // Use assignment_id
  //card.dataset.module = 'displayTaskCard'; //The module is already defined in the myDash HTML as:  data-module="myDash"
  //card.dataset.section = 'task-card'; //the section is already defined in the myDash HTML as: data-section = "tasks-section"
  card.dataset.destination = 'display-area';
//To properly display this student's task we need task.assignmentId. Otherwise the display woulnd't know which step the student is on, and would not be able to write back to the db if the student changes the step
  //card.dataset.studentId = 'studentId';
//console.log('petion',appState.query.petitioner);

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


card.addEventListener('click', (e) => { // why are we using a bespoke method instead of the standard module loading?
//this breaks the convention that a 2nd click closes the module
//I see no justification for breaking the convention here.
//the relevant data inside the card should be enough to inform the displayOneCTask what to display and how to handle it.
//This breach of convention is cause by ai genertaing code without context
//the card html needs the relevant 
// data-action and destination.
//  the assignmentId: assignmentId, entityType: 'task',

//  Then the displayTaskCards can ignore the click. It will propagte and be handled normally

    e.stopPropagation(); // prevents bubbling duplication
    
    const assignmentId = e.currentTarget.dataset.assignmentId;
   // console.log('🖱️ Card clicked, loading directly:', assignmentId, 'full data',e.currentTarget.dataset);
  
//data-anchor="detail-placeholder"

    // ✅ Find the detail panel target
    const detailPanel = document.querySelector('[data-section="display-area"]');
    if (!detailPanel) {
        console.error('Detail panel not found');
        return;
    }

    // new 17:30 March 29 toggle to mimic the behaviour of the pertition system. 2nd click closes the item.
        if (itemOnDisplay === assignmentId){detailPanel.innerHTML =''; itemOnDisplay = null; return;} // toggle close if same card clicked again. Mimics the normal petition flexmain method
    itemOnDisplay = assignmentId; // set the currently displayed item
//the close should remove listeners in the module that is being closed, but that can't be done here.

// Toggle logic: if open, close; if closed, open (Mimics the normal petition flexmain method)

    // ✅ Find the detail anchor used just for scrolling to the top of the display area. This is needed because the display area is dynamically injected with content, and scrolling to the display area itself may not work consistently across browsers.
    const detailAnchor = document.querySelector('[data-anchor="detail-placeholder"]');
    if (!detailAnchor) {
        console.error('Detail anchor not found');
        return;
    }


// Fails on Chrome when this anchor is next to the div that gets injected. May be better not to try. Complicated by embedded YouTube video 11:02 Aug 13 2026
detailAnchor.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

    
    // Call the render function directly with a custom query object
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
//scroll to displayArea  10:00 April 10





}
