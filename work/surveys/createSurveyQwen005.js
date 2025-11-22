
import { appState} from '../state/appState.js';
import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';
import{executeIfPermitted} from '../registry/executeIfPermitted.js';
import{showToast} from '../ui/showToast.js';

console.log('createSurveyQwen.js loaded');

// Export function as required by the module loading system
export function render(panel, query = {}) {
    const editor = new SurveyEditor();
    editor.render(panel, query);
}

const userId = appState.query.userId;

class SurveyEditor {
    constructor() {
        this.surveyId = null;
        this.questionId = null;
        this.answerId = null;
        this.steps = []; // Array of step objects: {type, id, text, questionNumber, answerNumber, automationNumber, ...}
   this.questionNumber =0;
   this.answerNumber = 0;
   this.automationsNumber = 0;
    }

    render(panel, query = {}) {
        console.log('createSurvey.render(', panel, query, ')');
        panel.innerHTML = this.getTemplateHTML();
        this.attachListeners(panel);
        
        // Setup clipboard update listener
        onClipboardUpdate(() => {
            this.populateFromClipboard(panel);
        });
    }

    getTemplateHTML() {console.log('getTemplateHTML()');
        return `
            <div id="surveyEditorDialog" class="survey-editor-dialogue relative z-10 flex flex-col h-full">
                <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 z-10 max-h-[90vh] overflow-y-auto">
                    <div class="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h3 class="text-xl font-semibold text-gray-900">Create Survey013</h3>
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
                            First enter a name for the survey which describes what it is. 
                            This name has to be unique, each survey should have a meaningful 
                            name that makes it easy to recognise if in a list of surveys. 
                            Then add a description. This description will be displayed to 
                            anyone who is going to respond to the survey.
                        </p>
                    </div>

                    <div class="bg-gray-200 p-6 space-y-6">
                        <div class="space-y-4">
                            <input id="surveyName" placeholder="Survey Name - must be unique." maxlength="128" required class="w-full p-2 border rounded" />
                            <p id="surveyNameCounter" class="text-xs text-gray-500">0/128 characters</p>

                            <textarea id="surveyDescription" placeholder="Survey Description" rows="3" maxlength="2000" required class="w-full p-2 min-h-80 border rounded"></textarea>
                            <p id="surveyDescriptionCounter" class="text-xs text-gray-500">0/2000 characters</p>

                            <button id="saveSurveyBtn" class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                                Enter name & description then click to save
                            </button>

                            <!-- Question Card -->
                            <div id="questionCard" class="bg-white p-4 rounded-lg border border-gray-300 opacity-50" style="pointer-events: none;">
                                <div class="flex justify-between items-center mb-3">
                                    <label class="block text-sm font-medium text-gray-700">Question</label>
                                </div>
                                <input type="text" id="questionText" placeholder="Enter question text" 
                                       class="w-full p-2 border rounded mb-3" maxlength="500" />
                                <p class="text-xs text-gray-500 mb-3"><span id="questionTextCounter">0</span>/500 characters</p>
                                
                                <div id="answersContainer" class="space-y-3">
                                    <!-- Answers will be added here -->
                                </div>
                                
                                <button type="button" id="saveQuestionBtn" class="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 opacity-50" style="pointer-events: none;">
                                    Save Question
                                </button>
                                <button type="button" id="addQuestionBtn" 
                                        class="mt-2 w-full text-sm bg-gray-200 hover:bg-gray-300 py-1 px-3 rounded opacity-50" style="pointer-events: none;" >
                                        + add another question
                                </button>
                            </div>

                            <!-- Answer Card -->
                            <div id="answerCard" class="bg-gray-50 p-3 rounded border opacity-30" style="pointer-events: none;">
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
                            </div>

                            <!-- Automations Card -->
                            <div id="automationsCard" class="bg-green-50 p-4 rounded-lg border border-green-300 opacity-20" style="pointer-events: none;">
                                <h4 class="font-medium text-green-800 mb-2">Automations</h4>
                                <p class="text-green-700 text-sm">
                                    When this answer is selected, the following actions will be performed:
                                </p>
                                
                                <!-- Assign Task Section -->
                                <div class="mt-4 p-3 bg-white rounded border mb-4">
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
                                </div>
                                
                                <!-- Relate to Category Section -->
                                <div class="p-3 bg-white rounded border">
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
                                        <button type="button" id="saveRelationshipAutomationBtn" class="bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700 opacity-50" style="pointer-events: none;">
                                            Save Relationship
                                        </button>
                                    </div>
                                </div>
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
        `;
    }

    attachListeners(panel) { console.log('attachListeners()');
        // Character counters
        panel.querySelector('#surveyName')?.addEventListener('input', e => {
            panel.querySelector('#surveyNameCounter').textContent = `${e.target.value.length}/128 characters`;
        });

        panel.querySelector('#surveyDescription')?.addEventListener('input', e => {
            panel.querySelector('#surveyDescriptionCounter').textContent = `${e.target.value.length}/2000 characters`;
        });

        // Question text counter
        panel.querySelector('#questionText')?.addEventListener('input', e => {
            panel.querySelector('#questionTextCounter').textContent = `${e.target.value.length}/500 characters`;
        });

        // Answer text counter
        panel.querySelector('#answerText')?.addEventListener('input', e => {
            panel.querySelector('#answerTextCounter').textContent = `${e.target.value.length}/200 characters`;
        });

        // Save survey button
        panel.querySelector('#saveSurveyBtn')?.addEventListener('click', (e) => {
            this.handleSurveySubmit(e, panel);
        });

        // Save question button
        panel.querySelector('#saveQuestionBtn')?.addEventListener('click', (e) => {
            this.handleQuestionSubmit(e, panel);
        });

        //NEW  10:19 Oct 6
                // Add question button   
                panel.querySelector('#addQuestionBtn')?.addEventListener('click', (e) => {
                    this.handleAddQuestion(e, panel);
                });
        // end new

        // Save answer button
        panel.querySelector('#saveAnswerBtn')?.addEventListener('click', (e) => {
            this.handleAnswerSubmit(e, panel);
        });

        // Add answer button
        panel.querySelector('#addAnswerBtn')?.addEventListener('click', (e) => {
            this.handleAddAnswer(e, panel);
        });

        // Save task automation button
        panel.querySelector('#saveTaskAutomationBtn')?.addEventListener('click', (e) => {
            this.handleTaskAutomationSubmit(e, panel);
        });

        // Save relationship automation button
        panel.querySelector('#saveRelationshipAutomationBtn')?.addEventListener('click', (e) => {
            this.handleRelationshipAutomationSubmit(e, panel);
        });

        // Close dialog
        panel.querySelector('[data-action="close-dialog"]')?.addEventListener('click', () => {
            panel.remove();
        });
    }
/*  changed 22:22 Oct 5 2025
    addInformationCard(message) {
        const infoSection = document.querySelector('#informationSection');
        const card = document.createElement('div');
        card.className = 'bg-white p-2 rounded border mb-1 text-sm';
        card.textContent = message;
        infoSection.appendChild(card);
        
        // Add to steps array
        this.steps.push(message);
        console.log('steps array:)',this.steps);
    }
*/
//new 22:22 Oct 5
addInformationCard(stepData) { console.log('addInformationCard()');
    const infoSection = document.querySelector('#informationSection');
    const card = document.createElement('div');
    card.className = 'bg-white p-2 rounded border mb-1 text-sm';
    
    // Create display text by iterating through all properties
    let displayText = `Saved`;
    
    // Iterate through all properties in the object
    for (const [key, value] of Object.entries(stepData)) {
        if (key !== 'timestamp') {
            displayText += `, ${key}: ${value}`;
        }
    }
    
    card.textContent = displayText;
    infoSection.appendChild(card);
    
    // Add to steps array
    this.steps.push(stepData);
    console.log('steps array:', this.steps);
}




//end new





    populateFromClipboard(panel) {console.log('populateFromClipboard()');
                
        // Get clipboard items
        const tasks = getClipboardItems({ as: 'task' });
        const approfiles = getClipboardItems({ as: 'other' });
        
        console.log('Tasks from clipboard:', tasks);
        console.log('AppProfiles from clipboard:', approfiles);
        
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
        
        //// Array of step objects: {type, id, text, questionNumber, answerNumber, automationNumber, ...}
        // Add information card about loaded items
        //this.addInformationCard(`Clipboard items loaded: ${tasks.length} tasks,  ${approfiles.length} approfiles`);
    // removed 21:37 Oct 5 because this message is very different to the survey structural messages
    }

    addClipboardItemsToDropdown(items, selectElement, type) { console.log('addClipboardItemsToDropdown()');
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

    async handleSurveySubmit(e, panel) { console.log('handleSurveySubmit()');
        e.preventDefault();
        
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
                
                // Enable question card
                const questionCard = panel.querySelector('#questionCard');
                questionCard.style.opacity = '1';
                questionCard.style.pointerEvents = 'auto';
                
                // Enable save question button
                const saveQuestionBtn = panel.querySelector('#saveQuestionBtn');
                saveQuestionBtn.style.opacity = '1';
                saveQuestionBtn.style.pointerEvents = 'auto';
                
                // Add information card // Array of step objects: {type, id, text, questionNumber, answerNumber, automationNumber, ...}
                this.addInformationCard({'type' :'survey' , 'id': `${result.id.substring(0, 8)}...`, 'name': `${result.name.substring(0, 30)}...`});
                
                saveBtn.textContent = 'Survey Header Saved';
                saveBtn.disabled = true; // Disable since header is saved
                
                showToast('Survey header saved successfully!');
            } catch (error) {
                showToast('Failed to create survey header: ' + error.message, 'error');
            }
            
            saveBtn.disabled = false;
        }
    }

    async handleQuestionSubmit(e, panel) { console.log('handleQuestionSubmit()');
        e.preventDefault();
        
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
        saveQuestionBtn.textContent = 'Saving Question...';  // this message stays - it should be cancelled after save confirmed
        
        try {
            // Save question to database
            const result = await executeIfPermitted(userId, 'createSurveyQuestion', {
                surveyId: this.surveyId,
                questionText: questionText
            });
            
            this.questionId = result.id;
            // Array of step objects: {type, id, text, questionNumber, answerNumber, automationNumber, ...}
            // Add information card  this.questionNumber =0;   this.answerNumber = 0;  this.automationsNumber = 0;
            this.questionNumber++;
            this.addInformationCard({'type':'Question' , 'number':this.questionNumber, 'id':`${result.id.substring(0, 8)}...`, 'name': `${result.name.substring(0, 30)}...`});            
            // Disable question input and save button
            panel.querySelector('#questionText').disabled = true;
            saveQuestionBtn.disabled = true;
            saveQuestionBtn.style.opacity = '0.5';
            
            // Enable answer card
            const answerCard = panel.querySelector('#answerCard');
            answerCard.style.opacity = '1';
            answerCard.style.pointerEvents = 'auto';
            
            // Enable save answer button
            const saveAnswerBtn = panel.querySelector('#saveAnswerBtn');
            saveAnswerBtn.style.opacity = '1';
            saveAnswerBtn.style.pointerEvents = 'auto';
            
            //new 11:00 oct 6
            // Enable add answer button
            const addQuestionBtn = panel.querySelector('#addQuestionBtn');
            addQuestionBtn.style.opacity = '1';
            addQuestionBtn.style.pointerEvents = 'auto';
            //end new


            // Enable add answer button
            const addAnswerBtn = panel.querySelector('#addAnswerBtn');
            addAnswerBtn.style.opacity = '1';
            addAnswerBtn.style.pointerEvents = 'auto';

            saveQuestionBtn.textContent = 'Question Saved';
            saveQuestionBtn.disabled = true; // Disable since header is saved


            
            showToast('Question saved successfully!');
        } catch (error) {
            showToast('Failed to save question: ' + error.message, 'error');
        }
        
        //saveQuestionBtn.disabled = false;
    }

    //NEW 10:23 Oct 6
    handleAddQuestion(e, panel) { console.log('handleAddQuestion()');
        // Reset answer fields for a new answer
        panel.querySelector('#questionText').value = '';
        panel.querySelector('#questionText').disabled = false;
        
        // Re-enable save answer button
        const saveAnswerBtn = panel.querySelector('#saveQuestionBtn');
        saveAnswerBtn.disabled = false;
        saveAnswerBtn.style.opacity = '1';
        saveAnswerBtn.style.pointerEvents = 'auto';

        
        showToast('Ready to add a new question');
    } //end new


//new 19:21 Oct 6  To reset answers and automations when clicked to add new question
/*
//NEW 10:23 Oct 6
handleAddQuestion(e, panel) {
    // Reset question fields for a new question
    panel.querySelector('#questionText').value = '';
    panel.querySelector('#questionText').disabled = false;
    
    // Reset answer fields to initial state
    panel.querySelector('#answerText').value = '';
    panel.querySelector('#answerText').disabled = true; // Disable since no question saved yet
    
    // Disable answer card
    const answerCard = panel.querySelector('#answerCard');
    answerCard.style.opacity = '0.3';
    answerCard.style.pointerEvents = 'none';
    
    // Disable save answer button
    const saveAnswerBtn = panel.querySelector('#saveAnswerBtn');
    saveAnswerBtn.style.opacity = '0.5';
    saveAnswerBtn.style.pointerEvents = 'none';
    saveAnswerBtn.disabled = true;
    saveAnswerBtn.textContent = 'Save Answer';
    
    // Disable add answer button
    const addAnswerBtn = panel.querySelector('#addAnswerBtn');
    addAnswerBtn.style.opacity = '0.5';
    addAnswerBtn.style.pointerEvents = 'none';
    addAnswerBtn.disabled = true;
    addAnswerBtn.textContent = '+ add another answer';
    
    // Disable automations card
    const automationsCard = panel.querySelector('#automationsCard');
    automationsCard.style.opacity = '0.2';
    automationsCard.style.pointerEvents = 'none';
    
    // Disable automation buttons
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
    
    // Re-enable save question button
    const saveQuestionBtn = panel.querySelector('#saveQuestionBtn');
    saveQuestionBtn.disabled = false;
    saveQuestionBtn.style.opacity = '1';
    saveQuestionBtn.style.pointerEvents = 'auto';
    saveQuestionBtn.textContent = 'Save Question';
    
    showToast('Ready to add a new question');
} //end new
*/
//end new



    async handleAnswerSubmit(e, panel) { console.log('handleAnswerSubmit()');
        e.preventDefault();
        
        const answerText = panel.querySelector('#answerText')?.value.trim();
        const saveAnswerBtn = panel.querySelector('#saveAnswerBtn');
        
        if (!answerText) {
            showToast('Answer text is required', 'error');
            return;
        }
        
        if (!this.questionId) {
            showToast('Please save the question first', 'error');
            return;
        }
        
        saveAnswerBtn.disabled = true;
        saveAnswerBtn.textContent = 'Saving Answer...'; // BUG this message stays - it should be cancelled after save confirmed
        
        try {
            // Save answer to database
            const result = await executeIfPermitted(userId, 'createSurveyAnswer', {
                questionId: this.questionId,
                answerText: answerText
            });
            
            this.answerId = result.id;
            // Array of step objects: {type, id, text, questionNumber, answerNumber, automationNumber, ...}
            // Add information card  this.questionNumber =0;   this.answerNumber = 0;  this.automationsNumber = 0;
            this.answerNumber++;
            this.addInformationCard({'type':'Answer','number':this.answerNumber,  'questionnumber':this.questionNumber , 'id':`${result.id.substring(0, 8)}...`, 'name': `${result.name.substring(0, 30)}...`});
            
            // Disable answer input and save button
            panel.querySelector('#answerText').disabled = true;
            saveAnswerBtn.disabled = true;
            saveAnswerBtn.style.opacity = '0.5';
            
            // Enable automations card
            const automationsCard = panel.querySelector('#automationsCard');
            automationsCard.style.opacity = '1';
            automationsCard.style.pointerEvents = 'auto';
            
            // Enable save task automation button
            const saveTaskAutomationBtn = panel.querySelector('#saveTaskAutomationBtn');
            saveTaskAutomationBtn.style.opacity = '1';
            saveTaskAutomationBtn.style.pointerEvents = 'auto';
            saveTaskAutomationBtn.disabled = false;
            
            // Enable save relationship automation button
            const saveRelationshipAutomationBtn = panel.querySelector('#saveRelationshipAutomationBtn');
            saveRelationshipAutomationBtn.style.opacity = '1';
            saveRelationshipAutomationBtn.style.pointerEvents = 'auto';
            saveRelationshipAutomationBtn.disabled = false;

            saveAnswerBtn.textContent = 'Answer Saved';
            saveAnswerBtn.disabled = true; // Disable since answer saved



            showToast('Answer saved successfully!');
        } catch (error) {
            showToast('Failed to save answer: ' + error.message, 'error');
        }
        
       // saveAnswerBtn.disabled = false;
    }

    handleAddAnswer(e, panel) { console.log('handleAddAnswer()');
        // Reset answer fields for a new answer
        panel.querySelector('#answerText').value = '';
        panel.querySelector('#answerText').disabled = false;
        
        // Re-enable save answer button
        const saveAnswerBtn = panel.querySelector('#saveAnswerBtn');
        saveAnswerBtn.disabled = false;
        saveAnswerBtn.style.opacity = '1';
        saveAnswerBtn.style.pointerEvents = 'auto';
        
        // Disable automations card
        const automationsCard = panel.querySelector('#automationsCard');
        automationsCard.style.opacity = '0.2';
        automationsCard.style.pointerEvents = 'none';
        
        // Disable automation buttons
        const saveTaskAutomationBtn = panel.querySelector('#saveTaskAutomationBtn');
        saveTaskAutomationBtn.disabled = true;
        saveTaskAutomationBtn.style.opacity = '0.5';
        saveTaskAutomationBtn.style.pointerEvents = 'none';
        
        const saveRelationshipAutomationBtn = panel.querySelector('#saveRelationshipAutomationBtn');
        saveRelationshipAutomationBtn.disabled = true;
        saveRelationshipAutomationBtn.style.opacity = '0.5';
        saveRelationshipAutomationBtn.style.pointerEvents = 'none';
        
        showToast('Ready to add a new answer');
    }

    async handleTaskAutomationSubmit(e, panel) {console.log('handleTaskAutomationSubmit()');
        e.preventDefault();
        
        const taskSelect = panel.querySelector('#taskSelect');
        const selectedTaskId = taskSelect?.value;
        //new 12:22 oct 6
        const selectedOption = taskSelect.options[taskSelect.selectedIndex];
        const cleanName = selectedOption?.textContent?.replace(' (clipboard)', '');
console.log('cleanName',cleanName);        // worked
 //    const selectedTaskOption = taskSelect?.options[taskSelect.selectedIndex];
//        const cleanTaskName = selectedTaskOption?.text?.replace(' (clipboard)', '') || 'unknown';
//console.log('cleanTaskName',cleanTaskName);//both worked
        if (!selectedTaskId) {
            showToast('Please select a task first', 'error');
            return;
        }
        
        const saveTaskAutomationBtn = panel.querySelector('#saveTaskAutomationBtn');
        saveTaskAutomationBtn.disabled = true;
        saveTaskAutomationBtn.textContent = 'Saving...';
        
        try { // surveyAnswerId, taskId, taskName, approfileId,relationship
            // Save task automation to database
            const result = await executeIfPermitted(userId, 'createSurveyAutomation', {
                surveyAnswerId: this.answerId,
                taskId: selectedTaskId,
                itemName:cleanName   // send taskName
            });
            // Array of step objects: {type, id, text, questionNumber, answerNumber, automationNumber, ...}
            // Add information card  this.questionNumber =0;   this.answerNumber = 0;  this.automationsNumber = 0;
            this.automationsNumber++;
            this.addInformationCard({'type':'Task automation','number':this.automationsNumber , 'answerNumber':this.answerNumber,  'questionNumber':this.questionNumber, 'id': `${result.id.substring(0, 8)}...`, 'name': `${result.name.substring(0, 30)}...`});
            
            showToast('Task automation saved successfully!');
        } catch (error) {
            showToast('Failed to save task automation: ' + error.message, 'error');
        }
        
        saveTaskAutomationBtn.disabled = false;
        saveTaskAutomationBtn.textContent = 'Save Task';
    }

    async handleRelationshipAutomationSubmit(e, panel) {console.log('handleRelationshipAutomationSubmit()');
        e.preventDefault();
        
        const approfileSelect = panel.querySelector('#approfileSelect');
        const relationshipSelect = panel.querySelector('#relationshipSelect');
        
        const selectedApproleId = approfileSelect?.value;
        //const cleanName = approfileSelect?.text?.replace(' (clipboard)', '');
//replaced new 12:22 oct 6
const selectedOption = approfileSelect.options[approfileSelect.selectedIndex];  //
//        const selectedOption = approfileSelect.options[taskSelect.selectedIndex];
        const cleanName = selectedOption?.textContent?.replace(' (clipboard)', '');//name= 'select an approfile'  !!! this is the defualt prior to selection
console.log('cleanName',cleanName);       

        const selectedRelationship = relationshipSelect?.value;
        
        if (!selectedApproleId) {
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
        
        try {  
            // Save relationship automation to database
            const result = await executeIfPermitted(userId, 'createSurveyAutomation', {
                surveyAnswerId: this.answerId,
                approfileId: selectedApproleId,
                itemName:cleanName,// could send appro name
                relationship: selectedRelationship
            });
            
            // Add information card
            // Array of step objects: {type, id, text, questionNumber, answerNumber, automationNumber, ...}
            // Add information card  this.questionNumber =0;   this.answerNumber = 0;  this.automationsNumber = 0;
            this.automationsNumber++;
            this.addInformationCard({'type':'Appro automation', 'number':this.automationsNumber, 'answerNumber':this.answerNumber,  'questionNumber':this.questionNumber ,'id': `${result.id.substring(0, 8)}...`, 'name': `${result.name.substring(0, 30)}...` , 'relationship': `${result.relationship.substring(0, 8)}...`});            
            showToast('Relationship automation saved successfully!');
        } catch (error) {
            showToast('Failed to save relationship automation: ' + error.message, 'error');
        }
        
        saveRelationshipAutomationBtn.disabled = false;
        saveRelationshipAutomationBtn.textContent = 'Save Relationship';
    }
}
