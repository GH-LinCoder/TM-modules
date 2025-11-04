// need to adapt to use ifPermitted

//saveNoteWithTags.js

console.log("db/saveNoteWithTags.js");//lacked imports and supabase


import { createSupabaseClient } from './client.js';
import {insertNote} from './notes.js';
import {tagNoteByNames} from './tags.js';
import { displayNotes } from '../ui/displayNotes.js';
import {cleanupNoteInput} from '../ui/cleanupNoteInput.js';

export async function getUserInputWriteToDb(){
console.log("getUserInputWriteToDb()");  
}




//new 21:07 13 Aug 2025
export async function saveNoteWithTags(supabase, params = {}) {
  const {   //   47742c9f-9afd-40b3-816a-f83fcd72b905
    author_id = '47742c9f-9afd-40b3-816a-f83fcd72b905',
    audience_id = null,
    reply_to_id = null,
    title = '',
    content = '',
    status = null,
    tags = []
  } = params;

  console.log('Saving note with tags:', { title, tags });

  console.log('📥 [save] params:', params);
console.log('📥 [save] tags:', tags);
console.log('📥 [save] tags type:', typeof tags, 'is array?', Array.isArray(tags));
  try {
    const noteId = await insertNote(supabase, {
      author_id,
      audience_id,
      reply_to_id,
      title,
      content,
      status
    });

    console.log(`Note inserted with ID: ${noteId}`);

    if (tags.length > 0) {
      await tagNoteByNames(noteId, tags);
    }
    displayNotes(1);//page 1 does it need another param??
    cleanupNoteInput('Saved');
    return noteId;
  } catch (error) {
    console.error('Failed to save note:', error);
    throw error;
  }
}
