// utils/surveySummaryRenderer.js
import { icons } from '../registry/iconList.js';
//import the knowledge of whether duisplaying in myDash or adminDash.  In adminDash can display (greyaed-out) deleted bits. But don't display them in myDash
import { detectMyDash,resolveSubject, myDashOrAdminDashDisplay} from '../utils/contextSubjectHideModules.js'
// detectMyDash(panel) will return true if the dashboard is myDash

/**
 * Render survey summary in read-only mode (mirroring editSurvey's structure)
 * @param {Array} surveyRows - Output from readSurveyView
 * @param {string} assignmentId - Assignment ID for data attributes
 * @returns {string} HTML string
 */
export function renderSurveySummaryAsReadonly(surveyRows, assignmentId, isMyDash) {
    if (!surveyRows?.length) return '';
    
    const surveyInfo = surveyRows[0];
    
    // ✅ Get unique question numbers
    const questionNumbers = [...new Set(surveyRows.map(r => r.question_number).filter(Boolean))];
    
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
    
    // ✅ Loop through each question and call renderSurveyQuestion

//changed to id instead of number
/*  for (const qId of sortedQuestionIds) {
        html += renderSurveyQuestion(surveyRows, assignmentId, qId, isMyDash);
    }
*/ 
//changed again

// Get unique question IDs, sorted by question_number for display order
const questionIds = [...new Set(surveyRows.map(r => r.question_id).filter(Boolean))];
const sortedQuestionIds = questionIds.sort((a, b) => {
    const rowA = surveyRows.find(r => r.question_id === a);
    const rowB = surveyRows.find(r => r.question_id === b);
    return (rowA?.question_number || 0) - (rowB?.question_number || 0);
});

for (const qId of sortedQuestionIds) {
    html += renderSurveyQuestion(surveyRows, assignmentId, qId, isMyDash);
}


    /*
    for (const qNum of questionNumbers) {
        html += renderSurveyQuestion(surveyRows, assignmentId, qNum, isMyDash);
    } */
    
    // Information feedback area
       html += getInfoFeedbackHTML();
    
    /*
    `<div class="bg-green-100 rounded border flex flex-col md:flex-row justify-center gap-4 pt-4 border-t border-gray-200">
        <p class="text-lg font-bold">Information:</p>
        <div id="informationSection" class="w-full">
            <!-- Information cards will be added here -->
        </div>
    </div>
    </div>`;
*/

    
    return html;
}


export function renderSurveyQuestion(surveyRows, assignmentId, questionId, isMyDash) {
    if (!surveyRows?.length) return '';
    
    // ✅ Filter to only this question's rows
    const questionRows = surveyRows.filter(row => row.question_id === questionId);
    if (!questionRows.length) return '';
    
    const surveyInfo = questionRows[0];
    const questionInfo = questionRows.find(r => r.question_id); // Get question metadata
    
    let html = '';
    
    // ✅ RENDER HEADER ONCE (outside loop)
    if (questionInfo?.question_id) {
        html += `
        <div class="mb-4">
            <div class="clickable-item bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-3 mb-2 shadow-sm">
                <h3>
                    ${icons.question} Question ${questionInfo.question_number}: ${escapeHtml(questionInfo.question_name)}
                </h3>
                ${questionInfo.question_description ? `
                <p class="mt-2 text-sm text-gray-700 whitespace-pre-line">
                    ${escapeHtml(questionInfo.question_description)}
                </p>` : ''}
            </div>
        `;
    }
    
    // ✅ Stateful deduplication for answers/automations only
    let oldAnswerId = null;
    let oldAutoId = null;
    
    // ✅ LOOP: Render answers + automations only
    for (const row of questionRows) {
        // Render Answer (deduplicated by answer_id)
        if (row.answer_id && row.answer_id !== oldAnswerId) {
            html += `
            <div class="clickable-item data-type='answer' hover:scale-105 transition-transform bg-blue-50 border-l-4 border-blue-400 rounded-lg p-3 mb-2 shadow-sm ml-4">
                <input type="radio"
                    data-assignment="${assignmentId}"
                    data-answer-name="${row.answer_name}"
                    id="ans_${row.answer_id}"
                    name="survey_${surveyInfo.survey_id}_q${questionInfo.question_number}"
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
        
        // Render Automation (deduplicated by auto_id)
        if (row.auto_id && row.auto_id !== oldAutoId) {
            if (isMyDash && row.auto_deleted_at) {
                // Skip rendering entirely for myDash users
            } else {
                const autoClass = row.auto_deleted_at
                    ? 'bg-gray-100 text-gray-400 border-gray-300 text-sm'
                    : 'bg-blue-50 border-indigo-400 text-sm';
                
                const autoText = row.auto_deleted_at
                    ? `<i>${icons.automation} Auto ${row.auto_number}: ${escapeHtml(row.auto_name)} (soft deleted)</i>`
                    : `${icons.automation} Auto ${row.auto_number}: ${escapeHtml(row.auto_name)}<br>
                       <span class="text-sm">${escapeHtml(row.auto_description || '')}</span>`;
                
                html += `
                <div class="clickable-item data-type='auto' ${autoClass} rounded-lg p-3 mb-2 ml-40">
                    ${autoText}
                    <div class="text-xs mt-1">${row.auto_id}</div>
                </div>
                `;
            }
            oldAutoId = row.auto_id;
        }
    }
    
    // Information feedback area
    html += getInfoFeedbackHTML();
    
    /*
    `<div class="bg-green-100 rounded border flex flex-col md:flex-row justify-center gap-4 pt-4 border-t border-gray-200">
        <p class="text-lg font-bold">Information:</p>
        <div id="informationSection" class="w-full">
            <!-- Information cards will be added here -->
        </div>
    </div>
    </div>`;
*/


    return html;
}

function getInfoFeedbackHTML(){
return `
    <div class="bg-green-100 rounded border flex flex-col md:flex-row justify-center gap-4 pt-4 border-t border-gray-200">
        <p class="text-lg font-bold">Information:</p>
        <div id="informationSection" class="w-full">
        NEW QUESTION
            <!-- Information cards will be added here -->
        </div>
    </div>`;

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