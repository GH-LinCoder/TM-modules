import { appState } from '../../state/appState.js';
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';

console.log('autoAssignTask.js loaded');

export async function autoAssignTask(panel, query = {}) {
    console.log('autoAssignTask.render() - Background automation execution');
    
    try {
        await processTaskAssignment();
        console.log('Task assignment automation completed successfully');
        // No HTML needed - background execution
    } catch (error) {
        console.error('Task assignment automation failed:', error);
        showToast('An error occurred in handling your answer: ' + error.message, 'error');
    }
}

async function processTaskAssignment() {
    // Get data from appState.payload
    const payload = appState.payload;
    if (!payload) {
        throw new Error('No automation payload found');
    }
    
    // Process each task automation
    for (const automation of payload.automations) {
        if (automation.type === 'task') {
            console.log('Executing task assignment:', automation);

/* from displaySurvey.js 
 automationData.push({
                        type: 'task',
                        taskId: row.task_header_id,
                        stepId:row.task_step_id,
                        automationId:row.automation_id
*/
/* autoTaskAssign line 30 log

automationId: "789b34c9-65e0-4861-b147-e96a6fe0d0fd"
​
stepId: "c83496a0-8c5e-47e5-bcee-19b121191c68"
​
taskId: "72c4250c-956a-4463-9cbf-3b9a09cf08b2"
​
type: "task"

*/


/*               !!!!!!!!!!!!!!!!!!!!!!!!!     Needs to check if assignment already exists, and only go ahead if adbandoned or completed             !!!!!!!!!!!!!!!!!!!!!!!!!!!!                             */
            
            // Extract required data  // 12:46 Oct 14 'automations' only contains type:'task', taskId: , missing stepId and needs to get userId from payload.source.userId
            const { taskId, stepId, automationId, managerId } = automation; // Get automation row ID  
            const userId = payload.source?.userId;

            // Set default after destructuring
const defaultManagerId = '9066554d-1476-4655-9305-f997bff43cbb'; // Lin Coder as default manager
const actualManagerId = managerId || defaultManagerId;
console.log('actualManagerId:', actualManagerId);
            
            if (!taskId || !stepId || !userId || !automationId) {
                throw new Error('Missing required data for task assignment');
            }
            
            // Execute the database write
            const result = await executeIfPermitted(
                userId, 
                'autoAssignTask', 
                {
                    task_header_id: taskId,
                    step_id: stepId,
                    student_id: userId,
                    assigned_by_automation: automationId, // Use the automation row ID for audit trail
                    manager_id:actualManagerId
                }
            );
            
            console.log('Task assignment created:', result);
            showToast('Task assignment created successfully!', 'success');
        }
    }
}