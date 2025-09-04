// assignTask.js

export function render(panel, query = {}) {
  console.log('assignTask.js render() called');
  const dialog = new AssignTaskDialog();
  dialog.render(panel, query);
}
console.log('🔥 assignTask.js: START');
class AssignTaskDialog {
 /* constructor() {
    // ✅ Remove DOM references from constructor
    this.taskHeaders = [];
    this.users = [];
    // No DOM elements here
  }

  render(panel, query = {}) {
    console.log('AssignTaskDialog.render()');
    // ✅ Now the panel exists — inject HTML
    panel.innerHTML = this.getTemplateHTML();

    // ✅ Now select elements from the injected DOM
    this.dialog = panel.querySelector('[data-form="assignTaskDialog"]');
    this.form = panel.querySelector('[data-form="assignTaskForm"]');
    this.taskSelect = panel.querySelector('[data-form="taskSelect"]');
    this.studentSelect = panel.querySelector('[data-form="studentSelect"]');
    this.managerSelect = panel.querySelector('[data-form="managerSelect"]');
    this.assignBtn = panel.querySelector('[data-form="assignTaskBtn"]');

    // ✅ Now initialize event listeners
    this.init();
  }
  init() {
    console.log('AssignTaskDialog.init()');
    // Set up event listeners
    this.dialog.querySelectorAll('[data-action="close-dialog"]').forEach(el => {
      el.addEventListener('click', () => this.close());
    });

    this.form.addEventListener('submit', (e) => this.handleAssignTask(e));

    // Populate dropdowns when dialog opens
    this.dialog.addEventListener('dialog:open', () => {
      this.loadTaskHeaders();
      this.loadUsers();
    });
  }


  open() {
    console.log('AssignTaskDialog.open()');
    this.dialog.classList.remove('hidden');
    this.dialog.classList.add('flex');
    
    // Dispatch custom event
    this.dialog.dispatchEvent(new CustomEvent('dialog:open'));
  }

  close() {
    console.log('AssignTaskDialog.close()');
    this.dialog.classList.add('hidden');
    this.dialog.classList.remove('flex');
    
    // Reset form
    this.form.reset();
    this.assignBtn.disabled = true;
  }

/*
  render(panel, query = {}) { //query is not currently used, but may be important for permissions
  console.log('Render(', panel, query,')');
//  panel.innerHTML = "TEST TEST TEST";// test in case html has error
panel.innerHTML = getTemplateHTML();
  attachListeners(panel);
  //updatePanelLayout();
}
*/



  getTemplateHTML() { console.log('getTemplateHTML()');
    return `
  <!-- assign-task-dialog.html -->

<div id="assignTaskDialog" data-form="assignTaskDialog" class="assign-task-dialog  flex items-center justify-center">
<!--div id="assignTaskDialog" data-form="assignTaskDialog" class="assign-task-dialog  flex items-center justify-center"-->


  <!-- Dialog -->
  <div class="bg-white rounded-lg shadow-lg w-auto max-w-4xl mx-4 z-10 max-h-[90vh] overflow-y-auto">

     <div class="p-6 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">Assign Task</h3>
      <p class="text-sm text-gray-600">Assign a task to a student and manager</p>

        <button 
        class="text-gray-500 hover:text-gray-700"
        data-action="close-dialog"
        aria-label="Close"
        >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
</div>
    <div class="p-6 space-y-6">
  <div>
        <div class="space-y-2">
          <label for="taskSelect" class="block text-sm font-medium text-gray-700" data-form="title">Assign Task</label>
          <select 
            id="taskSelect" 
            data-form="taskSelect"
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select a task</option>
          </select>
        </div>

        <div class="space-y-2">
      <form id="assignTaskForm" data-form="assignTaskForm" class="space-y-4">

          <label for="studentSelect" class="block text-sm font-medium text-gray-700" data-form="dropdown-01">Select Student</label>
          <select 
            id="studentSelect" 
            data-form="studentSelect"
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select a student</option>
          </select>
        </div>

        <div class="space-y-2">
          <label for="managerSelect" class="block text-sm font-medium text-gray-700" data-form="dropdown-02">Select Manager</label>
          <select 
            id="managerSelect" 
            data-form="managerSelect"
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a manager (optional)</option>
          </select>
        </div>

        <div class="text-sm text-gray-500 space-y-2 p-3 bg-gray-50 rounded-lg">
          <p>
            You can assign any member as a Student to any task and select any member to manage that process. 
            Use the dropdowns to select each one and then click to assign it.
          </p>
          <p>
            Currently using username from profiles table. Drop down will not scale. 
            Later will need search. Drop down populated from profiles for people and task_headers. 
            Written to task_assignments.
          </p>
        </div>

        <button 
          type="submit" 
          id="assignTaskBtn"
          data-form="assignTaskBtn"
          class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled
        >
          Assign Task
        </button>
      </form>
    </div>
  </div>
</div>
</div>
`;

  }
  
  
  async loadTaskHeaders() {
    console.log('AssignTaskDialog.loadTaskHeaders()');
    try {
      const { data, error } = await supabase
        .from('task_headers')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('Error fetching task headers:', error);
        this.showError('Failed to load tasks');
        return;
      }

      this.taskHeaders = data || [];
      this.populateTaskDropdown();
    } catch (error) {
      console.error('Error fetching task headers:', error);
      this.showError('An unexpected error occurred');
    }
  }

  async loadUsers() {
    console.log('AssignTaskDialog.loadUsers()');
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username')
        .order('username');

      if (error) {
        console.error('Error fetching users:', error);
        this.showError('Failed to load users');
        return;
      }

      this.users = data || [];
      this.populateUserDropdowns();
    } catch (error) {
      console.error('Error fetching users:', error);
      this.showError('An unexpected error occurred');
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
    // Clear existing options (except placeholders)
    this.studentSelect.innerHTML = '<option value="">Select a student</option>';
    this.managerSelect.innerHTML = '<option value="">Select a manager (optional)</option>';

    this.users.forEach(user => {
      const studentOption = document.createElement('option');
      studentOption.value = user.id;
      studentOption.textContent = user.username;
      this.studentSelect.appendChild(studentOption);

      const managerOption = document.createElement('option');
      managerOption.value = user.id;
      managerOption.textContent = user.username;
      this.managerSelect.appendChild(managerOption);
    });
  }

  async handleAssignTask(e) {
    e.preventDefault();
    console.log('AssignTaskDialog.handleAssignTask(e)');
    const selectedTask = this.taskSelect.value;
    const selectedStudent = this.studentSelect.value;
    const selectedManager = this.managerSelect.value;

    if (!selectedTask || !selectedStudent) {
      this.showError('Please select both a task and a student');
      return;
    }

    this.assignBtn.disabled = true;
    this.assignBtn.textContent = 'Assigning...';

    try {
      // Get the task_steps.id where step_order=3 for the selected task
      const { data: stepData, error: stepError } = await supabase
        .from('task_steps')
        .select('id')
        .eq('task_header_id', selectedTask)
        .eq('step_order', 3)
        .single();

      if (stepError) {
        console.error('Error fetching task step:', stepError);
        this.showError('Failed to find step 3 for selected task');
        return;
      }

      // Insert the assignment
      const { error: insertError } = await supabase
        .from('task_assignments')
        .insert({
          student_id: selectedStudent,
          manager_id: selectedManager || null,
          task_header_id: selectedTask,
          step_id: stepData.id
        });

      if (insertError) {
        console.error('Error inserting task assignment:', insertError);
        this.showError('Failed to assign task');
      } else {
        this.showSuccess('Task assigned successfully!');
        
        // Reset and close
        this.close();
      }
    } catch (error) {
      console.error('Error assigning task:', error);
      this.showError('An unexpected error occurred');
    } finally {
      this.assignBtn.disabled = false;
      this.assignBtn.textContent = 'Assign Task';
    }
  }

  showSuccess(message) {
    // Simple toast implementation
    this.showToast(message, 'bg-green-600');
  }

  showError(message) {
    this.showToast(message, 'bg-red-600');
  }

  showToast(message, bgColor) {
    // Remove any existing toast
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast fixed bottom-4 right-4 px-4 py-3 rounded-lg text-white shadow-lg ${bgColor} transition-opacity duration-300`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

//export { AssignTaskDialog };
/*
export function render(panel, query = {}) {
  const dialog = new AssignTaskDialog();
  dialog.render(panel, query);
}

export function render(panel, query = {}) {
  console.log('assignTask.js render() called');
  const dialog = new AssignTaskDialog();
  dialog.render(panel, query);

  }*/

  

  console.log('✅ assignTask.js: END - About to export render');


