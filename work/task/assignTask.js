// assignTask.js
import{executeIfPermitted} from '../../registry/executeIfPermitted.js';
import{showToast} from '../../ui/showToast.js';
import { appState } from '../../state/appState.js'; // modules interact through appState

////////////////////////////////////////////  DEV    must CHANGE 
/*
const state = {   //  THIS HAS TO BE DELETED  and see userId in two lines.  <------------------------------------  magic number
  taskId: null,
  steps: [],
  user: '06e0a6e6-c5b3-4b11-a9ec-3e1c1268f3df' // Replace with dynamic user ID
}; //borrowed from create task 'magic numbers'
*/
const userId = appState.query.userId;// first use of the global userId 15:15 sept 16

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

    this.informationFeedback = this.dialog.querySelector('[data-task="information-feedback"]'); 

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
    <div class="bg-green-100 flex flex-col md:flex-row justify-center gap-4 pt-4 border-t border-gray-200">
       <p class="text-lg font-bold"> Information:</p><p data-task="information-feedback">??</>
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
      const taskHeaders = await executeIfPermitted(userId, 'readTaskHeaders', {});
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
        const approfiles = await executeIfPermitted(userId, 'readApprofiles',{});
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
const data = await executeIfPermitted(userId, 'readAssignmentExists', {
        student_id:student_id,
      //  manager_id: manager_id || null,
        task_header_id:task_header_id   
      });
if(data ) console.log('This student has already been assigned to this task', data);

//Should check if 
// completed  -> can assign again
//abandoned -> can assign again 

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

      const step3 = await executeIfPermitted(userId, 'readStep3Id', { task_header_id });
     // const step_id = step3?.id;
  
     if (!step3) {
      this.assignBtn.textContent = 'Failed to find task step...';
      throw new Error(`Step 3 not found for task_header_id: ${task_header_id}`);
    }
    
      this.assignBtn.textContent = 'Found task step... check to avoid duplicates';


      const existing = await this.checkToAvoidDuplicates({
        student_id:student_id, 
        manager_id: manager_id || null,
        task_header_id:task_header_id
      });



      if (existing && existing.length > 0) {
        

        const currentStep = existing[0].step_order;
          this.informationFeedback.innerHTML =`<p>This student has already been assigned to this task</p>
            <p>If the task is still active it cannot be assigned again</p>
            <p> The current step is [${currentStep}] </p>`;
if(currentStep===1) {this.informationFeedback.innerHTML+='<p>The task was abandoned</p>'} else
if(currentStep==2) {this.informationFeedback.innerHTML+='<p>The task was completed</p>'}else 
{this.informationFeedback.innerHTML+='<p>The task is active and cannot be assigned to the same student</p>'
  }
if(currentStep===1 || currentStep===2) {'<p>The task is active and can be assigned again to the same student</p>'}
else return;
// If 1 or 2 the new assignment happens without the admin having time to consider anything. There should be a confirmation.

      }

      const newAssignment = await executeIfPermitted(userId, 'createAssignment', {
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

 // console.log('✅ assignTask.js: END - About to export render');

  //export { render, AssignTaskDialog };
 
//duplicate export error in parser
//but commented out error failed to load module 
// dialog.render is not a function
//try this:
export {AssignTaskDialog};