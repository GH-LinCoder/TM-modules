// need to adapt to use ifPermitted
//saveNoteWithTags.js
console.log("saveNoteWithTags.js loaded");

import { executeIfPermitted } from '../registry/executeIfPermitted.js';
import { appState } from '../../state/appState.js';

//import {insertNote} from './notes.js';  //  insertNote is in the registry

//import {tagNoteByNames} from './tags.js';
import { displayNotes } from './displayNotes.js';
import {cleanupNoteInput} from './cleanupNoteInput.js';

const userId = appState.query.userId;

export async function getUserInputWriteToDb(){
console.log("getUserInputWriteToDb()");  
}

//new 21:07 13 Aug 2025
export async function saveNoteWithTags(supabase, params = {}) {
  const {  
    author_id = userId,
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
    const noteId = await executeIfPermitted(userId, 'insertNote', {
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

export async function tagNoteByNames(noteId, tagNames = []) {
  console.log('tagNoteByNames() called with:', tagNames);
  console.log('Type of tagNames:', typeof tagNames);
  console.log('Is array?', Array.isArray(tagNames));

  if (!Array.isArray(tagNames)) {
    throw new TypeError('tagNames must be an array');
  }

  const categoryMap = await readCategoryMap(); // Map<string, id>
  const categoryIds = tagNames
    .map(name => categoryMap.get(name))
    .filter(Boolean);

  if (categoryIds.length === 0) {
    console.warn('No valid categories found for tags:', tagNames);
    return;
  }

  await linkNoteToCategories(noteId, categoryIds);
}

export async function readCategoryMap() {
  console.log('readCategoryMap()');
  const data = await executeIfPermitted(userId, 'readCategoryMap', {} );
   // data is an array of 34 items in handler but here undefined
 console.log('Categories:', data);
  return new Map(data.map(cat => [cat.category_name, cat.id]));
}

/**
 * Links a note to one or more category IDs in notes_categorised.
 * @param {string} noteId
 * @param {number[]} categoryIds
 */
export async function linkNoteToCategories(noteId, categoryIds) {
  //tests 17:00 19 Aug
  if (!noteId) console.log('No noteId'); 
   console.log('categoryId.length:', categoryIds.length);
  
  console.log('linkNoteToCategories()',noteId, categoryIds.length);
  if (!noteId || categoryIds.length === 0) return;

  const rows = categoryIds.map(catId => ({
    note_id: noteId,
    note_category_id: catId
  }));

  const { error } = await supabase  // need to MOVE to Registry <==============
    .from('notes_categorised')
    .upsert(rows, {
      onConflict: ['note_id', 'note_category_id'],
      ignoreDuplicates: true
    });

  if (error) {
    console.error('❌ Error linking note to categories:', error);
  }
}

export async function readReverseCategoryMap() {
  console.log('readReverseCategoryMap');
  const { data, error } = await supabase
    .from('notes_categories')
    .select('id, category_name');

  if (error) {
    console.error('❌ Error fetching categories:', error);
    return new Map();
  }

  return new Map(data.map(cat => [cat.id, cat.category_name]));
}