// assignTask.js
import{executeIfPermitted} from '../../registry/executeIfPermitted.js';
import{showToast} from '../../ui/showToast.js';

/*
//import { executeIfPermitted } from '../executeIfPermitted.js';

const state = {
  user: 'your-user-id' // ← replace with dynamic user ID
};

export function render(panel, query = {}) {
  panel.innerHTML = getTemplateHTML();
  initElements(panel);
  attachListeners(panel);
  loadData();
}

function initElements(panel) {
  this.taskSelect = panel.querySelector('#taskSelect');
  this.studentSelect = panel.querySelector('#studentSelect');
  this.managerSelect = panel.querySelector('#managerSelect');
  this.assignBtn = panel.querySelector('#assignTaskBtn');
}

async function loadData() {
  try {
    const taskHeaders = await executeIfPermitted(state.user, 'readTaskHeaders', {});
    this.taskHeaders = taskHeaders || [];
    this.populateTaskDropdown();

    const approfiles = await executeIfPermitted(state.user, 'readApprofiles', {});
    this.approfiles = approfiles || [];
    this.populateUserDropdowns();
  } catch (error) {
    console.error('Failed to load data:', error);
    this.showError('Failed to load tasks or users.');
  }
}

function attachListeners(panel) {
  this.taskSelect.addEventListener('change', (e) => {
    // Optional: Load step 3 ID here if needed
  });
  this.assignBtn.addEventListener('click', handleAssignTask.bind(this));
}

async function handleAssignTask(e) {
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
    // Get step 3 ID for selected task
    const step3 = await executeIfPermitted(state.user, 'readStep3Id', {
      task_header_id: selectedTask
    });
    const step3Id = step3.id;

    // Create assignment
    const newAssignment = await executeIfPermitted(state.user, 'createAssignment', {
      student_id: selectedStudent,
      manager_id: selectedManager || null,
      task_header_id: selectedTask,
      step_id: step3Id
    });

    this.showSuccess('Task assigned successfully!');
    // Optionally close panel or reset form
  } catch (error) {
    console.error('Failed to assign task:', error);
    this.showError('Failed to assign task: ' + error.message);
  } finally {
    this.assignBtn.disabled = false;
    this.assignBtn.textContent = 'Assign Task';
  }
}

function populateTaskDropdown() {
  console.log('AssignTaskDialog.populateTaskDropdown()');
  this.taskSelect.innerHTML = '<option value="">Select a task</option>';
  this.taskHeaders.forEach(task => {
    const option = document.createElement('option');
    option.value = task.id;
    option.textContent = task.name;
    this.taskSelect.appendChild(option);
  });
}

function populateUserDropdowns() {
  console.log('AssignTaskDialog.populateUserDropdowns()');
  this.studentSelect.innerHTML = '<option value="">Select a student</option>';
  this.managerSelect.innerHTML = '<option value="">Select a manager (optional)</option>';

  this.approfiles.forEach(user => {
    const studentOption = document.createElement('option');
    studentOption.value = user.id;
    studentOption.textContent = user.name; // ← fixed: was username
    this.studentSelect.appendChild(studentOption);

    const managerOption = document.createElement('option');
    managerOption.value = user.id;
    managerOption.textContent = user.name; // ← fixed: was username
    this.managerSelect.appendChild(managerOption);
  });
}

function showSuccess(message) {
  showToast(message, 'bg-green-600');
}

function showError(message) {
  showToast(message, 'bg-red-600');
}

function showToast(message, bgColor) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast fixed bottom-4 right-4 px-4 py-3 rounded-lg text-white shadow-lg ${bgColor} transition-opacity duration-300`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function getTemplateHTML() {
  return `
    <div class="assign-task-dialog p-6">
      <h3 class="text-xl font-semibold mb-4">Assign Task</h3>
      <div class="space-y-4">
        <select id="taskSelect" class="w-full p-2 border rounded">
          <option value="">Select Task</option>
        </select>
        <select id="studentSelect" class="w-full p-2 border rounded">
          <option value="">Select Student</option>
        </select>
        <select id="managerSelect" class="w-full p-2 border rounded">
          <option value="">Select Manager (Optional)</option>
        </select>
        <button id="assignTaskBtn" class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
          Assign Task - waiting for selection
        </button>
      </div>
    </div>
  `;
}
*/


const state = {   //  THIS HAS TO BE DELETED  and see state.user in two lines.  <------------------------------------  magic number
  taskId: null,
  steps: [],
  user: '06e0a6e6-c5b3-4b11-a9ec-3e1c1268f3df' // Replace with dynamic user ID
}; //borrowed from create task 'magic numbers'

console.log('🔥 assignTask.js: START'); //output confirmed


export function render(panel, query = {}) {
  console.log('assignTask.js render() called');  //confirm logged  <------------------------
  const dialog = new AssignTaskDialog();dialog.render(panel, query);// works see line 191
}



class AssignTaskDialog {
 constructor() {
    // ✅ Remove DOM references from constructor
    this.taskHeaders = [];
    this.approfiles = [];
    // No DOM elements here
  }

  render(panel, query = {}) {
    console.log('AssignTaskDialog.render()'); // confirmed log  <-----------------------
    // ✅ Now the panel exists — inject HTML
    panel.innerHTML = this.getTemplateHTML(); //<------------ works

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
    console.log('AssignTaskDialog.init()');  // <------------------- works
    // Set up event listeners
    this.dialog.querySelectorAll('[data-action="close-dialog"]').forEach(el => {
      el.addEventListener('click', () => this.close());//why foreEach ?
    });

    this.assignBtn.addEventListener('click', (e) => this.handleAssignTask(e));

    this.taskSelect.addEventListener('change', this.updateSubmitButtonState.bind(this));
    this.studentSelect.addEventListener('change', this.updateSubmitButtonState.bind(this));
    this.managerSelect.addEventListener('change', this.updateSubmitButtonState.bind(this));
    
    this.loadTaskHeaders();  //<------------ works loads in dropdown
    this.loadApprofiles();

    // Populate dropdowns when dialog opens, but this never happens so moved functions above
    this.dialog.addEventListener('open', () => { // delete???
      console.log('dialog open'); // FAILS no log <-------------------------  doesn't know it is open
      this.loadTaskHeaders();
      this.loadApprofiles();
    });
  }

  updateSubmitButtonState() {
    const taskSelected = this.taskSelect.value !== '';
    const studentSelected = this.studentSelect.value !== '';
    const managerSelected = this.managerSelect.value !== '';

    if (taskSelected && studentSelected && managerSelected) {
      this.assignBtn.disabled = false; //only enable submit when all three selected (task, student, manager)
      this.assignBtn.textContent = 'Assign Task';

    };


    this.assignBtn.disabled = !(taskSelected && studentSelected && managerSelected);
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
// should remove listeners see lines 210, 215-217, 221

    this.dialog.classList.add('hidden');
    this.dialog.classList.remove('flex');
    
    // Reset form
    this.form.reset();
    this.assignBtn.disabled = true;
  }



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
          <label for="taskSelect" class="block text-sm font-medium text-gray-700" data-form="title">Three dropdown choices needed</label>
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

          <label for="studentSelect" class="block text-sm font-medium text-gray-700" data-form="dropdown-01">you need to select a Task, Student, & Manager</label>
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
          <label for="managerSelect" class="block text-sm font-medium text-gray-700" data-form="dropdown-02">The student can also be the manager for some tasks</label>
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
          <p> DEV:
            Currently using 'name' from app_profiles table. Drop down will not scale. 
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
          Assign Task awaitng selections
        </button>
      </form>
    </div>
  </div>
</div>
</div>
`;

  }
  
 // read task_headers
  async loadTaskHeaders() {
    console.log('AssignTaskDialog.loadTaskHeaders()');
    try {
      const taskHeaders = await executeIfPermitted(state.user, 'readTaskHeaders', {});
      this.taskHeaders = taskHeaders || [];
      this.populateTaskDropdown();
    } catch (error) {
      console.error('Error fetching task headers:', error);
      this.showError('An unexpected error occurred');
    }
  }


// readApprofiles
    async loadApprofiles() {
      console.log('AssignTaskDialog.loadApprofiles()');
      try {
        const approfiles = await executeIfPermitted(state.user, 'readApprofiles',{});
        this.approfiles = approfiles || [];
        this.populateUserDropdowns();
      } catch (error) {
        console.error('Error fetching approfiles:', error);
        this.showError('Failed to load approfiles');
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
    this.managerSelect.innerHTML = '<option value="">Select a manager</option>';
//console.log('');
    this.approfiles.forEach(file => {
//      console.log('fileId',file.name);
      const studentOption = document.createElement('option');
      studentOption.value = file.id;
      studentOption.textContent = file.name;
      this.studentSelect.appendChild(studentOption);

      const managerOption = document.createElement('option');
      managerOption.value = file.id;
      managerOption.textContent = file.name;
      this.managerSelect.appendChild(managerOption);
    });
  }




  //

  async checkToAvoidDuplicates({student_id:student_id, manager_id: manager_id,task_header_id:task_header_id}){
console.log('checkToAvoidDuplicates() CODE IGNORES the result - need edit')
//added function to registry  //readAssignmentExists()
const data = await executeIfPermitted(state.user, 'readAssignmentExists', {
        student_id:student_id,
      //  manager_id: manager_id || null,
        task_header_id:task_header_id   
      });
  
if(data) console.log('This student has already been assigned to this task', data);

//if(!data)return 0;// its okay to go ahead because not already in there
return  data;
//if(step==1 || step==2) return step //previous assignment abandoned or completed, make a decision      
// assign again or move student back to step 3 of old assignment?      
//      */
  }
  
  async handleAssignTask(e) {
    e.preventDefault();
    console.log('AssignTaskDialog.handleAssignTask(e)');
    this.assignBtn.disabled = true;

    const task_header_id = this.taskSelect.value;
    const student_id = this.studentSelect.value;
    const manager_id = this.managerSelect.value;
  
    if (!task_header_id || !student_id || !manager_id) {
      this.showError('Not found all 3 needed id');
      return;  //unlikely as button is disabled until all three are selected
    }
  

  
    try { // should check if this assignment has already been made & is not completed or abandonded???
      this.assignBtn.textContent = 'Finding task step...';

      const step3 = await executeIfPermitted(state.user, 'readStep3Id', { task_header_id });
     // const step_id = step3?.id;
  
      if (!step3) {this.assignBtn.textContent = 'Failed to find task step...';
        throw new Error('Step 3 not found', step3); return}
      this.assignBtn.textContent = 'Found task step... check to avoid duplicates';


      const data = this.checkToAvoidDuplicates({student_id:student_id, manager_id: manager_id || null,task_header_id:task_header_id});
//what to do ??  don't know


      const newAssignment = await executeIfPermitted(state.user, 'createAssignment', {
        student_id:student_id,
        manager_id: manager_id || null,
        task_header_id:task_header_id,
        step_id:step3
      });  
      this.assignBtn.textContent = 'Assigned ! - select others or close';  
      this.showSuccess('HandleAssignTask: assigned successfully!');
    } catch (error) {
      this.showError('Failed to assign task: ' + error.message);
    } finally {
      this.assignBtn.disabled = true;
      //this.assignBtn.textContent = 'Assign Task -waiting for selection';
    }
  }
  
//



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
    }, 5000);
  }
}

//


//

  

  console.log('✅ assignTask.js: END - About to export render');

  //export { render, AssignTaskDialog };
 
//duplicate export error in parser
//but commented out error failed to load module 
// dialog.render is not a function
//try this:
export {AssignTaskDialog};