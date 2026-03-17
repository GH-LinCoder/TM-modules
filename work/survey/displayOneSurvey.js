// ./work/survey/displayOneSurvey.js
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { appState } from '../../state/appState.js';
import { detectMyDash, resolveSubject } from '../../utils/contextSubjectHideModules.js';
import { executeAutomations } from '../../utils/executeAutomations.js';
import { renderSurveyQuestion } from '../../utils/surveySummaryRenderer.js';
import { icons } from '../../registry/iconList.js';

console.log('displayOneSurvey.js loaded');

let subject = null;
let assignment = null;
let panelEl = null;
let answersArray = []; 
const autoPetition = {
    auth_id: '',
    appro_id: '',
    task_id: '',
    step_id: '',
    survey_id: null,
    survey_answer_id: null,
    assignment_id: '',
    automation_id: ''
};

// ✅ Track pending confirmation (for two-click flow)
let pendingConfirmation = null;
let isSubmitting = false;


function getSurveyProgress(assignment, currentQuestionId) {
    // Get unique questions by question_id, sorted by question_number
    const questionsById = new Map();
    for (const row of assignment) {
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
    
    const currentIndex = questions.findIndex(q => q.id === currentQuestionId);
    const nextQuestionId = questions[currentIndex + 1]?.id || null;
    const isLastQuestion = nextQuestionId === null;
    const totalQuestions = questions.length;
    
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
    
// card sends  renderOneSurvey(detailPanel, {assignmentId: assignmentId,entityType: 'survey',surveyId:surveyId,currentStep:currentStep

    const { assignmentId, entityType, surveyId, student, currentStep } = query;

console.log('currentStep',currentStep); //correct 22:23 March 14

    subject = await resolveSubject();
    
    autoPetition.auth_id = subject.id;
    autoPetition.appro_id = subject.approUserId;
    autoPetition.assignment_id = assignmentId;
    
    try { //the registry func needs:  const { survey_id } = payload;
        const surveyData = await executeIfPermitted(subject.approUserId, 'readSurveyView', {
            survey_id: surveyId
        });
        
        if (!surveyData || surveyData.length === 0) {
            panel.innerHTML = `<div class="text-gray-500 text-center py-8">No survey assignment found for: ${subject.name} - ${assignmentId}.</div>`;
            return;
        }
        
        assignment = surveyData;
        autoPetition.survey_id = surveyId;
        renderLargeCards(panel,null,currentStep);
        
    } catch (error) {
        console.error('Error loading survey assignment:', error);
        panel.innerHTML = `<div class="text-red-500 text-center py-8">Failed to load survey assignment for: ${subject.name} - ${assignmentId}.</div>`;
        showToast(`No survey assignments found for: ${subject.name}`, 'error');
    }
}

// ✅ Helper: Find question_id by step number (question_number)
function findQuestionIdByStep(surveyRows, stepPosition) {
    if (!stepPosition || stepPosition < 1) return null;
    
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
    
    return questions[index].id;
}

function renderLargeCards(panel, questionId = null, currentStep = 1) {
    console.log('renderLargeCards() assignment', assignment);
    isSubmitting = false; 

    panel.innerHTML = '';
    
console.log('questionId', questionId, 'currentStep',currentStep);
    // ✅ Resolve currentQuestionId with priority:
    // 1. Explicit questionId passed (from navigation)
    // 2. currentStep passed (from DB/card) → map to question_id
    // 3. Fallback to first question in survey
    let currentQuestionId = questionId;
    
    if (!currentQuestionId && currentStep) {
        currentQuestionId = findQuestionIdByStep(assignment, currentStep);
        console.log('📊 Mapped currentStep', currentStep, '→ question_id', currentQuestionId);
    }
    
    if (!currentQuestionId) {
        currentQuestionId = assignment[0]?.question_id;
        console.log('📊 Fallback to first question_id:', currentQuestionId);
    }
    
    const progress = getSurveyProgress(assignment, currentQuestionId);

    console.log('📊 renderLargeCards:', {
    currentQuestionId,  // Should be UUID like "q1"
    displayPosition: progress.currentIndex + 1,  // Should be 1, 2, 3...
    totalQuestions: progress.totalQuestions,  // Should be 5
    nextQuestionId: progress.nextQuestionId  // Should be UUID or null
});
    console.log('currentQuestionId',currentQuestionId, 'progress.totalQuestions',progress.totalQuestions, 'progress', progress);
    
    const card = document.createElement('div');
    card.classList.add('bg-white', 'rounded-lg', 'shadow-lg', 'p-6', 'mb-8', 'border', 'border-gray-200');
    card.dataset.assignmentId = assignment.assignment_id;
    
    // Detect myDash context
    //const isMyDash = true; // Wrong. There is a function to detect this.  
    const isMyDash = detectMyDash(panel); // changed 10:20 March 14
    
    // Use renderSurveyQuestion (single-question mode)
    const questionHTML = renderSurveyQuestion(assignment, assignment.assignment_id, currentQuestionId, isMyDash);
    
    card.innerHTML = `
        <div class="text-center text-sm text-gray-500 mb-4">
         <!--  Question ${progress.currentIndex} of ${progress.totalQuestions} -->
Question ${progress.currentIndex + 1} of ${progress.totalQuestions}
</div>
        ${questionHTML}
    `;
    
    panel.appendChild(card);
    
    // Attach CLICK listener (not change) for two-click confirmation
    // Loses some of the radio button effect, but change ignores a second click of the same item
    const radioButtons = card.querySelectorAll('.survey-answer-radio');
    console.log('📻 Found radio buttons:', radioButtons.length);
    
    radioButtons.forEach(radio => {
        radio.addEventListener('click', (e) => {
            e.preventDefault();  // ✅ Prevent default radio toggle
            e.stopPropagation();
            
            if (isSubmitting) return; //ignore the clicks on the buttons if waiting for the database to reply
            
            const answerId = radio.value;
            const answerName = radio.dataset.answerName;
            const label = document.querySelector(`label[for="${radio.id}"]`);
            const span = label?.querySelector('span.font-medium');
            
            console.log('🖱️ Radio clicked:', { answerId, answerName });
            
            //where is this getting 'currenQuestion' ?
            // Call handleAnswerClick (two-click flow), NOT handleAnswerSubmit directly
            handleAnswerClick(span, answerId, answerName, radio, progress);
        });
    });
}

//creates a two clicks needed confirmation of the user's choice - standard method in the app. 
function handleAnswerClick(spanElement, answerId, answerName, radioElement, progress) {
    if (!spanElement) {
        console.error('❌ No span element found for radio', radioElement.id);
        return;
    }
    
    const currentText = spanElement.textContent;
    const confirmPrefix = "Click again to confirm: ";
    
    // Check if already clicked (text starts with a known prefix added by first click)
    if (currentText.startsWith(confirmPrefix)) {
        console.log('SECOND CLICK so -> Submitting');
        handleAnswerSubmit(answerId, answerName, radioElement, progress);
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
            infoSection.innerHTML = `
                <div class="text-sm text-gray-600">
                    <p>Selected: <span class="font-medium text-blue-700">${answerName}</span></p>
                    <p class="text-xs text-gray-500">Click the same answer again to confirm</p>
                </div>
            `;
        }
    }
}

// handleAnswerSubmit with multi-question branching
async function handleAnswerSubmit(answerId, answerName, radioElement, progress) {
    console.log('handleAnswerSubmit for answer', answerId, 'question', progress.currentIndex);
    isSubmitting = true; // when isSubmitting the radio buttons are ignored
    
    // Show loading state in information section
    const infoSection = document.getElementById('informationSection');
    if (infoSection) {
        infoSection.innerHTML = `
            <div class="text-center py-4">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p class="mt-2 text-sm text-gray-600">Processing: <span class="font-medium text-blue-700">${escapeHtml(answerName)}</span>...</p>
            </div>
        `;
    }
    
    autoPetition.survey_answer_id = answerId;
    
    let automations = [];
    try {
        automations = await executeIfPermitted(subject.id, 'readSurveyAutomations', {
            answer_id: answerId
        });
        console.log('🤖 Automations to run:', automations.length);
    } catch (error) {
        console.error('Failed to load automations:', error);
    }
    
    try {
        const autoCompleted = await executeAutomations(automations, subject, autoPetition);
        console.log('✅ autoCompleted:', autoCompleted);
        
        // ✅ Show automation results (with names + messages)
        displayAutoResults(autoCompleted, automations);
        
        // ✅ BRANCH: Next question vs. Complete  currentIndex counts from 0, but total questions starts at 1
console.log('currentIndex', progress.currentIndex, 'of total', progress.totalQuestions );

        if (progress.currentIndex +1 < progress.totalQuestions) {
            const nextQuestionNumber = progress.questions.find(q => q.id === progress.nextQuestionId)?.number;
            // Update DB: increment current_question
            await updateAssignmentProgress(autoPetition.assignment_id, nextQuestionNumber);
            
            // Re-render with next question after delay
            setTimeout(() => {
//                isSubmitting = false; //could be done here or inside renderLargeCards. It is done on line 100
                renderLargeCards(panelEl, progress.nextQuestionId);  // renderLarge takes the passed param as the new value of currentQuestion  but that is a local. Does it get back here as updated locally?
            }, 10000);
        } else {
            // Update DB: mark completed
          await markAssignmentComplete(autoPetition.assignment_id);
          // the function to do this has not yet been coded 21:00 March 13 - doing 21:30 March 14
          
          
            // Show completion message (appends to information section)
            setTimeout(() => {
                showCompletionMessage();
            }, 1500);
        }
        
    } catch (error) {
        console.error('Failed to run automations:', error);
        if (infoSection) {
            infoSection.innerHTML = `<p class="text-red-600">Error: ${error.message}</p>`;
        }
        showToast('Failed to record answer', 'error');
        isSubmitting = false;
        
        // Reset text on error
        if (pendingConfirmation?.span) {
            pendingConfirmation.span.textContent = pendingConfirmation.originalText;
        }
    }
}

// ✅ FIX 7: displayAutoResults (from our working version)
function displayAutoResults(autoResponse, automations) {
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
        
        // Type-specific description
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
        infoSection.innerHTML = `
            <div class="text-green-700">
                <p class="text-sm text-gray-700 mb-3">
                    The answer you chose automatically runs some tasks in response to your choice. 
                    This is to enable automatic processing of the answer. Often the automations will 
                    assign you to a task, or to receive a survey, or to join a group or relate you 
                    to some other person or activity, or send a message or other actions.
                </p>
                <p class="font-bold mb-2">Automation Results:</p>
                <p class="text-sm mb-2">${messages.length} action(s):</p>
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
        infoSection.innerHTML = `
            <div class="text-green-700">
                <p class="text-sm text-gray-700 mb-3">
                    The answer you chose automatically runs some tasks in response to your choice. (This message will self-destruct and display the next question)
                </p>
                <p class="font-bold">No automations were triggered.</p>
            </div>
        `;
    }
}

// ✅ FIX 8: showCompletionMessage (appends to information section)
function showCompletionMessage() {
    const infoSection = document.getElementById('informationSection');
    if (!infoSection) return;
    
    const completionCard = document.createElement('div');
    completionCard.className = 'bg-green-50 border-l-4 border-green-500 rounded-lg p-4 mt-4';
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
    
    // ✅ Append to existing information (doesn't wipe automation results)
    infoSection.appendChild(completionCard);
    
    // ✅ Add close button handler
    const closeBtn = document.getElementById('closeSurveyBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            panelEl.innerHTML = ''; // Clear the panel
        });
    }
    
    // ✅ Optional: Auto-clear after 30 seconds if user doesn't click
    setTimeout(() => {
        if (panelEl.querySelector('[data-assignment]')) {
            panelEl.innerHTML = '';
        }
    }, 30000);
    
    // ✅ Scroll to bottom so user sees the completion message
    completionCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}




// ✅ Helper: Update assignments table (increment current_question)
async function updateAssignmentProgress(assignmentId, nextQuestion) {
    console.log('updateAssignmentProgress()'); // return;
    try { // const {assignmentId, completed, step} = payload;
        await executeIfPermitted(subject.approUserId, 'updateAssignmentSystem', {
            assignmentId: assignmentId,
            step: nextQuestion
        });
        console.log('✅ Assignment progress updated to question', nextQuestion);
    } catch (error) {
        console.error('Failed to update assignment progress:', error);
    }
}

// ✅ Helper: Mark assignment as completed
async function markAssignmentComplete(assignmentId) {  //not yet coded this db function 21:00 March 13
    try {// registry needs const {assignmentId, completed, step} = payload;
      await executeIfPermitted(subject.approUserId, 'updateAssignmentSystem', {
            assignmentId: assignmentId,
            completed: true,
            step:null
        });
        console.log('✅ Assignment marked complete');
    } catch (error) {
        console.error('Failed to mark assignment complete:', error);
    }
}

// ✅ Helper: HTML escaping
function escapeHtml(text) {
    if (typeof text !== 'string') return String(text);
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}