import { appState } from '../../state/appState.js';
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';

console.log('autoRelateAppro.js loaded');

export async function render(panel, query = {}) {
    console.log('autoRelateAppro.render() - Background automation execution');
    
    try {
        await processRelationshipCreation();
        console.log('Relationship automation completed successfully');
        // No HTML needed - background execution
    } catch (error) {
        console.error('Relationship automation failed:', error);
        showToast('An error occurred in handling your answer: ' + error.message, 'error');
    }
}

async function processRelationshipCreation() {
    // Get data from appState.payload
    const payload = appState.payload;
    if (!payload) {
        throw new Error('No automation payload found');
    }
    
    // Process each relationship automation
    for (const automation of payload.automations) {
        if (automation.type === 'relationship') {
            console.log('Executing relationship creation:', automation); //logs okay 23:38 Oct 13
            
            // Extract required data
            const { relationship, ofApprofile, automationId } = automation; // Get automation row ID
            const userId = payload.source?.userId;
            console.log('userId:',userId, relationship, ofApprofile,'automationId:', automationId);
            //return; //test
            if (!relationship || !ofApprofile || !userId || !automationId) {
                throw new Error('Missing required data for relationship creation');
            }
            
            // Execute the database write
            const result = await executeIfPermitted(
                userId, 
                'autoRelateAppro', 
                {
                    approfile_is: userId,
                    relationship: relationship,
                    of_approfile: ofApprofile,
                    assigned_by_automation: automationId // Use the automation row ID for audit trail
                }
            );
            
            console.log('Relationship created:', result);
            showToast('Relationship created successfully!', 'success');
        }
    }
}