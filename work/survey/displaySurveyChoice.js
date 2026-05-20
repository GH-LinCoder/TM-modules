// ./work/survey/displaySurveyChoice.js

import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import {  resolveSubject} from '../../utils/contextSubjectHideModules.js'


// Tuesday 22:04 May 12. Task_headers & survey_headers do not have any category column or any way to tell if they are self-assignable. This module displays them all.
//The aim should be to set this, probably by appro relations. At creation or at edit.
// The module uses crude name filtering on the start of the survey name.
//It happened that tasks about the app start with 'app' (unfortunately there were taks called 'applicant...' which have been renamed
//tasks related to software dev are titled CODE...
//but surveys have not bee so coded'


let state ={
    displayMode:'app',
    surveyHeaderData: [],
    user: null
}


function getInstructionsHTML(){
return `
<div class="p-4">
<!--            TITLE          --> 
  <h2 class="text-2xl font-bold mb-4">Choose extra surveys</h2>

  <!--      INSTRUCTIONS       -->
  <div class="bg-white rounded-lg shadow p-6 flex-col ">
        <div class="mb-3 bg-blue-50 p-3 rounded border border-blue-200 text-sm text-blue-700">    
         <p>Navigation: click tab to choose the category of survey </p>
         <p> click a card within the display [rectangles with words in them]. - it opens in the dashboard (scroll down if needed)</p>
         <p>If you get lost click top menu button [My Dash] - that will close all the extra bits and return you to the dashboard ready for another adventure.</p>
         <p>The dashboard is on 1 page. The browser back button will return you to the login page.</p>
         <p>What the page displays depends on what you click. </p>
         <p>When you click a card the new information opens below and you have to scroll down to see it.</p> 
         <p>When you click the card you are assigned to that survey</p>
         <p>The design is easier on a large screen.</p>
         <p> If it gets messy click [My Dash]</p>
                 </div>

</div>

`;

}

export async function render(panel) {
    console.log('displaysurveyChoice. render()');

    // 1. Set up the structural skeleton ONCE
    panel.innerHTML = `
        ${getInstructionsHTML()}
        <div id="tabs-container" class="mb-4"></div>
        <div id="cards-container" class="space-y-2"></div>
    `;

    const tabsContainer = panel.querySelector('#tabs-container');
    const cardsContainer = panel.querySelector('#cards-container');

    // 2. Load the data
    await loadsurveyList(); 

    // 3. Initial Paint
    refreshUI(tabsContainer, cardsContainer);
}

// Separate the "Drawing" from the "Logic"
function refreshUI(tabsContainer, cardsContainer) {
    // Render Tabs
    tabsContainer.innerHTML = renderTabs();
    // Render Cards
    displayByMode(cardsContainer);
    // Attach listeners to the NEWLY created tab buttons
    attachTabsListeners(tabsContainer, cardsContainer);
}

function renderTabs() {
    console.log('renderTabs()', state.displayMode)
  const modes = [
    
    { id: 'app', label: 'App', title:'Review or learn about the app' },
    { id: 'code', label: 'Code', title:'For developers interested in coding' },
    { id: 'test', label: 'Test Team', title:'For members of the test team' },
    { id: 'group', label: 'Group', title:'These are for groups you can join' },
    { id: 'intro', label: 'Intro', title:'You may have already been on these' },
    { id: 'org', label: 'Org', title:'For surveys specific to the organization or about organization' }
  ];

  return `
    <div class="mode-tabs flex gap-2 border-b pb-2">
      ${modes.map(m => `
        <button class="mode-tab px-4 py-2 rounded-t-md ${m.id === state.displayMode
          ? 'bg-white font-bold border border-gray-300 border-b-0'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
          data-mode="${m.id}"
        title="${m.title}">  ${m.label}
        </button>
      `).join('')}
    </div>
  `;
}

function attachTabsListeners(tabsContainer, cardsContainer) {
 console.log('attachTabsListeners');
    const tabs = tabsContainer.querySelectorAll('.mode-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const newMode = e.currentTarget.dataset.mode;
            console.log('Tab clicked:', newMode);
            
            state.displayMode = newMode;
            // Re-run the refresh to update visual states and filtered list
            refreshUI(tabsContainer, cardsContainer);
        });
    });
}


async function loadsurveyList() {
  console.log('loadsurveyList()');
 // const data = await loadOrdinaryRelations(state.subjectId);
   
 try{
  state.surveyHeaderData = await executeIfPermitted(state.user, 'readSurveyHeaders', {});
}catch (error) { console.error('loadsurveyHeaders failed:', error); throw error; 
               }
console.log('surveyHeaderData',state.surveyHeaderData);

}


function displayByMode(cardsContainer) {
    console.log('displayByMode() for:', state.displayMode);
    const currentMode = (state.displayMode || "app").trim().toLowerCase();

    // Filter Logic
    const filteredsurveys = state.surveyHeaderData.filter(survey => {
        const name = (survey.name || "").trim().toLowerCase();
        if (currentMode === 'app') return name.startsWith('app');
        if (currentMode === 'code') return name.startsWith('code');
        if (currentMode === 'test') return name.startsWith('test');
        if (currentMode === 'group') return name.startsWith('group');
        if (currentMode === 'intro') return name.startsWith('intro');
        if (currentMode === 'org') return name.startsWith('org');
        // Intro / Default
        return !name.startsWith('app') && !name.startsWith('code') && !name.startsWith('test') && !name.startsWith('org') && !name.startsWith('pot');
    });

    const surveyCards = filteredsurveys.map(survey => `
        <div class="bg-white border border-purple-200 rounded-lg p-3 mb-2 hover:border-purple-400 cursor-pointer shadow-sm" 
             data-action="self-assign-survey" 
             data-survey-id="${survey.id}">
            <h5 class="font-semibold text-purple-900">${survey.name}</h5>
            <p class="text-sm text-gray-800">${survey.description || ''}</p>
            <p class="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">ID: ${survey.id}</p>

            <div class="enroll-status">
            Click to take on this survey
            </div>

            </div>
    `).join('');

    // USE = NOT += to replace the list instead of appending
    cardsContainer.innerHTML = `
        <div class="p-4 border rounded-lg bg-gray-50">
            <h4 class="font-semibold mb-2 text-gray-600 uppercase text-xs tracking-wider">
                Category: ${state.displayMode}
            </h4>
            ${surveyCards || '<p class="text-gray-500 italic">No surveys found in this category.</p>'}
        </div>
    `;
    attachCardsListeners(cardsContainer);
}


function attachCardsListeners(cardsContainer) {
    console.log('attachCardsListeners');

  // Event delegation: listen for clicks on any card
  cardsContainer.addEventListener('click', async (e) => {
    const card = e.target.closest('[data-action="self-assign-survey"]');
    if (!card) return;
    
    e.stopPropagation(); // Prevent card click from bubbling
    handleSelfAssignClick(card, cardsContainer);
});
}


let resetTimers = {}; // Object to track timers per surveyId

function handleSelfAssignClick(card, cardsContainer) {
    const surveyId = card.dataset.surveyId;
    const statusDiv = card.querySelector('.enroll-status');
    
    // 1. Check if we are in the "Confirming" state
    if (statusDiv.textContent.trim() === 'Click to confirm taking on this survey') {
        // Clear reset timer if it exists
        if (resetTimers[surveyId]) clearTimeout(resetTimers[surveyId]);
        
        // Finalize Assignment
        statusDiv.textContent = '⌛ Processing...';
        statusDiv.classList.replace('text-purple-600', 'text-gray-400');
        handleSelfAssignButton(card, surveyId);
    } 
    else {
        // 2. Transition to "Confirm" state
        statusDiv.textContent = 'Click to confirm taking on this survey';
        statusDiv.classList.replace('text-purple-600', 'text-orange-600');

        // 3. Set a reset timer (5 seconds)
        if (resetTimers[surveyId]) clearTimeout(resetTimers[surveyId]);
        resetTimers[surveyId] = setTimeout(() => {
            statusDiv.textContent = 'Click to take on this survey';
            statusDiv.classList.replace('text-orange-600', 'text-purple-600');
            delete resetTimers[surveyId];
        }, 5000);
    } 
}

async function handleSelfAssignButton(card, surveyId) {
    const statusDiv = card.querySelector('.enroll-status');
    state.user = await resolveSubject();

    try {

console.log('Trying to assign survey id:',surveyId, 'student id:',state.user.id, 'student name:',state.user.name,'assigned_by:',state.user.id);
        const result = await executeIfPermitted(state.user.id, 'createAssignment', {
            survey_header_id: surveyId,
            student_id: state.user.id,
            student_name: state.user.name,
            assigned_by: state.user.id
        });

        // Success: Update UI
        statusDiv.textContent = '✅ Assigned! Refresh your dashboard. (Click My Dash)';
        statusDiv.classList.remove('text-gray-400');
        statusDiv.classList.add('text-green-600');
        
        // Optional: Disable clicking on this specific card again
        card.style.pointerEvents = 'none';
        card.classList.replace('hover:border-purple-400', 'border-green-200');

    } catch (error) {
        console.error('survey assignment failed:', error);
        statusDiv.textContent = `❌ ${error.message}`
        statusDiv.classList.replace('text-gray-400', 'text-red-600');
    }
}

