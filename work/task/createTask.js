// ./js/forms/createTask.js

class CreateTaskDialog {
  constructor() {
    this.dialog = document.getElementById('createTaskDialog');
    this.taskForm = document.getElementById('createTaskForm');
    this.stepForm = document.getElementById('createStepForm');
    
    // Task form elements
    this.taskName = document.getElementById('taskName');
    this.taskDescription = document.getElementById('taskDescription');
    this.taskUrl = document.getElementById('taskUrl');
    this.saveTaskBtn = document.getElementById('saveTaskBtn');
    this.taskNameCounter = document.getElementById('taskNameCounter');
    this.taskDescriptionCounter = document.getElementById('taskDescriptionCounter');
    
    // Step form elements
    this.stepName = document.getElementById('stepName');
    this.stepDescription = document.getElementById('stepDescription');
    this.stepUrl = document.getElementById('stepUrl');
    this.stepOrder = document.getElementById('stepOrder');
    this.saveStepBtn = document.getElementById('saveStepBtn');
    this.addStepBtn = document.getElementById('addStepBtn');
    this.stepsList = document.getElementById('stepsList');
    this.createdSteps = document.getElementById('createdSteps');
    this.stepsSection = document.getElementById('stepsSection');
    
    // Display elements
    this.authorName = document.getElementById('authorName');
    this.creationDate = document.getElementById('creationDate');
    this.taskIdDisplay = document.getElementById('taskIdDisplay');
    
    this.savedTaskId = null;
    this.steps = [];
    
    this.init();
  }

  init() {
    // Set up event listeners
    this.dialog.querySelectorAll('[data-action="close-dialog"]').forEach(el => {
      el.addEventListener('click', () => this.close());
    });

    // Task form
    this.taskForm.addEventListener('submit', (e) => this.handleSaveTask(e));
    this.taskName.addEventListener('input', () => {
      this.taskNameCounter.textContent = `${this.taskName.value.length}/64 characters`;
    });
    this.taskDescription.addEventListener('input', () => {
      this.taskDescriptionCounter.textContent = `${this.taskDescription.value.length}/256 characters`;
    });

    // Step form
    this.stepForm.addEventListener('submit', (e) => this.handleSaveStep(e));
    this.stepName.addEventListener('input', () => {
      this.stepNameCounter.textContent = `${this.stepName.value.length}/64 characters`;
    });
    this.stepDescription.addEventListener('input', () => {
      this.stepDescriptionCounter.textContent = `${this.stepDescription.value.length}/256 characters`;
    });
    this.addStepBtn.addEventListener('click', () => {
      this.stepOrder.value = parseInt(this.stepOrder.value) + 1;
    });

    // Set current date
    this.creationDate.textContent = new Date().toLocaleString();
  }

  async open() {
    // Get current user info
    const {  user, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      this.showError('Authentication required');
      return;
    }

    // Set author name
    const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown';
    this.authorName.textContent = userName;
    
    this.resetForm();
    this.dialog.classList.remove('hidden');
    this.dialog.classList.add('flex');
  }

  close() {
    this.dialog.classList.add('hidden');
    this.dialog.classList.remove('flex');
    this.resetForm();
  }

  resetForm() {
    // Reset task form
    this.taskForm.reset();
    this.taskNameCounter.textContent = '0/64 characters';
    this.taskDescriptionCounter.textContent = '0/256 characters';
    
    // Reset step form
    this.stepForm.reset();
    this.stepOrder.value = 3;
    this.stepNameCounter.textContent = '0/64 characters';
    this.stepDescriptionCounter.textContent = '0/256 characters';
    
    // Reset state
    this.savedTaskId = null;
    this.steps = [];
    
    // Hide displays
    this.taskIdDisplay.classList.add('hidden');
    this.createdSteps.classList.add('hidden');
    this.stepsSection.classList.add('opacity-50', 'pointer-events-none');
  }

  async handleSaveTask(e) {
    e.preventDefault();
    
    const {  user, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      this.showError('Authentication required');
      return;
    }

    this.saveTaskBtn.disabled = true;
    this.saveTaskBtn.textContent = 'Saving Task...';

    try {
      const { data, error } = await supabase
        .from('task_headers')
        .insert({
          name: this.taskName.value,
          description: this.taskDescription.value,
          external_url: this.taskUrl.value || null,
          author_id: user.id
        })
        .select()
        .single();

      if (error) {
        this.showError('Failed to create task: ' + error.message);
      } else {
        this.savedTaskId = data.id;
        this.taskIdDisplay.textContent = `Task ID: ${data.id}`;
        this.taskIdDisplay.classList.remove('hidden');
        
        this.stepsSection.classList.remove('opacity-50', 'pointer-events-none');
        this.showSuccess('Task created successfully!');
        
        // Disable task fields
        this.taskName.disabled = true;
        this.taskDescription.disabled = true;
        this.taskUrl.disabled = true;
      }
    } catch (error) {
      this.showError('An unexpected error occurred');
    } finally {
      this.saveTaskBtn.disabled = false;
      this.saveTaskBtn.textContent = 'Save Task';
    }
  }

  async handleSaveStep(e) {
    e.preventDefault();
    
    const {  user, error: authError } = await supabase.auth.getUser();
    if (authError || !user || !this.savedTaskId) {
      this.showError('Authentication required or task not saved');
      return;
    }

    const order = parseInt(this.stepOrder.value);
    if (order < 3) {
      this.showError('Step order must be 3 or higher');
      return;
    }

    this.saveStepBtn.disabled = true;
    this.saveStepBtn.textContent = 'Saving Step...';

    try {
      let error;
      
      if (order === 3) {
        // Update existing step 3
        const { error: updateError } = await supabase
          .from('task_steps')
          .update({
            name: this.stepName.value,
            description: this.stepDescription.value,
            external_url: this.stepUrl.value || null,
          })
          .eq('task_header_id', this.savedTaskId)
          .eq('step_order', 3);
        error = updateError;
      } else {
        // Insert new step
        const { error: insertError } = await supabase
          .from('task_steps')
          .insert({
            name: this.stepName.value,
            description: this.stepDescription.value,
            external_url: this.stepUrl.value || null,
            step_order: order,
            task_header_id: this.savedTaskId,
            author_id: user.id
          });
        error = insertError;
      }

      if (error) {
        this.showError('Failed to create step: ' + error.message);
      } else {
        // Add to local steps array
        this.steps.push({
          name: this.stepName.value,
          description: this.stepDescription.value,
          order: order,
          external_url: this.stepUrl.value
        });
        
        // Update display
        this.createdSteps.classList.remove('hidden');
        this.updateStepsList();
        
        // Reset form
        this.stepForm.reset();
        this.stepOrder.value = order + 1;
        this.stepNameCounter.textContent = '0/64 characters';
        this.stepDescriptionCounter.textContent = '0/256 characters';
        
        this.showSuccess('Step created successfully!');
      }
    } catch (error) {
      this.showError('An unexpected error occurred');
    } finally {
      this.saveStepBtn.disabled = false;
      this.saveStepBtn.textContent = 'Save Step';
    }
  }

  updateStepsList() {
    this.stepsList.innerHTML = '';
    this.steps.forEach((step, index) => {
      const div = document.createElement('div');
      div.className = 'text-sm p-2 bg-gray-50 rounded';
      div.textContent = `Step ${step.order}: ${step.name}`;
      this.stepsList.appendChild(div);
    });
  }

  showSuccess(message) {
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
window.CreateTaskDialog = CreateTaskDialog;

// Usage example:
/*
// Open the dialog
const createDialog = new CreateTaskDialog();
createDialog.open();

// Or attach to a button
document.getElementById('openCreateDialog').addEventListener('click', () => {
  const dialog = new CreateTaskDialog();
  dialog.open();
});
*/