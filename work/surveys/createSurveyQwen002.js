// ./surveys/createSurevey.js
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

class SurveyEditor {
    constructor() {
        this.surveyId = null;
        this.questionId = null;
        this.steps = []; // To track the steps
    }

    render(panel, query = {}) {
        console.log('SurveyEditor.render(', panel, query, ')');
        panel.innerHTML = this.getTemplateHTML();
        this.attachListeners(panel);
        
        // Setup clipboard update listener
        onClipboardUpdate(() => {
            this.populateFromClipboard(panel);
        });
    }

    getTemplateHTML() {
        return `
            <div id="surveyEditorDialog" class="survey-editor-dialogue relative z-10 flex flex-col h-full">
                <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 z-10 max-h-[90vh] overflow-y-auto">
                    <div class="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h3 class="text-xl font-semibold text-gray-900">Create Survey 02</h3>
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
                                
                                <button type="button" id="addAnswerBtn" 
                                        class="mt-2 text-sm bg-gray-200 hover:bg-gray-300 py-1 px-3 rounded">
                                        + Add Answer
                                </button>
                                
                                <button type="button" id="saveQuestionBtn" class="w-full mt-2 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 opacity-50" style="pointer-events: none;">
                                    Save Question
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
                                
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <!-- Task Dropdown -->
                                    <div class="space-y-1">
                                        <label class="block text-xs font-medium text-gray-600">Task (optional)</label>
                                        <select id="taskSelect" 
                                                class="w-full p-2 border border-gray-300 rounded text-sm">
                                            <option value="">Select a task</option>
                                        </select>
                                    </div>
                                    
                                    <!-- Approfile Dropdown -->
                                    <div class="space-y-1">
                                        <label class="block text-xs font-medium text-gray-600">Approfile (optional)</label>
                                        <select id="approfileSelect" 
                                                class="w-full p-2 border border-gray-300 rounded text-sm">
                                            <option value="">Select an approfile</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="mt-2">
                                    <label class="block text-xs font-medium text-gray-600">Relationship Type</label>
                                    <input type="text" id="relationshipType" placeholder="e.g., member, attendee" 
                                           class="w-full p-2 border rounded text-sm" maxlength="50" />
                                </div>
                            </div>

                            <!-- Automations Card -->
                            <div id="automationsCard" class="bg-green-50 p-4 rounded-lg border border-green-300 opacity-20" style="pointer-events: none;">
                                <h4 class="font-medium text-green-800 mb-2">Automations</h4>
                                <p class="text-green-700 text-sm">
                                    When this answer is selected, the following actions will be performed:
                                </p>
                                <div id="automationsList" class="mt-2 space-y-2">
                                    <!-- Automations will be listed here -->
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

    attachListeners(panel) {
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

        // Close dialog
        panel.querySelector('[data-action="close-dialog"]')?.addEventListener('click', () => {
            panel.remove();
        });
    }

    addInformationCard(message) {
        const infoSection = document.querySelector('#informationSection');
        const card = document.createElement('div');
        card.className = 'bg-white p-2 rounded border mb-1 text-sm';
        card.textContent = message;
        infoSection.appendChild(card);
        
        // Add to steps array
        this.steps.push(message);
    }

    populateFromClipboard(panel) {
        console.log('SurveyEditor.populateFromClipboard()');
        
        const informationFeedback = panel.querySelector('[data-survey="information-feedback"]');
        informationFeedback.innerHTML = '';
        
        // Get clipboard items
        const tasks = getClipboardItems({ as: 'task' });
        const approfiles = getClipboardItems({ as: 'approfile' });
        
        // Populate task dropdown
        const taskSelect = panel.querySelector('#taskSelect');
        if (taskSelect) {
            this.addClipboardItemsToDropdown(tasks, taskSelect, 'task');
        }
        
        // Populate approfile dropdown
        const approfileSelect = panel.querySelector('#approfileSelect');
        if (approfileSelect) {
            this.addClipboardItemsToDropdown(approfiles, approfileSelect, 'approfile');
        }
        
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

    async handleSurveySubmit(e, panel) {
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
                
                // Add information card
                this.addInformationCard(`Saved name & description - id: ${result.id.substring(0, 8)}...`);
                
                saveBtn.textContent = 'Survey Header Saved';
                saveBtn.disabled = true; // Disable since header is saved
                
                showToast('Survey header saved successfully!');
            } catch (error) {
                showToast('Failed to create survey header: ' + error.message, 'error');
            }
            
            saveBtn.disabled = false;
        }
    }

    async handleQuestionSubmit(e, panel) {
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
        saveQuestionBtn.textContent = 'Saving Question...';
        
        try {
            // Save question to database
            const result = await executeIfPermitted(userId, 'createSurveyQuestion', {
                surveyId: this.surveyId,
                questionText: questionText
            });
            
            this.questionId = result.id;
            
            // Add information card
            this.addInformationCard(`Question saved - id: ${result.id.substring(0, 8)}...`);
            
            // Disable question input and save button
            panel.querySelector('#questionText').disabled = true;
            saveQuestionBtn.disabled = true;
            saveQuestionBtn.style.opacity = '0.5';
            
            // Enable answer card
            const answerCard = panel.querySelector('#answerCard');
            answerCard.style.opacity = '1';
            answerCard.style.pointerEvents = 'auto';
            
            showToast('Question saved successfully!');
        } catch (error) {
            showToast('Failed to save question: ' + error.message, 'error');
        }
        
        saveQuestionBtn.disabled = false;
    }
}