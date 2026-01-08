// reactToSaveButton.js
console.log('reactToSaveButton.js  loaded');
import { appState } from '../state/appState.js';
import { collectUserChoices, messageAddress } from './collectUserChoices.js';
import { saveNoteWithTags } from './saveNoteWithTags.js';
//import { createSupabaseClient } from '../db/client.js';
//this was all working jan 3 and now jan 5 it has errors & couldn't possibly work.
//how is this possible?
import { executeIfPermitted } from '../registry/executeIfPermitted.js';
//import{ messageAddress } from './collectUserChoices.js';


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

//const audience = document.getElementById('respondentSelect');//.value;
let audience=null; 
const respondentSelected = document.getElementById('respondentSelect')?.value;

switch (messageAddress){
case 'to': audience = respondentSelected === '' ? null : respondentSelected; break;  
case 'self': audience = user.id; break;
case 'from': audience = null; break;
case 'reply':audience = null; console.log('Need value from clicked card'); break;
default: audience = null; console.log('messageAddres unknown:', messageAddress)}

//audience is to whom the message is sent. Reply & to are valid for sending
// only use the value in the dropdown if 'to' has been selected

console.log('messageAddress:',messageAddress,'Audience found?', audience);



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
