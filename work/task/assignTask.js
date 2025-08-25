// assignTask.js

class AssignTaskDialog {
  constructor() {
    this.dialog = document.getElementById('assignTaskDialog');
    this.form = document.getElementById('assignTaskForm');
    this.taskSelect = document.getElementById('taskSelect');
    this.studentSelect = document.getElementById('studentSelect');
    this.managerSelect = document.getElementById('managerSelect');
    this.assignBtn = document.getElementById('assignTaskBtn');
    
    this.taskHeaders = [];
    this.users = [];
    
    this.init();
  }

  init() {
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
    this.dialog.classList.remove('hidden');
    this.dialog.classList.add('flex');
    
    // Dispatch custom event
    this.dialog.dispatchEvent(new CustomEvent('dialog:open'));
  }

  close() {
    this.dialog.classList.add('hidden');
    this.dialog.classList.remove('flex');
    
    // Reset form
    this.form.reset();
    this.assignBtn.disabled = true;
  }

  async loadTaskHeaders() {
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
    this.taskSelect.innerHTML = '<option value="">Select a task</option>';
    
    this.taskHeaders.forEach(task => {
      const option = document.createElement('option');
      option.value = task.id;
      option.textContent = task.name;
      this.taskSelect.appendChild(option);
    });
  }

  populateUserDropdowns() {
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

// Make available globally
window.AssignTaskDialog = AssignTaskDialog;

// Usage example:
/*
// Open the dialog
const assignDialog = new AssignTaskDialog();
assignDialog.open();

// Or attach to a button
document.getElementById('openAssignDialog').addEventListener('click', () => {
  const dialog = new AssignTaskDialog();
  dialog.open();
});
*/