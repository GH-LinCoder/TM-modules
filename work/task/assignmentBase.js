//  ./utils/assignmentBase.js  (to be used by assignTask & assignSurvey)
//18:40 Nov 21 this file has been copied into tasks to keep all task related together


import { appState } from '../../state/appState.js';
//import { executeIfPermitted } from '../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { petitionBreadcrumbs } from '../../ui/breadcrumb.js';
import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';
import { resolveSubject, detectContext, applyPresentationRules } from '../../utils/contextSubjectHideModules.js';

console.log('assignmentBase.js loaded');
// need to accept a parameter for type:  'task' || 'survey'
export class AssignmentBase {
  constructor(assignmentType) {
    this.assignmentType = assignmentType; // 'task' or 'survey' now
    console.log ('assignmentType:', assignmentType);
    this.subject = null;
    this.subjectId = null;
    this.subjectName = null;
    this.subjectType = null;
    this.userId = appState.query.userId;
    this.panelEl = null; // not used?
  }

  // Resolve current subject from clipboard or appState
  resolveSubject() {
    const subject = resolveSubject();
    this.subjectId = subject.id;
    this.subjectName = subject.name;
    this.subjectType = subject.type;
    return subject;
  }

  // Detect module context (myDash vs adminDash)
  detectContext(panel) {
    return detectContext(panel);
  }

  // Apply presentation rules based on context
  applyPresentationRules(panel) {
    return applyPresentationRules(panel);
  }

  // Get template HTML with consistent structure
  getTemplateHTML(title = 'Assignment', instructions = []) {
    return `
      <div id="assignmentDialog" class="assignment-dialogue relative z-10 flex flex-col h-full">
        <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 z-10 max-h-[90vh] overflow-y-auto">
          
          <!-- HEADER -->
          <div class="p-6 border-b border-gray-200 flex justify-between items-center">
            <h3 class="text-xl font-semibold text-gray-900">${title}</h3>
            <button data-action="close-dialog" class="text-gray-500 hover:text-gray-700" aria-label="Close">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <!-- INSTRUCTIONS -->
          <div class="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 class="font-medium text-blue-800 mb-2">Instructions:</h4>
            <ul class="list-disc list-inside mt-2 text-sm text-blue-700">
              ${instructions.map(instruction => `<li>${instruction}</li>`).join('')}
            </ul>
          </div>

          <!-- ASSIGNMENT FORM -->
          <div class="bg-gray-200 p-6 space-y-6">

    <div class="space-y-2">
              <label for="dropdown001" class="block text-sm font-medium text-gray-700">Select Task</label>
              <select id="dropdown001" data-form="dropdown001" class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
                <option value="">Select a task</option>
              </select>
            </div>

              <!-- ITEM SELECT -->
              <div class="space-y-2">
                <label for="dropdown002" class="block text-sm font-medium text-gray-700">Select Student</label>
                <select id="dropdown002" data-form="dropdown002" class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select an item from clipboard...</option>
                </select>
              </div>

            <div class="space-y-4">
              <!-- SUBJECT SELECT -->
              <div class="space-y-2">
                <label for="dropdown003" class="block text-sm font-medium text-gray-700">Select Manager</label>
                <select id="dropdown003" data-form="dropdown003" class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select a subject from clipboard...</option>
                </select>
              </div>



              <!-- ASSIGN BUTTON -->
              <button id="assignBtn" class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                Assign Item
              </button>
            </div>

            <!-- INFORMATION FEEDBACK -->
            <div class="bg-green-100 flex flex-col md:flex-row justify-center gap-4 pt-4 border-t border-gray-200">
              <p class="text-lg font-bold">Information:</p>
              <div id="informationSection" class="w-full">
                <!-- Information cards will be added here -->
              </div>
            </div>
          </div>
        </div>
      </div>
      
      ${petitionBreadcrumbs()}
    `;
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

  // Populate dropdowns from clipboard
  populateFromClipboard(panel) {
    console.log('populateFromClipboard()assignmentType:', this.assignmentType);
    console.log('DEBUG assignmentType==:', typeof this.assignmentType, JSON.stringify(this.assignmentType));

    // if type='task' then collect 'student' , 'manager' , 'task'
    //else if type='survey' collect 'respondent' || 'other' , 'survey'
    // Get clipboard items
let dropdown01Items, dropdown02Items, dropdown03Items;
if (this.assignmentType=='task') { // if use === the value does not update from clipboard
    dropdown01Items = getClipboardItems({as:'task'});
    dropdown02Items = getClipboardItems({ as: 'student'});
    dropdown03Items  = getClipboardItems({as:'manager'});
} else
if (this.assignmentType=='survey') {
    dropdown01Items = getClipboardItems({as:'survey'});
    dropdown02Items = getClipboardItems({ as: 'respondent' });
    dropdown03Items  = []; // not used in surveys
    
}
console.log('after if():', this.assignmentType);
//    const subjects = getClipboardItems({ as: 'subject', type: 'app-human' });
//    const items = getClipboardItems({ as: 'item', type: 'tasks' }); // Generic item type
    
    console.log('Clipboard items loaded:', {
        dropdown01Items: dropdown01Items.length,
        dropdown02Items: dropdown02Items.length,
        dropdown03Items:dropdown03Items.length
    });

    
    // Populate task / survey id dropdown
    const dropdown001 = panel.querySelector('#dropdown001');
    if (dropdown001) {
     // console.log('Populating item dropdown with', items.length);
      this.addClipboardItemsToDropdown(dropdown01Items, dropdown001, 'task');
    }


    // Populate the student / respondent dropdown
    const dropdown002 = panel.querySelector('#dropdown002');
    if (dropdown002) {
     // console.log('Populating subject dropdown with', subjects.length);
      this.addClipboardItemsToDropdown(dropdown02Items, dropdown002, 'student');
    }
    

    // Populate the manager (tasks) dropdown
    const dropdown003 = panel.querySelector('#dropdown003');
    if (dropdown003) {
   //   console.log('Populating subject dropdown with', subjects.length, 'items');
      this.addClipboardItemsToDropdown(dropdown03Items, dropdown003, 'manager');
    }
    

    // Auto-fill single items - when there is only 1 item and it hasn't already been selected
    if (dropdown01Items.length === 1 && !dropdown001.value) {
      dropdown001.value = dropdown01Items[0].entity.id;
      informationFeedback.innerHTML += `<div class="p-1 text-sm bg-blue-50 border border-blue-200 rounded">Auto-filled student: ${dropdown01Items[0].entity.name}</div>`;
    }
    
    if (dropdown02Items.length === 1 && !dropdown002.value) {
      dropdown002.value = dropdown02Items[0].entity.id;
      informationFeedback.innerHTML += `<div class="p-1 text-sm bg-blue-50 border border-blue-200 rounded">Auto-filled manager: ${dropdown02Items[0].entity.name}</div>`;
    }
    
    if (dropdown03Items.length === 1 && !dropdown003.value) {
      dropdown003.value = dropdown03Items[0].entity.id;
      informationFeedback.innerHTML += `<div class="p-1 text-sm bg-blue-50 border border-blue-200 rounded">Auto-filled task: ${dropdown03Items[0].entity.name}</div>`;
    }
    // if single values have been placed, the button doesn't know this yet therefore...
// to check if values are set even though not selected by user

    // Update assign button state
    this.updateAssignButton(panel);
  }

  // Add clipboard items to dropdown
  addClipboardItemsToDropdown(items, selectElement, type) {
    //console.log('addClipboardItemsToDropdown()', type, items.length);
    
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
    
    console.log('Added', items.length, 'clipboard items to', type, 'dropdown');
  }

  // Update assign button state based on selections
  updateAssignButton(panel) {
    const dropdown003 = panel.querySelector('#dropdown003');
    const dropdown002 = panel.querySelector('#dropdown002');
    const dropdown001 = panel.querySelector('#dropdown001');
    const assignBtn = panel.querySelector('#assignBtn');
    
    if (!dropdown002 || !dropdown001 || !assignBtn) return;
    
    const dropdown003ed = dropdown003.value !== '';
    const dropdown002ed = dropdown002.value !== '';
    const dropdown001ed = dropdown001.value !== '';
    
    assignBtn.disabled = !(dropdown002ed && dropdown001ed);
    if (dropdown002ed && dropdown001ed) {
      assignBtn.textContent = 'Assign Item';
    } else {
      assignBtn.textContent = 'Select subject and item first';
    }
  }

  // Add information card to feedback display
  addInformationCard(cardData) {
    const infoSection = document.querySelector('#informationSection');
    if (!infoSection) return;
    
    const card = document.createElement('div');
    card.className = 'bg-white p-2 rounded border mb-1 text-sm';
    
    // Create display text by iterating through all properties
    let displayText = '';
    for (const [key, value] of Object.entries(cardData)) {
      if (key !== 'timestamp') {
        displayText += `, ${key}: ${value}`;
      }
    }
    
    card.textContent = displayText;
    infoSection.appendChild(card);
    
    console.log('Information card added:', cardData);
  }

  // Attach common event listeners  NOT CALLED IN THIS FILE but is called from assignTask
  attachCommonListeners(panel) {
    console.log('attachCommonListeners()');
    
    // Subject select change
    panel.querySelector('#dropdown002')?.addEventListener('change', (e) => {
      this.updateAssignButton(panel);
    });

    // Item select change
    panel.querySelector('#dropdown001')?.addEventListener('change', (e) => {
      this.updateAssignButton(panel);
    });

    // Assign button
    panel.querySelector('#assignBtn')?.addEventListener('click', (e) => {
      this.handleAssign(e, panel);
    });

    // Close dialog
    panel.querySelector('[data-action="close-dialog"]')?.addEventListener('click', () => {
      panel.remove();
    });
  }

  // Handle assignment (to be overridden by subclasses)
  async handleAssign(e, panel) {
    console.log('AssignmentBase.handleAssign() - Override in subclass');
    e.preventDefault();
    
    const dropdown001 = panel.querySelector('#dropdown001'); // task or survey
    const dropdown002 = panel.querySelector('#dropdown002'); // student or respondent/
    const dropdown003 = panel.querySelector('#dropdown003'); // manager of task
    
    const assignBtn = panel.querySelector('#assignBtn');
    

    
    const d001 = dropdown001?.value;
    const d002 = dropdown002?.value;
    const d003 = dropdown003?.value;


    if (!d001 || !d002) {
      showToast('Please select at least the first two dropdowns', 'error');
      return;
    }
    
    assignBtn.disabled = true;
    assignBtn.textContent = 'Assigning...';
    
    try {
      // This should be overridden by subclasses  // I don't understand this
      const result = await this.processAssignment(panel);
      // this is BAD. It doesn't correctly report a task assignment - missing manager
      showToast('Assignment completed successfully!', 'success');
      this.addInformationCard({
        'item': d001.substring(0, 8) + '...',
        'appro': d002.substring(0, 8) + '...',
        'manager': d003 ? d003.substring(0, 8) + '...' :'default',
        'assignmentId': result?.substring(0, 8) + '...'  // the registry function only returns id
      });
      
    } catch (error) {
      console.error('Assignment failed:', error);
      showToast('Failed to complete assignment: ' + error.message, 'error');
    }
    
    assignBtn.disabled = false;
    assignBtn.textContent = 'Assign Item';
  }

  // Process assignment (to be implemented by subclasses)
  async processAssignment(panel) {
    console.log('AssignmentBase.processAssignment() - Override in subclass');
    throw new Error('processAssignment must be implemented by subclass');
  }
}