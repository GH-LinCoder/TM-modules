// ./work/surveys/displaySurveyCards.js
// Renders abbreviated clickable survey cards for myDash

import { appState } from '../../state/appState.js';
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';

import { render as renderOneSurvey } from './displayOneSurvey.js';
//need to create the above new file

//need resolve if use the function from loadMyDashWithData
import { detectMyDash,resolveSubject, myDashOrAdminDashDisplay} from '../../utils/contextSubjectHideModules.js'


console.log('displaySurveyCards.js loaded');

let itemOnDisplay = null; // to be able to close the item when the button has a 2nd click


export async function render(panel, petition = {}) {
    console.log('displaySurveyCards.render(', panel, petition, ')');

    const userId = petition.student;
    if (!userId) {
        panel.innerHTML = `<div class="text-red-600 p-4">No user ID provided.</div>`;
        return;
    }

    // Read survey assignments Uses: assignments_survey_view 
    // delivers
    // assignment_id, survey_name, survey_description, student_id, student_name, assignment_type, assignment, 
    // created_at, completed_at, abandoned_at, deleted_at, deleted_by,is_deleted
    let assignments = [];
    try {
// changing to use the same function that loadMyDashWithData uses. That seems to work when substituted in the displayTaskCards 

const subject = await resolveSubject();       

const tasksAndSurveys = await executeIfPermitted(
                subject.id, 
                'readStudentAssignments', 
                { student_id: subject.approUserId, type: subject.type } //if send type 'app-human' the registry will not look for assignments !! 22:36 March 13  WHY?
            );    

/*
        assignments = await executeIfPermitted(
            userId,
            'readAssignmentsSurveys',
            { student_id: userId }
        );
*/
console.log('tasksAndSurveys',tasksAndSurveys);
        assignments = tasksAndSurveys.surveyData; //because readStudentAssignments returns both tasks and surveys, we need to specify which one we want. 22:36 March 13    


    } catch (err) {
        console.error('Error reading survey assignments:', err);
        panel.innerHTML = `<div class="text-red-600 p-4">Error loading surveys.</div>`;
        return;
    }



    console.log('assignments', assignments); // 
    if (!assignments || assignments.length === 0) {
        panel.innerHTML = `
            <div class="text-gray-500 text-center py-8">
                No survey assignments found.
            </div>`;
        return;
    }

    // Render card container
    panel.innerHTML = `
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-3" data-list="my-surveys-abbrev"></div>
    `;

    const container = panel.querySelector('[data-list="my-surveys-abbrev"]');

    assignments.forEach(survey => {
//need to exclude those with completed_at, abandoned_at, deleted_at,  is_deleted = true
            //    console.log('survey', survey, 'survey.assignment',survey.assignment, 'survey.assignment.survey_header',survey.assignment.survey_header);

                if(!survey.completed_at && !survey.is_deleted) { //new 19:13 March 13 + closing } below

                const card = document.createElement('div');

        card.className =
            'bg-orange-50 border border-orange-200 rounded-lg p-3 cursor-pointer ' +
            'hover:shadow-md flex justify-between items-center';

        // Petition metadata
        card.dataset.action = 'display-one-survey';
        card.dataset.entityType = 'survey';
        card.dataset.assignmentId = survey.assignment_id;
//changed to cope with different modules storing this value differently
//        card.dataset.surveyHeader = survey.assignment.survey_header ;
 card.dataset.currentStep = survey.current_step;
card.dataset.surveyHeader = survey.assignment.survey_header || survey.assignment.survey_header_id;

        //card.dataset.module = 'survey';
        //card.dataset.section = 'survey-card';
        card.dataset.destination = 'display-area';

        // Determine card text
       // const title = survey.survey_name || 'Untitled survey'; //not done in displayTaskCards
// surveys don't have steps.
 //       const stepInfo = survey.current_step
 //           ? `Step ${survey.current_step}${survey.step_name ? ` — ${survey.step_name}` : ''}`
 //           : 'Survey ready';
// we may need to track the question number <-------

        card.innerHTML = `
            <div>
                <h4 class="text-sm font-semibold text-orange-800">${survey.survey_name}</h4>
                <!--p class="text-xs text-gray-600">${survey.question_name}</p-->
            </div>
            <span class="text-orange-500 text-lg">›</span>
        `;

        // Clicking the card triggered a petition, but need to replace this with direct call to the function

card.addEventListener('click', (e) => {
    e.stopPropagation(); // Keep this — prevents bubbling duplication
    
    const assignmentId = e.currentTarget.dataset.assignmentId;
const surveyId = e.currentTarget.dataset.surveyHeader;
const currentStep = e.currentTarget.dataset.currentStep;

    console.log('🖱️ Card clicked, loading directly: assignment', assignmentId, 'survey', surveyId);
    
    // ✅ Find the detail panel target
    const detailPanel = document.querySelector('[data-section="display-area"]');
    if (!detailPanel) {
        console.error('Detail panel not found');
        return;
    }
    
detailPanel.scrollIntoView({
    behavior: "smooth",
    block: "start"
});


// new 17:30 March 29 toggle to mimic the behaviour of the pertition system. 2nd click closes the item.
        if (itemOnDisplay === assignmentId){detailPanel.innerHTML =''; itemOnDisplay = null; return;} // toggle close if same card clicked again. Mimics the normal petition flexmain method
    itemOnDisplay = assignmentId; // set the currently displayed item
//the close should remove listeners in the module that is being closed, but that can't be done here.

// Toggle logic: if open, close; if closed, open (Mimics the normal petition flexmain method)



    // ✅ Call the render function directly with a custom query object
    renderOneSurvey(detailPanel, {


        assignmentId: assignmentId,
        entityType: 'survey',
        surveyId:surveyId,
        currentStep:currentStep
        // Pass any other context the render function needs
        //student: petition.student // if needed
    });
});

        /*card.addEventListener('click', () => { console.log('card clicked');
            appState.setQuery({
                petitioner: {
                    Module: 'myDash',
                    Section: 'surveys',
                    Action: 'display-survey',
                    Destination: 'display-area',
                    entityType: 'survey',
                    entityId: survey.assignment_id
                }
            });
        }); */




        container.appendChild(card);
} //new 19:13 march 13
    });



}
