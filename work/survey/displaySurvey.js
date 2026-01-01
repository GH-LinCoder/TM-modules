// modules/displaySurvey.js
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { appState } from '../../state/appState.js';
import { resolveSubject } from '../../utils/contextSubjectHideModules.js';
import { executeAutomations } from '../../utils/executeAutomations.js'; // from DISPLAY_TASK
import { renderSurveyAsDisplayCards } from '../../utils/surveyCardRenderer.js';
import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';

console.log('displaySurvey.js loaded');

let panelEl = null;
let subject = null;
let subjectId = null;


function checkClipboardForSurveys(panel) {
console.log('checkClipboardForSurveys()');  
  // Get tasks or surveys from clipboard
  const surveys = getClipboardItems({ as: 'survey', type: 'surveys' });
  if (surveys.length === 0) return; //nothing yet selected

  //at least one survey is in the clipboard so let's use it
 render(panel); //moved here from init  19:31 dec 9
}



export async function render(panel, query = {}) {

    onClipboardUpdate(() => {
checkClipboardForSurveys(panel);
    });

console.log('displaySurvey().render())');
  panelEl = panel;
  if (!panel || !panel.isConnected) return;

  try {
    subject = await resolveSubject();
    subjectId = subject.id;
console.log('subject',subject); //seems to be correct subject here - in test cannie id "6004dc44-a451-417e-80d4-e9ac53265beb" dec 26
    // Load assigned surveys
    const assignments = await executeIfPermitted(
      appState.query.userId,
      'readStudentAssignments',
      { student_id: subjectId, type: 'survey' }
    );
console.log('assignments',assignments);
    if (!assignments?.length) {
      panel.innerHTML = `<div class="text-gray-500 text-center py-8">No surveys assigned.</div>`;
      return;
    }

    panel.innerHTML = '';
    
    // Render each assigned survey
    for (const assignment of assignments) {
      const surveyRows = await executeIfPermitted(
        appState.query.userId,
        'readSurveyView',
        { survey_id: assignment.survey_header_id }
      );
console.log('surveyRows',surveyRows);
      if (!surveyRows?.length) continue;

      const surveyContainer = document.createElement('div');
      surveyContainer.className = 'mb-8';
      surveyContainer.innerHTML = renderSurveyAsDisplayCards(surveyRows);//imported function
      panel.appendChild(surveyContainer);

      // Attach answer listener
      surveyContainer.addEventListener('change', (e) => {
        if (e.target.classList.contains('survey-answer-radio')) {
          const answerId = e.target.value;
          handleAnswerSubmit(answerId, surveyRows);
        }
      });
    }
  } catch (error) {
    console.error('Error loading surveys:', error);
    panel.innerHTML = `<div class="text-red-500 text-center py-8">Failed to load surveys.</div>`;
    showToast('Failed to load surveys', 'error');
  }
}

async function handleAnswerSubmit(answerId, surveyRows) {
  // Find automations for this answer
  console.log('handleAnswersSubmit()');
  console.log('subject',subject,'answerId', answerId, 'surveyRows',surveyRows);
  const automations = surveyRows.filter(row => row.answer_id === answerId && row.auto_id);


console.log('automations',automations);
  // Execute automations (same as DISPLAY_TASK)
  if (automations.length > 0) {
    executeAutomations(automations, subject); //subject is used for relations-usually it is the respondant who is to be related as the appro_is UNLESS the auto is assigning someone else to a of_appro. What currently can't be assigned is the subject as of_appro
    // - why is assigned_by_automation left as null? This should be passed the autoId. is it inside automations?
  }

  // Optional: show success message
  showToast('Response recorded!', 'success');

  // Optional: auto-advance or reload
 // setTimeout(() => render(panelEl, {}), 500);
}