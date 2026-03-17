// need to adapt to use ifPermitted
//saveNoteWithTags.js
console.log("saveNoteWithTags.js loaded");

import { executeIfPermitted } from '../registry/executeIfPermitted.js';
import { appState } from '../state/appState.js';

//import {insertNote} from './notes.js';  //  insertNote is in the registry

//import {tagNoteByNames} from './tags.js';
import { displayNotes } from './displayNotes.js';
import {cleanupNoteInput} from './cleanupNoteInput.js';
import { collectUserChoices, messageAddress, clickLogic, userChoices } from './collectUserChoices.js';


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

const userId = appState.query.userId;
const petitionHistory = appState.query.petitionHistory;

export async function getUserInputWriteToDb(){
console.log("getUserInputWriteToDb()");  
}

//out of date as based on html value=text  and tags array that used text names.


//called from reactToSaveButton It shouldn't be here - breaks rule of executeIfPermitted
export async function saveNoteWithTags(supabase, params = {}) {
  
//out of date
  
  
  const {  
    author_id = userId,
    audience_id = null,
    reply_to_id = null,
    title = '',
    content = '',
    status = null,
    tags = []
  } = params;

//const enhancedContent = content;  

const formattedMetadata = JSON.stringify({
  petitionHistory: appState.query.petitionHistory
}, null, 2); // ← adds indentation and line breaks

//note.content += `\n\nmetadata:\n${formattedMetadata}`;
//console.log('meta:', formattedMetadata);

const enhancedContent = content;  // next line would add metadata to the note
//const enhancedContent = content + `{{{metadata:\n${formattedMetadata}`;
//this adds the content of petitionHistory 
// Only relevant for some notes. It should be a choice or only added in some filters
//There is some code in render to split the main note from the meta but it hasn't been fully worked

//console.log('enhancedContent:', enhancedContent);

  console.log('Saving note with tags:', { tags });

  console.log('📥 [save] params:', params);
console.log('📥 [save] tags:', tags);
//console.log('📥 [save] tags type:', typeof tags, 'is array?', Array.isArray(tags));

  try {
    const noteId = await executeIfPermitted(userId, 'insertNote', {
      author_id,
      audience_id,
      reply_to_id,
      title,
     content: enhancedContent,
      status
    });


    console.log(`Note inserted with ID: ${noteId}`);

    if (tags.length > 0) {
//await tagNoteByNames(noteId, tags); // change 17:20 March 16 because the html no longer has value='bug' but instead ="34"
//we now have the int id & don't need to look that up, but we no longer have the name
await linkNoteToCategories(noteId, tags);
  
}
    displayNotes(1);//page 1 does it need another param??
    cleanupNoteInput('Saved');
    return noteId;
  } catch (error) {
    console.error('Failed to save note:', error);
    throw error;
  }
}

export async function tagNoteByNames(noteId, tagNames = []) { //NO LONGER COLLECTING BY NAM now using int 
  console.log('tagNoteByNames() called with:', tagNames);
  console.log('Type of tagNames:', typeof tagNames);
  console.log('Is array?', Array.isArray(tagNames));

  if (!Array.isArray(tagNames)) {
    throw new TypeError('tagNames must be an array');
  }

  const categoryMap = await readCategoryMap(); // This reads from notes_categories. 
  const categoryIds = tagNames
    .map(name => categoryMap.get(name))
    .filter(Boolean);

  if (categoryIds.length === 0) {
    console.warn('No valid categories found for tags:', tagNames);//<-------------- throws error here Jan 7
    return;
  }

  await linkNoteToCategories(noteId, categoryIds);
}

export async function readCategoryMap() {
  console.log('readCategoryMap()');
  const data = await executeIfPermitted(userId, 'readCategoryMap', {} );

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

const { error } = await executeIfPermitted(userId, 'linkNoteToCategories',{rows});
if (error) {
  console.error('❌ Error linking note to categories:', error);
}

console.log('Linked note to categories');
}

export async function readReverseCategoryMap() {  // never called?
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