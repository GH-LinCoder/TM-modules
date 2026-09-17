// ./notes/notes.js   module based on 'The Lab' notes page. For reporting bugs and part of future messaging system.

import { petitionBreadcrumbs } from '../ui/breadcrumb.js';
import { setupNotesListeners } from './noteListeners.js';
import { displayNotes } from './displayNotes.js';
import { getClipboardItems, onClipboardUpdate } from '../utils/clipboardUtils.js';
import { appState } from '../state/appState.js';
//import { showToast } from '../ui/showToast.js';


console.log('notes.js loaded');

// editing value= to change from text to the int that is listed in the categories table. Keeing the old value =text by changing it to a a data-value = text (in case it is a useful bit of data)
//change 12:26 March 16 2026
function getTemplateHTML() { console.log('getTemplateHTML()');
  return `  <div id="notes-panel" data-module="notes-panel" >         
  
   <!-- added 13:10 Jan 9  Ends on line 234--> <div id="inputs"> 
  <div class="flex flex-col w-full" >
     
            <!-- Message controls -->
            <div class="mb-6" id="message-controls">
          <div class="flex flex-row items-center justify-between">
           <h4 class="text-md font-semibold mb-3 text-gray-700">Message</h4>
             <button data-section="menu" data-action="bug-report" class="text-gray-500 hover:text-gray-700" aria-label="Close">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
             </button>
         </div>

              <label for="toSelect" class="block text-sm font-medium text-gray-700">Send to</label>
              <select id="toSelect" data-form="approSelect" class="w-full p-2 border border-gray-300 rounded text-sm">
                <option value="">Choose an appro</option>
              </select>
              <p class="text-xs text-gray-500">The recipient can be a person, group, task, or concept.</p>
            </div>

      
         <!-- Note Content Input -->
          <div class="mb-6">
            <textarea   id="note-content" 
                      placeholder="Enter your notes here & press [Save/send]... (Use the checkboxes to tag your note for later search & retrieval ) The saved notes can be seen by scrolling down. When you look at saved notes you can click them to mark them as pending, completed or abandonded." 
                      class="w-full h-32 p-3 border border-gray-300 rounded-lg resize:both; focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
          </div>

          <div class="mb-6 space-y-2">
            <label for="fromSelect" class="block text-sm font-medium text-gray-700">Show messages from</label>
            <select id="fromSelect" data-form="approSelect" class="w-full p-2 border border-gray-300 rounded text-sm">
              <option value="">Choose an appro</option>
            </select>
          </div>


          <!-- Tagging Section             The id="TagSection???  has a number that matches the table row id naotes_categories. The dsiplay could be injected from the table.-->
          
          <!-- Importance Tags -->
            <div class="mb-6" id="TagSection025">
              <h4 class="text-md font-semibold mb-3 text-gray-700">📶 Important?</h4>
              <div class="flex flex-wrap gap-2 mb-3">
                <div class="text-sm flex items-center" id="TagSection018">
                  <input type="radio" id="importance-1" name="importance" data-value="importance-1" value="18" class="mr-2 text-blue-600">
                  <label for="importance-1">1</label>
                </div>
                <div class="text-sm flex items-center" id="TagSection020">
                  <input type="radio" id="importance-2" name="importance" data-value="importance-2" value="20" class="mr-2 text-blue-600">
                  <label for="importance-2">2</label>
                </div>
                <div class="text-sm flex items-center" id="TagSection021">
                  <input type="radio" id="importance-3" name="importance" data-value="importance-3" value="21" checked class="mr-2 text-blue-600">
                  <label for="importance-3">3</label>
                </div>
                <div class="text-sm flex items-center" id="TagSection022">
                  <input type="radio" id="importance-4" name="importance" data-value="importance-4" value="22" class="mr-2 text-blue-600">
                  <label for="importance-4">4</label>
                </div>
                <div class="text-sm flex items-center" id="TagSection023">
                  <input type="radio" id="importance-5" name="importance" data-value="importance-5" value="23" class="mr-2 text-blue-600">
                  <label for="importance-5">5</label>
                </div>

                <!-- special HELP! tag -->
               <div class="px-2 py-1 border rounded cursor-pointer text-sm flex items-center" id="TagSection043">
                  <input type="checkbox" id="tag-main-help" name="main" data-value="help" value="43" class="mr-2 text-blue-600">
                  <label for="tag-main-help">Help!</label>
                </div>
                </div>  
            </div> <!--Closes div class="mb-6" -->


          <!--event tags-->             
          <div class="mb-6" id="TagSection006">
            <div class="flex flex-wrap gap-2 mb-3">


               <div class="px-2 py-1 border rounded cursor-pointer text-sm flex items-center" id="TagSection034">
                  <input type="checkbox" id="tag-main-bug" name="main" data-value="bug" value="34" checked class="mr-2 text-blue-600">
                  <label for="tag-main-bug">bug</label>
                </div>
                <div class="px-2 py-1 border rounded cursor-pointer text-sm flex items-center" id="TagSection039">
                  <input type="checkbox" id="tag-main-t&m" checked name="main" data-value="t&m" value="39" class="mr-2 text-blue-600">
                  <label for="tag-main-t&m">t&m</label>
                </div>

              <div class="px-2 py-1 border rounded cursor-pointer text-sm flex items-center" id="TagSection009">📝
                <input type="checkbox" id="tag-events-diary" name="events" data-value="diary" value="9" checked class="mr-2 text-blue-600">
                <label for="tag-events-diary">diary</label>
              </div>
              <div class="px-2 py-1 border rounded cursor-pointer text-sm flex items-center" id="TagSection015">
                <input type="checkbox" id="tag-events-disaster" name="events" data-value="disaster" value="15" class="mr-2 text-blue-600">
                <label for="tag-events-disaster">disaster</label>
              </div>
              <div class="px-2 py-1 border rounded cursor-pointer text-sm flex items-center" id="TagSection016">
                <input type="checkbox" id="tag-events-triumph" name="events" data-value="triumph" value="16" class="mr-2 text-blue-600">
                <label for="tag-events-triumph">triumph</label>
              </div>
              <div class="px-2 py-1 border rounded cursor-pointer text-sm flex items-center" id="TagSection017">
                <input type="checkbox" id="tag-events-rant" name="events" data-value="rant" value="17" class="mr-2 text-blue-600">
                <label for="tag-events-rant">rant</label>
              </div>
            </div>
          </div>
          <!-- process Tags -->
          <div class="mb-6" id="TagSection011">
            <div class="flex flex-wrap gap-2 mb-3">
              <div class="px-2 py-1 border rounded cursor-pointer text-sm flex items-center" id="TagSection002">🔄
                <input type="checkbox" id="tag-process-todo" name="process" data-value="to-do" value="2" class="mr-2 text-blue-600">
                <label for="tag-process-todo">to do</label>
              </div>
              <div class="px-2 py-1 border rounded cursor-pointer text-sm flex items-center" id="TagSection003">
                <input type="checkbox" id="tag-process-idea" name="process" data-value="idea" value="3" class="mr-2 text-blue-600">
                <label for="tag-process-idea">idea</label>
              </div>
              <div class="px-2 py-1 border rounded cursor-pointer text-sm flex items-center" id="TagSection004">
                <input type="checkbox" id="tag-process-test" name="process" data-value="test" value="4" class="mr-2 text-blue-600">
                <label for="tag-process-test">test</label>
              </div>
              <div class="px-2 py-1 border rounded cursor-pointer text-sm flex items-center" id="TagSection005">
                <input type="checkbox" id="tag-process-blocker" name="process" data-value="blocker" value="5" class="mr-2 text-blue-600">
                <label for="tag-process-blocker">block</label>
              </div>
              <div class="px-2 py-1 border rounded cursor-pointer text-sm flex items-center" id="TagSection007">
                <input type="checkbox" id="tag-process-refactor" name="process" data-value="refactor" value="7" class="mr-2 text-blue-600">
                <label for="tag-process-refactor">refactor</label>
              </div>
              <div class="px-2 py-1 border rounded cursor-pointer text-sm flex items-center" id="TagSection012">
                <input type="checkbox" id="tag-process-hack" name="process" data-value="hack" value="12" class="mr-2 text-blue-600">
                <label for="tag-process-hack">hack</label>
              </div>
            </div>
          </div>
          <!-- business Tags -->     
          <div class="mb-6" id="TagSection018">
            <div class="flex flex-wrap gap-2 mb-3">
              <div class="px-2 py-1 border rounded cursor-pointer text-sm flex items-center" id="TagSection008">💼
                <input type="checkbox" id="tag-business-meeting" name="business" data-value="meeting" value="8" class="mr-2 text-blue-600">
                <label for="tag-business-meeting">meeting</label>
              </div>
              <div class="px-2 py-1 border rounded cursor-pointer text-sm flex items-center" id="TagSection038">
                <input type="checkbox" id="tag-business-review" name="business" data-value="review" value="38" class="mr-2 text-blue-600">
                <label for="tag-business-review">review</label>
              </div>
            </div>
          </div>
          <!-- Resource Tags -->
          <div class="mb-6" id="TagSection021">
            <div class="flex flex-wrap gap-2 mb-3">
              <div class="px-2 py-1 border rounded cursor-pointer text-sm flex items-center" id="TagSection010">📚
                <input type="checkbox" id="tag-resource-insight" name="resource" data-value="insight" value="10" class="mr-2 text-blue-600">
                <label for="tag-resource-insight">insight</label>
              </div>
              <div class="px-2 py-1 border rounded cursor-pointer text-sm flex items-center" id="TagSection011">
                <input type="checkbox" id="tag-resource-resource" name="resource" data-value="resource" value="11" class="mr-2 text-blue-600">
                <label for="tag-resource-resource">resource</label>
              </div>
              <div class="px-2 py-1 border rounded cursor-pointer text-sm flex items-center" id="TagSection013">
                <input type="checkbox" id="tag-resource-howto" name="resource" data-value="how-to" value="13" class="mr-2 text-blue-600">
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
       
        <div class="bg-green-50" 
        title="The more boxes I click I expect MORE results  (Show me notes that fit this box PLUS notes that fit the other box)">
        <input type="radio" id="more-clicks-more-notes" name="clickLogic" value='more-clicks-more-notes' class=" text-blue-600" checked>
        <label for="more-clicks-more-notes"> MORE NOTES -click more tags</label>
       </div>


       
          <button data-action="save-note" id="save-notes" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            Save/Send
          </button>
       
        <div class="bg-red-50" 
        title="The more boxes I click I expect FEWER results  (Only show me a note if it fits ALL the boxes I click)">
        <input type="radio" id="more-clicks-fewer-notes" name="clickLogic" value='more-clicks-fewer-notes' class=" text-blue-600">
        <label for="more-clicks-fewer-notes">Fewer notes if I select more tags</label>
       </div>


          <!--button type="radio" name="clickLogic" value='click-fewer-seen' checked data-action="moreClicksFewerNotes" id="more-clicks-fewer-notes" class="px-4 py-2 bg-red-50 text-black rounded hover:bg-red-100 transition-colors"
          title="The more boxes I click I expect FEWER results (Only show me a note if it fits ALL the boxes I click)">
            More clicks - fewer notes
          </button-->
       
        </div>
</div><!-- added jan 10-->
   
        <!-- Future Functionality Info -->
        <div data-action='output' id='output' class="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p class="text-blue-800">
            <strong>Future functionality:</strong> The implementation of NOTES will become a messaging system. 
            A logging system to record bugs as well as reminders and a scratch pad for temporary 'sticky notes' plus messags between users
          </p>
        </div> 
      </div> ${petitionBreadcrumbs()} </div>` }


export function render(panel, petition = {}) {
    console.log('notes Render(', panel, petition, ')');
    panel.innerHTML = getTemplateHTML();
//new 18:20 Nov 4

setupNotesListeners();
displayNotes();


initClipboardIntegration(panel)
     // query.petitioner : 'unknown';
    //console.log('Petition:', petition);
    //panel.innerHTML+= `<p class="text-xs text-gray-400 mt-4">Context: ${petition.Module} - ${petition.Section} - ${petition.Action}</p>`;


  }

///// CLIPBOARD AWARE ////

function initClipboardIntegration(panel) {
    console.log('initClipboardIntegration()');
  // Check clipboard immediately
  populateFromClipboard(panel);
  // Listen for future changes
  onClipboardUpdate(() => {
    populateFromClipboard(panel);
  
  });
}

function populateFromClipboard(panel) {
  const items = getClipboardItems({ as: 'other' });
  const toSelect = panel.querySelector('#toSelect');
  const fromSelect = panel.querySelector('#fromSelect');
  if (!toSelect || !fromSelect) return;

  const loggedInId = appState.query.userId;
  const loggedInItem = loggedInId ? [{
    entity: {
      id: loggedInId,
      name: appState.query.userName || 'My appro',
      type: 'app-human'
    }
  }] : [];
  const approItems = [...loggedInItem, ...items];
  addClipboardItemsToDropdown(approItems, toSelect, loggedInId);
  addClipboardItemsToDropdown(approItems, fromSelect, loggedInId);
}

function addClipboardItemsToDropdown(items, selectElement, defaultId = null) {
    console.log('addClipboardItemsToDropdown()');
  if (!items || items.length === 0) return;

  const selectedValue = selectElement.value || defaultId || '';
  items.forEach(item => {
    if (!item.entity?.id) return;
    const existingOption = Array.from(selectElement.options).find(opt => opt.value === item.entity.id);
    if (!existingOption) {
      const option = document.createElement('option');
      option.value = item.entity.id;
      option.textContent = `${item.entity.name || item.entity.id}`;
      option.dataset.source = 'clipboard';
      option.dataset.approType = item.entity.type || '';
      selectElement.appendChild(option);
    }
  });
  if (selectedValue && Array.from(selectElement.options).some(option => option.value === selectedValue)) {
    selectElement.value = selectedValue;
  }
}





/// eof clipboard




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