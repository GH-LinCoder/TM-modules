// need to adapt - move to actual listener ??

// setupNotesListeners.js
console.log("setupNotesListeners.js");

import { reactToClearAllButton } from './reactToClearAllButton.js';
import { reactToSaveButton } from './reactToSaveNoteButton.js';
import { reactToPageButton } from './reactToPageButton.js';
import { reactToNoteClick } from './reactToNoteClick.js';

export function setupNotesListeners() {
  console.log("setupNotesListeners()");
  const notesPanel = document.getElementById('notes-panel');
  if (!notesPanel) return;

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


    // ✅ Note card click
    button = target.closest('[data-note-id]');
    if (button) {
      const noteId = button.dataset.noteId;
      await reactToNoteClick(noteId);
      return;
    }
  });
}
