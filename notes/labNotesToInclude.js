// need to build this into T&M/notes/notes.js

// db/notes.js
console.log('db/notes.js');
// [save/send] button handler (new 14:03 12 Aug)
//import { collectUserChoices } from '../ui/collectUserChoices.js';
import { saveNoteWithTags } from './saveNoteWithTags.js';
//import { createSupabaseClient } from '../db/client.js';
//import { reactToPageButton } from '../ui/reactToPageButton.js';

const supabase = createSupabaseClient();


/**
 * Inserts a new note and returns its ID. Updated to accept object containg the params
 */
export async function insertNote(supabase, noteData) {
  const {
    author_id,
    audience_id = null,
    reply_to_id = null,
    title = 'AutoTitle',
    content,
    status = null
  } = noteData;

  console.log("📝 insertNote data:", { author_id, content, title }); // Debug

  try {
    const { data, error } = await supabase
      .from('notes')
      .insert([{
        author_id,
        audience_id,
        reply_to_id,
        title,
        content,
        status
      }])
      .select('id');

    if (error) throw error;

    return data[0].id;
  } catch (error) {
    console.error('❌ insertNote failed:', error);
    throw error;
  }
}
/**
 * Fetches a page of notes.
 */
// In fetchNotes.js - return with consistent naming
export async function fetchNotes(supabase, page = 1, pageSize = 10) {
    console.log("fetchNote()", page);

  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data, count, error } = await supabase
    .from('notes')
    .select('*', { count: 'exact' })
    .order('sort_int', { ascending: false })
    .range(start, end);

  if (error) {
    console.error('Error fetching notes:', error);
    return { notes: [], totalCount: 0 };
  }

  return { notes: data, totalCount: count };
}


function getIconHTML(status) {
  console.log("getIconHTML()");
  switch(status) {
    case 6:
      return '<span class="text-green-600 font-semibold">?</span>';
    case 7:
      return '<span class="text-red-600 font-semibold">?</span>';
    case 8:
      return '<span class="text-green-600">✅</span>';
    case 9:
      return '<span class="text-red-600">❌</span>';
    default:
      return '<span class="text-gray-400">○</span>'; // Default icon for no status
  }
}

export function renderNotes(notes, totalCount, page, pageSize) {
  const output = document.getElementById('output');
  
  const notesHtml = notes.map(note => {
    const content = note.content || '';
  
   const shortContent = content.length > 2000
  ? `${content.slice(0, 2000)}<span class="text-blue-600 cursor-pointer hover:text-blue-800 toggle-content"> [more]</span><span class="hidden extra-content">${content.slice(2000)} <span class="text-blue-600 cursor-pointer hover:text-blue-800 toggle-content"> [less]</span></span>`
  : content;
 
    
    const iconHTML = getIconHTML(note.status);
    const statusAttr = note.status ?? '';
    
    // Use status-based styling like in the knowledge base
    const statusClasses = {
      'pending': 'bg-yellow-50 border-yellow-200',
      'completed': 'bg-green-50 border-green-200',
      'abandoned': 'bg-red-50 border-red-200'
    };
    
    const statusClass = statusClasses[statusAttr] || 'bg-white border-gray-200';
    const statusText = statusAttr || 'No status';

console.log('Rendering note:', {
  id: note.id,
  rawStatus: note.status,
  statusAttr: statusAttr,
  statusText: statusText
});

    
    return `
        <div class="mb-3" data-note-id="${note.id}" data-status="${statusAttr}">
    <div class="bg-white p-4 rounded-lg border ${statusClass} hover:shadow-sm transition-all cursor-pointer group"
         data-note-id="${note.id}">
      
      <!-- Status bar - top center -->
      <div data-notes-status="${statusAttr}" class="status-bar flex items-center justify-center mb-3 py-1 bg-gray-50 rounded text-xs font-medium text-gray-600" >
        <span>Status: ${statusText}</span>
        ${iconHTML ? `<span class="ml-2">${iconHTML}</span>` : ''}
        <span class="mx-2">•</span>
        <span>Click anywhere to cycle through status choices</span>
      </div>
          
          <!-- Note content -->
          <div class="space-y-2 text-sm text-gray-800">
            <p class="flex items-center">
              <span class="font-medium w-20">ID:</span>
              <span class="text-gray-600">${note.sort_int}</span>
            </p>
            <p class="flex items-center">
              <span class="font-medium w-20">Author:</span>
              <span class="text-gray-600">${note.author_id.slice(0, 8)}</span>
            </p>
            <p class="flex items-center">
              <span class="font-medium w-20">Created:</span>
              <span class="text-gray-600">${new Date(note.created_at).toLocaleString()}</span>
            </p>
            <p class="flex">
              <span class="font-medium w-20 pt-1">Content:</span>
             <span class="text-gray-700 flex-1">${shortContent}</span>
            </p>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const totalPages = Math.ceil(totalCount / pageSize);
  const controls = `
    <div class="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
      <button data-page-action="newer" data-current-page="${page}" data-total-count="${totalCount}"
              class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              ${page === 1 ? 'disabled' : ''}>
         Newer ⬆️
      </button>
      <span class="text-sm text-gray-600">
        Page ${page} of ${totalPages} (${totalCount} total notes)
      </span>
      <button data-page-action="older" data-current-page="${page}" data-total-count="${totalCount}"
              class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              ${page === totalPages ? 'disabled' : ''}>
        Older ⬇️
      </button>
    </div>
  `;

  output.innerHTML = `
    <div class="mt-6">
      <h3 class="text-lg font-semibold text-gray-700 mb-4 flex items-center">
        <span class="mr-2">📝</span>
        Recent Notes
      </h3>
      ${notesHtml}
      ${controls}
    </div>
  `;
}




   // Updates the status of a note.
export async function saveNoteStatus(supabase, noteId, newStatus) {
  console.log("saveNoteStatus()");
  const { data, error } = await supabase
    .from('notes')
    .update({ status: newStatus })
    .eq('id', noteId);

  if (error) {
    console.error(`Failed to update status for note ${noteId}:`, error);
  }

  return { data, error };
}
