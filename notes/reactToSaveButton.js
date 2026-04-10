// reactToSaveButton.js
console.log('reactToSaveButton.js  loaded');
import { appState } from '../state/appState.js';
import { collectUserChoices, messageAddress,audience, userChoices } from './collectUserChoices.js';
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
  collectUserChoices(); // this sets the global userChoices
  
// Convert Set → Array → Integers
const categoryIds = Array.from(userChoices.categories)
  .map(Number)
  .filter(n => Number.isInteger(n));

  console.log('reactToSaveButton()', { noteContent: noteContent, userChoices:userChoices });
console.log(userChoices.categories.length, " tags found", 'userId:', user.id);//this userId is authUser

const authorId = userChoices.userId; //added this 16:51 April 7 to be different to 'userId'
//////////////////////////////////////////////this happens even if not appropriate 21:19 Jan 9
  const result = await saveNoteWithTags(user.id, {
    content: noteContent,
    tags: categoryIds,
    author_id: authorId,
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
