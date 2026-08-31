// ./surveys/CreateSurvey.js

import { appState } from '../../state/appState.js';
import { SurveyBase } from './SurveyBase.js';
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';
import { showToast } from '../../ui/showToast.js'; 
import { resolveSubject } from '../../utils/contextSubjectHideModules.js';
import {icons} from '../../registry/iconList.js';

console.log('CreateSurvey.js loaded');

export async function render(panel, query = {}) {
    const surv = new CreateSurvey();
    surv.render(panel, query);
}

class CreateSurvey extends SurveyBase {
    constructor() {
        super('create'); 
    }


    // ========================================
    // DISPLAY FORM, POPULATE, ATTACH LISTENER - SURVEY
    // ========================================


    render(panel, query = {}) {
    console.log('Render(', panel, query, ')');     
    panel.innerHTML = this.getSurveyTemplateHTML();
    this.populateForm(panel); 
    this.attachSaveButtonListener(panel);
    this.attachCounterListeners(panel);
    }


    // ========================================
    // GENERATE NAME - SURVEY
    // ========================================

async populateForm(panel){
    console.log('populateForm()');
    await resolveSubject();;
    const userName = appState.query.userName
    
    const name = icons.surveys +' published by: ' + userName +' - '+ Date.now();

        const nameEl = panel.querySelector('#surveyName');
        nameEl.value = name;
        const descriptionEl = panel.querySelector('#surveyDescription');
        descriptionEl.value = 'First publish this template survey, then you or someone else can edit it. Publication and editing can be by different persons. The initial name & description are auto-generated. ';
}


    // ========================================
    // LISTENER ON SAVE BUTTON - SURVEY
    // ========================================


attachSaveButtonListener(panel){
        console.log('attachSaveButtonListener()');
        panel.addEventListener('click', (e) => {
        // Save survey button
        console.log('CLICK attachSaveButtonListener',e.target.id);
        if (e.target.id === 'saveSurveyBtn') {
            e.preventDefault();
            this.handleSurveyPublish(e, panel);
            return;
        }
})
}

 // ========================================
    // LISTENERS ON INPUTS - SURVEY
    // ========================================

attachCounterListeners(panel){
     panel.addEventListener('input', (e) => {
        if (e.target.id === 'surveyName') {
            panel.querySelector('#surveyNameCounter').textContent = `${e.target.value.length}/128 characters`;
        } else if (e.target.id === 'surveyDescription') {
            panel.querySelector('#surveyDescriptionCounter').textContent = `${e.target.value.length}/2000 characters`;
        }

})
}
    // ========================================
    // DATA OPERATIONS - SURVEY
    // ========================================

    async handleSurveyPublish(e, panel) { 
        console.log('handleSurveyPublish()');
        e.preventDefault();

        const name = panel.querySelector('#surveyName')?.value.trim();
        const description = panel.querySelector('#surveyDescription')?.value.trim();

        const saveBtn = panel.querySelector('#saveSurveyBtn');
        
        if (!name || !description) {//this was for manual input
            showToast('Survey name and description are required', 'error');
            return;
        }
        
        if(this.surveyId) { // at start surveyId is null. If it has a value there must a survey already saved. 
                            // Therefore  generate a new survey and re-arm the save button
            this.populateForm(panel); //generates a new name for a new survey
            saveBtn.textContent = 'New survey ready to be published:' + name + '';
            this.surveyId = null; //can only save a survey if this is null (if it has a value we regenerate instead of savng )
            return // avoid immediate saving}
        }

        if (!this.surveyId) { // We assume that the current survey has not been saved. SurveyId takes a value after a save
            
            saveBtn.textContent = 'Saving Survey Header...';
            saveBtn.disabled = true;
            saveBtn.style.opacity = '0.5';  
            saveBtn.style.pointerEvents = 'none';

          const auth = appState.query.userAuthId;
          const  appro = appState.query.userId;

            try {
                const result = await executeIfPermitted(auth, 'createSurvey', { // AUTH (auth) goes first, DATA (author_id) goes in the payload
                    surveyName: name,
                    surveyDescription: description,
                    author_id: appro 
                });
                this.surveyId = result.id; //suveyId now has a value, so prevent saving it again            
                
                saveBtn.style.opacity = '1';  
                saveBtn.style.pointerEvents = 'auto';
                saveBtn.textContent = 'Survey ' + name + ' - - - Click again to generate a new survey';
                saveBtn.disabled = false;
                
                
                this.addInformationCard({ //uses SurveyBase
                    'name': `${result.name}...`,
                    'type': 'survey',
                    'id': `${result.id}...`
                });
                

                showToast('Survey header saved successfully!');
            } catch (error) {
                console.error('Creating survey header', error);
                showToast('Failed to create survey: ' + error.message, 'error');
                saveBtn.disabled = false;
                saveBtn.textContent = 'Save Survey Header';
            }
        }
        
    }


// addInfomrationCard is in SurveryBase





























getSurveyTemplateHTML() {
        console.log('getTemplateHTML()');
        return `
            <div id="surveyEditorDialog" class="survey-editor-dialogue relative z-10 flex flex-col h-full">
                <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 z-10 max-h-[90vh] overflow-y-auto">
                    <div class="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h3 class="text-xl font-semibold text-gray-900">Create Survey 20:46 Aug 29 2026</h3>
                        <button data-action="close-dialog" class="text-gray-500 hover:text-gray-700" aria-label="Close">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>

                            <!--  INSTRUCTIONS  SURVEYS  -->
                    
                    <div class="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 class="font-medium text-gray-800 mb-2">Instructions:</h4>
                        <p class="text-gray-700 text-sm">
                            First the publisher authorises a new survey by using the createSurvey module.<br>
                            The editor then selects the new survey and edits its contents using 'Edit Survey' from the admin dashboard.
                            <br> The publisher can cnage the name or description. For example adding who it is for in the name -for john.<br>
                            The description can be adapted to explain what the survey is to be about. In this way detailed instructions can be passed to the editor.                            
                            </p>                     
                      
                    
                    
                            </div>


                    <div class="bg-gray-200 p-6 space-y-6">
                        <div class="space-y-4">
                            <input id="surveyName" placeholder="Survey Name - must be unique." maxlength="128" required class="w-full p-2 border rounded" />
                            <p id="surveyNameCounter" class="text-xs text-gray-500">0/128 characters</p>

                            <textarea id="surveyDescription" placeholder="Survey Description" rows="3" maxlength="2000" required class="w-full p-2 min-h-80 border rounded"></textarea>
                            <p id="surveyDescriptionCounter" class="text-xs text-gray-500">0/2000 characters</p>

                            <button id="saveSurveyBtn" class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                                Click to publish
                            </button>
         <!--  Rating Select  -->
            <!--div class="space-y-2">
              <label for="ratingSelect" class="block text-sm font-medium text-gray-700">Every appro, task & survey is rated for trustSecurity. It defaults to the minimum</label>
              <select id="ratingSelect" data-form="ratingSelect" class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Change rating (optional)</option>
              </select>
            </div-->
                            <!-- Question Card -->
                            <!--div id="questionCard" class="bg-white p-4 rounded-lg border border-gray-300 opacity-50" style="pointer-events: none;">
                                <div class="flex justify-between items-center mb-3">
                                 <label class="block text-sm font-medium text-gray-700">Question</label>
                            </div>
                            <input type="text" id="questionText" placeholder="Enter question text" class="w-full p-2 border rounded mb-3" maxlength="500" />
                                <p class="text-xs text-gray-500 mb-3"><span id="questionTextCounter">0</span>/500 characters</p>

                            <!--div id="answersContainer" class="space-y-3"-->
                                 <!-- Answers will be added here -->
                             <!--/div>

                                <button type="button" id="saveQuestionBtn" class="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 opacity-50" style="pointer-events: none;">
                                    Save Question
                                </button>
                                <button type="button" id="addQuestionBtn"
                                        class="mt-2 w-full text-sm bg-gray-200 hover:bg-gray-300 py-1 px-3 rounded opacity-50" style="pointer-events: none;" >
                                        + add another question
                                </button>
                            </div-->

                            <!-- Answer Card -->
                            <!-- div id="answerCard" class="bg-gray-50 p-3 rounded border opacity-30" style="pointer-events: none;">
                                <div class="flex justify-between items-center mb-2">
                                    <span class="text-sm font-medium text-gray-600">Answer</span>
                                </div>
                                <input type="text" id="answerText" placeholder="Answer option"
                                       class="w-full p-2 border rounded mb-3" maxlength="200" />
                                <p class="text-xs text-gray-500 mb-3"><span id="answerTextCounter">0</span>/200 characters</p>
                                <button type="button" id="saveAnswerBtn" class="w-full mt-2 bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 opacity-50" style="pointer-events: none;">
                                    Save Answer
                                </button>

                                <button type="button" id="addAnswerBtn"
                                        class="mt-2 w-full text-sm bg-gray-200 hover:bg-gray-300 py-1 px-3 rounded opacity-50" style="pointer-events: none;">
                                        + add another answer
                                </button>
                            </div-->

                            <!-- Automations Card -->
                            <!-- div id="automationsCard" class="bg-green-50 p-4 rounded-lg border border-green-300 opacity-20" style="pointer-events: none;">
                                <h4 class="font-medium text-green-800 mb-2">Automations</h4>
                                <p class="text-green-700 text-sm">
                                    When this answer is selected, the following actions will be performed:
                                </p-->

                                <!-- Assign Task Section -->
                                <!--div class="mt-4 p-3 bg-white rounded border mb-4">
                                    <h5 class="font-medium text-gray-800 mb-2">Assign a task</h5>
                                    <div class="flex gap-2">
                                        <select id="taskSelect"
                                                class="flex-1 p-2 border border-gray-300 rounded text-sm">
                                            <option value="">Select a task</option>
                                        </select>
                                        <button type="button" id="saveTaskAutomationBtn" class="bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700 opacity-50" style="pointer-events: none;">
                                            Save Task
                                        </button>
                                    </div>
                                </div-->

                                <!-- Relate to Category Section -->
                                <!--div class="p-3 bg-white rounded border">
                                    <h5 class="font-medium text-gray-800 mb-2">Relate to a category</h5>
                                    <div class="flex gap-2 mb-2">
                                        <select id="approfileSelect"
                                                class="flex-1 p-2 border border-gray-300 rounded text-sm">
                                            <option value="">Select an approfile</option>
                                        </select>
                                    </div>
                                    <div class="flex gap-2">
                                        <select id="relationshipSelect"
                                                class="flex-1 p-2 border border-gray-300 rounded text-sm">
                                            <option value="">Select relationship</option>
                                            <option value="member">member</option>
                                            <option value="customer">customer</option>
                                            <option value="explanation">explanation</option>
                                        </select>
                                        <!--button type="button" id="saveRelationshipAutomationBtn" class="bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700 opacity-50" style="pointer-events: none;">
                                            Save Relationship
                                        </button>
<button type="button" id="saveRelationshipAutomationBtn" class="bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700 opacity-50" style="pointer-events: none;">
    Save Relationship
</button-->


                                    </div>
                                </div-->

                            </div>
                        </div>

                        <div class="bg-green-100 flex flex-col md:flex-row justify-center gap-4 pt-4 border-t border-gray-200">
                            <p class="text-lg font-bold">Information:</p>
                            <div id="informationSection" class="w-full">
                                <!-- Information cards will be added here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
               ${petitionBreadcrumbs()}
        `
}

















//////////////////////////////////////////////////////////////////////////////////////////////


/*
    // --- Helper to get IDs consistently ---
    async getIdentity() {
        await resolveSubject(); 
        return {
            auth: appState.query.userAuthId,
            appro: appState.query.userId
        };
    }
*/

/*
async handleQuestionSubmit(e, panel) { 
        e.preventDefault();
        const ids = await this.getIdentity(); // Gets { auth, appro }

        const questionText = panel.querySelector('#questionText')?.value.trim();
        const saveQuestionBtn = panel.querySelector('#saveQuestionBtn');
        
        if (!questionText) {
            showToast('Question text is required', 'error');
            return;
        }
        
        saveQuestionBtn.disabled = true;
        saveQuestionBtn.textContent = 'Saving Question...';
        
        try {
            let result;
            if (this.questionNumber === 1) { 
                // Using the Base Class Method
                result = await this.updateSurveyQuestion({ 
                    userId: ids.auth, // Pass Auth ID for permission check
                    questionId: this.questionId,
                    questionName: questionText,
                    questionDescription: null
                });
            } else { 
                // Using the Base Class Method
                result = await this.createSurveyQuestion({
                    userId: ids.auth,
                    surveyId: this.surveyId,
                    questionText: questionText,
                    question_number: this.questionNumber
                });
            } 
            
            this.questionId = result.id;
            this.addInformationCard({
                'name': `${result.name.substring(0, 60)}...`, 
                'type': 'Question', 
                'number': this.questionNumber,
                'id': `${result.id.substring(0, 8)}...`
            });

            panel.querySelector('#questionText').disabled = true;
            saveQuestionBtn.textContent = 'Question Saved';
            saveQuestionBtn.disabled = true;
            
            this.enableAnswerCard(panel);
            
            const addQuestionBtn = panel.querySelector('#addQuestionBtn');
            addQuestionBtn.style.opacity = '1';
            addQuestionBtn.style.pointerEvents = 'auto';

            showToast('Question saved successfully!');
        } catch (error) {
            showToast('Failed to save question: ' + error.message, 'error');
            saveQuestionBtn.disabled = false;
            saveQuestionBtn.textContent = 'Save Question';
        }
    }
*/
/*
    async handleAnswerSubmit(e, panel) { 
        e.preventDefault();
        const ids = await this.getIdentity();

        const answerText = panel.querySelector('#answerText').value.trim();
        const saveAnswerBtn = panel.querySelector('#saveAnswerBtn');

        if (!answerText) {
            showToast('Answer text cannot be empty', 'error');
            return;
        }

        saveAnswerBtn.disabled = true;
        
        try {
            let result;
            if (this.answerNumber === 1) { 
                // Using the Base Class Method
                result = await this.updateSurveyAnswer({
                    userId: ids.auth, 
                    answerId: this.answerId,
                    answerName: answerText,
                    answerDescription: null
                });
            } else {
                // Using the Base Class Method
                result = await this.createSurveyAnswer({
                    userId: ids.auth,
                    questionId: this.questionId,
                    answerText: answerText,
                    answer_number: this.answerNumber
                });        
            } 
            
            this.answerId = result.id;
            this.addInformationCard({
                'name': `${result.name.substring(0, 60)}...`,
                'type': 'Answer',
                'number': this.answerNumber,  
                'questionnumber': this.questionNumber, 
                'id': `${result.id.substring(0, 8)}...`
            });
            
            panel.querySelector('#answerText').disabled = true;
            saveAnswerBtn.textContent = 'Answer Saved';
            saveAnswerBtn.disabled = true;
            
            this.enableAutomationCard(panel);
            showToast('Answer saved successfully!');
        } catch (error) {
            showToast('Failed to save answer: ' + error.message, 'error');
            saveAnswerBtn.disabled = false;
        }
    }*/
}