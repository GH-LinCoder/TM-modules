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
  if (direction === 'older') {
    newPage = currentPage + 1; // Safe: button exists → currentPage < totalPages
  } else if (direction === 'newer') {
    newPage = currentPage - 1; // Safe: button exists → currentPage > 1
  } else {
    return;
  }

console.log('newPage:', newPage, ' currentPge:', currentPage);
  
  // Trigger display — which will fetch and re-render
  await displayNotes(newPage);
  // renderNotes() will update buttons based on new state
}




/*
// Updated changePage.js
// changePage.js
console.log('changePage.js');

import { displayNotes } from './displayNotes.js';

export function changePage(currentPage, totalCount, direction) {
  console.log('changePage called:', { currentPage, totalCount, direction });
  
  const pageSize = 10;
  const totalPages = Math.ceil(totalCount / pageSize);
  let newPage = currentPage;
  
  if (direction === 'older') {
    newPage = currentPage - 1;
    if (newPage < 1) newPage = 1;
  } else if (direction === 'newer') {
    newPage = currentPage + 1;
    if (newPage > totalPages) newPage = totalPages;
  }
  
  if (newPage !== currentPage) {
    console.log('Loading page:', newPage);
    displayNotes(newPage, totalCount);
  }
}
*/
// Make the function available globally for onclick handlers
//window.changePage = changePage;
