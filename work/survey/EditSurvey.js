// work/survey/EditSurvey.js
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { appState } from '../../state/appState.js';
import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';
import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';
import {icons} from '../../registry/iconList.js';

console.log('editSurvey.js loaded');

const state = {
  user: appState.query.userId,
  currentSurvey: null,
  currentSurveyId: null,
  questions: [], //edit Task does not have this.
  answers:[], //added 19:00 Dec 5
  items:[],
  currentItemId: null,   //
  //currentStepOrder: null, // optional, but helpful
  currentAutomationId: null, //added 22:57 Nov 29
  //initialStepId: null
};

//let stepId = null; // was on line 705 used for no obvious reason to replaced 'initialStepId'
// used lines 549, 1256, 1273 but always   as =stepId so always null !


let automationsNumber = 0; //added 16:16 Nov 23

export function render(panel, query = {}) {
  console.log('editSurvey.render:', panel, query);
  panel.innerHTML = getTemplateHTML();
  // Initialize clipboard integration
  initClipboardIntegration(panel);
  attachListeners(panel);
  //surveySelect = panel.querySelector('[data-form="surveySelect"]');
}


function getIconByType(type) {
    switch(type){
      case 'task': return icons.task;
      case 'step': return icons.step;
      case 'step-create': return icons.step_create;
      case 'step-update': return icons.step_update;
      case 'manager': return icons.manager;
      case 'manager-assigned': return icons.manager_assigned;
      case 'assignTask': return icons.assignTask;
      case 'automation_task': return icons.automation_task;
      case 'automation_survey': return icons.automation_survey;
      case 'automation_appro': return icons.automation_appro;
      case 'Task automation': return icons.automation_task;
      case 'survey':return icons.surveys;
      
      default: return icons.question;
    }
  }

function styleCardByType(type){
  console.log('styleCardByType()',type);
  switch(type){
      case 'survey':return 'bg-white p-2 rounded border mb-3 text-lg font-bold';
      case 'question':return 'bg-yellow-100 p-2 rounded border mb-1 text-sm font-bold';
      case 'manager-assigned':return 'bg-orange-100 p-2 rounded border mb-1 text-sm font-style: italic ml-4';
      case 'automation_task':return 'bg-blue-100 p-2 border-dotted border-blue-500 rounded border mb-1 text-sm ml-6';    
      case 'automation_survey':return 'bg-green-100 p-2 border-dotted border-green-500 rounded border mb-1 text-sm ml-6';
     case 'automation_appro':return 'bg-yellow-100 p-2 border-dotted border-green-500 rounded border mb-1 text-sm ml-6';
  
      default:return 'bg-gray-100 p-2 rounded border mb-1 text-sm';
  }   
}


function initClipboardIntegration(panel) {
    console.log('initClipboardIntegration()');
  // Check clipboard immediately
  populateFromClipboard(panel);
  // Listen for future changes
  onClipboardUpdate(() => {
    populateFromClipboard(panel);
    populateFromClipboardAuto(panel);
  });
}


function populateFromClipboard(panel) { //for the main dropdown
  console.log('populateFromClipboard()');
  
  // Get tasks or surveys from clipboard
  const surveys = getClipboardItems({ as: 'survey', type: 'surveys' });
  
  
  if (surveys.length === 0) return;

  const surveySelect = panel.querySelector('#surveySelect');//added 16:44 Dec 5
  addClipboardItemsToDropdown(surveys, surveySelect); //the helper builds the drpdown display for any passed element
//moved 12:06 dec 3 from below
  if (surveys.length === 1 && !surveySelect.value) { 
    surveySelect.value = surveys[0].entity.id;
    const infoSection = document.querySelector('#informationSection');
    infoSection.innerHTML += `<div class="p-1 text-sm bg-blue-50 border border-blue-200 rounded">Auto-filled Survey: ${surveys[0].entity.name}</div>`;
  }
  
 const item = surveySelect.value ? surveys.find(t => t.entity.id === surveySelect.value) : surveys[0];
 if (!item) return;
 console.log('Using clipboard item:', item);
  state.currentSurvey = item.entity.item; // full row data
  state.currentSurveyId = item.entity.id;
  console.log('populateFromClip..()surveysSelect.value:',surveySelect.value, 'item.entity.id:',item.entity.id, 'state.currentSurveyId:',state.currentSurveyId);
  // Populate form
  const nameInput = panel.querySelector('#surveyName');
  const descriptionInput = panel.querySelector('#surveyDescription');
  const urlInput = panel.querySelector('#surveyUrl');
  const nameCounter = panel.querySelector('#surveyNameCounter');
  const descriptionCounter = panel.querySelector('#surveyDescriptionCounter');
  
  if (nameInput && state.currentSurvey.name) {
    nameInput.value = state.currentSurvey.name;
    nameCounter.textContent = `${state.currentSurvey.name.length}/64 characters`;
    showToast(`Auto-filled from clipboard: ${state.currentSurvey.name}`, 'info');
  }
  
  if (descriptionInput && state.currentSurvey.description) {
    descriptionInput.value = state.currentSurvey.description;
    descriptionCounter.textContent = `${state.currentSurvey.description.length}/2000 characters`;
  }
  
  if (urlInput && state.currentSurvey.external_url) {
    urlInput.value = state.currentSurvey.external_url;
  }
  
  // Load questions if survey ID is available
  if (state.currentSurveyId) {
    loadSurveyQuestions(panel, state.currentSurveyId); //load then calls renderSurveyStructure - but no output??
  }
}


//New 19:38 Nov 12
function populateFromClipboardAuto(panel) { //for the automations dropdowns
    console.log('populateFromClipboardAuto()');
    
    // Get clipboard items
    const tasks = getClipboardItems({ as: 'task' });
    const surveys = getClipboardItems({ as: 'survey' });
    const approfiles = getClipboardItems({ as: 'other' });
        const managers = getClipboardItems({ as: 'manager' });
    
    
    console.log('Clipboard items loaded:', {
      surveys: surveys.length,
      tasks:tasks.length,
      approfiles: approfiles.length,
      managers: managers.length
    });
    
    // Populate task automation dropdown
    const taskSelect = panel.querySelector('#taskAutomationSelect');
    if (taskSelect) {
      console.log('Populating task automation dropdown with', tasks.length, 'items');
      addClipboardItemsToDropdown(tasks, taskSelect, 'task');
    }
    
    // Populate survey automation dropdown 
    const surveyAutomationSelect = panel.querySelector('#surveyAutomationSelect');
    if (surveyAutomationSelect) {
      console.log('Populating survey automation dropdown with', surveys.length, 'items');
      addClipboardItemsToDropdown(surveys, surveyAutomationSelect, 'survey');
    }


    // Populate approfile automation dropdown
    const approfileSelect = panel.querySelector('#approfileAutomationSelect');
    if (approfileSelect) {
      console.log('Populating approfile automation dropdown with', approfiles.length, 'items');
      addClipboardItemsToDropdown(approfiles, approfileSelect, 'approfile');
    }
    
    // Populate manager automation dropdown (if you want managers in automations too)
    const managerSelect = panel.querySelector('#managerAutomationSelect');
    if (managerSelect) {
      console.log('Populating manager automation dropdown with', managers.length, 'items');
      addClipboardItemsToDropdown(managers, managerSelect, 'manager');
    }
    
    // Also populate the main manager dropdown in the header section
    const headerManagerSelect = panel.querySelector('#managerSelect');
    if (headerManagerSelect) {
      console.log('Populating header manager dropdown with', managers.length, 'items');
      addClipboardItemsToDropdown(managers, headerManagerSelect, 'manager');
    }
  }


function addClipboardItemsToDropdown(items, selectElement) {//helper to build a dropdown display in the supplied element
    console.log('addClipboardItemsToDropdown()');
  if (!items || items.length === 0) return;
  
  items.forEach(item => {
    const existingOption = Array.from(selectElement.options).find(opt => opt.value === item.entity.id);
    if (!existingOption) {
      const option = document.createElement('option');
      option.value = item.entity.id;
      option.textContent = `${item.entity.name} (clipboard)`;
      option.dataset.source = 'clipboard';
      selectElement.appendChild(option);
    }
  });
}


//Originally the header is loaded from the clipboard & then the steps and automations are read from the db
//but if we reload the survey after making any changes we need to read it all from the data base, this requires reading the header, placing the data in the form
//and then calling the steps and automations functions



async function reloadSurveyData(panel){

  loadSurveyQuestions(panel, state.currentSurveyId);

}

//in edit task this called loadTaskSteps
async function loadSurveyQuestions(panel, surveyId) { //readSurveyQuestion: 'id, name, description, author_id, created_at, last_updated_at, question_number' excludes automations
    
    console.log('loadSurveyQuestions()');
    try {  //needs survey_header_id',surveyId
      const questions = await executeIfPermitted(state.user, 'readSurveyQuestion', { surveyId }); //why use a local when we have a global?
      state.questions = questions || [];//is it worth having the intermediate const?
      
      console.log('Loaded questions:', state.questions);//logs okay 13:08 dec 3
      
      // Enable questions section
      const questionsSection = panel.querySelector('#questionsSection');
      if (questionsSection) {
        questionsSection.classList.remove('opacity-50', 'pointer-events-none');
      }
            
    } catch (error) {
      console.error('Error loading  questions:', error);
      showToast('Failed to load  questions', 'error');
    return;
    }
      // Populate questions summary
      renderSurveyStructure(panel); //which also does output of automations
      
      // Populate step select dropdown
      populateQuestionselect(panel);
  }


//in edit task this called populateStepSelect
function populateQuestionselect(panel) {
    console.log('populatequestionSelect()');
  const questionSelect = panel.querySelector('#questionSelect');
  if (!questionSelect) return;
  
  questionSelect.innerHTML = '<option value="">Select a step to edit</option>';
  
  // Add all editable questions
  state.questions
//    .filter(step => step.step_order >= 3)
    .sort((a, b) => a.question_number - b.question_number)
    .forEach(question => {
      const option = document.createElement('option');
      option.value = question.id;
      option.textContent = `Q: ${question.question_number}: ${question.name}`;
      questionSelect.appendChild(option);
    });
  
  // Add option for new step
  const maxQuestion = Math.max(...state.questions.map(s => s.question_number));
  const newQuestionOption = document.createElement('option');
  newQuestionOption.value = maxQuestion + 1;
  newQuestionOption.dataset.new = "true"; //for later to select whether we need an update or an insert(line 1066?). 19:00 Dec 3
  //could put that in the save button too.
  
  newQuestionOption.textContent = `New Question ${maxQuestion + 1}`;
  questionSelect.appendChild(newQuestionOption);
}

function getTemplateHTML() {
  return `
    <div id="editSurveyDialog" class="edit-task-dialogue relative z-10 flex flex-col h-full" data-destination="new-panel">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 z-10 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-xl font-semibold text-gray-900">Edit Survey (cloned from edit task)  10:31 Dec 3</h3>
            <div class="space-y-2">
              <!--label for="surveySelect" class="block text-sm font-medium text-gray-700">Use [Select] menu to choose tasks then this dropdown to load a Survey</label-->
              <select id="surveySelect" data-form="surveySelect" class="flex-1 p-2 border border-gray-300 rounded text-sm">
                <option value="">Use the menu [Select] button then this dropdown to select Survey</option>
              </select>
            </div>


          <button data-action="close-dialog" class="text-gray-500 hover:text-gray-700" aria-label="Close">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        


        <div class="p-6">
          <div class="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200" data-action="selector-dialogue">
            <h4 class="font-medium text-blue-800 mb-2">Instructions:</h4>
           
            <ul class="text-blue-700 text-sm mt-2 space-y-1">
              <li>📋 Auto-fill from clipboard. Click the [Select] menu button </li>  
              <li>• You can modify the name, description, and URL</li>
              <li>• The name must be unique across all existing surveys</li>
              <li>• Click "Update Survey" to save your changes</li>
              <li>• Create a new question with the dropdown</li>
              <li>• Edit existing questions or answers by clicking the summary or use the dropdown</li>
              <li>• Click "Save question / svae answer" to save your changes</li>
              <li>• Automations are added in the section below the summary</li>
              <li>• Click "Save" Automation to add it to the displayed answer</li>  
            </ul>
          </div>


          <div id="editSurveyForm" class="space-y-6 bg-gray-50 p-6 rounded-lg">
            <div>
              <label for="surveyName" class="block text-sm font-medium text-gray-700 mb-1">
                Survey Name *
              </label>
              <input id="surveyName" placeholder="Short & unique name" maxlength="64" required class="w-full p-2 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              <p id="surveyNameCounter" class="text-xs text-gray-500 mt-1">0/64 characters</p>
              <p id="nameError" class="text-xs text-red-500 mt-1 hidden">This name already exists. Please choose a different name.</p>
            </div>

            <div>
              <label for="surveyDescription" class="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea id="surveyDescription" placeholder="Survey description" rows="4" maxlength="2000" required class="w-full p-2 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
              <p id="surveyDescriptionCounter" class="text-xs text-gray-500 mt-1">0/2000 characters</p>
            </div>

            <div>
              <label for="surveyUrl" class="block text-sm font-medium text-gray-700 mb-1">
                URL (Optional)
              </label>
              <input id="surveyUrl" type="url" placeholder="https://example.com" class="w-full p-2 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>

            <button id="saveSurveyBtn" class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
              Update Survey
            </button>
          </div>

          <div id="questionsSection" class="opacity-50 pointer-events-none mt-6">
            <h4 class="text-lg font-medium mb-4">Edit Survey Questions</h4>
            <div class="bg-white p-4 rounded border">
              <form id="editStepForm" class="space-y-4">
                <div class="flex items-center gap-4">
                  <label for="questionSelect" class="block text-sm font-medium text-gray-700">Add a Step:</label>
                  <select id="questionSelect" class="w-full p-2 border rounded">
                    <option value="">New, or select existing</option>
                  </select>
                </div>
                <div>
                  <label for="stepName" class="block text-sm font-medium text-gray-700"> Name of question of answer *</label>
                  <input id="stepName" maxlength="64" placeholder="Step name" required class="w-full p-2 border rounded" />
                  <p id="stepNameCounter" class="text-xs text-gray-500">0/64 characters</p>
                </div>
                <div>
                  <label for="stepDescription" class="block text-sm font-medium text-gray-700">Description *</label>
                  <textarea id="stepDescription" maxlength="2000" placeholder="Description if needed" rows="3" class="w-full p-2 border rounded"></textarea>
                  <p id="stepDescriptionCounter" class="text-xs text-gray-500">0/2000 characters</p>
                </div>
                <div>
                  <label for="stepUrl" class="block text-sm font-medium text-gray-700">URL (Optional)</label>
                  <input id="stepUrl" type="url" placeholder="https://example.com" class="w-full p-2 border rounded" />
                </div>

                <div>  <!-- new 19:23 Nov 24 20025 -->
                  <label for="stepAutomationS" class="block text-sm font-medium text-gray-700">Step Automations</label>
                  <input id="stepAutomationS" class="text-xs text-gray-500" />
                </div>

                <!-- Hidden input for form submission -->
                <input id="stepOrder" type="hidden" />
                <input id="stepId" type="hidden" />
                <button id="saveStepBtn" class="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
                  Save Step
                </button>
              </form>

              <div id="createdSteps" class="hidden mt-4">

                              </div>
<div id="surveySummary" class="space-y-2"></div>

              <!--new 19:18 Nov 12 -->

<div id="automationControls" class="mt-6 bg-green-50 p-4 rounded border border-green-300">
  <h5 class="font-medium text-green-800 mb-2">Add Step Automations</h5>

  <div class="mb-4">
    <label for="surveyAutomationSelect" class="block text-sm font-medium text-gray-700">Assign a Task</label>
    <select id="surveyAutomationSelect" class="w-full p-2 border rounded">
      <option value="">Select a survey to assign</option>
    </select>
    <button type="button" id="saveTaskAutomationBtn" class="mt-2 bg-purple-600 text-white py-1 px-3 rounded hover:bg-purple-700 opacity-50" style="pointer-events: none;">
      Save Task Automation
    </button>
  </div>
<!-- Assign Survey Section -->
              <div class="mt-4 p-3 bg-white rounded border mb-4">
                <h5 class="font-medium text-gray-800 mb-2">Assign a survey</h5>
                <div class="flex gap-2">
                  <select id="surveyAutomationSelect" class="flex-1 p-2 border border-gray-300 rounded text-sm">
                    <option value="">Select a survey to assign</option>
                  </select>
                </div>
                  <button type="button" id="saveSurveyAutomationBtn" class="bg-purple-400 text-white py-1 px-3 rounded hover:bg-blue-700 opacity-50" style="pointer-events: none;">
                    Save Survey Assignment automation
                  </button>
              </div>    
  <div>
    <label for="approfileAutomationSelect" class="block text-sm font-medium text-gray-700">Relate to a Category</label>
    <select id="approfileAutomationSelect" class="w-full p-2 border rounded mb-2">
      <option value="">Select an appro</option>
    </select>
    <select id="relationshipAutomationSelect" class="w-full p-2 border rounded mb-2">
      <option value="">Select relationship</option>
      <option value="a member">a member</option>
      <option value="customer">customer</option>
      <option value="explanation">explanation</option>
    </select>
    <button type="button" id="saveRelationshipAutomationBtn" class="bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700 opacity-50" style="pointer-events: none;">
      Save Relationship Automation
    </button>
  </div>
</div>



<div id="automationSection" class="mt-6">
  <h5 class="text-md font-medium mb-2">Step Automations:</h5>
  <div id="automationCards" class="space-y-2"></div>
</div>


</div>
                     

<div class="bg-green-100 flex flex-col md:flex-row justify-center gap-4 pt-4 border-t border-gray-200">
                            <p class="text-lg font-bold">Information:</p>
                            <div id="informationSection" class="w-full">
                                <!-- Information cards will be added here -->
                            </div>
                        </div>

          </div>
        </div>
      </div>
    </div>
       ${petitionBreadcrumbs()} 
  `;
}

function attachListeners(panel) {
    console.log('attachListeners()');
  const nameInput = panel.querySelector('#surveyName');
  const descriptionInput = panel.querySelector('#surveyDescription');
  const urlInput = panel.querySelector('#surveyUrl');  // never used
  const stepNameInput = panel.querySelector('#stepName');
  const stepDescriptionInput = panel.querySelector('#stepDescription');
  const questionSelect = panel.querySelector('#questionSelect');
  
  const nameCounter = panel.querySelector('#surveyNameCounter');
  const descriptionCounter = panel.querySelector('#surveyDescriptionCounter');
  const stepNameCounter = panel.querySelector('#stepNameCounter');
  const stepDescriptionCounter = panel.querySelector('#stepDescriptionCounter');
  
  const nameError = panel.querySelector('#nameError');
  const saveSurveyBtn = panel.querySelector('#saveSurveyBtn');
  const saveStepBtn = panel.querySelector('#saveStepBtn');

  // Survey header field listeners
  nameInput?.addEventListener('input', e => {
    nameCounter.textContent = `${e.target.value.length}/64 characters`;
    nameError.classList.add('hidden');
    saveSurveyBtn.disabled = false;
    saveSurveyBtn.textContent = 'Update Survey';
  });

  descriptionInput?.addEventListener('input', e => {
    descriptionCounter.textContent = `${e.target.value.length}/2000 characters`;
  });

  // Step field listeners
  stepNameInput?.addEventListener('input', e => {
    stepNameCounter.textContent = `${e.target.value.length}/64 characters`;
  });

  stepDescriptionInput?.addEventListener('input', e => {
    stepDescriptionCounter.textContent = `${e.target.value.length}/2000 characters`;
  });

  // Step selection listener
  // In attachListeners, update the questionSelect change handler:
questionSelect?.addEventListener('change', (e) => {
  const questionId = e.target.value;  //in edit task uses parse to find stepOrder not questionId
  console.log('questionSelect:',questionId);
  if (!questionId) return;
    
    console.log('questionId:', questionId);
    
const q = state.questions.find(q => q.id === questionId);



if (q) {  //in edit task finds step id & then fills if found
  state.currentQuestionId = q.id;
    console.log('Found question:', questionId,':', q.id, q.name);
      // Fill form with data
      panel.querySelector('#stepName').value = q.name || '';
      panel.querySelector('#stepDescription').value = q.description || '';
    //  panel.querySelector('#stepUrl').value = q.external_url || '';
      console.log('Form filled with step data');
}
 else {
      // Clear form for new step
      panel.querySelector('#stepName').value = '';
      panel.querySelector('#stepDescription').value = '';
    //  panel.querySelector('#stepUrl').value = '';
     // panel.querySelector('#stepOrder').value = stepOrder;
      console.log('Form cleared for new step');
    }
  });

  // Button listeners
  saveSurveyBtn?.addEventListener('click', (e) => handleSurveyUpdate(e, panel));
  saveStepBtn?.addEventListener('click', (e) => handleStepUpdate(e, panel));
  panel.querySelector('[data-action="close-dialog"]')?.addEventListener('click', () => panel.remove());


const surveySelect = panel.querySelector('#surveySelect'); //used in edit task  #taskSelect

  surveySelect?.addEventListener('change', (e) => {
    const selectedId = e.target.value;
    const surveys = getClipboardItems({ as: 'survey', type: 'surveys' });
    const selectedItem = surveys.find(t => t.entity.id === selectedId);
    if (!selectedItem) return;
  
    const survey = selectedItem.entity.item;
    panel.querySelector('#surveyName').value = survey.name || '';
    panel.querySelector('#surveyDescription').value = survey.description || '';
    panel.querySelector('#surveyUrl').value = survey.external_url || '';
  
    panel.querySelector('#surveyNameCounter').textContent = `${(survey.name || '').length}/64 characters`;
    panel.querySelector('#surveyDescriptionCounter').textContent = `${(survey.description || '').length}/2000 characters`;
  
    state.currentSurvey = survey;
    state.currentSurveyId = selectedItem.entity.id;
  
    loadSurveyQuestions(panel, state.currentSurveyId);
  });
//end new 17:39 oct 4  
const surveyAutomationSelect = panel.querySelector('#surveyAutomationSelect');
const saveSurveyAutomationBtn = panel.querySelector('#saveSurveyAutomationBtn');

surveyAutomationSelect?.addEventListener('change', () => {
  if (surveyAutomationSelect.value) {
    saveSurveyAutomationBtn.disabled = false;
    saveSurveyAutomationBtn.style.pointerEvents = 'auto';
    saveSurveyAutomationBtn.classList.remove('opacity-50');
  } else {
    saveSurveyAutomationBtn.disabled = true;
    saveSurveyAutomationBtn.style.pointerEvents = 'none';
    saveSurveyAutomationBtn.classList.add('opacity-50');
  }
});

const taskAutoSelect = panel.querySelector('#taskAutomationSelect');
const saveTaskAutomationBtn = panel.querySelector('#saveTaskAutomationBtn');

taskAutoSelect?.addEventListener('change', () => {
  if (taskAutoSelect.value) {
    saveTaskAutomationBtn.disabled = false;
    saveTaskAutomationBtn.style.pointerEvents = 'auto';
    saveTaskAutomationBtn.classList.remove('opacity-50');
  } else {
    saveTaskAutomationBtn.disabled = true;
    saveTaskAutomationBtn.style.pointerEvents = 'none';
    saveTaskAutomationBtn.classList.add('opacity-50');
  }
});

const approSelect = panel.querySelector('#approfileAutomationSelect');
const saveRelateAutomationBtn = panel.querySelector('#saveRelationshipAutomationBtn');

approSelect?.addEventListener('change', () => {
  if (approSelect.value) {
    saveRelateAutomationBtn.disabled = false;
    saveRelateAutomationBtn.style.pointerEvents = 'auto';
    saveRelateAutomationBtn.classList.remove('opacity-50');
  } else {
    saveRelateAutomationBtn.disabled = true;
    saveRelateAutomationBtn.style.pointerEvents = 'none';
    saveRelateAutomationBtn.classList.add('opacity-50');
  }
});


 //new 19:25 Nov 12
  panel.querySelector('#saveTaskAutomationBtn')?.addEventListener('click', (e) => handleTaskAutomationSubmit(e, panel));
  panel.querySelector('#saveSurveyAutomationBtn')?.addEventListener('click', (e) => handleSurveyAutomationSubmit(e, panel));
  panel.querySelector('#saveRelationshipAutomationBtn')?.addEventListener('click', (e) => handleRelationshipAutomationSubmit(e, panel));

}
//new 19:40 Nov 12
    // ========================================
    // DATA OPERATIONS - AUTOMATIONS
    // ========================================

async function handleTaskAutomationSubmit(e, panel) {
    console.log('handleTaskAutomationSubmit()');
    e.preventDefault();
    
    // BETTER: Check if we have required context first
  //  if (!answerId || !questionId) {
  //      showToast('Please save the answer first', 'error');
  //      return;
   // }
    
    const taskAutomationSelect = panel.querySelector('#taskAutomationSelect');
    const selectedTaskId = taskAutomationSelect?.value;
    
    // Get the selected option text
    const surveyAutomationSelect = panel.querySelector('#surveyAutomationSelect');
    const selectedOption = taskAutomationSelect?.options[surveyAutomationSelect.selectedIndex];
    const taskCleanName = selectedOption?.textContent?.replace(' (clipboard)', '');
    
    const saveTaskAutomationBtn = panel.querySelector('#saveTaskAutomationBtn');
    if (!saveTaskAutomationBtn) {
        showToast('Save button not found', 'error');
        return;
    }
    
    saveTaskAutomationBtn.disabled = true;
    saveTaskAutomationBtn.textContent = 'Saving...'; //? 
    automationsNumber++;    
    
    const managerSelect = panel.querySelector('#managerAutomationSelect'); 
    const managerData = getManagerName(managerSelect);

//making global 14:18 Oct 18
//const stepOrder = currentStepId ? currentStepId.substring(0, 8) : 'unknown'; //unknown  23:12 Oct 17
//cstepOrder = currentStepId ? currentStepId.substring(0, 8) : 'unknown'; //unknown  23:12 Oct 17
// Instead of just showing manager info, show complete context:
addInformationCard({
  'name': `${managerData.managerName}`,
  'id': `${managerData.managerId?.substring(0, 8) || 'unknown'}`,
  'type': 'manager-assigned',
  'for-task': `${taskCleanName?.substring(0, 30) || 'Unknown Task'}`,  // Show which task
  //'on-step': stepOrder || 3,  // Show current step number
  'autoNumber': automationsNumber 
});

    //We need to find the id of step3 of the task we are applying as automation. 
    try { 
        // LOOK UP ALL STEPS FOR THIS TASK
        console.log('Looking up steps for task:', selectedTaskId);
        const steps = await executeIfPermitted(state.user, 'readTaskSteps', {
            taskId: selectedTaskId
        });
        
        // FIND STEP 3 (initial step) - WHY? why are we finding step 3????
        //we need the current step. Where is current step stored????
        
        const initialStep = steps.find(step => step.step_order === 3);
        if (initialStep && initialStep.id) {
            state.initialStepId = initialStep.id;
            console.log('Found initial step_id:', state.initialStepId);  // got it 10:58 Oct 15
        } else {
            throw new Error(`No initial step (step 3) found for task ${selectedTaskId}`);
        }
        console.log(

          'state.initialStepId,:', state.initialStepId,
          'state.user:', state.user, //should be null because usually this is a future unknown person
          'managerData.managerId:', managerData.managerId,     
          'selectedTaskId:', selectedTaskId,
          'taskCleanName:', taskCleanName,
          'currentStepId',state.currentStepId, 
          'auto#:', automationsNumber 
        ); 
// we don't know the currentStepId !!! 

//function needs:  const { survey_answer_id, task_header_id, task_step_id, name, automation_number } = payload;
        const result = await executeIfPermitted(state.user, 'createAutomationAddTaskBySurvey', { 
       survey_answer_id : state.currentAnswerId, // where get annswer id?

       //       manager_id: managerData.managerId, // needs to be from the dropdown    
       task_header_id: selectedTaskId,
            task_step_id: state.initialStepId, // 
            name: taskCleanName || 'Unknown Task', // 
            automation_number: automationsNumber
        });
        
        
        addInformationCard({ //where get the data?
          'name': `${taskCleanName?.substring(0, 60) || 'Unknown Task'}...`,
          'type': 'automation_task',
          'answer': result.name,  // ?? answer is not defined 16:49 dec 5
          'taskId': `${selectedTaskId?.substring(0, 8) || 'unknown'}...`,
          'Auto-id': `${result.id?.substring(0, 8) || 'unknown'}...`
        });
        
        showToast('Task automation saved successfully!');
        reloadSurveyData(panel);  // new 20:47 Nov 29
    } catch (error) { console.log(error.message);
        showToast('Failed to save task automation: ' + error.message, 'error');
         automationsNumber--; // ROLLBACK: Decrement on failure
    }
    
    saveTaskAutomationBtn.disabled = false;
    saveTaskAutomationBtn.textContent = 'Save Task';
}

function addInformationCard(itemData) { 
  console.log('addInformationCard()');
  const infoSection = document.querySelector('#informationSection');
  const card = document.createElement('div');
 // card.className = 'bg-white p-2 rounded border mb-1 text-sm';
 const style = styleCardByType(itemData.type);
 console.log('style:',style);
 card.className= style;
//       card.className = styleCardByType(itemData.type); //not calling the function
  // Create display text by iterating through all properties
  let displayText = ''; // used to be 'Saved' but seems redundant
  
  // Iterate through all properties in the object
  for (const [key, value] of Object.entries(itemData)) {
      if (key !== 'timestamp') {
          displayText += `, ${key}: ${value}`;
      }
  }
  console.log('type',itemData.type);
  const icon = getIconByType(itemData.type);
  card.textContent = icon + displayText;
  infoSection.appendChild(card);
  
  // Add to steps array
  state.items.push(itemData);
  console.log('steps array:', state.items);
}


function getManagerName(managerSelect) {
    console.log('getManagerName()');
  // BETTER MANAGER SELECTION:
  let managerId, managerName;
  
  // Check if we have a valid selection first
  if (managerSelect && managerSelect.value && managerSelect.selectedIndex > 0) {
      // Valid selection made
      const selectedOption = managerSelect.options[managerSelect.selectedIndex];
      const rawName = selectedOption?.textContent;
      
      // Only process if we got a real name
      if (rawName && rawName !== 'Select a manager (optional)' && rawName !== 'Select a manager') {
          managerName = rawName.replace(' (clipboard)', '');
          managerId = selectedOption.value;
      } else {
          // Got placeholder text or empty - use default
          managerId = state.user;
          managerName = 'The Author';
      }
  } else {
      // No selection or invalid selection - use default
      managerId = state.user;
      managerName = 'The Author';
  }
  
  console.log('Selected manager:', managerId, managerName);
  return { managerName: managerName, managerId: managerId };
}



async function handleSurveyAutomationSubmit(e, panel) {
    console.log('handleSurveyAutomationSubmit()');
    e.preventDefault();
  
  const taskSelect = panel.querySelector('#taskAutomationSelect');
  const selectedTaskId = taskSelect?.value;

  const surveyAutomationSelect = panel.querySelector('#surveyAutomationSelect');
  const selectedSurveyId = surveyAutomationSelect?.value;
  
  // Get the selected option text
  const selectedOption = surveyAutomationSelect?.options[surveyAutomationSelect.selectedIndex];
  const surveyCleanName = selectedOption?.textContent?.replace(' (clipboard)', '');
  
  const saveSurveyAutomationBtn = panel.querySelector('#saveSurveyAutomationBtn');
  if (!saveSurveyAutomationBtn) {
      showToast('Save button not found', 'error');
      return;
  }
  
  saveSurveyAutomationBtn.disabled = true;
  saveSurveyAutomationBtn.textContent = 'Saving...'; //? 
  automationsNumber++;    
  
  //this could be a function only for tasks... This was to know the source id, but is wrong for surveys

  const initialStep = state.items.find(step => step.step_order === 3);
  if (initialStep && initialStep.id) {
      state.initialStepId = initialStep.id;
      console.log('Found initial step_id:', state.initialStepId);  // got it 10:58 Oct 15
  } else {
      throw new Error(`No initial step (step 3) found for task ${selectedTaskId}`);
  }

    
try{
console.log('state.initialStepId',state.initialStepId, //need this 
  'state.currentItemId',state.currentItemId, //that is for byTask .
  'surveyId',selectedSurveyId, 
  'name',surveyCleanName, 
'auto#',automationsNumber);

//function needs:   const { survey_answer_id, survey_header_id, name, automation_number } = payload;


const result = await executeIfPermitted(state.user, 'createAutomationAddSurveyBySurvey', { 
            survey_answer_id : state.currentItemId, //need this 
            survey_header_id : selectedSurveyId, 
            name: surveyCleanName, 
            automation_number: automationsNumber
     });
     
     
     addInformationCard({
      'name': result.name?.substring(0,30) || 'Name not returned',
      'type': 'automation_survey',
      //'step': stepOrder || 3,  // Show current step number
      //'state.initialStepId':state.initialStepId?.substring(0, 8),
      'autoNumber': automationsNumber, 
      'survey id': result.id?.substring(0, 8) || 'unknown'
      });
     
     showToast('Survey automation saved successfully!');
     reloadSurveyData(panel);
 } catch (error) {
     showToast('Failed to save survey automation: ' + error.message, 'error');
      automationsNumber--; // ROLLBACK: Decrement on failure
 }
  saveSurveyAutomationBtn.disabled = false;
  saveSurveyAutomationBtn.textContent = 'Save Survey';
}





//new 19:40 Nov 12

  async function handleRelationshipAutomationSubmit(e, panel) {
    console.log('handleRelationshipAutomationSubmit()');
    e.preventDefault();
    
    const approfileSelect = panel.querySelector('#approfileAutomationSelect'); // Changed ID to match task module
    const relationshipSelect = panel.querySelector('#relationshipAutomationSelect'); // Changed ID to match task module
    
    const selectedApproId = approfileSelect?.value;
    // Get the selected option text
    const selectedOption = approfileSelect?.options[approfileSelect.selectedIndex];
    const cleanName = selectedOption?.textContent?.replace(' (clipboard)', '') || 'Unknown Approfile';
    
    const selectedRelationship = relationshipSelect?.value;
    
    if (!selectedApproId) {
        showToast('Please select an approfile first', 'error');
        return;
    }
    
    if (!selectedRelationship) {
        showToast('Please select a relationship type', 'error');
        return;
    }
    
    e.target.disabled = true;
    e.target.textContent = 'Saving...';

    automationsNumber++;        
    
    try {  
        // Save relationship automation to database
//function needs: const { survey_answer_id, appro_is_id, relationship, of_appro_id, name, automation_number } = payload;
//db needs 
        console.log('state.currentStepId',state.currentItemId, 'selectedApproId:', selectedApproId); //undefined here 16:15 Nov 26
        const result = await executeIfPermitted(state.user, 'createAutomationRelateBySurvey', { 
            survey_answer_id:  state.currentAnswerId,    // NULL
            of_appro_id: selectedApproId,       //of_appro_id     
            name: cleanName,                        
            relationship: selectedRelationship,         
            automation_number: automationsNumber   
        });
        
        // Add information card - ADAPTED FOR TASKS
         addInformationCard({
            'name': `${result.name?.substring(0, 60) || cleanName?.substring(0, 60) || 'Unknown'}...`,
            'relationship': `${result.relationship?.substring(0, 8) || selectedRelationship?.substring(0, 8) || 'unknown'}...`,
            'type': 'automation_appro', 
            'number':  automationsNumber, 
           'answerNumber?':  '?',  // 
          'state.currentAnswerId': state.currentAnswerId?.substring(0,8) || 'unknown',
            'result.id': `${result.id?.substring(0, 8) || 'unknown'}...`,
          'of_aapro_id':  selectedApproId?.substring(0, 8) || 'unknown'  //
        });            
        
        showToast('Relationship automation saved successfully!');
        reloadSurveyData(panel);
    } catch (error) {
        showToast('Failed to save relationship automation: ' + error.message, 'error');
         automationsNumber--; // Rollback on error
    }
    
     // Re-enable the button:
     e.target.disabled = false;
     e.target.textContent = 'Save Relationship';
}






//New 19:38 Nov 12
async function handleSurveyUpdate(e, panel) {
    e.preventDefault();
    console.log('handleSurveyUpdate()');
  
    const name = panel.querySelector('#surveyName')?.value.trim();
    const description = panel.querySelector('#surveyDescription')?.value.trim();
    console.log('name:',name, 'description', description); //logs updated name
    const url = panel.querySelector('#surveyUrl')?.value.trim();
    const saveBtn = panel.querySelector('#saveSurveyBtn');
    const nameError = panel.querySelector('#nameError');
  
    if (!name || !description) {
      showToast('Name and description are required', 'error');
      return;
    }
  
    saveBtn.disabled = true;
    saveBtn.textContent = 'Checking for duplicates...';
  
    try {
      // Check for duplicates only if name has changed
      if (!state.currentSurvey || state.currentSurvey.name !== name) {
        const existing = await executeIfPermitted(state.user, 'readSurveyHeaders', { surveyName: name });
    console.log('duplicate?', existing);
    
        console.log('checkIfExists:', existing);
        
        if (existing && existing.length > 0) {
          nameError.classList.remove('hidden');
          showToast('A survey with this name already exists', 'error');
          saveBtn.disabled = false;
          saveBtn.textContent = 'Choose a different name';
          return;
        }
      }
  
      saveBtn.textContent = 'Updating Survey...';
  console.log('handleSurv update()id:', state.currentSurvey.id,'name:', name,'descr:',description, 'external_url:', url); //looks ok  15:16 Dec 3//state.currentSurveyId null 14:13 Dec 3  id was known on line 998 also in ifP line 59
       //function requires:     const { surveyId, surveyName, surveyDescription} = payload;
      const updatedSurvey = await executeIfPermitted(state.user, 'updateSurvey', {
        surveyId: state.currentSurveyId,
        name:name,
        description:description,
        //external_url: url //? function doesn't use, but should use
      });
  
      showToast('Task updated successfully!');
      saveBtn.textContent = 'Task updated!';
      
      // Update state
      state.currentSurvey = updatedSurvey;
  
      
      // Enable steps section if not already enabled
      const questionsSection = panel.querySelector('#questionsSection');
      if (questionsSection && questionsSection.classList.contains('opacity-50')) {
        questionsSection.classList.remove('opacity-50', 'pointer-events-none');
        loadSurveyQuestions(panel, state.currentSurveyId);
      }
      
    } catch (error) {
      showToast('Failed to update survey: ' + error.message, 'error');
      saveBtn.disabled = false;
      saveBtn.textContent = 'Update Survey';
    }
  }
  


  async function handleStepUpdate(e, panel) {
    e.preventDefault();
    console.log('handleStepUpdate');
  
   // const order = parseInt(panel.querySelector('#stepOrder')?.value);//not relevant
    const stepName = panel.querySelector('#stepName')?.value.trim();
    const stepDescription = panel.querySelector('#stepDescription')?.value.trim();
   // const stepUrl = panel.querySelector('#stepUrl')?.value.trim();
    const saveBtn = panel.querySelector('#saveStepBtn');
  
    if (!state.currentSurveyId || !state.user) {
      showToast('Survey not loaded or user missing', 'error');
      return;
    }

//edit task has rule about not editing steps 1 or 2
//
//
//
//

  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

    //edit task has more steps stepOrder code here
//e is the saving button. It doesn't have dataset.new
//that is in    newQuestionOption.dataset.new = "true"
//it was set as  newQuestionOption = document.createElement('option');
//could put itin saveBtn
//e.target is a button that does not have the dataset console.log('handleStepUpdate(e)',e ); 





const questionSelect = panel.querySelector('#questionSelect');
  if (!questionSelect) return;//console.log( 'Simply using questionSelect.value:',questionSelect.value);


const selectedOption = questionSelect.options[questionSelect.selectedIndex];
const isNew = selectedOption?.dataset.new === "true"; // placed on line 288?

console.log('selectedOption:',selectedOption);

  const choice = selectedOption?.value; //what is this uuid/integer? 
  if(!choice)return; 
console.log('New choice:',choice, 'isNew:',isNew, 'state.surveyId',state.surveyId);

  if (isNew) {//edit task uses if existing step & reacts to exisitng step first
  try{
        console.log('Creating new step: survey_header_id',state.currentSurveyId );//logs ok
        //function needs:   survey_header_id: surveyId, name: questionText, question_number:question_number,
        await executeIfPermitted(state.user, 'createSurveyQuestion', {
          surveyId: state.currentSurveyId,  //error not defined 20:00 dec 4
          questionText:stepName,
          description:stepDescription,
          question_number: choice,
          //stepUrl
        });
        showToast('New step created!', 'success');
}catch (error) {
      console.error('Error saving new step:', error);
      showToast('Failed to save new step: ' + error.message, 'error');
    } 
} else  //existing question or answer 
    { console.log('existing quesion');
  //function needs: id: questionId, name: questionName, description :  questionDescription || null, author_id: userId  
  try{ await executeIfPermitted(state.user, 'updateSurveyQuestion', {
          questionId: state.currentQuestionId,
          questionName: stepName,
          questionDescription:stepDescription,
          //stepUrl
        });
        showToast('Updated successfully!', 'success');
  
   await loadSurveyQuestions(panel, state.currentSurveyId);//added 19:37 dec 4
  
    }catch (error) {
      console.error('Error saving step:', error);
      showToast('Failed to save step: ' + error.message, 'error');
    }
  }

    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Step';
//new 19:39 Nov 12
enableAutomationControls(panel);
  }


  function enableAutomationControls(panel) {
    console.log('enableAutomationControls()');
    const surveyBtn = panel.querySelector('#saveTaskAutomationBtn');
    const relBtn = panel.querySelector('#saveRelationshipAutomationBtn');
  
    [surveyBtn, relBtn].forEach(btn => {
      if (btn) {
        btn.disabled = false;
        btn.style.pointerEvents = 'auto';
        btn.style.opacity = '1';
      }
    });
  }
  

function loadStepIntoEditor(panel,clickedItemId, type){//clicked is the id uuid
  console.log('loadStepIntoEditor() clickedItemId:', clickedItemId);

  console.log('available ids of all the items:', (state.items || []).map(s => s.id));
  state.currentItemId = clickedItemId; //the card that was clicked sets the current step.
console.log('state.currentItemId:',state.currentItemId, 'state',state); // should be == clickedItemId


let item=null;
if(type ==='question')
item = state.questions.find(s => s.id === clickedItemId); //extract this steps data from the array of al the steps data
else if (type ==='answer')
item = state.answers.find(s => s.id === clickedItemId);  // is this the full data of the answer?
//else if (type === 'automation') //not displayed, option is just to delete
console.log('Looking for clickedItemId:', clickedItemId, 'in', state.items.map(s => s.id));
  
//stepOrder = step.question_number;  //used later in saving to db line 1146  // how accommodate answer_number?
    
  if (item) {
    // Fill form with step data
    panel.querySelector('#stepName').value = item.name || '';
    panel.querySelector('#stepDescription').value = item.description || '';
    //panel.querySelector('#stepUrl').value = step.external_url || '';
   // panel.querySelector('#stepOrder').value = stepOrder; // Ensure this is set
    console.log('Form filled with step data');
}
}


async function handleDeleteAutomationButton(panel, automationId){
  const deletedBy = state.user;
  console.log('handleDelete  button of', automationId, 'by', deletedBy);
  try {
    await executeIfPermitted(state.user, 'softDeleteAutomation', { automationId, deletedBy });
    showToast('Automation deleted');
    
reloadSurveyData(panel);
     }catch(error) {       console.error('Error deleting:', error);
    showToast('Failed to delete automation', 'error');
  }
}


// Attach listeners to the summary panel
function attachStepsListeners(panel) {
  console.log('attachStepsListeners()');

  panel.addEventListener('click', (e) => {
    const target = e.target.closest(
      '.clickable-item, .clickable-automation, .deleteAutomationBtn, #addStepBtn'
    );
    if (!target) return;
console.log('steps listener event-target:', target, 'target.id',target.id, 'target.dataset.id',target.dataset.id,'target.data.id undefined');
    const saveBtn = panel.querySelector('#saveSurveyBtn');
    // Save button optional; do not hard-depend on it to load the editor
    const sectionToEditEl = panel.querySelector('#editSectionLabel'); // optional status label

    if (target.classList.contains('clickable-item')) {
      const type = target.dataset.type; // 'survey', 'question', etc. 
      const clickedItemId = target.dataset.id; // is this an id or a DOM element?
      state.currentItemId = clickedItemId;
      
      console.log('target.dataset',target.dataset);//DOMStringMap{Id->"9e63.."}
     // panel.querySelector('#stepOrder').value = stepOrder; // This is only used in editTask not in surveys
      if (saveBtn) { saveBtn.textContent = 'Edit'; saveBtn.disabled = false; }
      if (sectionToEditEl) sectionToEditEl.textContent = 'step';
      
      loadStepIntoEditor(panel, clickedItemId, type); //  
      markActiveStepInSummary(panel);
    //  hideAutomationsUI(panel);

    } else if (target.classList.contains('clickable-automation')) {
      const clickedItemId = target.dataset.id;
      const automationId = target.dataset.automationId;
      state.currentItemId = clickedItemId;
      state.currentAutomationId = automationId;
      if (saveBtn) { saveBtn.textContent = 'Manage automations'; saveBtn.disabled = false; }
      if (sectionToEditEl) sectionToEditEl.textContent = 'automation';
     

    } else if (target.classList.contains('deleteAutomationBtn')) {
      
      console.log('Clicked the:',target.textContent);
      const automationId = target.dataset.id;
     
      if(target.textContent ==   'Click to confirm Delete this automation') {handleDeleteAutomationButton(panel, automationId)}
      else target.textContent = 'Click to confirm Delete this automation' ;

    } else if (target.id === 'addStepBtn') {
    //  handleAddStep(panel);
    }
  });
}


function renderSurveyHeaderCard(list, survey) {
  if (!survey) return;

  //const summary = panel.querySelector('#surveySummary');
  //if (!summary) return;

  const card = document.createElement('div');
     card.dataset.stepOrder='0';//questions & answers start at 1.  0 being used to say 'header'
     card.dataset.surveyId = survey.id;
     card.dataset.type = 'header';
 // card.className = styleCardByType('survey');
    card.className = 'clickable-item hover:scale-105 transition-transform bg-gray-50 border-l-4 border-blue-400 rounded-lg p-3 mb-2 shadow-sm hover:shadow-md';
    card.innerHTML = `
    <strong>Survey: ${survey.name}</strong>
    ${survey.description ? `<div class="text-sm text-gray-700">${survey.description.substring(0,200) }...</div>` : ''}
    ${survey.external_url ? `<div class="text-xs text-blue-600">${survey.external_url}</div>` : ''}
    ${survey.id}
  `;

  list.appendChild(card);
}

function renderItemCard(summary,item, type){
console.log('item',item, 'summary',summary,'type',type);
    const stepCard = document.createElement('p');
    stepCard.dataset.type = type; 
    stepCard.className = `clickable-item data-type=${type} hover:scale-105 transition-transform bg-blue-50 border-l-4 border-blue-400 rounded-lg p-3 mb-2 shadow-sm hover:shadow-md`;
    stepCard.dataset.id = item.id;
    stepCard.innerHTML = `
      <strong>Item ${item.question_number}:</strong> ${item.name}
      <span class="block text-sm text-gray-600 whitespace-pre-line">${item.description || ''}</span>
    `;
console.log('stepCard',stepCard);
    summary.appendChild(stepCard);
}


function markActiveStepInSummary(panel) {
    console.log('markActiveStepInSumary()');
  panel.querySelectorAll('.clickable-item').forEach(el => {
    console.log('el.dataset.id',el.dataset.id, 'currentItemId',state.currentItemId);
    el.classList.toggle('ring-4', el.dataset.id === String(state.currentItemId));
    el.classList.toggle('ring-blue-500', el.dataset.id === String(state.currentItemId));
    el.classList.toggle('bg-blue-100', el.dataset.id === String(state.currentItemId));
  });
}


function renderSurveyStructure(panel) {
  const summary = panel.querySelector('#surveySummary');
  if (!summary) return; //summary is a DOM element id="surveySummary" innerText="Summary" inner.HTML="<h3>Summary:</h3><br>" Or is by the time the console logs it

console.log('renderSurveyStructure():', 'state',state); //
//object user:  currentSurvey:object id:, name:, description:, author_id:, automations:null, created_at:, last_updated_at:, length:, 
//currentSurveyId:, initialStepId:null, questions[] of objects id: name: description: created_at: last_updated_at, question_number:
  summary.innerHTML = '<h3>Summary:</h3><br>';
      renderSurveyHeaderCard(summary, state.currentSurvey);
  state.questions.forEach(card => { //state.questions[] is an array

renderItemCard(summary,card,"question");

/*
    console.log('card in renderSurveyStruc..():',card); //card logged - shows question
    const stepCard = document.createElement('p');
    stepCard.className = 'clickable-item data-type="question" hover:scale-105 transition-transform bg-blue-50 border-l-4 border-blue-400 rounded-lg p-3 mb-2 shadow-sm hover:shadow-md';
    stepCard.dataset.id = card.id;//
    stepCard.dataset.type = 'question'; 
    stepCard.innerHTML = `
      <strong>Number ${card.question_number}:</strong> ${card.name}
      <span class="block text-sm text-gray-600 whitespace-pre-line">${card.description || ''}</span>
    card.id:${card.id}`;

    list.appendChild(stepCard);//this does not show-up on screen 14:00 Dec 3
*/
   // Inline automations under the step (styled like survey answers/automations)
    const autosContainer = document.createElement('div');
    autosContainer.className = 'ml-4';
    summary.appendChild(autosContainer);
//    loadStepAutomations(autosContainer, card.id); //the card represents a question, but automations are,t on questions; automations are on answers
  });

  const createdSteps = panel.querySelector('#createdSteps');
  if (createdSteps && state.items.length > 0) createdSteps.classList.remove('hidden');


 if(!panel._listenerAttached) { //renderSurveyStructure is called many times, but only want one listener
  attachStepsListeners(panel); 
  panel._listenerAttached = true; 
}
}


async function loadStepAutomations(container, cardId) {
  try {console.log('loadStepAutomations for cardId',cardId);
    const automations = await executeIfPermitted(state.user, 'readSurveyAutomations', { //can only do this when know the answer_id
      question_id: cardId
    });
    renderAutomationCards(container, automations);
  } catch (error) {
    console.error('Failed to load automations:', error);
    showToast('Could not load automations', 'error');
  }
}

function renderAutomationCards(container, automations) {
    console.log('renderAutomationCards()');
  if (!automations || automations.length === 0) {
    container.innerHTML += `<p class="text-gray-500"><em>No automations</em></p>`;
    return;
  }

  automations.forEach(auto => {
    const p = document.createElement('p');
    p.className = 'clickable-automation hover:scale-105 transition-transform bg-yellow-50 border-l-4 rounded-lg p-3 mb-2 shadow-sm hover:shadow-md';
    p.dataset.stepId = auto.source_task_step_id;
    p.dataset.automationId = auto.id;
console.log('automation',auto);
    // choose border color per type
    const borderClass =
      auto.taskHeaderId ? 'border-yellow-500' :
      auto.survey_header_id ? 'border-yellow-500' :
      auto.relationship ? 'border-yellow-400' : 'border-yellow-300';
    p.classList.add(borderClass);

    if (auto.task_header_id) {
      p.innerHTML = `automation🚂🔧 <strong>Task:</strong> Assign to "${auto.name || 'Unknown Task'}" → assigned to step ${auto.task_step_id || 'Initial'} "${auto.source_task_step_id}"}`;
    } else if (auto.survey_header_id) {
      p.innerHTML = `automation🚂📜 <strong>Survey:</strong> Assign to "${auto.name || 'Unknown Survey'}" "${auto.source_task_step_id}"`;
    } else if (auto.relationship) {
      p.innerHTML = `automation🚂🖇️ <strong>Relation:</strong>  <strong>${auto.approIsName || 'Respondent'}</strong>[${auto.approIsId ||'id?'} ] is → ${auto.relationship} → of <strong> ${auto.name}</strong>[id:${auto.of_appro_id}] "${auto.source_task_step_id}"` ;
    } else {
      p.innerHTML = `❓ <strong>default:</strong> ${JSON.stringify(auto)} "${auto.source_task_step_id}"`;
    }

    const del = document.createElement('button');
    del.className = 'deleteAutomationBtn text-red-600 text-sm ml-4';
    del.dataset.id = auto.id;
    del.dataset.stepId = auto.source_task_step_id;
    del.textContent = 'Delete';

    const row = document.createElement('div');
    row.className = 'ml-6 flex items-center gap-2';
    row.appendChild(del);
    row.appendChild(p);
    

    container.appendChild(row);
  });
}
