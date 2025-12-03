// work/survey/surveyUtils.js
// Shared helpers for survey modules: loading and normalizing survey view rows
console.log('Imported: work/survey/surveyUtils.js');

import { executeIfPermitted } from '../../registry/executeIfPermitted.js';

/**
 * Normalize rows returned from the `readSurveyView` DB function into a
 * structured survey object used by UI modules.
 * @param {Array<Object>} rows
 * @returns {Object|null}
 */
export function normalizeSurveyView(rows) {
  if (!rows || rows.length === 0) return null;

  const survey = {
    surveyId: rows[0].survey_id,
    name: rows[0].survey_name,
    description: rows[0].survey_description,
    authorId: rows[0].author_id,
    createdAt: rows[0].survey_created_at,
    questions: []
  };

  const questionMap = new Map();

  for (const row of rows) {
    const qId = row.question_id;
    const aId = row.answer_id;
    const autoId = row.automation_id;

    if (!questionMap.has(qId)) {
      questionMap.set(qId, {
        questionId: qId,
        text: row.question_text,
        description: row.question_description,
        questionNumber: row.question_number,
        answers: []
      });
    }

    const question = questionMap.get(qId);
    let answer = question.answers.find(a => a.answerId === aId);
    if (!answer) {
      answer = {
        answerId: aId,
        text: row.answer_text,
        description: row.answer_description,
        answerNumber: row.answer_number,
        automations: []
      };
      question.answers.push(answer);
    }

    if (autoId) {
      answer.automations.push({
        automationId: autoId,
        name: row.automation_name,
        automationNumber: row.automation_number,
        taskHeaderId: row.task_header_id,
        relationship: row.relationship,
        approIsId: row.appro_is_id,
        approIsName: row.appro_is_name,
        ofApproId: row.of_appro_id,
        ofApproName: row.of_appro_name,
        taskStepId: row.task_step_id
      });
    }
  }

  survey.questions = Array.from(questionMap.values());
  return survey;
}

/**
 * Load the raw rows from the DB and return a normalized survey object.
 * @param {string} userId
 * @param {string} surveyId
 * @returns {Object|null}
 */
export async function loadAndNormalizeSurvey(userId, surveyId) {
  if (!surveyId) return null;
  const rows = await executeIfPermitted(userId, 'readSurveyView', { survey_id: surveyId });
  return normalizeSurveyView(rows || []);
}
