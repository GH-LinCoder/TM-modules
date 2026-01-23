import { executeIfPermitted } from '../registry/executeIfPermitted.js';
import { showToast } from '../ui/showToast.js';
import { appState } from '../state/appState.js';
import { createSupabaseClient } from '../db/supabase.js';

// The Supabase client is created once and passed to the functions.
const supabase = createSupabaseClient();


//NOTE: the automation functions in DISPLAY_TASK read from the automations Table
//BUT those functions were copied here and adapted to instead expect different names for variables because
// the export version is built to use data from survey_view or task_view which clearly distinguish
//between source-columns and target-columns (Is the stepId from the source task or from the task you want to assign?)
//At some time the DISPLAY TASK module should refactor to use the task_view instead of direct table access Dec 25 20252

//let subject = null;
//let subjectId = null;
//const authUserId = appState.query.defaultManagerId;


export async function executeAutomations(automations, subject, autoPetition){//autoPetition gathers the data to be sent to permissions_judge
  console.log('executeAutomations() automations:',automations, ', subject: ',subject,', autoPetition:', autoPetition);//subject correct here but is getting changed wrongly 16:40 dec 26
automations.forEach(auto => {
//console.log('this automation:',  ' is_deleted', auto.is_deleted, 'values:', auto);

if(auto.auto_deleted_at) {console.log('fails on test of auto.is_deleted auto_id:',auto.auto_id,'dated:', auto.auto_deleted_at);return;} //this is very confuing in that if any auto is deleted it logs it


autoPetition.automation_id = auto.auto_id;
//console.log('auto',auto,' auto id:',auto.auto_d,'autoPetition',autoPetition);
//at this point autoPetition contains all the parameters to be passed to permissions_judge (the rpc function)
/* a typical content
autoPetition: 

myAuthId: "424c977b-15e0-494b-a0fb-e367b46f3762"
myApproId: "86955f1c-1b24-495c-800a-f4c34c1e88a8"

myTaskId: null
myStepId: null

mySurveyId: "efc9f836-504f-44e7-95be-cda9107f9fea"
mySurveyanswerId: "5fb89dfb-0c2d-484f-a1b2-18f59f70db66"
myAssignmentId: "74d4adf6-5e84-4d0a-911d-b390f4a0945f"
myAutomationId: "9e7d491c-02f3-4e40-9396-09ca42b6b068"
*/

//needs to pass more than the autoPetition needs to send the 'auto' as well. This contains the detail parameters specifying the actions to be taken.
//the client could extract them or let the db function do this

/* auto is a row from the automations table. The columns will increase when extra automations are added. OR they need a different table structure

  id uuid not null default gen_random_uuid (),
  name text null default '''unknown'''::text,
  description text null,
  created_at timestamp with time zone not null default now(),
  last_updated_at timestamp with time zone null,
  deleted_at timestamp with time zone null,
  deleted_by uuid null,
  is_deleted boolean null default false,
  automation_number integer null,
  
  student_id uuid null,

  task_header_id uuid null, // the task to be assigned
  task_step_id uuid null,
  manager_id uuid null,

  survey_header_id uuid null, //the survey to be assigned
  survey_answer_id uuid null,
  
  appro_is_id uuid null, //the appros to be related --this is okay now, but will fail if later we have a break relation requirement 
  relationship text null,     //because no way to tell if this tuplet is make or break - and can't do toggle as that wouldn't be idempotent
  of_appro_id uuid null,

  from_step integer null,// not yet implemented functionJan 15
  to_step integer null,// not yet implementedfunction Jan 15

  message_to_id uuid null,// not yet implemented function Jan 15
  message_from_id uuid null,// not yet implemented function Jan 15
  message_text uuid null,// not yet implementedfunction Jan 15

  appro_relations_id uuid null,// not yet implemented function Jan 15

  source_task_step_id uuid null,
  source_survey_answer,  <------------ added Jan 16 12:24
  
source_data, //json of several of the above columns (new system to replace legacy) 
target_data, //json of several of the above columns (new system to replace legacy)
auto_registry_id,  FK to automations_registry which names the function to be called and the params needed
 
task_assignment_id uuid null,//  not yet implemented function Jan 15
  
*/
/*
extract the parameters to send as object  name:value pairs
the db function can lookup in automations_registry what parameters are required by. 


*/
//this system needs to be replaced with a look-up. The registry has the function expected parameters

console.log('auto:',auto, 'SOURCE auto.survey_id',auto.survey_id, 'TARGET auto.target', auto.target);// auto.target undefined when assign survey. So how does relate_appros work?
console.log('auto.target_task_header_id:',auto.target_task_header_id,'auto.target_task_step_id',auto.target_task_step_id,'auto.student_id',auto.student_id);
//using legacy method based on automations table having columns for the parameters; decide which function to call and send parameters
if(!auto.target_appro_is_id) auto.target_appro_is_id = subject.id; //auto_relate_appros tested working Jan 18 2026
else console.log('subject is explicit in the automation.Appro_is_id:', auto.target_appro_is_id,) //HERE: is the automation forcing a different subject?
if(auto.target_appro_is_id && auto.target_relationship && auto.target_of_appro_id) 
  autoRelateAppros(auto.auto_id,auto.target_appro_is_id, auto.target_relationship, auto.target_of_appro_id, autoPetition);
else //step was null 15:20 Jan 21

//student_id ? this isn't in the automation. Has to be obtained from subject
//step_id ?
//both null 15:40 jan 21

if(auto.target_task_header_id && auto.target_task_step_id){ if(!auto.manager_id) auto.manager_id = appState.query.defaultManagerId;
  //console.log ('auto.id:',auto.id,'task:',auto.target_task_header_id,'step:', auto.target_task_step_id, 'student:',subject.id,'manager:', auto.manager_id);
  autoAssignTask(auto.target_task_header_id, auto.target_task_step_id, subject.id, auto.manager_id, autoPetition);
}  
else
if(auto.survey_id )  // the autoPettion seems to use survey_id  not survey_header_id 
{ console.log("AUTO OBJECT:", JSON.stringify(auto, null, 2));

  autoAssignSurvey(auto._id,auto.survey_id,auto.target_survey_header_id, autoPetition);}// need the target survey not the one being
else
if(auto.message_from_id && auto.message_text && auto.message_to_id) autoSendMessage(auto.id,auto.message_from_id, auto.message_text, auto.message_to_id, autoPetition);
else
if(auto.from_step && auto.to_step) autoMoveStudent(auto.id,auto.from_step, auto.to_step, autoPetition);

});

} 

//the follwing three functions need to change to call the rpc function with the auto_petition + {payload} where payload is JSON name:value pairs of paramters /////////////////////////////////////////////
async function autoRelateAppros(auto_id,appro_is_id, relationship, of_appro_id,  autoPetition) {
  console.log('autoRelateAppros() is:',appro_is_id);//16:40 appro_is WRONG id here, but was right in line 17
  const autoParameters ={'appro_is_id':appro_is_id, 'relationship':relationship, 'of_appro_id':of_appro_id, 'automation_id':autoPetition.automation_id};
  console.log('autoParameters',autoParameters);
  console.log('autoPetition',autoPetition);
// Call RPC
 const autoResponse = await supabase.rpc('execute_automation', {
    p_auto_petition: autoPetition,
    p_auto_parameters: autoParameters
  });
console.log('autoResponse:',autoResponse);
return;
/*
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
*/
}

async function autoAssignTask(task_header_id, task_step_id, student_id, manager_id, autoPetition){//is this a student from auto or the current subject???
console.log('autoAssignTask()','task:',task_header_id, 'step:',task_step_id,'student:'. student_id, 'manager:',manager_id);  

const autoParameters ={'task_header_id':task_header_id, 'task_step_id':task_step_id, 'student_id':student_id, 'manager_id':manager_id, 'automation_id':autoPetition.automation_id};
console.log('autoParameters',autoParameters);
console.log('autoPetition',autoPetition);
// Call RPC
const autoResponse =await supabase.rpc('execute_automation', {
  p_auto_petition: autoPetition,
  p_auto_parameters: autoParameters
});
console.log('autoResponse:',autoResponse);
return;


//autoAssignTask
/* //function needs: 
        student_id: student_id,
        manager_id: manager_id, // or derive from context
        task_header_id: task_header_id,
        step_id: step_id,
        assigned_by_automation: assigned_by_automation 
*//*
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
    } */

}


async function autoAssignSurvey(auto_id,survey_header_id,target_survey_header_id, autoPetition){//assignements constrains duplications by a partial index, but code should check first.
console.log('autoAssignSurvey()','auto_id:',auto_id,'survey source id:',survey_header_id, 'surve target id:',target_survey_header_id ); //surevys don't really have a student, but the assignment requires student_id to identify to person who will receieve the survey

const autoParameters ={'survey_header_id':target_survey_header_id, 'student_id':autoPetition.appro_id, 'automation_id':autoPetition.automation_id}; // assigning a survey always goes to the head of the survey not a part
// survey_header_id is the survey being read.  We need the target survey
console.log('autoParameters',autoParameters);
console.log('autoPetition',autoPetition);
// Call RPC
const autoResponse =await supabase.rpc('execute_automation', {
  p_auto_petition: autoPetition,
  p_auto_parameters: autoParameters
});
console.log('autoResponse:',autoResponse);
return;


// the registry checks if assignment already exists & ignores it.
//in theory the automation could assign someone else to a survey, but that has not currently been built into survey automations (dec24 2025)
// Therefore, student_id should be subject_id
/*
const student_id =subjectId; //the current subject is assumed to be the one to become the student, unless student was set in the automation
//func needs const { survey_header_id,  student_id, assigned_by_automation } = payload;
const assignedTask = await executeIfPermitted(authUserId, 'autoAssignSurvey', { // who is authUserId? Needs DEFINER
        survey_header_id: survey_header_id,        
        student_id: student_id,
        assigned_by_automation: auto_id//needs current stepId No violates FK Needs automation.id
}) */
//console.log('If Databse replied it says the assignedTask id:', assignedTask);

}
async function autoSendMessage(auto_id,message_from_id, message_text, message_to_id){
console.log('autoSendMessage()');  

}
async function autoMoveStudent (auto_id,from_step, to_step){
console.log('autoMoveStudent()');  

}
