// reactToSaveButton.js
console.log('reactToSaveButton.js  loaded');
import { appState } from '../state/appState.js';
import { collectUserChoices } from './collectUserChoices.js';
import { saveNoteWithTags } from './saveNoteWithTags.js';
//import { createSupabaseClient } from '../db/client.js';
//this was all working jan 3 and now jan 5 it has errors & couldn't possibly work.
//how is this possible?
import { executeIfPermitted } from '../registry/executeIfPermitted.js';


export async function reactToSaveButton() {
  console.log('reactToSaveButton()');

const user = await executeIfPermitted( null,'getAuthenticatedUser', {approfileId: null });

//const audience = document.getElementById('respondentSelect');//.value;
//if(!audience) 
const audience_raw = document.getElementById('respondentSelect')?.value;
const audience = audience_raw === '' ? null : audience_raw;  


console.log('Audience found?', audience);

  const noteContent = document.getElementById('note-content')?.value.trim();
  if (!noteContent) {
    console.log('✗ Note content is empty');
    return;
  }
  console.log("content found");

  const userChoices = collectUserChoices();
  console.log('reactToSaveButton()', { noteContent: noteContent, tags: userChoices });

  // --- SYNTAX FIX: Use 'userChoices' instead of 'tags' ---
  // The 'userChoices' variable holds the tags.
  // We can check the size of the set directly.
  if (userChoices.size === 0) {
    console.log('✗ No tags');
    return;
  }
  console.log(userChoices.size, " tags found", 'userId:', user.id);


// Jan 7 need to add audience_id  if there is one


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
}

function cleanupPage() {
  // empty content, reset tags, re-render notes
  // The logic for your cleanup functions goes here.
  // For example:
  // document.getElementById('note-content').value = '';
  // resetTagUI();
}
