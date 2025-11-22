import { appState} from '../state/appState.js';
import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';
import{executeIfPermitted} from '../registry/executeIfPermitted.js';
import{showToast} from '../ui/showToast.js';


// Export function as required by the module loading system
export function render(panel, query = {}) {
    const editor = new SurveyEditor();
    editor.render(panel, query);
}

const userId = appState.query.userId;
let newSurvey=null;

class SurveyEditor {
    constructor() {
        this.questions = [];
        this.nextQuestionId = 1;
        this.nextAnswerId = 1;
    }

    render(panel, query = {}) {
        console.log('SurveyEditor.render(', panel, query, ')');
        panel.innerHTML = this.getTemplateHTML();
        this.attachListeners(panel);
        this.populateFromClipboard(panel);
        
        // Setup clipboard update listener
        const self = this;
        onClipboardUpdate(() => {
            self.populateFromClipboard(panel);
        });
    }

    getTemplateHTML() {
        return `
            <div id="surveyEditorDialog" class="survey-editor-dialogue relative z-10 flex flex-col h-full">
                <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 z-10 max-h-[90vh] overflow-y-auto">
                    <div class="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h3 class="text-xl font-semibold text-gray-900">Create/Edit Survey</h3>
                        <button data-action="close-dialog" class="text-gray-500 hover:text-gray-700" aria-label="Close">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 class="font-medium text-blue-800 mb-2">Instructions:</h4>
                        <p class="text-blue-700 text-sm">
                            Create a survey with questions and multiple choice answers. 
                            For each answer, you can optionally assign a task to execute 
                            and/or create a relationship with an approfile when selected.
                        </p>
                    </div>

                    <div class="bg-gray-200 p-6 space-y-6">
                        <div class="space-y-4">
                            <input id="surveyName" placeholder="Survey Name - must be unique." maxlength="128" required class="w-full p-2 border rounded" />
                            <p id="surveyNameCounter" class="text-xs text-gray-500">0/128 characters</p>

                            <textarea id="surveyDescription" placeholder="Survey Description" rows="3" maxlength="2000" required class="w-full p-2 min-h-80 border rounded"></textarea>
                            <p id="surveyDescriptionCounter" class="text-xs text-gray-500">0/2000 characters</p>

                            <div id="questionsContainer" class="space-y-6">
                                <!-- Questions will be added here dynamically -->
                            </div>
                            <button id="saveSurveyBtn" class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700" >Enter name & description then Save</button>

                            <button id="addQuestionBtn" class="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700" disabled="true">
                        <!--        + Add Question -->
                            </button>


                        </div>

                        <div class="bg-green-100 flex flex-col md:flex-row justify-center gap-4 pt-4 border-t border-gray-200">
                            <p class="text-lg font-bold">Information:</p>
                            <p data-survey="information-feedback"></p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    attachListeners(panel) {
        const self = this;
        
        // Character counters
        panel.querySelector('#surveyName')?.addEventListener('input', e => {
            panel.querySelector('#surveyNameCounter').textContent = `${e.target.value.length}/128 characters`;
        });

        panel.querySelector('#surveyDescription')?.addEventListener('input', e => {
            panel.querySelector('#surveyDescriptionCounter').textContent = `${e.target.value.length}/2000 characters`;
        });

        // Add question button
        panel.querySelector('#addQuestionBtn')?.addEventListener('click', () => {
            self.addQuestion(panel);
        });

        // Save survey button
        panel.querySelector('#saveSurveyBtn')?.addEventListener('click', (e) => {
            self.handleSurveySubmit(e, panel);
        });

        // Close dialog
        panel.querySelector('[data-action="close-dialog"]')?.addEventListener('click', () => {
            panel.remove();
        });

//added 15:22 sat 4 october 2025
  this.populateFromClipboard(panel);
    onClipboardUpdate(() => {
      this.populateFromClipboard(panel);

    });



    }

    addQuestion(panel) {
        const questionId = `q${this.nextQuestionId++}`;
        const questionHtml = this.getQuestionHTML(questionId);
        panel.querySelector('#questionsContainer').insertAdjacentHTML('beforeend', questionHtml);
        this.setupQuestionListeners(panel, questionId);
    }

    getQuestionHTML(questionId) {
        return `
            <div class="bg-white p-4 rounded-lg border border-gray-300" data-question-id="${questionId}"  data-question-container="${questionId}">
                <div class="flex justify-between items-center mb-3">
                    <label class="block text-sm font-medium text-gray-700">Question</label>
                    <button type="button" data-action="remove-question" data-question-id="${questionId}" 
                            class="text-red-500 hover:text-red-700 text-sm">Remove</button>
                </div>
                <input type="text" data-question-text="${questionId}" placeholder="Enter question text" 
                       class="w-full p-2 border rounded mb-3" maxlength="500" />
                <p class="text-xs text-gray-500 mb-3"><span data-question-text-counter="${questionId}">0</span>/500 characters</p>
                
                <div class="space-y-3" data-answers-container="${questionId}">
                    <!-- Answers will be added here -->
                </div>
                
                <button type="button" data-action="add-answer" data-question-id="${questionId}" 
                        class="mt-2 text-sm bg-gray-200 hover:bg-gray-300 py-1 px-3 rounded">
                        + Add Answer
                </button>
            </div>
    
            `;
    }







    setupQuestionListeners(panel, questionId) {
        const self = this;
        const questionEl = panel.querySelector(`[data-question-id="${questionId}"]`);
        
        // Question text counter
        const questionTextInput = questionEl.querySelector(`[data-question-text="${questionId}"]`);
        questionTextInput?.addEventListener('input', (e) => {
            const counter = panel.querySelector(`[data-question-text-counter="${questionId}"]`);
            counter.textContent = e.target.value.length;
        });

        // Remove question
        const removeBtn = questionEl.querySelector('[data-action="remove-question"]');
        removeBtn?.addEventListener('click', () => {
            questionEl.remove();
        });

        // Add answer
        const addAnswerBtn = questionEl.querySelector('[data-action="add-answer"]');
        addAnswerBtn?.addEventListener('click', () => {
            self.addAnswer(panel, questionId);
        });

        // Add first answer by default
        self.addAnswer(panel, questionId);
    }

    addAnswer(panel, questionId) {
        const answerId = `a${this.nextAnswerId++}`;
        const answerHtml = this.getAnswerHTML(questionId, answerId);
        panel.querySelector(`[data-answers-container="${questionId}"]`).insertAdjacentHTML('beforeend', answerHtml);
        this.setupAnswerListeners(panel, questionId, answerId);
    }

    getAnswerHTML(questionId, answerId) {
        return `
            <div class="bg-gray-50 p-3 rounded border" data-answer-container="${answerId}" data-question-id="${questionId}">
    <div class="flex justify-between items-center mb-2">
        <span class="text-sm font-medium text-gray-600">Answer</span>
        <button type="button" data-action="remove-answer" data-answer-id="${answerId}" 
                class="text-red-500 hover:text-red-700 text-xs">Remove</button>
    </div>
    <input type="text" data-answer-text="${answerId}" placeholder="Answer option" 
           class="w-full p-2 border rounded mb-3" maxlength="200" />
    <p class="text-xs text-gray-500 mb-3"><span data-answer-text-counter="${answerId}">0</span>/200 characters</p>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <!-- Task Dropdown -->
        <div class="space-y-1">
            <label class="block text-xs font-medium text-gray-600">Task (optional)</label>
            <select data-answer-task="${answerId}" 
                    class="w-full p-2 border border-gray-300 rounded text-sm">
                <option value="">Select a task</option>
            </select>
        </div>
        
        <!-- Approfile Dropdown -->
        <div class="space-y-1">
            <label class="block text-xs font-medium text-gray-600">Approfile (optional)</label>
            <select data-answer-appro="${answerId}" 
                    class="w-full p-2 border border-gray-300 rounded text-sm">
                <option value="">Select an approfile</option>
            </select>
        </div>
    </div>
    
    <div class="mt-2">
        <label class="block text-xs font-medium text-gray-600">Relationship Type</label>
        <input type="text" data-answer-relation="${answerId}" placeholder="e.g., member, attendee" 
               class="w-full p-2 border rounded text-sm" maxlength="50" />
    </div>
</div>
        `;
    }

    setupAnswerListeners(panel, questionId, answerId) {
        const self = this;
        const answerEl = panel.querySelector(`[data-answer-id="${answerId}"]`);
        
        // Answer text counter
        const answerTextInput = answerEl.querySelector(`[data-answer-text="${answerId}"]`);
        answerTextInput?.addEventListener('input', (e) => {
            const counter = panel.querySelector(`[data-answer-text-counter="${answerId}"]`);
            counter.textContent = e.target.value.length;
        });

        // Remove answer
        const removeBtn = answerEl.querySelector('[data-action="remove-answer"]');
        removeBtn?.addEventListener('click', () => {
            answerEl.remove();
        });
    }

    populateFromClipboard(panel) {
        console.log('SurveyEditor.populateFromClipboard()');
        
        const informationFeedback = panel.querySelector('[data-survey="information-feedback"]');
        informationFeedback.innerHTML = '';
        
        // Get clipboard items
        const tasks = getClipboardItems({ as: 'task' });
        const approfiles = getClipboardItems({ as: 'approfile' });
        
        // Populate all task dropdowns  - new 23:00 oct 4
        const taskSelects = panel.querySelectorAll('[data-answer-task]');
        const approfileSelects = panel.querySelectorAll('[data-answer-appro]');
        // end new


//        const taskSelects = panel.querySelectorAll('[data-form="taskSelect"]');
        taskSelects.forEach(select => {
            this.addClipboardItemsToDropdown(tasks, select, 'task');
        });
        
        // Populate all approfile dropdowns  
//        const approfileSelects = panel.querySelectorAll('[data-form="approfileSelect"]');
        approfileSelects.forEach(select => {
            this.addClipboardItemsToDropdown(approfiles, select, 'approfile');
        });
        
        informationFeedback.innerHTML = `Clipboard items loaded: ${tasks.length} tasks, ${approfiles.length} approfiles`;
    }

    addClipboardItemsToDropdown(items, selectElement, type) {
        if (!items || items.length === 0) return;
        
        // Clear existing clipboard options (keep the default option)
        const existingClipboardOptions = Array.from(selectElement.querySelectorAll('option[data-source="clipboard"]'));
        existingClipboardOptions.forEach(option => option.remove());
        
        // Add new clipboard items
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item.entity.id;
            option.textContent = `${item.entity.name} (clipboard)`;
            option.dataset.source = 'clipboard';
            option.dataset.name = item.entity.name;
            selectElement.appendChild(option);
        });
    }

async saveSurveyHeader(name,description,saveBtn,panel){
    try{      //NEW  19:50 Oct 4 2025

        console.log('Try to save header:', name, description); //should check for duplicates instead of just failing
     //const newSurvey = await executeIfPermitted(userId, 'createSurvey', {
        newSurvey = await executeIfPermitted(userId, 'createSurvey', {
          surveyName: name,
          surveyDescription: description,
          //surveyUrl: surveyUrl
        }); console.log('newSurvey returned', newSurvey);//returns entire row
        saveBtn.innerHTML='Header saved - now add a question, then save again';
     //   + Add Question

let questionBtn =  panel.querySelector('#addQuestionBtn')
       questionBtn.disabled = false; 
       questionBtn.innerHTML= '+ Add Question';
    
    }catch (error){showToast('Failed to create survey header:'+error.message,'error');return;}
    //end of new - workking 20:25 Oct 4 2025
}


async saveQuestion(questionEl, questionId, saveBtn, panel) {
    const questionText = questionEl.querySelector(`[data-question-text="${questionId}"]`)?.value.trim();
    
    if (!questionText) {
        showToast('Question text is required', 'error');
        return;
    }
    
    saveBtn.disabled = true;
    saveBtn.innerHTML = 'Saving Question...';
    
    try {
        // Save to survey_questions table
        const result = await executeIfPermitted(
            userId,
            'createSurveyQuestion', // Replace with your actual action name
            {
                surveyId: newSurvey.id, // Use the survey ID from the header save
                questionText: questionText,
                userId:userId
            }
        );
        
        // Mark the question as saved
        questionEl.dataset.saved = 'true';
        
        // Disable the question input
        const questionInput = questionEl.querySelector(`[data-question-text="${questionId}"]`);
        questionInput.disabled = true;
        questionInput.style.backgroundColor = '#f0f0f0'; // Visual indicator
        
        showToast('Question saved successfully!');
        
        // Update button text to indicate next step
        saveBtn.innerHTML = 'Question saved - now add another question or save the survey';//wrong
        
        // Optionally enable answers for this question
        const addAnswerBtn = questionEl.querySelector('[data-action="add-answer"]');
        addAnswerBtn.disabled = true; // Disable since we're saving sequentially
        
    } catch (error) {
        showToast('Failed to save question: ' + error.message, 'error');
    }
    
    saveBtn.disabled = false;
}

async saveAnswer(answerEl, questionDbId) {
    const answerId = answerEl.dataset.answerContainer;
    const answerText = answerEl.querySelector(`[data-answer-text="${answerId}"]`)?.value.trim();
    if (!answerText) {
      showToast('Answer text is required', 'error');
      return;
    }
  
    const taskSelect = answerEl.querySelector(`[data-answer-task="${answerId}"]`);
    const taskId = taskSelect?.value || null;
  
    const approfileSelect = answerEl.querySelector(`[data-answer-appro="${answerId}"]`);
    const approfileId = approfileSelect?.value || null;
  
    const relationshipInput = answerEl.querySelector(`[data-answer-relation="${answerId}"]`);
    const relationshipType = relationshipInput?.value.trim() || 'member';
  
    try {
      const result = await executeIfPermitted(userId, 'createSurveyAnswer', {
        questionId: questionDbId,
        answerText,
        taskId,
        approfileId,
        relationshipType,
      });questionEl
    } catch (error) {
      showToast('Failed to save answer: ' + error.message, 'error');
    }
  }
  





async handleSurveySubmit(e, panel) {
    e.preventDefault();
    console.log('SurveyEditor.handleSurveySubmit()');
    
    const name = panel.querySelector('#surveyName')?.value.trim();
    const description = panel.querySelector('#surveyDescription')?.value.trim();
    const saveBtn = panel.querySelector('#saveSurveyBtn');
    
    if (!name || !description) {
        showToast('Survey name and description are required', 'error');
        return;
    }
    
    // If survey header hasn't been saved yet
    if (!newSurvey) {
        this.saveSurveyHeader(name, description, saveBtn, panel);
        return;
    }
    
    // If survey header is saved but no questions exist yet, or if there are unsaved questions
    const unsavedQuestion = panel.querySelector('[data-question-container]:not([data-saved])');
    if (unsavedQuestion) {
        const questionId = unsavedQuestion.dataset.questionContainer;
        this.saveQuestion(unsavedQuestion, questionId, saveBtn, panel);
        return;
    }
    
    const answerElements = questionEl.querySelectorAll('[data-answer-container]');
    for (const answerEl of answerElements) {
      await this.saveAnswer(answerEl, result.id); // result.id is the saved question ID
    }
    



    // If all questions are saved, proceed with saving answers
    // (existing code for saving answers would go here)
    
    // Collect all questions and answers
    const questions = [];
    const questionElements = panel.querySelectorAll('[data-question-container]');
    
    for (const questionEl of questionElements) {
        const questionId = questionEl.dataset.questionContainer;
        const questionText = questionEl.querySelector(`[data-question-text="${questionId}"]`)?.value.trim();
        
        if (!questionText) {
            showToast('All questions must have text', 'error');
            return;
        }
        
        const answers = [];
        const answerElements = questionEl.querySelectorAll('[data-answer-container]');
        
        for (const answerEl of answerElements) {
            const answerId = answerEl.dataset.answerContainer;
            const answerText = answerEl.querySelector(`[data-answer-text="${answerId}"]`)?.value.trim();
            
            if (!answerText) {
                showToast('All answers must have text', 'error');
                return;
            }
            
// Get task selection
const taskSelect = answerEl.querySelector(`[data-form="taskSelect"]`);
const taskId = taskSelect?.value || null;
const taskName = taskId ? taskSelect.options[taskSelect.selectedIndex]?.dataset.name : null;

// Get approfile selection
const approfileSelect = answerEl.querySelector(`[data-form="approfileSelect"]`);
const approfileId = approfileSelect?.value || null;
const approfileName = approfileId ? approfileSelect.options[approfileSelect.selectedIndex]?.dataset.name : null;
/*
            // Get task selection
            const taskSelect = answerEl.querySelector(`[data-answer-task="${answerId}"]`);
            const taskId = taskSelect?.value || null;
            const taskName = taskId ? taskSelect.options[taskSelect.selectedIndex]?.dataset.name : null;
            
            // Get approfile selection
            const approfileSelect = answerEl.querySelector(`[data-answer-appro="${answerId}"]`);
            const approfileId = approfileSelect?.value || null;
            const approfileName = approfileId ? approfileSelect.options[approfileSelect.selectedIndex]?.dataset.name : null;
            */
            // Get relationship type
            const relationshipInput = answerEl.querySelector(`[data-answer-relation="${answerId}"]`);
            const relationshipType = relationshipInput?.value.trim() || 'member';
            
            const answerData = {
                text: answerText,
                task: taskId ? { id: taskId, name: taskName } : null,
                approfile: approfileId ? { 
                    of: approfileId, 
                    ofName: approfileName, 
                    relationship: relationshipType 
                } : null
            };
            
            answers.push(answerData);
        }
        
        if (answers.length === 0) {
            showToast('Each question must have at least one answer', 'error');
            return;
        }
        
        questions.push({
            text: questionText,
            answers: answers
        });
    }
    
    if (questions.length === 0) {
        showToast('Survey must have at least one question', 'error');
        return;
    }
    
    const surveyData = {
        name: name,
        description: description,
        questions: questions
    };
    
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving Survey...';
    
    try {
        // Save survey using your existing system
        const result = await executeIfPermitted(
            userId, 
            'createSurveyWithQuestions', // Replace with your actual action name
            surveyData
        );
        
        showToast('Survey created successfully!');
        console.log('Saved survey:', result);
        
        // Close dialog after successful save
        panel.remove();
        
    } catch (error) {
        showToast('Failed to save survey: ' + error.message, 'error');
    }
    
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Survey';
}


/*
    async handleSurveySubmit(e, panel) {
        e.preventDefault();
        console.log('SurveyEditor.handleSurveySubmit()');
        
        const name = panel.querySelector('#surveyName')?.value.trim();
        const description = panel.querySelector('#surveyDescription')?.value.trim();
        const saveBtn = panel.querySelector('#saveSurveyBtn');
        
        if (!name || !description) {
            showToast('Survey name and description are required', 'error');
            return;
        }
if(!newSurvey){ this.saveSurveyHeader(name, description, saveBtn, panel); return; }//it is a new survey





        // Collect all questions and answers
        const questions = [];
        const questionElements = panel.querySelectorAll('[data-question-container]');
        
        for (const questionEl of questionElements) {
            const questionId = questionEl.dataset.questionContainer; // Use the specific container attribute
            const questionText = questionEl.querySelector(`[data-question-text="${questionId}"]`)?.value.trim();
            console.log("Processing question:", questionId, " ", questionText);
            if (!questionText) {
                showToast('All questions must have text', 'error');
                return;
            }
            
            const answers = [];
            const answerElements = questionEl.querySelectorAll('[data-answer-container]');
            
            for (const answerEl of answerElements) {
                const answerId = answerEl.dataset.answerContainer; // Updated to match new attribute
                const answerText = answerEl.querySelector(`[data-answer-text="${answerId}"]`)?.value.trim();
                console.log("Processing answers:", answerElements.length," ",answerId, " ", answerText);    
                if (!answerText) {
                    showToast('All answers must have text', 'error');
                    return;
                }
                
                // Get task selection
                const taskSelect = answerEl.querySelector(`[data-answer-task="${answerId}"]`);
                const taskId = taskSelect?.value || null;
                const taskName = taskId ? taskSelect.options[taskSelect.selectedIndex]?.dataset.name : null;
                
                // Get approfile selection
                const approfileSelect = answerEl.querySelector(`[data-answer-appro="${answerId}"]`);
                const approfileId = approfileSelect?.value || null;
                const approfileName = approfileId ? approfileSelect.options[approfileSelect.selectedIndex]?.dataset.name : null;
                
                // Get relationship type
                const relationshipInput = answerEl.querySelector(`[data-answer-relation="${answerId}"]`);
                const relationshipType = relationshipInput?.value.trim() || 'member';
                
                const answerData = {
                    text: answerText,
                    task: taskId ? { id: taskId, name: taskName } : null,
                    approfile: approfileId ? { 
                        of: approfileId, 
                        ofName: approfileName, 
                        relationship: relationshipType 
                    } : null
                };
                
                answers.push(answerData);
            }
            
            if (answers.length === 0) {
                showToast('Each question must have at least one answer', 'error');
                return;
            }
            
            questions.push({
                text: questionText,
                answers: answers
            });
        }
        
        if (questions.length === 0) {
            showToast('Survey must have at least one question', 'error');
            return;
        }
        
        const surveyData = {
            name: name,
            description: description,
            questions: questions
        };
        
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving Survey...';
        
        try {
            // Save survey using your existing system
            
//            const result = await executeIfPermitted(
//                appState.query.userId, 
//                'createSurvey', 
//                surveyData
//            ); 
            
            showToast('Survey created successfully!');
            console.log('Saved survey:', result);
            
            // Close dialog after successful save
            panel.remove();
            
        } catch (error) {
            showToast('Failed to save survey: ' + error.message, 'error');
        }
        
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Survey';
    } */





        
} 


