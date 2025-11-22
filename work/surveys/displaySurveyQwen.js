import { appState } from '../state/appState.js';
import { executeIfPermitted } from '../registry/executeIfPermitted.js';
import { showToast } from '../ui/showToast.js';
import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';
import { icons } from '../registry/iconList.js'; 
import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';
import {  detectContext,resolveSubject, applyPresentationRules} from '../../utils/contextSubjectHideModules.js'

// Export function as required by the module loading system
export function render(panel, query = {}) { //is query relevant???
    console.log('displaySureveyQwen.render query:',query);

    if (!panel || !panel.isConnected) {
        console.warn('Render target not found or disconnected');
        return;
      }
      
    const display = new SurveyDisplay();
    display.render(panel, query);
    
}


class SurveyDisplay {
    constructor() {
      this.subjectId = null;
      this.subjectName = null;
      this.subjectType = null;
      this.userId = appState.query.userId;
      this.panelEl = null;
      this.surveyData = [];
      this.currentQuestionIndex = 0;
      this.automationMap = {};
      this.currentPayload = null;  // never used ?
  
      onClipboardUpdate(() => {
        this.resolveCurrentSubject();
        this.render(this.panelEl);
      });
    }
  
    // 🔹 Resolve current subject from clipboard or appState
    resolveCurrentSubject() {
      const subject = resolveSubject();
      this.subjectId = subject.id;
      this.subjectName = subject.name;
      this.subjectType = subject.type;
      console.log('subject:', this.subjectName, this.subjectId);
    }
  
    // 🔹 Fetch survey assignments for a person
    async findAssignedSurveys() {
      try {
        const assignments = await executeIfPermitted(this.userId, 'readStudentAssignments', {
          student_id: this.subjectId,
          type: 'survey'
        });
        return assignments.map(a => a.survey_header_id);
      } catch (error) {
        console.error('No assigned surveys:', error);
        return [];
      }
    }
  
    // 🔹 Fetch survey data by ID
    async fetchSurveyData(surveyId) {
      try {
        return await executeIfPermitted(this.userId, 'readSurveyView', { survey_id: surveyId });
      } catch (error) {
        showToast('Failed to load survey: ' + error.message, 'error');
        return [];
      }
    }
  
    // 🔹 Build automation map from survey rows as a look-up table. Each answer (id) has an array of its automations
    buildAutomationMap(rows) {
      this.automationMap = {}; // create a new store of answers+ their automations
      for (const row of rows) { //loop through each row of survey data
        if (!row.answer_id || !row.automation_id) continue; // go to next row if there isn't an answer or more likely there's no automation
        if (!this.automationMap[row.answer_id]) this.automationMap[row.answer_id] = []; //  ?
        const automation = row.relationship   //check what type of automation and assemble the relavant data for it
          ? {
              type: 'relationship',
              approfile_is : this.subjectId,
              relationship: row.relationship,
              ofApprofile: row.of_appro_id,
              automationId: row.automation_id
            }
          : {
              type: 'task',
              studentId : this.subjectId,
              taskId: row.task_header_id,
              stepId: row.task_step_id,
              automationId: row.automation_id
            };
        this.automationMap[row.answer_id].push(automation);  // store the answer id and the associated automation data
        // object looks like:  { answer001id [ {the type and needed data} , {more if >1}], answer002id [{}]   }
      }
    }
  
    // 🔹 Main render method
    async render(panel) {
      if (!panel || !panel.isConnected) return;
      this.panelEl = panel;
      panel.innerHTML = '';
      this.resolveCurrentSubject();
  
      let surveyIds = [];
      const isMyDash = detectContext(panel);
  
      if (this.subjectType === 'app-human') {
        surveyIds = await this.findAssignedSurveys();
      } else if (!isMyDash && this.subjectType === 'surveys') {
        surveyIds.push(this.subjectId);
      }
  
      if (surveyIds.length === 0) {
        panel.innerHTML = `<div class="text-gray-500 text-center py-8">No surveys assigned to ${this.subjectName}.</div>`;
        return;
      }
  
      const surveyData = await this.fetchSurveyData(surveyIds[0]);
      if (!surveyData.length) return;
  
      this.surveyData = surveyData;
      this.buildAutomationMap(surveyData);
      this.renderHeader(panel, surveyData[0]);
    }
  
    // 🔹 Render survey header and intro
    renderHeader(panel, surveyInfo) {
      panel.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
          <div class="bg-blue-50 p-4 border border-blue-200 rounded-lg mb-6">
            <h4 class="text-ml font-bold text-blue-500 mb-4">Surveys</h4>
            <ul class="list-disc list-inside text-sm text-blue-500">
              <li>"Have your say, do your bit."</li>
              <li>Some answers may trigger automations.</li>
            </ul>
          </div>
          <div class="p-6 border-b border-gray-200 text-center">
            <h2 class="text-xl font-semibold text-gray-900">${surveyInfo.survey_name}</h2>
          </div>
          <div class="bg-gray-200 p-6">
            <div class="bg-white p-4 rounded-lg border border-gray-300">
              <p class="text-gray-700 whitespace-pre-line" >${surveyInfo.survey_description}</p>
              <p class="text-xs text-gray-500 mt-2">Created: ${new Date(surveyInfo.survey_created_at).toLocaleDateString()}</p>
            </div>
            <div class="bg-green-100 p-4 rounded-lg border border-green-300 text-center mt-4">
              <p class="text-green-800 font-medium">Survey ready to begin</p>
              <button id="startSurveyBtn" class="mt-3 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                Consent & Continue
              </button>
            </div>
          </div>
          <div id="question-answer-container" class="p-4"></div>
        </div>
      `;
  
      setTimeout(() => {
        const startBtn = document.getElementById('startSurveyBtn');
        if (startBtn) startBtn.addEventListener('click', () => this.showQuestion(this.panelEl));
      }, 100);
    }
  
    // 🔹 Render current question
    showQuestion(panel) {
      const container = document.getElementById('question-answer-container');
      if (!container || !this.surveyData.length) return;
    
      const uniqueQuestions = [...new Set(this.surveyData.map(row => row.question_number))];
      if (this.currentQuestionIndex >= uniqueQuestions.length) { //should say 'processing' or 'please wait..'
        container.innerHTML = this.getCompletionHTML(); // NEED a delay to let any automations complete before saying 'completed'
        return;
      }
    
      const currentQuestionNumber = uniqueQuestions[this.currentQuestionIndex];
      const questionRows = this.surveyData.filter(row => row.question_number === currentQuestionNumber);
      const progress = `${this.currentQuestionIndex + 1} of ${uniqueQuestions.length}`;
    
      container.innerHTML = this.getQuestionHTML(questionRows, progress);
    
      setTimeout(() => {
        const radios = container.querySelectorAll('input[name="question_answer"]');
        radios.forEach(radio => {
          radio.addEventListener('change', (e) => {
            const answerId = e.target.value;
            appState.query.payload = {automations:this.automationMap[answerId] || []};   //is this the right place in the code??          
          });
        });
      }, 100);  //bounce? 

      const nextBtn = document.getElementById('nextQuestionBtn');
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          const selected = document.querySelector('input[name="question_answer"]:checked');
          if (!selected) {
            showToast('Please select an answer', 'error');
            return;
          }     

          nextBtn.setAttribute('data-action', 'auto-execute-automations');  // the rest of the petition can be built from the module and the section where this survey has been displayed
          nextBtn.setAttribute('data-destination', 'background');

// 12:54 Oct 30  log: payload: Array [] length: 0
             // contains taskId, stepId, approfile_is, etc as at line 80
                        // the autoRelateAppro wasn't coded to take it like this. it expected payload.automations
          console.log('appState.query.payload',appState.query.payload);
/* 13:00 Oct 30  logged from displaySurevy.js line 230 appState.query.payload
automationId: "5800951e-c201-4151-82c0-8ffb39d67252"
ofApprofile: "24cf072f-f4af-42a5-9d09-f82e14a2139a"
relationship: "member"
type: "relationship"
*/  // at the autoRelate function the expected payload is called .automations and can be iterated forEach

        this.currentQuestionIndex++;
        this.showQuestion(panel);
        

  })
} 
}
  
    // 🔹 Render question HTML
    getQuestionHTML(rows, progress) {
        const question = rows[0];
        const answers = [...new Set(rows.map(r => r.answer_id))];
      
        const answersHTML = answers.map(answerId => {
          const row = rows.find(r => r.answer_id === answerId);
          const icon = (this.automationMap[answerId] || []).map(a =>
            a.type === 'relationship' ? icons.relationships : icons.task
          ).join('');
      
          return `
            <div class="flex items-start mb-3 p-3 border rounded-lg bg-white hover:bg-gray-100">
              <label for="answer_${answerId}" class="flex-1">
                <span class="font-medium">${row.answer_text}</span>
                ${icon ? `<span class="ml-2 text-blue-600">${icon}</span>` : ''}
                ${row.answer_description ? `<div class="text-sm text-gray-600">${row.answer_description}</div>` : ''}
              </label>
              <input type="radio" id="answer_${answerId}" name="question_answer" value="${answerId}" class="mt-1 mr-2">
            </div>
          `;
        }).join('');
      
        return `
          <div class="bg-white p-4 rounded-lg border">
            <h4 class="font-medium text-gray-800 mb-3">${question.question_text}</h4>
            ${question.question_description ? `<p class="text-gray-700 mb-4">${question.question_description}</p>` : ''}
            <div class="space-y-2">${answersHTML}</div>
            <div class="bg-green-100 p-4 rounded-lg border mt-4 text-center">
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