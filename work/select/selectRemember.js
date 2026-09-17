// ./work/select/selectRemember.js
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { appState } from '../../state/appState.js';
import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';


console.log('selectRemeber.js loaded');

/**
Need to add the ability to select a relationship or a permission in order to break it

)R IS THIS BETTER DONE INSIDE displayRealtions ? ????

The following two functions were removed in the refactor of Sept 11 2026:

    async loadAssignmentsnew() {
    try {
      this.loadedData.assignmentsnew = await executeIfPermitted(appState.query.userId, 'readAllAssignmentsNew', {});
      console.log('AssignmentsNew:',this.loadedData.assignmentsnew);
    } catch (error) {
      console.error('Error loading assignementsNew:', error);
      showToast('Failed to load', 'error', 5000);
    }
  }

    async loadRelations() {
    try {// reads array
      this.loadedData.relations = await executeIfPermitted(appState.query.userId, 'readApprofile_relations_view', {});
      console.log('Relations:',this.loadedData.relations);
    } catch (error) {
      console.error('Error loading relations:', error);
      showToast('Failed to load', 'error', 5000);
    }
  }
 */



// OLD PERMISSION CHECK FUNCTION. Is this user allowed to use the Selector.
//This restriction may be legacy. The tools should not be restricted, but the data is under
//permissions
/*
function canUseSelector() {
  // In DEV mode, always allow access
  if (appState.isDevMode) {
    return true;
  }
  
  // Is there any reason to still have this restriction? The data is what is restricted not the tool.
  return false;  
}
*/

export function render(panel, query = {}) {
  console.log('devDataSelector.render()');

     
/*
  if (!canUseSelector()) {
    panel.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl p-8 text-center">
        <div class="text-red-500 mb-4">
          <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Access Denied</h3>
        <p class="text-gray-600 mb-6">
          The selector is only available to administrators.
          ${appState.isDevMode ? '(DEV mode is disabled)' : ''}
        </p>
        <button 
          class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          onclick="this.parentElement.parentElement.remove()"
        >
          Close
        </button>
      </div>
    `;
    return;
  }
*/

  const selector = new DevDataSelector();
  selector.render(panel, query);
}


class DevDataSelector {
  constructor() {
    this.loadedData = {
      humanApprofiles: null,
      abstractApprofiles: null,
      taskApprofiles: null,
      surveyApprofiles: null, //added 9:26 Nov 1 2025
      tasks: null
    };
    this.selectedItem = null;
    this.currentView = null;
    this.currentItems = [];
    this.currentMode = null;
    this.savedSelections = new Map();
  }

  render(panel) {
    panel.innerHTML = this.getTemplateHTML();
    this.init(panel);
  }

  getTemplateHTML() {
    return `
      <div class="dev-selector bg-white rounded-lg shadow p-6">
       <h3 class="text-lg font-semibold text-gray-900">Select & Remember (15:30:11:09:2026) 📝</h3>
        
       <button data-action="selector-dialogue"  data-section="menu"  class="text-gray-500 hover:text-gray-700" aria-label="Close">
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
  </button>

       
       
       
        <!-- ACTION TABS -->
        <div class="mb-4">
          <h4 class="font-medium mb-2">1. First column is what you want to do. Other columns are what you want to do it to:</h4>
          <div class="grid grid-cols-5 gap-1 text-sm">
            <div></div>
            <div class="font-medium p-2">🔧 Task</div> <div class="font-medium p-2">📜 Survey</div> <div class="font-medium p-2">👥 User</div> <div class="font-medium p-2">🎭 Other</div>
            ${[
              ['Assign a', [['tasks', '🔧'], ['surveys', '📜'], ['app-human', '👥'], ['app-abstract', '🎭']]],
              ['Edit a', [['tasks', '🔧'], ['surveys', '📜'], ['app-human', '👥'], ['app-abstract', '🎭']]],
              ['Relate a', [['app-task', '🔧'], ['app-survey', '📜'], ['app-human', '👥'], ['app-abstract', '🎭']]],
              ['Message a', [['app-task', '🔧'], ['app-survey', '📜'], ['app-human', '👥'], ['app-abstract', '🎭']]]              
            ].map(([action, choices]) => `
              <div class="font-medium p-2 bg-gray-100">${action}</div>
              ${choices.map(([view, icon]) => `<button type="button" data-view="${view}" data-mode="${action.toLowerCase()}" class="p-2 border bg-white hover:bg-blue-50 text-left"> ${action} ${icon} </button>`).join('')}
            `).join('')}
          </div>
        </div>

        <!-- DATA LIST -->
        <h4 class="font-medium mb-2">2. Choose the item, then choose a description:</h4>
        <div id="listContainer" class="border rounded  overflow-y-auto bg-gray-50 p-3 mb-4">
          <div class="text-gray-500 text-center py-4">
            Choose an action above to load a list.
          </div>
        </div>

        <!-- INFORMATION FEEDBACK -->
        <div class="bg-green-100 flex flex-col md:flex-row justify-center gap-4 pt-4 border-t border-gray-200 mt-6">
          <p class="text-lg font-bold">Information:</p>
          <p id="informationFeedback" data-task="information-feedback"></p>
        </div>
      </div>
      ${petitionBreadcrumbs()} 
    `;
  }

  init(panel) {
    this.panel = panel;
    this.listContainer = panel.querySelector('#listContainer');
    this.informationFeedback = panel.querySelector('#informationFeedback');

    panel.querySelectorAll('[data-view]').forEach(button => {
      button.addEventListener('click', (event) => this.onViewChange(event.currentTarget.dataset.view, event.currentTarget.dataset.mode));
    });

    this.listContainer.addEventListener('click', (event) => {
      const option = event.target.closest('[data-tag]');
      if (option) {
        event.stopPropagation();
        this.saveSelection(Number(option.dataset.itemIndex), option.dataset.tag);
        return;
      }

      if (event.target.closest('[data-cancel-selection]')) {
        this.selectedItem = null;
        this.populateList(this.currentView);
        return;
      }

      const card = event.target.closest('[data-item-index]');
      if (card) this.onItemClick(Number(card.dataset.itemIndex));
    });

    this.clipboardUpdatedHandler = () => this.refreshFeedbackDisplay();
    document.addEventListener('clipboard:updated', this.clipboardUpdatedHandler);

    this.refreshFeedbackDisplay();
  }

  async onViewChange(view, mode) {
    this.currentView = view;
    this.currentMode = mode;
    this.selectedItem = null;

    if (view.startsWith('app-') && !this.loadedData.humanApprofiles) {
      await this.loadApprofiles();
    } else if (view === 'tasks' && !this.loadedData.tasks) {
      await this.loadTasks();
    } else if (view === 'surveys' && !this.loadedData.surveys)  {
      await this.loadSurveys();
    }

    this.populateList(view);
  }

  async loadApprofiles() {
    try {
      this.listContainer.innerHTML = '<div class="p-4 text-gray-600 flex items-center gap-2"><span class="animate-spin">⏳</span> Loading...</div>';
      const result = await executeIfPermitted(appState.query.userId, 'readApprofiles', {});
//that function returns:  humanApprofiles,taskApprofiles,surveyApprofiles, abstractApprofiles //added surveys 9:22 Nov 1 2025
      
      this.loadedData.humanApprofiles = result.humanApprofiles || [];
      this.loadedData.abstractApprofiles = result.abstractApprofiles || [];
      this.loadedData.taskApprofiles = result.taskApprofiles || [];
      this.loadedData.surveyApprofiles = result.surveyApprofiles || [];
console.log('appros for surveys',this.loadedData.surveyApprofiles);
    } catch (error) {
      console.error('Error loading approfiles:', error);
      showToast('Failed to load', 'error',5000);
    }
  }

  async loadTasks() {
    try {
      this.listContainer.innerHTML = '<div class="p-4 text-gray-600 flex items-center gap-2"><span class="animate-spin">⏳</span> Loading...</div>';
      this.loadedData.tasks = await executeIfPermitted(appState.query.userId, 'readTaskHeaders', {});
    } catch (error) { // if access is forbidden by RLS there is no error
      console.error('Error loading tasks:', error);
      showToast('Failed to load', 'error', 5000);
    }
  }

  async loadSurveys() {
    try {
      this.listContainer.innerHTML = '<div class="p-4 text-gray-600 flex items-center gap-2"><span class="animate-spin">⏳</span> Loading...</div>';
      this.loadedData.surveys = await executeIfPermitted(appState.query.userId, 'readSurveyHeaders', {});
      console.log('Surveys:',this.loadedData.surveys);//works  20:30 Oct 10th 2025
    } catch (error) {
      console.error('Error loading surveys:', error);
      showToast('Failed to load', 'error', 5000);
    }
  }

    populateList(view) {
    // Set container background based on view
    const bgColor = {
      'app-human': 'bg-blue-50',
      'app-abstract': 'bg-purple-50',
      'app-task': 'bg-green-50',
      'app-survey':'bg-yellow-50',
      'tasks': 'bg-red-50',
    }[view] || 'bg-gray-50';

    this.listContainer.className = `border rounded min-h-60 max-h-120 overflow-y-auto p-3 mb-4 ${bgColor}`;

    let items = [];
    switch (view) {
      case 'app-human':
        items = this.loadedData.humanApprofiles || [];
        break;
      case 'app-abstract':
        items = this.loadedData.abstractApprofiles || [];
        break;
      case 'app-task':
        items = this.loadedData.taskApprofiles || [];
        break;
      case 'app-survey':
        items = this.loadedData.surveyApprofiles || [];
        break;
      case 'tasks':
        items = this.loadedData.tasks || [];
        break;
      case 'surveys':
        items = this.loadedData.surveys || [];
      break;
      default:
        this.listContainer.innerHTML = '<div class="text-gray-500 text-center py-4">Select a type above</div>';
        return;
    }
    this.currentItems = items;

    // Add header
    const header = document.createElement('div');
    header.className = 'font-medium mb-2 pb-2 border-b border-gray-300';
    header.textContent = {
      'app-human': '👥 Human Approfiles',
      'app-abstract': '🎭 Abstract Approfiles',
      'app-task': '📋 Task Approfiles',
      'tasks': '🔧 Tasks',
      'surveys' : '📜 Surveys',
    }[view] || 'Select a type above';

    this.listContainer.innerHTML = '';
    this.listContainer.appendChild(header);

    if (items.length === 0) {
      this.listContainer.innerHTML += '<div class="text-gray-500 text-center py-4">No items found. Do you have permission? Please check. </div>';
      return;
    }

    items.forEach((item, index) => {
      if (item.is_deleted) return;

      const card = document.createElement('div');
      const isExpanded = this.selectedItem === item;
      const savedAs = this.savedSelections?.get(this.selectionKey(item));
      card.dataset.itemIndex = index;
      card.className = `p-3 border-b border-gray-200 last:border-b-0 cursor-pointer ${savedAs ? 'bg-green-100' : 'hover:bg-gray-100'}`;

      const name = item.name || this.assembleData(item) || 'Unnamed item';
      card.innerHTML = `<div class="font-medium">${name}</div>${savedAs ? `<div class="text-xs text-green-700" title="Saved as ${savedAs}">Saved as ${savedAs}</div>` : ''}`;
      if (isExpanded) {
        const options = this.getTagOptions();
        card.innerHTML += `
          <div class="mt-3 flex flex-wrap gap-2" data-selection-options>
            ${options.map(option => `<button type="button" data-item-index="${index}" data-tag="${option.value}" class="px-3 py-2 border rounded bg-white hover:bg-blue-50">${option.label}</button>`).join('')}
            <button type="button" data-cancel-selection class="px-3 py-2 border rounded text-gray-600 hover:bg-gray-100">Cancel</button>
          </div>`;
      }
      this.listContainer.appendChild(card);
    });
  }

  assembleData(item){
    if(item.name) return;
    let displayData = null;
    if(item.relation_id) displayData ='['+ item.approfile_is_name +'] is ['+ item.relationship +'] of ['+ item.of_approfile_name+']';
    else if (item.assignment_id) displayData = item.student_name +' ] on: [ '+item.task_name;
    else if (item.assignment) displayData = item.student_name +' ] on: [ '+item.assignment_type+':' +item.assignment.task_header;
    return displayData;
  }

  onItemClick(index) {
    this.selectedItem = this.currentItems[index];
    this.populateList(this.currentView);
  }

  getTagOptions() {
    if (this.currentMode === 'relate') return [{ value: 'relation', label: '🖇️ Relation' }];
    if (this.currentView === 'tasks') return [{ value: 'task', label: '🔧 Task' }];
    if (this.currentView === 'surveys') return [{ value: 'survey', label: '📜 Survey' }];
    if (this.currentMode === 'edit') return [{ value: 'other', label: '❔ Other' }];
    if (this.currentView === 'app-human') return [
      { value: 'student', label: '🧑‍🎓 Student' },
      { value: 'manager', label: '💼 Manager' },
      { value: 'respondent', label: '🤔 Respondent' },
      { value: 'other', label: '❔ Other' }
    ];
    return [{ value: 'other', label: 'other' }];
  }

  selectionKey(item) {
    return `${this.currentView}:${item.id}`;
  }

  saveSelection(index, selectedAs) {
    const item = this.currentItems[index];
    if (!item || !this.currentView) return;

    const displayName = item.name || this.assembleData(item) || 'Unnamed item';

        const clipboardItem = {
      entity: {
        id: item.id,
        name: displayName,
        type: this.currentView,
        item
      },
      as: selectedAs,
      meta: {
        timestamp: Date.now(),
        source: 'dev-data-selector',
        id: `clipboard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }
    };
//console.log('clipboardItem',clipboardItem);
/* 
clipboardItem:
Object { entity: {…}, as: "other", meta: {…} }
as: "other"
entity: Object { id: "6004dc44-a451-417e-80d4-e9ac53265beb", name: "cannie", type: "app-human", … }
id: "6004dc44-a451-417e-80d4-e9ac53265beb"
item: Object { id: "6004dc44-a451-417e-80d4-e9ac53265beb", name: "cannie", email: "can@not.do", … }
auth_user_id: "6004dc44-a451-417e-80d4-e9ac53265beb"
avatar_url: null
created_at: "2025-09-20T19:09:44.614635+00:00"
description: null
email: "can@not.do"
external_url: null
id: "6004dc44-a451-417e-80d4-e9ac53265beb"
name: "cannie"
notes: null
phone: null
sort_int: 42
survey_header_id: null
task_header_id: null
updated_at: null

*/



    // Store
    if (!appState.clipboard) appState.clipboard = [];
    appState.clipboard.push(clipboardItem);
    this.savedSelections.set(this.selectionKey(item), selectedAs);
    this.selectedItem = null;

    this.refreshFeedbackDisplay();

    // Notify
    if (document) {
      document.dispatchEvent(new CustomEvent('clipboard:item-added', { detail: clipboardItem }));
      document.dispatchEvent(new CustomEvent('clipboard:updated', {
        detail: { clipboard: appState.clipboard }
      }));
    }

    this.populateList(this.currentView);
    showToast(`Stored: ${clipboardItem.entity.name} as ${clipboardItem.as}`, 'success', 2000);
  }

  refreshFeedbackDisplay() {
    if (!appState.clipboard || appState.clipboard.length === 0) {
      this.informationFeedback.innerHTML = '<div class="text-gray-500">No items stored yet</div>';
      return;
    }

    this.informationFeedback.innerHTML = appState.clipboard.map((item, index) => `
      <div class="my-2 p-3 bg-white border rounded shadow-sm flex items-center justify-between">
        <div>
          <div class="font-medium">${item.entity.name}</div>
          <div class="text-sm text-gray-600">
            Type: <span class="px-2 py-0.5 bg-gray-200 rounded text-xs">${item.entity.type}</span>
            As: <span class="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">${item.as}</span>
          </div>
        </div>
        <button 
          data-remove-index="${index}" 
          class="text-red-500 hover:text-red-700 ml-4 p-1 rounded hover:bg-red-50"
          title="Remove from clipboard"
          aria-label="Remove item from clipboard"
        >
          ×
        </button>
      </div>
    `).join('');

    // Attach remove listeners
    this.panel.querySelectorAll('[data-remove-index]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.removeIndex);
        this.removeClipboardItem(index);
      });
    });
  }

  removeClipboardItem(index) {
    if (!appState.clipboard || index < 0 || index >= appState.clipboard.length) return;

    const removedItem = appState.clipboard.splice(index, 1)[0];
    this.refreshFeedbackDisplay();
    if (document) {
      document.dispatchEvent(new CustomEvent('clipboard:updated', {
        detail: { clipboard: appState.clipboard }
      }));
    }
    showToast(`Removed: ${removedItem.entity.name}`, 'info', 2000);
  }
}