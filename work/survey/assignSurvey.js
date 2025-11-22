//  ./surveys/assignSurveys.js

import { appState } from '../../state/appState.js';
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { petitionBreadcrumbs } from '../../ui/breadcrumb.js';
import { AssignmentBase } from '../../utils/assignmentBase.js'; // ✅ Import base class

console.log('assignSurvey.js loaded');

const userId = appState.query.userId;

// Export function as required by the module loading system
export function render(panel, query = {}) {
  console.log('assignSurvey.render()', panel, query);
  
  if (!panel || !panel.isConnected) {
    console.warn('Render target not found or disconnected');
    return;
  }
  
  const dialog = new AssignSurveyDialog(); // ✅ Use subclass
  dialog.render(panel, query);
}

class AssignSurveyDialog extends AssignmentBase { // ✅ Extend base class
  constructor() {
    super('survey'); // ✅ Call parent constructor
    this.surveyHeaders = [];
    this.approfiles = [];  // 'respondents'  'managers' ????
  }

  render(panel, query = {}) {
    console.log('assignSurveyDialog.render()', panel, query);
    
    this.panelEl = panel; // ✅ Store panel reference
    
    // Render the template with survey-specific instructions
    panel.innerHTML = this.getTemplateHTML(
      'Assign survey 👨‍🔧    21:30 Oct 30 - new system',
      [
        'Select a survey from your clipboard to assign.',
        'Choose a respondent to assign the survey to.',
        'Optionally select a manager to oversee the assignment.',
        'Click "Assign survey" to create the assignment.',
        'The respondent will see notifications of the survey.'
      ]
    );
    
    // Initialize with survey-specific data
    this.init(panel, query);
  }

  init(panel, query = {}) {
    console.log('assignSurveyDialog.init()');
    
    // Initialize clipboard integration (inherited)
    this.initClipboardIntegration(panel);
    
    // Attach common listeners (inherited)
    this.attachCommonListeners(panel); // two buttons in assignmentBase

//this.attachDropdownListeners(panel, [1, 2]); // surveys use two dropdowns
this.attachSurveyListeners(panel);
}

  attachSurveyListeners(panel) {
    console.log('attachSurveyListeners()');
    
    // survey select change  WHAT IS THIS ????? 
    panel.querySelector('#dropdown001')?.addEventListener('change', (e) => {
      this.updateSubmitButtonState(panel);
    });

    // respondent select change
    panel.querySelector('#dropdown002')?.addEventListener('change', (e) => {
      this.updateSubmitButtonState(panel);
    });

    // Manager select change. Not relevant to surveys
    /* panel.querySelector('#dropdown003')?.addEventListener('change', (e) => {
      this.updateSubmitButtonState(panel);
    }); */
  }

  populatesurveyDropdown(panel) { // NO!
    console.log('populatesurveyDropdown()');
    
    const dropdown01 = panel.querySelector('#dropdown001');
    if (!dropdown01) return;
    
    dropdown01.innerHTML = '<option value="">Select a survey</option>';
/*
    this.surveyHeaders.forEach(survey => {
      const option = document.createElement('option');
      option.value = survey.id;
      option.textContent = survey.name;
      dropdown01.appendChild(option);
    }); */
  }

  populateUserDropdowns(panel) { ////not used ? could do to change text on the dropdowns
    console.log('populateUserDropdowns()');
    
    const dropdown01 = panel.querySelector('#dropdown001');
    const dropdown02 = panel.querySelector('#dropdown002');
    const dropdown03 = panel.querySelector('#dropdown003');
    
    if (!dropdown02 || !dropdown03) return;
    dropdown01.innerHTML = '<option value="">Select survey</option>';
    dropdown02.innerHTML = '<option value="">Select respondent</option>';
    dropdown03.innerHTML = '<option value="">not used</option>';
    
    this.approfiles.forEach(file => {
      // respondent option
      const respondentOption = document.createElement('option');
      respondentOption.value = file.id;
      respondentOption.textContent = file.name;
      dropdown02.appendChild(respondentOption);

      // Manager option
      const managerOption = document.createElement('option');
      managerOption.value = file.id;
      managerOption.textContent = file.name;
      dropdown03.appendChild(managerOption);
    });
  }

  updateSubmitButtonState(panel) {
    const dropdown01 = panel.querySelector('#dropdown001');
    const dropdown02 = panel.querySelector('#dropdown002');
   // const dropdown03 = panel.querySelector('#dropdown003');
    const assignBtn = panel.querySelector('#assignBtn');
    
    if (!dropdown01 || !dropdown02 || !assignBtn) return;
    
    const dropdown01ed = dropdown01.value !== '';
    const dropdown02ed = dropdown02.value !== '';
    //const dropdown03ed = dropdown03.value !== '';

    assignBtn.disabled = !(dropdown01ed && dropdown02ed);
    assignBtn.textContent = dropdown01ed && dropdown02ed
    ? 'Assign survey'
    : 'Select survey and respondent first'; 
  }


// the below isn't called but runs. Why is it passed args when it collects them from dropdowns?
  async processAssignment(panel) { // ✅ Override parent method
   // console.log('processAssignment() args of subject, item, but not used?', subjectId, itemId);
    
    const dropdown01 = panel.querySelector('#dropdown001');
    const dropdown02 = panel.querySelector('#dropdown002');
    const dropdown03 = panel.querySelector('#dropdown003');
    
    const surveyHeaderId = dropdown01?.value;
    const respondentId = dropdown02?.value;
    const managerId = dropdown03?.value || 'none';
    console.log('from dropdowns','survey:',surveyHeaderId, 'respondent:', respondentId, 'manager:', managerId); // all undefined 23:18 Oct 30
    if (!surveyHeaderId|| !respondentId) {
      throw new Error('survey and respondent are required', dropdown01, dropdown02, dropdown03);
    }
    
    try {
//this code reminds us that perhaps surveys will autogenerate Q1 and A1 and may need to
//be found. But as at Oct 30 there is no need to find Q1 or A1
      // Look up step 3 for this survey (initial step)
/*
       console.log('Looking up steps for task:', taskHeaderId);
      const steps = await executeIfPermitted(userId, 'readTaskSteps', {
        taskId: taskHeaderId
      });
      
      // Find step 3 (initial step)
    //  let stepId = null;
    //  const initialStep = steps.find(step => step.step_order === 3);
      if (initialStep) {
        stepId = initialStep.id;
        console.log('Found initial step_id:', stepId);
      } else {
        throw new Error('No initial step (step 3) found for task');
      } */
      
      // Save survey assignment to database
      const result = await executeIfPermitted(userId, 'createAssignment', {
        survey_header_id: surveyHeaderId,
       // step_id: stepId,
        student_id: respondentId,
      //  manager_id: managerId || null,
        assignedBy: userId // Current user doing the assignment
      });
      
      return result;
      
    } catch (error) {
      console.error('Survey assignment failed:', error);
      throw error;
    }
  }
}