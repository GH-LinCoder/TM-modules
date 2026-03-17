// Updated displayNotes.js
console.log('displayNotes.js');
//import { createSupabaseClient } from '../db/client.js';
//import { fetchNotes } from "./labNotesToInclude.js";  
//import { renderNotes } from "./labNotesToInclude.js";  
import { executeIfPermitted } from '../registry/executeIfPermitted.js';
import { appState } from '../state/appState.js';
import { collectUserChoices, messageAddress, clickLogic, userChoices } from './collectUserChoices.js';
import { resolveSubject} from '../utils/contextSubjectHideModules.js'
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
 */ 

const userId = userChoices.userId;
let pageOfNotes = [];

let totalCount = 0;
let currentPage = 1;
let pageSize = 10;


function escapeHtml(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
   ;
}


export function filter() {
    const { address, categories, importance, mode } = userChoices;

    return pageOfNotes.filter(note => {

        // CATEGORY FILTER
        if (categories.length > 0) {
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
 function filterNotesAccordingToUserChoices(xnotes) {
    //const notes = pageOfNotes;
    collectUserChoices();
    console.log('🔍 Filtering pageOfNotes with userChoices:', userChoices, 'length',pageOfNotes.notes.length, 'userChoices',userChoices);
    //why is id null?   It cease to be null later, so why is it null now?  length undefined

    if (!pageOfNotes.notes?.length) return [];
    
    let filtered = [...pageOfNotes.notes]; // Work on a copy
    
    // ✅ 1. Address filter (uses global userChoices.address + userChoices.dropdown)
    filtered = filterByAddress(filtered);
    
    // ✅ 2. Category filter (only if categories selected)
    if (userChoices.categories?.length === 0 && userChoices?.mode === 'more-clicks-more-notes') {
        return [];} // OR logic with zero tags → no matches

    if (userChoices.categories?.length > 0) {filtered = filterByCategories(filtered);}
    
    // ✅ Skip importance (visual indicator only per design decision)
    
    console.log(`✅ Filtered: ${pageOfNotes.notes.length} → ${filtered.length} pageOfNotes`);
    return filtered;
}

//new filterByAddress 20:03 March 16

function filterByAddress(notes) {
  console.log('filterByAddress:' );

const userId = userChoices.userId;
const address = userChoices.address;
const respondent = userChoices.dropdown || null;

console.log('notes',notes,'userId',userId, 'address',address, 'respondent',respondent);

  const uid = String(userId);
  const rid = respondent ? String(respondent) : null;

  // Helper: dedupe by note.id
  const dedupe = (a, b) => {
    const seen = new Set(a.map(n => n.id));
    return [
      ...a,
      ...b.filter(n => {
        if (seen.has(n.id)) return false;
        seen.add(n.id);
        return true;
      })
    ];
  };

  // -------------------------
  // MODE: TO
  // -------------------------
  if (address === 'to') {
    if (rid) {
      return notes.filter(n =>
        String(n.audience_id) === rid &&
        String(n.author_id) === uid
      );
    }
    return notes.filter(n =>
      String(n.audience_id) !== uid &&
      String(n.author_id) === uid
    );
  }

  // -------------------------
  // MODE: FROM
  // -------------------------
  if (address === 'from') {
    if (rid) {
      return notes.filter(n =>
        String(n.author_id) === rid &&
        String(n.audience_id) === uid
      );
    }
    return notes.filter(n =>
      String(n.author_id) !== uid &&
      String(n.audience_id) === uid
    );
  }

  // -------------------------
  // MODE: SELF
  // -------------------------
  if (address === 'self') {
    let store1 = notes.filter(n => String(n.author_id) === uid);
    let store2 = notes.filter(n => String(n.audience_id) === uid);

    if (rid) {
      store1 = store1.filter(n => String(n.audience_id) === rid);
      store2 = store2.filter(n => String(n.author_id) === rid);
    }

    return dedupe(store1, store2);
  }

  // -------------------------
  // MODE: REPLY
  // -------------------------
  if (address === 'reply') {
    let store1 = notes.filter(n =>
      n.reply_to_id &&
      String(n.author_id) === uid
    );

    let store2 = notes.filter(n =>
      n.reply_to_id &&
      String(n.audience_id) === uid
    );

    if (rid) {
      store1 = store1.filter(n => String(n.audience_id) === rid);
      store2 = store2.filter(n => String(n.author_id) === rid);
    }

    return dedupe(store1, store2);
  }

  // -------------------------
  // DEFAULT: no address filter
  // -------------------------
  return notes;
}



/*
// ✅ Sub-filter: Address logic (reads from global userChoices)
function filterByAddress(notes) {

    const { address, dropdown, userId } = userChoices;
    console.log('filterByAddress() userChoices decon',address,dropdown,userId);    // null null undefined, slef empty string undefined
    // Default or 'self': show notes by current user
    if (!address || address === 'self') {
        return notes.filter(n => String(n.author_id) === String(userId));
    }
    
    // 'to' or 'from' with dropdown selection
    if ((address === 'to' || address === 'from') && dropdown) {
        const field = address === 'to' ? 'audience_id' : 'author_id';
        return notes.filter(n => String(n[field]) === String(dropdown));
    }
    
    // 'reply': show notes that are replies (have reply_to_id)
    if (address === 'reply') {
        return notes.filter(n => n.reply_to_id);
    }
    
    // Unknown address mode: return all (fail open)
    return notes;
}
*/
// Sub-filter: Category logic (reads from global userChoices)
function filterByCategories(notes) {
    const { categories, mode } = userChoices;
    //console.log('filterByCategories()',categories, 'mode',mode); //look like strings

        console.log('🏷️ filterByCategories()', {
        selected: categories,
        selectedTypes: categories.map(c => typeof c),
        mode,
        noteCount: notes.length
    });
/*
  // ✅ Log first note's category_ids
    if (notes[0]) {
        console.log('📊 First note category_ids:', {
            value: notes[0].category_ids,
            types: notes[0].category_ids?.map(c => typeof c),
            length: notes[0].category_ids?.length
        });
    }
*/

    // Determine match function based on mode
    // 'more-clicks-fewer-notes' = AND (all selected categories must match)
    // 'more-clicks-more-notes' = OR (any selected category matches)
    const matchFn = mode === 'more-clicks-fewer-notes' ? 'every' : 'some';
  
return notes.filter(note => {
        if (!note.category_ids?.length) return false;
        
        const result = matchFn === 'every' 
            ? categories.every(id => note.category_ids.includes(id))
            : note.category_ids.some(id => categories.includes(id));
        
        // ✅ Log each note's match result
        console.log('  Note', note.id, 'category_ids:', note.category_ids, 
            '→', result ? '✅ KEEP' : '❌ EXCLUDE');
        
        return result;
    });    

/*
    return notes.filter(note => { //create a new array, go through notes and add to new array of items returned 
        // Exclude notes with no categories when filtering by category (strict mode)
        if (!note.category_ids?.length) return false;
        
        // Check if note's category_ids match selected categories
        //note.category_ids  Array of integers: [34, 9]
        //[matchFn] Dynamically calls either .every() or .some()
        //id => categories.includes(id) For each id in the note, check if it's in the user's selected categories
        return note.category_ids[matchFn](id => categories.includes(id));
    });
*/
    }



function ZfilterNotesAccordingToUserChoices(notes){
console.log('filterNotesAccordingToUserChoices(notes)');
let filteredNotes=notes;
collectUserChoices();
const { address, categories, importance, mode } = userChoices;

//but the inputs are passive - changing them will not trigger the code to do anything.
//could have listener on all the inputs OR a single listener refresh button
// a listener for change would be enough

console.log('messageAddress:',address,'mode:', mode);

/* in the old flat array

Array(6) [ "bug", "t&m", "diary", "importance-3", "self", "more-clicks-more-notes" ]
0: "bug"
1: "t&m"
2: "diary"
3: "importance-3"
4: "self"
5: "more-clicks-more-notes"
length: 6


but we also have an object

/**
 * userChoices 
 *  address:  null,
    categories: [],
    importance: null,
    mode: 'more-clicks-more-notes' //this + that + other to be shown
 */ 


console.log('userChoices', userChoices);

/*

NEED THE FILTERING HERE prior to calling the render function

'pageOfNotes'   holds the data


The filtering is by reading the checkboxes and radio tags and dropdown (or being passed their value)

collectUserChoices();// read all the checkboxes & radio

switch (messageAddress){// the message radio buttons are important in filtering
case 'to': //find the person in the dropdown break; // see messages to that person. Use this also for to self  
case 'self': //No filtering effect (it could mean my messages only, but is then a poor default; break;
case 'from': //read the dropdown to find notes from that person; break;
case 'reply':// find your replies to anyone or any replies to you?; break;
default: console.log('messageAddress unknown:', messageAddress)}

other tags
radio - importance   will be matching the level= ? (Not this level + nor this level-)

Whether the tags are || or && is determined by the state of the two 'mode' radio buttons. 
The highlight function can be adapted to highlight the two buttons that change the logic of the checkboxes (see below)
Listeners are already attached (Either set a state variable or let the listener choose one of two functions.

The filtering is done prior to passing the results to the renderNotes() function. 
'pageOfNotes'   holds the data


Read which state has been set from the two buttons

Branch to an OR selection or an AND selection

Loop through the pageOfNotes  forEach mapping into what is to be sent to renderNotes.


========================================= highlight function

function highlight(cardClicked){
  console.log('highlight()', cardClicked, 'dataset',cardClicked.dataset);
  document.querySelectorAll(`[data-note-id]`).forEach(el => {
   // console.log('el:',el, 'cardClicked', cardClicked);
    el.classList.toggle('ring-4', el === cardClicked);
    el.classList.toggle('ring-blue-500', el === cardClicked);
    el.classList.toggle('bg-blue-100', el === cardClicked);
  });
} 

//audience is to whom the message is sent. Reply & to are valid for sending
// only use the value in the dropdown if 'to' has been selected

console.log('messageAddress:',messageAddress);

// Prevent empty audience when in "to" mode  mode?
if (mode === 'to' && !audience_id) {
  showToast('Please select a recipient', 'error');
  return;
}


*/

return filteredNotes;
}



function getHTMLofUserChoices(){ // turn the object into text to show the user what filters are to be applied
    const { address, categories, importance, mode } = userChoices;
    return`
        <div><strong> Filters:</strong> ${address} : ${categories.length ? categories.join(', ') : 'none'}  : ${importance || 'none'} : ${mode}
        </div>
    `;
}


export async function displayNotes(page = 1, totalCount = null) { //this reads the database. 
  console.log('displayNotes()', { page, totalCount });
  //pageSize = 5; //why isn't it using the global ??
  
const subject = await resolveSubject();
console.log('subject',subject, 'id',subject.id);
    userChoices.userId = subject.id;
console.log('userChoices.userId',userChoices.userId);



  try {
    pageOfNotes = await executeIfPermitted(userId, 'fetchNotes', { page, pageSize});  
    //returns { notes: data, totalCount: count };
    console.log('Raw pageOfNotes from fetchNotes:', pageOfNotes);

    const {notes: data, totalCount: count } = pageOfNotes;
    const notes = data || [];
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

//There is some code in saveNoteWithTags to add metadata but it isn't fully worked to only add when relevant
// const enhancedContent = content + `{{{metadata:\n${formattedMetadata}`;
//that would add the content of petitionHistory 
function splitContentFromMetadata(note) {  //idea not called because render can't handle the return
  console.log('splitContentFromMeta()');
  const container = document.createElement('div');
  container.className = 'note-block';

  const hasMetadata = note.content.includes('{{{metadata:');

  let mainContent = note.content;
  let metadataBlock = null;

  if (hasMetadata) {
    const [rawMain, rawMeta] = note.content.split('{{{metadata:');
    mainContent = rawMain.trim();

    try {
      const parsedMetadata = JSON.parse(rawMeta.trim());

      metadataBlock = document.createElement('pre');
      metadataBlock.className = 'note-metadata';
      metadataBlock.textContent = JSON.stringify(parsedMetadata, null, 2);
      metadataBlock.style.display = 'none'; // hidden by default

      const toggleButton = document.createElement('button');
      toggleButton.textContent = 'Meta';
      toggleButton.className = 'meta-toggle';
      toggleButton.onclick = () => {
        metadataBlock.style.display =
          metadataBlock.style.display === 'none' ? 'block' : 'none';
      };

      container.appendChild(toggleButton);
      container.appendChild(metadataBlock);
    } catch (err) {
      console.warn('Failed to parse metadata:', err);
    }
  }

  const contentBlock = document.createElement('p');
  contentBlock.textContent = mainContent;
  container.appendChild(contentBlock);

  return container;  // but the calling function can't handle a container.
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
        console.log('renderNotes()');
        const filteredNotes = filterNotesAccordingToUserChoices(notes);
//could do something if no notes - could explain and allow removal of filters or just explain and return-
        const output = document.getElementById('output');        
        let previousInt = null;

        const notesHtml = filteredNotes
          .map(note  =>  {
            // Skip if sort_int is the same as the previous one.  The view had >1 entry for each note because one row for each tag.
            // although asking for a page of 10, how many notes depends on how may tags each note has. Probably get 3 to 6
            //BUT Jan 7 2026 this has changed to a view that has the tags in an array in one column
            if (note.sort_int === previousInt) {
              return null;
            }
            previousInt = note.sort_int;
        
            const content = escapeHtml(note.content || '');
        
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
  note,
        id: note.id,
        int:note.sort_int,
        author:note.author_name, //why was note.name undefined?
        authorId:note.author_id,
        audienceId:note.audience_id, //14:47 Jan 10
        audienceName :note.audience_name,
        rawStatus: note.status,
        statusAttr: statusAttr,
        statusText: statusText
      });
      
         
          return  getHTMLofUserChoices() + `
              <div class="mb-3"  ">
          <div   class="bg-white p-4 rounded-lg border  hover:shadow-sm transition-all cursor-pointer group"
               >
            
            <!-- Status bar - top center -->

            <div data-action="change-status" data-note-id="${note.id}" ${statusClass} class=" flex items-center justify-center mb-3 py-1 bg-gray-50 rounded text-xs font-medium text-gray-600" >
              
            <div class="status-bar"  >
            <span>Status: ${statusText}</span>
              ${iconHTML ? `<span class="ml-2">${iconHTML}</span>` : ''}
              <span class="mx-2">•</span>
              <span>Click anywhere to cycle through status choices</span>
           </div>
              
           </div>
                
                <!-- Note content -->
                <div data-note-id="${note.id}-body" 
                
                data-note-content= "${content}" 
                data-note-name="${note.author_name}" 
                data-note-int="${note.sort_int}"  
                data-note-author-id="${note.author_id}"
                data-note-audience-id=${note.audience_id}" 
            
            "class="space-y-2 text-sm text-gray-800">
                  <p class="flex items-center">
                    <span class="font-medium w-20">#:</span>
                    <span class="text-gray-600">${note.sort_int}</span>
                  </p>
                  <p class="flex items-center">
                    <span class="font-medium w-20">Author:</span>
                    <span class="text-gray-600">${note.author_name} -> Audience: ${note.audience_name}</span>
                  </p>
                  <p class="flex items-center">
                    <span class="font-medium w-20">Created:</span>
                    <span class="text-gray-600">${new Date(note.created_at).toLocaleString()}</span>
                  </p>
                  <p class="flex">
                    <span class="font-medium w-20 pt-1">Content:</span>
                   <span class="text-gray-700 flex-1">${content}</span>
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