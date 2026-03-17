// ./notes/notes.js   module based on 'The Lab' notes page. For reporting bugs and part of future messaging system.
//import { appState } from '../state/appState.js';
//import { executeIfPermitted } from '../registry/executeIfPermitted.js';
//import { showToast } from '../ui/showToast.js';
import { petitionBreadcrumbs } from '../ui/breadcrumb.js';
import { setupNotesListeners } from './noteListeners.js';
import { displayNotes } from './displayNotes.js';
import { getClipboardItems, onClipboardUpdate } from '../utils/clipboardUtils.js';
import { showToast } from '../ui/showToast.js';


console.log('notes.js loaded');

// editing value= to change from text to the int that is listed in the categories table. Keeing the old value =text by changing it to a a data-value = text (in case it is a useful bit of data)
//change 12:26 March 16 2026
function getTemplateHTML() { console.log('getTemplateHTML()');
  return `  <div id="notes-panel" data-module="notes-panel" >         
  
   <!-- added 13:10 Jan 9  Ends on line 234--> <div id="inputs"> 
  <div class="flex w-full" >           
     
            <!-- Message Buttons -->
            <div class="mb-6" id="TagSection001">
              <h4 class="text-md font-semibold mb-3 text-gray-700">🌐 Main click the word</h4>
              <div class="flex flex-wrap gap-2 mb-3">

              <div class="px-2 py-1 border rounded cursor-pointer text-sm flex items-center " id="TagSection047">
                  <input type="radio" id="message-self" name="message-mode" data-value="47" value="self" class="mr-2 text-blue-600" checked>
                  <label for="message-self">self (default)</label>
                </div>
                <div class="px-2 py-1 border rounded cursor-pointer text-sm flex items-center hover:scale-105 transition-transform bg-yellow-50" id="TagSection037" title="Click the note you want to reply to.">
                  <input type="radio" id="message-reply" name="message-mode" data-value="37" value="reply" class="mr-2 text-blue-600">
                  <label for="message-reply">reply: (needs click note)</label>
                </div>
                <div class="px-2 py-1 border rounded cursor-pointer text-sm flex items-center hover:scale-105 transition-transform bg-yellow-50" id="TagSection044"  title="Use the [Select] menu button to choose who you want to send to. That name will be loaded into the dropdown.">
                  <input type="radio" id="message-to" name="message-mode" data-value="44" value="to" class="mr-2 text-blue-600">
                  <label for="message-to">to: (needs dropdown)</label>
                </div>
                <div class="px-2 py-1 border rounded cursor-pointer text-sm flex items-center hover:scale-105 transition-transform bg-yellow-50" id="TagSection046" title="Select whose notes you want to see displayed. Use the [Select] menu button to choose the person or group">
                  <input type="radio" id="message-from" name="message-mode" data-value="46" value="from" class="mr-2 text-blue-600">
                  <label for="message-from">from: (needs dropdown)</label>
                </div>
                
              </div>
            </div>
          </div><!--closes flex-->


          <!-- Audience/Author Dropdown -->
            <div class="space-y-2">
              <label for="respondentSelect" class="block text-sm font-medium text-gray-700">
              Use [Select] menu to choose a name & the buttons to choose to: or from:</label>
              <select id="respondentSelect" data-form="relationSelect" class="flex-1 p-2 border border-gray-300 rounded text-sm "  >
                <option value="">Use the menu [Select] button then this dropdown to select author/audience</option>
              </select>
            </div>

      
         <!-- Note Content Input -->
          <div class="mb-6">
            <textarea   id="note-content" 
                      placeholder="Enter your notes here & press [Save/send]... (Use the checkboxes to tag your note for later search & retrieval ) The saved notes can be seen by scrolling down. When you look at saved notes you can click them to mark them as pending, completed or abandonded." 
                      class="w-full h-32 p-3 border border-gray-300 rounded-lg resize:both; focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
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
        <label for="more-clicks-more-notes"> more-clicks-MORE NOTES</label>
       </div>


        <!--button type="radio" id="more-clicks-more-notes" name="clickLogic" value='more-clicks-more-notes'    class="px-4 py-2 bg-green-50 text-black rounded hover:bg-green-100 transition-colors"
          title="The more boxes I click I expect MORE results  (Show me notes that fit this box PLUS notes that fit the other box)">
            More clicks - MORE NOTES
          </button-->
       
          <button data-action="save-note" id="save-notes" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            Save/Send
          </button>
       
        <div class="bg-red-50" 
        title="The more boxes I click I expect FEWER results  (Only show me a note if it fits ALL the boxes I click)">
        <input type="radio" id="more-clicks-fewer-notes" name="clickLogic" value='more-clicks-fewer-notes' class=" text-blue-600">
        <label for="more-clicks-fewer-notes"> more-clicks-fewer-notes</label>
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
    console.log('plans Render(', panel, petition, ')');
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

function ifOnlyOneItemInDropdownloadAndRenderSurvey(panel, respondents, respondentSelect){
console.log('ifonlyOneItem...');
  if (respondents.length === 1 && !respondentSelect.value) {
    const respondentId =  respondents[0].entity.id;
    respondentSelect.value = respondentId;
    const infoSection = document.querySelector('#informationSection');
    if(infoSection) infoSection.innerHTML += `<div class="p-1 text-sm bg-blue-50 border border-blue-200 rounded">Auto-filled Survey: ${respondents[0].entity.name}</div>`;
  //  console.log('surveySelect.value',surveySelect.value);//uuid
    //state.currentrespondentHeaderId = respondentSelect.value;
console.log('there is an info section');
   // loadAndDisplay(panel, respondentId)// this displays summary if/when there is a single item in the dropdown
    //but no display of new respondent 13:19 Dec 14 - it is displaying it appending to previous summary.
    //need to reset to ''
    }
}


function populateFromClipboard(panel) {
  // Get items from clipboard (adjust type/as as needed)
  let items = getClipboardItems({ as: 'other', type: 'app-human' });
       // items += getClipboardItems({ as: 'other', type: 'app-abstract' }); //fails


    if (items.length === 0) return;
  
  const respondentSelect = panel.querySelector('#respondentSelect');
  if(!respondentSelect) return;
  addClipboardItemsToDropdown(items, respondentSelect);

  ifOnlyOneItemInDropdownloadAndRenderSurvey(panel, items, respondentSelect)
}

function addClipboardItemsToDropdown(items, selectElement) {
    console.log('addClipboardItemsToDropdown()');
  if (!items || items.length === 0) return;
  
  items.forEach(item => {
    const existingOption = Array.from(selectElement.options).find(opt => opt.value === item.entity.id);
    if (!existingOption) {
      const option = document.createElement('option');
      option.value = item.entity.id;
      option.textContent = `${item.entity.name}`;
      option.dataset.source = 'clipboard';
      selectElement.appendChild(option);
    }
  });
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
