// ./assignTask.js 

import { appState } from '../../state/appState.js';
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { petitionBreadcrumbs } from '../../ui/breadcrumb.js';
import { AssignmentBase } from '../../utils/assignmentBase.js'; // base also used by assign survey
//import { AssignmentBase } from './assignmentBase.js'; //

console.log('assignTask.js loaded');

const userId = appState.query.userId;

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
    
    const dropdown01 = panel.querySelector('#dropdown001');
    if (!dropdown01) return;
    
    dropdown01.innerHTML = '<option value="">Select a task</option>';
    /*
    this.taskHeaders.forEach(task => {
      const option = document.createElement('option');
      option.value = task.id;
      option.textContent = task.name;
      dropdown01.appendChild(option);
    }); */
  }

  populateUserDropdowns(panel) { //NO!
    console.log('populateUserDropdowns()');
    
    const dropdown01 = panel.querySelector('#dropdown001');
    const dropdown02 = panel.querySelector('#dropdown02');
    const dropdown03 = panel.querySelector('#dropdown03');
    
    if (!dropdown02 || !dropdown03) return;
    dropdown01.innerHTML = '<option value="">Select survey</option>';
    dropdown02.innerHTML = '<option value="">Select a student</option>';
    dropdown03.innerHTML = '<option value="">Select a manager</option>';
    
    this.approfiles.forEach(file => {
      // Student option
      const studentOption = document.createElement('option');
      studentOption.value = file.id;
      studentOption.textContent = file.name;
      dropdown02.appendChild(studentOption);

      // Manager option
      const managerOption = document.createElement('option');
      managerOption.value = file.id;
      managerOption.textContent = file.name;
      dropdown03.appendChild(managerOption);
    });
  }

  updateSubmitButtonState(panel) {
    const dropdown01 = panel.querySelector('#dropdown01');
    const dropdown02 = panel.querySelector('#dropdown02');
    const dropdown03 = panel.querySelector('#dropdown03');
    const assignBtn = panel.querySelector('#assignBtn');
    
    if (!dropdown01 || !dropdown02 || !dropdown03 || !assignBtn) return;
    
    const dropdown01ed = dropdown01.value !== '';
    const dropdown02ed = dropdown02.value !== '';
    const dropdown03ed = dropdown03.value !== '';

    assignBtn.disabled = !(dropdown01ed && dropdown02ed);
    assignBtn.textContent = dropdown01ed && dropdown02ed
    ? 'Assign Task'
    : 'Select task and student first';  
  }
// the below isn't called but runs. Why is it passed args when it collects them from dropdowns?
  async processAssignment(panel) { // ✅ Override parent method
   // console.log('processAssignment() args of subject, item, but not used?', subjectId, itemId);
    
    const dropdown01 = panel.querySelector('#dropdown001');
    const dropdown02 = panel.querySelector('#dropdown002');
    const dropdown03 = panel.querySelector('#dropdown003');
    
    const taskHeaderId = dropdown01?.value;
    const studentId = dropdown02?.value;
    const managerId = dropdown03?.value;
    console.log('from dropdowns','task:',taskHeaderId, 'student:', studentId, 'manager:', managerId); // all undefined 23:18 Oct 30
    if (!taskHeaderId|| !studentId) {
      throw new Error('Task and student are required', dropdown01, dropdown02, dropdown03);
    }
    
    try {
      // Look up step 3 for this task (initial step)
      console.log('Looking up steps for task:', taskHeaderId);
      const steps = await executeIfPermitted(userId, 'readTaskSteps', {
        taskId: taskHeaderId
      });
      
      // Find step 3 (initial step)
      let stepId = null;
      const initialStep = steps.find(step => step.step_order === 3);
      if (initialStep) {
        stepId = initialStep.id;
        console.log('Found initial step_id:', stepId);
      } else {
        throw new Error('No initial step (step 3) found for task');
      }
      
      // Save task assignment to database
      const result = await executeIfPermitted(userId, 'createAssignment', {
        task_header_id: taskHeaderId,
        step_id: stepId,
        student_id: studentId,
        manager_id: managerId || null,
        assignedBy: userId // Current user doing the assignment
      });
      
      return result;
      
    } catch (error) {
      console.error('Task assignment failed:', error);
      throw error;
    }
  }
}