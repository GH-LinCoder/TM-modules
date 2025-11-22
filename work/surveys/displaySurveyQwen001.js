//  ./surveys/displaySurevyQwen.js

console.log('displaySurveyQwen.js loaded');
import { appState } from '../state/appState.js';
import { executeIfPermitted } from '../registry/executeIfPermitted.js';
import { showToast } from '../ui/showToast.js';
import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';
import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';
/*
  // Listen for clipboard updates
  onClipboardUpdate(() => {
    populateSurveySelect(panel);

panel.innerHTML+=petitionBreadcrumbs();//this reads 'petition' and prints the values at bottom of the render panel

many modules have forgotten to run these two things

*/



// Export function as required by the module loading system
export function render(panel, query = {}) {
    const display = new SurveyDisplay();
    display.render(panel, query);
}

const userId = appState.query.userId;

class SurveyDisplay {
    constructor() {
        // No state needed yet - just display
    }

    async render(panel, query = {}) {
        console.log('SurveyDisplay.render(', panel, query, ')');
        
        // Get survey ID from query parameter
        //const surveyId = query.surveyId;
        const surveyId ='efc9f836-504f-44e7-95be-cda9107f9fea';
        if (!surveyId) {
            showToast('Survey ID is required', 'error');
            return;
        }
        
        try {
            // Load survey data
            const surveyData = await executeIfPermitted(userId, 'readSurveyView', { survey_id: surveyId });
            
            if (!surveyData || surveyData.length === 0) {
                showToast('Survey not found', 'error');
                return;
            }
            
            // Display the header information
            panel.innerHTML = this.getHeaderHTML(surveyData[0]);
            
        } catch (error) {
            showToast('Failed to load survey: ' + error.message, 'error');
            console.error('Survey display error:', error);
        }
    }

    getHeaderHTML(surveyInfo) {
        return `
            <div id="surveyDisplay" class="survey-display relative z-10 flex flex-col h-full">
                <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 z-10 max-h-[90vh] overflow-y-auto">
                                       
 <div class="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
    <h4 class="text-ml font-bold text-blue-500 mb-4">Surveys</h4>
    <ul class="list-disc list-inside mt-2 text-sm text-blue-500">
     <li> One of our mottoes is: "Have your say, do your bit."</li>
     <li> We use surveys as a key part of both those things.</li>
     <li> Some of the answers you give can start you on a journey into the organisation</li>
     <li> Your responses create a greater understanding of your aims. </li>
     <li>The author of the survey may have attached what we call 'automations' to some of the answers so that the computer can recommend tasks or groups to join or training that is available or they may generate invitations to events</li>
     <!--li></li>
     <li></li>
     <li></li-->
    </ul>  
</div>

 <div class="p-6 border-b border-gray-200 justify-center items-center text-center">
                        <h2 class="text-xl font-semibold text-gray-900">${surveyInfo.survey_name || 'Survey'}</h2>
                    </div>

                    <div class="bg-gray-200 p-6 space-y-6">
                        <div class="space-y-4">
                            <div class="bg-white p-4 rounded-lg border border-gray-300">
                                <!--h4 class="font-medium text-gray-800 mb-2">Description</h4-->
                                <p class="text-gray-700 ">${surveyInfo.survey_description || 'No description provided'}</p>
                                <p class="text-xs text-gray-500 mt-2">
                                    Created: ${new Date(surveyInfo.survey_created_at).toLocaleDateString()} | 
                                    Author: ${surveyInfo.author_id || 'Unknown'}
                                </p>
                            </div>
                            
                            <div class="bg-green-100 p-4 rounded-lg border border-green-300  justify-center items-center text-center">
                                <p class="text-green-800 font-medium">Survey ready to begin</p>
                                <p class="text-green-700 text-sm mt-1">
                                    Click the button below to start the survey.
                                </p>
                                   <button id="startSurveyBtn" class="mt-3 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                                    Consent & Continue
                                </button>

                            </div>

                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}