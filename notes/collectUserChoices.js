

export let userChoices = { //amended 12:22 March 16 2026
    userId: null,
    respondent: null, //chaned from dropdown  19:30 March 25
    // Address filtering
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

/**
userChoices = { //amended 12:22 March 16 2026
    userId: null,
    dropdown: null, <---- respondent
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



async function storeChoices() {
console.log('userChoices',userChoices);



  const respondentSelect = document.querySelector('#respondentSelect');
  if(respondentSelect){ console.log('respondentSelect', respondentSelect);
    const respondent = respondentSelect.value;
console.log('respondent', respondent);  // empty string 19:30 March 25

    userChoices.respondent = respondent;
  };

const selected = [...document.querySelectorAll('#notes-panel input[type=checkbox]:checked')];

userChoices.categories = selected
    .map(el => parseInt(el.value, 10))
    .filter(id => !isNaN(id));

userChoices.categoryNames = selected
    .map(el => el.dataset.value);


/*
    userChoices.categories = [...document.querySelectorAll('#notes-panel input[type=checkbox]:checked')]
           .map(el => {
        const rawValue = el.value;  // Checkboxes deliver a string, e.g., "34" 
        const parsed = parseInt(rawValue, 10);  // Convert to integer
        
        // Debug: log any parsing failures
        if (isNaN(parsed)) {
            console.warn('⚠️ Failed to parse category value:', {
                rawValue,
                elementId: el.id,
                elementName: el.name
            });
        }
        
        return parsed;
    })
    .filter(id => !isNaN(id));  // Remove any NaN values
  */  

// ✅ Add this diagnostic log right after:
//console.log('✅ Parsed categories:', userChoices.categories, 'types:', userChoices.categories.map(c => typeof c));

    userChoices.importance = document.querySelector('#notes-panel input[name=importance]:checked')?.value || null;

    userChoices.mode = document.querySelector('#notes-panel input[name=clickLogic]:checked')?.value || 'more-clicks-more-notes';

    console.log('userChoices after storeChoices',userChoices); //okay 20:20
}


//original function

export function collectUserChoices() {
  console.log('collectUserChoices()');
  const tagsArray = [];
  const tagsNameArray = [];
  // Handle checkboxes
  for (const group of checkboxGroups) { // is this duplicated in storeChoices ???
    const checkboxes = document.querySelectorAll(`input[name="${group}"][type="checkbox"]`);
    for (const checkbox of checkboxes) {
      if (checkbox.checked) { console.log('checkedTag:',checkbox.value);
        
        tagsArray.push(checkbox.value);
        tagsNameArray.push(checkbox.dataset.value);
      }
    }
  }

  // Handle importance & message buttons
  for (const group of radioGroups) {
    const selected = document.querySelector(`input[name="${group}"][type="radio"]:checked`);
    if (selected) { //console.log('checkedRadio:',selected.value);
      tagsArray.push(selected.value); //why??

if(group == 'message-mode' ) {messageAddress = selected.value; 
    userChoices.address = messageAddress;
    
    console.log('Collect: messageAddress', messageAddress, userChoices.address);}

if(group == 'clickLogic' ) { clickLogic = selected.value;  console.log('Collect: clickLogic', selected.value);}

    }
  }

audience = document.getElementById('respondentSelect').value;
if(audience=='') audience=null; //sending empty string to the database will be seen as a bad uuid. The column accepts null but not '' 
  console.log('OLD Tags collected:', tagsArray, 'audience',audience);


    // ✅ Audience dropdown (for "to" / "from" modes)
    const audienceSelect = document.getElementById('respondentSelect');
//console.log('audienceSelect', audienceSelect);
    const audienceId = audienceSelect?.value ? parseInt(audienceSelect.value, 10) : null;
//console.log('audienceId', audienceId);
    // ✅ Importance (optional)
    const importance = document.querySelector('input[name="importance"]:checked')?.value;
//console.log('importance', importance);    

storeChoices();


// I don't know what needs to be collected or in what format for filtering the display.
  return tagsArray;
}







// In collectUserChoices.js (or inline in displayNotes.js)
//new 12:00 March 15 2026 - as move towards filtering output
export function XcollectUserChoices() {
    console.log('collectUserChoices()');
    // ✅ Tags: collect category IDs as integers
    const categoryIds = Array.from(document.querySelectorAll('input[name="tags"]:checked'))
        .map(cb => parseInt(cb.value, 10));
    
    // ✅ Logic: OR/AND
    const matchLogic = document.querySelector('input[name="clickLogic"]:checked')?.value || 'OR';
    
    // ✅ Message mode
    const address = document.querySelector('input[name="message-mode"]:checked')?.value || 'self';
    
    // ✅ Audience dropdown (for "to" / "from" modes)
    const audienceSelect = document.getElementById('respondentSelect');
    const audienceId = audienceSelect?.value ? parseInt(audienceSelect.value, 10) : null;
    
    // ✅ Importance (optional)
    const importance = document.querySelector('input[name="importance"]:checked')?.value;
    
console.log('tags', categoryIds,'more/less',matchLogic,'who to',address, 'audience',audienceId, 'importance',importance);

    return {
        categoryIds,      // [1, 2, 5] - integers for filtering  empty??
        matchLogic,       // 'OR' or 'AND'
        address,          // 'self', 'to', 'from', 'reply'
        audienceId,       // UUID integer or null
        importance        // 'importance-3' or null
    };
}

// collectUserChoices.js
console.log("collectUserChoices.js");
const checkboxGroups = ['main', 'events', 'process', 'business', 'resource'];
const radioGroups = ['importance', 'message-mode', "clickLogic"];

/**
 * Reads selected checkboxes and radio buttons and returns an array of tag values.
 * This is a passive function — no event listeners, just a snapshot of current state.
 */

export let messageAddress = 'self';
export let clickLogic = null;
export let audience = null;



