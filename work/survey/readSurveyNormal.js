import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
//import { showToast } from '../../ui/showToast.js';
import { appState } from '../../state/appState.js';
const userId = appState.query.userId;


export async function readSurveyNormalised(surveyId){
const rawData = await executeIfPermitted(userId, 'readSurveyView', { survey_id: surveyId});
const surveyNorm = normalizeSurveyView(rawData);
return surveyNorm;

}

// Now you have:
// state.survey, state.questions[], state.answers[], state.automations[]
export function normalizeSurveyView(rows) {
  if (!rows?.length) return null;

  // Survey (just take first row)
  const header = {
    id: rows[0].survey_id,
    name: rows[0].survey_name,
    description: rows[0].survey_description,
    authorId: rows[0].author_id,
    createdAt: rows[0].survey_created_at
  };

  // Build flat arrays with Maps to avoid duplicates
  const questions = new Map();
  const answers = new Map();
  const automations = [];

  for (const r of rows) {
    // Question
    if (r.question_id && !questions.has(r.question_id)) {
      questions.set(r.question_id, {
        id: r.question_id,
        surveyId: r.survey_id,
        name: r.question_text,
        description: r.question_description,
        question_number: r.question_number
      });
    }

    // Answer
    if (r.answer_id && !answers.has(r.answer_id)) {
      answers.set(r.answer_id, {
        id: r.answer_id,
        questionId: r.question_id,
        name: r.answer_text,
        description: r.answer_description,
        answer_number: r.answer_number
      });
    }

    // Automation (include even if soft-deleted; UI can filter)
    if (r.automation_id) {
      automations.push({
        id: r.automation_id,
        answerId: r.answer_id,
        type: r.task_id ? 'task' : r.survey_id ? 'survey' : r.relationship ? 'relationship' : 'unknown',
        taskId: r.task_id,
        surveyId: r.survey_id,
        relationship: r.relationship,
        ofApproId: r.of_appro_id,
        approIsId: r.appro_is_id,
        name: r.automation_name,
        automation_number: r.automation_number,
        deletedAt: r.deleted_at
      });
    }
  }

  return {
    header,
    questions: Array.from(questions.values()),
    answers: Array.from(answers.values()),
    automations
  };
}

/* Example of the output

surveyNorm= 
Object { survey: {…}, questions: (1) […], answers: (1) […], automations: [] }

answers: Array [ {…} ]
0: Object { id: "5ed5fdff-4446-45ab-a919-62f99b553cef", questionId: "a0ea36ac-2890-44dd-ac39-debc269adaaa", text: "Edit this...", … }
answerNumber: 1
description: "The first answer to the first question"
id: "5ed5fdff-4446-45ab-a919-62f99b553cef"
questionId: "a0ea36ac-2890-44dd-ac39-debc269adaaa"
text: "Edit this..."
<prototype>: Object { … }
length: 1<prototype>: Array []

automations: Array []
length: 0
<prototype>: Array [

questions: Array [ {…} ]
0: Object { id: "a0ea36ac-2890-44dd-ac39-debc269adaaa", surveyId: "5fc82a52-d1f2-48f7-a65b-424e888eed41", text: "Dec 6 too late", … }
description: "The questions are in the wrong order"
id: "a0ea36ac-2890-44dd-ac39-debc269adaaa
questionNumber: 1
surveyId: "5fc82a52-d1f2-48f7-a65b-424e888eed41
text: "Dec 6 too late"
length: 1

survey: Object { id: "5fc82a52-d1f2-48f7-a65b-424e888eed41", name: "A TEST 23:16 Dec 6", description: "Switch version", … }
authorId: "e0c6201d-66e0-4b1c-8826-027ec059d523"
createdAt: "2025-11-28T20:05:29.325488+00:00"
description: "Switch version"
id: "5fc82a52-d1f2-48f7-a65b-424e888eed41"
name: "A TEST 23:16 Dec 6"
*/