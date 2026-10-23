// ./ui/buildPetitionListener.js
//Listen for clicks - build petition of what should be loaded. Place that in the global appState

// listen for clicks. Read data-* to build a 'petition' of what is being requested to be loaded. 
// store that petiotion in the global  'appState'

import { appState } from '../state/appState.js';

console.log('buildPetitionListener.js   loaded');

// Reads the information from the clicked element, its section and the full page
// so that we know which module (page), which section of that module and the specific action that has been clicked
//All of this is called the 'petition' and it will be stored in appState.query.petitioner{}
function readPetition(e){
//console.log('readPetition DOM element (', e, ')');  //

  const actionEl = e.target.closest('[data-action]');
    if (!actionEl) {    console.log('fails action (', actionEl, ')');  return;}
    const action = actionEl.dataset.action;

  const sectionEl = e.target.closest('[data-section]');
    if (!sectionEl) {    console.log('fails section (', sectionEl, ')');  return;}
    const section = sectionEl.dataset.section;

  const moduleEl = e.target.closest('[data-module]');
    if (!moduleEl) {    console.log('fails module (', moduleEl, ')');  return;}
    const module = moduleEl.dataset.module;

  const destinationEl = e.target.closest('[data-destination]');
    if (!destinationEl) {    console.log('fails destination (', destinationEl, ')');  return;}
    const destination = destinationEl.dataset.destination;
//13:32 10 sept  destination showing wrong address. It is showing destination = action, but should be =section

//    console.log('readPetition(','= Module:',module,' Section:', section,' Action:', action,' Destination:', destination,')');
    const petition = {'Module':module,'Section': section,'Action': action, 'Destination':destination};
    console.log('BuildpetitionListener: (', petition, ')');
return petition;
}


/**
 * Sets up event listeners for the admin dashboard
 * @param {Element} container - The container element of the admin dashboard
 */
export function buildPetitionListener(container) {
  // Guard so we only attach once per page load
  if (container.__buildPetitionListenerAttached) return;
  container.__buildPetitionListenerAttached = true;

  container.addEventListener('click', (e) => {

// Check if click is on or inside a form element
if (e.target.closest('select, input, textarea')) {
  console.log('buildPetitionListener: native form element clicked, skipping admin logic');
  return;
}

    const petition = readPetition(e);
   // console.log('petition (', petition, ')');
    if (!petition) {
      console.log('No petition found, exiting listener');
      return;
    }
    appState.setPetitioner(petition);
  });
}