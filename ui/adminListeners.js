import { openDialogue } from '../work/task/createTask.js';
import { togglePanel} from './reactToPageButtons.js';


import { AdvanceTaskDialog } from '../components/AdvanceTaskDialog.js';
//import { signOut } from '../auth/auth.js';

console.log('ui/adminListeners.js');


/**
 * Sets up event listeners for the admin dashboard
 * @param {Element} container - The container element
 */
export function setupAdminListeners(container) {
  // Listen for clicks on the container
   console.log('setupAdminListeners (', container, ')');//this is the entire html div being passed !
 
   container.addEventListener('click', (e) => {
   const target = e.target.closest('[data-action]');

    console.log('setupAdminListeners (', target, ')');  //
    
    if (!target) {    console.log('fails !target (', target, ')');  return;}

    console.log('after !target (', target, ')');  //
  
    const action = target.dataset.action;

    console.log('setupAdminListeners (',action,')');

    switch (action) {
      case 'create-task-dialogue':
        console.log('case: (', action, ')');
        togglePanel('createTaskForm');      
        break;

      case 'assign-task-dialogue':
        console.log('case: (', action, ')');
        togglePanel('assignTaskForm');      
        break;

        /*
      case 'move-student-dialogue':
        console.log('case: (', action, ')');
        togglePanel('moveStudentForm');      
        break;
       */

        case 'move-student-dialogue':
          console.log('case: (', action, ')');
          togglePanel('moveStudentForm');
          waitForDialogAndInit();
          break;



      case 'relate-approfile-dialogue':
        console.log('case: (', action, ')');
        togglePanel('realateApprofilesForm');      
        break;

      case 'sign-out':
   //     signOut();
        break;

      default:
        console.warn('Unknown action:', action);
    }
  });

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
