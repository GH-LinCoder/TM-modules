// ./work/select/selectRemember.js
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { appState } from '../../state/appState.js';
import { canAccessFeature } from '../../registry/permissions.js';
import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';


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
  //panel.innerHTML+=petitionBreadcrumbs();//this reads 'petition' and prints the values at bottom of the render panel

}

class DevDataSelector {
  constructor() {
    this.loadedData = {
      humanApprofiles: null,
      abstractApprofiles: null,
      taskApprofiles: null,
      surveyApprofiles: null, //added 9:26 Nov 1 2025
      tasks: null,
      assignments:null
    };
    this.selectedItem = null;
    this.selectedAs = 'other';
    this.currentView = null;
  }

  render(panel, query = {}) {
    panel.innerHTML = this.getTemplateHTML();
    this.init(panel);
  }

  getTemplateHTML() {
    return `
      <div class="dev-selector bg-white rounded-lg shadow p-6">
       <h3 class="text-lg font-semibold text-gray-900">Select & Remember 22:00 10 Oct 📝</h3>
        <!-- INSTRUCTIONS -->
        <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p class="text-sm text-blue-800">
            <strong> How to use:</strong><br>
            1. Click a checkbox below to load a list.<br>
            2. Click a name from the list to select it.<br>
            3. Choose how to remember it (Student, Manager, Other) or accept the suggestion.<br>
            4. Click to confirm & store it in the semantic clipboard for use in forms.<br>
            </p>
          </div>
            <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p class="text-sm text-blue-400">
            <strong> What happens next:</strong><br>
            A. The stored items will be visible below in the Information section. They can be removed individually.<br>
            B. Other modules of the App will check the clipboard automatically and load any data they need.
          </p>

        </div>

        <!-- DATA TYPE SELECTION -->
        <div class="mb-4">
          <h4 class="font-medium mb-2">1. Click to load a List:</h4>
          <div class="space-y-1">
             <div title= "This is a link to the actual task. It needs an appro assigned as a student to the task, it also needs a manager">
            <label class="flex items-center space-x-2 p-2 bg-blue-100 border rounded hover:bg-gray-100 cursor-pointer"><input type="radio" name="view" value="tasks"> 🔧 Tasks to be assigned</label>
            </div>  
            <div title= "Can relate to other appros. This shows up on myDash ralations map. This is like an index card for the task, or a name sticker, it isn't the actual task">
            <label class="flex items-center space-x-2 p-2 bg-gray-200 border rounded hover:bg-gray-100 cursor-pointer"><input type="radio" name="view" value="app-task"> 🖇️🔧 APPRO of a task for relating 🖇️</label>
            </div>
            <div class="border-t my-2" ></div>
            <div title="This is for selecting a survey to edit it or read it or assign it to someone. When assigned the survey will show-up on that person's myDash">            
              <label class="flex items-center space-x-2 p-2 bg-yellow-100 border rounded hover:bg-gray-100 cursor-pointer"><input type="radio" name="view" value="surveys" > 📜 Surveys to be assigned</label>
            </div>
            <div title="This is for putting the survey in a group or category. It will show-up on the relations map. This is an 'appro' (a name sticker) that is used to represent the survey in relations.">
              <label class="flex items-center space-x-2 p-2 bg-gray-200 border rounded hover:bg-gray-100 cursor-pointer" ><input type="radio" name="view" value="app-survey" > 🖇️📜 APPRO of a survey for relating</label> <!--NEW Nov 1 2025 -->
            </div>
            <div class="border-t my-2"></div>
            <div title= "Can assign to a task as student or manager, or a survey as respondent, or relate to another appro. It represents the authenicated users of the app. It is like their name tag. ">           
              <label class="flex items-center space-x-2 p-2 bg-gray-200 border rounded hover:bg-gray-100 cursor-pointer" ><input type="radio" name="view" value="app-human" > 👥 Human APPRO 👨‍🔧, 🎆📜 , 🖇️</label>  
            </div>
            <div title= "Can relate to other appros. This shows up on myDash ralations map. It is an appro that represents ideas or groups or outside things. Can be assigned as a student to a task, but not as a manager. Cannot be respondent to survey.">
              <label class="flex items-center space-x-2 p-2 bg-gray-200 border rounded hover:bg-gray-100 cursor-pointer"><input type="radio" name="view" value="app-abstract" >🎭 Abstract APPROFILE 👨‍🔧, 🎆📜 , 🖇️</label>
            </div>                 
            
            <div class="border-t my-2"></div>
            <div title="See what tasks and surveys have already been assigned.">     
              <label class="flex items-center space-x-2 p-2 bg-green-100 border rounded hover:bg-gray-100 cursor-pointer" ><input type="radio" name="view" value="assignments"> 👨‍🔧 Existing Assignments</label>
            </div>
        </div>
      </div>

        <!-- DATA LIST -->
                  <h4 class="font-medium mb-2">2. Click to choose an item from the list:</h4>
        <div id="listContainer" class="border rounded min-h-32 max-h-60 overflow-y-auto bg-gray-50 p-3 mb-4">
          <div class="text-gray-500 text-center py-4">
            Click a checkbox above to load a list, then select an item.
          </div>
        </div>

        <!-- "AS" CATEGORY -->
        <div class="mb-4">
          <h4 class="font-medium mb-2">3 Click to remember the item AS...:</h4>
          <div class="space-y-1"  title='The code will automatically set the 'AS' value if it is obvious such as when a task or survey is recognised, but you need to choose when assigning things to something not obvious such as 'student'>
            <label class="flex items-center space-x-2 p-2 bg-blue-100 border rounded hover:bg-gray-100 cursor-pointer"><input type="radio" name="as" value="task"> 🔧 Task</label>
            <label class="flex items-center space-x-2 p-2 bg-blue-100 border rounded hover:bg-gray-100 cursor-pointer"><input type="radio" name="as" value="student"> 🧑‍🎓 Student - for a task</label>
            <label class="flex items-center space-x-2 p-2 bg-blue-100 border rounded hover:bg-gray-100 cursor-pointer"><input type="radio" name="as" value="manager"> 💼 Manager - for a task</label>
            <div class="border-t my-2"></div>
            <label class="flex items-center space-x-2 p-2 bg-yellow-100 border rounded hover:bg-gray-100 cursor-pointer"><input type="radio" name="as" value="survey"> 📜 Survey</label>                    
            <div class="border-t my-2"></div>            
            <label class="flex items-center space-x-2 p-2 bg-yellow-100 border rounded hover:bg-gray-100 cursor-pointer"><input type="radio" name="as" value="respondent" checked> 🤔 Respondent for a survey</label>
            
            <label class="flex items-center space-x-2 p-2 bg-gray-100 border rounded hover:bg-gray-100 cursor-pointer"><input type="radio" name="as" value="other" checked> ❔ Other - no specific meaning</label>
            <div class="border-t my-2"></div>
            <label class="flex items-center space-x-2 p-2 bg-green-100 border rounded hover:bg-gray-100 cursor-pointer"><input type="radio" name="as" value="assignment"> 👨‍🔧 Assignment</label>


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
      ${petitionBreadcrumbs()} 
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
console.log('ViewChange:');
    // Load data if not already loaded
    if (view.startsWith('app-') && !this.loadedData.humanApprofiles) { //they mostly are not human. What does this do?
      await this.loadApprofiles();
    } else if (view === 'tasks' && !this.loadedData.tasks) {
      await this.loadTasks();
    } else if (view === 'surveys' && !this.loadedData.surveys)  {
      await this.loadSurveys();
    } else if (view === 'assignments' && !this.loadedData.assignments)  {
      await this.loadAssignments();
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
      this.loadedData.surveyApprofiles = result.surveyApprofiles || [];
console.log('appros for surveys',this.loadedData.surveyApprofiles);
    } catch (error) {
      console.error('Error loading approfiles:', error);
      showToast('Failed to load', 'error');
    }
  }

  async loadTasks() {
    try {
      this.loadedData.tasks = await executeIfPermitted(appState.query.userId, 'readTaskHeaders', {});
    } catch (error) {
      console.error('Error loading tasks:', error);
      showToast('Failed to load', 'error');
    }
  }

  async loadSurveys() {
    try {
      this.loadedData.surveys = await executeIfPermitted(appState.query.userId, 'readSurveyHeaders', {});
      console.log('Surveys:',this.loadedData.surveys);//works  20:30 Oct 10th 2025
    } catch (error) {
      console.error('Error loading surveys:', error);
      showToast('Failed to load', 'error');
    }
  }

  async loadAssignments() {
    try {
      this.loadedData.assignments = await executeIfPermitted(appState.query.userId, 'readAllAssignments', {});
      console.log('Assignments:',this.loadedData.assignments);
    } catch (error) {
      console.error('Error loading assignements:', error);
      showToast('Failed to load', 'error');
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
      'assignments':'bg-yellow-50',
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
      case 'app-survey':
        items = this.loadedData.surveyApprofiles || [];
        break;
      case 'tasks':
        items = this.loadedData.tasks || [];
        break;
      case 'surveys':
        items = this.loadedData.surveys || [];
      break;
      case 'assignments':
        items = this.loadedData.assignments || []; // PROBLEM  this view has task_name not name.
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
      'tasks': '🔧 Tasks',
      'surveys' : '📜 Surveys',
      'assignments':'👨‍🔧 assignments',
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
      div.textContent = item.name || item.task_name; //assignment view has differentiated names, This isn't going to work 
      div.dataset.json = JSON.stringify(item);
      div.addEventListener('click', () => this.onItemClick(item));
      this.listContainer.appendChild(div);
    });
  }


  onItemClick(item) {  // set the 'AS' value to defaults that match the type of thing being selected, but user can over ride.
    this.selectedItem = item;
    console.log('onItemClick() this.currentView ===',this.currentView); // recognises assignments view 

    if (this.currentView === 'tasks') {
      this.selectedAs = 'task';
      // Check the radio button
      const taskRadio = this.panel.querySelector('input[name="as"][value="task"]');
      if (taskRadio) {
          taskRadio.checked = true;
      } 
    }else if (this.currentView.startsWith('app-')) {
      this.selectedAs = 'other';
      // Check the radio button
      const taskOther = this.panel.querySelector('input[name="as"][value="other"]');
      if (taskOther) {
          taskOther.checked = true;
      } 
    }else if (this.currentView === 'surveys') {
        this.selectedAs = 'survey';
        // Check the radio button
        const surveyRadio = this.panel.querySelector('input[name="as"][value="survey"]');
        if (surveyRadio) {
            surveyRadio.checked = true;
        }
      } else if (this.currentView === 'assignments') { // no log 
          console.log('assignment view recognised');
          this.selectedAs = 'assignment';
          // Check the radio button
          const assignmentRadio = this.panel.querySelector('input[name="as"][value="assignment"]');
         console.log('assignmentRadio:',assignmentRadio); // but not recognised here
          if (assignmentRadio) {
              assignmentRadio.checked = true;
          }
      } else console.log('currenView', this.currentView);

      this.updateConfirmButton();  
}


  onAsChange(e) {
    console.log('asChange:',e.target);  //detects slection AS assignement.
    this.selectedAs = e.target.value;
    this.updateConfirmButton();
  }

  updateConfirmButton() {
    if (this.selectedItem && this.currentView) {
      // Truncate long names for button
      const textContent = this.selectedItem.name || this.selectedItem.task_name; // the latter is assignments
      const displayName = textContent.length > 30 
        ? textContent.substring(0, 30) + '...' 
        : textContent;

      this.confirmBtn.disabled = false;
      this.confirmBtn.textContent = `Click to store: "${displayName}" ---- AS ---- "${this.selectedAs}"`;
    } else {
      this.confirmBtn.disabled = true;
      this.confirmBtn.textContent = 'Select item and category first';
    }
  }

  confirmSelection() {
    if (!this.selectedItem || !this.currentView) return;









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
          aria-label="Remove item from clipboard"
           onclick="removeClipboardItem(${index})"
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