import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { appState } from '../../state/appState.js';

//NOTE: the automation functions in DISPLAY_TASK read from the automations Table
//BUT those functions were copied here and adapted to instead expect different names for variables because
// the export version is built to use data from survey_view or task_view which clearly distinguish
//between source-columns and target-columns (Is the stepId from the source task or from the task you want to assign?)
//At some time the DISPLAY TASK module should refator to use the task_view instead of direct table access Dec 25 20252

//let subject = null;
let subjectId = null;
const authUserId = appState.query.defaultManagerId;


export async function executeAutomations(automations, subject){
  console.log('executeAutomations() automations, subject',automations, ' ',subject); return;
automations.forEach(auto => {
//console.log('this automation:',  ' is_deleted', auto.is_deleted, 'values:', auto);

if(auto.auto.is_deleted) {console.log('fails on test of auto.is_deleted');return;} //
//console.log('passed check of is_deleted'); //
//if(auto.deleted_at || auto.deleted_by) { console.error ('Database error: says not is_deleted, but says deleted_at or deleted_by');return}
//the above two are not in the view, it seems
//console.log('passed check of deleted_at, deleted_by');
//if(source_task_step_id != )
//appro-is probably not in the auto. The current subject (user) becomes the appro_is
if(!auto.target.appro_is_id) auto.target.appro_is_id = subject.id;
if(auto.target.appro_is_id && auto.target.relationship && auto.target.of_appro_id) autoRelateAppros(auto.id,auto.target.appro_is_id, auto.target.relationship, auto.target.of_appro_id);
else 
if(auto.target.task_header_id && auto.target.task_step_id){ if(!auto.manager_id) auto.manager_id = appState.query.defaultManagerId;
  autoAssignTask(auto.id,auto.target.task_header_id, auto.target.task_step_id, auto.student_id, auto.manager_id);
}  
else
if(auto.target.survey_header_id) autoAssignSurvey(auto.id,auto.target.survey_header_id);
else
if(auto.message_from_id && auto.message_text && auto.message_to_id) autoSendMessage(auto.id,auto.message_from_id, auto.message_text, auto.message_to_id);
else
if(auto.from_step && auto.to_step) autoMoveStudent(auto.id,auto.from_step, auto.to_step);

});

} 

async function autoRelateAppros(auto_id,appro_is_id, relationship, of_appro_id) {
  console.log('autoRelateAppros()');

  try{//func needs  const { approfile_is, relationship, of_approfile, assigned_by_automation } = payload; assigned by is a uuid
const newRelation = await executeIfPermitted(authUserId, 'autoRelateAppro', {
  approfile_is:appro_is_id, 
  relationship:relationship, 
  of_approfile:of_appro_id, 
  assigned_by_automation:auto_id
}) // can't use the newUserId as not auth. Need to use a db function
console.log('related:', newRelation);



} catch (error) { //console.log(error.message);
console.log('Failed to relate appro: ' + error.message);
  showToast('Failed to relate appro: ' + error.message, 'error');
    }

}

async function autoAssignTask(auto_id,task_header_id, task_step_id, student_id, manager_id){//is this a student from auto or the current subject???
console.log('autoAssignTask()','auto:',auto_id,'task:',task_header_id, 'step:',task_step_id,'student:'. student_id, 'manager:',manager_id);  
//autoAssignTask
/* //function needs: 
        student_id: student_id,
        manager_id: manager_id, // or derive from context
        task_header_id: task_header_id,
        step_id: step_id,
        assigned_by_automation: assigned_by_automation 
*/
if(!student_id)student_id =subjectId; //the current subject is assumed to be the one to become the student, unless student was set in the automation
try{//func needs   const { task_header_id, step_id, student_id, manager_id, assigned_by_automation } = payload;
const assignedTask = await executeIfPermitted(authUserId, 'autoAssignTask', { // who is authUserId? Needs DEFINER
        task_header_id: task_header_id, 
        step_id: task_step_id,
        student_id: student_id,
        manager_id: manager_id, 
        assigned_by_automation: auto_id//needs current stepId No. Needs automation.id
}) 
console.log('assignedTask:', assignedTask);

} catch (error) { //console.log(error.message);
console.log('Failed to assign: ' + error.message);
  showToast('Failed to assign: ' + error.message, 'error');
    }

}


async function autoAssignSurvey(auto_id,survey_header_id){//assignements constrains duplications by a partial index, but code should check first.
console.log('autoAssignSurvey()','auto_id:',auto_id,'survey id:',survey_header_id); //surevys don't really have a student, but the assignment requires student_id to identify to person who will receieve the survey

// the registry checks if assignment already exists & ignores it.
//in theory the automation could assign someone else to a survey, but that has not currently been built into survey automations (dec24 2025)
// Therefore, student_id should be subject_id
const student_id =subjectId; //the current subject is assumed to be the one to become the student, unless student was set in the automation
//func needs const { survey_header_id,  student_id, assigned_by_automation } = payload;
const assignedTask = await executeIfPermitted(authUserId, 'autoAssignSurvey', { // who is authUserId? Needs DEFINER
        survey_header_id: survey_header_id,        
        student_id: student_id,
        assigned_by_automation: auto_id//needs current stepId No violates FK Needs automation.id
}) 
//console.log('If Databse replied it says the assignedTask id:', assignedTask);

}
async function autoSendMessage(auto_id,message_from_id, message_text, message_to_id){
console.log('autoSendMessage()');  

}
async function autoMoveStudent (auto_id,from_step, to_step){
console.log('autoMoveStudent()');  

}




/* the data from the automations table (12:00 Dec 24 2025) is like this:

is_deleted: false  // code if(is_deleted) return
deleted_at: null  // if (deleted_at) throw error if !is_deleted
deleted_by: null

//auto metadata
id: "33ff38b0-a2c3-4be7-98a5-2e393cc23755"
name: "T&M Testers - A few questions and tips (INCOMPLETE)"
description: null
created_at: "2025-11-26T17:48:08.341532+00:00"
last_updated_at: null
automation_number: 2

//auto relate appros
appro_is_id: null
relationship: null
of_appro_id: null

//unsure what this is for
appro_relations_id: null //? Future removal of relation?

//auto assign task
task_header_id: null
task_step_id: null
student_id: null
manager_id: null

//not sure what this is for
task_assignment_id: null //? Future removal of assignment?


//auto assign a survey
survey_header_id: "13a400ff-a94a-49b8-8468-76595f4e94e8"

//auto move student (future plan)
from_step: null 
to_step: null

//auto send message (future plan)
message_from_id: null
message_text: null
message_to_id: null

//should match current step if currently in display Task. If not there is an error
source_task_step_id: "629a9589-1d6a-4dbb-be9d-fd6b9a260a10"

//should current answer match if currently in display survey. If not there is an error
survey_answer_id: null

*/