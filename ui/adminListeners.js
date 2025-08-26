import { openDialogue } from '../work/task/createTask.js';
import { loadPage} from '../flexmain.js';
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

    console.log('setupAdminListeners (', action, ')');

    switch (action) {
      case 'create-task-dialogue':
    console.log('case: (', action, ')');
  loadPage('createTaskForm');      
//            openDialogue(action);
        break;

      case 'assign-task-dialogue':
        //showForm('assign-task-dialogue');
        break;

      case 'close-modal':
//        hideAllForms();
        break;

      case 'navigate':
 //       navigateTo(target.dataset.page);
        break;

      case 'sign-out':
   //     signOut();
        break;

      default:
        console.warn('Unknown action:', action);
    }
  });

}