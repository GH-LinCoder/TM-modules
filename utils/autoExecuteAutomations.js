import { appState } from '../../state/appState.js';
//import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import {autoRelateAppro} from '../work/approfiles/autoRelateAppro.js'
import {autoAssignTask} from '../work/task/autoAssignTask.js'


export async function render(panel, query={}){ 
   const { automations } = appState.query.payload;
   if (!Array.isArray(automations)) throw new Error('Payload must contain an array of automations');
  //else 
  console.log('autoExecute..automations:', automations);  
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
      
      console.log('Automation result:', result); // ← ADD THIS
      
    } catch (error) {
      console.error('Automation failed:', error);
    }
  }


  /* replced the below 19:08 Oct 30
    for (const automation of automations) {
      switch (automation.type) {
        case 'relationship':
          await autoRelateAppro(automation);  // in that function no log
          break;
        case 'task':
          await autoAssignTask(automation);
          break;
        default:
          console.warn('Unknown automation type:', automation.type);
      }
    }  */
  }
  