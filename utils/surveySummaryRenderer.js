// utils/surveySummaryRenderer.js
import { icons } from '../registry/iconList.js';

/**
 * Render survey summary in read-only mode (mirroring editSurvey's structure)
 * @param {Array} surveyRows - Output from readSurveyView
 * @param {string} assignmentId - Assignment ID for data attributes
 * @returns {string} HTML string
 */
export function renderSurveySummaryAsReadonly(surveyRows, assignmentId) {
  if (!surveyRows?.length) return '';

  const surveyInfo = surveyRows[0];
  let html = `
    <div class="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200" data-assignment="${assignmentId}">
      <div class="text-center mb-4">
        <h2 class="text-xl font-bold text-gray-900">${escapeHtml(surveyInfo.survey_name)}</h2>
        <p class="text-sm text-gray-600">${new Date(surveyInfo.survey_created_at).toLocaleDateString()}</p>
        <p class="text-xs text-gray-500">${surveyInfo.survey_id}</p>
      </div>
      
      <!-- Survey Header -->
      <div class="clickable-item hover:scale-105 transition-transform bg-orange-50 border-l-4 border-orange-400 rounded-lg p-3 mb-4 shadow-sm">
        <p class="text-gray-800 whitespace-pre-line">${escapeHtml(surveyInfo.survey_description || '')}</p>
      </div>
  `;

  // Stateful deduplication (exactly like editSurvey)
  let oldQuestionId = null;
  let oldAnswerId = null;
  let oldAutoId = null;

  for (const row of surveyRows) {
    // Render Question
    if (row.question_id && row.question_id !== oldQuestionId) {
      html += `
        <div class="mb-4">
        <div class="clickable-item bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-3 mb-2 shadow-sm">  
        <h3 >
            ${icons.question} Question ${row.question_number}: ${escapeHtml(row.question_name)}
          </h3>
          ${row.question_description ? `
            <p class="mt-2 text-sm text-gray-700  whitespace-pre-line">
              ${escapeHtml(row.question_description)}
            </p></div>
          ` : ''}
      `;
      oldQuestionId = row.question_id;
    }

    // Render Answer
    if (row.answer_id && row.answer_id !== oldAnswerId) {
      html += `
        <div class="clickable-item data-type='answer' hover:scale-105 transition-transform bg-blue-50 border-l-4 border-blue-400 rounded-lg p-3 mb-2 shadow-sm ml-4">
          <input type="radio" 
            data-assignment="${assignmentId}"
            id="ans_${row.answer_id}" 
            name="survey_${row.survey_id}_q${row.question_number}" 
            value="${row.answer_id}"
            class="survey-answer-radio mt-1 mr-3">
          <label for="ans_${row.answer_id}" class="flex-1">
            <span class="font-medium">${icons.answer} Answer ${row.answer_number}: ${escapeHtml(row.answer_name)}</span>
            ${row.answer_description ? `
              <div class="mt-2 text-sm text-gray-700">${escapeHtml(row.answer_description)}</div>
            ` : ''}
          </label>
        </div>
      `;
      oldAnswerId = row.answer_id;
    }

    // Render Automation
    if (row.auto_id && row.auto_id !== oldAutoId) {
      const autoClass = row.auto_deleted_at 
        ? 'bg-gray-100 text-gray-400 border-gray-300 text-sm'
        : 'bg-blue-50 border-indigo-400 text-sm';
      const autoText = row.auto_deleted_at 
        ? `<i>${icons.automation} Auto ${row.auto_number}: ${escapeHtml(row.auto_name)} (soft deleted)</i>`
        : `${icons.automation} Auto ${row.auto_number}: ${escapeHtml(row.auto_name)}<br>
           <span class="text-sm">${escapeHtml(row.auto_description || '')}</span>`;

      html += `
        <div class="clickable-item data-type='auto'  ${autoClass}  rounded-lg p-3 mb-2  ml-40">
          ${autoText}
          <div class="text-xs mt-1">${row.auto_id}</div>
        </div>
      `;
      oldAutoId = row.auto_id;
    }
  }

  html += `</div>`;
  return html;
}

// Basic HTML escaping
function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}