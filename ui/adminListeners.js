//import { openDialogue } from '../work/task/createTask.js';

//import { togglePanel} from './reactToPageButtons.js';

//import { query } from '../flexmain.js';
import {renderPanel} from '../flexmain.js';

// In adminListeners.js
import { appState } from '../state/appState.js';

//import { AdvanceTaskDialog } from '../components/AdvanceTaskDialog.js';
//import { signOut } from '../auth/auth.js';

console.log('ui/adminListeners.js');


function handleCardClick(action, stubName) {
  // Just update state - don't call renderPanel directly
  console.log('handleCardClick (',action,', ', stubName, ')');
  appState.setQuery({ 
    stubName: stubName,
//    READ_request: true,
    callerContext: action//putting 'create-task-dialogue' or 'assign-task-dialogue' etc in the object that triggers event in other modules
  });
}


/**
 * Sets up event listeners for the admin dashboard
 * @param {Element} container - The container element
 */
export function adminListeners(container) {
  // Listen for clicks on the container
   console.log('adminListeners (', container, ')');//this is the entire html div being passed !
 
   container.addEventListener('click', (e) => {
   const target = e.target.closest('[data-action]');

    console.log('adminListeners (', target, ')');  //
    
    if (!target) {    console.log('fails !target (', target, ')');  return;}

//    console.log('after !target (', target, ')');  //
  
    const action = target.dataset.action;

    console.log('adminListeners (',action,')');
///////////////////////////////////////////////////////  Switch Action  ///////////////////////////////////////////////////////
    switch (action) {
      case 'create-task-dialogue':
        console.log('case: (', action, ')');
//        query.stubName = ('createTaskForm.html');   
//        renderPanel(query);   
        handleCardClick(action, 'createTaskForm.html');

      break;

      case 'assign-task-dialogue':
        console.log('case: (', action, ')');
//               query.stubName ='assignTaskForm.html';      
//               renderPanel(query);
        handleCardClick(action,'assignTaskForm.html');
      break;


        case 'move-student-dialogue':
          console.log('case: (', action, ')');
//          query.stubName ='moveStudentForm.html';
//          renderPanel(query);   

         handleCardClick(action, 'moveStudentForm.html');
       //  waitForDialogAndInit();
        break;



      case 'relate-approfile-dialogue':
        console.log('case: (', action, ')');
//        query.stubName ='relateApprofilesForm.html';      
//        renderPanel(query);  
        handleCardClick(action, 'relateApprofilesForm.html');
      break;

      case 'sign-out':
        signOut();






        break;

      default:
        console.warn('Unknown action:', action);
    }
  });

}

// === ADMIN LISTENERS ===
function signOut() {
  console.log('signOut()');

  // Implement sign-out logic here
  //signOutUser(); // Example function to sign out user
//  window.location.href = '/login'; // Redirect to login page after sign-out ?
  
} 

function waitForDialogAndInit() {  // for the advance student Class 
console.log('waitForDialogAndInit()');

  // Use MutationObserver to watch for the dialog element
  const observer = new MutationObserver((mutations, obs) => {
    const dialogEl = document.getElementById('advanceTaskDialog');
    if (dialogEl) {
      obs.disconnect(); // Stop observing once found

      const dialog = new AdvanceTaskDialog({
        onAdvance: () => {
          console.log('Advance confirmed');
          updateTaskSteps('advance'); //<<<<<<<<<<<<<<<<<<<<need to code this
        },
        onReverse: () => {
          console.log('Advance reversed');
          updateTaskSteps('reverse');  //<<<<<<<<<<<<<<<<<<<<need to code this
        },
        onClose: () => {
          console.log('Dialog closed');
        },
        onAction: (action) => {
          console.log(`Action triggered: ${action}`);
        }
      });

      dialog.show(); // Optional: show the dialog immediately  ???????????
    }
  });

  observer.observe(document.getElementById('main-container'), {
    childList: true,
    subtree: true
  });
}

function updateTaskSteps(actionType) {
  // Fill in your DB logic here
  console.log(`Updating (needed) task steps for: ${actionType}`);
}
