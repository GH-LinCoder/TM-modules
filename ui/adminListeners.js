// ./ui/adminListeners.js
console.log('Imported: ui/adminListeners.js');

import { appState } from '../state/appState.js';


function handleCardClick(action, moduleName) {
  // Just update state - don't call renderPanel directly
  console.log('handleCardClick action:(',action,', name:', moduleName, ')');

/*the panel may already have been closed by the event listener in flexmain.js, 
  but adminListeners.js does not know that & will react to the same click & reopen the module
  therefore to prevent that we can check if the module name is in the query. It would only be there
  if the app had already been asked to load that module
*/

 //if query{} already has the name of the current panel open, do not open again
   const isAlreadyOpen = moduleName===appState.query.petitioner.Module; // 
 
  if (isAlreadyOpen) {
    console.log('Panel already open:', moduleName);
    return; // Prevent opening the same panel multiple times // fails, panel already been closed
  } 
  
 
}

// Reads the information from the clicked element, its section and the full page
// so that we know which module (page), which section of that module and the specific action that has been clicked
//All of this is called the 'petition' and it will be stored in appState.query.petitioner{}
function readPetition(e){
  console.log('readPetition (', e, ')');  //

  const actionEl = e.target.closest('[data-action]');
    if (!actionEl) {    console.log('fails !target (', actionEl, ')');  return;}
    const action = actionEl.dataset.action;

  const sectionEl = e.target.closest('[data-section]');
    if (!sectionEl) {    console.log('fails !target (', sectionEl, ')');  return;}
    const section = sectionEl.dataset.section;

  const moduleEl = e.target.closest('[data-module]');
    if (!moduleEl) {    console.log('fails !target (', moduleEl, ')');  return;}
    const module = moduleEl.dataset.module;

  const destinationEl = e.target.closest('[data-destination]');
    if (!destinationEl) {    console.log('fails !target (', actionEl, ')');  return;}
    const destination = destinationEl.dataset.destination;
//13:32 10 sept  destination showing wrong address. It is showing destination = action, but should be =section

    console.log('readPetition(','= Module:',module,' Section:', section,' Action:', action,' Destination:', destination,')');
    const petition = {'Module':module,'Section': section,'Action': action, 'Destination':destination};
    //console.log('petition (', petition, ')');
return petition;
}




/**
 * Sets up event listeners for the admin dashboard
 * @param {Element} container - The container element of the admin dashboard
 */
export function adminListeners(container) {
  // Listen for clicks on the container
   console.log('adminListeners add Listeners or respond');//this is the entire html div being passed !
 
   container.addEventListener('click', (e) => {

   const petition  = readPetition(e); // Finds the module, section & action to be loaded in query{} 
   console.log('petition (', petition, ')');
    if (!petition) { console.log('No petition found, exiting listener'); return; } // Exit if no valid petition
   appState.setPetitioner(petition); // petitioner is a part of appState.query{}

   const action = petition.Action;
   console.log('adminListeners (',action,')');
///////////////////////////////////////////////////////  Switch Action  (legacy) ///////////////////////////////////////////////////////
    switch (action) {
      case 'create-task-dialogue':
        console.log('case: (', action, ') changing name to createTaskForm.html Then call handleCardClick()');
        handleCardClick(action, 'createTaskForm.html');//redundant ?
        break;

      case 'assign-task-dialogue':
        console.log('case: (', action, ') changing name to asignTaskForm.html Then call handleCardClick()');
        handleCardClick(action,'assignTaskForm.html');
        break;


        case 'move-student-dialogue':
          console.log('case: (', action, ')changing name to moveStudentForm.html Then call handleCardClick()');
         handleCardClick(action, 'moveStudentForm.html');
        break;



      case 'relate-approfiles-dialogue':
        console.log('case: (', action, ') changing name to relateApprofilesForm.html Then call handleCardClick()');
        handleCardClick(action, 'relateApprofilesForm.html');
        break;

      case 'sign-out':
        signOut();
        break;

      default:
        handleCardClick(action, action );
//        console.warn('Unknown action:', action);
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
