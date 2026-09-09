// ./work/surveys/displaySurveyCards.js
// Renders abbreviated clickable survey cards for myDash

import { appState } from '../../state/appState.js';
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { resolveSubject } from '../../utils/contextSubjectHideModules.js';

console.log('displaySurveyCards.js loaded');

let itemCounts = {};

export async function renderCompletedAbandonedSurveys(panel, petition = {}, renderType) {
  console.log('displayCompletedSurveyCards.render()');
  render(panel, petition, renderType);
}

export async function render(panel, petition = {}, renderType = 'active') {
  console.log('displaySurveyCards.render()');
  const userId = petition.student;
  if (!userId) {
    panel.innerHTML = `<div class="text-red-600 p-4">No user ID provided.</div>`;
    return;
  }

  let assignments = [];
  try {
    const subject = await resolveSubject();       
    const tasksAndSurveys = await executeIfPermitted(
      subject.id, 
      'readStudentAssignments', 
      { student_id: subject.approUserId, type: subject.type }
    );    

    assignments = tasksAndSurveys.surveyData || [];    
  } catch (err) {
    console.error('Error reading survey assignments:', err);
    panel.innerHTML = `<div class="text-red-600 p-4">Error loading surveys.</div>`;
    return;
  }

  let activeColors = 'bg-yellow-50 border border-yellow-200 rounded-r-2xl p-3 cursor-pointer '; 
  let displayNumberEl = null;

  switch (renderType) {
    case 'completed':
      assignments = assignments.filter(item => item.completed_at !== null);
      activeColors = 'bg-green-200 border border-green-400 rounded-lg p-3 cursor-pointer ';
      itemCounts.completed = assignments.length;
      displayNumberEl = document.querySelector('[data-value="completed-surveys"]');
      if (displayNumberEl) displayNumberEl.textContent = itemCounts.completed;
      break;
    case 'abandoned':
      assignments = assignments.filter(item => item.abandoned_at !== null);
      itemCounts.abandoned = assignments.length;
      activeColors = 'bg-red-100 border border-red-400 rounded-lg p-3 cursor-pointer ';    
      displayNumberEl = document.querySelector('[data-value="abandoned-surveys"]');
      if (displayNumberEl) displayNumberEl.textContent = itemCounts.abandoned; 
      break;
    default:
      assignments = assignments.filter(item => item.completed_at === null && item.abandoned_at === null);
      itemCounts.active = assignments.length;
      break;
  }

  if (!assignments || assignments.length === 0) {
    panel.innerHTML = `
      <div class="text-gray-500 text-center py-8">
        No ${renderType} survey assignments found.
      </div>`;
    return;
  }

  // Render card container
  panel.innerHTML = `
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-3" data-list="my-surveys-abbrev"></div>
  `;

  const container = panel.querySelector('[data-list="my-surveys-abbrev"]');

  assignments.forEach(survey => {
    if (!survey.is_deleted) {
      const card = document.createElement('div');
      card.className = `${activeColors} hover:shadow-md flex justify-between items-center`;

      // Standard attributes for the event delegation listener in flexmain
      card.dataset.action = 'display-one-survey';
      card.dataset.entityType = 'survey';
      card.dataset.assignmentId = survey.assignment_id;
      card.dataset.currentStep = survey.current_step;
      card.dataset.surveyHeader = survey.assignment.survey_header || survey.assignment.survey_header_id;
      card.dataset.destination = 'display-area';

      card.innerHTML = `
        <div>
          <h4 class="text-sm font-semibold text-orange-800">${survey.survey_name}</h4>
        </div>
        <span class="text-orange-500 text-lg">›</span>
      `;

      // Assign petition context when clicked; allow event to bubble up to flexmain
      card.addEventListener('click', () => {
        appState.query.petitioner.assignmentId = survey.assignment_id;
        appState.query.petitioner.surveyHeader = card.dataset.surveyHeader;
        appState.query.petitioner.currentStep = survey.current_step;
      });

      container.appendChild(card);
    }
  });
}