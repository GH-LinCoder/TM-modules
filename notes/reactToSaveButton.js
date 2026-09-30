// reactToSaveButton.js
console.log('reactToSaveButton.js  loaded');
import { appState } from '../state/appState.js';
import { collectUserChoices } from './collectUserChoices.js';
import { saveNoteWithTags } from './saveNoteWithTags.js';
//import { createSupabaseClient } from '../db/client.js';


// Basic HTML escaping
function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Get a single instance of the Supabase client.
//const supabase = createSupabaseClient();
const userId = appState.query.userId;
export async function reactToSaveButton() {
  console.log('reactToSaveButton()');

  let noteContent = document.getElementById('note-content')?.value.trim();
  if (!noteContent) {
    console.log('✗ Note content is empty');
    return;
  }
  console.log("content found");

noteContent = escapeHtml(noteContent);

  const userChoices = collectUserChoices();
console.log('userChoices', userChoices);
/* returned from collectUserChoices.js
  userChoices = {
    ...userChoices,
    toApproId,
    fromApproId,
    respondent: toApproId,
    categories,
    categoryNames,
    importance,  // 18,21,22,23,25
    mode,
    address: 'self'
  };
This is the current filter setting not the db.
*/


  console.log('reactToSaveButton()', { noteContent: noteContent, tags: userChoices });
//why doesn't this contain 'importance' ???  21:08 Sept 14
/*
tags: Object { userId: "9066554d-1476-4655-9305-f997bff43cbb", toApproId: "9066554d-1476-4655-9305-f997bff43cbb", fromApproId: "9066554d-1476-4655-9305-f997bff43cbb", … 
address: "self
addressFilterActive: tru
categories: Array(3) [ 34, 39, 9 ]
0: 34
1: 39
2: 9
length: 3 */
  // --- SYNTAX FIX: Use 'userChoices' instead of 'tags' ---
  // The 'userChoices' variable holds the tags.
  // We can check the size of the set directly.
  if (userChoices.categories.length === 0) {
    console.log('✗ No tags');
    return;
  }
  console.log(userChoices.categories.length, " tags found", 'userId:', userId);

  const result = await saveNoteWithTags(null, {
    content: noteContent,
    tags: userChoices.categories,
    author_id: userId,
    audience_id: userChoices.toApproId
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