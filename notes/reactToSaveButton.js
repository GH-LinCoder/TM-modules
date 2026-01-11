// reactToSaveButton.js
console.log('reactToSaveButton.js  loaded');
import { appState } from '../state/appState.js';
import { collectUserChoices, messageAddress,audience } from './collectUserChoices.js';
import { saveNoteWithTags } from './saveNoteWithTags.js';
import { showToast } from '../ui/showToast.js';
//this was all working jan 3 and now jan 5 it has errors & couldn't possibly work.
//how is this possible?
import { executeIfPermitted } from '../registry/executeIfPermitted.js';



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

  const userChoices = collectUserChoices();
  console.log('reactToSaveButton()', { noteContent: noteContent, tags: userChoices });

  if (userChoices.size === 0) {
    console.log('✗ No tags');  // is >0 tags needed???
    return;
  }
  console.log(userChoices.size, " tags found", 'userId:', user.id);

// Jan 7 need to add audience_id  if there is one

//////////////////////////////////////////////this happens even if not appropriate 21:19 Jan 9
  const result = await saveNoteWithTags(user.id, {
    content: noteContent,
    tags: userChoices,
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
