import { appState } from '../../state/appState.js';
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';

console.log('autoAssignTask.js loaded');

const userId = appState.query.userId;
const defaultManagerId = '9066554d-1476-4655-9305-f997bff43cbb'; // Lin Coder as default manager

export async function autoAssignTask(automation) {
    console.log('autoAssignTask.render() - Background automation execution');
    
    try {
        await processTaskAssignment(automation);
        console.log('Task assignment automation completed successfully');
        // No HTML needed - background execution
    } catch (error) {
        console.error('Task assignment automation failed:', error);
        showToast('An error occurred in handling your answer: ' + error.message, 'error');
    }
}

async function processTaskAssignment(automation) {
    // Get data from appState.payload
    
    if (!automation) {
        throw new Error('No automation payload found');
    }
    

        if (automation.type != 'task') {
            console.log('Not a task assignment:', automation.type);
            return}


/*               !!!!!!!!!!!!!!!!!!!!!!!!!     Needs to check if assignment already exists, and only go ahead if adbandoned or completed             !!!!!!!!!!!!!!!!!!!!!!!!!!!!                             */
       /* console log from autoExeceuteAutomations 18;50 Nov 1 2025
       automation ={
      automationId: "ef7f45af-ad0d-4ae4-afc2-bc4b5903dce1" //correct 
      stepId: "c83496a0-8c5e-47e5-bcee-19b121191c68"​ //correct 'step 3'
      studentId: "02077621-4745-449e-891c-f7d6fc2b70bf" //correct  'disable'
      taskId: "72c4250c-956a-4463-9cbf-3b9a09cf08b2" //correct 'default task'
      type: "task" //  correct
        }
     */           
            // Extract required data  // 12:46 Oct 14 'automations' only contains type:'task', taskId: , missing stepId and needs to get userId from payload.source.userId
            const { taskId, stepId, automationId, studentId, managerId } = automation; // Get automation contents  
            

            // Set default after destructuring

const actualManagerId = managerId || defaultManagerId;
console.log('actualManagerId:', actualManagerId);
            
            if (!taskId || !stepId || !userId || !automationId || !studentId || !actualManagerId) {
                throw new Error('Missing required data for task assignment');
            }
            
            // Execute the database write
            const result = await executeIfPermitted(
                userId, 
                'autoAssignTask', 
                {
                    task_header_id: taskId,
                    step_id: stepId,
                    student_id: studentId,
                    assigned_by_automation: automationId, // Use the automation row ID for audit trail
                    manager_id:actualManagerId
                }
            );
            
            console.log('Task assignment created:', result);
            showToast('Task assignment created successfully!', 'success');
            return result;
        }