// ./assignTask.js 

import { appState } from '../../state/appState.js';
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
//import { showToast } from '../../ui/showToast.js';
import { petitionBreadcrumbs } from '../../ui/breadcrumb.js';
import { AssignmentBase } from '../../utils/assignmentBase.js'; // base also used by assign survey
//import { AssignmentBase } from './assignmentBase.js'; //
import {  resolveSubject} from '../../utils/contextSubjectHideModules.js'

console.log('assignTask.js loaded');

let userId = appState.query.userId; //legacy
let subject = null;
let totalSteps=null;
//base has   this.AssignmentDefaultMoveBy   which is changed if the radio buttons are clicked. Can be student | manager | auto

// Export function as required by the module loading system
export function render(panel, query = {}) {
  console.log('assignTask.render()', panel, query);

  if (!panel || !panel.isConnected) {
    console.warn('Render target not found or disconnected');
    return;
  }
  
  const dialog = new AssignTaskDialog(); // ✅ Use subclass
  dialog.render(panel, query);
}

class AssignTaskDialog extends AssignmentBase { // ✅ Extend base class
  constructor() {
    super('task'); // ✅ Call parent constructor
    this.taskHeaders = [];
    this.approfiles = [];  // 'students'  'managers' ????
    this.defaultManagerId = appState.query.defaultManagerId;// defaultManagerId
  }

  render(panel, query = {}) {
    console.log('AssignTaskDialog.render()', panel, query);
    
    this.panelEl = panel; // ✅ Store panel reference
    
    // Render the template with task-specific instructions
    panel.innerHTML = this.getTemplateHTML(
      'Assign Task 👨‍🔧    21:30 Oct 30 - new system',
      [
        'Select a task from your clipboard to assign.',
        'Choose a student to assign the task to.',
        'Optionally select a manager to oversee the assignment.',
        'Click "Assign Task" to create the assignment.',
        'The student will receive notifications about the task.'
      ]
    );
    
    // Initialize with task-specific data
    this.init(panel, query);

//    const informationFeedback = panel.querySelector('informationFeedback');
//this is decalred in assignmentBase, but maybe before the html is created

  }

  init(panel, query = {}) {
    console.log('AssignTaskDialog.init()');
    
    // Initialize clipboard integration (inherited)
    this.initClipboardIntegration(panel);
    
    // Attach common listeners (inherited)
    this.attachCommonListeners(panel); // two buttons in assignmentBase
    
    // Attach task-specific listeners
    this.attachTaskListeners(panel);
    }

  attachTaskListeners(panel) {
    console.log('attachTaskListeners()');
    
    // Task select change
    panel.querySelector('#dropdown001')?.addEventListener('change', (e) => {
      this.updateSubmitButtonState(panel);
    });

    // Student select change
    panel.querySelector('#dropdown002')?.addEventListener('change', (e) => {
      this.updateSubmitButtonState(panel);
    });

    // Manager select change
    panel.querySelector('#dropdown003')?.addEventListener('change', (e) => {
      this.updateSubmitButtonState(panel);
    });
  }

  populateTaskDropdown(panel) { // NO!
    console.log('populateTaskDropdown()');
    
    const dropdown001 = panel.querySelector('#dropdown001');
    if (!dropdown001) return;
    
    dropdown001.innerHTML = '<option value="">Select a task</option>';

  }

  populateUserDropdowns(panel) { //NO!
    console.log('populateUserDropdowns()');
    
    const dropdown001 = panel.querySelector('#dropdown001');
    const dropdown002 = panel.querySelector('#dropdown002');
    const dropdown003 = panel.querySelector('#dropdown003');
    
    if (!dropdown002 || !dropdown003) return;
    dropdown001.innerHTML = '<option value="">Select survey</option>';
    dropdown002.innerHTML = '<option value="">Select a student</option>';
    dropdown003.innerHTML = '<option value="">Select a manager</option>';
    
    this.approfiles.forEach(file => {
      // Student option
      const studentOption = document.createElement('option');
      studentOption.value = file.id;
      studentOption.textContent = file.name;
      dropdown002.appendChild(studentOption);

      // Manager option
      const managerOption = document.createElement('option');
      managerOption.value = file.id;
      managerOption.textContent = file.name;
      dropdown003.appendChild(managerOption);
    });
  }

  updateSubmitButtonState(panel) {
    const dropdown001 = panel.querySelector('#dropdown001');//01?  001?
    const dropdown002 = panel.querySelector('#dropdown002');
    const dropdown003 = panel.querySelector('#dropdown003');
    const assignBtn = panel.querySelector('#assignBtn');
    
    if (!dropdown001 || !dropdown002 || !dropdown003 || !assignBtn) return;
    
    const dropdown001ed = dropdown001.value !== '';
    const dropdown002ed = dropdown002.value !== '';
    const dropdown003ed = dropdown003.value !== '';

    assignBtn.disabled = !(dropdown001ed && dropdown002ed);
    assignBtn.textContent = dropdown001ed && dropdown002ed
    ? 'Assign Task'
    : 'Select task and student first';  
  }

//need to know the default 'moveBY' from task_header for this task (student | manager | auto )
//Need to dislay radio choices for moveBy, with the read default checked
//need display this default as 'checked'


decideNavButtonsToDisplay(){
console.log('decideNavButtonsToDisplay()');
//let defaultMoveBy = this.readTaskDefaultMoveBy();

if (currentStep <3) return; // where get currentStep ??


}

decideDefaultMoveBy(taskHeaderDefault){ // this default value needs to be read from the task_header table. Not yet implemented 25 March
  if(!taskHeaderDefault)
if (this.AssignmentDefaultMoveBy) return this.AssignmentDefaultMoveBy;
  else if (taskHeaderDefault) return taskHeaderDefault;
  else return 'manager';

  //The chosen value inside assignment is first choice. The value placed in task_headers is 2nd choice. If neither exists use 'manager'

}


async  readTaskDefaultMoveBy(){
  let defaultMoveBy = 'manager'; // is this needed or can we just use the value from the base ?
console.log('readTaskDefaultMoveBy()');
if(this.taskDefaultMoveBy) defaultMoveBy = this.taskDefaultMoveBy; //if the user has clicked on the assign radio buttons use that
//the value of who is in control of movement is taken from the task-header as a default value
// if the is no such set value (true for older tasks) let the local default take preferenc
return defaultMoveBy;
}


  async processAssignment(panel) { // ✅ Override parent method
   // console.log('processAssignment() args of subject, item, but not used?', subjectId, itemId);
    
    const dropdown001 = panel.querySelector('#dropdown001');
    const dropdown002 = panel.querySelector('#dropdown002');
    const dropdown003 = panel.querySelector('#dropdown003');
    
    const taskHeaderId = dropdown001?.value;
    const studentId = dropdown002?.value;

    if(dropdown003?.value) this.managerId=dropdown003?.value;
else this.managerId=appState.query.defaultManagerId;

 this.studentName = dropdown002.options[dropdown002.selectedIndex].text;//this includes: (clipboard)
 this.studentName = this.studentName.replace(' (clipboard)', '');
console.log('studentName',this.studentName);




    console.log('from dropdowns','task:',taskHeaderId, 'student:', studentId, 'manager:', this.managerId); // all undefined 23:18 Oct 30
    if (!taskHeaderId|| !studentId) {
      throw new Error('Task and student are required', dropdown001, dropdown002, dropdown003);
    }
    
    try {
      // Look up step 3 for this task (initial step)
      console.log('Looking up steps for task:', taskHeaderId);
      const taskSteps = await executeIfPermitted(userId, 'readTaskSteps', {
        taskId: taskHeaderId
      });
//to keep track of navigation buttons we need the total number of steps and the default moveBy from the task header
      totalSteps=taskSteps.length; //new 16:00 feb 23
     
this.defaultMoveBy = this.decideDefaultMoveBy(taskSteps.move_by);  //has the user clicked the radio buttons or do we use the task_header or just 'manager' ?


       // Find step 3 (initial step)
      let stepId = null;
      const initialStep = taskSteps.find(step => step.step_order === 3);
      if (initialStep) {
        stepId = initialStep.id;
        console.log('Found initial step_id:', stepId);
      } else {
        throw new Error('No initial step (step 3) found for task');
      }
  
      subject = await resolveSubject();
      this.userId=subject.id; 
      console.log('this.userId:',this.userId);

console.log('registry createAssignment:',
    'student_id:', studentId,
    'student_name:',this.studentName,
    'manager_id:', this.managerId,

    'defaultMoveBy:',this.defaultMoveBy,
    
    'assignment:', '{task_header:', taskHeaderId, 
    'step_id:', stepId,'}',
    'current_step:',3,
    'totalSteps:',totalSteps,
    'assigned_by:',this.userId);

      // Save task assignment to database
      const result = await executeIfPermitted(userId, 'createAssignment', { //what about current_step int?
        task_header_id: taskHeaderId,
        step_id: stepId,
        current_step:3,
        student_id: studentId,
        student_name: this.studentName,
        manager_id: this.managerId,
        assigned_by: this.userId, // Current user doing the assignment
        move_by: this.defaultMoveBy
      });
      
      return result;
      
    } catch (error) {
      console.error('Task assignment failed:', error);
      throw error;
    }
  }
}