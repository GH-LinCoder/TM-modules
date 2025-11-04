// reactToSaveButton.js
console.log('reactToSaveButton.js');

import { collectUserChoices } from './collectUserChoices.js';
import { saveNoteWithTags } from '../db/saveNoteWithTags.js';
import { createSupabaseClient } from '../db/client.js';

// Get a single instance of the Supabase client.
const supabase = createSupabaseClient();

export async function reactToSaveButton() {
  console.log('reactToSaveButton()');

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
  console.log(userChoices.size, " tags found");

  const result = await saveNoteWithTags(supabase, {
    content: noteContent,
    tags: userChoices,
    author_id: '47742c9f-9afd-40b3-816a-f83fcd72b905' //mock data until implemented
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
