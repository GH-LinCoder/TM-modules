// need to adapt - move to actual listener ??

// setupNotesListeners.js
console.log("setupNotesListeners.js loaded");

import { reactToClearAllButton } from './reactToClearAllButton.js';
import { reactToSaveButton } from './reactToSaveButton.js';
import { reactToPageButton } from './reactToPageButton.js';
import { reactToStatusClick, reactToNoteClick } from './reactToNoteClick.js';

export function setupNotesListeners() {
  console.log("setupNotesListeners()");
  const notesPanel = document.getElementById('notes-panel');
  if (!notesPanel) return;

/*
  console.log("Listner panel:",notesPanel)
  notesPanel.addEventListener('click', async (event) => {
    console.log("🖱️ Click detected in notes-panel");
    const target = event.target;

  });  //overall test if listner attached
*/


  notesPanel.addEventListener('click', async (event) => {
    const target = event.target;
    let button;

    // ✅ Clear All button
    button = target.closest('[data-action="clear-all"]');
    if (button) {
      event.preventDefault();
      await reactToClearAllButton();
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
