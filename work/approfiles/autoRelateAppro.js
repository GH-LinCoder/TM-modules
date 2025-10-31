import { appState } from '../../state/appState.js';
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
//Needs to be rewritten to handle a single automation at a time not forEach
console.log('autoRelateAppro.js loaded');

export async function autoRelateAppro(automations) {
    console.log('autoRelateAppro - Background automation execution'); // logs 19:00 oct 30
    //1 
    try {
       const result = await processRelationshipCreation(automations);
        console.log('Relationship automation completed successfully', result); // logs 19:00 Oct 30 undefined
        // No HTML needed - background execution
    } catch (error) {
        console.error('Relationship automation failed:', error);
        showToast('An error occurred in handling your answer: ' + error.message, 'error');
    }
}

async function processRelationshipCreation(automations) {
    // Get data from appState.payload  as at 12:00 Oct 30 the format is
    // I don't know if it is one or many entries
    /*
              type: 'relationship',
              relationship: row.relationship,
              ofApprofile: row.of_appro_id,
              automationId: row.automation_id
    */
   /* 13:00 Oct 30  logged from displaySurevy.js line 230 appState.query.payload
automationId: "5800951e-c201-4151-82c0-8ffb39d67252"
ofApprofile: "24cf072f-f4af-42a5-9d09-f82e14a2139a"
relationship: "member"
type: "relationship"
*/  // no such thing as .automations
console.log('processRelationshipCreation()');

//    const {automations} = appState.query.payload;
    if (!automations) {
        throw new Error('No automation payload found');
    }
    
    // Process each relationship automation  // 30 oct - they come individually?
   
        if (automations.type === 'relationship') { // NOT LOGGING 19:00 Oct 30
            console.log('Executing relationship creation:', automations); //logs okay 23:38 Oct 13
            
            // Extract required data
            const { approfile_is, relationship, ofApprofile, automationId } = automations; // Get automation row ID
            const userId = appState.query.userId;
            console.log('userId', userId,'is:', approfile_is, relationship,'of:', ofApprofile,'auto:', automationId);
            //return; //test
            if (!approfile_is ||!relationship || !ofApprofile || !userId || !automationId) {
                throw new Error('Missing required data for relationship creation');
            }
            
            // Execute the database write
            const result = await executeIfPermitted(
                userId, 
                'autoRelateAppro', 
                {
                    approfile_is: approfile_is,  //Was using userId which is arbitrary currently and not updated when a new subject chosen
                    relationship: relationship,
                    of_approfile: ofApprofile,
                    assigned_by_automation: automationId // Use the automation row ID for audit trail
                }
                
            ); 
            
//            console.log('Relationship created:', result);
//            showToast('Relationship created successfully!', 'success');
            console.log('AutoRelateAppro wrote to db:', result);  // 19:00 Oct 30 NOT LOGGING
return result;

        } console.log('type not recognised as relationhsip');
    
}