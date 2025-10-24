
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { appState } from '../../state/appState.js';

export async function render(panel, query = {}) {
    const userId = appState.query.userId;
    const studentId = userId;
  
    try {
      const surveys = await executeIfPermitted(userId, 'readStudentAssignments', {
        student_id: studentId,
        type: 'survey'
      });
  
      if (!surveys || surveys.length === 0) {
        panel.innerHTML = `<div class="text-gray-500 text-center py-8">No surveys assigned.</div>`;
        return;
      }
  
      panel.innerHTML = ''; // Clear panel
  
      for (const survey of surveys) {
        const surveyId = survey.survey_header_id;
        if (!surveyId) continue;
  
        // Create a container for this survey
        const surveyPanel = document.createElement('div');
        surveyPanel.classList.add('mb-8'); // Add spacing between surveys
        panel.appendChild(surveyPanel);
  
        // Update clipboard
        appState.query.clipboard = {
          surveyId: surveyId,
          as: 'survey'
        };
  
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
  