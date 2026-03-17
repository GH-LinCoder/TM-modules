// reactToSaveButton.js
console.log('reactToSaveButton.js  loaded');
import { appState } from '../state/appState.js';
import { collectUserChoices, messageAddress,audience, userChoices } from './collectUserChoices.js';
import { saveNoteWithTags } from './saveNoteWithTags.js';
import { showToast } from '../ui/showToast.js';
//this was all working jan 3 and now jan 5 it has errors & couldn't possibly work.
//how is this possible?
import { executeIfPermitted } from '../registry/executeIfPermitted.js';


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
 */ //this doesn't have the essential data of a note



function handleReply(){ // need to obtain the audience from the note that is loaded into the textarea not the value from the dropdown


//if (!audience || audience == '') {showToast('Message audience needs to be set from click on the note you want to reply to ','warning');return;}

return audience
}



export async function reactToSaveButton() {
  console.log('reactToSaveButton()');
const user = await executeIfPermitted( null,'getAuthenticatedUser', {approfileId: null });
  const noteContent = document.getElementById('note-content')?.value.trim();
  if (!noteContent) {
    console.log('✗ Note content is empty');
    return;
  }
  console.log("content found");



  //all out of date March

  //const userChoices = collectUserChoices();  //This is the old flat array. Out of date
  collectUserChoices(); // this sets the global userChoices
  
// Convert Set → Array → Integers
const categoryIds = Array.from(userChoices.categories)
  .map(Number)
  .filter(n => Number.isInteger(n));



  console.log('reactToSaveButton()', { noteContent: noteContent, userChoices:userChoices });

console.log(userChoices.categories.length, " tags found", 'userId:', user.id);


//////////////////////////////////////////////this happens even if not appropriate 21:19 Jan 9
  const result = await saveNoteWithTags(user.id, {
    content: noteContent,
    tags: categoryIds,
    author_id: user.id,
    audience_id:audience
  });

  if (result) {
    console.log(`✅ Note saved with ID: ${result}`);
    cleanupPage();
  } else {
    console.log('❌ Note save failed');
  }
/////////////////////////////////////////////////

}

function cleanupPage() {
  // empty content, reset tags, re-render notes
  // The logic for your cleanup functions goes here.
  // For example:
  // document.getElementById('note-content').value = '';
  // resetTagUI();
}
