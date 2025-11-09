// ./surveys/EditSurvey.js
import { appState } from '../state/appState.js';
import { SurveyBase } from './SurveyBase.js';
import { executeIfPermitted } from '../registry/executeIfPermitted.js';
import { showToast } from '../ui/showToast.js';

export async function render(panel, query = {}) {
    console.log('editSurvey.render()', query);
    
    const surveyId = query.surveyId || [];                        //getSurveyIdFromClipboard();//undefined()
    if (!surveyId) {
        showToast('No survey selected for editing', 'error');
        return;
    }
    
    const editor = new EditSurvey(surveyId);
    editor.render(panel, query);
}

class EditSurvey extends SurveyBase {
    constructor(surveyId) {
        super('edit'); // Different context
        this.editSurveyId = surveyId; // Survey being edited
        this.normalizedSurvey = null; // Store original for comparison

        
 //       this.viewMode = query.mode || 'full'; // Default to full view
//        this.focusQuestion = query.questionNumber;
//        this.focusAnswer = query.answerNumber;  // not from query


    }


    async render(panel, query = {}) {  //most of this looks more like a constructor or init function than a render
        console.log('editSurvey.render()');        

        // Set up UI

        panel.innerHTML = this.getTemplateHTML();
        
        const pageTitleEl= panel.querySelector('#pageTitle');
        if (pageTitleEl) pageTitleEl.innerHTML= 'Edit Survey version: 21:00 Nov 8';

        const insertInstructionsEl = panel.querySelector('#insertInstructions');
//        console.log('insertInstructionsEl', insertInstructionsEl);
        if (insertInstructionsEl) insertInstructionsEl.innerHTML= this.getEditTemplateHTML();
        
        // Attach listeners
        this.attachListeners(panel);
        
        // Setup clipboard integration
        this.initClipboardIntegration(panel);  //in base. populates from clipboard and set's up onClipboard update

panel.querySelector('#surveySelect')?.addEventListener('change', (e) => {
  const selectedId = e.target.value;
  if (selectedId && selectedId !== this.editSurveyId) {
    this.editSurveyId = selectedId;
    this.loadSurveyData(panel).then(() => this.populateSurveyData(panel));
  }
});

panel.querySelectorAll('.edit-mode-card').forEach(card => {
    card.addEventListener('click', (e) => {
        const mode = e.target.dataset.mode;
        console.log('Switching to mode:', mode);
        this.setViewMode(panel, mode);
    });
});
    }



    setViewMode(panel, mode) {
        this.currentMode = mode;
        console.log('setViewMode- need the functions');
        // Update UI based on mode
        switch(mode) {
            case 'full':
             //   this.renderFullSurvey(panel);
                break;
            case 'questions':
              //  this.renderQuestionsOnly(panel);
                break;
            case 'answers':
              //  this.renderAnswersOnly(panel);
                break;
            case 'automations':
              //  this.renderAutomationsOnly(panel);
                break;
            case 'summary':
              //  this.renderSummaryView(panel);
                break;
            case 'quickfix':
              //  this.renderQuickFixView(panel);
                break;
        }
    }



    
    getEditTemplateHTML() {
        // Same structure as createSurvey but with edit-specific instructions
        return `
            <div id="surveyEditorDialog" class="survey-editor-dialogue relative z-10 flex flex-col h-full">
                <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 z-10 max-h-[90vh] overflow-y-auto">
                    <div class="p-6 border-b border-gray-200 flex justify-between items-center">
                        <!--h3 class="text-xl font-semibold text-gray-900">Edit Survey 19:19 Nov 7</h3-->

                                        <select id="surveySelect" 
                                                class="flex-1 p-2 border border-gray-300 rounded text-sm">
                                            <option value="">Select survey</option>
                                        </select>

                        <!--button data-action="close-dialog" class="text-gray-500 hover:text-gray-700" aria-label="Close">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button-->
                    </div>
                    
                    <div class="mb-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <h4 class="font-medium text-yellow-800 mb-2">Edit Instructions:</h4>
                        <p class="text-yellow-700 text-sm">
                            Modify the existing survey. 
                            Changes are saved automatically or with explicit save buttons.
                            You can edit questions, answers, and automations in any order.
                        </p>
                    </div>

<div class="grid grid-cols-2 gap-4 mt-6">
  <button class="edit-mode-card mb-4 bg-yellow-50 p-4 rounded-lg" data-mode="full">📋 Full Survey</button>
  <button class="edit-mode-card mb-4 bg-yellow-50 p-4 rounded-lg" data-mode="questions">❓ Questions Only</button>
  <button class="edit-mode-card mb-4 bg-yellow-50 p-4 rounded-lg" data-mode="answers">📝 Answers Only</button>
  <button class="edit-mode-card mb-4 bg-yellow-50 p-4 rounded-lg" data-mode="automations">⚙️ Automations</button>
  <button class="edit-mode-card mb-4 bg-yellow-50 p-4 rounded-lg" data-mode="summary">🔍 Summary View</button>
  <button class="edit-mode-card mb-4 bg-yellow-50 p-4 rounded-lg" data-mode="quickfix">✏️ Quick Fix</button>
</div>


                    </div>
                </div>
            </div>
        `;
        
    }


/*

  // Show appropriate view based on mode
        switch(this.viewMode) {
            case 'full':
                panel.innerHTML = this.getFullSurveyView();
                break;
            case 'questions':
                panel.innerHTML = this.getQuestionsView();
                break;
            case 'answers':
                panel.innerHTML = this.getAnswersView();
                break;
            case 'automations':
                panel.innerHTML = this.getAutomationsView();
                break;
            case 'summary':
                panel.innerHTML = this.getSummaryView();
                break;
            default:
                panel.innerHTML = this.getFullSurveyView();
        }
// Always show navigation cards
        this.attachNavigationCards(panel);  //?
        this.attachEventListeners(panel);  //?

*/



normalizeSurveyView(rows) {
    if (!rows || rows.length === 0) return null;
  
    const survey = {
      surveyId: rows[0].survey_id,
      name: rows[0].survey_name,
      description: rows[0].survey_description,
      authorId: rows[0].author_id,
      createdAt: rows[0].survey_created_at,
      questions: []
    };
  
    const questionMap = new Map();
  
    for (const row of rows) {
      const qId = row.question_id;
      const aId = row.answer_id;
      const autoId = row.automation_id;
  
      if (!questionMap.has(qId)) {
        questionMap.set(qId, {
          questionId: qId,
          text: row.question_text,
          description: row.question_description,
          questionNumber: row.question_number,
          answers: []
        });
      }
  
      const question = questionMap.get(qId);
      let answer = question.answers.find(a => a.answerId === aId);
      if (!answer) {
        answer = {
          answerId: aId,
          text: row.answer_text,
          description: row.answer_description,
          answerNumber: row.answer_number,
          automations: []
        };
        question.answers.push(answer);
      }
  
      if (autoId) {
        answer.automations.push({
          automationId: autoId,
          name: row.automation_name,
          automationNumber: row.automation_number,
          taskHeaderId: row.task_header_id,
          relationship: row.relationship,
          approIsId: row.appro_is_id,
          approIsName :row.appro_is_name,
          ofApproId: row.of_appro_id,
          ofApproName : row.of_appro_name,
          taskStepId: row.task_step_id
        });
      }
    }
  
    survey.questions = Array.from(questionMap.values());
    return survey;
  }
  


    async loadSurveyData() { // when should this be called ?
        console.log('loadSurveyData()');
        
        try {

            const rawRows = await executeIfPermitted(this.userId, 'readSurveyView', { survey_id: this.editSurveyId });
            this.normalizedSurvey = this.normalizeSurveyView(rawRows);
                        
        } catch (error) {
            console.error('Error loading survey ', error);
            showToast('Failed to load survey  ' + error.message, 'error');
        }
    }

    populateSurveyData(panel) {
        if (!this.normalizedSurvey) return;
        
        // Fill in survey header
        //panel.querySelector('#surveyName').value = this.normalizedSurvey.name || '';
        //panel.querySelector('#surveyDescription').value = this.normalizedSurvey.description || '';
        
        const nameInput = panel.querySelector('#surveyName');
        if (nameInput) nameInput.value = this.normalizedSurvey.name || '';
        
        const descriptionInput = panel.querySelector('#surveyDescription');
        if (descriptionInput) descriptionInput.value = this.normalizedSurvey.description || '';
        
        // Update character counters
        const nameCounter = panel.querySelector('#surveyNameCounter');
        if (nameCounter) nameCounter.textContent = `${this.normalizedSurvey.name?.length || 0}/128 characters`;
        
        const descCounter = panel.querySelector('#surveyDescriptionCounter');
        if (descCounter) descCounter.textContent = `${this.normalizedSurvey.description?.length || 0}/2000 characters`;

      //  const urlInput = panel.querySelector('#surveyURL');  // placeholder for future expansion
      //  if (urlInput) urlInput.value = this.normalizedSurvey.surveyURL || '';

   // new 22:22 nov 7
    // ADD: Display questions/answers/automations
    const surveyContentContainer = panel.querySelector('#surveyContent');
    if (surveyContentContainer) {
        surveyContentContainer.innerHTML = this.renderSurveyStructure(this.normalizedSurvey);
    }

    
//    const nameQuestionEl = panel.querySelector('#questionText');
//    if (nameQuestionEl) nameQuestionEl.value = this.questionMap.name(this.questionId) || '';

//    const question = this.questionMap.get(this.questionId);
//    if (question && nameQuestionEl) {
//      nameQuestionEl.value = question.text || '';
//    }
    



    }

//new 17:40 nov 8

renderSurveyStructure(survey) {
    let html = '<h3>Summary:</h3><br>';
    
    survey.questions.forEach(question => {
        html += `<p><strong>Q${question.questionNumber}:</strong> ${question.text}</p>`;
        
        question.answers.forEach(answer => {
            html += `<p><em>A${answer.answerNumber}:</em> ${answer.text}</p>`;
            
            if (answer.automations.length > 0) {
                html += `<p><strong>Automations:</strong></p>`;
                
                answer.automations.forEach(auto => {
                    // DECISION LOGIC: Check if it's a task or relationship automation
                    if (auto.taskHeaderId) {
                        // TASK AUTOMATION
                        html += `<p>🔄 <strong>Task:</strong> Assign to "${auto.name || 'Unknown Task'}" → Step ${auto.taskStepId || 'Initial'}</p>`;
                    } else if (auto.relationship && auto.ofApproId) {
                        // RELATIONSHIP AUTOMATION  
                        html += `<p>🪪 <strong>Relation:</strong> ${'['+ auto.approIsId + '] <strong> ' + auto.approIsName || 'Respondent' + 'is'} → ${auto.relationship} → ${'of ' + auto.ofApproName+'</strong> ['+auto.ofApproId +']'}</p>`;
                    } else {
                        // UNKNOWN AUTOMATION TYPE
                        html += `<p>❓ <strong>Unknown:</strong> ${JSON.stringify(auto)}</p>`;
                    }
                });
            } else {
                html += `<p><em>No automations</em></p>`;
            }
            
            html += '<br>';
        });
        
        html += '<hr><br>'; // Separator between questions
    });
    
    return html;
}



/*
          relationship: row.relationship,
          approIsId: row.appro_is_id,
          ofApproId: row.of_appro_id,
*/

    // Override handlers for edit-specific behavior
    async handleSurveySubmit(e, panel) {
        // Use updateSurvey instead of createSurvey
        const name = panel.querySelector('#surveyName')?.value.trim();
        const description = panel.querySelector('#surveyDescription')?.value.trim();
        
        if (!name || !description) {
            showToast('Survey name and description are required', 'error');
            return;
        }
        
        try {
            const result = await executeIfPermitted(appState.query.userId, 'updateSurvey', {
                surveyId: this.editSurveyId,
                surveyName: name,
                surveyDescription: description
            });
            console.log('result:', result);
            // Update UI to reflect saved state
            try {
                this.addInformationCard({
                  name: `${result.name.substring(0, 60)}...`,
                  type: 'survey-update',
                  id: `${result.id.substring(0, 8)}...`
                });
              } catch (cardError) {
                console.warn('Card creation failed:', cardError);
               // showToast('Survey updated, but card creation failed', 'warning'); //can't see it as hidden behind success message
              }
            
            showToast('Survey header updated successfully!', 'success');
            
//NEW 19;40 Nov 8 2025  WRONG.  The q1 and a1 should already be live and filled-in
 // Enable question card
/* const questionCard = panel.querySelector('#questionCard');
 questionCard.style.opacity = '1';
 questionCard.style.pointerEvents = 'auto';

 // Enable save question button
 const saveQuestionBtn = panel.querySelector('#saveQuestionBtn');
 saveQuestionBtn.style.opacity = '1';
 saveQuestionBtn.style.pointerEvents = 'auto';
*/


        } catch (error) {
            showToast('Failed to update survey: ' + error.message, 'error');
        }
    }
    
    // Override other methods as needed for edit behavior
    async handleQuestionSubmit(e, panel) { /* ... */ }
    async handleAnswerSubmit(e, panel) { /* ... */ }
    async handleTaskAutomationSubmit(e, panel) { /* ... */ }
    async handleRelationshipAutomationSubmit(e, panel) { /* ... */ }
}