//   ./surveys/surveyBase.js
/* 
initial draft of those functions that can be taken out of 'createSurvey' and put in surveyBase
The aim being to enable a new module editSurvey to have access to the shared functions

However there may be more that could move if the only difference in some other function is calling for INSERT vs UPDATE

Would it be better to have a single createEditSurvey.js module or separate ones createSurvey.js and editSurvey.js  ?
*/



import { appState} from '../state/appState.js';
import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';
import{executeIfPermitted} from '../registry/executeIfPermitted.js';
import{showToast} from '../ui/showToast.js';
import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';
import {icons} from '../registry/iconList.js';

console.log('surveyBase.js loaded');

export class SurveyBase{
    // ========================================
    // STATE MANAGEMENT
    // ========================================
 // Pass panel and query to the constructor for setup
constructor(type) { 
 
    this.type = type; // 'create' or 'edit' now
    console.log ('actionType:', type);
    this.subject = null;
    this.subjectId = null;
    this.subjectName = null;
    this.subjectType = null;
    this.userId = appState.query.userId;
    this.panelEl = null;
        
        this.surveyId = null;
        this.questionId = null;
        this.answerId = null;
        this.steps = []; // Array of step objects: {type, id, text, questionNumber, answerNumber, automationNumber, ...}
        this.questionNumber = 1;
        this.answerNumber = 1;
        this.automationsNumber = 0;
    
    
    
    }


 // Initialize clipboard integration
  initClipboardIntegration(panel) {  
    // Populate from clipboard immediately
    console.log('initClipboardIntegration:',panel);
    this.populateFromClipboard(panel);  
    
    // Listen for clipboard updates
    onClipboardUpdate(() => {
      console.log('onClipboardUpdate:',panel);
      this.populateFromClipboard(panel);
    });
  }



  getEditTemplateHTML() {
    return `
        <div id="surveyEditorDialog" class="survey-editor-dialogue relative z-10 flex flex-col h-full">
            <div class="bg-white rounded-lg shadow-lg w-full max-w-6xl mx-4 z-10 max-h-[90vh] overflow-hidden">
                <div class="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h3 class="text-xl font-semibold text-gray-900">Edit Survey</h3>
                    <button data-action="close-dialog" class="text-gray-500 hover:text-gray-700" aria-label="Close">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <div class="p-6">
                    <!-- Survey Header Section -->
                    <div class="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 class="font-medium text-blue-800 mb-3">Survey Header</h4>
                        <div class="space-y-3">
                            <input id="surveyName" placeholder="Survey Name - must be unique." maxlength="128" required class="w-full p-2 border rounded" />
                            <p id="surveyNameCounter" class="text-xs text-gray-500">0/128 characters</p>
                            
                            <textarea id="surveyDescription" placeholder="Survey Description" rows="3" maxlength="2000" required class="w-full p-2 min-h-20 border rounded"></textarea>
                            <p id="surveyDescriptionCounter" class="text-xs text-gray-500">0/2000 characters</p>
                            
                            <button id="saveSurveyHeaderBtn" class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                                Save Survey Header
                            </button>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <!-- LEFT: Summary Navigation -->
                        <div class="space-y-4">
                            <h4 class="font-medium text-gray-800">Survey Structure</h4>
                            <div id="surveyStructure" class="bg-gray-50 p-4 rounded-lg border min-h-96 max-h-96 overflow-y-auto">
                                <!-- Dynamic structure will be populated here -->
                            </div>
                            
                            <div class="flex gap-2">
                                <button id="addQuestionBtn" class="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
                                    + Add Question
                                </button>
                            </div>
                        </div>

                        <!-- RIGHT: Edit Panel -->
                        <div class="space-y-4">
                            <h4 class="font-medium text-gray-800">Edit Panel</h4>
                            <div id="editPanel" class="bg-white p-4 rounded-lg border min-h-96">
                                <div id="editPlaceholder" class="text-gray-500 flex items-center justify-center h-64">
                                    <p>Select an item from the structure to edit</p>
                                </div>
                                <div id="editForm" class="hidden">
                                    <!-- Dynamic form content -->
                                </div>
                            </div>
                            
                            <div id="editActions" class="hidden flex gap-2">
                                <button id="saveEditBtn" class="flex-1 bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700">
                                    Save Changes
                                </button>
                                <button id="cancelEditBtn" class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        ${petitionBreadcrumbs()}
    `;
}


    // ========================================
    // EVENT HANDLERS
    // ========================================
   

attachListeners(panel) {
    console.log('attachListeners()');
    
    // CHARACTER COUNTERS - Use event delegation:
    panel.addEventListener('input', (e) => {
        if (e.target.id === 'surveyName') {
            panel.querySelector('#surveyNameCounter').textContent = `${e.target.value.length}/128 characters`;
        } else if (e.target.id === 'surveyDescription') {
            panel.querySelector('#surveyDescriptionCounter').textContent = `${e.target.value.length}/2000 characters`;
        } else if (e.target.id === 'questionText') {
            panel.querySelector('#questionTextCounter').textContent = `${e.target.value.length}/500 characters`;
        } else if (e.target.id === 'answerText') {
            panel.querySelector('#answerTextCounter').textContent = `${e.target.value.length}/200 characters`;
        }
    });

    // BUTTON CLICKS - Use event delegation:
    panel.addEventListener('click', (e) => {
        // Save survey button
        if (e.target.id === 'saveSurveyBtn') {
            e.preventDefault();
            this.handleSurveySubmit(e, panel);
            return;
        }
        
        // Save question button
        if (e.target.id === 'saveQuestionBtn') {
            e.preventDefault();
            this.handleQuestionSubmit(e, panel);
            return;
        }
        
        // Add question button   
        if (e.target.id === 'addQuestionBtn') {
            e.preventDefault();
            this.handleAddQuestion(e, panel);
            return;
        }
        
        // Save answer button
        if (e.target.id === 'saveAnswerBtn') {
            e.preventDefault();
            this.handleAnswerSubmit(e, panel);
            return;
        }
        
        // Add answer button
        if (e.target.id === 'addAnswerBtn') {
            e.preventDefault();
            this.handleAddAnswer(e, panel);
            return;
        }
        
        // Save task automation button
        if (e.target.id === 'saveTaskAutomationBtn') {
            e.preventDefault();
            this.handleTaskAutomationSubmit(e, panel);
            return;
        }
        
        // Save relationship automation button
        if (e.target.id === 'saveRelationshipAutomationBtn') {
            e.preventDefault();
            this.handleRelationshipAutomationSubmit(e, panel);
            return;
        }
        
        // Close dialog
        if (e.target.closest('[data-action="close-dialog"]')) {
            panel.remove();
            return;
        }
    });
}



    // ========================================
    // UI STATE MANAGEMENT
    // ========================================
    // Reset question card to initial state
    resetQuestionCard(panel) {
        panel.querySelector('#questionText').value = '';
        panel.querySelector('#questionText').disabled = false;
        
        const questionCard = panel.querySelector('#questionCard');
        questionCard.style.opacity = '1';
        questionCard.style.pointerEvents = 'auto';
        
        const saveQuestionBtn = panel.querySelector('#saveQuestionBtn');
        saveQuestionBtn.disabled = false;
        saveQuestionBtn.style.opacity = '1';
        saveQuestionBtn.style.pointerEvents = 'auto';
        saveQuestionBtn.textContent = 'Save Question';
    }

    // Reset answer card to initial state
    resetAnswerCard(panel) {
        panel.querySelector('#answerText').value = '';
        panel.querySelector('#answerText').disabled = true;
        
        const answerCard = panel.querySelector('#answerCard');
        answerCard.style.opacity = '0.3';
        answerCard.style.pointerEvents = 'none';
        
        const saveAnswerBtn = panel.querySelector('#saveAnswerBtn');
        saveAnswerBtn.disabled = true;
        saveAnswerBtn.style.opacity = '0.5';
        saveAnswerBtn.style.pointerEvents = 'none';
        saveAnswerBtn.textContent = 'Save Answer';
        
        const addAnswerBtn = panel.querySelector('#addAnswerBtn');
        addAnswerBtn.disabled = true;
        addAnswerBtn.style.opacity = '0.5';
        addAnswerBtn.style.pointerEvents = 'none';
        addAnswerBtn.textContent = '+ add another answer';
    }

    // Enable answer card
    enableAnswerCard(panel) {
        const answerCard = panel.querySelector('#answerCard');
        answerCard.style.opacity = '1';
        answerCard.style.pointerEvents = 'auto';
        
        const saveAnswerBtn = panel.querySelector('#saveAnswerBtn');
        saveAnswerBtn.disabled = false;
        saveAnswerBtn.style.opacity = '1';
        saveAnswerBtn.style.pointerEvents = 'auto';
        saveAnswerBtn.textContent = 'Save Answer';
        
        const addAnswerBtn = panel.querySelector('#addAnswerBtn');
        addAnswerBtn.disabled = false;
        addAnswerBtn.style.opacity = '1';
        addAnswerBtn.style.pointerEvents = 'auto';
        addAnswerBtn.textContent = '+ add another answer';

        panel.querySelector('#answerText').disabled = false; // this gets disabled in 
        // resetAnswerCard: panel.querySelector('#answerText').disabled = true;
        // handleAnswerSubmit: panel.querySelector('#answerText').disabled = true;
    }

    // Reset automation card to initial state
    resetAutomationCard(panel) {
        const automationsCard = panel.querySelector('#automationsCard');
        automationsCard.style.opacity = '0.2';
        automationsCard.style.pointerEvents = 'none';
        
        const saveTaskAutomationBtn = panel.querySelector('#saveTaskAutomationBtn');
        saveTaskAutomationBtn.disabled = true;
        saveTaskAutomationBtn.style.opacity = '0.5';
        saveTaskAutomationBtn.style.pointerEvents = 'none';
        saveTaskAutomationBtn.textContent = 'Save Task';
        
        const saveRelationshipAutomationBtn = panel.querySelector('#saveRelationshipAutomationBtn');
        saveRelationshipAutomationBtn.disabled = true;
        saveRelationshipAutomationBtn.style.opacity = '0.5';
        saveRelationshipAutomationBtn.style.pointerEvents = 'none';
        saveRelationshipAutomationBtn.textContent = 'Save Relationship';
    }

  // Enable automation card
enableAutomationCard(panel) {
    const automationsCard = panel.querySelector('#automationsCard');
    automationsCard.style.opacity = '1';
    automationsCard.style.pointerEvents = 'auto';
    
    const saveTaskAutomationBtn = panel.querySelector('#saveTaskAutomationBtn');
    saveTaskAutomationBtn.disabled = false;
    saveTaskAutomationBtn.style.opacity = '1';
    saveTaskAutomationBtn.style.pointerEvents = 'auto';
    saveTaskAutomationBtn.textContent = 'Save Task';
    
    const saveRelationshipAutomationBtn = panel.querySelector('#saveRelationshipAutomationBtn');
    saveRelationshipAutomationBtn.disabled = false;
    saveRelationshipAutomationBtn.style.opacity = '1';
    saveRelationshipAutomationBtn.style.pointerEvents = 'auto';  // This line is crucial!
    saveRelationshipAutomationBtn.textContent = 'Save Relationship';
}

    // ========================================
    // INFORMATION DISPLAY
    // ========================================

getIconByType(type) {
        switch(type){
          case 'survey': return icons.surveys;
          case 'Question': return icons.question
          case 'Answer': return icons.answer;
          case 'Task automation': return icons.task;
          case 'Appro automation': return icons.relationships;
          default: return icons.display;
        }
      }
      




styleCardByType(type){
    console.log('styleCardByType()',type);
    switch(type){
        case 'survey':return 'bg-white p-2 rounded border mb-3 text-lg font-bold';
        case 'Question':return 'bg-yellow-100 p-2 rounded border mb-1 text-sm font-bold';
        case 'Answer':return 'bg-orange-100 p-2 rounded border mb-1 text-sm font-style: italic ml-4';
        case 'Task automation':return 'bg-blue-100 p-2 border-dotted border-blue-500 rounded border mb-1 text-sm ml-6';    
        case 'Appro automation':return 'bg-green-100 p-2 border-dotted border-green-500 rounded border mb-1 text-sm ml-6';
    default:return 'bg-gray-100 p-2 rounded border mb-1 text-sm';
    }   

}

    addInformationCard(stepData) { 
        console.log('addInformationCard()');
        const infoSection = document.querySelector('#informationSection');
        const card = document.createElement('div');
       // card.className = 'bg-white p-2 rounded border mb-1 text-sm';
       const style = this.styleCardByType(stepData.type);
       console.log('style:',style);
       card.className= style;
//       card.className = this.styleCardByType(stepData.type); //not calling the function
        // Create display text by iterating through all properties
        let displayText = ''; // used to be 'Saved' but seems redundant
        
        // Iterate through all properties in the object
        for (const [key, value] of Object.entries(stepData)) {
            if (key !== 'timestamp') {
                displayText += `, ${key}: ${value}`;
            }
        }
        const icon = this.getIconByType(stepData.type);
        card.textContent = icon + displayText;
        infoSection.appendChild(card);
        
        // Add to steps array
        this.steps.push(stepData);
        console.log('steps array:', this.steps);
    }

    // ========================================
    // CLIPBOARD OPERATIONS
    // ========================================
    populateFromClipboard(panel) {
        console.log('populateFromClipboard()');
                
        // Get clipboard items
        const tasks = getClipboardItems({ as: 'task' });
        const approfiles = getClipboardItems({ as: 'other' });
        const surveys = getClipboardItems({ as: 'survey' });
        
        console.log('Tasks from clipboard:', tasks);
        console.log('AppProfiles from clipboard:', approfiles);
        console.log('Surveys from clipboard:', surveys);
        
        
        // Populate task dropdown
        const taskSelect = panel.querySelector('#taskSelect');
        if (taskSelect) {
            console.log('Populating task dropdown with', tasks.length, 'items');
            this.addClipboardItemsToDropdown(tasks, taskSelect, 'task');
        }
        
        // Populate approfile dropdown
        const approfileSelect = panel.querySelector('#approfileSelect');
        if (approfileSelect) {
            console.log('Populating approfile dropdown with', approfiles.length, 'items');
            this.addClipboardItemsToDropdown(approfiles, approfileSelect, 'approfile');
        }

        // Populate surveys dropdown
        //<=========================  code needed in html dropdown  BUT editSurvey overwrites this
        const surveySelect = panel.querySelector('#surveySelect');
        if (surveySelect) {
            console.log('Populating survey dropdown with', surveys.length, 'items');
            this.addClipboardItemsToDropdown(surveys, surveySelect, 'approfile');

            // If only one survey in clipboard, auto-select it:
if (surveys.length === 1) {
    surveySelect.value = surveys[0].entity.id; 
    surveySelect.dispatchEvent(new Event('change'));
}
        }




        
    }

    addClipboardItemsToDropdown(items, selectElement, type) { 
        console.log('addClipboardItemsToDropdown()');
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

// ========================================
    // SUBCLASS INTERFACE (Database Operations)
    // Subclasses MUST implement these methods.
    // ========================================
    async handleSurveySubmit(e, panel) { 
        throw new Error("handleSurveySubmit must be implemented in subclass."); 
    }
    async handleQuestionSubmit(e, panel) { 
        throw new Error("handleQuestionSubmit must be implemented in subclass."); 
    }
    handleAddQuestion(e, panel) { 
        throw new Error("handleAddQuestion must be implemented in subclass."); 
    }
    async handleAnswerSubmit(e, panel) { 
        throw new Error("handleAnswerSubmit must be implemented in subclass."); 
    }
    handleAddAnswer(e, panel) { 
        throw new Error("handleAddAnswer must be implemented in subclass."); 
    }
    async handleTaskAutomationSubmit(e, panel) { 
        throw new Error("handleTaskAutomationSubmit must be implemented in subclass."); 
    }
    async handleRelationshipAutomationSubmit(e, panel) { 
        throw new Error("handleRelationshipAutomationSubmit must be implemented in subclass."); 
    }

}