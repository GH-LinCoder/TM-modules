// reactToSaveButton.js
console.log('reactToSaveButton.js  loaded');
import { appState } from '../state/appState.js';
import { collectUserChoices } from './collectUserChoices.js';
import { saveNoteWithTags } from './saveNoteWithTags.js';
import { showToast } from '../ui/showToast.js';
//this was all working jan 3 and now jan 5 it has errors & couldn't possibly work.
//how is this possible?
import { executeIfPermitted } from '../registry/executeIfPermitted.js';



export async function reactToSaveButton() {
  console.log('reactToSaveButton()');
const user = await executeIfPermitted( null,'getAuthenticatedUser', {approfileId: null });
  const noteContent = document.getElementById('note-content')?.value.trim();
  if (!noteContent) {
    console.log('✗ Note content is empty');
    return;
  }
  console.log("content found");
  
//const userChoices = collectUserChoices();  //This is the old flat array. Out of date
  const choices = collectUserChoices();
  
// Convert Set → Array → Integers
const categoryIds = choices.categories
  .map(Number)
  .filter(n => Number.isInteger(n));

  console.log('reactToSaveButton()', { noteContent, choices });
console.log(choices.categories.length, " tags found", 'userId:', user.id);//this userId is authUser

const authorId = appState.query.userId;
//////////////////////////////////////////////this happens even if not appropriate 21:19 Jan 9
  const result = await saveNoteWithTags(user.id, {
    content: noteContent,
    tags: categoryIds,
    author_id: authorId,
    audience_id: choices.toApproId
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
