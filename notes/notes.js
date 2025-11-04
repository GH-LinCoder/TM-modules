// ./notes/notes.js   module based on 'The Lab' notes page. For reporting bugs and part of future messaging system.
import { appState } from '../../state/appState.js';
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { petitionBreadcrumbs } from '../../ui/breadcrumb.js';
//import { saveNoteWithTags } from './saveNoteWithTags.js';
import { setupNotesListeners } from './noteListeners.js';
/*
need to add the js from the lab notes.js
need adjust paths of all imports
adapt db write
*/


console.log('notes.js loaded');

function getTemplateHTML() { console.log('getTemplateHTML()');
  return `  <div id="notes-panel" data-module="notes-panel" >         <div class="flex w-full" >           
            <!-- Tagging above the note input -->
            <!-- Main Tags -->
            <div class="mb-6" id="TagSection001">
              <h4 class="text-md font-semibold mb-3 text-gray-700">🌐 Main click the word</h4>
              <div class="flex flex-wrap gap-2 mb-3">
                <div class="px-2 py-1 border rounded cursor-pointer text-sm flex items-center" id="TagSection002">
                  <input type="checkbox" id="tag-main-bug" name="main" value="bug" checked class="mr-2 text-blue-600">
                  <label for="tag-main-bug">bug</label>
                </div>
                <div class="px-2 py-1 border rounded cursor-pointer text-sm flex items-center" id="TagSection003">
                  <input type="checkbox" id="tag-main-t&m" checked name="main" value="t&m" class="mr-2 text-blue-600">
                  <label for="tag-main-t&m">t&m</label>
                </div>
                <div class="px-2 py-1 border rounded cursor-pointer text-sm flex items-center" id="TagSection004">
                  <input type="checkbox" id="tag-main-lab" name="main" value="lab" class="mr-2 text-blue-600">
                  <label for="tag-main-lab">lab</label>
                </div>
                <div class="px-2 py-1 border rounded cursor-pointer text-sm flex items-center" id="TagSection005">
                  <input type="checkbox" id="tag-main-reply" name="main" value="reply" class="mr-2 text-blue-600">
                  <label for="tag-main-reply">reply</label>
                </div>
              </div>
            </div>
                    
            <!-- Importance Tags -->
            <div class="mb-6" id="TagSection025">
              <h4 class="text-md font-semibold mb-3 text-gray-700">📶 Important?</h4>
              <div class="flex flex-wrap gap-2 mb-3">
                <div class="text-sm flex items-center" id="TagSection026">
                  <input type="radio" id="importance-1" name="importance" value="importance-1" class="mr-2 text-blue-600">
                  <label for="importance-1">1</label>
                </div>
                <div class="text-sm flex items-center" id="TagSection027">
                  <input type="radio" id="importance-2" name="importance" value="importance-2" class="mr-2 text-blue-600">
                  <label for="importance-2">2</label>
                </div>
                <div class="text-sm flex items-center" id="TagSection028">
                  <input type="radio" id="importance-3" name="importance" value="importance-3" checked class="mr-2 text-blue-600">
                  <label for="importance-3">3</label>
                </div>
                <div class="text-sm flex items-center" id="TagSection029">
                  <input type="radio" id="importance-4" name="importance" value="importance-4" class="mr-2 text-blue-600">
                  <label for="importance-4">4</label>
                </div>
                <div class="text-sm flex items-center" id="TagSection030">
                  <input type="radio" id="importance-5" name="importance" value="importance-5" class="mr-2 text-blue-600">
                  <label for="importance-5">5</label>
                </div>
              </div>
            </div> <!--Closes div class="mb-6" -->
          </div><!--closes flex-->

      
         <!-- Note Content Input -->
          <div class="mb-6">
            <textarea id="note-content" 
                      placeholder="Enter your notes here & press [Save/send]... (Use the checkboxes to tag your note for later search & retrieval ) The saved notes can be seen by scrolling down. When you look at saved notes you can click them to mark them as pending, completed or abandonded." 
                      class="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
          </div>
          <!-- More Tagging Section -->
          <!--event tags-->             
          <div class="mb-6" id="TagSection006">
            <div class="flex flex-wrap gap-2 mb-3">
              <div class="px-2 py-1 border rounded cursor-pointer text-sm flex items-center" id="TagSection007">📝
                <input type="checkbox" id="tag-events-diary" name="events" value="diary" checked class="mr-2 text-blue-600">
                <label for="tag-events-diary">diary</label>
              </div>
              <div class="px-2 py-1 border rounded cursor-pointer text-sm flex items-center" id="TagSection008">
                <input type="checkbox" id="tag-events-disaster" name="events" value="disaster" class="mr-2 text-blue-600">
                <label for="tag-events-disaster">disaster</label>
              </div>
              <div class="px-2 py-1 border rounded cursor-pointer text-sm flex items-center" id="TagSection009">
                <input type="checkbox" id="tag-events-triumph" name="events" value="triumph" class="mr-2 text-blue-600">
                <label for="tag-events-triumph">triumph</label>
              </div>
              <div class="px-2 py-1 border rounded cursor-pointer text-sm flex items-center" id="TagSection010">
                <input type="checkbox" id="tag-events-rant" name="events" value="rant" class="mr-2 text-blue-600">
                <label for="tag-events-rant">rant</label>
              </div>
            </div>
          </div>
          <!-- process Tags -->
          <div class="mb-6" id="TagSection011">
            <div class="flex flex-wrap gap-2 mb-3">
              <div class="px-2 py-1 border rounded cursor-pointer text-sm flex items-center" id="TagSection012">🔄
                <input type="checkbox" id="tag-process-todo" name="process" value="to-do" class="mr-2 text-blue-600">
                <label for="tag-process-todo">to do</label>
              </div>
              <div class="px-2 py-1 border rounded cursor-pointer text-sm flex items-center" id="TagSection013">
                <input type="checkbox" id="tag-process-idea" name="process" value="idea" class="mr-2 text-blue-600">
                <label for="tag-process-idea">idea</label>
              </div>
              <div class="px-2 py-1 border rounded cursor-pointer text-sm flex items-center" id="TagSection014">
                <input type="checkbox" id="tag-process-test" name="process" value="test" class="mr-2 text-blue-600">
                <label for="tag-process-test">test</label>
              </div>
              <div class="px-2 py-1 border rounded cursor-pointer text-sm flex items-center" id="TagSection015">
                <input type="checkbox" id="tag-process-blocker" name="process" value="blocker" class="mr-2 text-blue-600">
                <label for="tag-process-blocker">block</label>
              </div>
              <div class="px-2 py-1 border rounded cursor-pointer text-sm flex items-center" id="TagSection016">
                <input type="checkbox" id="tag-process-refactor" name="process" value="refactor" class="mr-2 text-blue-600">
                <label for="tag-process-refactor">refactor</label>
              </div>
              <div class="px-2 py-1 border rounded cursor-pointer text-sm flex items-center" id="TagSection017">
                <input type="checkbox" id="tag-process-hack" name="process" value="hack" class="mr-2 text-blue-600">
                <label for="tag-process-hack">hack</label>
              </div>
            </div>
          </div>
          <!-- business Tags -->     
          <div class="mb-6" id="TagSection018">
            <div class="flex flex-wrap gap-2 mb-3">
              <div class="px-2 py-1 border rounded cursor-pointer text-sm flex items-center" id="TagSection019">💼
                <input type="checkbox" id="tag-business-meeting" name="business" value="meeting" class="mr-2 text-blue-600">
                <label for="tag-business-meeting">meeting</label>
              </div>
              <div class="px-2 py-1 border rounded cursor-pointer text-sm flex items-center" id="TagSection020">
                <input type="checkbox" id="tag-business-review" name="business" value="review" class="mr-2 text-blue-600">
                <label for="tag-business-review">review</label>
              </div>
            </div>
          </div>
          <!-- Resource Tags -->
          <div class="mb-6" id="TagSection021">
            <div class="flex flex-wrap gap-2 mb-3">
              <div class="px-2 py-1 border rounded cursor-pointer text-sm flex items-center" id="TagSection022">📚
                <input type="checkbox" id="tag-resource-insight" name="resource" value="insight" class="mr-2 text-blue-600">
                <label for="tag-resource-insight">insight</label>
              </div>
              <div class="px-2 py-1 border rounded cursor-pointer text-sm flex items-center" id="TagSection023">
                <input type="checkbox" id="tag-resource-resource" name="resource" value="resource" class="mr-2 text-blue-600">
                <label for="tag-resource-resource">resource</label>
              </div>
              <div class="px-2 py-1 border rounded cursor-pointer text-sm flex items-center" id="TagSection024">
                <input type="checkbox" id="tag-resource-howto" name="resource" value="how-to" class="mr-2 text-blue-600">
                <label for="tag-resource-howto">how to</label>
              </div>
            </div>
          </div>
          <!-- Emotional & Experience Tags -->
          <div class="mb-6">
            <h4 class="text-md font-semibold mb-3 text-gray-700">🎭 Emotion & Experience click words</h4>
            <div class="flex flex-wrap gap-2 mb-3">
            </div>
          <!--/div -->
        </div><!-- end of input section -->
        <!-- Buttons -->
        <div class="flex space-x-4">
          <button data-action="clear-all" id="clear-notes" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors">
            Clear note
          </button>
          <button data-action="save-note" id="save-notes" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            Save/Send
          </button>
        </div>
        <!-- Future Functionality Info -->
        <div data-action='output' id='output' class="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p class="text-blue-800">
            <strong>Future functionality:</strong> The implementation of NOTES will become a messaging system. 
            A logging system to record bugs as well as reminders and a scratch pad for temporary 'sticky notes' plus messags between users
          </p>
        </div> 
      </div> ${petitionBreadcrumbs()} </div>` }



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
        console.log('renderNotes()');

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




export function render(panel, petition = {}) {
    console.log('plans Render(', panel, petition, ')');
    panel.innerHTML = getTemplateHTML();
//new 18:20 Nov 4

setupNotesListeners();



     //? query.petitioner : 'unknown';
    //console.log('Petition:', petition);
    //panel.innerHTML+= `<p class="text-xs text-gray-400 mt-4">Context: ${petition.Module} - ${petition.Section} - ${petition.Action}</p>`;
}





//petitioner

// is passed when the adminListeners() function calls appState.setQuery({callerContext: action});
//it has to be called prior to passing it in the query{} object when we call this module
//in adminListeners.js, when we call appState.setQuery(), we need to have added petitioner: petition
//then we can access it here in the render() function
//we can also add a default value of 'unknown' if it is not passed
//so we can see where we are when we open the a new page

//the call here isn't from adminListeners it is from the menu button in the dashboard
//so we need to also assign petitioner: {Module:'dashboard', Section:'menu', Action:'howTo'} when we call this module from the menu button
//we can do this in the dashboardListeners.js file
//we can also add a default value of 'unknown' if it is not passed
