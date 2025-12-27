// utils/surveyCardRenderer.js
import { icons } from '../registry/iconList.js';

/**
 * Render a single survey as cards (non-editable)
 * @param {Array} surveyRows - from readSurveyView
 * @returns {string} HTML string
 */
export function renderSurveyAsDisplayCards(surveyRows) {
  if (!surveyRows?.length) return '';

  const surveyInfo = surveyRows[0];// rows end with something unique. It could be an automation, but if no automation then the answer would be unique. (If no answer then the question is unique & probably an oversight)
  //therefore the first part of every row is the name and description of the survey. This isn't just in rows[0]
  
  let html = `                     
    <div class="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
      <div class="text-center mb-4">
        <h2 class="text-xl font-bold text-gray-900">${surveyInfo.survey_name}</h2>
        <p class="text-sm text-gray-600">${new Date(surveyInfo.survey_created_at).toLocaleDateString()}</p>
      ${surveyInfo.survey_id}
        </div>
      <div class="clickable-item  bg-orange-50 border-l-4 border-orange-400 rounded-lg p-3 mb-2 shadow-sm hover:shadow-md">
      
        <p class="text-gray-800 whitespace-pre-line">${surveyInfo.survey_description}</p>
      </div>
  `;

  // Group by question
  const questions = [...new Map(surveyRows.map(r => [r.question_id, r])).values()];
  for (const q of questions) {
    const answers = surveyRows.filter(r => r.question_id === q.question_id);
    html += renderQuestionCard(q, answers);
  }

  html += `</div>`;
  return html;
}

function renderQuestionCard(question, answers) {
  console.log('renderQuestionCard()');
  const answersHTML = answers.map(a => {
    // Check if answer has automations (for icon)
    console.log('a',a);//nothing logs
  
    const hasAutomations = a.auto_id;
  console.log('has', hasAutomations);
    const icon = hasAutomations ? `<span class="ml-2 text-blue-600">${icons.automation}  ${a.auto_name} Auto_id:${a.auto_id}</span>` : '';
    
    return `
      <div class="clickable-item data-type='answer' hover:scale-105 transition-transform bg-blue-50 border-l-4 border-blue-400 rounded-lg p-3 mb-2 shadow-sm hover:shadow-md ml-2">
        <input type="radio" 
               id="ans_${a.answer_id}" 
               name="survey_${question.survey_id}_q${question.question_number}" 
               value="${a.answer_id}"
               class="survey-answer-radio mt-1 mr-3">
        <label for="ans_${a.answer_id}" class="flex-1">
          <span class="font-medium">${a.answer_name}</span>
          ${icon}
          ${a.answer_description ? `<div class="text-sm text-gray-600">${a.answer_description}</div>` : ''}
        </label>
      </div>
    `;
  }).join('');

  return `
    <div class="mb-6">
      <h3 class="clickable-item  bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-3 mb-2 shadow-sm hover:shadow-md">
        Question ${question.question_number}: ${question.question_name}
      </h3>
      ${question.question_description ? `<p class="text-gray-700 mb-3">${question.question_description}</p>` : ''}
      <div class="space-y-2">${answersHTML}</div>
    </div>
  `;
}