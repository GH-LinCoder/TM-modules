

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
    isImportanceEnabled: false,

    mode: 'more-clicks-more-notes',
    
    // Future
    threadsActive: false
   
};


export function collectUserChoices() {
  console.log('collectUserChoices()');

 // const importance = document.querySelector('#notes-panel input[name="importance"]:checked')?.value || null;
// failing?? The name is probably wrong for the 5 radio buttons.

const importanceElement = document.querySelector('input[name="importance"]:checked');
  // ✅ FIX 2: Add debug logs to prove exactly what the browser sees
  console.log('🔍 Importance Element Found:', importanceElement);
  
  // ✅ FIX 3: Parse as Number to match the categories array format
  const importance = importanceElement ? Number(importanceElement.value) : null;
  console.log('🔍 Importance Value:', importance);

  const importanceEnabled = document.querySelector('input[name="importanceEnabled"]:checked');
//console.log('importanceEnabled',importanceEnabled);

//  const selected = [...document.querySelectorAll('#notes-panel input[type="checkbox"]:checked')];
//changed to prevent the name of importanceEnabled being stored. Otherwise it is pronted first before the names & then the names don't allign with their tag numbers
const selected = [...document.querySelectorAll('#notes-panel input[type="checkbox"]:checked')]
    .filter(el => el.name !== 'importanceEnabled');
  

const selectedImportance = document.querySelector('#notes-panel input[name="importance"]:checked');
  const isImportanceEnabled = importanceEnabled?.checked || null;  //.value when checked was showing as "on"  .checked true or null
  const toApproId = document.querySelector('#toSelect, #respondentSelect')?.value || null;
  const fromApproId = document.querySelector('#fromSelect')?.value || null;
  const categories = selected
    .map(element => Number(element.value))
    .filter(Number.isInteger);

  const categoryNames = selected.map(element => element.dataset.value).filter(Boolean);
  if (selectedImportance) {
    const importanceId = Number(selectedImportance.value);

//    if (Number.isInteger(importanceId)) categories.push(importanceId);
if (Number.isInteger(importanceId) && isImportanceEnabled) {
      categories.push(importanceId);
    }  


// if (selectedImportance.dataset.value ) categoryNames.push(selectedImportance.dataset.value); //changed 18:57 Oct 17 2026. Only filter importance if enabled.
   console.log('isImportanceEnabled:',isImportanceEnabled);
 if (selectedImportance.dataset.value && isImportanceEnabled) categoryNames.push(selectedImportance.dataset.value);
  else console.log('should be here if not enabled');
  }
  const mode = document.querySelector('#notes-panel input[name="clickLogic"]:checked')?.value
    || 'more-clicks-more-notes';






  userChoices = {
    ...userChoices,
    toApproId,
    fromApproId,
    respondent: toApproId,
    categories,
    categoryNames,
    importance,
    isImportanceEnabled,
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



