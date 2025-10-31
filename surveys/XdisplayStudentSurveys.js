import { appState } from '../../state/appState.js';
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';

import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';

import { icons } from '../../registry/iconList.js'; 
import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';
import {  detectContext,resolveSubject, applyPresentationRules} from '../../utils/contextSubjectHideModules.js'

let subject = resolveSubject();
let subjectId = subject.id;
let subjectName = subject.name;

const userId = appState.query.userId;
let panelEl = null;
 
onClipboardUpdate(() => {
  console.log('onClipboardUpdate  SURVEYS');
 let subject = resolveSubject();
 subjectId =subject.id;
 subjectName = subject.name;
 
  render(panelEl);  // I made it a global to have the onclick outside the render function
//  if (!isMyDash) populateApprofileSelect(panel); // optional
});

//if (!isMyDash) { // do stuff if this module has an admin user version
//   populateApprofileSelect(panel);
//   attachDropdownListener(panel);
//   attachClickItemListener(panel); //allows click on the display to change subject of display
//}




console.log('displayStudentSurveys.js loaded 20:55 Oct 27');

export async function render(panel, query = {}) {
  panelEl = panel;
  let subject = resolveSubject();
  subjectId =subject.id;
  console.log('subjectId:',subjectId);
    try {
      const surveys = await executeIfPermitted(userId, 'readStudentAssignments', {
        student_id: subjectId,
        type: 'survey'
      });
  console.log('surveys',surveys);
      if (!surveys || surveys.length === 0) {
        panel.innerHTML = `<div class="text-gray-500 text-center py-8">No surveys assigned.</div>`;
        return;
      }
  
      panel.innerHTML = ''; // Clear panel
  
      for (const survey of surveys) {
        const surveyId = survey.survey_header_id;
        const surveyName = survey.survey_name;
        if (!surveyId) continue;
  
        // Create a container for this survey
        const surveyPanel = document.createElement('div');
        surveyPanel.classList.add('mb-8'); // Add spacing between surveys
        panel.appendChild(surveyPanel);
  

//new 11:55 Oct 26 copied from selector

    const clipboardItem = {
      entity: {
        id: surveyId,
        name: surveyName,
        type: 'survey',
        item: survey
      },
      as: 'survey',
      meta: {
        timestamp: Date.now(),
        source: 'display-student-surveys',
        id: `clipboard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }
    };

    // Store
    if (!appState.clipboard) appState.clipboard = [];
    appState.clipboard.push(clipboardItem);


/*
        // Update clipboard  NO!  This overwrites the clipboard !! 
        appState.query.clipboard = {
          surveyId: surveyId,
          as: 'survey'
        };
  */
        // Load and render the survey module into this container
        const displayModule = await import('../surveys/displaySurveyQwen.js');
        if (displayModule && typeof displayModule.render === 'function') {
          await displayModule.render(surveyPanel, query);
        }
      }
  
    } catch (error) {
      console.error('Error loading surveys:', error);
      showToast('Failed to load surveys', 'error');
    }
  }
  