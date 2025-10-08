import { appState } from '../state/appState.js';
import { executeIfPermitted } from '../registry/executeIfPermitted.js';
import { showToast } from '../ui/showToast.js';
import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';
import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';
import {icons} from '../registry/iconList.js';

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
            // Load survey data
            const surveyData = await executeIfPermitted(userId, 'readSurveyView', { survey_id: this.surveyId });
            
            if (!surveyData || surveyData.length === 0) {
                showToast('Survey not found', 'error');
                return;
            }
            
            // Group the flat data into hierarchical structure
            this.surveyData = this.groupSurveyData(surveyData);
            
            // Display the header information
            panel.innerHTML = this.getHeaderHTML(this.surveyData.header);
            
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
    }

    // Group flat survey data into hierarchical structure
    groupSurveyData(flatData) {
        if (!flatData || flatData.length === 0) return null;
        
        const header = {
            id: flatData[0].survey_id,
            name: flatData[0].survey_name,
            description: flatData[0].survey_description,
            author_id: flatData[0].author_id,
            created_at: flatData[0].survey_created_at
        };
        
        const questionsMap = new Map();
        
        flatData.forEach(row => {
            if (!questionsMap.has(row.question_id)) {
                questionsMap.set(row.question_id, {
                    id: row.question_id,
                    text: row.question_text,
                    description: row.question_description,
                    number: row.question_number,
                    answers: []
                });
            }
            
            if (row.answer_id) {
                const question = questionsMap.get(row.question_id);
                // Check if answer already exists
                const existingAnswer = question.answers.find(a => a.id === row.answer_id);
                if (!existingAnswer) {
                    question.answers.push({
                        id: row.answer_id,
                        text: row.answer_text,
                        description: row.answer_description,
                        number: row.answer_number,
                        automations: []
                    });
                }
                
                // Add automation if exists
                if (row.automation_id) {
                    const answer = question.answers.find(a => a.id === row.answer_id);
                    answer.automations.push({
                        id: row.automation_id,
                        name: row.automation_name,
                        number: row.automation_number
                    });
                }
            }
        });
        
        const questions = Array.from(questionsMap.values()).sort((a, b) => a.number - b.number);
        
        return {
            header,
            questions,
            totalQuestions: questions.length
        };
    }

    getHeaderHTML(surveyInfo) {
        return `
            <div id="surveyDisplay" class="survey-display relative z-10 flex flex-col h-full">
                <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 z-10 max-h-[90vh] overflow-y-auto">
                                       
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

 <div class="p-6 border-b border-gray-200 justify-center items-center text-center">
                        <h2 class="text-xl font-semibold text-gray-900">${surveyInfo.name || 'Survey'}</h2>
                    </div>

                    <div class="bg-gray-200 p-6 space-y-6">
                        <div class="space-y-4">
                            <div class="bg-white p-4 rounded-lg border border-gray-300">
                                <p class="text-gray-700 ">${surveyInfo.description || 'No description provided'}</p>
                                <p class="text-xs text-gray-500 mt-2">
                                    Created: ${new Date(surveyInfo.created_at).toLocaleDateString()} | 
                                    Author: ${surveyInfo.author_id || 'Unknown'}
                                </p>
                            </div>
                            
                            <div class="bg-green-100 p-4 rounded-lg border border-green-300  justify-center items-center text-center">
                                <p class="text-green-800 font-medium">Survey ready to begin</p>
                                <p class="text-green-700 text-sm mt-1">
                                    Click the button below to start the survey.
                                </p>
                                   <button id="startSurveyBtn" class="mt-3 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                                    Consent & Continue
                                </button>

                            </div>

                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    showQuestion(panel) {
        if (!this.surveyData || this.currentQuestionIndex >= this.surveyData.questions.length) {
            showToast('No more questions', 'info');
            return;
        }

        const currentQuestion = this.surveyData.questions[this.currentQuestionIndex];
        const progress = `${this.currentQuestionIndex + 1} of ${this.surveyData.totalQuestions}`;

        panel.innerHTML = this.getQuestionHTML(currentQuestion, progress);
        
        // Attach event listener to the next button
        setTimeout(() => {
            const nextBtn = document.getElementById('nextQuestionBtn');
            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    // For now, just move to next question - actual saving will be added later
                    this.currentQuestionIndex++;
                    if (this.currentQuestionIndex < this.surveyData.questions.length) {
                        this.showQuestion(panel);
                    } else {
                        // Survey completed
                        panel.innerHTML = this.getCompletionHTML();
                    }
                });
            }
        }, 100);
    }

getAutomationIcon(){
    console.log(this.surveyData);
if (this.surveyData.relationship) return icons.relationships;
if (this.surveyData.task_header_id) return icons.task;
return icons.question;

}

    getQuestionHTML(question, progress) {
        // Create radio buttons for each answer
        const answersHTML = question.answers.map(answer => {
            const hasAutomation = answer.automations.length > 0;
           const automationIcon= this.getAutomationIcon();
         //   const automationIcon = hasAutomation ? '🔧' : '';
            return `
                <div class="flex items-start mb-3">
                    <input type="radio" id="answer_${answer.id}" name="question_${question.id}" 
                           value="${answer.id}" class="mt-1 mr-2">
                    <label for="answer_${answer.id}" class="flex-1">
                        <span class="font-medium">${answer.text}</span>
                        ${automationIcon ? `<span class="ml-2 text-blue-600" title="Triggers automation">${automationIcon}</span>` : ''}
                        ${answer.description ? `<div class="text-sm text-gray-600">${answer.description}</div>` : ''}
                    </label>
                </div>
            `;
        }).join('');

        return `
            <div id="surveyDisplay" class="survey-display relative z-10 flex flex-col h-full">
                <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 z-10 max-h-[90vh] overflow-y-auto">
                                       
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

 <div class="p-6 border-b border-gray-200 justify-center items-center text-center">
                        <h2 class="text-xl font-semibold text-gray-900">${this.surveyData.header.name || 'Survey'}</h2>
                        <p class="text-sm text-gray-600">Question ${progress}</p>
                    </div>

                    <div class="bg-gray-200 p-6 space-y-6">
                        <div class="space-y-4">
                            <div class="bg-white p-4 rounded-lg border border-gray-300">
                                <h4 class="font-medium text-gray-800 mb-3">${question.text}</h4>
                                ${question.description ? `<p class="text-gray-700 mb-4">${question.description}</p>` : ''}
                                
                                <div class="space-y-2">
                                    ${answersHTML}
                                </div>
                            </div>
                            
                            <div class="bg-green-100 p-4 rounded-lg border border-green-300  justify-center items-center text-center">
                                <button id="nextQuestionBtn" class="mt-3 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                                    Save & Continue
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getCompletionHTML() {
        return `
            <div id="surveyDisplay" class="survey-display relative z-10 flex flex-col h-full">
                <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 z-10 max-h-[90vh] overflow-y-auto">
                    <div class="p-6 border-b border-gray-200 justify-center items-center text-center">
                        <h2 class="text-xl font-semibold text-gray-900">Survey Complete!</h2>
                    </div>

                    <div class="bg-gray-200 p-6 space-y-6">
                        <div class="space-y-4">
                            <div class="bg-white p-4 rounded-lg border border-gray-300 text-center">
                                <p class="text-gray-700">Thank you for completing the survey.</p>
                                <p class="text-gray-700 mt-2">Your responses have been recorded.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}