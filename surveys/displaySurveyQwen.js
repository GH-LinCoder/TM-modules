import { appState } from '../state/appState.js';
import { executeIfPermitted } from '../registry/executeIfPermitted.js';
import { showToast } from '../ui/showToast.js';
import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';
import { icons } from '../registry/iconList.js'; 

// Export function as required by the module loading system
export function render(panel, query = {}) {
    const display = new SurveyDisplay();
    display.render(panel, query);
    
}

const userId = appState.query.userId;

class SurveyDisplay {
    constructor() {
        this.surveyId = 'efc9f836-504f-44e7-95be-cda9107f9fea';
        this.surveyData = null;
        this.currentQuestionIndex = 0;
    }

    async render(panel, query = {}) {
        console.log('SurveyDisplay.render(', panel, query, ')');
        
        if (!this.surveyId) {
            showToast('Survey ID is required', 'error');
            return;
        }
        

        try {
            // Load sorted survey data
            const surveyData = await executeIfPermitted(userId, 'readSurveyView', { survey_id: this.surveyId });
            
            if (!surveyData || surveyData.length === 0) {
                showToast('Survey not found', 'error');
                return;
            }
            
            this.surveyData = surveyData;
            
            // Display the header information
            panel.innerHTML = this.getHeaderHTML(surveyData[0]);
            
            // Attach event listener to the start button
            setTimeout(() => {
                const startBtn = document.getElementById('startSurveyBtn');
                if (startBtn) {
                    startBtn.addEventListener('click', () => {
                        this.showQuestion(panel);
                    });
                }
            }, 100);
            
        } catch (error) {
            showToast('Failed to load survey: ' + error.message, 'error');
            console.error('Survey display error:', error);
        }
      //  panel.innerHTML+=petitionBreadcrumbs();//this reads 'petition' and prints the values at bottom of the render panel
    }

    getHeaderHTML(surveyInfo) {
        return `
            <div id="surveyDisplay" class="survey-display relative z-10 flex flex-col h-full" data-module='survey-display'>

                <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 z-10 max-h-[90vh] overflow-y-auto">

                    <!--  INSTRUCTIONS   -->                           
                    <div class="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                       <h4 class="text-ml font-bold text-blue-500 mb-4">Surveys</h4>
                       <ul class="list-disc list-inside mt-2 text-sm text-blue-500">
                        <li> One of our mottoes is: "Have your say, do your bit."</li>
                        <li> We use surveys as a key part of both those things.</li>
                        <li> Some of the answers you give can start you on a journey into the organisation</li>
                        <li> Your responses create a greater understanding of your aims. </li>
                        <li>The author of the survey may have attached what we call 'automations' to some of the answers so that the computer can recommend tasks or groups to join or training that is available or they may generate invitations to events</li>
                       </ul>  
                    </div>

                     <!-- NAME of SURVEY -->    
                     <div class="p-6 border-b border-gray-200 justify-center items-center text-center">
                        <h2 class="text-xl font-semibold text-gray-900">${surveyInfo.survey_name || 'Survey'}</h2>
                     </div>

                    <!--   CONTAINER for DESCRPTION & BUTTON -->
                    <div class="bg-gray-200 p-6 space-y-6">

                     <div class="space-y-4"> <!-- spacer container for the following two items? -->

                            <!-- DESCRIPTION of SURVEY -->
                            <div class="bg-white p-4 rounded-lg border border-gray-300">
                                <p class="text-gray-700 ">${surveyInfo.survey_description || 'No description provided'}</p>
                                <p class="text-xs text-gray-500 mt-2">
                                    Created: ${new Date(surveyInfo.survey_created_at).toLocaleDateString()} | 
                                    Author: ${surveyInfo.author_id || 'Unknown'}</p>
                            </div>

                             <!--   CONTAINER for BUTTON -->
                            <div id="startSurveySection" class="bg-green-100 p-4 rounded-lg border border-green-300  justify-center items-center text-center">
                                <p class="text-green-800 font-medium">Survey ready to begin</p>
                                <p class="text-green-700 text-sm mt-1">
                                    Click the button below to start the survey.
                                </p>
                                <!--    BUTTON    -->
                                <button id="startSurveyBtn" class="mt-3 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                                    Consent & Continue
                                </button>
                            </div>
                     </div>
                    </div>
                    <!-- QUESTION & ANSWERS CONTAINER  q&a -->
                    <div id='question-answer-container'  class="bg-white p-4 rounded-lg border border-gray-300" data-section = 'questions-answers-section'></div>

                </div>
            </div>
               ${petitionBreadcrumbs()} ;
        `;
    }

    showQuestion(panel) {
console.log('showQuestion()'); // this logs
        if (!this.surveyData) {
            showToast('No survey data available', 'error');
            return;
        }
    
        // Hide the start survey section
        const startSurveySection = document.getElementById('startSurveySection');
        if (startSurveySection) {
            startSurveySection.style.display = 'none';
        }
    
        const questionAnswerContainer = document.getElementById('question-answer-container'); 
        if(!questionAnswerContainer){console.log('questionAnswerContainer not found'); return;}
        
    
        // Find the unique questions in the data
        const uniqueQuestions = [...new Set(this.surveyData.map(row => row.question_number))];
        if (this.currentQuestionIndex >= uniqueQuestions.length) {
            // Survey completed
            questionAnswerContainer.innerHTML = this.getCompletionHTML();
            return;
        }
    
        const currentQuestionNumber = uniqueQuestions[this.currentQuestionIndex];
        const questionRows = this.surveyData.filter(row => row.question_number === currentQuestionNumber);
        
        if (questionRows.length === 0) {
            showToast('No data for this question', 'error');
            return;
        }
    
        const progress = `${this.currentQuestionIndex + 1} of ${uniqueQuestions.length}`;
    
        // Replace the content instead of appending
        questionAnswerContainer.innerHTML = this.getQuestionHTML(questionRows, progress);
        
        // Add animation delay for question and answers
        setTimeout(() => {
            // Focus on the question section
            questionAnswerContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Add animation classes to answers
            const answerElements = questionAnswerContainer.querySelectorAll('.flex.items-start');
            answerElements.forEach((element, index) => {
                setTimeout(() => {
                    element.style.opacity = '0';
                    element.style.transform = 'translateY(10px)';
                    element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    
                    setTimeout(() => {
                        element.style.opacity = '1';
                        element.style.transform = 'translateY(0)';
                    }, 400); // Small delay to trigger the transition, they all apear at same time
                }, index * 500); // then each answer bounces one after another 
            });
            
            // Add radio button listeners AFTER the elements are rendered
            const radioButtons = questionAnswerContainer.querySelectorAll('input[name="question_answer"]');
console.log('Found radio buttons:', radioButtons.length); // LOGS
            radioButtons.forEach(radio => {
                radio.addEventListener('change', (e) => {
console.log('Radio button changed:', e.target.value); // LOGS on change
                    // Find the associated answer element to get its automations
                    const answerElement = e.target.closest('.flex.items-start');
console.log('Answer element:', answerElement); // LOGS
                    const automations = JSON.parse(answerElement.dataset.automations || '[]');
                    
                    if (automations.length > 0) {
                        // Determine the appropriate action based on automations
                        let action = 'auto-execute-all'; // or specific action based on first automation type
                        if (automations[0].type === 'task') {
                            action = 'auto-assign-task';
                        } else if (automations[0].type === 'relationship') {
                            action = 'auto-relate-appro';
                        }
console.log('showQuestion() automations:', automations);   // LOGS  22:22 Oct 8  (had been a missing 's' in name)
                        // Update the save button with the appropriate action and destination
                        const nextBtn = document.getElementById('nextQuestionBtn');
                        if (nextBtn) {
                            nextBtn.setAttribute('data-action', action);
                            nextBtn.setAttribute('data-destination', 'background');
                            
                            // Build the payload
                            const payload = {
                                source: {
                                    userId: userId, // from appState
                                    surveyId: this.surveyId,
                                    questionId: questionRows[0].question_id, // get question id from first row
                                    answerId: e.target.value
                                },
                                automations: automations
                            };
                            
                            // Store in appState
                            appState.payload = payload;
console.log('Automation payload set:', appState.payload); // LOGS  22:22 Oct 8  (had been a missing 's' in name)
                        }
                    }
                });
            });
        }, 400);
    
        // Attach event listener to the next button
        setTimeout(() => {
            const nextBtn = document.getElementById('nextQuestionBtn');
            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    // Check if an answer was selected
                    const selectedAnswer = document.querySelector('input[name="question_answer"]:checked');
                    if (!selectedAnswer) {
                        showToast('Please select an answer', 'error');
                        return;
                    }
                    
                    // For now, just move to next question - actual saving will be added later
                    this.currentQuestionIndex++;
                    this.showQuestion(panel);
                });
            }
        }, 100);
    }

    getQuestionHTML(questionRows, progress) {
        const firstRow = questionRows[0]; // Get question info from first row
        
        let answersHTML = '';
        let i = 0;
        
        // Process each answer and its automations
        while (i < questionRows.length) {
            const currentRow = questionRows[i];
            
            // Start building the answer HTML
            let automationIcons = '';
            let automationData = []; // Store automation data for this answer
            
            // Look for all automations for this answer (same answer_id)
            let j = i;
            while (j < questionRows.length && questionRows[j].answer_id === currentRow.answer_id) {
                const row = questionRows[j];
                // Add icon if this row has an automation
                if (row.relationship) {
                    automationIcons += icons.relationships || '🪪';
                    // Store relationship automation data
                    automationData.push({
                        type: 'relationship',
                        relationship: row.relationship,
                        ofApprofile: row.automation_id
                    });
                } else if (row.task_header_id) {
                    automationIcons += icons.task || '🔧';
                    // Store task automation data
                    automationData.push({
                        type: 'task',
                        taskId: row.task_header_id
                    });
                }
                j++;
            }
            
            // Convert automation data to JSON string for data attribute
            const automationDataJson = JSON.stringify(automationData);
            
            // Add this answer to the HTML with data attribute
            answersHTML += `
                <div class="flex items-start mb-3 p-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-100" 
                     data-automations='${automationDataJson}'>
                    <label for="answer_${currentRow.answer_id}" class="flex-1">
                        <span class="font-medium">${currentRow.answer_text}</span>
                        ${automationIcons ? `<span class="ml-2 text-blue-600" title="Triggers automation">${automationIcons}</span>` : ''}
                        ${currentRow.answer_description ? `<div class="text-sm text-gray-600">${currentRow.answer_description}</div>` : ''}
                    </label>
                    <input type="radio" id="answer_${currentRow.answer_id}" name="question_answer" 
                           value="${currentRow.answer_id}" class="mt-1 mr-2">
                </div>
            `;
            
            // Move to the next answer
            i = j;
        }
    // In getQuestionHTML, update the button to have default values:
return `
<div class="bg-white p-4 rounded-lg border border-gray-300">
    <h4 class="font-medium text-gray-800 mb-3">${firstRow.question_text}</h4>
    ${firstRow.question_description ? `<p class="text-gray-700 mb-4">${firstRow.question_description}</p>` : ''}
    
    <div class="space-y-2">
        ${answersHTML}
    </div>
    
    <div class="bg-green-100 p-4 rounded-lg border border-green-300 mt-4 justify-center items-center text-center">
        <p class="text-green-800 font-medium">Question ${progress}</p>
        <button id="nextQuestionBtn" 
                class="mt-3 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                data-action="save-and-continue"
                data-destination="background"
                data-module="survey"
                data-section="questions">
            Save & Continue
        </button>
    </div>
</div>
`;
    }

    getCompletionHTML() {
        return `
            <div class="bg-white p-4 rounded-lg border border-gray-300 text-center">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Survey Complete!</h3>
                <p class="text-gray-700">Thank you for completing the survey.</p>
                <p class="text-gray-700 mt-2">Your responses have been recorded.</p>
            </div>
        `;
    }
}