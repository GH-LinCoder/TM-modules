// ./work/survey/displayOneSurvey.js
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
//import { appState } from '../../state/appState.js';
import { detectMyDash, resolveSubject } from '../../utils/contextSubjectHideModules.js';
import { executeAutomations } from '../../utils/executeAutomations.js';
import { renderSurveyHeader, renderSurveyQuestion, getInfoFeedbackHTML } from '../../utils/surveySummaryRenderer.js';
//import { icons } from '../../registry/iconList.js';

console.log('displayOneSurvey.js loaded');

let subject = null;
//let assignment = null; //this seems to be confusing. Trying to use below instead
let assignedSurveyAsArray =null;

let panelEl = null;

let currentStep = 1; //added 12:58 Aug24  & deleted from render arguments, but log as undefined
let assignmentRow =[]; //new 15:20 Aug 25
//let answersArray = []; 
const autoPetition = {
    auth_id: '',
    appro_id: '',
    task_id: '',
    step_id: '',
    survey_header_id: null,
    survey_answer_id: null,
    assignment_id: '',
    automation_id: ''
};

// ✅ Track pending confirmation (for two-click flow)
let pendingConfirmation = null;
let isSubmitting = false;


function getSurveyProgress(assignment, assignedSurveyAsArray, currentQuestionId) {
    console.log('getSurveyProgress()-assignment',assignment, 'currentQuestionId',currentQuestionId);
    
// Find the questions by question_id, sorted later by question_number.
// Each element in assignedSurveyAsArray represents one row of the survey view:
// it may contain question, answer, and automation data. Multiple rows belong to the same question.


    const questionsById = new Map();
    for (const row of assignedSurveyAsArray) {
        //check if row has a questionId && it isn't already in the map
        if (row.question_id && !questionsById.has(row.question_id)) {
            //okay, found a new one so put in the map the questionId and the question number 
            questionsById.set(row.question_id, {
                id: row.question_id,
                number: row.question_number
            });
        }
    }
    //the map is now complete, but need convert to array & sorting into numerical order
    const questions = [...questionsById.values()].sort((a, b) => 
        (a.number || 0) - (b.number || 0)
    );
    //find the question index (number is index +1) of the current question (by using the currentQuestionId)
    const currentIndex = questions.findIndex(q => q.id === currentQuestionId);
    //find the id of the next question, which has been sorted into the next +1 position if exists
    const nextQuestionId = questions[currentIndex + 1]?.id || null;
    //if the above returns 'null' then the current question is the last question
    const isLastQuestion = nextQuestionId === null;
    //count how many questions there are
    const totalQuestions = questions.length;
 
console.log(
        currentQuestionId,' ',
        nextQuestionId,' ',
        isLastQuestion,' ',
        totalQuestions,' ',
        currentIndex,' ',
        questions);


    return {
        currentQuestionId,
        nextQuestionId,
        isLastQuestion,
        totalQuestions,
        currentIndex,
        questions
    };
}




export async function render(panel, query = {}) {
    console.log('displayOneSurvey.render()', { panel, query });
    panelEl = panel;
    console.log('render() query',query);
// card sends  renderOneSurvey(detailPanel, {assignmentId: assignmentId,entityType: 'survey',surveyId:surveyId,currentStep:currentStep
currentStep = 1;
    const { assignmentId, entityType, surveyId, student} = query;  //student??
    //where is currentStep set?? probably not sent & shold not be a constant
//deleted currenStep from arguments 12:57 Aug 24  added as a variable global = 1

console.log('assignmentId',assignmentId,'entityType',entityType,
     'surveyId',surveyId,'student',student,'currentStep',currentStep); //correct 22:23 March 14 - but undefined aug 23. Global fixed

    subject = await resolveSubject();
    
    autoPetition.auth_id = subject.id;
    autoPetition.appro_id = subject.approUserId;
    autoPetition.assignment_id = assignmentId;
    
    try { //the registry func needs:  const { survey_id } = payload;
         assignedSurveyAsArray = await executeIfPermitted(subject.approUserId, 'readSurveyView', {
            survey_id: surveyId
        });
        
        if (!assignedSurveyAsArray || assignedSurveyAsArray.length === 0) {
            panel.innerHTML = `<div class="text-gray-500 text-center py-8">No survey assignment found for: ${subject.name} - ${assignmentId}.</div>`;
            return;
        }
        
      //  assignment = assignedSurveyAsArray; //why put  assignedSurveyAsArray into global assignment? Made global 'assignedSurveyAsArray' 13:30 Aug 24
        autoPetition.survey_header_id = surveyId; //using 'assignment' is confusing with the table assignment and assignmentId

//could read assignment here to determine if active/completed/abandoned. Hold in global ?
assignmentRow = await executeIfPermitted(subject.id, 'readThisSurveyOrTaskAssignment',{ assignment_id: autoPetition.assignment_id }
);
// 12:18 Aug 24 - Not rendering the header - fixed
//panelEl, progress.nextQuestionId, currentStep, assignmentId


      //  renderLargeCards(panel,null,currentStep, assignmentId);//currentStep was set at 1, but should be
 renderHeaderQuestionInfo(panel,null,currentStep, assignmentId); //experiment 16:45 August 25
        

    } catch (error) {
        console.error('Error loading survey assignment:', error);
        panel.innerHTML = `<div class="text-red-500 text-center py-8">Failed to load survey assignment for: ${subject.name} - ${assignmentId}.</div>`;
        showToast(`No survey assignments found for: ${subject.name}`, 'error');
    }
}

// ✅ Helper: Find question_id by step number (question_number)
function findQuestionIdByStep(surveyRows, stepPosition) {
    if (!stepPosition || stepPosition < 1) return null;
    console.log('findQuestionIdByStep() stepPosition:', stepPosition);
    // Build sorted list of unique questions (same logic as getSurveyProgress)
    const questionsById = new Map();
    for (const row of surveyRows) {
        if (row.question_id && !questionsById.has(row.question_id)) {
            questionsById.set(row.question_id, {
                id: row.question_id,
                number: row.question_number
            });
        }
    }
    
    const questions = [...questionsById.values()].sort((a, b) => 
        (a.number || 0) - (b.number || 0)
    );
    
    // ✅ stepPosition is 1-based, array index is 0-based
    const index = stepPosition - 1;
    
    if (index < 0 || index >= questions.length) {
        console.warn(`⚠️ Step position ${stepPosition} out of range (0-${questions.length})`);
        return null;
    }
    if (!questions[index]) return questions[0].id; // console error questions[index] is undefined
    return questions[index].id;  //may be undefined
}

function renderHeaderQuestionInfo(panel, nextQuestionId, currentStep = 1, assignmentId) {
    console.log('renderHeaderQuestionInfo()');
    isSubmitting = false; // Reset submission state

    // 1. Determine background color
    let bgColor = 'bg-orange-300'; 
    if (assignmentRow?.abandoned_at) bgColor = 'bg-red-400'; 
    else if (assignmentRow?.completed_at) bgColor = 'bg-green-400';  
    
    // 2. Create main card with 4 distinct, empty containers
    const card = document.createElement('div');
    card.classList.add(bgColor, 'rounded-lg', 'shadow-lg', 'p-1', 'md:p-6', 'mb-1', 'md:mb-8', 'border', 'border-gray-200');
    card.dataset.assignmentId = assignedSurveyAsArray.assignment_id;
    
    card.innerHTML = `
        <div id="survey-header-container"></div>
        <div id="survey-progress-container" class="text-center text-sm text-gray-500 mb-1 md:mb-4"></div>
        <div id="survey-question-container"></div>
        <div id="survey-info-container"></div>
    `;
    
    panel.appendChild(card);

    // 3. Call sub-functions, passing the 'card' so they can find their specific containers
    renderHeader(card);
    renderQuestion(card, nextQuestionId, currentStep, assignmentId);
    renderInfo(card);
}

function renderHeader(card) {
    console.log('renderHeader()');
    const headerContainer = card.querySelector('#survey-header-container');
    if (!headerContainer) return;

    const isMyDash = detectMyDash(card); 
    const headerHTML = renderSurveyHeader(assignedSurveyAsArray, isMyDash);
    headerContainer.innerHTML = headerHTML;
}

function renderQuestion(card, nextQuestionId, currentStep = 1, assignmentId) {
    console.log('renderQuestion()');
    
if (typeof isSubmitting !== 'undefined') {
        isSubmitting = false; 
    }

    // 1. Resolve currentQuestionId
    let currentQuestionId = nextQuestionId;
    if (!currentQuestionId && currentStep) {
        currentQuestionId = findQuestionIdByStep(assignedSurveyAsArray, currentStep);
        console.log('📊 Mapped currentStep', currentStep, '→ question_id', currentQuestionId);
    }
    
    if (!currentQuestionId) {
        currentQuestionId = assignedSurveyAsArray[0]?.question_id;
        console.log('📊 Fallback to first question_id:', currentQuestionId);
    }

    // 2. Get progress
    const progress = getSurveyProgress(assignmentId, assignedSurveyAsArray, currentQuestionId); 

    console.log('📊 renderQuestion():', {
        currentQuestionId,
        displayPosition: progress.currentIndex + 1,
        totalQuestions: progress.totalQuestions,
        nextQuestionId: progress.nextQuestionId
    });

    // 3. Render Progress Text ("Question X of Y")
    const progressContainer = card.querySelector('#survey-progress-container');
    if (progressContainer) {
        progressContainer.innerHTML = `Question ${progress.currentIndex + 1} of ${progress.totalQuestions}`;
    }

    // 4. Render Question HTML
    const questionContainer = card.querySelector('#survey-question-container');
    if (questionContainer) {
        const isMyDash = detectMyDash(card);
        const questionHTML = renderSurveyQuestion(assignedSurveyAsArray, assignedSurveyAsArray.assignment_id, currentQuestionId, isMyDash);
        
        // Replace ONLY the question container's content
        questionContainer.innerHTML = questionHTML;

        // Fade in effect
        setTimeout(() => {
            questionContainer.querySelector('[data-fade-question]')?.classList.remove('opacity-0');
        }, 50);

        // 5. Attach listeners ONLY to the newly rendered radio buttons in this container
        attachListenersToRadioButtons(questionContainer, assignmentId, progress);
    }
}

function renderInfo(card) {
    console.log('renderInfo()');
    const infoContainer = card.querySelector('#survey-info-container');
    if (!infoContainer) return;

    // This structure stays static; only the inner #informationSection will be updated later
    infoContainer.innerHTML = `
        <div class="bg-green-100 rounded border flex flex-col md:flex-row justify-center gap-4 pt-4 border-t border-gray-200">
            <p class="text-lg font-bold">Information:</p>
            <div id="informationSection" class="w-full">
                New question
            </div>
        </div>
    `;
}

function attachListenersToRadioButtons(container, assignmentId, progress) {
    // Scope the search to the specific container to ensure we find the new buttons
    const radioButtons = container.querySelectorAll('.survey-answer-radio');
    console.log('📻 Found radio buttons:', radioButtons.length);
    
    radioButtons.forEach(radio => {
        radio.addEventListener('click', (e) => {
            e.preventDefault();  
            e.stopPropagation();
            
            if (typeof isSubmitting !== 'undefined' && isSubmitting) return; 
            
            const answerId = radio.value;
            const answerName = radio.dataset.answerName;
            const label = container.querySelector(`label[for="${radio.id}"]`);
            const span = label?.querySelector('span.font-medium');
            
            console.log('🖱️ Radio clicked:', { answerId, answerName });
            
            handleAnswerClick(assignmentId, span, answerId, answerName, radio, progress);
        });
    });
}


/*
function renderHeaderQuestionInfo(panel, nextQuestionId, currentStep=1, assignmentId){
console.log('renderHeaderQuestionInfo()');

let bgColor='bg-orange-300'; 
    if(assignmentRow.abandoned_at) bgColor = 'bg-red-400'; else if(assignmentRow.completed_at) bgColor = 'bg-green-400';  
    
    const card = document.createElement('div');
    card.classList.add(bgColor, 'rounded-lg', 'shadow-lg', 'p-1', 'md:p-6','mb-1', 'md:mb-8', 'border', 'border-gray-200');
    card.dataset.assignmentId = assignedSurveyAsArray.assignment_id;
    card.innerHTML = `
    <div id='displayHead' class="text-center text-sm text-gray-500 mb-1 md:mb-4">Test display
    </div>
    `;    
    panel.appendChild(card);

//add the data into the card
renderHeader(panel);
renderQuestion(panel, nextQuestionId, currentStep, assignmentId);
renderInfo(panel);
}


function renderHeader(panel){
console.log('renderHeader()');
const card = panel.querySelector('#displayHead');
if(!card) return;

const isMyDash = detectMyDash(panel); // changed 10:20 March 14
    
const headerHTML =  renderSurveyHeader(assignedSurveyAsArray, isMyDash);

card.innerHTML += headerHTML  + 'renderHeader';

}

function renderQuestion(panel, nextQuestionId, currentStep=1, assignmentId){
console.log('renderQuestion()');
const card = panel.querySelector('#displayHead');
if(!card) return;
let currentQuestionId = nextQuestionId;

 if (!currentQuestionId && currentStep) {
       // console.log('assignedSurveyAsArray',assignedSurveyAsArray);
        currentQuestionId = findQuestionIdByStep(assignedSurveyAsArray, currentStep);
        console.log('📊 Mapped currentStep', currentStep, '→ question_id', currentQuestionId);
    }//current step undefined  18:57 Aug 23
    
    if (!currentQuestionId) {
        currentQuestionId = assignedSurveyAsArray[0]?.question_id;
        console.log('📊 Fallback to first question_id:', currentQuestionId);
    }


    const progress = getSurveyProgress(assignmentId, assignedSurveyAsArray, currentQuestionId); 
    // returns {currentQuestionId,nextQuestionId,isLastQuestion,totalQuestions,currentIndex[starts 0],questions};

    console.log('📊 renderLargeCards():', {
    currentQuestionId,  // Should be UUID like "q1"
    displayPosition: progress.currentIndex + 1,  // Should be 1, 2, 3...
    totalQuestions: progress.totalQuestions,  // Should be 5
    nextQuestionId: progress.nextQuestionId  // Should be UUID or null
});
    console.log('currentQuestionId',currentQuestionId, 'progress.totalQuestions',progress.totalQuestions, 'progress', progress);
    const isMyDash = detectMyDash(panel);
    const questionHTML = renderSurveyQuestion(assignedSurveyAsArray, assignedSurveyAsArray.assignment_id, currentQuestionId, isMyDash);
console.log('questionHTML',questionHTML);
    card.innerHTML+=questionHTML + 'renderQuestion';

    setTimeout(() => {
    document.querySelector('[data-fade-question]')?.classList.remove('opacity-0');
}, 500);

const displayHead = panel.querySelector('#displayHead');
if(!displayHead) return;
displayHead.innerHTML += `<div class="text-center text-sm text-gray-500 mb-1 md:mb-4">
Question ${progress.currentIndex + 1} of ${progress.totalQuestions}
               </div>`

attachListenersToRadioBUttons(card, assignmentId, progress);

               
}


function renderInfo(panel){
console.log('renderInfo()');
const card = panel.querySelector('#displayHead');
if(!card) return;

   const infoHTML =`<div class="bg-green-100 rounded border flex flex-col md:flex-row justify-center gap-4 pt-4 border-t border-gray-200">
        <p class="text-lg font-bold">Information:</p>
        <div id="informationSection" class="w-full">
        New question
            <!-- Information cards will be added here -->
        </div>
    </div>`;
card.innerHTML+=infoHTML;
}


function attachListenersToRadioBUttons(card, assignmentId, progress)

{
 const radioButtons = card.querySelectorAll('.survey-answer-radio');
    console.log('📻 Found radio buttons:', radioButtons.length);
    
    radioButtons.forEach(radio => {
        radio.addEventListener('click', (e) => {
            e.preventDefault();  // Prevent default radio toggle
            e.stopPropagation();
            
            if (isSubmitting) return; //ignore the clicks on the buttons if waiting for the database to reply
            
            const answerId = radio.value;
            const answerName = radio.dataset.answerName;
            const label = card.querySelector(`label[for="${radio.id}"]`);
            const span = label?.querySelector('span.font-medium');
            
            console.log('🖱️ Radio clicked:', { answerId, answerName });
            
            //where is this getting 'currenQuestion' ?
            // Call handleAnswerClick (two-click flow), NOT handleAnswerSubmit directly
            handleAnswerClick(assignmentId, span, answerId, answerName, radio, progress);
            //assignmentId,spanElement, answerId, answerName, radioElement, progress)
        });
    });

}*/



/*
function renderLargeCards(panel, questionId = null, currentStep = 1, assignmentId) {
    console.log('renderLargeCards() assignedSurveyAsArray', assignedSurveyAsArray); //changed from assignment
    isSubmitting = false; 

    panel.innerHTML = '';
    
console.log('arguments: questionId', questionId, 'currentStep',currentStep, 'assignmentId',assignmentId);
    // Resolve currentQuestionId with priority:
    // 1. Explicit questionId passed (from navigation)
    // 2. currentStep passed (from DB/card) → map to question_id
    // 3. Fallback to first question in survey
    let currentQuestionId = questionId;
    
    if (!currentQuestionId && currentStep) {
       // console.log('assignedSurveyAsArray',assignedSurveyAsArray);
        currentQuestionId = findQuestionIdByStep(assignedSurveyAsArray, currentStep);
        console.log('📊 Mapped currentStep', currentStep, '→ question_id', currentQuestionId);
    }//current step undefined  18:57 Aug 23
    
    if (!currentQuestionId) {
        currentQuestionId = assignedSurveyAsArray[0]?.question_id;
        console.log('📊 Fallback to first question_id:', currentQuestionId);
    }
    
    const progress = getSurveyProgress(assignmentId, assignedSurveyAsArray, currentQuestionId); 
    // returns {currentQuestionId,nextQuestionId,isLastQuestion,totalQuestions,currentIndex[starts 0],questions};

    console.log('📊 renderLargeCards():', {
    currentQuestionId,  // Should be UUID like "q1"
    displayPosition: progress.currentIndex + 1,  // Should be 1, 2, 3...
    totalQuestions: progress.totalQuestions,  // Should be 5
    nextQuestionId: progress.nextQuestionId  // Should be UUID or null
});
    console.log('currentQuestionId',currentQuestionId, 'progress.totalQuestions',progress.totalQuestions, 'progress', progress);
    
let bgColor='bg-orange-300'; 
if(assignmentRow.abandoned_at) bgColor = 'bg-red-400'; else if(assignmentRow.completed_at) bgColor = 'bg-green-400';  
      


    const card = document.createElement('div');
    card.classList.add(bgColor, 'rounded-lg', 'shadow-lg', 'p-1', 'md:p-6','mb-1', 'md:mb-8', 'border', 'border-gray-200');
    card.dataset.assignmentId = assignedSurveyAsArray.assignment_id;
    
    // Detect myDash context
    //const isMyDash = true; // Wrong. There is a function to detect this.  
    const isMyDash = detectMyDash(panel); // changed 10:20 March 14
    
    const headerHTML =  renderSurveyHeader(assignedSurveyAsArray, isMyDash);

    // Use renderSurveyQuestion (single-question mode)
    const questionHTML = renderSurveyQuestion(assignedSurveyAsArray, assignedSurveyAsArray.assignment_id, currentQuestionId, isMyDash);
    
    const infoHTML = getInfoFeedbackHTML(); //not sure why this fades with the question & why it reverts to 'New question'
//info should not be recreated each time the question changes.

    card.innerHTML = ` ${headerHTML}
        <div class="text-center text-sm text-gray-500 mb-1 md:mb-4">Question ${progress.currentIndex + 1} of ${progress.totalQuestions}
</div>
        ${questionHTML}
        ${infoHTML}
    `;
    
    panel.appendChild(card);

//added 15:55 Aug 24
    setTimeout(() => {
    document.querySelector('[data-fade-question]')?.classList.remove('opacity-0');
}, 10);

    // Attach CLICK listener (not change) for two-click confirmation
    // Loses some of the radio button effect, but change ignores a second click of the same item
    const radioButtons = card.querySelectorAll('.survey-answer-radio');
    console.log('📻 Found radio buttons:', radioButtons.length);
    
    radioButtons.forEach(radio => {
        radio.addEventListener('click', (e) => {
            e.preventDefault();  // Prevent default radio toggle
            e.stopPropagation();
            
            if (isSubmitting) return; //ignore the clicks on the buttons if waiting for the database to reply
            
            const answerId = radio.value;
            const answerName = radio.dataset.answerName;
            const label = document.querySelector(`label[for="${radio.id}"]`);
            const span = label?.querySelector('span.font-medium');
            
            console.log('🖱️ Radio clicked:', { answerId, answerName });
            
            //where is this getting 'currenQuestion' ?
            // Call handleAnswerClick (two-click flow), NOT handleAnswerSubmit directly
            handleAnswerClick(assignmentId, span, answerId, answerName, radio, progress);
        });
    });
} */

//creates a two clicks needed confirmation of the user's choice - standard method in the app. 
function handleAnswerClick(assignmentId,spanElement, answerId, answerName, radioElement, progress) {
    console.log('handleAnswerClick()');
    if (!spanElement) {
        console.error('❌ No span element found for radio', radioElement.id);
        return;
    }
    
    const currentText = spanElement.textContent;
    const confirmPrefix = "Click again to confirm: ";
    
    // Check if already clicked (text starts with a known prefix added by first click)
    if (currentText.startsWith(confirmPrefix)) {
        console.log('SECOND CLICK so -> Submitting');
        handleAnswerSubmit(assignmentId, answerId, answerName, radioElement, progress);
    } else {
        console.log('👆 FIRST CLICK - Ask for confirmation by a second click');
        
        // Reset previous selection if exists   What is this? Needs explanation
        if (pendingConfirmation) {
            pendingConfirmation.span.textContent = pendingConfirmation.originalText;
            const prevCard = pendingConfirmation.span.closest('.clickable-item');
            if (prevCard) {
                prevCard.classList.remove('ring-4', 'ring-blue-500', 'bg-blue-100');
                prevCard.classList.add('bg-blue-50', 'border-l-4', 'border-blue-400');
            }
        }
        
        // Save current state
        pendingConfirmation = {
            span: spanElement,
            originalText: currentText,
            answerId: answerId,
            answerName: answerName,
            radio: radioElement
        };
        
        // ✅ Prepend confirmation words directly to DOM
        spanElement.textContent = confirmPrefix + currentText;
        
        // Highlight with your standard style
        const card = spanElement.closest('.clickable-item');
        if (card) {
            card.classList.remove('bg-blue-50', 'border-l-4', 'border-blue-400');
            card.classList.add('ring-4', 'ring-blue-500', 'bg-blue-100');
        }
        
        // Update info section (optional)
        const infoSection = document.getElementById('informationSection');
        if (infoSection) {
            infoSection.innerHTML += `
                <div class="text-sm text-gray-600">
                    <p>Selected: <span class="font-medium text-blue-700">${answerName} on Question:${progress.currentIndex+1}</span></p>
                    <p class="text-xs text-gray-500">Click the same answer again to confirm</p>
                </div>
            `;
        }
    }
}


async function handleAutomations(automations, answerName){
    console.log('handleAutomations');
        const infoSection = document.getElementById('informationSection');
console.log('autorPetition.assignmen_id',autoPetition.assignment_id);
/* moved to line 124 and made global
const assignmentRow = await executeIfPermitted(subject.id, 'readThisSurveyOrTaskAssignment',{ assignment_id: autoPetition.assignment_id }
);
*/
// Determine survey state
let endedOrActive;
if (assignmentRow.completed_at) { endedOrActive = 'completed';
} else if (assignmentRow.abandoned_at) { endedOrActive = 'abandoned';
} else { endedOrActive = 'active';
}
console.log('assignmentRow',assignmentRow,'endOrActive',endedOrActive);
if(endedOrActive==='active'){


        if (infoSection) {
        infoSection.innerHTML += `
            <div class="text-center py-4">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p class="mt-2 text-sm text-gray-600">Processing: <span class="font-medium text-blue-700">${escapeHtml(answerName)}</span>...</p>
            </div>
        `;
    }

    try {console.log('calling executeAutomations()');
        // const assignmentRow =  await executeIfPermitted(subject.id,readThisAssignment){assignmentId:autoPetition.assignment_id}
        // const active = (!assignmentRow.completed_at && !assignmentRw.abandoned_at)
        //if(assignmentRow.completed_at) endedOrActive ='completed'; else if(assignmentRw.abandoned_at) endedOrActive='abandoned' else endedOrActive ='active' 
        //if(endedOrActive === 'active') 
        const autoResponse = await executeAutomations(automations, subject, autoPetition);
        console.log('autoResponse:', autoResponse);
        
        // Show automation results (with names + messages)
        displayAutoResults(autoResponse, automations);
        
      
        
    } catch (error) {
        console.error('Failed to run automations:', error);
        if (infoSection) {
            infoSection.innerHTML += `<p class="text-red-600">Error: ${error.message}</p>`;
        }
        showToast('Failed to record answer', 'error');
        isSubmitting = false;
        
        // Reset text on error
        if (pendingConfirmation?.span) {
            pendingConfirmation.span.textContent = pendingConfirmation.originalText;
        }
    }
}else showToast(`This survey is ${endedOrActive}. Automations will not run.`,'warning',4000);
//show info - no automation. Survey is inactive because it is ${endedOrActive}. 

}

function moveToNextQuestion(assignmentId,progress) {
    console.log('moveToNextQuestion()');
      //  BRANCH: Next question vs. Complete  currentIndex counts from 0, but total questions starts at 1

  //what should we do? increment the currentQuestion number for display.
  //at some point write to db the assignment currentStep??   I don't understand the following code.
console.log('currentIndex', progress.currentIndex, 'of total', progress.totalQuestions );
//const bookmark = progress.currentIndex +1; 
        if (progress.currentIndex +1 < progress.totalQuestions) {
           // const nextQuestionNumber = progress.questions.find(q => q.id === progress.nextQuestionId)?.number;
            // Update DB: increment current_question
           // await updateAssignmentProgress(autoPetition.assignment_id, nextQuestionNumber); //doesn't exist ?
            
            // Re-render with next question after delay
            setTimeout(() => {
//                isSubmitting = false; //could be done here or inside renderLargeCards. It is done on line 100
              //  renderLargeCards(panelEl, progress.nextQuestionId, assignmentId);  
                //oddly this renders the header each time the question changes and it creates a new info section
                //there should be separate processes. 
                
                //experiment 18:50 Aug 25
renderQuestion(panelEl, progress.nextQuestionId, null, assignmentId)


                
                // renderLarge takes the passed param as the new value of currentQuestion  but that is a local. Does it get back here as updated locally?
            }, 10); //this was 10 seconds. Why is there any timeout? There should be a visible transition so the user knows that the question has changed
        } else {
            // Update DB: mark completed

//////////////////////////////////////////////////////////// <----------------------------  FIX THIS  
 //  commented out 19:47 Aug 23 2026 for test of rest.         await markAssignmentComplete(autoPetition.assignment_id);
          
          
            // Show completion message (appends to information section)
        //    setTimeout(() => {
                markAssignmentComplete(autoPetition.assignment_id);
                showCompletionMessage(); 
           // }, 1500);
        }
}

// handleAnswerSubmit with multi-question branching
async function handleAnswerSubmit(assignmentId, answerId, answerName, radioElement, progress) {
    console.log('handleAnswerSubmit for answer', answerId, 'question','answerName',answerName, progress.currentIndex,'assignmentId',assignmentId);
    isSubmitting = true; // when isSubmitting the radio buttons are ignored
    
    // Show loading state in information section - this runs with spinner and doesn't stop -14:55 Aug  It needs to stop.

    
    autoPetition.survey_answer_id = answerId;
    
    let automations = [];
    try {
        automations = await executeIfPermitted(subject.id, 'readSurveyAutomations', {
            answer_id: answerId
        });
        console.log('🤖 Number of Automations loaded :', automations.length);
    } catch (error) {
        console.error('Failed to load automations:', error);
    }
    if (automations.length > 0) //added 14:53 Aug 24. Only do automations if there is at least 1
await handleAutomations(automations, answerName);

moveToNextQuestion(assignmentId, progress);


}


function displayAutoResults(autoResponse, automations) {
    console.log('displayAutoResults');
    const infoSection = document.getElementById('informationSection');
    if (!infoSection) return;
    
    const responses = Array.isArray(autoResponse) ? autoResponse : [autoResponse].filter(Boolean);
    
    const messages = (automations || []).map((auto, index) => {
        const response = responses?.[index];
        const autoName = auto?.name || 'Automation';
        const autoType = auto?.target_data?.target?.type || 'unknown';
        const message = response?.data?.message || response?.message || 'Completed';
        const status = response?.data?.status || response?.status || 'unknown';
        const isSkipped = status === 'ignored' || message.includes('already exists') || message.includes('skipped');
        
        // Type-specific actionDescription
        let actionDescription = '';
        if (autoType === 'task') {
            actionDescription = `Your assignment to the task <span class="font-medium text-blue-700">${escapeHtml(autoName)}</span>`;
        } else if (autoType === 'survey') {
            actionDescription = `Your assignment to the survey <span class="font-medium text-blue-700">${escapeHtml(autoName)}</span>`;
        } else if (autoType === 'relate') {
            actionDescription = `Your relation with <span class="font-medium text-blue-700">${escapeHtml(autoName)}</span>`;
        } else {
            actionDescription = `<span class="font-medium text-blue-700">${escapeHtml(autoName)}</span>`;
        }
        
        let statusMessage = '';
        if (isSkipped) {
            statusMessage = `<span class="text-xs text-gray-400">(No change made)</span>`;
        } else if (status === 'error') {
            statusMessage = `<span class="text-xs text-red-400">(Failed)</span>`;
        } else {
            statusMessage = `<span class="text-xs text-green-400">(Completed)</span>`;
        }
        
        return {
            actionDescription: actionDescription,
            message: message,
            statusMessage: statusMessage
        };
    }).filter(m => m.message);
    
    if (messages.length > 0) {
        infoSection.innerHTML += `
            <div class="text-green-700">
                <p class="text-sm text-gray-700 mb-1 md:mb-3">
                    The answer you chose automatically runs some tasks in response to your choice. 
                    This is to enable automatic processing of the answer. Often the automations will 
                    assign you to a task, or to receive a survey, or to join a group or relate you 
                    to some other person or activity, or send a message or other actions.
                </p>
                <p class="font-bold mb-1 md:mb-2">Automation Results:</p>
                <p class="text-sm mb-1 md:mb-2">${messages.length} action(s):</p>
                <ul class="list-disc list-inside text-gray-600 space-y-1">
                    ${messages.map(item => `
                        <li class="text-sm">
                            ${item.actionDescription}: ${escapeHtml(item.message)} ${item.statusMessage}
                        </li>
                    `.trim()).join('')}
                </ul>
            </div>
        `;
    } else {
        infoSection.innerHTML += `
            <div class="text-green-700">
                <p class="text-sm text-gray-700 mb-1 md:mb-3">
                    The answer you chose automatically runs some tasks in response to your choice. (This message will self-destruct and display the next question)
                </p>
                <p class="font-bold">No automations were triggered.</p>
            </div>
        `;
    }
}


function showCompletionMessage() {
    console.log('showCompletionMessage()');
    
   // 1. Find the question container globally (assuming only one active survey on screen)
    const questionContainer = document.querySelector('#survey-question-container');
    if (!questionContainer) {
        console.warn('Could not find #survey-question-container');
        return;
    }

    
    // 2. Create the completion card with fade-in classes
    const completionCard = document.createElement('div');
    completionCard.className = 'bg-green-50 border-l-4 border-green-500 rounded-lg p-4 md:p-6 mt-4 opacity-0 transition-opacity duration-500';
    completionCard.innerHTML = `
        <div class="flex items-start">
            <div class="text-3xl mr-4">🎉</div>
            <div class="flex-1">
                <h3 class="text-xl font-bold text-gray-800">Survey Complete!</h3>
                <p class="text-gray-600 mt-2">Thank you for your response. There are no more questions.</p>
                <p class="text-sm text-gray-500 mt-3">You can click the button to close the survey. The survey will close itself after a while.</p>
                <button id="closeSurveyBtn" class="mt-4 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors">
                    Close Survey
                </button>
            </div>
        </div>
    `;
    
    // 3. Replace the question container's content entirely
    questionContainer.innerHTML = ''; 
    questionContainer.appendChild(completionCard);
    
    // 4. Trigger the fade-in effect
    setTimeout(() => {
        completionCard.classList.remove('opacity-0');
    }, 50);

    /*
const card = document.querySelector('#survey-header-container');
    if (!card) {
        console.warn('Could not find #survey-header-container');
        return;
    }
*/
    // 5. Add close button handler (using 'card' to clear the view)
    const closeBtn = document.getElementById('closeSurveyBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            // Clear the entire card in stages
     closeSurveyStaggered(); 
        });
    }
    
   
    const containers = [
    '#survey-header-container',
    '#survey-progress-container',
    '#survey-info-container',
    '#survey-question-container'
    
];

function closeSurveyStaggered() {
    containers.forEach((selector, index) => {
        const el = document.querySelector(selector);
        if (!el) return;

        setTimeout(() => {
            el.innerHTML = '';     // or el.remove();
        }, index * 1500);           // 150ms stagger
    });

    // 5a Remove the outer card after all children are gone
    setTimeout(() => {
        const outerCard = document.querySelector('#survey-header-container').parentElement;
        if (outerCard) outerCard.remove();
    }, containers.length * 1500 + 300);

}

    // 6. Optional: Auto-clear after 30 seconds if user doesn't click
    setTimeout(() => {
        const outerCard = document.querySelector('#survey-header-container').parentElement;
            if (outerCard) outerCard.remove();
        
    }, 30000);
    
    // 7. Scroll to the completion message smoothly
    completionCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
}


/*
// (appends to information section)
function showCompletionMessage() {
    console.log('showCompletionMessage()');
    const infoSection = document.getElementById('informationSection');
    if (!infoSection) return;
    
    const completionCard = document.createElement('div');
    completionCard.className = 'bg-green-50 border-l-4 border-green-500 rounded-lg p-1 md:p-4 mt-4';
    completionCard.innerHTML = `
        <div class="flex items-start">
            <div class="text-2xl mr-3">🎉</div>
            <div>
                <h3 class="text-lg font-bold text-gray-800">Survey Complete!</h3>
                <p class="text-gray-600 text-sm mt-1">Thank you for your response. There are no more questions.</p>
                <p class="text-xs text-gray-500 mt-2">You can close this window or return to your dashboard.</p>
                <button id="closeSurveyBtn" class="mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
                    Close
                </button>
            </div>
        </div>
    `;
    
    //  Append to existing information (doesn't wipe automation results)
    infoSection.appendChild(completionCard);
    
    //  Add close button handler
    const closeBtn = document.getElementById('closeSurveyBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            panelEl.innerHTML = ''; // Clear the panel
        });
    }
    
    //  Optional: Auto-clear after 30 seconds if user doesn't click
    setTimeout(() => {
        if (panelEl.querySelector('[data-assignment]')) {
            panelEl.innerHTML = '';
        }
    }, 30000);
    
    //  Scroll to bottom so user sees the completion message
    completionCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
} */




//  Helper: Update assignments table (increment current_question)
//if set p_bookmark as 1 or 2  may produce 'abandoned' or 'completed'
async function XupdateAssignmentProgress(assignmentId, nextQuestion) {
    console.log('updateAssignmentProgress()'); // return;
    try { // const {assignmentId, completed, step} = payload;

        //FAILS FOR SURVEYS

        await executeIfPermitted(subject.approUserId, 'updateAssignmentSystem', {
            assignmentId: assignmentId,
            p_bookmark: nextQuestion
        });

    
        console.log('✅ Assignment progress updated to question', nextQuestion);
    } catch (error) {
        console.error('Failed to update assignment progress:', error);
    }
}

//  Helper: Mark assignment as completed
async function markAssignmentComplete(assignmentId) {  //not coded this db function 21:00 March 13
   console.log('markAssignmentComplete()'); //this calls the bookmark function. Mark as complete by bookmark=2
   console.log('assignmentId',assignmentId);
    try {// registry needs const {assignmentId, p_bookmark} = payload;
      await executeIfPermitted(subject.approUserId, 'updateAssignmentSystem', {
            assignmentId: assignmentId,
            bookmark: 2,
        });
        console.log('✅ Assignment marked complete');
        showToast('✅ Assignment marked complete', 'info', 5000);
    } catch (error) {
        console.error('Failed to mark assignment complete:', error);
                showToast('Assignment database failed to complete', 10000);
    }
}

//  Helper: HTML escaping
function escapeHtml(text) {
    if (typeof text !== 'string') return String(text);
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}