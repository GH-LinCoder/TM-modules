// ./work/tasks/createTaskForm.js

import { appState } from '../../state/appState.js';

import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';
import { showToast } from '../../ui/showToast.js';
import {  resolveSubject} from '../../utils/contextSubjectHideModules.js';
import {icons} from '../../registry/iconList.js';

console.log('createTaskForm.js loaded');

let taskId = null;
await resolveSubject();// resolve puts the auth and appro values in appState
const userAuthId = appState.query.userAuthId;
const userApproId = appState.query.userId;      
console.log('userAuthId:',userAuthId, 'userApproId:',userApproId);





    // ========================================
    // DISPLAY FORM, POPULATE, ATTACH LISTENERS - TASK
    // ========================================


export function render(panel, query = {}) {
  console.log('Render(', panel, query, ')');
  panel.innerHTML = getTemplateHTML();
  populateForm(panel);
  attachSaveButtonListener(panel);
  attachCounterListeners(panel);
}


    // ========================================
    // GENERATE NAME - TASK
    // ========================================

async function populateForm(panel){
    console.log('populateForm()');
    await resolveSubject();;
    const userName = appState.query.userName
    
    const name = icons.task +' published by: ' + userName +' - '+ Date.now();

        const nameEl = panel.querySelector('#taskName');
        nameEl.value = name;
        const descriptionEl = panel.querySelector('#taskDescription');
        descriptionEl.value = 'First publish this template task, then you or someone else can edit it. Publication and editing can be by different persons. The initial name & description are auto-generated. ';
}


    // ========================================
    // LISTENER ON SAVE BUTTON - TASK
    // ========================================


    function attachSaveButtonListener(panel){
        console.log('attachSaveButtonListener()');
        panel.addEventListener('click', (e) => {
        // Save task button
        console.log('CLICK attachSaveButtonListener',e.target.id);
        if (e.target.id === 'saveTaskBtn') {
            e.preventDefault();
            handleTaskPublish(e, panel);
            return;
        }
})
}


    // ========================================
    // LISTENERS ON INPUTS - TASK
    // ========================================

function attachCounterListeners(panel){
     panel.addEventListener('input', (e) => {
        if (e.target.id === 'taskName') {
            panel.querySelector('#taskNameCounter').textContent = `${e.target.value.length}/128 characters`;
        } else if (e.target.id === 'taskDescription') {
            panel.querySelector('#taskDescriptionCounter').textContent = `${e.target.value.length}/2000 characters`;
        }

})
}
 // ========================================
    // DATA OPERATIONS - TASK
    // ========================================

    async function handleTaskPublish(e, panel) { 
        console.log('handletaskPublish()');
        e.preventDefault();

        const name = panel.querySelector('#taskName')?.value.trim();
        const description = panel.querySelector('#taskDescription')?.value.trim();

        const saveBtn = panel.querySelector('#saveTaskBtn');
        
        if (!name || !description) {//this was for manual input
            showToast('task name and description are required', 'error');
            return;
        }
        
        if(taskId) { // at start taskId is null. If it has a value there must a task already saved. 
                            // Therefore  generate a new task and re-arm the save button
            populateForm(panel); //generates a new name for a new task
            saveBtn.textContent = 'New task ready to be published:' + name + '';
            taskId = null; //can only save a task if this is null (if it has a value we regenerate instead of savng )
            return // avoid immediate saving}
        }

        if (!taskId) { // We assume that the current task has not been saved. taskId takes a value after a save
            
            saveBtn.textContent = 'Saving task Header...';
            saveBtn.disabled = true;
            saveBtn.style.opacity = '0.5';  
            saveBtn.style.pointerEvents = 'none';

          const auth = appState.query.userAuthId;
          const  appro = appState.query.userId;

            try {
                const result = await executeIfPermitted(auth, 'createTask', { // AUTH (auth) goes first, DATA (author_id) goes in the payload
                    taskName: name,
                    taskDescription: description,
                    author_id: appro 
                });
                taskId = result.id; //suveyId now has a value, so prevent saving it again            
                
                saveBtn.style.opacity = '1';  
                saveBtn.style.pointerEvents = 'auto';
                saveBtn.textContent = 'task ' + name + ' - - - Click again to generate a new task';
                saveBtn.disabled = false;
                
                
                addInformationCard({ //uses taskBase
                    'name': `${result.name}...`,
                    'type': 'task',
                    'id': `${result.id}...`
                });
                

                showToast('task header saved successfully!');
            } catch (error) {
                console.error('Creating task header', error);
                showToast('Failed to create task: ' + error.message, 'error');
                saveBtn.disabled = false;
                saveBtn.textContent = 'Save task Header';
            }
        }
        
    }


function addInformationCard(stepData) { 
  console.log('addInformationCard()');
  const infoSection = document.querySelector('#informationSection');
  const card = document.createElement('div');
 // card.className = 'bg-white p-2 rounded border mb-1 text-sm';
 const style = 'bg-white p-2 rounded border mb-3 text-lg font-bold';;
 console.log('style:',style);
 card.className= style;
//       card.className = styleCardByType(stepData.type); //not calling the function
  // Create display text by iterating through all properties
  let displayText = ''; // used to be 'Saved' but seems redundant
  
  // Iterate through all properties in the object
  for (const [key, value] of Object.entries(stepData)) {
      if (key !== 'timestamp') {
          displayText += `, ${key}: ${value}`;
      }
  }
  console.log('type',stepData.type);
  const icon = icons.task;
  card.textContent = icon + displayText;
  infoSection.appendChild(card);
  
  // Add to steps array
  //steps.push(stepData);
  //console.log('steps array:', steps);
}


// In createTaskForm.js, modify the getTemplateHTML function to include automation cards:
function getTemplateHTML() {
          console.log('getTemplateHTML()');
    return `
      <div id="createTaskDialog" class="create-task-dialogue relative z-10 flex flex-col h-full">
        <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 z-10 max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b border-gray-200 flex justify-between items-center">
            <h3 class="text-xl font-semibold text-gray-900">Create New Task  08:37 Aug 30</h3>
            <button data-action="close-dialog" class="text-gray-500 hover:text-gray-700" aria-label="Close">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
                           <!--  INSTRUCTIONS  TASKS  -->      

            <div class="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 class="font-medium text-gray-800 mb-2">Instructions:</h4>
                <lu class="list-disc list-inside mt-2 text-sm text-gray-500">
                 <li>First check if a suitable task already exists</li>
                 <li>Plan your task. If you are passing the task to an editor, put the editor's username in the name panel & write instructions in the description</li>
                 <li>Then assign that editor to the task using the 'Assign Task' module with the editor as 'student'.</li>
                 
                 <!-- li>NOTE: You will be the manager 💼 of the task you are creating. </li>
                 <li>If you want to appoint someone else as manager click the [Select] menu</li>
                 <li>Then use the drop down at the top of the form to appoint the manager</li-->
                </lu>
            </div>
                    <div class="mb-1 md:mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
               
                       <h4 class="text-ml font-bold text-gray-400 ">There are many types of task</h4>
                       <ul class="list-disc list-inside mt-2 text-sm text-gray-400">
                        
                        <li> A text heavy or video training course</li>
                        <li> An empty set of markers to track the progress of some process</li>
                        <li> A self-managed process</li>
                        <li> A supervised process managed by someone else</li>
                        <li> A computer only process with no human involvement</li>
                        <li> You can build your own tasks and attach automations</li>
                        <li> The first step is to have a unique and meaningful name for your new task</li>
                       </ul>

                    </div>





          <!--div class="p-6">  
            <!--  Manager Select  -->
            <!--div class="space-y-2">
              <label for="managerSelect" class="block text-sm font-medium text-gray-700">You will be the manager of the task. If you want someone else to be the manager you need to user the Select module to choose the manager</label>
              <select id="managerSelect" data-form="managerSelect" class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Select a manager (optional)</option>
              </select>
            </div-->
  
            <div id="createTaskForm" class="space-y-6 bg-gray-50 p-6 rounded-lg">
              <div>
                <label for="taskName" class="block text-sm font-medium text-gray-700 mb-1">
                  Task Name *
                </label>
                <input id="taskName" placeholder="Short & unique appealing task name" maxlength="64" required class="w-full p-2 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                <p id="taskNameCounter" class="text-xs text-gray-500 mt-1">0/64 characters</p>
              </div>
  
              <div>
                <label for="taskDescription" class="block text-sm font-medium text-gray-700 mb-1">
                  Task Description *
                </label>
                <textarea id="taskDescription" placeholder="Task description" rows="4" maxlength="2000" required class="w-full p-2 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
                <p id="taskDescriptionCounter" class="text-xs text-gray-500 mt-1">0/2000 characters</p>
              </div>
  
              <!--div>
                <label for="taskUrl" class="block text-sm font-medium text-gray-700 mb-1">
                  URL (Optional)
                </label>
                <input id="taskUrl" type="url" placeholder="https://example.com  " class="w-full p-2 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div-->


              <button id="saveTaskBtn" class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
                Click to publish
              </button>


              
              <!--  Rating Select  -->
            <!--div class="space-y-2">  needs {getMoveByRadioHTML()}
              <label for="ratingSelect" class="block text-sm font-medium text-gray-700">Every appro, task & survey is rated for trustSecurity. It defaults to the minimum</label>
              <select id="ratingSelect" data-form="ratingSelect" class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Change rating (optional)</option>
              </select>
            </div-->

        </div>              
              
      </div>


            <div class="bg-green-100 flex flex-col md:flex-row justify-center gap-4 pt-4 border-t border-gray-200">
                            <p class="text-lg font-bold">Information:</p>
                            <div id="informationSection" class="w-full">
                                <!-- Information cards will be added here -->
                            </div>
                        </div>
          </div>
        </div>
      </div>
       ${petitionBreadcrumbs()} 
      `
  }
