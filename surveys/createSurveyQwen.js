// ./surveys/CreateSurvey.js

import { SurveyBase } from './SurveyBase.js';
import { executeIfPermitted } from '../registry/executeIfPermitted.js';
import { showToast } from '../ui/showToast.js'; 
// Note: appState, userId, getClipboardItems, etc., are likely imported/accessed via SurveyBase or already globally available.

console.log('CreateSurvey.js loaded');

// The original SurveyEditor class is now CreateSurvey and extends SurveyBase
export class CreateSurvey extends SurveyBase {
    
    // ========================================
    // 1. CONSTRUCTOR (Initializes Base Class)
    // ========================================
    constructor(panel, query) {
        // Calls the constructor of SurveyBase, setting up panel, query, and initial state.
        super(panel, query); 
    }

    // You no longer need a separate render() method unless you add setup unique to the Create flow.
    // The base class's render() will be inherited and used.
    
    // ========================================
    // 2. DATA OPERATIONS - SURVEY
    // ========================================
    async handleSurveySubmit(e, panel) {
        // [Keep your original logic for saving/creating the survey here]
        // This is where you call executeIfPermitted(userId, 'createSurvey', {...})
        // And then: this.enableQuestionCard(panel);
        // And then: this.resetAnswerCard(panel);
    }
    
    // ========================================
    // 3. DATA OPERATIONS - QUESTION
    // ========================================
    async handleQuestionSubmit(e, panel) {
        // [Keep your original logic for saving/creating the question here]
        // This is where you call executeIfPermitted(userId, 'createSurveyQuestion', {...})
        // And then: this.enableAnswerCard(panel);
    }
    
    handleAddQuestion(e, panel) { 
        // [Keep your original logic for resetting state for a new question]
        // This is where you call: this.resetQuestionCard(panel);
        // And where you increment: this.questionNumber++;
    }

    // ========================================
    // 4. DATA OPERATIONS - ANSWER (The most critical difference)
    // ========================================
    async handleAnswerSubmit(e, panel) { 
        // This method is unique because it must check for and update the existing A1,
        // then create A2, A3, etc.
        const answerText = panel.querySelector('#answerText').value.trim();
        const answerDescription = panel.querySelector('#answerDescription')?.value.trim(); // Assuming a description field exists

        if (!answerText) {
            showToast('Answer text cannot be empty', 'error');
            return;
        }

        const userId = this.userId;
        let result;

        try {
            if (this.answerNumber === 1) { 
                // Exsiting auto-created A1 needs updating
                result = await executeIfPermitted(userId, 'updateSurveyAnswer', {
                    answerId: this.answerId,
                    answerName: answerText, // NOTE: Changed from 'answerName' to 'answerText' to be consistent with 'createSurveyAnswer'
                    answerDescription: answerDescription || null
                });
            } else {          
                // New answer so insert (A2, A3, ...)
                this.answerNumber++; // Increment ONLY before insertion of new answers (A2+)
                result = await executeIfPermitted(userId, 'createSurveyAnswer', {
                    questionId: this.questionId,
                    answerText: answerText,
                    answer_number: this.answerNumber
                });
            } 
            
            this.answerId = result.id;
            this.addInformationCard({ /* ... your card data ... */ });
            // ... (rest of UI updates: disable input, enable automation card, show toast)
            showToast('Answer saved successfully!');

        } catch (error) {
            showToast('Failed to save answer: ' + error.message, 'error');
        }
    }

    handleAddAnswer(e, panel) {
        // [Keep your original logic for resetting state for a new answer]
        // This method relies on the unique state flow (creating A2 after A1 is saved).
    }

    // ========================================
    // 5. DATA OPERATIONS - AUTOMATIONS
    // ========================================
    async handleTaskAutomationSubmit(e, panel) {
        // [Keep your original logic for saving task automation]
        // This is where you call executeIfPermitted(userId, 'createSurveyAutomation', {...})
        // and: this.automationsNumber++;
    }

    async handleRelationshipAutomationSubmit(e, panel) {
        // [Keep your original logic for saving relationship automation]
        // This is where you call executeIfPermitted(userId, 'createSurveyAutomation', {...})
        // and: this.automationsNumber++;
    }
}
