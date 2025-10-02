<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dynamic Survey Trigger Editor</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; background-color: #f4f7f9; }
        input[type="text"], select {
            padding: 0.5rem;
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
            transition: border-color 0.15s ease-in-out;
        }
        input[type="text"]:focus, select:focus {
            border-color: #6366f1;
            outline: none;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
        }
        .question-card {
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
        }
        .answer-block {
            transition: all 0.2s ease-in-out;
        }
    </style>
</head>
<body class="p-8">

    <div id="app" class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold mb-6 text-gray-800">Survey Action Editor</h1>
        <p class="mb-6 text-gray-600">Define the actions (Task Assignment or Profile Relationship) that execute when a user selects an answer.</p>
        
        <div id="editor-container" class="space-y-6">
            <!-- Content will be rendered here -->
        </div>

        <div class="mt-8 pt-4 border-t border-gray-300 flex justify-end">
            <button id="save-button" class="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-150 shadow-lg">
                Save Survey Blueprint (View JSON)
            </button>
        </div>
        
        <!-- Mock Modal for Output -->
        <div id="output-modal" class="hidden fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div class="bg-white rounded-lg p-6 w-full max-w-2xl shadow-2xl">
                <h2 class="text-xl font-bold mb-4 text-indigo-600">Generated Survey Blueprint JSON</h2>
                <pre id="output-json" class="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm text-gray-700 whitespace-pre-wrap"></pre>
                <button onclick="document.getElementById('output-modal').classList.add('hidden')" class="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">Close</button>
            </div>
        </div>
    </div>

    <script type="module">
        // Mock Data for the Admin Editor Environment
        const MOCK_DATA = {
            availableTargets: [
                { id: 'appro-uuid-1', name: 'Volunteer Group A' },
                { id: 'appro-uuid-2', name: 'Internal Project Team' },
                { id: 'appro-uuid-3', name: 'Mentorship Program' },
            ],
            availableTasks: [
                { id: 'task-uuid-101', name: 'Complete KYC Documentation' },
                { id: 'task-uuid-102', name: 'Attend Onboarding Session' },
                { id: 'task-uuid-103', name: 'Review Code of Conduct' },
            ],
            initialSurvey: {
                title: 'Onboarding Quiz',
                questions: [
                    {
                        question_text: 'Are you interested in volunteering for local events?',
                        answers: [
                            {
                                answer_text: 'Yes, I want to join!',
                                trigger: {
                                    type: 'RELATIONSHIP',
                                    approfile_of: 'appro-uuid-1',
                                    relationship: 'member'
                                }
                            },
                            {
                                answer_text: 'Not right now.',
                                trigger: { type: 'NONE' }
                            }
                        ]
                    },
                    {
                        question_text: 'Have you completed your mandatory documentation?',
                        answers: [
                            {
                                answer_text: 'No, I need to do that.',
                                trigger: {
                                    type: 'TASK',
                                    task_id: 'task-uuid-101'
                                }
                            },
                            {
                                answer_text: 'Yes, all done.',
                                trigger: { type: 'NONE' }
                            }
                        ]
                    }
                ]
            }
        };

        class SurveyEditor {
            constructor(containerId, mockData) {
                this.container = document.getElementById(containerId);
                this.availableTargets = mockData.availableTargets;
                this.availableTasks = mockData.availableTasks;
                this.currentSurvey = JSON.parse(JSON.stringify(mockData.initialSurvey)); // Deep copy
                this.init();
            }

            init() {
                this.render();
                this.attachEventListeners();
            }

            // --- Rendering Logic ---

            render() {
                this.container.innerHTML = this.currentSurvey.questions.map((q, qIndex) => `
                    <div class="question-card bg-white p-5 rounded-xl border border-gray-200">
                        <h3 class="text-lg font-semibold mb-3">Q${qIndex + 1}: ${q.question_text}</h3>
                        <div class="space-y-4">
                            ${q.answers.map((a, aIndex) => this.createAnswerElement(a, qIndex, aIndex)).join('')}
                        </div>
                    </div>
                `).join('');
            }

            createAnswerElement(answer, qIndex, aIndex) {
                const triggerType = answer.trigger.type;
                
                let functionName = '';
                if (triggerType === 'RELATIONSHIP') functionName = 'createApprofileRelation';
                if (triggerType === 'TASK') functionName = 'assignTask';

                return `
                    <div class="answer-block flex flex-col gap-2 p-3 bg-gray-50 rounded-lg border-l-4 border-indigo-500">
                        <!-- Answer Text Input -->
                        <div class="flex items-center gap-3">
                            <span class="text-sm text-gray-700 font-medium w-20">Answer:</span>
                            <input 
                                data-q="${qIndex}" 
                                data-a="${aIndex}" 
                                data-field="answer_text" 
                                type="text" 
                                placeholder="Answer Text" 
                                value="${answer.answer_text}" 
                                class="w-full"
                            >
                        </div>
                        
                        <div class="flex items-center gap-3">
                            <span class="text-sm text-gray-700 font-medium w-20">Trigger:</span>
                            <!-- Trigger Type Selector -->
                            <select 
                                data-q="${qIndex}" 
                                data-a="${aIndex}" 
                                data-field="type" 
                                data-target-path="trigger"
                                class="p-2 border rounded-lg trigger-type-select w-48 bg-white"
                            >
                                <option value="NONE" ${triggerType === 'NONE' ? 'selected' : ''}>No Action</option>
                                <option value="TASK" ${triggerType === 'TASK' ? 'selected' : ''}>Assign Task</option>
                                <option value="RELATIONSHIP" ${triggerType === 'RELATIONSHIP' ? 'selected' : ''}>Create Relationship</option>
                            </select>
                            ${functionName ? `<span class="text-xs text-indigo-400">(${functionName})</span>` : ''}
                        </div>
                        
                        <!-- Dynamic Configuration Container -->
                        <div 
                            data-q="${qIndex}" 
                            data-a="${aIndex}" 
                            data-target-path="trigger"
                            class="dynamic-target-container p-3 border border-dashed rounded-lg mt-2 ${triggerType === 'NONE' ? 'bg-gray-200' : 'bg-white'}"
                        >
                            ${this.getDynamicTargetHTML(answer.trigger, triggerType)}
                        </div>
                    </div>`;
            }

            getDynamicTargetHTML(triggerData, triggerType) {
                if (triggerType === 'NONE') {
                    return '<p class="text-sm text-gray-500 text-center py-2">No database action is configured for this answer.</p>';
                }

                // --- RELATIONSHIP FIELDS ---
                if (triggerType === 'RELATIONSHIP') {
                    const approfileOptions = this.availableTargets.map(t => 
                        `<option value="${t.id}" ${t.id === triggerData.approfile_of ? 'selected' : ''}>${t.name} (${t.id})</option>`
                    ).join('');
                    
                    const relationshipOptions = [
                        'member', 'manager', 'partner', 'associate'
                    ].map(r => 
                        `<option value="${r}" ${r === triggerData.relationship ? 'selected' : ''}>${r}</option>`
                    ).join('');

                    // Add the 'db_function' to the blueprint explicitly
                    const dbFunctionInput = `<input type="hidden" data-field="db_function" value="createApprofileRelation">`;

                    return `
                        ${dbFunctionInput}
                        <h5 class="font-medium text-sm text-indigo-700 mb-2">Create Profile Relation:</h5>
                        
                        <label class="block text-xs font-medium text-gray-600">Target Approfile (of_approfile):</label>
                        <select data-field="approfile_of" class="w-full p-2 border rounded-lg bg-white mb-2">
                            <option value="">Select Approfile Group</option>
                            ${approfileOptions}
                        </select>

                        <label class="block text-xs font-medium text-gray-600">Relationship Type:</label>
                        <select data-field="relationship" class="w-full p-2 border rounded-lg bg-white">
                            ${relationshipOptions}
                        </select>
                    `;
                }

                // --- TASK FIELDS ---
                if (triggerType === 'TASK') {
                    const taskOptions = this.availableTasks.map(t => 
                        `<option value="${t.id}" ${t.id === triggerData.task_id ? 'selected' : ''}>${t.name} (${t.id})</option>`
                    ).join('');
                    
                    // Add the 'db_function' to the blueprint explicitly
                    const dbFunctionInput = `<input type="hidden" data-field="db-function" value="assignTask">`;

                    return `
                        ${dbFunctionInput}
                        <h5 class="font-medium text-sm text-green-700 mb-2">Assign Task:</h5>
                        
                        <label class="block text-xs font-medium text-gray-600">Select Task to Assign:</label>
                        <select data-field="task_id" class="w-full p-2 border rounded-lg bg-white">
                            <option value="">Select Task</option>
                            ${taskOptions}
                        </select>
                    `;
                }
                
                return '';
            }

            // --- Event Handling and State Update ---

            attachEventListeners() {
                // Use event delegation on the main container for efficiency
                this.container.addEventListener('change', this.handleInputChange.bind(this));
                this.container.addEventListener('input', this.handleInputChange.bind(this));
                
                document.getElementById('save-button').addEventListener('click', this.handleSave.bind(this));
            }

            handleInputChange(event) {
                const target = event.target;
                const qIndex = target.dataset.q;
                const aIndex = target.dataset.a;
                const field = target.dataset.field;
                const value = target.value;

                if (qIndex === undefined || aIndex === undefined || field === undefined) {
                    return; // Not a managed input
                }
                
                const answer = this.currentSurvey.questions[qIndex].answers[aIndex];

                // Check if the field is part of the root answer object or the nested 'trigger' object
                if (field === 'answer_text') {
                    answer[field] = value;
                } else if (target.dataset.targetPath === 'trigger' || field !== 'answer_text') {
                    
                    // CRITICAL LOGIC: If the type changes, we reset the trigger object
                    if (field === 'type') {
                        let newTrigger = { type: value };
                        if (value === 'RELATIONSHIP') {
                            newTrigger = { type: 'RELATIONSHIP', approfile_of: '', relationship: '' };
                        } else if (value === 'TASK') {
                            newTrigger = { type: 'TASK', task_id: '' };
                        }
                        answer.trigger = newTrigger;
                        
                        // Re-render the affected answer block to show new dynamic fields
                        this.render(); 
                        return; // Exit after re-render
                    }

                    // Otherwise, update the specific field within the existing trigger object
                    answer.trigger[field] = value;
                }
                
                // FIXED: Using string concatenation to avoid template literal conflict.
                console.log("State updated: Q" + qIndex + ", A" + aIndex + ", " + field + " = " + value, answer);
            }

            // --- Output and Blueprint Generation ---
            
            handleSave() {
                // Final cleanup is handled by the JSON.stringify replacement function if needed,
                // but for now, we show the full, structured object.
                const json = JSON.stringify(this.currentSurvey, null, 2);

                document.getElementById('output-json').textContent = json;
                document.getElementById('output-modal').classList.remove('hidden');
                console.log("Final Survey Blueprint:", this.currentSurvey);
            }
        }

        window.onload = () => {
            new SurveyEditor('editor-container', MOCK_DATA);
        };
    </script>
</body>
</html>
