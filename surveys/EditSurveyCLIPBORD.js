
### Summary Structure with Interactive Controls

```javascript
renderSurveyStructure(survey) {
    let html = '';
    
    // Survey level actions
    html += `
        <div class="survey-item mb-4 p-3 bg-blue-100 rounded border border-blue-300">
            <div class="flex justify-between items-center">
                <strong>Survey: ${survey.name}</strong>
                <button class="edit-item-btn text-blue-700 hover:text-blue-900 text-sm font-medium"
                        data-type="survey" 
                        data-id="${survey.surveyId}">
                    Edit Header
                </button>
            </div>
        </div>
    `;
    
    survey.questions.forEach(question => {
        html += `
            <div class="question-item mb-3 p-3 bg-yellow-50 border rounded border-yellow-300 ml-2" 
                 data-question-id="${question.questionId}">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <strong>Q${question.questionNumber}:</strong>
                            ${question.text}
                        </div>
                    </div>
                    <div class="flex gap-1 ml-2">
                        <button class="edit-item-btn text-yellow-700 hover:text-yellow-900 text-xs"
                                data-type="question" 
                                data-id="${question.questionId}">
                            Edit
                        </button>
                        <button class="delete-item-btn text-red-600 hover:text-red-800 text-xs"
                                data-type="question" 
                                data-id="${question.questionId}">
                            Delete
                        </button>
                    </div>
                </div>
        `;
        
        question.answers.forEach(answer => {
            html += `
                <div class="answer-item mt-2 p-2 bg-orange-50 rounded border border-orange-300 ml-4" 
                     data-answer-id="${answer.answerId}">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <div class="flex items-center gap-2">
                                <em>A${answer.answerNumber}:</em>
                                ${answer.text}
                            </div>
                        </div>
                        <div class="flex gap-1 ml-2">
                            <button class="edit-item-btn text-orange-700 hover:text-orange-900 text-xs"
                                    data-type="answer" 
                                    data-id="${answer.answerId}">
                                Edit
                            </button>
                            <button class="delete-item-btn text-red-600 hover:text-red-800 text-xs"
                                    data-type="answer" 
                                    data-id="${answer.answerId}">
                                Delete
                            </button>
                            <button class="add-automation-btn text-green-700 hover:text-green-900 text-xs"
                                    data-type="automation" 
                                    data-answer-id="${answer.answerId}">
                                + Auto
                            </button>
                        </div>
                    </div>
            `;
            
            if (answer.automations && answer.automations.length > 0) {
                answer.automations.forEach(auto => {
                    html += `
                        <div class="automation-item mt-1 p-1 bg-green-100 rounded border border-green-300 ml-4">
                            <div class="flex justify-between items-center">
                                <div class="text-xs">
                                    ${auto.taskHeaderId ? 
                                        `🔄 Task: ${auto.name || 'Unknown'}` : 
                                        `🪪 ${auto.approIsName || 'Respondent'} → ${auto.relationship} → ${auto.ofApproName}`
                                    }
                                </div>
                                <div class="flex gap-1">
                                    <button class="edit-item-btn text-green-700 hover:text-green-900 text-xs"
                                            data-type="automation" 
                                            data-id="${auto.automationId}">
                                        Edit
                                    </button>
                                    <button class="delete-item-btn text-red-600 hover:text-red-800 text-xs"
                                            data-type="automation" 
                                            data-id="${auto.automationId}">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                });
            }
            
            html += '</div>'; // close answer-item
        });
        
        html += '</div>'; // close question-item
    });
    
    return html;
}
```

### Dynamic Edit Panel System

```javascript
// Method to load edit form based on selection
loadEditForm(panel, itemType, itemId) {
    const editForm = panel.querySelector('#editForm');
    const editPlaceholder = panel.querySelector('#editPlaceholder');
    const editActions = panel.querySelector('#editActions');
    
    // Hide placeholder, show form and actions
    editPlaceholder.classList.add('hidden');
    editForm.classList.remove('hidden');
    editActions.classList.remove('hidden');
    
    let formHTML = '';
    
    switch(itemType) {
        case 'question':
            const question = this.findQuestionById(itemId);
            formHTML = this.getQuestionEditForm(question);
            this.currentEdit = { type: 'question', id: itemId, data: question };
            break;
            
        case 'answer':
            const answer = this.findAnswerById(itemId);
            formHTML = this.getAnswerEditForm(answer);
            this.currentEdit = { type: 'answer', id: itemId, data: answer };
            break;
            
        case 'automation':
            const automation = this.findAutomationById(itemId);
            formHTML = this.getAutomationEditForm(automation);
            this.currentEdit = { type: 'automation', id: itemId, data: automation };
            break;
            
        case 'survey':
            formHTML = this.getSurveyHeaderEditForm();
            this.currentEdit = { type: 'survey', id: this.editSurveyId };
            break;
    }
    
    editForm.innerHTML = formHTML;
    
    // Re-attach clipboard integration for automation forms
    if (itemType === 'automation') {
        this.initClipboardIntegration(panel);
    }
    
    // Attach form-specific event listeners
    this.attachEditFormListeners(panel);
}

getQuestionEditForm(question) {
    return `
        <h5 class="font-medium mb-3">Edit Question</h5>
        <div class="space-y-3">
            <textarea class="w-full p-2 border rounded" rows="3" maxlength="500" 
                      id="editQuestionText">${question.text || ''}</textarea>
            <p class="text-xs text-gray-500"><span id="editQuestionCounter">${question.text?.length || 0}</span>/500 characters</p>
            
            <div class="flex items-center gap-2">
                <label class="text-sm">
                    <input type="checkbox" id="editQuestionRequired" ${question.required ? 'checked' : ''}>
                    Required
                </label>
                <label class="text-sm">
                    <input type="checkbox" id="editQuestionVisible" ${question.visible !== false ? 'checked' : ''}>
                    Visible
                </label>
            </div>
        </div>
    `;
}

getAnswerEditForm(answer) {
    return `
        <h5 class="font-medium mb-3">Edit Answer</h5>
        <div class="space-y-3">
            <input type="text" class="w-full p-2 border rounded" maxlength="200" 
                   id="editAnswerText" value="${answer.text || ''}">
            <p class="text-xs text-gray-500"><span id="editAnswerCounter">${answer.text?.length || 0}</span>/200 characters</p>
        </div>
    `;
}

getAutomationEditForm(automation) {
    return `
        <h5 class="font-medium mb-3">Edit Automation</h5>
        <div class="space-y-4">
            ${automation.taskHeaderId ? this.getTaskAutomationForm(automation) : ''}
            ${automation.relationship ? this.getRelationshipAutomationForm(automation) : ''}
        </div>
    `;
}

getTaskAutomationForm(automation) {
    return `
        <div class="p-3 bg-blue-50 rounded border">
            <h6 class="font-medium text-blue-800 mb-2">Task Assignment</h6>
            <select id="editTaskSelect" class="w-full p-2 border rounded">
                <option value="">Select a task</option>
                <!-- Options will be populated by clipboard -->
            </select>
            <input type="hidden" id="editTaskHeaderId" value="${automation.taskHeaderId || ''}">
        </div>
    `;
}

getRelationshipAutomationForm(automation) {
    return `
        <div class="p-3 bg-green-50 rounded border">
            <h6 class="font-medium text-green-800 mb-2">Relationship</h6>
            <select id="editApprofileSelect" class="w-full p-2 border rounded mb-2">
                <option value="">Select an approfile</option>
                <!-- Options will be populated by clipboard -->
            </select>
            <select id="editRelationshipSelect" class="w-full p-2 border rounded">
                <option value="">Select relationship</option>
                <option value="member" ${automation.relationship === 'member' ? 'selected' : ''}>member</option>
                <option value="customer" ${automation.relationship === 'customer' ? 'selected' : ''}>customer</option>
                <option value="explanation" ${automation.relationship === 'explanation' ? 'selected' : ''}>explanation</option>
            </select>
            <input type="hidden" id="editApproIsId" value="${automation.approIsId || ''}">
            <input type="hidden" id="editOfApproId" value="${automation.ofApproId || ''}">
        </div>
    `;
}
```

### Event Handling for New Design

```javascript
attachListeners(panel) {
    // Character counters for main header
    panel.addEventListener('input', (e) => {
        if (e.target.id === 'surveyName') {
            panel.querySelector('#surveyNameCounter').textContent = `${e.target.value.length}/128 characters`;
        } else if (e.target.id === 'surveyDescription') {
            panel.querySelector('#surveyDescriptionCounter').textContent = `${e.target.value.length}/2000 characters`;
        }
    });

    // Main event delegation
    panel.addEventListener('click', (e) => {
        // Edit item buttons
        if (e.target.classList.contains('edit-item-btn')) {
            e.preventDefault();
            const type = e.target.dataset.type;
            const id = e.target.dataset.id;
            this.loadEditForm(panel, type, id);
            return;
        }
        
        // Delete item buttons
        if (e.target.classList.contains('delete-item-btn')) {
            e.preventDefault();
            const type = e.target.dataset.type;
            const id = e.target.dataset.id;
            this.confirmDeleteItem(panel, type, id);
            return;
        }
        
        // Add automation buttons
        if (e.target.classList.contains('add-automation-btn')) {
            e.preventDefault();
            const answerId = e.target.dataset.answerId;
            this.loadNewAutomationForm(panel, answerId);
            return;
        }
        
        // Add question button
        if (e.target.id === 'addQuestionBtn') {
            e.preventDefault();
            this.loadNewQuestionForm(panel);
            return;
        }
        
        // Save survey header
        if (e.target.id === 'saveSurveyHeaderBtn') {
            e.preventDefault();
            this.handleSurveyHeaderSave(panel);
            return;
        }
        
        // Edit panel actions
        if (e.target.id === 'saveEditBtn') {
            e.preventDefault();
            this.handleEditSave(panel);
            return;
        }
        
        if (e.target.id === 'cancelEditBtn') {
            e.preventDefault();
            this.cancelEdit(panel);
            return;
        }
        
        // Close dialog
        if (e.target.closest('[data-action="close-dialog"]')) {
            panel.remove();
            return;
        }
    });
}
```

## Benefits of This Approach

1. **Scalable**: Works equally well for 1 question or 50 questions
2. **Intuitive**: Users see the entire structure and can navigate freely
3. **Focused**: Only one thing is editable at a time, reducing confusion
4. **Efficient**: No wasted screen space on disabled panels
5. **Maintainable**: Clear separation between navigation and editing
6. **Responsive**: Works well on different screen sizes with the grid layout

This design transforms your edit module from a linear creation workflow into a proper editing interface that can handle complex survey structures while remaining user-friendly.