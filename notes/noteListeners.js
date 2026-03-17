// need to adapt - move to actual listener ??

// setupNotesListeners.js
console.log("setupNotesListeners.js loaded");

import { reactToClearAllButton } from './reactToClearAllButton.js';
import { reactToSaveButton } from './reactToSaveButton.js';
import { reactToPageButton } from './reactToPageButton.js';
import { reactToStatusClick, reactToNoteClick } from './reactToNoteClick.js';
//import { collectUserChoices, messageAddress, clickLogic } from './collectUserChoices.js';
import { reRenderNotes} from './displayNotes.js';
import { collectUserChoices, messageAddress, clickLogic, userChoices } from './collectUserChoices.js';
/**
userChoices = { //amended 12:22 March 16 2026
    userId: null,
    dropdown: null, 
    // Address filtering
    address: 'self',
    addressFilterActive: true,  // ✅ NEW - toggle state
    
    // Category filtering
    categories: [],
    categoryFilterActive: true,  // ✅ NEW - toggle state
    
    importance: null,
    mode: 'more-clicks-more-notes',
    
    // Future
    threadsActive: false
 */  
function highlight(cardClicked){
  console.log('highlight()', cardClicked, 'dataset',cardClicked.dataset);
  document.querySelectorAll(`[data-note-id]`).forEach(el => {
   // console.log('el:',el, 'cardClicked', cardClicked);
    el.classList.toggle('ring-4', el === cardClicked);
    el.classList.toggle('ring-blue-500', el === cardClicked);
    el.classList.toggle('bg-blue-100', el === cardClicked);
  });
} 

export function setupNotesListeners() {
  console.log("setupNotesListeners()");
  const notesPanel = document.getElementById('notes-panel');
  if (!notesPanel) return;


// NEW: Filtering listener for checkboxes and radios 14:20 March 15
document.querySelector('#notes-panel').addEventListener('change', (event) => {
    const el = event.target;

    // Only react to checkboxes and radios for now
    if (el.type !== 'checkbox' && el.type !== 'radio') return;
console.log('input box changed');
    // Update global state
//    userChoices = collectUserChoices();  NOT ALLOWED

collectUserChoices(); //this also updates the global userChoices


console.log('userChoices (raw array):', userChoices);

    // Re-render based on new state
   reRenderNotes();  // needs to send: notes, totalCount, page, pageSize but doesn't have these.
});


  notesPanel.addEventListener('click', async (event) => {
    const target = event.target;
    let button;

    // 
    button = target.closest('[data-action="moreClicksMoreNotes"]');
    if (button) {
      event.preventDefault();
      console.log('moreNotes -need code function');
    //highlight(button);
      return;
    }

    // ✅ Save button
    button = target.closest('[data-action="save-note"]');
    if (button) {
      event.preventDefault();
      await reactToSaveButton();
      return;
    }


    // ✅ Pagination: Older / Newer
    button = target.closest('[data-page-action]');
    if (button) {
      event.preventDefault();
      const direction = button.dataset.pageAction;
      await reactToPageButton(direction);
      return;
    }

    // ✅ Note card click  on narrow change-status div
    button = target.closest('[data-action="change-status"]');
    if (button) {  //this fails 14:28 Dec 25
      const noteId = button.dataset.noteId;
      await reactToStatusClick(noteId);
      return;
    } //this listener reacts when we want the below to react then the below reacts


// ✅ Note card click
    button = target.closest('[data-note-id]');
    if (button) {
      const noteId = button.dataset.noteId;
      await reactToNoteClick(noteId);
      return;
    }





  });
}