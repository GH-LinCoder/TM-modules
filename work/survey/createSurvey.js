// ./surveys/CreateSurvey.js

import { appState } from '../../state/appState.js';
import { SurveyBase } from './SurveyBase.js';
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js'; 
import { resolveSubject } from '../../utils/contextSubjectHideModules.js';

console.log('CreateSurvey.js loaded');

export async function render(panel, query = {}) {
    const surv = new CreateSurvey();
    surv.render(panel, query);
}

class CreateSurvey extends SurveyBase {
    constructor() {
        super('create'); 
    }

    render(panel, query = {}) {
        panel.innerHTML = this.getTemplateHTML();
        this.attachListeners(panel);
        this.initClipboardIntegration(panel);
    }

    // --- Helper to get IDs consistently ---
    async getIdentity() {
        await resolveSubject(); 
        return {
            auth: appState.query.userAuthId,
            appro: appState.query.userId
        };
    }

    // ========================================
    // DATA OPERATIONS - SURVEY
    // ========================================
    async handleSurveySubmit(e, panel) { 
        e.preventDefault();
        const ids = await this.getIdentity();

        const name = panel.querySelector('#surveyName')?.value.trim();
        const description = panel.querySelector('#surveyDescription')?.value.trim();
        const saveBtn = panel.querySelector('#saveSurveyBtn');
        
        if (!name || !description) {
            showToast('Survey name and description are required', 'error');
            return;
        }
        
        if (!this.surveyId) {
            saveBtn.disabled = true;
            saveBtn.textContent = 'Saving Survey Header...';
            
            try {
                // AUTH (ids.auth) goes first, DATA (author_id) goes in the payload
                const result = await executeIfPermitted(ids.auth, 'createSurvey', {
                    surveyName: name,
                    surveyDescription: description,
                    author_id: ids.appro 
                });
                this.surveyId = result.id;

                let surveyData = await executeIfPermitted(ids.auth, 'readSurveyView', { survey_id: this.surveyId });
                const survey = surveyData[0]; 

                this.questionId = survey.question_id;
                this.answerId = survey.answer_id;
                this.questionNumber = 1; 
                this.answerNumber = 1;

                panel.querySelector('#questionText').value = survey.question_text;
                panel.querySelector('#answerText').value = survey.answer_text;

                // UI Updates
                const questionCard = panel.querySelector('#questionCard');
                questionCard.style.opacity = '1';
                questionCard.style.pointerEvents = 'auto';

                const saveQuestionBtn = panel.querySelector('#saveQuestionBtn');
                saveQuestionBtn.style.opacity = '1';
                saveQuestionBtn.style.pointerEvents = 'auto';
                
                this.addInformationCard({
                    'name': `${result.name.substring(0, 60)}...`,
                    'type': 'survey',
                    'id': `${result.id.substring(0, 8)}...`
                });
                
                saveBtn.textContent = 'Survey Header Saved';
                saveBtn.disabled = true;
                showToast('Survey header saved successfully!');
            } catch (error) {
                console.error('Creating survey header', error);
                showToast('Failed to create survey: ' + error.message, 'error');
                saveBtn.disabled = false;
                saveBtn.textContent = 'Save Survey Header';
            }
        }
    }

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
    }
}