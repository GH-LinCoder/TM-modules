// assignTask.js
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { appState } from '../../state/appState.js';
import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';
import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';

const userId = appState.query.userId;

console.log('🔥 assignTask.js: START');

export function render(panel, query = {}) {
  console.log('assignTask.js render() called');
  const dialog = new AssignTaskDialog();
  dialog.render(panel, query);
          panel.innerHTML+=petitionBreadcrumbs();//this reads 'petition' and prints the values at bottom of the render panel
  
}

class AssignTaskDialog {
  constructor() {
    this.taskHeaders = [];
    this.approfiles = [];
  }

  render(panel, query = {}) {
    console.log('AssignTaskDialog.render()');
    panel.innerHTML = this.getTemplateHTML();

    this.dialog = panel.querySelector('[data-form="assignTaskDialog"]');
    this.form = panel.querySelector('[data-form="assignTaskForm"]');
    this.taskSelect = panel.querySelector('[data-form="taskSelect"]');
    this.studentSelect = panel.querySelector('[data-form="studentSelect"]');
    this.managerSelect = panel.querySelector('[data-form="managerSelect"]');
    this.assignBtn = panel.querySelector('[data-form="assignTaskBtn"]');
    this.informationFeedback = this.dialog.querySelector('[data-task="information-feedback"]');

    this.init();
  }

  init() {
    console.log('AssignTaskDialog.init()');
    
    // Event listeners
    this.dialog.querySelectorAll('[data-action="close-dialog"]').forEach(el => {
      el.addEventListener('click', () => this.close());
    });

    this.assignBtn.addEventListener('click', (e) => this.handleAssignTask(e));
    this.taskSelect.addEventListener('change', this.updateSubmitButtonState.bind(this));
    this.studentSelect.addEventListener('change', this.updateSubmitButtonState.bind(this));
    this.managerSelect.addEventListener('change', this.updateSubmitButtonState.bind(this));

    // Load data (optional — clipboard can handle it)
   // this.loadTaskHeaders();
   // this.loadApprofiles();

    // Clipboard integration
    this.populateFromClipboard();
    onClipboardUpdate(() => {
      this.populateFromClipboard();
    });
  }

  populateFromClipboard() {
    console.log('AssignTaskDialog.populateFromClipboard()');
    
    const students = getClipboardItems({ as: 'student', type: 'app-human' });
    const managers = getClipboardItems({ as: 'manager', type: 'app-human' });
    const tasks = getClipboardItems({ as: 'task', type: 'tasks' }); // ✅ LOOKING FOR "AS task"

    // Auto-fill single items
    if (students.length === 1 && !this.studentSelect.value) {
      this.studentSelect.value = students[0].entity.id;
      this.informationFeedback.innerHTML += `<div class="p-1 text-sm bg-blue-50 border border-blue-200 rounded">Auto-filled student: ${students[0].entity.name}</div>`;
    }
    
    if (managers.length === 1 && !this.managerSelect.value) {
      this.managerSelect.value = managers[0].entity.id;
      this.informationFeedback.innerHTML += `<div class="p-1 text-sm bg-blue-50 border border-blue-200 rounded">Auto-filled manager: ${managers[0].entity.name}</div>`;
    }
    
    if (tasks.length === 1 && !this.taskSelect.value) {
      this.taskSelect.value = tasks[0].entity.id;
      this.informationFeedback.innerHTML += `<div class="p-1 text-sm bg-blue-50 border border-blue-200 rounded">Auto-filled task: ${tasks[0].entity.name}</div>`;
    }

    // Add to dropdowns if not exists
    this.addClipboardItemsToDropdown(students, this.studentSelect);
    this.addClipboardItemsToDropdown(managers, this.managerSelect);
    this.addClipboardItemsToDropdown(tasks, this.taskSelect);

    this.updateSubmitButtonState();
  }

  addClipboardItemsToDropdown(items, selectElement) {
    if (!items || items.length === 0) return;
    
    items.forEach(item => {
      const existingOption = Array.from(selectElement.options).find(opt => opt.value === item.entity.id);
      if (!existingOption) {
        const option = document.createElement('option');
        option.value = item.entity.id;
        option.textContent = `${item.entity.name} (clipboard)`;
        option.dataset.source = 'clipboard';
        selectElement.appendChild(option);
      }
    });
  }

  updateSubmitButtonState() {
    const taskSelected = this.taskSelect.value !== '';
    const studentSelected = this.studentSelect.value !== '';
    const managerSelected = this.managerSelect.value !== '';

    this.assignBtn.disabled = !(taskSelected && studentSelected && managerSelected);
    if (taskSelected && studentSelected && managerSelected) {
      this.assignBtn.textContent = 'Assign Task';
    }
  }

  open() {
    console.log('AssignTaskDialog.open()');
    this.dialog.classList.remove('hidden');
    this.dialog.classList.add('flex');
    this.dialog.dispatchEvent(new CustomEvent('dialog:open'));
  }

  close() {
    console.log('AssignTaskDialog.close()');
    this.dialog.classList.add('hidden');
    this.dialog.classList.remove('flex');
    this.form.reset();
    this.assignBtn.disabled = true;
  }

  getTemplateHTML() {
    return `
      <div id="assignTaskDialog" data-form="assignTaskDialog" class="assign-task-dialog flex items-center justify-center">
        <div class="bg-white rounded-lg shadow-lg w-auto max-w-4xl mx-4 z-10 max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900">Assign Task 👨‍🔧</h3>
              <p class="text-sm text-gray-600">Assign a task to a student and manager</p>
              <button class="text-gray-500 hover:text-gray-700" data-action="close-dialog" aria-label="Close">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
          <div class="p-6 space-y-6">
            <div class="space-y-2">
              <label for="taskSelect" class="block text-sm font-medium text-gray-700">Select Task</label>
              <select id="taskSelect" data-form="taskSelect" class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
                <option value="">Select a task</option>
              </select>
            </div>
            <div class="space-y-2">
              <label for="studentSelect" class="block text-sm font-medium text-gray-700">Select Student</label>
              <select id="studentSelect" data-form="studentSelect" class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
                <option value="">Select a student</option>
              </select>
            </div>
            <div class="space-y-2">
              <label for="managerSelect" class="block text-sm font-medium text-gray-700">Select Manager</label>
              <select id="managerSelect" data-form="managerSelect" class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Select a manager </option>
              </select>
            </div>
            <div class="text-sm text-gray-500 space-y-2 p-3 bg-gray-50 rounded-lg">
              <p>You can assign any member as a Student to any task and select any member to manage that process.</p>
              <p>📋 Items from your clipboard will appear in dropdowns with "(clipboard)" label.</p>
            </div>
            <button type="submit" id="assignTaskBtn" data-form="assignTaskBtn" 
              class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled>
              Assign Task
            </button>
          </div>
          <div class="bg-green-100 flex flex-col md:flex-row justify-center gap-4 pt-4 border-t border-gray-200">
            <p class="text-lg font-bold">Information:</p>
            <p data-task="information-feedback"></p>
          </div>
        </div>
      </div>
    `;
  }

  async loadTaskHeaders() {
    console.log('AssignTaskDialog.loadTaskHeaders()');
    try {
      const taskHeaders = await executeIfPermitted(userId, 'readTaskHeaders', {});
      this.taskHeaders = taskHeaders || [];
      this.populateTaskDropdown();
    } catch (error) {
      console.error('Error fetching task headers:', error);
    }
  }

  async loadApprofiles() {
    console.log('AssignTaskDialog.loadApprofiles()');
    try {
      const approfiles = await executeIfPermitted(userId, 'readApprofiles', {});
      this.approfiles = approfiles || [];
      this.populateUserDropdowns();
    } catch (error) {
      console.error('Error fetching approfiles:', error);
    }
  }

  populateTaskDropdown() {
    console.log('AssignTaskDialog.populateTaskDropdown()');
    this.taskSelect.innerHTML = '<option value="">Select a task</option>';
    this.taskHeaders.forEach(task => {
      const option = document.createElement('option');
      option.value = task.id;
      option.textContent = task.name;
      this.taskSelect.appendChild(option);
    });
  }

  populateUserDropdowns() {
    console.log('AssignTaskDialog.populateUserDropdowns()');
    this.studentSelect.innerHTML = '<option value="">Select a student</option>';
    this.managerSelect.innerHTML = '<option value="">Select a manager</option>';
    
    this.approfiles.forEach(file => {
      // Student option
      const studentOption = document.createElement('option');
      studentOption.value = file.id;
      studentOption.textContent = file.name;
      this.studentSelect.appendChild(studentOption);

      // Manager option
      const managerOption = document.createElement('option');
      managerOption.value = file.id;
      managerOption.textContent = file.name;
      this.managerSelect.appendChild(managerOption);
    });
  }

  async checkToAvoidDuplicates({ student_id, manager_id, task_header_id }) {
    console.log('checkToAvoidDuplicates()');
    try {
      const data = await executeIfPermitted(userId, 'readAssignmentExists', {
        student_id,
        task_header_id
      });
      return data;
    } catch (error) {
      console.error('Error checking duplicates:', error);
      return null;
    }
  }

  async handleAssignTask(e) {
    e.preventDefault();
    console.log('AssignTaskDialog.handleAssignTask(e)');
    this.assignBtn.disabled = true;

    const task_header_id = this.taskSelect.value;
    const student_id = this.studentSelect.value;
    const manager_id = this.managerSelect.value;

    if (!task_header_id || !student_id) {
      this.showError('Please select task and student');
      this.assignBtn.disabled = false;
      return;
    }

    try {
      this.assignBtn.textContent = 'Finding task step...';
      const step3 = await executeIfPermitted(userId, 'readStep3Id', { task_header_id });
      console.log('step3',step3);
      if (!step3) {
        throw new Error(`Step 3 not found for task_header_id: ${task_header_id}`);
      }

      this.assignBtn.textContent = 'Checking for duplicates...';
      const existing = await this.checkToAvoidDuplicates({
        student_id,
        manager_id,
        task_header_id
      });

      if (existing && existing.length > 0) {
        const currentStep = existing[0].step_order;
        this.informationFeedback.innerHTML = `
          <div class="p-2 bg-yellow-50 border border-yellow-200 rounded">
            <p>This student has already been assigned to this task</p>
            <p>Current step: ${currentStep}</p>
            ${currentStep === 1 ? '<p>Task was abandoned</p>' : ''}
            ${currentStep === 2 ? '<p>Task was completed</p>' : ''}
            ${currentStep > 2 ? '<p>Task is active - cannot reassign</p>' : ''}
          </div>
        `;
        
        if (currentStep > 2) {
          this.assignBtn.disabled = false;
          this.assignBtn.textContent = 'Assign Task';
          return;
        }
      }

      this.assignBtn.textContent = 'Creating assignment...';
      const newAssignment = await executeIfPermitted(userId, 'createAssignment', {
        student_id,
        manager_id: manager_id || null,
        task_header_id,
//        step_id: step3.id     step3 is an uuid  there is no step3.id
        step_id: step3
      });

      this.assignBtn.textContent = 'Assigned! - select others or close';
      this.showSuccess('Task assigned successfully!');
      
      // Clear selections for next assignment
      this.taskSelect.value = '';
      this.studentSelect.value = '';
      this.managerSelect.value = '';
      this.updateSubmitButtonState();
      
    } catch (error) {
      this.showError('Failed to assign task: ' + error.message);
      this.assignBtn.disabled = false;
      this.assignBtn.textContent = 'Assign Task';
    }
  }

  showSuccess(message) {
    this.showToast(message, 'bg-green-600');
  }

  showError(message) {
    this.showToast(message, 'bg-red-600');
  }

  showToast(message, bgColor) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast fixed bottom-4 right-4 px-4 py-3 rounded-lg text-white shadow-lg ${bgColor} transition-opacity duration-300`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }
}

export { AssignTaskDialog };