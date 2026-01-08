// Updated displayNotes.js
console.log('displayNotes.js');
//import { createSupabaseClient } from '../db/client.js';
//import { fetchNotes } from "./labNotesToInclude.js";  
//import { renderNotes } from "./labNotesToInclude.js";  
import { executeIfPermitted } from '../registry/executeIfPermitted.js';
import { appState } from '../state/appState.js';
import { collectUserChoices, messageAddress } from './collectUserChoices.js';

const userId = appState.query.userId;

export async function displayNotes(page = 1, totalCount = null) {
  console.log('displayNotes()', { page, totalCount });
  const pageSize = 20;
  
  try {
    const pageOfNotes = await executeIfPermitted(userId, 'fetchNotes', { page, pageSize});  
    //returns { notes: data, totalCount: count };
    console.log('Raw pageOfNotes from fetchNotes:', pageOfNotes);

    const {notes: data, totalCount: count } = pageOfNotes;
    const notes = data || [];
    const actualTotalCount = totalCount || pageOfNotes.totalCount;// why using the label rather than the var & how is it 414 when ther are far fewer?
    
    console.log('displayNotes fetch pageOfNotes:', { notes: notes.length, totalCount: actualTotalCount, page });
    
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

Whether the tags are || or && is determined by the state of the two buttons mentioned above. The highlight function can be adapted to highlight the two buttons that change the logic of the checkboxes (see below) Listeners are already attached (Either set a state variable or let the listener choose one of two functions.

The filtering is done prior to passing the results to the renderNotes() function. 
'pageOfNotes'   holds the data


Read which state has been set from the two buttons

Branch to an OR selection or an AND selection

Loop through the pageOfNotes  forEach mapping into what is to be sent to renderNotes.


 <button data-action="moreClicksMoreNotes" id="more-clicks-more-notes" class="px-4 py-2 bg-green-50 text-black rounded hover:bg-green-100 transition-colors"
          title="The more boxes I click I expect MORE pageOfNotess  (Show me notes that fit this box PLUS notes that fit the other box)">
            More clicks - more notes
          </button>
       
          <button data-action="save-note" id="save-notes" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            Save/Send
          </button>
       
          <button data-action="moreClicksFewerNotes" id="more-clicks-fewer-notes" class="px-4 py-2 bg-red-50 text-black rounded hover:bg-red-100 transition-colors"
          title="The more boxes I click I expect FEWER pageOfNotess (Only show me a note if it fits ALL the boxes I click)">
            More clicks - fewer notes
          </button>

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
*/
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






      export function renderNotes(notes, totalCount, page, pageSize) {
        console.log('renderNotes 12 Nov()');

        const output = document.getElementById('output');
        
        let previousInt = null;

        const notesHtml = notes
          .map(note => {
            // Skip if sort_int is the same as the previous one.  The view had >1 entry for each note because one row for each tag.
            // although asking for a page of 10, how many notes depends on how may tags each note has. Probably get 3 to 6
            //BUT Jan 7 2026 this has changed to a view that has the tags in an array in one column
            if (note.sort_int === previousInt) {
              return null;
            }
            previousInt = note.sort_int;
        
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
  note,
        id: note.id,
        author:note.name,
        authorId:note.author_id,
        rawStatus: note.status,
        statusAttr: statusAttr,
        statusText: statusText
      });
      
          
          return `
              <div class="mb-3"  ">
          <div   class="bg-white p-4 rounded-lg border  hover:shadow-sm transition-all cursor-pointer group"
               >
            
            <!-- Status bar - top center -->

            <div data-action="change-status" data-note-id="${note.id}" ${statusClass} class=" flex items-center justify-center mb-3 py-1 bg-gray-50 rounded text-xs font-medium text-gray-600" >
              
            <div class="status-bar"  >
            <span ">Status: ${statusText}</span>
              ${iconHTML ? `<span class="ml-2">${iconHTML}</span>` : ''}
              <span class="mx-2">•</span>
              <span>Click anywhere to cycle through status choices</span>
           </div>
              
           </div>
                
                <!-- Note content -->
                <div data-note-id="${note.id}-body" 
                
                data-note-content= "${content}" 
                data-note-name="${note.name}" 
                data-note-int="${note.sort_int}"  
                data-note-author-id="${note.author_id}"
            
            "class="space-y-2 text-sm text-gray-800">
                  <p class="flex items-center">
                    <span class="font-medium w-20">#:</span>
                    <span class="text-gray-600">${note.sort_int}</span>
                  </p>
                  <p class="flex items-center">
                    <span class="font-medium w-20">Author:</span>
                    <span class="text-gray-600">${note.name}</span>
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