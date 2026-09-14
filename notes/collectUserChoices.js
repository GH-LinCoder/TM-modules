

export let userChoices = { //amended 12:22 March 16 2026
    userId: null,
  toApproId: null,
  fromApproId: null,
  respondent: null, // Legacy alias for toApproId
  // Address filtering (legacy compatibility)
    address: 'self',
    addressFilterActive: true,  // ✅ NEW - toggle state
    
    // Category filtering
    categories: [],
    categoryFilterActive: true,  // ✅ NEW - toggle state
    categoryNames: [],

    importance: null,
    mode: 'more-clicks-more-notes',
    
    // Future
    threadsActive: false
   
};


export function collectUserChoices() {
  console.log('collectUserChoices()');
  const selected = [...document.querySelectorAll('#notes-panel input[type="checkbox"]:checked')];
  const toApproId = document.querySelector('#toSelect')?.value || null;
  const fromApproId = document.querySelector('#fromSelect')?.value || null;
  const categories = selected
    .map(element => Number(element.value))
    .filter(Number.isInteger);
  const categoryNames = selected.map(element => element.dataset.value).filter(Boolean);
  const mode = document.querySelector('#notes-panel input[name="clickLogic"]:checked')?.value
    || 'more-clicks-more-notes';
  const importance = document.querySelector('#notes-panel input[name="importance"]:checked')?.value || null;

  userChoices = {
    ...userChoices,
    toApproId,
    fromApproId,
    respondent: toApproId,
    categories,
    categoryNames,
    importance,
    mode,
    address: 'self'
  };

  audience = toApproId;
  clickLogic = mode;
  return userChoices;
}


// collectUserChoices.js
console.log("collectUserChoices.js");
/**
 * Reads the current notes controls and returns one state snapshot.
 * This is a passive function — no event listeners, just a snapshot of current state.
 */

export let messageAddress = 'self'; // Legacy compatibility for note-click code.
export let clickLogic = null;
export let audience = null;



