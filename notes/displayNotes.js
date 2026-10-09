// Updated displayNotes.js
console.log('displayNotes.js');
//import { createSupabaseClient } from '../db/client.js';
//import { fetchNotes } from "./labNotesToInclude.js";  
//import { renderNotes } from "./labNotesToInclude.js";  
import { executeIfPermitted } from '../registry/executeIfPermitted.js';
import { appState } from '../state/appState.js';
import { collectUserChoices, userChoices } from './collectUserChoices.js';
import { resolveSubject} from '../utils/resolveSubjectPlus2.js'
/**
userChoices = { //amended 12:22 March 16 2026
    userId: null,
    respondent: null, 
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
 */ 

let userId = null; //removed 17:24 Aug 30
let displayLoggedInUsersNotes = true; // this can be toggled to switch between the logged in user and the latest item on the clipbaord
let subject = null;

let pageOfNotes = [];

let totalCount = 0;
let totalPages = 0;
let currentPage = 1;
let pageSize = 10;

/*
function escapeHtml(text) { // this does not seem to happen
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
   ;
} */


export function xfilter() {//not called
  const { categories, mode } = userChoices;

    return pageOfNotes.filter(note => { // for each note include or dsicard

        // CATEGORY FILTER
        if (categories.length > 0) { // I don't understand this
            if (mode === 'more-clicks-more-notes') {
                // OR mode
                if (!note.categories.some(c => categories.includes(c))) return false;
            } else {
                // AND mode
                if (!categories.every(c => note.categories.includes(c))) return false;
            }
        }

        // IMPORTANCE FILTER (future)
        // if (importance && note.importance !== importance) return false;

        return true;
    });
}


// In displayNotes.js

/**
 * Filter notes according to global userChoices state
 * @param {Array} notes - Raw notes array from DB
 * @returns {Array} Filtered notes
 */
 function filterNotesAccordingToUserChoices() {
    //const notes = pageOfNotes;
    collectUserChoices();//places the values in a global userCoices
    console.log('🔍 Filtering pageOfNotes with userChoices:', userChoices, 'length',pageOfNotes.notes.length, 'userChoices',userChoices);
    //why is id null?   It cease to be null later, so why is it null now?  length undefined

    if (!pageOfNotes.notes?.length) return [];
    
    let filtered = [...pageOfNotes.notes]; // Work on a copy
    
    // ✅ 1. Address filter (uses global userChoices.address + userChoices.respondent)
    filtered = filterByAddress(filtered);
    console.log('filteredByAddress result:',filtered);
    // ✅ 2. Category filter (only if categories selected)
    if (userChoices.categories?.length === 0 && userChoices?.mode === 'more-clicks-more-notes') {
console.log('No tags + need tags to display');
      return [];} // OR logic with zero tags → no matches

    if (userChoices.categories?.length > 0) {filtered = filterByCategories(filtered);}
  console.log('filteredByCategories result:',filtered);
     
    // ✅ Skip importance (visual indicator only per design decision)
    
    console.log(`✅ End result Filtered: ${pageOfNotes.notes.length} → ${filtered.length} pageOfNotes`);
    return filtered;
}

//new filterByAddress 20:03 March 16

function filterByAddress(notes) { //anomolies in test March 18 FROM gives zero notes when it should give all
  const viewerId = userChoices.userId;
  const fromApproId = userChoices.fromApproId;
  if (!viewerId) return notes;

  // With the logged-in appro selected, show both sides of the user's own
  // conversation. A different sender is restricted to messages addressed to the viewer.
  if (!fromApproId || String(fromApproId) === String(viewerId)) {
    return notes.filter(note =>
      String(note.author_id) === String(viewerId) ||
      String(note.audience_id) === String(viewerId)
    );
  }

  return notes.filter(note =>
    String(note.author_id) === String(fromApproId) &&
    String(note.audience_id) === String(viewerId)
  );
}

// Sub-filter: Category logic (reads from global userChoices)
function filterByCategories(notes) {
    const { categories, mode } = userChoices;
    //console.log('filterByCategories()',categories, 'mode',mode); //look like strings

        console.log('🏷️ filterByCategories()', {
        selected: categories,
        selectedTypes: categories.map(c => typeof c),
        mode,
        noteCount: notes.length,
    });

    // Determine match function based on mode
    // 'more-clicks-fewer-notes' = AND (all selected categories must match)
    // 'more-clicks-more-notes' = OR (any selected category matches)
    const matchFn = mode === 'more-clicks-fewer-notes' ? 'every' : 'some';
  
return notes.filter(note => {
  if(note.category_ids?.length<1) console.log('no tags for this note - possible RLS problem?');
        if (!note.category_ids?.length) return false;
        
        const result = matchFn === 'every' 
            ? categories.every(id => note.category_ids.includes(id))
            : note.category_ids.some(id => categories.includes(id));
        
        // ✅ Log each note's match result
//        console.log('  Note', note, note.note_id, 'category_ids:', note.category_ids, '→', result ? '✅ KEEP' : '❌ EXCLUDE');
        
        return result;
    });    


    }
/* returned from collectUserChoices.js
  userChoices = {
    ...userChoices,
    toApproId,
    fromApproId,
    respondent: toApproId,
    categories,
    categoryNames,
    importance,
    mode,
    address: 'self'
  };
This is the current filter setting not the db.
*/

function getHTMLofUserChoices(){ // turn the object into text to show the user what filters are to be applied
    const { address, categories, importance, mode } = userChoices;
    return`
        <div  class="font-light text-xs"><strong> Filters:</strong> 
 <span class="text-orange-600 w-20 text-xs">
     ADDRESS  [ ${address} ]</span> : 
        <span class="font-light w-20"></span>
 <span class="text-blue-600 w-20 text-xs">
     TAGS  (  ${categories.length ? categories.join(', ') : 'none'} 
 </span>
 <span class="font-light w-5">=</span>
 <span class="text-blue-600 text-xs w-20">
         ${userChoices.categoryNames.length ? userChoices.categoryNames.join(', ')
    : 'none'
} ) </span>
<span class="font-medium w-20"></span>
<span class="text-red-600 text-xs w-20">
  : importance ${importance || 'none'}
  </span>   
  <span class="font-light w-20"></span>
<span class="text-green-600 text-xs w-20">
  MODE ${mode}
  </span>   
  </div>
    `;
}


function displayIds(subject) {
console.log('displayIds');
const loginApproId = appState.query.userId;
const loginAuthId = appState.query.userAuthId;
console.log('log-in appro id',loginApproId, 'loginAuthUserId:',loginAuthId);
console.log('subject',subject, 'auth id',subject.id, 'appro Id:',subject.approUserId ); //subject has approUserId 
}



export async function displayNotes(page = 1) { //first call is without being passed a page number
  console.log('displayNotes()', { page, totalCount });  //object page =1 totalCount =0
  //this can be called by the listener with an impossible page number but we don't have totalCount here?
  //


subject = await resolveSubject(); //This has been returning the value in the clipboard from the select module.
displayIds(subject);


//    userChoices.userId = subject.approUserId; //approUserId is from the clipboard. The logged in appro id is appState.query.userId
userChoices.userId = appState.query.userId; //default to the logged-in user appro id (but can toggle to the selected id from the clipboard

if(displayLoggedInUsersNotes) userChoices.userId = appState.query.userId; 
 else userChoices.userId = subject.approUserId;

console.log('userChoices.userId',userChoices.userId); // this is auth id. 

if(page < 1) page = 1; 
else 
  if (page && totalPages) if (page>totalPages) page = totalPages; //totalPages is initially undefined
const output1 = document.getElementById('output'); //this spinner doesn't work
        output1.innerHTML = `<div class="p-4 text-gray-600 flex items-center gap-2"><span class="animate-spin">⏳</span> Loading notes...</div>`;

  try {
    pageOfNotes = await executeIfPermitted(userId, 'fetchNotes', { page, pageSize});  
    //returns { notes: data, totalCount: count };
    console.log('Raw pageOfNotes from fetchNotes:', pageOfNotes);

    const {notes: data, totalCount: count } = pageOfNotes;
    const notes = data || [];
    totalCount =count|| totalCount;
    
    const actualTotalCount = totalCount || pageOfNotes.totalCount;// why using the label rather than the var & how is it 414 when ther are far fewer?
    
    console.log('displayNotes fetch pageOfNotes:', { noteslength: notes.length, totalCount: actualTotalCount, page });
 
    
//  const filteredNotes = filterNotesAccordingToUserChoices(notes);  //wrong place to do the filter. Later calls to render bypass displayNotes

    // Render the notes
    renderNotes(notes, actualTotalCount, page, pageSize);
    console.log('displayNotes() completed');
    
  } catch (error) {
    console.error('Error displaying notes:', error);
    const output = document.getElementById('output');
    if (output) {
      output.innerHTML = `
        <div class="text-red-700 p-4">
          <p>Failed to load notes. Please try again.</p>
        </div>
      `;
    }
  }
// ✅ Attach the toggle listener
const output = document.getElementById('output');
const toggleBtn = output.querySelector('[data-action="toggle-note-context"]');
if (toggleBtn) {
    toggleBtn.addEventListener('click', async () => {
        displayLoggedInUsersNotes = !displayLoggedInUsersNotes; // Flip the flag

        await displayNotes(1);            // Reset to page 1 and re-fetch
    });
}

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

// In displayNotes.js - replace the broken reRenderNotes:

export function reRenderNotes() {
    console.log('🔀 reRenderNotes() called');
    
    // ✅ Extract notes from the cached pageOfNotes object
    const notes = pageOfNotes.notes || [];
    
    // ✅ Call renderNotes - it will filter internally using global userChoices
    renderNotes(notes, pageOfNotes.totalCount, currentPage, pageSize);
}




export async function renderNotes(notes, totalCount, page, pageSize) {
  console.log('renderNotes()', page);
  const output = document.getElementById('output');

  if (page > totalPages) page = totalPages;
  else if (page < 1) page = 1;

  const filteredNotes = filterNotesAccordingToUserChoices(notes);
  let previousInt = null;

  // Helper to safely escape text specifically for HTML attributes (like data-*)
  const escapeAttr = (str) => {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };

  const noteElements = [];

  filteredNotes.forEach(note => {
    if (note.sort_int === previousInt) return;
    previousInt = note.sort_int;

    const content = note.content || '';
    const iconHTML = getIconHTML(note.status); // Safe because you control this function
    const statusAttr = note.status ?? '';
    
    const statusClasses = {
      'pending': 'bg-yellow-50 border-yellow-200',
      'completed': 'bg-green-50 border-green-200',
      'abandoned': 'bg-red-50 border-red-200'
    };
    
    const statusClass = statusClasses[statusAttr] || 'bg-white border-gray-200';
    const statusText = statusAttr || 'No status';

    // 1. Create a wrapper element for this specific note
    const wrapper = document.createElement('div');
    wrapper.className = 'mb-3';

    // 2. Set the static HTML structure with EMPTY placeholders for dynamic text
    // We use escapeAttr() for data-attributes so quotes in the content don't break the HTML structure
    wrapper.innerHTML = getHTMLofUserChoices() + `
      <div class="bg-gray-50 p-4 rounded-lg border hover:shadow-sm transition-all cursor-pointer group">
        
        <!-- Status bar -->
        <div data-action="change-status" data-note-id="${escapeAttr(note.note_id)}" class="flex items-center justify-center mb-3 py-1 bg-gray-100 rounded text-xs font-light text-gray-600 hover:drop-shadow ${statusClass}" title="Click to change the status.">
          <div class="status-bar">
            <span>Status: <span class="status-text-placeholder"></span></span>
            ${iconHTML ? `<span class="ml-2 icon-placeholder">${iconHTML}</span>` : ''}
            <span class="mx-2">•</span>
            <span>Click anywhere to cycle through status choices</span>
          </div>
        </div>
          
        <!-- Note meta & content -->
        <div class="flex mb-5 bg-white border rounded-lg p-2 drop-shadow-xl hover:drop-shadow" 
             data-note-int="${escapeAttr(note.sort_int)}"
             data-note-id="${escapeAttr(note.note_id)}-body"
             data-note-name="${escapeAttr(note.author_name)}"   
             data-note-author-id="${escapeAttr(note.author_id)}"
             data-note-audience-id="${escapeAttr(note.audience_id)}" 
             data-note-content="${escapeAttr(content)}"
             title="Click to copy the text & details into a new message.">
          <span class="bg-white font-light text-gray-600 text-sm w-20">Content:</span>
<span class="bg-white text-gray-800 font-medium flex-1 min-w-0 whitespace-pre-line break-words content-placeholder"></span>
        </div>

        <div class="space-y-2 bg-gray-100 hover:drop-shadow" 
             data-note-int="${escapeAttr(note.sort_int)}"
             data-note-id="${escapeAttr(note.note_id)}-body"
             data-note-name="${escapeAttr(note.author_name)}"   
             data-note-author-id="${escapeAttr(note.author_id)}"
             data-note-audience-id="${escapeAttr(note.audience_id)}" 
             data-note-content="${escapeAttr(content)}"
             title="Click to copy the text & details into a new message.">
          
          <p class="flex items-center">
            <span class="bg-gray-100 text-xs font-light text-gray-600 w-15">Number:</span>
            <span class="bg-gray-100 text-xs font-light text-gray-600 sort-int-placeholder"></span>
            <span class="bg-gray-100 text-xs font-light text-gray-600 w-10"></span>
            <span class="bg-gray-100 text-xs font-light text-gray-600">Id:</span>
            <span class="bg-gray-100 text-xs font-light text-gray-600 id-placeholder"></span>
          </p>
          
          <p class="flex items-center text-xs font-light">
            <span class="text-gray-600 created-at-placeholder"></span>
          </p>

          <p class="flex items-center">
            <span class="text-blue-600 text-xs font-light w-10">Tags:</span>
            <span class="text-blue-600 text-xs font-light cat-ids-placeholder"></span>
            <span class="w-1">=</span>
            <span class="text-blue-600 text-xs font-light cat-names-placeholder"></span>
          </p>

          <p class="text-sm font-light">
            <span class="font-light text-xs text-gray-800 w-10">From:</span>
            <span class="text-green-600 text-sm w-10 author-name-placeholder"></span>
            <span class="font-light text-gray-800 text-xs w-10"> => To:</span>
            <span class="text-green-600 text-sm w-10 audience-name-placeholder"></span>
          </p>
        </div>
      </div>
    `;

    // 3. THE MAGIC: Safely inject the dynamic text using textContent
    // This guarantees that HTML tags are displayed as plain text, and quotes/apostrophes are perfect.
    wrapper.querySelector('.status-text-placeholder').textContent = statusText;
    wrapper.querySelector('.content-placeholder').textContent = content;
    wrapper.querySelector('.sort-int-placeholder').textContent = note.sort_int;
    wrapper.querySelector('.id-placeholder').textContent = note.note_id;
    wrapper.querySelector('.created-at-placeholder').textContent = `Created: ${new Date(note.created_at).toLocaleString()}`;
    wrapper.querySelector('.cat-ids-placeholder').textContent = note.category_ids;
    wrapper.querySelector('.cat-names-placeholder').textContent = note.category_names;
    wrapper.querySelector('.author-name-placeholder').textContent = note.author_name;
    wrapper.querySelector('.audience-name-placeholder').textContent = note.audience_name;

    noteElements.push(wrapper);
  });

  totalPages = Math.ceil(totalCount / pageSize);
  
  // Build pagination controls
  const controlsWrapper = document.createElement('div');
  controlsWrapper.className = 'flex items-center justify-between mt-6 pt-4 border-t border-gray-200';
  controlsWrapper.innerHTML = `
    <button data-page-action="newer10" data-current-page="${page}" data-total-count="${totalCount}"
              class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              ${page === 1 ? 'disabled' : ''}>
         Skip newer by 10 pages ⬆️⬆️
      </button>

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
      
      <button data-page-action="older10" data-current-page="${page}" data-total-count="${totalCount}"
              class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              ${page === totalPages ? 'disabled' : ''}>
        Skip Older by 10 pages ⬇️⬇️
      </button>
  `;

  let adviceHTML = '';      
  if (filteredNotes.length === 0 && userChoices?.mode === 'more-clicks-more-notes') {
    adviceHTML = `<p class="text-gray-600">In this mode you need to click tags to find notes OR change mode by clicking the Fewer notes button.</p>`;
  } else if (filteredNotes.length === 0 && userChoices?.mode != 'more-clicks-more-notes') {
    adviceHTML = `<p class="text-gray-600">In this mode you need to remove some tags to find notes OR change mode by clicking the More notes button.</p>`;
  }

  // Clear output and build the final structure safely
  output.innerHTML = '';
  
  const mainContainer = document.createElement('div');
  mainContainer.className = 'mt-6';
  
  // Header and toggle button
  const headerDiv = document.createElement('div');
  headerDiv.innerHTML = `
    <button data-action="toggle-note-context" class="bg-yellow-50 cursor-pointer mb-4 px-3 py-1 rounded border border-yellow-200"> ${displayLoggedInUsersNotes ? '🔄 Change to display clipboard item' : '📋 Change to display my notes'}</button>
    <h3 class="text-lg font-semibold text-gray-700 mb-4 flex items-center">
      <span class="mr-2">📝</span>
      <span class="header-text-placeholder"></span>
    </h3>
  `;
  
  // Safely inject the header text
  const headerTextPlaceholder = headerDiv.querySelector('.header-text-placeholder');
  const subjectName = (typeof subject !== 'undefined' && subject?.name) ? subject.name : 'Clipboard Subject';
  headerTextPlaceholder.textContent = `Notes displaying ${filteredNotes.length} of ${totalCount} total for ${displayLoggedInUsersNotes ? appState.query.userName : subjectName}`;
  
  mainContainer.appendChild(headerDiv);

  if (filteredNotes.length === 0) {
    const adviceDiv = document.createElement('div');
    adviceDiv.innerHTML = adviceHTML;
    mainContainer.appendChild(adviceDiv);
  } else {
    // Append all safely built note elements
    noteElements.forEach(el => mainContainer.appendChild(el));
  }

  mainContainer.appendChild(controlsWrapper);
  output.appendChild(mainContainer);
}

