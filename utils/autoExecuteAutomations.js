import { appState } from '../../state/appState.js';
//import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import {autoRelateAppro} from '../work/approfiles/autoRelateAppro.js'
import {autoAssignTask} from '../work/task/autoAssignTask.js'


export async function render(panel, query={}){ 
   const { automations } = appState.query.payload;
   if (!Array.isArray(automations)) throw new Error('Payload must contain an array of automations');
  //else 
  console.log('autoExecute..automations:', automations);  //with survey test 1  task assignment, the array is empty
  // 18:53 0ct 30 log shows:
  //[{ 
  // approfile_is:"efc..." , 
  // automationId: "590...",
  // ofApprofile: "24cf...", 
  //  relationship:"member"
  // type:"relationship"}] 

  console.log('Processing automations:', automations);
  
  for (const automation of automations) {
    try {
      console.log('Executing automation:', automation);  
      /* console log 18;50 Nov 1 2025
      automationId: "ef7f45af-ad0d-4ae4-afc2-bc4b5903dce1" correct 
      stepId: "c83496a0-8c5e-47e5-bcee-19b121191c68"​ correct 'step 3'
      studentId: "02077621-4745-449e-891c-f7d6fc2b70bf" correct  'disable'
      taskId: "72c4250c-956a-4463-9cbf-3b9a09cf08b2" correct 'default task'
      type: "task"  correct
     */
     
      let result;
      
      switch (automation.type) {
        case 'relationship':
          result = await autoRelateAppro(automation);
          break;
        case 'task':
          result = await autoAssignTask(automation);
          break;
        default:
          console.warn('Unknown automation type:', automation.type);
      }
      
      console.log('Automation result:', result); // 
      
    } catch (error) {
      console.error('Automation failed:', error);
    }
  }

  }
  