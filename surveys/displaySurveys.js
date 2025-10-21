import { appState } from '../state/appState.js';
import { executeIfPermitted } from '../registry/executeIfPermitted.js';
import { showToast } from '../ui/showToast.js';
import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';
import { icons } from '../registry/iconList.js'; 


// displaySurveys.js - Modified to read from task_assignments
export function render(panel, query = {}) {
    console.log('displaySurveys.render()', panel, query);
    
    const display = new SurveyDisplay();
    display.render(panel, query);
}

class SurveyDisplay {  // This code doesn't know the format of the data that is returned from the function. Also what is this code trying to do?
    async render(panel, query = {}) {
        console.log('SurveyDisplay.render()', panel, query);
        
        // GET STUDENT ID FROM CLIPBOARD OR QUERY:
        const studentId = query.student || this.getCurrentStudentId();
        
        try {
            // READ ASSIGNED SURVEYS FROM task_assignments:
            const combinedData = await executeIfPermitted(   // the function returns an object data: taskData & data:surveyData
                studentId, 
                'readStudentAssignments', 
                { student_id: studentId }
            );
            console.log('combinedData:',combinedData);  //This doesn't seem to inlcude surveys 20:14 Oct 21
            if (!assignedSurveys || assignedSurveys.length === 0) {  // this needs to use the object
                panel.innerHTML = this.getNoSurveysHTML();
                return;
            }
            
            // RENDER SURVEY SELECTOR:
            panel.innerHTML = this.getSurveySelectorHTML(assignedSurveys);
            
            // ATTACH LISTENERS:
            this.attachListeners(panel, assignedSurveys);
            
        } catch (error) {
            console.error('Error loading assigned surveys:', error);
         //   panel.innerHTML = this.getErrorHTML(error.message);
        }
    }
    
    getSurveySelectorHTML(assignedSurveys) {
        return `
            <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-xl font-semibold mb-4">My Assigned Surveys</h2>
                
                <div class="mb-4">
                    <label class="block text-sm font-medium mb-2">Select a survey to take:</label>
                    <select id="assignedSurveySelect" class="w-full p-2 border rounded">
                        <option value="">Choose a survey...</option>
                        ${assignedSurveys.map(survey => `
                            <option value="${survey.survey_header_id}">
                                ${survey.survey_name} (${survey.status || 'Available'})
                            </option>
                        `).join('')}
                    </select>
                    <button id="takeAssignedSurveyBtn" class="mt-2 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                        Take Selected Survey
                    </button>
                </div>
                
                <div id="assignedSurveyDisplayArea" class="mt-6"></div>
            </div>
        `;
    }
    
    attachListeners(panel, assignedSurveys) {
        const surveySelect = panel.querySelector('#assignedSurveySelect');
        const takeBtn = panel.querySelector('#takeAssignedSurveyBtn');
        const displayArea = panel.querySelector('#assignedSurveyDisplayArea');
        
        takeBtn?.addEventListener('click', async () => {
            const selectedSurveyId = surveySelect?.value;
            if (!selectedSurveyId) {
                showToast('Please select a survey first', 'error');
                return;
            }
            
            try {
                // LOAD AND DISPLAY SELECTED SURVEY:
                const surveyModule = await import('./displaySurvey.js');
                surveyModule.render(displayArea, { surveyId: selectedSurveyId });
                
            } catch (error) {
                console.error('Error loading survey:', error);
                showToast('Failed to load survey: ' + error.message, 'error');
            }
        });
    }
}