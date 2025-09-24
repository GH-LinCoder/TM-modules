// ./work/select/selectRemember.js
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { appState } from '../../state/appState.js';
import { canAccessFeature } from '../../registry/permissions.js';


console.log('devDataSelector.js loaded');

// PERMISSION CHECK FUNCTION. Is this user allowed to use the Selector
function canUseSelector() {
  // In DEV mode, always allow access
  if (appState.isDevMode) {
    return true;
  }
  
  // In production, only admins can use this
  // TODO: Implement real permission check when auth is ready
  return false;  //I could set to true so can use DEVmode to control other things like console logs
}



export function render(panel, query = {}) {
  console.log('devDataSelector.render()');




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


  const selector = new DevDataSelector();
  selector.render(panel, query);
}

class DevDataSelector {
  constructor() {
    this.loadedData = {
      humanApprofiles: null,
      abstractApprofiles: null,
      taskApprofiles: null,
      tasks: null
    };
    this.selectedItem = null;
    this.selectedAs = null;
    this.currentView = null;
  }

  render(panel, query = {}) {
    panel.innerHTML = this.getTemplateHTML();
    this.init(panel);
  }

  getTemplateHTML() {
    return `
      <div class="dev-selector bg-white rounded-lg shadow p-6">
        <!-- INSTRUCTIONS -->
        <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p class="text-sm text-blue-800">
            <strong>How to use:</strong><br>
            1. Click a checkbox below to load a list.<br>
            2. Click a name from the list to select it.<br>
            3. Choose how to remember it (Student, Manager, Other).<br>
            4. Click "Confirm" to store it for use in forms.
          </p>
        </div>

        <!-- DATA TYPE SELECTION -->
        <div class="mb-4">
          <h4 class="font-medium mb-2">1. Load List:</h4>
          <div class="space-y-1">
            <label class="flex items-center space-x-2 p-2 border rounded hover:bg-gray-200 cursor-pointer"><input type="radio" name="view" value="app-human"> APPROFILE (person)</label>
            <label class="flex items-center space-x-2 p-2 border rounded hover:bg-gray-200 cursor-pointer"><input type="radio" name="view" value="app-abstract"> APPROFILE (abstract)</label>
            <label class="flex items-center space-x-2 p-2 border rounded hover:bg-gray-200 cursor-pointer"><input type="radio" name="view" value="app-task"> APPROFILE (task)</label>
            <div class="border-t my-2"></div>
            <label class="flex items-center space-x-2 p-2 border rounded hover:bg-gray-200 cursor-pointer"><input type="radio" name="view" value="tasks"> TASKS</label>
          </div>
        </div>

        <!-- DATA LIST -->
        <div id="listContainer" class="border rounded min-h-32 max-h-60 overflow-y-auto bg-gray-50 p-3 mb-4">
          <div class="text-gray-500 text-center py-4">
            Click a checkbox above to load a list, then select an item.
          </div>
        </div>

        <!-- "AS" CATEGORY -->
        <div class="mb-4">
          <h4 class="font-medium mb-2">2. Remember as:</h4>
          <div class="space-y-1">
            <label class="flex items-center space-x-2 p-2 border rounded hover:bg-gray-200 cursor-pointer"><input type="radio" name="as" value="student"> Student</label>
            <label class="flex items-center space-x-2 p-2 border rounded hover:bg-gray-200 cursor-pointer"><input type="radio" name="as" value="manager"> Manager</label>
            <label class="flex items-center space-x-2 p-2 border rounded hover:bg-gray-200 cursor-pointer"><input type="radio" name="as" value="other"> Other</label>
            <label class="flex items-center space-x-2 p-2 border rounded hover:bg-gray-200 cursor-pointer"><input type="radio" name="as" value="task"> Task</label>
          </div>
        </div>

        <!-- CONFIRM BUTTON -->
        <button 
          id="confirmBtn"
          disabled
          class="w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          Select item and category first
        </button>

        <!-- INFORMATION FEEDBACK -->
        <div class="bg-green-100 flex flex-col md:flex-row justify-center gap-4 pt-4 border-t border-gray-200 mt-6">
          <p class="text-lg font-bold">Information:</p>
          <p id="informationFeedback" data-task="information-feedback"></p>
        </div>
      </div>
    `;
  }

  init(panel) {
    this.panel = panel;
    this.listContainer = panel.querySelector('#listContainer');
    this.confirmBtn = panel.querySelector('#confirmBtn');
    this.informationFeedback = panel.querySelector('#informationFeedback');

    // View radios
    panel.querySelectorAll('input[name="view"]').forEach(radio => {
      radio.addEventListener('change', (e) => this.onViewChange(e));
    });

    // "As" radios
    panel.querySelectorAll('input[name="as"]').forEach(radio => {
      radio.addEventListener('change', (e) => this.onAsChange(e));
    });

    // Confirm button
    this.confirmBtn.addEventListener('click', () => this.confirmSelection());

    // Initialize feedback display
    this.refreshFeedbackDisplay();
  }

  async onViewChange(e) {
    const view = e.target.value;
    this.currentView = view;

    // Load data if not already loaded
    if (view.startsWith('app-') && !this.loadedData.humanApprofiles) {
      await this.loadApprofiles();
    } else if (view === 'tasks' && !this.loadedData.tasks) {
      await this.loadTasks();
    }

    // Populate list
    this.populateList(view);
    this.updateConfirmButton();
  }

  async loadApprofiles() {
    try {
      const result = await executeIfPermitted(appState.query.userId, 'readApprofiles', {});
      this.loadedData.humanApprofiles = result.humanApprofiles || [];
      this.loadedData.abstractApprofiles = result.abstractApprofiles || [];
      this.loadedData.taskApprofiles = result.taskApprofiles || [];
    } catch (error) {
      console.error('Error loading approfiles:', error);
      showToast('Failed to load approfiles', 'error');
    }
  }

  async loadTasks() {
    try {
      this.loadedData.tasks = await executeIfPermitted(appState.query.userId, 'readTaskHeaders', {});
    } catch (error) {
      console.error('Error loading tasks:', error);
      showToast('Failed to load tasks', 'error');
    }
  }

  populateList(view) {
    // Set container background based on view
    const bgColor = {
      'app-human': 'bg-blue-50',
      'app-abstract': 'bg-purple-50',
      'app-task': 'bg-green-50',
      'tasks': 'bg-red-50'
    }[view] || 'bg-gray-50';

    this.listContainer.className = `border rounded min-h-32 max-h-60 overflow-y-auto p-3 mb-4 ${bgColor}`;

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
      case 'tasks':
        items = this.loadedData.tasks || [];
        break;
      default:
        this.listContainer.innerHTML = '<div class="text-gray-500 text-center py-4">Select a type above</div>';
        return;
    }

    // Add header
    const header = document.createElement('div');
    header.className = 'font-medium mb-2 pb-2 border-b border-gray-300';
    header.textContent = {
      'app-human': '👥 Human Approfiles',
      'app-abstract': '🎭 Abstract Approfiles',
      'app-task': '📋 Task Approfiles',
      'tasks': '🚀 Tasks'
    }[view] || 'Select a type above';

    this.listContainer.innerHTML = '';
    this.listContainer.appendChild(header);

    if (items.length === 0) {
      this.listContainer.innerHTML += '<div class="text-gray-500 text-center py-4">No items found</div>';
      return;
    }

    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'p-2 hover:bg-gray-200 cursor-pointer border-b border-gray-200 last:border-b-0';
      div.textContent = item.name || `[${item.id}]`;
      div.dataset.json = JSON.stringify(item);
      div.addEventListener('click', () => this.onItemClick(item));
      this.listContainer.appendChild(div);
    });
  }

  onItemClick(item) {
    this.selectedItem = item;
    this.updateConfirmButton();
  }

  onAsChange(e) {
    this.selectedAs = e.target.value;
    this.updateConfirmButton();
  }

  updateConfirmButton() {
    if (this.selectedItem && this.selectedAs && this.currentView) {
      // Truncate long names for button
      const displayName = this.selectedItem.name.length > 30 
        ? this.selectedItem.name.substring(0, 30) + '...' 
        : this.selectedItem.name;

      this.confirmBtn.disabled = false;
      this.confirmBtn.textContent = `Click to store: "${displayName}" ---- AS ---- "${this.selectedAs}"`;
    } else {
      this.confirmBtn.disabled = true;
      this.confirmBtn.textContent = 'Select item and category first';
    }
  }

  confirmSelection() {
    if (!this.selectedItem || !this.selectedAs || !this.currentView) return;

    const clipboardItem = {
      entity: {
        id: this.selectedItem.id,
        name: this.selectedItem.name,
        type: this.currentView,
        item: this.selectedItem
      },
      as: this.selectedAs,
      meta: {
        timestamp: Date.now(),
        source: 'dev-data-selector',
        id: `clipboard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }
    };

    // Store
    if (!appState.clipboard) appState.clipboard = [];
    appState.clipboard.push(clipboardItem);

    // Refresh feedback display
    this.refreshFeedbackDisplay();

    // Notify
    if (document) {
      document.dispatchEvent(new CustomEvent('clipboard:item-added', { detail: clipboardItem }));
    }

    showToast(`Stored: ${clipboardItem.entity.name} as ${clipboardItem.as}`, 'success');
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
//16:38 sept 23rd addition:

// After updating the display
document.dispatchEvent(new CustomEvent('clipboard:updated', {
  detail: { clipboard: appState.clipboard }
}));


  }

  removeClipboardItem(index) {
    if (!appState.clipboard || index < 0 || index >= appState.clipboard.length) return;

    const removedItem = appState.clipboard.splice(index, 1)[0];
    this.refreshFeedbackDisplay();
    showToast(`Removed: ${removedItem.entity.name}`, 'info');
  }
}