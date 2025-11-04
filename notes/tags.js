//tags.js
console.log('db/tags.js');
import { createSupabaseClient } from './client.js';

const supabase = createSupabaseClient();

/**
 * Fetches all categories from the database and returns a Map of name → id.
 * @returns {Promise<Map<string, number>>}
 */
export async function readCategoryMap() {
  console.log('readCategoryMap()');
  const { data, error } = await supabase
    .from('notes_categories')
    .select('id, category_name');

  if (error) {
    console.error('❌ Error fetching categories:', error);
    return new Map();
  }

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

  const { error } = await supabase
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





//new version 21:02 13 Aug
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


