//changePage.js
//response to click on the [older] or [Newer] page buttons on the rendered list of published notes. Calls for the next page of notes to be rendered
console.log('ui/reactToPageButton.js');

import { displayNotes } from './displayNotes.js';

// reactToPage.js
export async function reactToPageButton(direction) {
  // Find the button (it exists → it was rendered → action is valid)
  const btn = document.querySelector(`[data-page-action="${direction}"]`);
  if (!btn) return; // Should not happen, but safe

  const currentPage = parseInt(btn.dataset.currentPage) || 1;

  // Calculate new page
  let newPage;
  /*if (direction === 'older') {
    newPage = currentPage + 1; // Safe: button exists → currentPage < totalPages
  } else if (direction === 'newer') {
    newPage = currentPage - 1; // Safe: button exists → currentPage > 1
  } else {
    return;
  } */

switch (direction) {
  case 'newer': newPage = currentPage - 1; break;
  case 'newer10': newPage = currentPage - 10; break;
  case 'older': newPage = currentPage + 1; break;
  case 'older10':newPage = currentPage + 10; break;
  default: return;
  } // 14:40 March 19 This causea problem when > totalPages - the display tries page 35 of 0 and doesn't disbale the buttons



console.log('newPage:', newPage, ' currentPge:', currentPage);
  
  // Trigger display — which will fetch and re-render
  await displayNotes(newPage);
  // renderNotes() will update buttons based on new state
}
