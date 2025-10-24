//./surveys/displayStudentSurveys.js

import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { appState } from '../../state/appState.js';

export async function render(panel, query = {}) {
  console.log('displayAllStudentSurveys.js render() called');

  const userId = appState.query.userId;
  const studentId = userId;

  try {
    const surveys = await executeIfPermitted(userId, 'readStudentAssignments', {
      student_id: studentId,
      type: 'survey' // singular, as confirmed
    });

    if (!surveys || surveys.length === 0) {
      panel.innerHTML = `<div class="text-gray-500 text-center py-8">No surveys assigned.${studentId}</div>`;
      return;
    }

    panel.innerHTML = ''; // Clear panel

    for (const survey of surveys) {
      const surveyName = survey.survey_name || 'Unnamed Survey';
      const surveyDescription = survey.survey_description || 'No description available';
      const studentName = survey.student_name || 'Unknown Student';

      const card = document.createElement('div');
      card.classList.add('bg-white', 'rounded-lg', 'shadow-lg', 'p-6', 'mb-8', 'border', 'border-gray-200');

      card.innerHTML = `
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold text-gray-900">${surveyName}</h3>
          <div class="text-sm text-gray-500">Student: ${studentName}</div>
        </div>

        <div class="text-sm text-gray-700 mb-4">${surveyDescription}</div>

        <div class="mt-4 flex justify-center">
          <button class="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        data-action="display-this-survey"
        data-destination="surveys-section"
        data-survey-id="${survey.survey_header_id}">
  Open Survey
</button>

        </div>
      `;
      card.querySelector('[data-action="display-this-survey"]').addEventListener('click', (e) => {
        const surveyId = e.target.getAttribute('data-survey-id');
        appState.query.clipboard = {
          surveyId: surveyId,
          as: 'survey'
        };
      });
      panel.appendChild(card);
    }

// the value in clipbaord read in next module (20:55 Oct 22)
//clipboard: Object { surveyId: "undefined", as: "survey" } as: "survey" surveyId: "undefined"


  } catch (error) {
    console.error('Error loading surveys:', error);
    panel.innerHTML = `<div class="text-red-500 text-center py-8">Failed to load surveys.</div>`;
    showToast('Failed to load surveys', 'error');
  }


  


}
