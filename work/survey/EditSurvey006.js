// ./work/survey/EditSurvey.js
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { appState } from '../../state/appState.js';
import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';
import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';
import {icons} from '../../registry/iconList.js';
import { SurveyBase } from './SurveyBase.js';
console.log('EditSurvey.js loaded');


















export async function render(panel, query = {}) {  // async?? 
    console.log('editSurvey.render()',panel, query);
   // const surveyId = query.surveyId || [];                        //getSurveyIdFromClipboard();//undefined()
   // if (!surveyId) {
   //     showToast('No survey selected for editing', 'error');
   //     return;
   // }
    const editor = new EditSurvey();
    editor.render(panel, query);
}

class EditSurvey extends SurveyBase {
    constructor() {
        super('edit'); // Different context
        this.editSurveyId = null; // Survey being edited
        this.normalizedSurvey = null; // Store original for comparison
let newQuestion, newAnswer, newAutomation =false;
        this.sectionToEdit = 'header';
    }


    async render(panel, query = {}) {  //most of this looks more like a constructor or init function than a render
        console.log('editSurvey.render()');        
        // Set up UI
        panel.innerHTML = this.getEditTemplateHTML() +this.getTaskAutomationHTML() +this.getSurveyAutomationHTML()+ this.getRelationAutomationHTML();
        // Attach listeners
        this.attachListeners(panel);        
        // Setup clipboard integration
        this.initClipboardIntegration(panel);  //in base. populates from clipboard and set's up onClipboard update

        panel.querySelector('#surveySelectMain')?.addEventListener('change', (e) => {
        const selectedId = e.target.value;
        if (selectedId && selectedId !== this.editSurveyId) {
            this.editSurveyId = selectedId;
            this.loadSurveyData(panel).then(() => this.populateSurveyData(panel, this.sectionToEdit)); // initialised scetionToEdit = 'header'
            this.resetForHeader(panel, 'Edit header or choose another section');
  }
});
/*  //not sure there is any point in the different ways to view the survey
panel.querySelectorAll('.edit-mode-card').forEach(card => {  // NOT USED  ??
    card.addEventListener('click', (e) => {
        const mode = e.target.dataset.mode;
        console.log('Switching to mode:', mode);
        this.setViewMode(panel, mode);
    });
}); */
}


    resetForHeader(panel, label = 'Edit Survey Header') {
        const saveBtn = panel.querySelector('#saveSurveyBtn');
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = label;
        }
        this.sectionToEdit = 'header';
    }

    
    


hideAutomationsHTML(panel){
    this.resetAutomationCard(panel)

}

displayAutomationsHTML(panel){
    this.enableAutomationCard(panel)
}
/*
    setViewMode(panel, mode) {  // not yet fully implemented. It may be redundant.
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
*/

/*

// Always show navigation cards
        this.attachNavigationCards(panel);  //?
        this.attachEventListeners(panel);  //?

*/



normalizeSurveyView(rows) {// rows are from the database 'survey_view'
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
          taskStepId: row.task_step_id,
          deletedAt:row.deleted_at
        });
      }
    }
  
    survey.questions = Array.from(questionMap.values());
    return survey;
  }
  


    async loadSurveyData() { // when should this be called ?
        console.log('loadSurveyData()');
        
        try {
console.log('this.editSurveyId ,surveys[0].entity.id;',this.editSurveyId , surveys[0].entity.id);
            const rawRows = await executeIfPermitted(this.userId, 'readSurveyView', { survey_id: this.editSurveyId });
            this.normalizedSurvey = this.normalizeSurveyView(rawRows);
                        
        } catch (error) {
            console.error('Error loading survey ', error);
            showToast('Failed to load survey  ' + error.message, 'error');
        }
        
    }


populateEditFormWithHeader(nameInput, descriptionInput,nameCounter, descCounter){
    if (nameInput) nameInput.value = this.normalizedSurvey.name || '';
    if (descriptionInput) descriptionInput.value = this.normalizedSurvey.description || '';
    if (nameCounter) nameCounter.textContent = `${this.normalizedSurvey.name?.length || 0}/128 characters`;
    if (descCounter) descCounter.textContent = `${this.normalizedSurvey.description?.length || 0}/2000 characters`;
}

populateEditFormWithQuestion(nameInput, descriptionInput,nameCounter, descCounter){  // need to change the text on the save button
    const question = this.normalizedSurvey.questions.find(q => q.questionId === this.questionId);
   // console.log('Q:', question, nameInput, descriptionInput,nameCounter, descCounter);
    if (nameInput) nameInput.value = question.text || '';
    if (descriptionInput) descriptionInput.value = question.description || '';
    if (nameCounter) nameCounter.textContent = `${question.name?.length || 0}/128 characters`;
    if (descCounter) descCounter.textContent = `${question.description?.length || 0}/2000 characters`;
}

populateEditFormWithAnswer(nameInput, descriptionInput,nameCounter, descCounter){  // need to change the text on the save button
   // console.log('A:', nameInput, descriptionInput,nameCounter, descCounter);
   // console.log('A:', this.questionId, this.answerId,this.automationId);  // what is the structure to get to the answers? 
    const question = this.normalizedSurvey.questions.find(q => q.questionId === this.questionId);
  if (!question) {
    console.warn('Question not found:', this.questionId);
    return;
  }

  const answer = question.answers.find(a => a.answerId === this.answerId);
  if (!answer) {
    console.warn('Answer not found:', this.answerId);
    return;
  }

  if (nameInput) nameInput.value = answer.text || '';
  if (descriptionInput) descriptionInput.value = answer.description || '';
  if (nameCounter) nameCounter.textContent = `${answer.text?.length || 0}/128 characters`;
  if (descCounter) descCounter.textContent = `${answer.description?.length || 0}/2000 characters`;
}

populateEditFormWithAutomation(nameInput, descriptionInput,nameCounter, descCounter){ // need to change the text on the save button 
    console.log('automation: Q:', this.questionId,'A:', this.answerId,'au:',this.automationId);
      const question = this.normalizedSurvey.questions.find(q => q.questionId === this.questionId);
    if (!question) return;
    
    const answer = question.answers.find(a => a.answerId === this.answerId);
    if (!answer) return;
    
    const automation = answer.automations.find(auto => auto.automationId === this.automationId);
    if (!automation) return;
    
    console.log('Automation const:', automation);// displays details of the automation
    if (nameInput) nameInput.value = automation.text || '';
    if (descriptionInput) descriptionInput.value = automation.description || '';
    if (nameCounter) nameCounter.textContent = `${automation.name?.length || 0}/128 characters`;
    if (descCounter) descCounter.textContent = `${automation.description?.length || 0}/2000 characters`;
}

// how to edit automations? Only by deletion & addition - need the mechanisms used in createSurvey
/* The automations part of the object comprises:

approIsId: "06e0a6e6-c5b3-4b11-a9ec-3e1c1268f3df"
approIsName: "Profilia"
automationId: "5800951e-c201-4151-82c0-8ffb39d67252"
automationNumber: 5
name: "passive"
ofApproId: "24cf072f-f4af-42a5-9d09-f82e14a2139a"
ofApproName: "Passive"
relationship: "member"
taskHeaderId: null
taskStepId: null

*/


getEditTemplateHTML() {
    // Same structure as createSurvey but with edit-specific instructions
    return `
        <div id="surveyEditorDialog" class="survey-editor-dialogue relative z-10 flex flex-col h-full">
            <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 z-10 max-h-[90vh] overflow-y-auto">
                <div class="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h3 class="text-xl font-semibold text-gray-900">Edit Survey 19:31 Nov 30</h3>

                                    <select id="surveySelectMain" 
                                            class="flex-1 p-2 border border-gray-300 rounded text-sm">
                                        <option value="">Select survey</option>
                                    </select>

               <button data-action="close-dialog" class="text-gray-500 hover:text-gray-700" aria-label="Close">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                
                <div class="mb-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h4 class="font-medium text-yellow-800 mb-2">Edit Instructions:</h4>
                    <p class="text-yellow-700 text-sm">
                        Use the <span data-action='selector-dialogue' data-destination='new-panel' >[Select] menu button </span> to choose the survey you wish to edit.
                        If you choose one, it will autoload here. If you choose more than one you then use the dropdown to pick a survey.
                        You can immediately edit the Name and Description.
                        To select any other part, a question, answer or automation clcik on the control panel below the save button
                        Click a question to load it into the edit boxes.
                        Click an answer to load an answer.
                        
                        You can edit questions, answers, and automations in any order.
                    </p>
                </div>

<!--div class="grid grid-cols-2 gap-4 mt-6">
<button class="edit-mode-card mb-4 bg-yellow-50 p-4 rounded-lg" data-mode="full">📋 Full Survey</button>
<button class="edit-mode-card mb-4 bg-yellow-50 p-4 rounded-lg" data-mode="questions">❓ Questions Only</button>
<button class="edit-mode-card mb-4 bg-yellow-50 p-4 rounded-lg" data-mode="answers">📝 Answers Only</button>
<button class="edit-mode-card mb-4 bg-yellow-50 p-4 rounded-lg" data-mode="automations">⚙️ Automations</button>
<button class="edit-mode-card mb-4 bg-yellow-50 p-4 rounded-lg" data-mode="summary">🔍 Summary View</button>
<button class="edit-mode-card mb-4 bg-yellow-50 p-4 rounded-lg" data-mode="quickfix">✏️ Quick Fix</button>
</div-->


                <div class="bg-gray-200 p-6 space-y-6">
                    <div class="space-y-4">
                        <input id="surveyName" placeholder="Survey Name - must be unique." maxlength="128" required class="w-full p-2 border rounded" />
                        <p id="surveyNameCounter" class="text-xs text-gray-500">0/128 characters</p>

                        <textarea id="surveyDescription" placeholder="Survey Description" rows="3" maxlength="2000" required class="w-full p-2 min-h-80 border rounded"></textarea>
                        <p id="surveyDescriptionCounter" class="text-xs text-gray-500">0/2000 characters</p>

                        <button id="saveSurveyBtn" class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                            Update Survey Header
                        </button>
                            <button type="button" id="addQuestionBtn" 
                                    class="mt-2 w-full text-sm bg-blue-50 hover:bg-gray-300 py-1 px-3 rounded opacity-50" style="pointer-events: none;" >
                                    + add another question
                            </button>
                                <button type="button" id="addAnswerBtn" 
                                    class="mt-2 w-full text-sm bg-green-50 hover:bg-gray-300 py-1 px-3 rounded opacity-50" style="pointer-events: none;">
                                    + add another answer
                            </button>
                        <!-- Question/Answer/Automation sections (exists in SurveyBase) -->
                        <!-- ... rest of template ... -->
                    </div>

<div id="surveyContent"><!-- place to display condensed version of survey --></div>

                    <div class="bg-green-100 flex flex-col md:flex-row justify-center gap-4 pt-4 border-t border-gray-200">
                        <p class="text-lg font-bold">Information:</p>
                        <div id="informationSection" class="w-full">
                            <!-- Information cards will be added here -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
}


attachSummaryListeners(panel) {
    console.log('attachSummary()');

    this.questionId = null;
    this.answerId = null;
    this.automationId = null;

    panel.addEventListener('click', (e) => {
       


        const target = e.target.closest(
            '.clickable-header, .clickable-question, .clickable-answer, .clickable-automation, .deleteAutomationBtn, #addQuestionBtn, #addAnswerBtn'
        );  
        if (!target) return;
        console.log('Raw click target:', e.target, 'target.classList:',target.classList);
        const saveBtn = panel.querySelector('#saveSurveyBtn');
        if (!saveBtn) return;

        if (target.classList.contains('clickable-header')) {
            this.editSurveyId = target.dataset.headerId;
            console.log('H:', this.editSurveyId);  // became null after clicking on a question. Why?  Or undefined.
            saveBtn.disabled = true;
            saveBtn.textContent = 'Edit header';
            this.sectionToEdit = 'header';
            saveBtn.disabled = false;
            this.hideAutomationsHTML(panel);
            this.populateSurveyData(panel, this.sectionToEdit);

        } else if (target.classList.contains('clickable-question')) {
            this.questionId = target.dataset.questionId;
            console.log('Q:', this.questionId);
            saveBtn.disabled = true;
            saveBtn.textContent = 'Edit question';
            this.sectionToEdit = 'question';
            saveBtn.disabled = false;
            this.hideAutomationsHTML(panel);
            this.populateSurveyData(panel, this.sectionToEdit);

        } else if (target.classList.contains('clickable-answer')) {
            this.questionId = target.dataset.questionId;
            this.answerId = target.dataset.answerId;
            console.log('A:', this.answerId, 'to Q:', this.questionId );
            saveBtn.disabled = true;
            saveBtn.textContent = 'Edit answer';
            this.sectionToEdit = 'answer';
            saveBtn.disabled = false;
            this.displayAutomationsHTML(panel);
            this.populateSurveyData(panel, this.sectionToEdit);

        } else if (target.classList.contains('clickable-automation')) {
            this.questionId = target.dataset.questionId;
            this.answerId = target.dataset.answerId;
            this.automationId = target.dataset.automationId;
            console.log('Au:', this.automationId, 'A:', this.answerId, 'Q:', this.questionId );
            saveBtn.disabled = true;
            saveBtn.textContent = 'Can add or delete automations, but not edit';
            this.sectionToEdit = 'automation';
            saveBtn.disabled = false;
            this.displayAutomationsHTML(panel);
            this.populateSurveyData(panel, this.sectionToEdit);
  
  
        } else if (target.classList.contains('deleteAutomationBtn')) {
            console.log('Delete clicked');
            const automationId = target.dataset.id; 
            if(target.textContent ==   'Click to confirm Delete this automation') 
                {this.handleDeleteAutomationButton(panel, automationId)}
            else target.textContent = 'Click to confirm Delete this automation' ;
      


        } else if (target.id === 'addQuestionBtn') {
            console.log('Add Question clicked');
            this.handleAddQuestion(e, panel);

        } else if (target.id === 'addAnswerBtn') {
            console.log('Add Answer clicked');
            this.handleAddAnswer(e, panel);
        }
    });
}


    populateSurveyData(panel, section) {
        console.log('populateSurveyData()', this.normalizedSurvey);
        if (!this.normalizedSurvey) return;
        
        const nameInput = panel.querySelector('#surveyName');
        if (nameInput) nameInput.value = this.normalizedSurvey.name || '';
        
        const descriptionInput = panel.querySelector('#surveyDescription');
        if (descriptionInput) descriptionInput.value = this.normalizedSurvey.description || '';
        
        // Update character counters
        const nameCounter = panel.querySelector('#surveyNameCounter');
        if (nameCounter) nameCounter.textContent = `${this.normalizedSurvey.name?.length || 0}/128 characters`;
        
        const descCounter = panel.querySelector('#surveyDescriptionCounter');
        if (descCounter) descCounter.textContent = `${this.normalizedSurvey.description?.length || 0}/2000 characters`;
switch (section){
case 'header' :this.populateEditFormWithHeader(nameInput, descriptionInput,nameCounter, descCounter); break;
case 'question' :this.populateEditFormWithQuestion(nameInput, descriptionInput,nameCounter, descCounter); break;
case 'answer' :this.populateEditFormWithAnswer(nameInput, descriptionInput,nameCounter, descCounter); break;
case 'automation' :this.populateEditFormWithAutomation(nameInput, descriptionInput,nameCounter, descCounter); break;
default: console.log('section of survey not known') ;

}
   // new 22:22 nov 7
    // ADD: Display questions/answers/automations
    const surveyContentContainer = panel.querySelector('#surveyContent');
    if (surveyContentContainer) {
        surveyContentContainer.innerHTML = this.renderSurveyStructure(this.normalizedSurvey);
    }
    if (!this.summaryListenersAttached) {
        this.attachSummaryListeners(panel);
        this.summaryListenersAttached = true;
    }
    
    }

    renderSurveyStructure(survey) {
        let html = '<h3>Summary:</h3><br>';

        html += `<p class="clickable-header hover:scale-105 transition-transform bg-gray-50 border-l-4 border-gray-600 rounded-lg p-3 mb-2 shadow-sm hover:shadow-md" data-header-id="${survey.surveyId}">
        <strong>${survey.name.slice(0,30)}:</strong> ${survey.description.slice(0,50)}</p>`;

        
        survey.questions.forEach(question => {
            html += `<p class="clickable-question  hover:scale-105 transition-transform bg-blue-50 border-l-4 border-blue-400 rounded-lg p-3 mb-2 shadow-sm hover:shadow-md" data-question-id="${question.questionId}">
            <strong>Q${question.questionNumber}:</strong> ${question.text}</p>`;
            
            //`<p><strong>Q${question.questionNumber}:</strong> ${question.text}</p>`;
            
            question.answers.forEach(answer => {
                html +=  `<p class="clickable-answer hover:scale-105 transition-transform bg-green-50 border-l-4 border-green-400 rounded-lg p-3 ml-4 mb-2 shadow-sm hover:shadow-md" data-question-id="${question.questionId}" data-answer-id="${answer.answerId}">
                              <em>A${answer.answerNumber}:</em> ${answer.text}</p>`;
                
                //`<p><em>A${answer.answerNumber}:</em> ${answer.text}</p>`;
                
                if (answer.automations.length > 0) {
                 //   html += `<p><em>Automations:</em></p>`;

                    answer.automations.forEach(auto => {
                        console.log('auto',auto,'auto.deleted_at:',auto.deletedAt) //undefined
if(auto.deletedAt) return; // the data comes from 'survey_view' which includes automations that have been soft deleted.
                        html += `<button class="deleteAutomationBtn text-red-600 text-sm ml-4" data-id="${auto.automationId}">Delete</button>`;

                        // DECISION LOGIC: Check if it's a task or relationship automation
                        if (auto.taskHeaderId) {
                            // TASK AUTOMATION   
                            html += `<p class="clickable-automation hover:scale-105 transition-transform bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-3 ml-8 mb-2 shadow-sm hover:shadow-md" data-question-id="${question.questionId}" data-answer-id="${answer.answerId}" data-automation-id="${auto.automationId}">automation🚂🔧 <strong>Task:</strong> Assign to "${auto.name || 'Unknown Task'}" → Step ${auto.taskStepId || 'Initial'}</p>`;
                        } else if (auto.surveyHeaderId) {
                            // SURVEY AUTOMATION   
                            html += `<p class="clickable-automation hover:scale-105 transition-transform bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-3 ml-8 mb-2 shadow-sm hover:shadow-md" data-question-id="${question.questionId}" data-answer-id="${answer.answerId}" data-automation-id="${auto.automationId}">automation🚂📜 <strong>Survey:</strong> Assign to "${auto.name || 'Unknown Survey'}" → ${auto.surveyId || 'Initial'}</p>`;
                        } else if (auto.relationship && auto.ofApproId) {
                            // RELATIONSHIP AUTOMATION  
                            html += `<p class="clickable-automation hover:scale-105 transition-transform bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-3 ml-8 mb-2 shadow-sm hover:shadow-md" data-question-id="${question.questionId}" data-answer-id="${answer.answerId}" data-automation-id="${auto.automationId}">automation🚂🖇️ <strong>Relation:</strong> ${'['+ auto.approIsId + '] <strong> ' + auto.approIsName || 'Respondent' + 'is'} → ${auto.relationship} → ${'of ' + auto.ofApproName+'</strong> ['+auto.ofApproId +']'}</p>`;
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



//new 22:22 nov 7
/*
renderSurveyStructure(survey) {
    let html = 'Summary:<break>';
    
    survey.questions.forEach(question => {
        
    html += `<p>
Q${question.questionNumber}: ${question.text} </p>
`;
        
question.answers.forEach(answer => {
html += `<p>
A${answer.answerNumber}: ${answer.text} </p>

${answer.automations.length > 0 ? `
Automations:<break>
${answer.automations.map(auto => `
   ${auto.approIsId} → ${auto.name} → ${auto.ofApproId}
`).join('')}
` : `
No automations
`}`;
});
html += '<break>';
});
    return html;
}
*/
/*
          relationship: row.relationship,
          approIsId: row.appro_is_id,
          ofApproId: row.of_appro_id,
*/

async updateSurveyHeader(panel){
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

        this.refreshSurvey(panel);
        
    } catch (error) {
        showToast('Failed to update survey: ' + error.message, 'error');
    }

}
async updateQuestion(panel){
        const name = panel.querySelector('#surveyName')?.value.trim();
        const description = panel.querySelector('#surveyDescription')?.value.trim();
    
        if (!name) {
            showToast('Question text is required', 'error');
            return;
        }
/* replaced because description isn't compulsory
        if (!name || !description) {
            showToast('Question text and description are required', 'error');
            return;
        }
*/    
        try {
            const result = await executeIfPermitted(appState.query.userId, 'updateSurveyQuestion', {
                questionId: this.questionId,
                questionName: name,
                questionDescription: description
            });
            console.log('result:', result);
    
            try {
                this.addInformationCard({
                    name: `${result.name?.substring(0, 60)}...`,
                    type: 'question-update',
                    id: `${result.id?.substring(0, 8)}...`
                });
            } catch (cardError) {
                console.warn('Card creation failed:', cardError);
            }
    
            showToast('Question updated successfully!', 'success');
            this.refreshSurvey(panel);
        } catch (error) {
            showToast('Failed to update question: ' + error.message, 'error');
        }
}
async updateAnswer(panel){
    const name = panel.querySelector('#surveyName')?.value.trim();
    const description = panel.querySelector('#surveyDescription')?.value.trim();

    if (!name) {
        showToast('An answer text is required', 'error');
        return;
    }

    try {
        const result = await executeIfPermitted(appState.query.userId, 'updateSurveyAnswer', {
            answerId: this.answerId,
            answerName: name,
            answerDescription: description
        });
        console.log('result:', result);

        try {
            this.addInformationCard({
                name: `${result.name?.substring(0, 60)}...`,
                type: 'answer-update',
                id: `${result.id?.substring(0, 8)}...`
            });
        } catch (cardError) {
            console.warn('Card creation failed:', cardError);
        }

        showToast('Answer updated successfully!', 'success');
        this.refreshSurvey(panel);
    } catch (error) {
        showToast('Failed to update answer: ' + error.message, 'error');
    }
}

async handleDeleteAutomationButton(panel, automationId){
        try {
           const result = await executeIfPermitted(appState.query.userId, 'softDeleteAutomation', {
                automationId,
                deletedBy: appState.query.userId
            });
    
            if (result.success) {
                showToast('Automation deleted successfully', 'success');
                this.addInformationCard({
                    name: `Automation ${automationId.slice(0, 8)}...`,
                    type: 'automation-delete',
                    id: automationId.slice(0, 8)
                });
                this.refreshSurvey(panel);
            } else {
                showToast('Failed to delete automation: ' + result.message, 'error');
                this.addInformationCard({
                    name: `Automation ${automationId.slice(0, 8)}...`,
                    type: 'automation-delete',
                    id: automationId.slice(0, 8)
                });
            }
        } catch (error) {
            showToast('Error deleting automation: ' + error.message, 'error');
        }
    
    

}


    // Override handlers for edit-specific behavior
    async handleSurveySubmit(e, panel) {
        // Use updateSurvey instead of createSurvey
console.log('update something', this.sectionToEdit);

    e.preventDefault();
    switch (this.sectionToEdit) {
        case 'header':
            await this.updateSurveyHeader(panel);
            break;
        case 'question':
            await this.updateQuestion(panel);
            break;
        case 'answer':
            await this.updateAnswer(panel);
            break;
        case 'automation':
            await this.deleteAutomation(panel);
            break;
        default:
            showToast('Unknown section to edit.', 'error');
    }
}


    
    // Override other methods as needed for edit behavior
    async handleQuestionSubmit(e, panel) { 
        console.log('handleQuestionSubmit()');
        e.preventDefault();
        const  userId = appState.query.userId;

        const questionText = panel.querySelector('#questionText')?.value.trim();
        const saveQuestionBtn = panel.querySelector('#saveSurveyBtn'); // use  the shared button
        
        if (!questionText) {
            showToast('Question text is required', 'error');
            return;
        }
       /* 
        if (!this.surveyId) {
            showToast('Please save the survey header first', 'error');
            return;
        }
        */
        saveQuestionBtn.disabled = true;  // shared button
        saveQuestionBtn.textContent = 'Saving Question...';
        
        try { let result, questionDescription;
// NEW 14:00 Nov 2 2025  What if Q1 doesn't exist?  this.questionId
            if (!this.newQuestion) { // Needs to know if this is a new question or an existing one.
                //currently we have no record of that other than what is in the object of questions

result = await this.updateSurveyQuestion({ userId, questionId: this.questionId,
    questionName: questionText,questionDescription: questionDescription || null});

                /*
                result = await executeIfPermitted(userId, 'updateSurveyQuestion', {
                    questionId: this.questionId,
                    questionName: questionText,
                    questionDescription: questionDescription || null
                });  */                
            }  
            else { // New question to be inserted
               // this.questionNumber++; // this is also in the reaction to the click with both jumps 2 places
             result = await this.createSurveyQuestion({
                    userId:userId,
                    surveyId: this.editSurveyId,
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
    //async handleAnswerSubmit(e, panel) { /* ... */ }
    //async handleTaskAutomationSubmit(e, panel) { /* ... */ }
    //async handleRelationshipAutomationSubmit(e, panel) { /* ... */ }
}