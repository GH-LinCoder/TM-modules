// work/survey/editSurvey.js  //changed back to lower case because no longer a class  16:00 dec 11 2025
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { appState } from '../../state/appState.js';
import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';
import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';
import {icons} from '../../registry/iconList.js';
//import{readSurveyNormalised} from './readSurveyNormal.js';

console.log('editSurvey.js loaded');

///Globals
const state = {
  user : null,
  currentSurveyHeader: null,
  currentSurveyHeaderId: null,
  
currentSurveyView:null, // readSurveyView() places the surveyView into currentSurveyView

  header:null,
  questions: [], //edit Task does not have this.
  answers:[], //added 19:00 Dec 5
  automations:[],

  items:[],  //steps[] in edit task
  currentItemId: null,   // currentStepId in tasks
  currentItemNumber:null, //in tasks
  currentItemType:null,
  currentAutomationId: null, //added 22:57 Nov 29
  //initialStepId: null
};

export function render(panel, query = {}) {
  console.log('render:');
  panel.innerHTML = getTemplateHTML();
  // Initialize clipboard integration
  attachListeners(panel);//moved above init 19:00 dec 9
  initClipboardIntegration(panel);
}


// READ SURVEY VIEW

async function readSurveyView(surveyId){
  console.log('readSurveyView');
    const userId = appState.query.userId;  // this is what ? it is huyie. Why use this?
const rows = await executeIfPermitted(userId, 'readSurveyView', { survey_id: surveyId});
state.currentSurveyView = rows; //turn the survey into a global for this module 
//console.log('readSurveyView', state.currentSurveyView);
return rows;

}




////////   RENDER SUMMARY 

function getIconByType(type) { // not really needed as whatever calls this could directly call icons.
  console.log('getIconByType');
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
      case'answer':return icons.answer;
      case'automation':return icons.automation;
      
      default: return icons.question;
    }
  }


function renderSurveyHeaderCard(summary, row) {
  console.log('renderSurveyHeaderCard');
  if (!row) return;

  //const summary = panel.querySelector('#surveySummary');
  //if (!summary) return;
  //console.log('renderSurveyHeaderCard:');
let icon = getIconByType('survey');
  const card = document.createElement('div');
     card.dataset.stepOrder='0';//questions & answers start at 1.  0 being used to say 'header'
     card.dataset.surveyId = row.survey_id;
     card.dataset.type = 'header';
 // card.className = styleCardByType('survey');
    card.className = 'clickable-item hover:scale-105 transition-transform bg-orange-50 border-l-4 border-orange-400 rounded-lg p-3 mb-2 shadow-sm hover:shadow-md';
    card.innerHTML = `
    <strong>${icon} Survey: ${row.survey_name}</strong>
    ${row.survey_description ? `<div class="text-sm text-gray-700">${row.survey_description.substring(0,200) }...</div>` : ''}
    ${row.survey_external_url ? `<div class="text-xs text-blue-600">${row.survey.external_url}</div>` : ''}
    ${row.survey_id}
  `;

  summary.appendChild(card);
}


function renderQuestionCard(summary,row, type){
console.log('renderQuestionCard');
if(type!=='question') return;
let icon = getIconByType('question');
    const stepCard = document.createElement('p');
    stepCard.dataset.type = type; 
    
    stepCard.className = `clickable-item data-type=${type} hover:scale-105 transition-transform bg-blue-50 border-l-4 border-blue-400 rounded-lg p-3 mb-2 shadow-sm hover:shadow-md ml-2`;
stepCard.dataset.id = row.question_id; 
   stepCard.innerHTML = `
      <strong>${icon} ${type}: ${row.question_number}:</strong> ${row.question_name}
      <span class="block text-sm text-gray-600 whitespace-pre-line">${row.question_description || ''}</span>
      ${row.question_id}
    `;
//console.log('stepCard',stepCard);
    summary.appendChild(stepCard);
}


function renderAnswerCard(summary,row, type){
console.log('renderAnswerCard');
 if(type!=='answer') return;
 let icon = getIconByType('answer');
const stepCard = document.createElement('p');
    stepCard.dataset.type = type; 
    stepCard.className = `clickable-item data-type=${type} hover:scale-105 transition-transform bg-indigo-50 border-l-4 border-green-400 rounded-lg p-3 mb-2 shadow-sm hover:shadow-md ml-8`;  
 stepCard.dataset.id = row.answer_id;
    stepCard.innerHTML = `
      <strong>${icon} ${type}: ${row.answer_number}:</strong> ${row.answer_name}
      <span class="block text-sm text-gray-600 whitespace-pre-line">${row.answer_description || ''}</span>
    ${row.answer_id}
      `;
//console.log('stepCard',stepCard);
    summary.appendChild(stepCard);
}

function renderAutoCard(summary, row, type){
 console.log('renderAutoCard');
 // console.log('row:',row, 'summary:',summary,'type:',type);
if(type!=='auto') return;
let icon = getIconByType('automation');
const stepCard = document.createElement('p');
    stepCard.dataset.type = type; 
//    stepCard.className = `clickable-item data-type=${type} hover:scale-105 transition-transform bg-yellow-50 border-l-4 border-blue-400 rounded-lg p-3 mb-2 shadow-sm hover:shadow-md`;
stepCard.dataset.id = row.auto_id; 
   
if(row.auto_deleted_at) {stepCard.innerHTML+= `<span class=" text-sm text-gray-400"><i>
  ${icon} ${type}: ${row.auto_number}: ${row.auto_name} ${row.auto_description} ${row.auto_id} soft deleted</i></span>`} 
    else 
    { 
      stepCard.className = `clickable-item data-type=${type} hover:scale-105 transition-transform bg-yellow-50 border-l-4 border-indigo-400 rounded-lg p-3 mb-2 shadow-sm hover:shadow-md`; 
      stepCard.innerHTML = `
      <strong>${icon} ${type}: ${row.auto_number}:</strong> ${row.auto_name}
      <span class="block text-sm text-gray-600 whitespace-pre-line">${row.auto_description || ''}</span>
    ${row.auto_id} 
    <span class= 'deleteAutomationBtn text-red-600 text-sm ml-4' data-id=${row.auto_id}>Delete</span>
      `};
//console.log('stepCard',stepCard);
    summary.appendChild(stepCard);

}

function markActiveStepInSummary(panel) {
    console.log('markActiveStepInSumary()');
  panel.querySelectorAll('.clickable-item').forEach(el => {
    //console.log('el.dataset.id',el.dataset.id, 'currentItemId',state.currentItemId);
    el.classList.toggle('ring-4', el.dataset.id === String(state.currentItemId));
    el.classList.toggle('ring-blue-500', el.dataset.id === String(state.currentItemId));
    el.classList.toggle('bg-blue-100', el.dataset.id === String(state.currentItemId));
  });
}


function renderNewSelectedSurvey(panel,surveyId){
  console.log('renderNewSelectedSurvey');
//the dropdown has a new selection. 

//render the new survey
state.currentSurveyHeaderId = surveyId;
renderSurveyStructure(panel);
//That function also loads name,descriptioon,url into edit boxes
}


async function renderSurveyStructure(panel) { //should this put more data in display to identify location in surveyView?
  console.log('renderSurveyStructure');
  const summary = panel.querySelector('#surveySummary');
  if (!summary) return; //summary is a DOM element id="surveySummary" innerText="Summary" inner.HTML="<h3>Summary:</h3><br>" Or is by the time the console logs it
  summary.innerHTML = '<h3>The survey is summarised below. To edit, click on a part and then scroll up to edit the text. :</h3><br>';

const surveyId = state.currentSurveyHeaderId;
const rows = await readSurveyView(surveyId);
//console.log('rows',rows);

let oldHeader = null;
let oldQuestion = null;
let oldAnswer = null;
let oldAuto = null;

  rows.forEach(row => { //loop through all the rows

if (row.survey_id !== oldHeader) {
  //console.log('Survey:',row.survey_name, row.survey_description, row.survey_id);
  oldHeader = row.survey_id;
  renderSurveyHeaderCard(summary, row);
}

   if (row.question_id !== oldQuestion) {
   // console.log("Question:",row.question_number, row.question_name , row.question_description, row.question_id);
    oldQuestion = row.question_id;
    renderQuestionCard(summary,row, 'question');
  }

  if (row.answer_id !== oldAnswer && row.answer_id) { //if the new answer is null a card was rendered. so added the not null 15:18 dec 11
  //  console.log("Answer:",row.answer_number, row.answer_name, row.answer_description, row.answer_id);
    oldAnswer = row.answer_id;
    renderAnswerCard(summary, row, 'answer');
  }

  if (row.auto_id !== oldAuto && row.auto_id) {
  //  console.log("Automation:",row.auto_number, row.auto_name, row.auto_description, row.auto_id);
    oldAuto = row.auto_id;
    renderAutoCard(summary, row, 'auto');
  } 
});

//console.log('renderSurveyStructure():', 'state',state); //

   // Inline automations under the item (styled like survey answers/automations)
    const autosContainer = document.createElement('div');
    autosContainer.className = 'ml-4';
    summary.appendChild(autosContainer);

  const createdSteps = panel.querySelector('#createdSteps');
  if (createdSteps && state.items.length > 0) createdSteps.classList.remove('hidden');

 if(!panel._listenerAttached) { //renderSurveyStructure is called many times, but only want one listener
  attachStepsListeners(panel); 
  panel._listenerAttached = true; 
}

loadHeaderIntoEditor(panel); // could return a value and have this loadHeader function in calling function
}

/////// end of rendering the survey


//redundant??
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





////////  READ CLIPBOARD SURVEYS INTO DROPDOWN & EDIT BOXES


function initClipboardIntegration(panel) {
    console.log('initClipboardIntegration()');
  // Check clipboard immediately
 checkClipboardForSurveys(panel); // renderSurveyStructure(panel);//at this point state.currentSurveyId not in state

  // Listen for future changes
  onClipboardUpdate(() => {
    checkClipboardForSurveys(panel);
    //populateFromClipboardAuto(panel); //should this be inside checkclipboard?
  });
}


function checkClipboardForSurveys(panel) {
console.log('checkClipboardForSurveys()');  
  // Get tasks or surveys from clipboard
  const surveys = getClipboardItems({ as: 'survey', type: 'surveys' });
  if (surveys.length === 0) return; //nothing yet selected

  //at least one survey is in the clipboard so let's use it
  populateFromClipboard(panel,surveys);
populateFromClipboardAuto(panel); //moved here from init  19:31 dec 9
}


function ifOnlyOneItemInDropdownloadAndRenderSurvey(panel, surveys, surveySelect){
console.log('ifonlyOneItem...');
  if (surveys.length === 1 && !surveySelect.value) { 
    surveySelect.value = surveys[0].entity.id;
    const infoSection = document.querySelector('#informationSection');
    if(infoSection) infoSection.innerHTML += `<div class="p-1 text-sm bg-blue-50 border border-blue-200 rounded">Auto-filled Survey: ${surveys[0].entity.name}</div>`;
  //  console.log('surveySelect.value',surveySelect.value);//uuid
    state.currentSurveyHeaderId = surveySelect.value;
    renderSurveyStructure(panel);// this displays summary if/when there is a single item in the dropdown
   
 
  }

}

function loadHeaderIntoEditor(panel){//state.currentSurveyView.  Has to be called after readSurveyView has completed
console.log('loadHeaderIntoEditor'); //currentSurveyView  null
  const nameInput = panel.querySelector('#surveyName');
  const descriptionInput = panel.querySelector('#surveyDescription');
  const urlInput = panel.querySelector('#surveyUrl');
  const nameCounter = panel.querySelector('#surveyNameCounter');
  const descriptionCounter = panel.querySelector('#surveyDescriptionCounter');
  const row = state.currentSurveyView[0];
  if (nameInput && row.survey_name) {
    nameInput.value = row.survey_name;
    nameCounter.textContent = `${row.survey_name.length}/64 characters`;
    showToast(`Auto-filled from clipboard: ${row.survey_name}`, 'info');
  
  }
  
  if (descriptionInput && row.survey_description) {
    descriptionInput.value = row.survey_description;
    descriptionCounter.textContent = `${row.survey_description.length}/2000 characters`;
  }
  
  if (urlInput && row.external_url) {
    urlInput.value = row.external_url;
  }
  
  // activate questions area if survey ID is available
  if (row) {
    activateQuestionsSection(panel);
 
  }

}



function populateFromClipboard(panel,surveys) { //Only call this when there is a survey on the clipboard
  console.log('populateFromClipboard()');
  
  // Get tasks or surveys from clipboard
  //const surveys = getClipboardItems({ as: 'survey', type: 'surveys' });
  if (surveys.length === 0) return;

  const surveySelect = panel.querySelector('#surveySelect');//Find a specific dropdown
  addClipboardItemsToThisDropdown(surveys, surveySelect); //build that dropdown display (generic function)for any passed element

  ifOnlyOneItemInDropdownloadAndRenderSurvey(panel, surveys, surveySelect);
}


////////  READ CLIPBOARD POTENTIAL AUTOMATIONS INTO DROPDOWNS

//New 19:38 Nov 12
function populateFromClipboardAuto(panel) { //for the automations dropdowns
    console.log('populateFromClipboardAuto()');
    
    // Get clipboard items
    const tasks = getClipboardItems({ as: 'task' });
    const surveys = getClipboardItems({ as: 'survey' });
    const approfiles = getClipboardItems({ as: 'other' });
        const managers = getClipboardItems({ as: 'manager' });
    
   /* 
   console.log('Clipboard items loaded:', 
   {
      surveys: surveys.length,
      tasks:tasks.length,
      approfiles: approfiles.length,
      managers: managers.length
    });
    */
    // Populate task automation dropdown
    const taskSelect = panel.querySelector('#taskAutomationSelect');
    if (taskSelect) {
      //console.log('Populating task automation dropdown with', tasks.length, 'items');
      addClipboardItemsToThisDropdown(tasks, taskSelect, 'task');
    }
    
    // Populate survey automation dropdown 
    const surveyAutomationSelect = panel.querySelector('#surveyAutomationSelect');
    if (surveyAutomationSelect) {
      //console.log('Populating survey automation dropdown with', surveys.length, 'items');
      addClipboardItemsToThisDropdown(surveys, surveyAutomationSelect, 'survey');
    }


    // Populate approfile automation dropdown
    const approfileSelect = panel.querySelector('#approfileAutomationSelect');
    if (approfileSelect) {
    //  console.log('Populating approfile automation dropdown with', approfiles.length, 'items');
      addClipboardItemsToThisDropdown(approfiles, approfileSelect, 'approfile');
    }
    /*
    // Populate manager automation dropdown (if you want managers in automations too)
    const managerSelect = panel.querySelector('#managerAutomationSelect');
    if (managerSelect) {  //15:20 Dec 10 - no such dropdown in the HTML
      //console.log('Populating manager automation dropdown with', managers.length, 'items');
      addClipboardItemsToThisDropdown(managers, managerSelect, 'manager');
    } 
    
    // Also populate the main manager dropdown in the header section
    const headerManagerSelect = panel.querySelector('#managerSelect');
    if (headerManagerSelect) {
      //console.log('Populating header manager dropdown with', managers.length, 'items');
      addClipboardItemsToThisDropdown(managers, headerManagerSelect, 'manager');
    }  */
  }


function addClipboardItemsToThisDropdown(items, selectElement) {//helper to build a dropdown display in the supplied element
    console.log('addClipboardItemsToThisDropdown()');
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

///////
//Originally the header is loaded from the clipboard & then the steps and automations are read from the db
//but if we reload the survey after making any changes we need to read it all from the data base, this requires reading the header, placing the data in the form
//and then calling the steps and automations functions

//in edit task this called loadTaskSteps   Is this needed? 
async function activateQuestionsSection(panel) { //readSurveyQuestion: 'id, name, description, author_id, created_at, last_updated_at, question_number' excludes automations
console.log('activateQuestionsSection');
    
      // Enable questions section
      const questionsSection = panel.querySelector('#questionsSection');
      if (questionsSection) {
        questionsSection.classList.remove('opacity-50', 'pointer-events-none');
      }  
  }


function attachListeners(panel) {
    console.log('attachListeners()');
  const nameInput = panel.querySelector('#surveyName');
  const descriptionInput = panel.querySelector('#surveyDescription');
  const urlInput = panel.querySelector('#surveyUrl');  // never used

  const nameCounter = panel.querySelector('#surveyNameCounter');
  const descriptionCounter = panel.querySelector('#surveyDescriptionCounter');

  const stepNameInput = panel.querySelector('#stepName');
  const stepDescriptionInput = panel.querySelector('#stepDescription');
  const stepUrlInput = panel.querySelector('#stepUrl');  // never used

  const stepNameCounter = panel.querySelector('#stepNameCounter');
  const stepDescriptionCounter = panel.querySelector('#stepDescriptionCounter');
  
  const nameError = panel.querySelector('#nameError'); //what is this?

  const saveSurveyBtn = panel.querySelector('#saveSurveyBtn');
  const saveStepBtn = panel.querySelector('#saveStepBtn');

  const addQuestionBtn = panel.querySelector('#addQuestionBtn');
  const addAnswerBtn = panel.querySelector('#addAnswerBtn');

  // Survey header field listeners
    nameInput?.addEventListener('input', e => {
    nameCounter.textContent = `${e.target.value.length}/64 characters`;
    nameError.classList.add('hidden'); //??
    saveSurveyBtn.disabled = false;
    saveSurveyBtn.textContent = 'Update header';
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

  // Button listeners
  saveSurveyBtn?.addEventListener('click', (e) => {state.currentItemType='header'; handleStepUpdate(e, panel)});
  saveStepBtn?.addEventListener('click', (e) => handleStepUpdate(e, panel));
  panel.querySelector('[data-action="close-dialog"]')?.addEventListener('click', () => panel.remove());

  addQuestionBtn?.addEventListener('click', (e) => {state.currentItemType='question'; insertNewQuestion(panel)}); // handlestepUpdate also tries to handle this
  addAnswerBtn?.addEventListener('click', (e) => {state.currentItemType='answer'; insertNewAnswer(panel)});  //there may be a conflict between direct insert and update calling insert



const surveySelect = panel.querySelector('#surveySelect'); //used in edit task  #taskSelect

  surveySelect?.addEventListener('change', (e) => {
    const selectedSurveyId = e.target.value;//this is the new displayed data of the selected survey

    renderNewSelectedSurvey(panel,selectedSurveyId);
/*
    const surveys = getClipboardItems({ as: 'survey', type: 'surveys' });
    const selectedItem = surveys.find(t => t.entity.id === selectedId);
    if (!selectedItem) return;
  
    const survey = selectedItem.entity.item;
    panel.querySelector('#surveyName').value = survey.name || '';
    panel.querySelector('#surveyDescription').value = survey.description || '';
    panel.querySelector('#surveyUrl').value = survey.external_url || '';
  
    panel.querySelector('#surveyNameCounter').textContent = `${(survey.name || '').length}/64 characters`;
    panel.querySelector('#surveyDescriptionCounter').textContent = `${(survey.description || '').length}/2000 characters`;
  
    state.currentSurveyHeader = survey;
    state.currentSurveyHeaderId = selectedItem.entity.id;
  */
    activateQuestionsSection(panel);
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



  panel.querySelector('#saveTaskAutomationBtn')?.addEventListener('click', (e) => handleTaskAutomationSubmit(e, panel));
  panel.querySelector('#saveSurveyAutomationBtn')?.addEventListener('click', (e) => handleSurveyAutomationSubmit(e, panel));
  panel.querySelector('#saveRelationshipAutomationBtn')?.addEventListener('click', (e) => handleRelationshipAutomationSubmit(e, panel));

}



// ========================================
    // DATA OPERATIONS - AUTOMATIONS
    // ========================================

async function handleTaskAutomationSubmit(e, panel) {
    console.log('handleTaskAutomationSubmit()');
    e.preventDefault();
   let nextAutoNumber = findNumberInSurvey('auto_number'); //added 20:10 dec 10
  // console.log('nextAutoNumber',nextAutoNumber);
   if (state.currentItemType != 'answer' ) {
   // console.log('Attempt to add auto without selecting answer. Type:', state.currentItemType);
        showToast('Please click the answer first. Automations are applied to answers only.','warning');
    return;
   } 


    const taskAutomationSelect = panel.querySelector('#taskAutomationSelect');
    const selectedTaskId = taskAutomationSelect?.value;
    
    // Get the selected option text

    const selectedOption = taskAutomationSelect?.options[taskAutomationSelect.selectedIndex];
    const taskCleanName = selectedOption?.textContent?.replace(' (clipboard)', '');
   // console.log('task name:',taskCleanName);
    const saveTaskAutomationBtn = panel.querySelector('#saveTaskAutomationBtn');
    if (!saveTaskAutomationBtn) {
        showToast('Save button not found', 'error');
        return;
    }
    
    saveTaskAutomationBtn.disabled = true;
    saveTaskAutomationBtn.textContent = 'Saving...'; //? 
    //automationsNumber++;    
    /*
// Instead of just showing manager info, show complete context:
addInformationCard({
  'name': `${managerData.managerName}`,
  'id': `${managerData.managerId?.substring(0, 8) || 'unknown'}`,
  'type': 'manager-assigned',
  'for-task': `${taskCleanName?.substring(0, 30) || 'Unknown Task'}`,  // Show which task
  //'on-step': stepOrder || 3,  // Show current step number
  'autoNumber': automationsNumber 
});
*/
    //We need to find the id of step3 of the task we are applying as automation. 
    try { 
        // LOOK UP ALL STEPS FOR THIS TASK
        //console.log('Looking up steps for task:', selectedTaskId);
        const steps = await executeIfPermitted(state.user, 'readTaskSteps', {
            taskId: selectedTaskId
        });
        
        // FIND STEP 3 (initial step) - WHY? why are we finding step 3????
        //we need the current step. Where is current step stored????
        
        const initialStep = steps.find(step => step.step_order === 3);
        if (initialStep && initialStep.id) {
            state.initialStepId = initialStep.id;
            //console.log('Found initial step_id:', state.initialStepId);  // got it 10:58 Oct 15
        } else {
            throw new Error(`No initial step (step 3) found for task ${selectedTaskId}`);
        }
        /*console.log(

          'state.currentItemId:',state.currentSelectedItemId,
          'state.user:', state.user, //should be null because usually this is a future unknown person
              
          'selectedTaskId:', selectedTaskId,
          'taskCleanName:', taskCleanName, 
          'state.initialStepId,:', state.initialStepId,
          'auto#:', automationsNumber 
        );*/ 


//function needs:     const { source_survey_header_id, source_survey_answer_id, target_task_header_id, target_task_step_id, name, automation_number } = payload;
        const result = await executeIfPermitted(state.user, 'createAutomationAddTaskBySurvey', { 
          source_survey_header_id  : state.currentSurveyHeaderId, 
          source_survey_answer_id : state.currentItemId, // where get annswer id?

       //       manager_id: managerData.managerId, // needs to be from the dropdown    
            target_task_header_id: selectedTaskId,
            target_task_step_id: state.initialStepId, // 
            name: taskCleanName || 'Unknown Task', // 
            automation_number: nextAutoNumber
        });
        
        
        addInformationCard({ //where get the data?
          'name': `${taskCleanName?.substring(0, 60) || 'Unknown Task'}...`,
          'type': 'auto_task',
          'answer': state.currentItemId,  // ??
          'taskId': selectedTaskId,   //?.substring(0, 8) || 'unknown'}...`,
          'Auto-id': result.id  //?.substring(0, 8) || 'unknown'}...`
        });
        
        showToast('Task automation saved successfully!');
        //RELOAD <------------------------------  readSurveyView(surveyId);
       renderSurveyStructure(panel); //render first reloads survey  // new 20:47 Nov 29
    } catch (error) { //console.log(error.message);
        showToast('Failed to save task automation: ' + error.message, 'error');
        // automationsNumber--; // ROLLBACK: Decrement on failure
    }
    
    saveTaskAutomationBtn.disabled = false;
    saveTaskAutomationBtn.textContent = 'Save Task';
}

function addInformationCard(itemData) { //16:00 Dec 11   This function does not work
  console.log('addInformationCard()');
  const infoSection = document.querySelector('#informationSection');
  const card = document.createElement('div');
 // card.className = 'bg-white p-2 rounded border mb-1 text-sm';
 const style = styleCardByType(itemData.type);
 //console.log('style:',style);
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
  //console.log('type',itemData.type);
  const icon = getIconByType(itemData.type);
  card.textContent = icon + displayText;
  infoSection.appendChild(card);
  
  // Add to steps array
  state.items.push(itemData);
  //console.log('steps array:', state.items);
}



async function handleSurveyAutomationSubmit(e, panel) {
    console.log('handleSurveyAutomationSubmit()');
    e.preventDefault();
     if (state.currentItemType != 'answer' ) {
   // console.log('Attempt to add auto without selecting answer. Type:', state.currentItemType);
        showToast('Please click the answer first. Automations are applied to answers only.','warning');
    return;
   } 
  const saveSurveyAutomationBtn = panel.querySelector('#saveSurveyAutomationBtn');
  if (!saveSurveyAutomationBtn) {
      showToast('Save button not found', 'error');
      return;
  } //how would we be here if button not found?
  let nextAutoNumber = findNumberInSurvey('auto_number');
  const surveyAutomationSelect = panel.querySelector('#surveyAutomationSelect');
  const selectedAutoSurveyId = surveyAutomationSelect?.value; // this used the same name as the source selectedSurveyId
  
  // Get the selected option text
  const selectedOption = surveyAutomationSelect?.options[surveyAutomationSelect.selectedIndex];
  const surveyCleanName = selectedOption?.textContent?.replace(' (clipboard)', '');
    
  saveSurveyAutomationBtn.disabled = true;
  saveSurveyAutomationBtn.textContent = 'Saving...'; //? 
  //automationsNumber++;    
    
try{
//function needs:    source_survey_answer_id, source_survey_header_id,target_survey_header_id, name, automation_number } = payload;
console.log('source_survey in state?',state, 'target survey',selectedAutoSurveyId , 'state.currentItemId',state.currentItemId);// survey_id is not in state. 

const result = await executeIfPermitted(state.user, 'createAutomationAddSurveyBySurvey', { 

           source_survey_answer_id : state.currentItemId, //21:35 Jan18 NULL in the table, but logs here as state.currentItemId 3dabd698-52d8-4855-bebf-5d9f04206a54
            source_survey_header_id: state.currentSurveyHeaderId,
     
            target_survey_header_id : surveyAutomationSelect.value, //21:16 Jan 18
            name: surveyCleanName, 
            automation_number: nextAutoNumber
     });
     
     
     addInformationCard({
      'name': surveyCleanName?.substring(0,30) || '???',
      'type': 'auto_survey',
      'autoNumber': nextAutoNumber || '???', 
      'survey id': selectedAutoSurveyId || '???'
      });
     
     showToast('Survey automation saved successfully!');
     //readSurveyView(surveyId);
    renderSurveyStructure(panel); //render first reloads survey
 } catch (error) {
     showToast('Failed to save survey automation: ' + error.message, 'error');
     // automationsNumber--; // ROLLBACK: Decrement on failure
 }
  saveSurveyAutomationBtn.disabled = false;
  saveSurveyAutomationBtn.textContent = 'Save Survey';
}



  async function handleRelationshipAutomationSubmit(e, panel) {
    console.log('handleRelationshipAutomationSubmit()');
    e.preventDefault();
let nextAutoNumber = findNumberInSurvey('auto_number');
    if (state.currentItemType != 'answer' ) {
   // console.log('Attempt to add auto without selecting answer. Type:', state.currentItemType);
        showToast('Please click the answer first. Automations are applied to answers only.','warning');
    return;
   } 

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

//    automationsNumber++;        
    
    try {  
  console.log('ofAppro',selectedApproId,'selectedRelationship:', selectedRelationship); //undefined here 16:15 Nov 26
      // Save relationship automation to database
//function needs:    const { source_survey_header_id, source_survey_answer_id, appro_is_id, relationship, of_appro_id, name, automation_number } = payload;
        const result = await executeIfPermitted(state.user, 'createAutomationRelateBySurvey', { 
          source_survey_header_id: state.currentSurveyHeaderId,  
          source_survey_answer_id:state.currentItemId, 
          //  appro_is_id: state.user,  // Usually it is the reader whoe appro is used. Unlikely we would specify it when creating the survey
            relationship: selectedRelationship,         
            of_appro_id: selectedApproId,       //of_appro_id     
            name: cleanName,                        
            automation_number: nextAutoNumber   
        });
        
        // Add information card - ADAPTED FOR TASKS
         addInformationCard({
            'name': `${result.name?.substring(0, 60) || cleanName?.substring(0, 60) || 'Unknown'}...`,
            'relationship': `${result.relationship?.substring(0, 8) || selectedRelationship?.substring(0, 8) || 'unknown'}...`,
            'type': 'automation_appro', 
            'number':  nextAutoNumber, 
           'answerNumber?':  '?',  // 
          'state.currentAnswerId': state.currentAnswerId?.substring(0,8) || 'unknown',
            'result.id': `${result.id?.substring(0, 8) || 'unknown'}...`,
          'of_aapro_id':  selectedApproId?.substring(0, 8) || 'unknown'  //
        });            
        
        showToast('Relationship automation saved successfully!');
        //readSurveyView(surveyId);
        renderSurveyStructure(panel); //render first reloads survey
    } catch (error) {
        showToast('Failed to save relationship automation: ' + error.message, 'error');
        // automationsNumber--; // Rollback on error
    }
    
     // Re-enable the button:
     e.target.disabled = false;
     e.target.textContent = 'Save Relationship';
}


  
async function insertNewQuestion(panel){
console.log('insertNewQuestion()');
const nextQuestionNumber = findNumberInSurvey('question_number');
    const stepName ='question on...' + panel.querySelector('#surveyName')?.value.trim();
    const stepDescription ='about..' + panel.querySelector('#surveyDescription')?.value.trim();
try{
        //console.log('Creating new step: survey_header_id',state.currentSurveyId );//logs ok
        //function needs:   survey_header_id: surveyId, name: questionText, question_number:question_number,
     const newQuestion =   await executeIfPermitted(state.user, 'createSurveyQuestion', {
          surveyId: state.currentSurveyHeaderId,  //error not defined 20:00 dec 4
          questionText:stepName,
          description:stepDescription,
          question_number: nextQuestionNumber,
          //stepUrl
        });
        showToast('New step created!', 'success');
renderSurveyStructure(panel); //render first reloads survey
//RELOAD <------------------------------  readSurveyView(surveyId);
// immediately create an answer to go with the question
// or set state.currentSurveyQuestionId = newQuestion.id; //???
//is the db doing this? I see a new answer null null
}catch (error) {
      //console.error('Error saving new item:', error);
      showToast('Failed to save new item: ' + error.message, 'error');
    }
}


async function updateOldQuestion(panel){ // 
console.log('updateOldQuestion()');
    const stepName = panel.querySelector('#stepName')?.value.trim();
    const stepDescription = panel.querySelector('#stepDescription')?.value.trim();
//func needs const { questionId, questionName, questionDescription, questionNumber} = payload;    
 try{ await executeIfPermitted(state.user, 'updateSurveyQuestion', {
          questionId: state.currentItemId,
          questionName: stepName,
          questionDescription:stepDescription,
          questionNumber: state.currentItemNumber, // worked dec 9, fails dec 10 null Fails Jan 20
          //stepUrl
        });
        showToast('Updated successfully!', 'success');
  renderSurveyStructure(panel); //render first reloads survey
   //await activateQuestionsSection(panel);//added 19:37 dec 4 //why?
  
    }catch (error) {
      console.error('Error saving step:', error);
      showToast('Failed to save step: ' + error.message, 'error');
    }
  }

function createNewAnswer(){
if(!state.currentItemId) {showToast('Click on the question first. The new answer attaches to the clicked question','warning'); return}
const nextNumber = findNumberInSurvey('answer_number');
//need to store both the question id and the answer number
//load the name/description with placeholder instruction
//then use normal click to save?

//OR

//insert a draft and then let reload display it/ Maybe this is simpler

}  

async function insertNewAnswer(panel){//answer_number is consequtive on creation of each answer no matter the question. Q1,a1,a3 Q2 a2 
console.log('insertNewAnswer()');
if(!state.currentItemId) {showToast('Click on the question first. The new answer attaches to the clicked question','warning'); return}
//console.log('InsertNew   state.currentItemId',state.currentItemId);
const nextNumber = findNumberInSurvey('answer_number');

let stepName = panel.querySelector('#stepName')?.value.trim(); //likely to have the question name here
let stepDescription = panel.querySelector('#stepDescription')?.value.trim();
         stepName = 'Edit this answer to...'+ stepName;      
        stepDescription = 'Edit this answer to...'+stepDescription;

    try{
        //console.log('Creating new Answer: surveyHeader:',state.currentSurveyHeaderId );//logs ok
        //function needs:    const { survey_question_id, answer_name, answer_number } = payload;
        //survey_question_id: survey_question_id,name: answerName, answer_number:answer_number,
     const newAnswer =   await executeIfPermitted(state.user, 'createSurveyAnswer', {
          survey_question_id: state.currentItemId,  //the question has to be clicked prior to inserting answer
          answer_name:stepName,         
          //description:stepDescription,
          answer_number: nextNumber,
          //answer_description:stepDescription
          
        });
        showToast('New step created!', 'success');
renderSurveyStructure(panel); //render first reloads survey
//RELOAD <------------------------------  readSurveyView(surveyId);
// immediately create an answer to go with the question
}catch (error) {
      //console.error('Error saving new item:', error);
      showToast('Failed to save new item: ' + error.message, 'error');
    }
}

async function updateOldAnswer(panel){
console.log('updateOldAnswer()');
    const stepName = panel.querySelector('#stepName')?.value.trim();
    const stepDescription = panel.querySelector('#stepDescription')?.value.trim();
//func needs     const { answerId, answerName, answerDescription} = payload;  
 try{ await executeIfPermitted(state.user, 'updateSurveyAnswer', {
          answerId: state.currentItemId,
          answerName: stepName,
          answerDescription:stepDescription,
          //answerNumber: state.currentItemNumber,
        });
        showToast('Updated successfully!', 'success');
  renderSurveyStructure(panel); //render first reloads survey
    }catch (error) {
      console.error('Error updateSurveyAnswer:', error);
      showToast('Failed updateSurveyAnswer: ' + error.message, 'error');
    }

}

async function updateHeader(panel){ 
console.log('updateHeader()');
    const stepName = panel.querySelector('#surveyName')?.value.trim();
    const stepDescription = panel.querySelector('#surveyDescription')?.value.trim();

     const url = panel.querySelector('#surveyUrl')?.value.trim();
    const saveBtn = panel.querySelector('#saveSurveyBtn');
    const nameError = panel.querySelector('#nameError');
  
    if (!stepName || !stepDescription) {
      showToast('Name and description are required', 'error');
      return;
    }
  //console.log('stepDescription', stepDescription);//here has value but later becomes null dec 6  23:05

    saveBtn.disabled = true;
    saveBtn.textContent = 'Checking for duplicates...';
  
    try {
      // Check for duplicates only if name has changed 
      const surveyOriginalName = state.currentSurveyView[0].survey_name;
//      console.log('stepName:',stepName, 'state.currentSurveyView.survey_name',state.currentSurveyView[0].survey_name, state.currentSurveyView );
      if (!surveyOriginalName || surveyOriginalName !== stepName) {
        const existing = await executeIfPermitted(state.user, 'readSurveyHeaders', { surveyName: stepName });
    //console.log('duplicate?', existing);
    
        
        if (existing && existing.length > 0) {
          nameError.classList.remove('hidden');
          showToast('A survey with this name already exists', 'error');
          saveBtn.disabled = false;
          saveBtn.textContent = 'Choose a different name';
          return;
        }
      }
  //the above test would have been done by the db anyway.
      saveBtn.textContent = 'Updating Survey...'; //description has value here 23:05
  //console.log('handleSurv update()id:', state.currentSurveyHeader.id,'name:', stepName,'descr:',stepDescription, 'external_url:', url); //looks ok  15:16 Dec 3//state.currentSurveyHeaderId null 14:13 Dec 3  id was known on line 998 also in ifP line 59
       //function requires:     const { surveyId, name, description} = payload;
  //console.log('surveyId, name, description',state.currentSurveyHeaderId, stepName, stepDescription);
       const updatedSurvey = await executeIfPermitted(state.user, 'updateSurvey', {
        surveyId: state.currentSurveyHeaderId,
        name:stepName,
        description:stepDescription,
        //external_url: url //? function doesn't use, but should use
      });
  
      showToast('Updated successfully!');
      saveBtn.textContent = 'Updated!';
      renderSurveyStructure(panel); //render first reloads survey
      //RELOAD <------
      // Update state
      state.currentSurveyHeader = updatedSurvey;
  
      
      // Enable steps section if not already enabled
      const questionsSection = panel.querySelector('#questionsSection');
      if (questionsSection && questionsSection.classList.contains('opacity-50')) {
        questionsSection.classList.remove('opacity-50', 'pointer-events-none');
             }
      
    } catch (error) {
      showToast('Failed to update survey: ' + error.message, 'error');
      saveBtn.disabled = false;
      saveBtn.textContent = 'Update Survey';
    }

}

  async function handleStepUpdate(e, panel) {
    e.preventDefault();
    console.log('handleStepUpdate()');//e is the saveStepbtn button
    //console.log('type:',state.currentItemType);//22:32 dec 6 null - because when editing the existing displayed header this has not been set

    if (!state.currentSurveyHeaderId) {  //20:00 dec 6 null when select new from dropdown  
    showToast('Survey not loaded', 'error');
      return;}
          if (!state.user) {  //20:00 dec 6 null when select new from dropdown  
    showToast('User missing', 'error');
      //return;
    }

switch (state.currentItemType){//is it a question, answer or header? Is it an old or new one?
  case 'question':{//selected question or answer uuid @ state.currentItemId number @ state.currentItemNumber

    if (state.currentItemId) updateOldQuestion(panel);
else insertNewQuestion(panel); // is this needed? listener goes directly to insert?
} break;

  case 'answer':{//check in state.answers[] for state.currentItemId   
if (state.currentItemId)  updateOldAnswer(panel);
else insertNewAnswer(panel); // is this needed? listener goes directly to insert?
 } break;

  case 'header':{updateHeader(panel);
    }
  break;
  default:{ showToast('state.currentItemType not recognised', state.currentItemType) }
}

    

  e.disabled = true;
e.textContent = 'Saving...';
//enableAutomationControls(panel);
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
  
function findNumberInSurvey(itemName){
  console.log('findNumberInSurvey');
const rows = state.currentSurveyView;
//const search = 'row.' + itemName;
let maxNumber =0;

if(itemName === 'auto_number') {
  rows.forEach(row => { 
   if (row.auto_number > maxNumber) { maxNumber=row.auto_number;
  // console.log("ItemName:",itemName, 'row.auto_number:' , row.auto_number, 'maxNumber:',maxNumber);//correctly logs the autos incl deleted
    }
  }); const nextAutoNumber = maxNumber+1;
 // console.log('nextAutoNumber',nextAutoNumber);
  return nextAutoNumber; // this is the next number to use for an automation. 
} else 
if (itemName ==='question_number') {

    rows.forEach(row => { 
   if (row.question_number > maxNumber) { maxNumber=row.question_number;
 //  console.log("ItemName:",itemName, 'row.question_number:' , row.question_number, 'maxNumber:',maxNumber);//correctly logs the autos incl deleted
    }
  }); const nextNumber = maxNumber+1;
 // console.log('nextNumber',nextNumber);
  return nextNumber; // this is the next number to use for a question. 
} else

if (itemName ==='answer_number') {

    rows.forEach(row => { 
   if (row.answer_number > maxNumber) { maxNumber=row.answer_number;
 //  console.log("ItemName:",itemName, 'row.answer_number:' , row.answer_number, 'maxNumber:',maxNumber);//correctly logs the autos incl deleted
    }
  }); const nextNumber = maxNumber+1;
 // console.log('nextNumber',nextNumber);
  return nextNumber; // this is the next number to use for an answer. 
}
 
}


function loadStepIntoEditor(panel,clickedItemId, type){//clicked is the id uuid
  console.log('loadStepIntoEditor() clickedItemId:', clickedItemId, 'type:',type);//logs okay 21:08 dec 8
const rows = state.currentSurveyView;
 // console.log('available ids of all the items:', (state.items || []).map(s => s.id));
//store the id & type in a global
 state.currentItemId = clickedItemId; //the card that was clicked sets the current item.
  state.currentItemType = type;
//console.log('state.currentItemId:',state.currentItemId, 'state.currentItemType',state.currentItemType); // should be == clickedItemId

if(type ==='question'){
 // rows.forEach(row => { //is forEach the wrong command, only need to find one not each
  // if (row.question_id === clickedItemId) 
  const match = rows.find(row => row.question_id === clickedItemId);
  if (match) {
   // console.log("Question:",row.question_number, row.question_name , row.question_description, row.question_id);
  panel.querySelector('#stepName').value = match.question_name || '';
  panel.querySelector('#stepDescription').value =match.question_description  || '';
   }
}
else if (type ==='answer'){
 // rows.forEach(row => {  
 //if (row.answer_id === clickedItemId) 
 const match = rows.find(row => row.answer_id === clickedItemId);
  if (match) {
    panel.querySelector('#stepName').value = match.answer_name || '';
    panel.querySelector('#stepDescription').value = match.answer_description || '';
    
  //  console.log('Form filled with step data');
}
}
else if (type==='auto') { //clear the display boxes to show that nothing editable is selected
//  console.log('yes,auto');
  panel.querySelector('#stepName').value ='Auto selected';
    panel.querySelector('#stepDescription').value ='Automations cannot be edited here. Delete & replace below';
} //eo if
}//eof


async function handleDeleteAutomationButton(panel, automationId){
  const deletedBy = state.user;
  console.log('handleDelete  button of', automationId, 'by', deletedBy);
  try {
    await executeIfPermitted(state.user, 'softDeleteAutomation', { automationId, deletedBy });
    showToast('Automation deleted');

renderSurveyStructure(panel); //RELOAD <------------------------------
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
//console.log('steps listener event-target:', target, 'target.id',target.id, 'target.dataset.id',target.dataset.id,'target.data.id undefined');
    const saveBtn = panel.querySelector('#saveSurveyBtn');
    // Save button optional; do not hard-depend on it to load the editor
    const sectionToEditEl = panel.querySelector('#editSectionLabel'); // optional status label

    if (target.classList.contains('clickable-item')) {
      const type = target.dataset.type; // 'survey', 'question', etc. 
      const clickedItemId = target.dataset.id; // is this an id or a DOM element?
      state.currentItemId = clickedItemId;
      state.currentItemType =type; 
switch (type) {
case "question":  state.currentItemNumber = target.dataset.question_number; break;
case "answer": state.currentItemNumber = target.dataset.answer_number; break;
default: console.log('type of clickable item not recognised', type);
}
//      console.log('target.dataset',target.dataset);//DOMStringMap{Id->"9e63.."}
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
      
    //  console.log('Clicked the:',target.textContent, 'target:',target);
      const automationId = target.dataset.id; //data-id
     //state.currentItemId = automationId;
      if(target.textContent ==   'Click to confirm Delete this automation') {handleDeleteAutomationButton(panel, automationId)}
      else target.textContent = 'Click to confirm Delete this automation' ;

    } else if (target.id === 'addStepBtn') {
    //  handleAddStep(panel);
    }
  });
}


function getTemplateHTML() {console.log('getTemplateHTML');
  return `
    <div id="editSurveyDialog" class="edit-task-dialogue relative z-10 flex flex-col h-full" data-destination="new-panel">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 z-10 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-xl font-semibold text-gray-900">Edit Survey (adapted from edit task)  10:31 Dec 3 - dec 9</h3>
            

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
              <li>📋 Auto-fill from clipboard after you click the [Select] menu button </li>
              <li>You choose an existing survey fro, the Select module</li>  
              <li>• You can modify the name, description, and URL of the header, any existing question or answer</li>
              <li>• The main name must be unique & will be auto checked across all existing surveys</li>
              <li>• Click "Update Survey Header" of "Update step" to save your changes</li>
              <li>• Create a new question with the buttons below the survey</li>
              <li>• Edit existing questions or answers by clicking the summary</li>
              <li>• Automations cannot beedited, just delete and add new ones</li>
              <li>• Automations are added in the section below the summary</li>
              <li>• Click "Save" Automation to add it to the displayed answer</li>  
            </ul>
          </div>



          <div id="editSurveyForm" class="space-y-6 bg-gray-50 p-6 rounded-lg">
            <div>

              <!--label for="surveySelect" class="block text-sm font-medium text-gray-700">Use [Select] menu to choose tasks then this dropdown to load a Survey</label-->
              <select id="surveySelect" data-form="surveySelect" class="flex-1 p-2 border border-gray-300 rounded text-sm">
                <option value="">Use the menu [Select] button then this dropdown to select Survey</option>
              </select>
            
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
              Update Survey Header
            </button>
          </div>

          <!--div id="questionsSection" class="opacity-50 pointer-events-none mt-6">
            <h4 class="text-lg font-medium mb-4">Edit Item (question or answer)</h4>
            <div class="bg-white p-4 rounded border">
              <form id="editStepForm" class="space-y-4">
                <div class="flex items-center gap-4">
                  <label for="questionSelect" class="block text-sm font-medium text-gray-700">Questions:</label>
                  <select id="questionSelect" class="w-full p-2 border rounded">
                    <option value="">New, or select existing</option>
                  </select>
                </div>
          </div-->

 <!--div class="flex items-center gap-4">
                  <label for="answerSelect" class="block text-sm font-medium text-gray-700">Answers:</label>
                  <select id="answerSelect" class="w-full p-2 border rounded">
                    <option value="">New, or select existing</option>
                  </select>
                </div>
                <div-->

                  <label for="stepName" class="block text-sm font-medium text-gray-700"> Name of question or answer *</label>
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
                  <label for="stepAutomationS" class="block text-sm font-medium text-gray-700">Automations</label>
                  <input id="stepAutomationS" class="text-xs text-gray-500" />
                </div>

                <!-- Hidden input for form submission -->
                <input id="stepOrder" type="hidden" />
                <input id="stepId" type="hidden" />
                <button id="saveStepBtn" class="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
                  Update or insert question or answer
                </button>
              </form>

              <div id="createdSteps" class="hidden mt-4">

                              </div>
<div id="surveySummary" class="space-y-2"></div>

              <!--new 19:18 Nov 12 -->

<div id="newQA" class="mt-6 bg-orange-50 p-4 rounded border border-green-300">
  <h5 class="font-medium text-grey-800 mb-2">Add questions or answers. First load a survey. You can add an extra question. It will be added at the end of the survey.</h5>

    <button type="button" id="addQuestionBtn" class="mt-2 bg-blue-600 text-white py-1 px-3 rounded hover:bg-purple-700">
      + ${icons.question}add an extra question
    </button>

        <button type="button" id="addAnswerBtn" class="mt-2 bg-indigo-600 text-white py-1 px-3 rounded hover:bg-purple-700">
      + ${icons.answer} add an answer, but first click the relevant question in the summary 
    </button>

  </div>  


<div id="automationControls" class="mt-6 bg-green-50 p-4 rounded border border-green-300">
  <h5 class="font-medium text-green-800 mb-2">Add Step Automations</h5>

  <!-- Add a task Section -->
  
  <div class="mb-4">
    <label for="taskAutomationSelect" class="block text-sm font-medium text-gray-700">Assign a Task</label>
    <select id="taskAutomationSelect" class="w-full p-2 border rounded">
      <option value="">Select a task to assign</option>
    </select>
    <button type="button" id="saveTaskAutomationBtn" class="mt-2 bg-purple-600 text-white py-1 px-3 rounded hover:bg-purple-700 opacity-50" style="pointer-events: none;">
      Save Task Automation
    </button>
  </div>

<!-- Add a Survey Section -->

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
  
  
<!-- add a Relation Section -->              

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


<!-- div id="automationSection" class="mt-6">
  <h5 class="text-md font-medium mb-2">??</h5>
  <div id="automationCards" class="space-y-2"></div>
</div-->

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

/*
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
  
  //console.log('Selected manager:', managerId, managerName);
  return { managerName: managerName, managerId: managerId };
}
*/
