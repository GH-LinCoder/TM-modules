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
activeTab:'tasks'

};
let ratingSelected = null; //global to hold the selected rating value from the dropdown. Could be set to 7

function escapeHtml(text) {  // 22:04 edited to escape all names and descriptions to prevent html 
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
   ;
}


export function render(panel, query = {}) {
  console.log('render:');
  panel.innerHTML = getTemplateHTML();
  // Initialize clipboard integration
  attachListeners(panel);//moved above init 19:00 dec 9
  initClipboardIntegration(panel);
}


// READ SURVEY VIEW - this did not have source_data or target_data. Rebuilt view 15:50 May 7 2026 to include

async function readSurveyView(surveyId){
  console.log('readSurveyView');
    const userId = appState.query.userId;  // this is what ? it is huyie. Why use this?
const rows = await executeIfPermitted(userId, 'readSurveyView', { survey_id: surveyId});
state.currentSurveyView = rows; //turn the survey into a global for this module 
//console.log('readSurveyView', state.currentSurveyView);
return rows;

}


async function populateRatingSelect(panel)
{ console.log('populateRatingSelect()');
      const userId = appState.query.userId;
// 1. Fetch definitions via registry
const ratingDefinitions = await executeIfPermitted(userId, 'readTrustSecurityDefinitions');

//2. load into dropdown
const ratingSelect = panel.querySelector('[data-form="ratingSelect"]');
if (ratingSelect && Array.isArray(ratingDefinitions)) {
  ratingDefinitions.forEach(item => {
    const option = document.createElement('option');
    option.value = item.sort_int; // Save numeric rating
    option.textContent = item.name;
   // if (Number(item.sort_int) === Number(ratingSelected)) { //ratingSelected??
     // option.selected = true;
  //  }
    ratingSelect.appendChild(option);
  });
 }
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

// Extract and escape untrusted content
const safeSurveyName = escapeHtml(row.survey_name);
const safeSurveyDescription = escapeHtml(row.survey_description || '');


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
    <strong>${icon} Survey: ${safeSurveyName}</strong>
    ${safeSurveyDescription ? `<div class="text-sm text-gray-700">${safeSurveyDescription.substring(0,200) }...</div>` : ''}
    ${row.survey_external_url ? `<div class="text-xs text-blue-600">${row.survey.external_url}</div>` : ''}
    ${row.survey_id}
  `;

  summary.appendChild(card);
}


function renderQuestionCard(summary,row, type){
console.log('renderQuestionCard');
if(type!=='question') return;

const safeQuestionName = escapeHtml(row.question_name);
const safeQuestionDescription = escapeHtml(row.question_description || '');

let icon = getIconByType('question');
    const stepCard = document.createElement('p');
    stepCard.dataset.type = type; 
    
    stepCard.className = `clickable-item data-type=${type} hover:scale-105 transition-transform bg-blue-50 border-l-4 border-blue-400 rounded-lg p-3 mb-2 shadow-sm hover:shadow-md ml-2`;
stepCard.dataset.id = row.question_id; 
   stepCard.innerHTML = `
      <strong>${icon} ${type}: ${row.question_number}:</strong> ${safeQuestionName}
      <span class="block text-sm text-gray-600 whitespace-pre-line">${safeQuestionDescription || ''}</span>
      ${row.question_id}
    `;
//console.log('stepCard',stepCard);
    summary.appendChild(stepCard);
}


function renderAnswerCard(summary,row, type){
console.log('renderAnswerCard');
 if(type!=='answer') return;
const safeAnswerName = escapeHtml(row.answer_name);
const safeAnswerDescription = escapeHtml(row.answer_description || ''); 

 let icon = getIconByType('answer');
const stepCard = document.createElement('p');
    stepCard.dataset.type = type; 
    stepCard.className = `clickable-item data-type=${type} hover:scale-105 transition-transform bg-indigo-50 border-l-4 border-green-400 rounded-lg p-3 mb-2 shadow-sm hover:shadow-md ml-8`;  
 stepCard.dataset.id = row.answer_id;
    stepCard.innerHTML = `
      <strong>${icon} ${type}: ${row.answer_number}:</strong> ${safeAnswerName}
      <span class="block text-sm text-gray-600 whitespace-pre-line">${safeAnswerDescription || ''}</span>
    ${row.answer_id}
      `;
//console.log('stepCard',stepCard);
    summary.appendChild(stepCard);
}


function renderAutoCard(summary, row, type) {
  console.log('renderAutoCard()'); 
 // console.log('renderAutoCard()', row); // Keep for debugging


  
  if (type !== 'auto') return;

  const autoId = row.auto_id;
  const autoName = row.auto_name || row.name || '';
  const autoDescription = row.auto_description || row.description || '';
  const autoNumber = row.auto_number || '';
  const autoDeletedAt = row.auto_deleted_at;

  // 👇 PARSE target_data (comes as string from DB)
//  if (row.target_data) → Skips if the column is null or empty.
//typeof row.target_data === 'string' → Checks if Postgres returned it as raw text (which JSON columns usually do in JS).
//? JSON.parse(row.target_data) → If it's a string, convert it to a real JS object.
//: row.target_data → If it's already an object, leave it alone.

  let targetData = {};
  if (row.target_data) {
    targetData = typeof row.target_data === 'string' 
      ? JSON.parse(row.target_data) 
      : row.target_data;
  }

//  console.log('XXX targetData', targetData);

  const targetType = targetData?.target?.type || 'unknown';
  const header = targetData?.target?.header || '-';

  const safeName = escapeHtml(autoName);
  const safeDesc = escapeHtml(autoDescription || '');
  const icon = targetType === 'payment' ? '💳' : getIconByType('automation');

  const stepCard = document.createElement('p');
  stepCard.dataset.type = type;
  stepCard.dataset.id = autoId;

  if (autoDeletedAt) {
    stepCard.innerHTML = `<span class="text-sm text-gray-400"><i>${icon} auto: ${autoNumber}: ${safeName} soft deleted</i></span>`;
  } else {
    stepCard.className = `clickable-item data-type=${type} hover:scale-105 transition-transform bg-yellow-50 border-l-4 border-indigo-400 rounded-lg p-3 mb-2 shadow-sm hover:shadow-md`;
    
    // 👇 PAYMENT-SPECIFIC RENDERING
    if (targetType === 'payment') {
      const planId = header !== '-' ? header.substring(0, 8) + '...' : '-';
      stepCard.innerHTML = `
        <span><strong>💳 Payment:</strong></span> ${safeName}
        <span class="block text-sm text-gray-600">Plan ID: ${planId}</span>
        <strong>${icon} auto: ${autoNumber}:</strong> ${autoId}
        <span class='deleteAutomationBtn text-red-600 text-sm ml-4' data-id=${autoId}>Delete</span>
      `;
    } else {
      // Tasks/Surveys/Approvals (use legacy columns or JSON fallback)
      const legacyName = row.target_task_name || row.target_survey_name || row.target_appro_is_name || '';
      stepCard.innerHTML = `
        <span><strong>${targetType}:</strong></span> ${safeName}
        ${legacyName ? `<span class="block text-sm text-gray-600">→ ${legacyName}</span>` : ''}
        <span class="block text-sm text-gray-600">${safeDesc}</span>
        <strong>${icon} auto: ${autoNumber}:</strong> ${autoId}
        <span class='deleteAutomationBtn text-red-600 text-sm ml-4' data-id=${autoId}>Delete</span>
      `;
    }
  }
  summary.appendChild(stepCard);
}


/*
function renderAutoCard(summary, row, type) {
  if (type !== 'auto') return;

  // Use existing view fields (these stay for now)
  const autoId = row.auto_id;
  const autoName = row.auto_name || '';
  const autoDescription = row.auto_description || '';
  const autoNumber = row.auto_number || '';
  const autoDeletedAt = row.auto_deleted_at;

  // 👇 PARSE JSON COLUMNS (already in the view)
  const targetData = typeof row.target_data === 'string' 
    ? JSON.parse(row.target_data) 
    : (row.target_data || {});
    
  const targetType = targetData?.target?.type || 'unknown';
  const header = targetData?.target?.header || '-';
  const secondary = targetData?.target?.secondary || '-';
  const tertiary = targetData?.target?.tertiary || null;
  const relationship = targetData?.payload?.relationship || '-';
  const ofAppro = targetData?.payload?.of_appro_id || '-';

  const safeName = escapeHtml(autoName);
  const safeDesc = escapeHtml(autoDescription || '');
  const icon = getIconByType(targetType === 'payment' ? 'payment_button' : 'automation');

  const stepCard = document.createElement('p');
  stepCard.dataset.type = type;
  stepCard.dataset.id = autoId;

  if (autoDeletedAt) {
    stepCard.innerHTML = `<span class="text-sm text-gray-400"><i>
      ${icon} auto: ${autoNumber}: ${safeName} soft deleted</i></span>`;
  } else {
    stepCard.className = `clickable-item data-type=${type} hover:scale-105 transition-transform bg-yellow-50 border-l-4 border-indigo-400 rounded-lg p-3 mb-2 shadow-sm hover:shadow-md`;
    
    // 👇 RENDER BASED ON JSON CONTENT, NOT LEGACY COLUMNS
    if (targetType === 'payment') {
      const planName = safeName;
      // payment_plan_id isn't in the view, but header contains the plan UUID
      const planId = header !== '-' ? header.substring(0, 8) + '...' : '-';
      stepCard.innerHTML = `
        <span><strong>💳 Payment:</strong></span> ${planName}
        <span class="block text-sm text-gray-600">Plan: ${planId}</span>
        <strong>${icon} auto: ${autoNumber}:</strong> ${autoId}
        <span class='deleteAutomationBtn text-red-600 text-sm ml-4' data-id=${autoId}>Delete</span>
      `;
    } else {
      // Existing rendering for task/survey/appro (also reads from JSON now)
      stepCard.innerHTML = `
        <span><strong>${targetType}:</strong></span> ${safeName}
        <span class="block text-sm text-gray-600">${safeDesc}</span>
        <span class="block text-sm text-gray-600">Header: ${header} | Rel: ${relationship}</span>
        <strong>${icon} auto: ${autoNumber}:</strong> ${autoId}
        <span class='deleteAutomationBtn text-red-600 text-sm ml-4' data-id=${autoId}>Delete</span>
      `;
    }
  }
  summary.appendChild(stepCard);
}
*/
/*
function renderAutoCard(summary, row, type){//summary is the element where to display, type = 'auto'
 console.log('renderAutoCard()');  
// console.log('renderAutoCard()','row:',row, 'relationship', row.target_relationship);
 // console.log('row:',row, 'summary:',summary,'type:',type);
if(type!=='auto') return;
/* the row data should allow the display to show what kind of automation each is

"source_data":"{
\"type\": \"survey\", 
\"header\": \"635c6c3e-2fb2-48d6-a34b-e8b7cb257676\", 
\"tertiary\": \"4fb4c804-c31d-466a-8c27-9a7abd722b11\", 
\"secondary\": null}"
,
"target_data":"{
\"target\": {// <--- repeated 'target' because also have 'payload'
\"type\": \"task\",  <---------use this
 \"header\": \"05f6efe7-376f-434d-86a5-0877d624bd05\", 
\"secondary\": \"629a9589-1d6a-4dbb-be9d-fd6b9a260a10\"}, <---- task step
\"payload\": {}}",  <---
*/
/*
const safeAutoName = escapeHtml(row.auto_name);
const safeAutoDescription = escapeHtml(row.auto_description || ''); //no such data?


let icon = getIconByType('automation');
const stepCard = document.createElement('p');
    stepCard.dataset.type = type; 
//    stepCard.className = `clickable-item data-type=${type} hover:scale-105 transition-transform bg-yellow-50 border-l-4 border-blue-400 rounded-lg p-3 mb-2 shadow-sm hover:shadow-md`;
stepCard.dataset.id = row.auto_id; 
const targetType = row.target_data?.target?.type || 'unknown';
//let header =null;
//if (targetType==='task' || targetType === 'survey') header = row.target_data?.target?.header || '';
const header = row.target_data?.target?.header || '-';
const secondary = row.target_data?.target?.secondary || '-';
const tertiary = row.target_data?.target?.tertiary || null;
const relationship = row.target_data?.payload?.relationship || '-';
const ofAppro = row.target_data?.payload?.of_appro_id || '-';   
//const targetOfApproName = row.targetOfApproName || '-';
//console.log('row.auto',row.auto); //what is this function readin - it doesn't contain the json

if(row.auto_deleted_at) {stepCard.innerHTML+= `<span class=" text-sm text-gray-400"><i>
  ${icon} ${type}: ${row.auto_number}: ${safeAutoName} ${safeAutoDescription} ${row.auto_id} soft deleted</i></span>`} 
    else 
    { 
      stepCard.className = `clickable-item data-type=${type} hover:scale-105 transition-transform bg-yellow-50 border-l-4 border-indigo-400 rounded-lg p-3 mb-2 shadow-sm hover:shadow-md`; 
      stepCard.innerHTML = ` <span><strong>${targetType}:</strong></span> ${safeAutoName}
      <span class="block text-sm text-gray-600 whitespace-pre-line">${safeAutoDescription  || ''}</span>
    <span class="block text-sm text-gray-600 whitespace-pre-line">Header id: ${header} Secondary id: ${secondary} Tertiary id:${tertiary} | Relationship: ${relationship} | of_appro: ${ofAppro} </span>
       <strong>${icon} ${type}: ${row.auto_number}:</strong>   ${row.auto_id} 
    <span class= 'deleteAutomationBtn text-red-600 text-sm ml-4' data-id=${row.auto_id}>Delete</span>
      `};
//console.log('stepCard',stepCard);
    summary.appendChild(stepCard);

}
*/
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
const rows = await readSurveyView(surveyId); //this is not finding any attached payment buttons, but it finds attached tasks & surveys
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

// Inside the loop in renderSurveyStructure():
/*
if (row.auto_id !== oldAuto && row.auto_id) {
  console.log('🔍 Auto row | target_data type:', typeof row.target_data, '| value:', row.target_data);
  oldAuto = row.auto_id;
  renderAutoCard(summary, row, 'auto');
}
*/

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
populateAutomationDropdowns(panel);
populateRatingSelect(panel);
  // Listen for future changes
  onClipboardUpdate(() => {
    checkClipboardForSurveys(panel);
    populateAutomationDropdowns(panel);
     populateRatingSelect(panel);

  });
}


function checkClipboardForSurveys(panel) {
console.log('checkClipboardForSurveys()');  
  // Get tasks or surveys from clipboard
  const surveys = getClipboardItems({ as: 'survey', type: 'surveys' });
  if (surveys.length === 0) return; //nothing yet selected

  //at least one survey is in the clipboard so let's use it
  populateFromClipboard(panel,surveys);
//populateFromClipboardAuto(panel); //moved here from init  19:31 dec 9
}

// Populate clipboard-based automation dropdowns
function populateAutomationDropdowns(panel) {
  console.log('populateAutomationDropdowns()');
//  console.log('going to show task dropdown log---');
  const tasks = getClipboardItems({ as: 'task' });
  const taskDropdown = panel.querySelector('#taskAutomationSelect');
  
//  console.log('Task dropdown:', taskDropdown);  // Should be <select id="taskAutomationSelect">
  if (taskDropdown && tasks?.length) {
    addClipboardItemsToThisDropdown(tasks, taskDropdown);
  }
  
  const surveys = getClipboardItems({ as: 'survey' });
  const surveyDropdown = panel.querySelector('#surveyAutomationSelect');  // NOT #surveySelect
 // console.log('Survey dropdown:', surveyDropdown);  // Should be <select id="surveyAutomationSelect">
  if (surveyDropdown && surveys?.length) {
    addClipboardItemsToThisDropdown(surveys, surveyDropdown);
  }
  
  const approfiles = getClipboardItems({ as: 'other' });
  const approDropdown = panel.querySelector('#approfileAutomationSelect');
 // console.log('Appro dropdown:', approDropdown);  // Should be <select id="approfileAutomationSelect">
  if (approDropdown && approfiles?.length) {
    addClipboardItemsToThisDropdown(approfiles, approDropdown);
  }
}


function ifOnlyOneItemInDropdownloadAndRenderSurvey(panel, surveys, surveySelect){
console.log('ifonlyOneItem...');
const safeSurveyName = escapeHtml(surveys[0].entity.name);

  if (surveys.length === 1 && !surveySelect.value) { 
    surveySelect.value = surveys[0].entity.id;
    const infoSection = document.querySelector('#informationSection');
    if(infoSection) infoSection.innerHTML += `<div class="p-1 text-sm bg-blue-50 border border-blue-200 rounded">Auto-filled Survey: ${safeSurveyName}</div>`;
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
    console.log('populateFromClipboardAuto()'); // this is out of date. These selectors have been replaced by the tabs with shared selectors
    let items = null;
    const itemSelectTask = panel.querySelector('#taskAutomationSelect');
        const itemSelectSurvey = panel.querySelector('#surveyAutomationSelect');
            const itemSelectAppro = panel.querySelector('#approfileAutomationSelect'); 
    // Get clipboard items
    if(state.activeTab === 'tasks') {items = getClipboardItems({ as: 'task' });       addClipboardItemsToThisDropdown(items, itemSelectTask, state.activeTab);} 
  else if (state.activeTab === 'surveys') {items = getClipboardItems({ as: 'survey' });      addClipboardItemsToThisDropdown(items, itemSelectSurvey, state.activeTab);} 
  else if (state.activeTab === 'appros') {items = getClipboardItems({ as: 'other' });      addClipboardItemsToThisDropdown(items, itemSelectAppro, state.activeTab);} 
  


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

  }


function addClipboardItemsToThisDropdown(items, selectElement) {//helper to build a dropdown display in the supplied element
    console.log('addClipboardItemsToThisDropdown() items:', items, 'selecteElement',selectElement);
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

// Listener for change in dropdown 
let ratingSelected = null; //global to hold the selected rating value from the dropdown. Could be set to 7
panel.querySelector('[data-form="ratingSelect"]')?.addEventListener('change', (e) => {
  const val = e.target.value;
  if (val !== '') {
    ratingSelected = Number(val);
console.log('ratingSelected:',ratingSelected)  
}
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
//Need to check if the question is selected else throws error


const surveySelect = panel.querySelector('#surveySelect'); //used in edit task  #taskSelect
  surveySelect?.addEventListener('change', (e) => {
    console.log('survey change');
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
const saveAttachmentBtn = panel.querySelector('#saveAttachmentBtn');

surveyAutomationSelect?.addEventListener('change', () => {
 // console.log('survey automations change');
  if (surveyAutomationSelect.value) {
    saveAttachmentBtn.disabled = false;
    saveAttachmentBtn.style.pointerEvents = 'auto';
    saveAttachmentBtn.classList.remove('opacity-50');
  } else {
    saveAttachmentBtn.disabled = true;
    saveAttachmentBtn.style.pointerEvents = 'none';
    saveAttachmentBtn.classList.add('opacity-50');
  }
});

const taskAutoSelect = panel.querySelector('#taskAutomationSelect');

taskAutoSelect?.addEventListener('change', () => {
//console.log('task automations change');
  if (taskAutoSelect.value) {
    saveAttachmentBtn.disabled = false;  
    saveAttachmentBtn.style.pointerEvents = 'auto';
    saveAttachmentBtn.classList.remove('opacity-50');
  } else {
    saveAttachmentBtn.disabled = true;
    saveAttachmentBtn.style.pointerEvents = 'none';
    saveAttachmentBtn.classList.add('opacity-50');
  }
});

const approSelect = panel.querySelector('#approfileAutomationSelect');

approSelect?.addEventListener('change', () => {
//  console.log('appro change');
  if (approSelect.value) {
    saveAttachmentBtn.disabled = false;
    saveAttachmentBtn.style.pointerEvents = 'auto';
    saveAttachmentBtn.classList.remove('opacity-50');
  } else {
    saveAttachmentBtn.disabled = true;
    saveAttachmentBtn.style.pointerEvents = 'none';
    saveAttachmentBtn.classList.add('opacity-50');
  }
});



//May 4

// ✅ Tab click listeners + initialization (identical)
panel.querySelectorAll('#attachmentTabs .tab-btn').forEach(btn => {
  btn?.addEventListener('click', (e) => {
//console.log('tab change');
    const tabId = e.currentTarget.dataset.tab;
    switchAttachmentTab(panel, tabId);
  });
});
switchAttachmentTab(panel, 'tasks');  // Initialize

// ✅ Dropdown change listeners (identical logic)
['#taskAutomationSelect', '#surveyAutomationSelect', '#approfileAutomationSelect', '#attachmentSelect'].forEach(selector => {
  panel.querySelector(selector)?.addEventListener('change', (e) => {
    console.log('selector change', selector);
    const saveBtn = panel.querySelector('#saveAttachmentBtn');
    if (saveBtn) saveBtn.disabled = !e.target.value;
  });
});


panel.querySelector('#saveAttachmentBtn')?.addEventListener('click', async (e) => {
  e.stopPropagation();
//console.log('save attachment button clicked');
  let selectedValue = null;
  let selectedDropdown = null;
  const activeTab = state.activeTab; 
 // console.log('saveAttachmentBtn clicked','active tab:',activeTab);  
  if (activeTab === 'payments') {
    selectedDropdown = panel.querySelector('#attachmentSelect');
  } else if (activeTab === 'tasks') {
    selectedDropdown = panel.querySelector('#taskAutomationSelect');
  } else if (activeTab === 'surveys') {
    selectedDropdown = panel.querySelector('#surveyAutomationSelect');
  } else if (activeTab === 'appros') {
    selectedDropdown = panel.querySelector('#approfileAutomationSelect');
  }
  
  selectedValue = selectedDropdown?.value;
  
  if (!selectedValue) {
    showToast('Please select an item', 'error');
    return;
  }
  
  // Route to correct handler
  if (activeTab === 'payments') {
    await handlePaymentAttachmentSubmit(e, panel);
  } else if (activeTab === 'tasks') {
    await handleTaskAutomationSubmit(e, panel);
  } else if (activeTab === 'surveys') {
    await handleSurveyAutomationSubmit(e, panel);  // ← This uses survey_answer_id ✓
  } else if (activeTab === 'appros') {
    await handleRelationshipAutomationSubmit(e, panel);
  }
});





}



// ========================================
    // DATA OPERATIONS - AUTOMATIONS
    // ========================================


// Populate the attachment dropdown for the Payments tab
async function populatePaymentPlansDropdown(panel) {
  console.log('populatePaymentPlansDropdown()');
  
  const dropdown = panel.querySelector('#attachmentSelect');
  if (!dropdown) return;
  
  // Show loading state
  dropdown.innerHTML = '<option value="">Loading plans...</option>';
  dropdown.disabled = true;
  
  try {
    // Use your EXISTING registry function (no new code needed) also done again line 800?
//    const plans = await registry.readAllActivePaymentPlans(supabase, state.user, {});
  const plans = await executeIfPermitted(state.user, 'readAllActivePaymentPlans', {});  
    if (plans?.length) {
      // Clear and add options
      dropdown.innerHTML = '<option value="">Select a plan...</option>';
      
      plans.forEach(plan => {
        const option = document.createElement('option');
        option.value = plan.id;
        // Match your display style: name + price
        option.textContent = `${plan.name} (${plan.amount} ${plan.currency})`;
        dropdown.appendChild(option);
      });
      
      dropdown.disabled = false;
     // console.log(`Loaded ${plans.length} payment plans`);
    } else {
      dropdown.innerHTML = '<option value="">No payment plans found</option>';
      console.warn('⚠️ No active payment plans found');
    }
  } catch (error) {
    console.error('Failed to load payment plans:', error);
    dropdown.innerHTML = '<option value="">Error loading plans</option>';
  }
}





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
    const saveAttachmentBtn = panel.querySelector('#saveAttachmentBtn');
    if (!saveAttachmentBtn) {
        showToast('Save button not found', 'error');
        return;
    }
    
    saveAttachmentBtn.disabled = true;
    saveAttachmentBtn.textContent = 'Saving...'; //? 
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
    
    saveAttachmentBtn.disabled = false;
    saveAttachmentBtn.textContent = 'Attach Task';
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
  const saveAttachmentBtn = panel.querySelector('#saveAttachmentBtn');
  if (!saveAttachmentBtn) {
      showToast('Save button not found', 'error');
      return;
  } //how would we be here if button not found?
  let nextAutoNumber = findNumberInSurvey('auto_number');
  const surveyAutomationSelect = panel.querySelector('#surveyAutomationSelect');
  const selectedAutoSurveyId = surveyAutomationSelect?.value; // this used the same name as the source selectedSurveyId
  
  // Get the selected option text
  const selectedOption = surveyAutomationSelect?.options[surveyAutomationSelect.selectedIndex];
  const surveyCleanName = selectedOption?.textContent?.replace(' (clipboard)', '');
    
  saveAttachmentBtn.disabled = true;
  saveAttachmentBtn.textContent = 'Saving...'; //? 
  //automationsNumber++;    
    
try{
//function needs:    source_survey_answer_id, source_survey_header_id,target_survey_header_id, name, automation_number } = payload;
//console.log('source_survey in state?',state, 'target survey',selectedAutoSurveyId , 'state.currentItemId',state.currentItemId);// survey_id is not in state. 

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
  saveAttachmentBtn.disabled = false;
  saveAttachmentBtn.textContent = 'Attach Survey';
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
    const relationshipSelect = panel.querySelector('#relationshipSelect'); // Changed ID to match task module
    
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
//  console.log('ofAppro',selectedApproId,'selectedRelationship:', selectedRelationship); //undefined here 16:15 Nov 26
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
     e.target.textContent = 'Attach Relationship';
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
  //console.log('handleSurv update()id:', state.currentSurveyHeader.id,'name:', stepName,'descr:',stepDescription, 'external_url:', url); //looks ok  15:16 Dec 3//state.currentSurveyHeaderId null 14:13 Dec 3  id was known on line 998 also in if P line 59
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
//          if (!state.user) {  //20:00 dec 6 null when select new from dropdown  Does it matter?
//    showToast('User missing', 'error');
      //return;
    

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
    const surveyBtn = panel.querySelector('#saveAttachmentBtn');
    const relBtn = panel.querySelector('#saveAttachmentBtn');
  
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
      state.currentItemId = clickedItemId; //isn't this already assigned with that value?
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
      state.currentItemId = clickedItemId; //does this remove the answer id & replace with auto id?
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
                            <li> To rate a resource or participant use the [Rating] dropdown</li>
              <li> This rates how much a participant should be trusted</li>
              <li> or how much to protect a resource</li>
  
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
 <!--  Rating Select  -->
            <div class="space-y-2">
              <label for="ratingSelect" class="block text-sm font-medium text-gray-700">Every appro, task & survey is rated for trustSecurity. It defaults to the minimum</label>
              <select id="ratingSelect" data-form="ratingSelect" class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Change rating (optional)</option>
              </select>
            </div>
      
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

<!--
<div id="automationControls" class="mt-6 bg-green-50 p-4 rounded border border-green-300">
</div>


<!-- div id="automationSection" class="mt-6">
  <h5 class="text-md font-medium mb-2">??</h5>
  <div id="automationCards" class="space-y-2"></div>
</div-->

</div>

           

<!-- NEW: Tab-based attachment system -->
<div id="attachmentControls" class="mt-6 bg-green-50 p-4 rounded border border-green-300">
  <h5 class="font-medium text-green-800 mb-3">Add Attachment</h5>
  
  <!-- Tabs -->
  <div class="flex gap-2 mb-4 border-b border-gray-200 pb-2" id="attachmentTabs">
    <button class="tab-btn px-3 py-1 text-sm rounded-t border border-transparent hover:bg-gray-100" data-tab="tasks">📋 Tasks</button>
    <button class="tab-btn px-3 py-1 text-sm rounded-t border border-transparent hover:bg-gray-100" data-tab="surveys">📝 Surveys</button>
    <button class="tab-btn px-3 py-1 text-sm rounded-t border border-transparent hover:bg-gray-100" data-tab="appros">🔗 Connections</button>
    <button class="tab-btn px-3 py-1 text-sm rounded-t border border-transparent hover:bg-gray-100" data-tab="payments">💳 Payments</button>
  </div>
  
  <!-- Dropdown + options -->
  <div class="mb-3">
    <label for="attachmentSelect" class="block text-sm font-medium text-gray-700 mb-1">Select:</label>
    <select id="attachmentSelect" class="w-full p-2 border rounded">
      <option value="">Select an item...</option>
    </select>
  </div>
  

  
  <!-- Visibility checkbox (hidden for payments) -->
  <label id="visibilityCheckbox" class="flex items-center gap-2 mb-3">
    <input type="checkbox" name="is_visible" checked class="rounded border-gray-300">
    <span class="text-sm text-gray-600">Show to users (uncheck to hide)</span>
  </label>

  <!-- Tasks tab dropdown -->
<select id="taskAutomationSelect" class="w-full p-2 border rounded">
  <option value="">Select a task...</option>
</select>

<!-- Surveys tab dropdown -->
<select id="surveyAutomationSelect" class="w-full p-2 border rounded">
  <option value="">Select a survey...</option>
</select>



  <!-- Relationships dropdown (only for appros tab) -->
  <div id="relationshipSelector" class="mb-3 hidden">
    <label for="relationshipSelect" class="block text-sm font-medium text-gray-700 mb-1">Relationship:</label>
    <select id="relationshipSelect" class="w-full p-2 border rounded">
      <option value="">Select relationship...</option>
    </select>
  </div>

<!-- Approfiles tab dropdown -->
<select id="approfileAutomationSelect" class="w-full p-2 border rounded">
  <option value="">Select an approfile...</option>
</select>


<!-- Save button -->
  <button type="button" id="saveAttachmentBtn" class="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
    Add Attachment
  </button>
</div>
<!-- end tab section -->

<div id="automationSection" class="mt-6">
  <h5 class="text-md font-medium mb-2">Step Automations:</h5>
  <div id="automationCards" class="space-y-2"></div>
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


async function switchAttachmentTab(panel, tabId) {
  console.log('switchAttachmentTab:', tabId);
   state.activeTab = tabId;

/* test
document.querySelectorAll('*').forEach(el => {
  const style = getComputedStyle(el);
  if (style.position === 'absolute' || style.position === 'fixed') {
    el.style.outline = '2px solid red';
  }
});
*/

   // ✅ VISUAL: Update tab button styling
  const tabs = panel.querySelectorAll('#attachmentTabs .tab-btn');
  tabs.forEach(tab => {
    // Reset all tabs to inactive style
    tab.classList.remove('bg-gray-200', 'border-purple-300', 'text-purple-800', 'font-medium');
    tab.classList.add('border-transparent', 'hover:bg-gray-100', 'text-gray-600');
    
    // Style active tab
    if (tab.dataset.tab === tabId) {
      tab.classList.add('bg-gray-200', 'border-purple-300', 'text-purple-800', 'font-medium');
      tab.classList.remove('border-transparent', 'hover:bg-gray-100', 'text-gray-600');
    }
  });
  
  // ✅ Show/hide dropdowns based on active tab
  const dropdowns = {
    'tasks': panel.querySelector('#taskAutomationSelect'),
    'surveys': panel.querySelector('#surveyAutomationSelect'),
    'appros': panel.querySelector('#approfileAutomationSelect'),
    'payments': panel.querySelector('#attachmentSelect')
  };
  
  // Hide all, show active
  Object.values(dropdowns).forEach(dd => {
    if (dd) dd.classList.add('hidden');
  });
  if (dropdowns[tabId]) {
    dropdowns[tabId].classList.remove('hidden');
    dropdowns[tabId].disabled = false;
  }
  
  // ✅ ONLY reset/populate the payments dropdown (it uses #attachmentSelect)
  if (tabId === 'payments') {
    const dropdown = panel.querySelector('#attachmentSelect');
    if (dropdown) {
      dropdown.innerHTML = '<option value="">Loading plans...</option>';
      dropdown.disabled = true;
    }
    await populatePaymentPlansDropdown(panel);  // ✅ Already exists
  } else if (tabId === 'appros') {
  const approfiles = getClipboardItems({ as: 'other' });
  addClipboardItemsToDropdown(approfiles, panel.querySelector('#approfileAutomationSelect'));
  
  // ✅ Load relationships from DB using existing function
  await populateRelationshipsDropdown(panel);
  
  // Show relationship selector
  panel.querySelector('#relationshipSelector')?.classList.remove('hidden');
}

  
  // Show/hide relationship selector (only for appros)
  const relationshipSelector = panel.querySelector('#relationshipSelector');
  if (relationshipSelector) {
    relationshipSelector.classList.toggle('hidden', tabId !== 'appros');
  }
  
  // Show/hide visibility checkbox (hidden for payments)
  const visibilityCheckbox = panel.querySelector('#visibilityCheckbox');
  if (visibilityCheckbox) {
    visibilityCheckbox.style.display = (tabId === 'payments') ? 'none' : 'flex';
  }
  
  // Disable save button until item selected
  const saveBtn = panel.querySelector('#saveAttachmentBtn');
  if (saveBtn) saveBtn.disabled = true;
}

async function handlePaymentAttachmentSubmit(e, panel) {
  console.log('handlePaymentAttachmentSubmit()');

/*
  console.log('🚨', { //what does this do???
    stateActiveTab:state.activeTab,
    stack: new Error().stack?.split('\n').slice(1, 3).join('\n')
  });
*/
  e.preventDefault();
    e.stopPropagation();
  
  const attachmentSelect = panel.querySelector('#attachmentSelect');
  const selectedPlanId = attachmentSelect?.value;
  
  const saveAttachmentBtn = panel.querySelector('#saveAttachmentBtn');
  if (!saveAttachmentBtn) {
    showToast('Save button not found', 'error');
    return;
  }
  
  if (!selectedPlanId) {
    showToast('Please select a payment plan', 'error');
    return;
  }
  
  // Disable button during save
  saveAttachmentBtn.disabled = true;
  saveAttachmentBtn.textContent = 'Saving...';
  
  try {
    // Get the selected plan details (for display) - also done on line 320?
    const plans = await executeIfPermitted(state.user, 'readAllActivePaymentPlans', {});
    const selectedPlan = plans.find(p => p.id === selectedPlanId);
    const planName = selectedPlan?.name || 'Unknown Plan';
    
    // Determine target_type: 'task' for header, 'task_step' for step THIS IS ABSURD. There is no target task
    //const targetType = state.currentStepId ? 'task_step' : 'task';
    //const targetId = state.currentStepId || state.currentTaskId;
    //const targetType ='payment'; //Is there such a thing???
    //const targetId =

    // Call with hardcoded registry ID for 'payment button' BUT the called function doesn't use it
/**what the registry function requires
 *    payment_plan_id, 
      planName:planName,
      source_header_id,  // for source_data for TASKS ONLY Need change to source_header
      source_secondary_id,    // for source_data  for TASKS ONLY need change to source_secondary + add source_tertiary for answers
      source_tertiary_id,
      is_visible = true 
 */

console.log('🚨 calling to create button-1815 with answerId state.currentItemId:',state.currentItemId);

    const result = await executeIfPermitted(state.user, 'createAttachmentPaymentButton', {//state.user wrong id
      auto_registry_id: 'd1f2028e-95fa-4a9b-ae6f-ff4753d5913d',  
      payment_plan_id: selectedPlanId,
      planName:planName,
      
      source_header_id: state.currentSurveyHeaderId,
      source_secondary_id: null,
      source_tertiary_id:state.currentItemId, 
      source_type:'survey',
      is_visible: true
    });
    
    // Show confirmation (matches your existing pattern)
    addInformationCard({
      'name': `${planName?.substring(0, 60) || 'Unknown Plan'}...`,
      'type': 'payment_button',
      'step': state.currentSurveyHeaderId || 'header',
      'planId': `${selectedPlanId?.substring(0, 8) || 'unknown'}...`,
      'id': `${result.id?.substring(0, 8) || 'unknown'}...`
    });
    
    showToast('Payment attachment saved successfully!');
    
    // Reload automations display
  
 renderSurveyStructure(panel); //This had been renderTASK  changed May 15 to survey   
    
  } catch (error) {
    console.error('Failed to save payment attachment:', error);
    showToast('Failed to save: ' + error.message, 'error');
  }
  
  // Re-enable button
  saveAttachmentBtn.disabled = false;
  saveAttachmentBtn.textContent = 'Add Attachment';
  
  // Reset dropdown (reuse existing variable)
  if (attachmentSelect) {
    attachmentSelect.value = '';
  }
}
function addClipboardItemsToDropdown(items, selectElement) {
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

async function populateRelationshipsDropdown(panel) {
  console.log('populateRelationshipsDropdown()');
  
  const dropdown = panel.querySelector('#relationshipSelect');
  if (!dropdown) return;
  
  dropdown.innerHTML = '<option value="">Loading relationships...</option>';
  dropdown.disabled = true;
  
  try {
    // ✅ Use existing registry function:
    const relationships = await executeIfPermitted(state.user, 'readRelationships', {});
    
    if (relationships?.length) {
      dropdown.innerHTML = '<option value="">Select relationship...</option>';
      
      relationships.forEach(rel => {
        const option = document.createElement('option');
        option.value = rel.name;  // e.g., '(]member_of[)'
        option.textContent = rel.name;
        dropdown.appendChild(option);
      });
      
      dropdown.disabled = false;
    //  console.log(`Loaded ${relationships.length} relationships`);
    } else {
      dropdown.innerHTML = '<option value="">No relationships found</option>';
    }
  } catch (error) {
    console.error('Failed to load relationships:', error);
    dropdown.innerHTML = '<option value="">Error loading relationships</option>';
  }
}




// Resolve checkout URLs for payment buttons after render
async function resolvePaymentButtonUrls(container) {
  const buttons = container.querySelectorAll('[data-plan-id]');
  if (!buttons.length) return;
  
  // Fetch all plans once
  const plans = await executeIfPermitted(state.user, 'readAllActivePaymentPlans', {});
  
  buttons.forEach(btn => {
    const planId = btn.dataset.planId;
    const plan = plans.find(p => p.id === planId);
    
    if (plan?.provider_plan_id) {
      const variantId = plan.provider_plan_id;
      const approId = state.user;  // Runtime user ID
      const checkoutUrl = `https://myorg.lemonsqueezy.com/checkout/buy/${variantId}?embed=1&checkout[custom][appro_id]=${approId}`;
      btn.href = checkoutUrl;
      
      // Update button text with plan details
      btn.textContent = `${plan.name} - ${plan.amount} ${plan.currency}`;
    }
  });
}
