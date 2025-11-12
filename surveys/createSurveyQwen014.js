// ./surveys/CreateSurvey.js

import { appState} from '../state/appState.js';
import { SurveyBase } from './SurveyBase.js';
import { executeIfPermitted } from '../registry/executeIfPermitted.js';
import { showToast } from '../ui/showToast.js'; 
// Note: appState, userId, getClipboardItems, etc., are likely imported/accessed via SurveyBase or already globally available.
//NO, they are not available globally, none of them. Trying to use them in this class assuming they are inherited failed

// DEV  NOTE:  this module uses appState.query.userId as the appro_is .  This may need to be changed if session variable is different
//working 15:50 Nov 10 2025  prior to edits 
console.log('CreateSurvey.js loaded');


export async function render(panel, query = {}) {
    console.log('render()',query);
   const surv = new CreateSurvey();
    surv.render(panel, query);
}




// The original SurveyEditor class is now CreateSurvey and extends SurveyBase
class CreateSurvey extends SurveyBase {
    
    // ========================================
    // 1. CONSTRUCTOR (Initializes Base Class)
    // ========================================
    constructor() {
        // Calls the constructor of SurveyBase, setting up panel, query, and initial state.
        super('create'); 
      
    }

    // ========================================
    // UI RENDERING
    // ========================================
    render(panel, query = {}) {
        console.log('createSurvey.render(', panel, query, ')');
        panel.innerHTML = this.getTemplateHTML();

        this.attachListeners(panel);
        // Setup clipboard update listener
        this.initClipboardIntegration(panel);
        

        
    }



    // You no longer need a separate render() method unless you add setup unique to the Create flow.
    // The base class's render() will be inherited and used.  FALSE   code needed render function to run
    
    // ========================================
    // 2. DATA OPERATIONS - SURVEY
    // ========================================
   async handleSurveySubmit(e, panel) { 
        console.log('handleSurveySubmit()');
        e.preventDefault();
        const  userId = appState.query.userId;

        const name = panel.querySelector('#surveyName')?.value.trim();
        const description = panel.querySelector('#surveyDescription')?.value.trim();
        const saveBtn = panel.querySelector('#saveSurveyBtn');
        
        if (!name || !description) {
            showToast('Survey name and description are required', 'error');
            return;
        }
        
        if (!this.surveyId) {
            // Save survey header
            saveBtn.disabled = true;
            saveBtn.textContent = 'Saving Survey Header...';
            
            try {
                const result = await executeIfPermitted(userId, 'createSurvey', {
                    surveyName: name,
                    surveyDescription: description,
                });
                this.surveyId = result.id;

// NEW 14:00 Nov 2 2025 - the database utomatically creats question 1 and answer 1 to question 1
// find question number 1 and answer number 1 so can update them
//could read them directly (functions exist) or use survey view                
               let survey;
                try{  // there is a single row in survey_view because it has just been created
                    survey = await executeIfPermitted(userId,'readSurveyView',{survey_id:this.surveyId})
                    
                    }catch (error) {
                     console.error('Error reading survey:', error)
                        showToast('Failed to read survey: ' + error.message, 'error');
                    }
                    survey = survey[0]; //returned an array of a single object
                    console.log('survey', survey);
                    this.questionId = survey.question_id;
                    const question01Text=survey.question_text;
                    const question01Description=survey.question_description;

                    this.answerId  = survey.answer_id;
                    const answer01Text = survey.answer_text;
                    const answerDescription = survey.answer_description;

                    this.questionNumber =1; this.answerNumber= 1;
                    
                    console.log('Q1:',this.questionId,'A1:', this.answerId);

                    //need to inject question01 and answer01 in the HTML.  questionText
                    const questionTextEl = panel.querySelector('#questionText');
                    questionTextEl.value = question01Text;

                    const answerTextEl = panel.querySelector('#answerText');
                    answerTextEl.value = answer01Text;
// end of new

                
                // Enable question card
                const questionCard = panel.querySelector('#questionCard');
                questionCard.style.opacity = '1';
                questionCard.style.pointerEvents = 'auto';

                // Enable save question button
                const saveQuestionBtn = panel.querySelector('#saveQuestionBtn');
                saveQuestionBtn.style.opacity = '1';
                saveQuestionBtn.style.pointerEvents = 'auto';
                
                // Add information card 
                this.addInformationCard({'name': `${result.name.substring(0, 60)}...`,'type' :'survey' ,   'id': `${result.id.substring(0, 8)}...`});
                
                saveBtn.textContent = 'Survey Header Saved';
                saveBtn.disabled = true; // Disable since header is saved
                
                showToast('Survey header saved successfully!');
            } catch (error) {
                console.error('Creating survey header', error);
                showToast('Failed to create survey header: ' + error.message, 'error');
            }
            
            saveBtn.disabled = false;
        }
    }    
    // ========================================
    // 3. DATA OPERATIONS - QUESTION
    // ========================================

async createSurveyQuestion({userId,
    surveyId,
    questionText,
    question_number
}){
console.log('createSurveyQuestion()','id:',surveyId,' text:', questionText, 'number',
    question_number);
   const result = await executeIfPermitted(userId, 'createSurveyQuestion', {
        surveyId: surveyId,
        questionText: questionText,
        question_number: question_number
    });
    return result;
}




 async handleQuestionSubmit(e, panel) { 
        console.log('handleQuestionSubmit()');
        e.preventDefault();
        const  userId = appState.query.userId;

        const questionText = panel.querySelector('#questionText')?.value.trim();
        const saveQuestionBtn = panel.querySelector('#saveQuestionBtn');
        
        if (!questionText) {
            showToast('Question text is required', 'error');
            return;
        }
        
        if (!this.surveyId) {
            showToast('Please save the survey header first', 'error');
            return;
        }
        
        saveQuestionBtn.disabled = true;
        saveQuestionBtn.textContent = 'Saving Question...';
        
        try { let result, questionDescription;
// NEW 14:00 Nov 2 2025  What if Q1 doesn't exist?  this.questionId
            if (this.questionNumber === 1) { // exsiting auto-created Q1 needs updating
                result = await executeIfPermitted(userId, 'updateSurveyQuestion', {
                    questionId: this.questionId,
                    questionName: questionText,
                    questionDescription: questionDescription || null
                });                
            }  
            else { // New question to be inserted
               // this.questionNumber++; // this is also in the reaction to the click with both jumps 2 places
             result = await this.createSurveyQuestion({userId:userId,
                    surveyId: this.surveyId,
                    questionText: questionText,
                    question_number: this.questionNumber
                })
console.log('question:', result);
                /*  result = await executeIfPermitted(userId, 'createSurveyQuestion', {
                surveyId: this.surveyId,
                questionText: questionText,
                question_number: this.questionNumber
            }); */
            } 
            
            this.questionId = result.id;
            // Add information card  
          
            this.addInformationCard({'name': `${result.name.substring(0, 60)}...`, 'type':'Question' , 'number':this.questionNumber,'id':`${result.id.substring(0, 8)}...`, });            
            // Disable question input and save button
            panel.querySelector('#questionText').disabled = true;
            saveQuestionBtn.disabled = true;
            saveQuestionBtn.style.opacity = '0.5';
            
            // Enable answer card
            this.enableAnswerCard(panel);
            
            // Enable add question button
            const addQuestionBtn = panel.querySelector('#addQuestionBtn');
            addQuestionBtn.style.opacity = '1';
            addQuestionBtn.style.pointerEvents = 'auto';

            saveQuestionBtn.textContent = 'Question Saved';
            saveQuestionBtn.disabled = true; // Disable since header is saved
            
            showToast('Question saved successfully!');
        } catch (error) {
            showToast('Failed to save question: ' + error.message, 'error');
        }
    }

    
    handleAddQuestion(e, panel) { 
        console.log('handleAddQuestion()');
        this.questionNumber++;  // with this  & the other ++ we get Q=3, but without it we have Q=1
        // Reset question fields for a new question
        panel.querySelector('#questionText').value = '';
        panel.querySelector('#questionText').disabled = false;
        
        // Reset answer fields to initial state
        panel.querySelector('#answerText').value = '';
        panel.querySelector('#answerText').disabled = true; // Disable since no question saved yet
        
        // Disable answer card
        this.resetAnswerCard(panel);
        
        // Disable automations card
        this.resetAutomationCard(panel);
        
        // Re-enable save question button
        const saveQuestionBtn = panel.querySelector('#saveQuestionBtn');
        saveQuestionBtn.disabled = false;
        saveQuestionBtn.style.opacity = '1';
        saveQuestionBtn.style.pointerEvents = 'auto';
        saveQuestionBtn.textContent = 'Save Question';
        
        showToast('Ready to add a new question');
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

        const  userId = appState.query.userId;

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
            // Add information card  
            
            this.addInformationCard({'name': `${result.name.substring(0, 60)}...`,'type':'Answer','number':this.answerNumber,  'questionnumber':this.questionNumber , 'id':`${result.id.substring(0, 8)}...`});
            
            // Disable answer input and save button
            panel.querySelector('#answerText').disabled = true;
            saveAnswerBtn.disabled = true;
            saveAnswerBtn.style.opacity = '0.5';
            
            // Enable automations card
            this.enableAutomationCard(panel);

            saveAnswerBtn.textContent = 'Answer Saved';
            saveAnswerBtn.disabled = true; // Disable since answer saved

            showToast('Answer saved successfully!');
        } catch (error) {
            showToast('Failed to save answer: ' + error.message, 'error');
        }
    }

    handleAddAnswer(e, panel) { 
        console.log('handleAddAnswer()');
        // Reset answer fields for a new answer
        panel.querySelector('#answerText').value = '';
        panel.querySelector('#answerText').disabled = false;
        
        // Re-enable save answer button
        const saveAnswerBtn = panel.querySelector('#saveAnswerBtn');
        saveAnswerBtn.disabled = false;
        saveAnswerBtn.style.opacity = '1';
        saveAnswerBtn.style.pointerEvents = 'auto';
        
        // Disable automations card
        this.resetAutomationCard(panel);
        
        showToast('Ready to add a new answer');
    }
    // ========================================
    // 5. DATA OPERATIONS - AUTOMATIONS
    // ========================================
 async handleTaskAutomationSubmit(e, panel) {
        console.log('handleTaskAutomationSubmit()');
        e.preventDefault();
        const  userId = appState.query.userId;

        const taskSelect = panel.querySelector('#taskSelect');
        const selectedTaskId = taskSelect?.value;
        // Get the selected option text
        const selectedOption = taskSelect.options[taskSelect.selectedIndex];
        const cleanName = selectedOption?.textContent?.replace(' (clipboard)', '');
        
        if (!selectedTaskId) {
            showToast('Please select a task first', 'error');
            return;
        }
        
        const saveTaskAutomationBtn = panel.querySelector('#saveTaskAutomationBtn');
        saveTaskAutomationBtn.disabled = true;
        saveTaskAutomationBtn.textContent = 'Saving...';
        this.automationsNumber++;        
        
        try { 
            // LOOK UP ALL STEPS FOR THIS TASK
            console.log('Looking up steps for task:', selectedTaskId);
            const steps = await executeIfPermitted(userId, 'readTaskSteps', {
                taskId: selectedTaskId
            });
            
            // FIND STEP 3 (initial step)
            let stepId = null;
            const initialStep = steps.find(step => step.step_order === 3);
            if (initialStep) {
                stepId = initialStep.id;
                console.log('Found initial step_id:', stepId);  // c83496a0-8c5e-47e5-bcee-19b121191c68  (For DEFAULT task) this is correct for step 3
            } else {
                throw new Error('No initial step (step 3) found for task');
            }
            
            // Save task automation to database WITH step_id
            const result = await executeIfPermitted(userId, 'createSurveyAutomation', {
                surveyAnswerId: this.answerId,
                taskId: selectedTaskId,
                source_task_step_id : stepId, // changed to match db in automations Table. BUT registry function being called didn't use task_step_id at all. Changed that 19:14 oct 13
                itemName: cleanName,
                automation_number: this.automationsNumber
            });
            
            // Add information card  
            this.addInformationCard({
                'name': `${result.name.substring(0, 60)}...`,
                'type': 'Task automation',
                'number': this.automationsNumber, 
                'answerNumber': this.answerNumber,  
                'questionNumber': this.questionNumber, 
                'id': `${result.id.substring(0, 8)}...`
            });
            
            showToast('Task automation saved successfully!');
        } catch (error) {
            showToast('Failed to save task automation: ' + error.message, 'error');
        }
        
        saveTaskAutomationBtn.disabled = false;
        saveTaskAutomationBtn.textContent = 'Save Task';
    }

    async handleRelationshipAutomationSubmit(e, panel) {
        console.log('handleRelationshipAutomationSubmit()');
        e.preventDefault();
        const  userId = appState.query.userId;
        const respondentId = userId; // <=========================================  this should be person responding to survey
        const approfileSelect = panel.querySelector('#approfileSelect');
        const relationshipSelect = panel.querySelector('#relationshipSelect');
        
        const selectedOfApprofile = approfileSelect?.value;  //what is this selected as? 
        // Get the selected option text
        const selectedOption = approfileSelect.options[approfileSelect.selectedIndex];
        const cleanName = selectedOption?.textContent?.replace(' (clipboard)', '');
        
        const selectedRelationship = relationshipSelect?.value;
        
        if (!selectedOfApprofile) {
            showToast('Please select an approfile first', 'error');
            return;
        }
        
        if (!selectedRelationship) {
            showToast('Please select a relationship type', 'error');
            return;
        }
        
        const saveRelationshipAutomationBtn = panel.querySelector('#saveRelationshipAutomationBtn');
        saveRelationshipAutomationBtn.disabled = true;
        saveRelationshipAutomationBtn.textContent = 'Saving...';
        this.automationsNumber++;        
        try {  
            // Save relationship automation to database
            const result = await executeIfPermitted(userId, 'createSurveyAutomation', {
                surveyAnswerId: this.answerId,
                ofApprofileId: selectedOfApprofile,
                approfile_is_id:respondentId,
                itemName:cleanName,
                relationship: selectedRelationship,
                automation_number: this.automationsNumber
            });
            
            // Add information card

            this.addInformationCard({'name': `${result.name.substring(0, 60)}...` , 'relationship': `${result.relationship.substring(0, 8)}...`,'type':'Appro automation', 'number':this.automationsNumber, 'answerNumber':this.answerNumber,  'questionNumber':this.questionNumber ,'id': `${result.id.substring(0, 8)}...` });            
            showToast('Relationship automation saved successfully!');
        } catch (error) {
            showToast('Failed to save relationship automation: ' + error.message, 'error');
        }
        
        saveRelationshipAutomationBtn.disabled = false;
        saveRelationshipAutomationBtn.textContent = 'Save Relationship';
    }
}

