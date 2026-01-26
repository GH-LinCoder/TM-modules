// modules/displaySurvey.js
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { appState } from '../../state/appState.js';
import { resolveSubject } from '../../utils/contextSubjectHideModules.js';
import { executeAutomations } from '../../utils/executeAutomations.js'; // from DISPLAY_TASK
import { renderSurveySummaryAsReadonly } from '../../utils/surveySummaryRenderer.js';
//import { renderSurveyAsDisplayCards } from '../../utils/surveyCardRenderer.js';
import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';

console.log('displaySurvey.js loaded');

//let panelEl = null;
let subject = null;
let subjectId = null;

let autoPetition = {
    auth_id:'',  // from resolveSubject
    appro_id:'',  // from resolveSubject
    task_id:null,
    step_id:null,
    survey_id:'', //from surveyView
    survey_answer_id:'', //from surveyView
    assignment_id:'',  //from task_assignments
    automation_id:'' //from  next file executeAutomations?
}




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
 // panelEl = panel;
  if (!panel || !panel.isConnected) return;

  try {
    subject = await resolveSubject();
    subjectId = subject.approUserId; //changed from subject.id which was auth id  21:40 jan 14
    console.log('subject for surveys',subject); //seems to be correct subject here - in test cannie id "6004dc44-a451-417e-80d4-e9ac53265beb" dec 26
    // Load assigned surveys
 // 1: add subject to petition
    autoPetition.auth_id = subject.id; // prepare all the params to be sent to the rpc function permissions_judge
    autoPetition.appro_id = subject.approUserId;
    console.log('autoPetition',autoPetition);
    
    const assignments = await executeIfPermitted(
      appState.query.userId,
      'readAssignmentsSurveys',
      { student_id: subjectId}
    );
console.log('assignments',assignments);
    if (!assignments?.length) {
      panel.innerHTML = `<div class="text-gray-500 text-center py-8">It seems that you have not been sent any surveys.</div>`;
      return;
    }

    panel.innerHTML = '';
    
    // Render each assigned survey
    for (const assignment of assignments) 
    {console.log('assignment',assignment,'ass id:', assignment.assignment_id, 'survey id',assignment.assignment.survey_header);
     
     autoPetition.survey_id =assignment.assignment.survey_header;
     //autoPetition.survey_answer_id = //where get this? 
     console.log('autoPetition',autoPetition);
     
      const surveyRows = await executeIfPermitted(
        appState.query.userId,
        'readSurveyView',
        { survey_id: assignment.assignment.survey_header }
      );
console.log('surveyRows',surveyRows);
      if (!surveyRows?.length) continue;

      const surveyContainer = document.createElement('div');
      surveyContainer.className = 'mb-8';
      surveyContainer.innerHTML = renderSurveySummaryAsReadonly(surveyRows, assignment.assignment_id);//imported function
      panel.appendChild(surveyContainer);

      // Attach answer listener
      surveyContainer.addEventListener('change', (e) => {
        if (e.target.classList.contains('survey-answer-radio')) {
          const answerId = e.target.value;
          console.log('e',e.target.dataset);
//2.autoPetition add asignment id          
        autoPetition.assignment_id = e.target.dataset.assignment; //collect data to be sent to permission_judge

       autoPetition.survey_answer_id = answerId;
        console.log('autoPetition:',autoPetition);// 

          handleAnswerSubmit(answerId);
        }
      });
    }
  } catch (error) {
    console.error('Error loading surveys:', error);
    panel.innerHTML = `<div class="text-red-500 text-center py-8">Failed to load surveys.</div>`;
    showToast('Failed to load surveys', 'error');
  }
}


async function handleAnswerSubmit(answerId){
console.log('handleAnswersSubmit for answer',answerId);
  try {
    const automations = await executeIfPermitted(subjectId, 'readSurveyAutomations', {//reads (*) from automations for this answer
      answer_id: answerId
    });
    console.log('automations read from db:',automations, 'autoPetition:',autoPetition);
 executeAutomations(automations, subject,autoPetition);
    // renderAutomationCards(container, automations);
  } catch (error) {
    console.error('Failed to load automations:', error);
    showToast('Could not load automations', 'error');
  }

}


  //NEEDS TO EXECUTE AUTOMATIONS if found on current step of the task, but is autoPetion assigned values yet? 




/*
async function handleAnswerSubmit(answerId, surveyRows) {
  // Find automations for this answer  We get the automations from the survey view.
  
  
  console.log('handleAnswersSubmit()');
  console.log('subject',subject,'answerId', answerId, 'surveyRows',surveyRows);

  const automations = surveyRows.filter(row => row.answer_id === answerId && row.auto_id);//how is this 'automations'? This is a row from a view. it contains auto_id which could be used to read the actual automation
//3.autoPetition and survey and answer id  
  autoPetition.survey_id = surveyRows[0].survey_id;
  autoPetition.survey_answer_id = answerId;
console.log('autoPetition',autoPetition);
console.log('automations',automations);
  // Execute automations (same as DISPLAY_TASK)
  if (automations.length > 0) {

    executeAutomations(automations, subject, autoPetition); //subject is used for relations-usually it is the respondant who is to be related as the appro_is UNLESS the auto is assigning someone else to a of_appro. What currently can't be assigned is the subject as of_appro
    // - why is assigned_by_automation left as null? This should be passed the autoId. is it inside automations?
  }

  // Optional: show success message
  showToast('Response recorded!', 'success');

  // Optional: auto-advance or reload
 // setTimeout(() => render(panelEl, {}), 500);
}*/