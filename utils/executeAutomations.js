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
  if(!automations || automations.length ===0) {console.log('No automations to execute'); return;}

  automations.forEach(auto => {

    if(auto.auto_deleted_at) {console.log('fails on test of auto.is_deleted auto_id:',auto.auto_id,'dated:', auto.auto_deleted_at);return;} //this is very confuing in that if any auto is deleted it logs it

  // Due to a weird bug we have decided to create a copy of autoPetition with only the automation_id changed. When we had >1 automations the relate was being treated as an assign task in some strnage way
  const autoPetitionForThisAuto = {
    ...autoPetition,
    automation_id: auto.id
  };

//autoPetition.automation_id = auto.id;
/*
console.log('@@@@@@ automation',auto,
  'auto_id', auto.id,
  'SOURCE_data',auto.source_data, 
  'TARGET_data', auto.target_data);// auto.target undefined jan 25 20:00

console.log('type:',auto.target_data.target.type ,'auto.target_data.target.header:',auto.target_data.target.header);//id of the survey
*/
const type = auto.target_data.target.type;
const autoId = auto.id;

const header = auto.target_data.target.header;
const secondary = auto.target_data.target.secondary;

const payload = auto.target_data.payload;
//console.log('type',type,'autoId',autoId,'header',header,'secondary',secondary,'payload',payload);
if (type === 'survey') { console.log('→ Calling autoAssignSurvey'); autoAssignSurvey(autoId,header, autoPetitionForThisAuto);}
else
  if (type === 'task') { console.log('→ Calling autoAssignTask');  autoAssignTask(autoId,header,secondary, autoPetitionForThisAuto);} // needs student_id and manager_id
else 
  if (type === 'relate') {console.log('→ Calling autoRelateAppros'); autoRelateAppros(autoId,payload, autoPetitionForThisAuto);};
 }); 
}



//the follwing three functions need to change to call the rpc function with the auto_petition + {payload} where payload is JSON name:value pairs of paramters /////////////////////////////////////////////

//when called by automation being run from a task 'autoPetition' is undefined.
async function autoAssignSurvey(autoId,header, autoPetition){//assignements constrains duplications by a partial index, but code should check first.
console.log('autoAssignSurvey()','auto_id:',autoId,'surveyid:',header, 'autoPetition',autoPetition ); //surveys don't really have a student, but the assignment requires student_id to identify to person who will receieve the survey

const autoParameters ={'survey_header_id':header, 'student_id':autoPetition.appro_id, 'automation_id':autoPetition.automation_id}; // assigning a survey always goes to the head of the survey not a part
// survey_header_id is the survey being read.  We need the target survey
//console.log('autoParameters',autoParameters);
//console.log('autoPetition',autoPetition);
// Call RPC
const autoResponse =await supabase.rpc('execute_automation', {
  p_auto_petition: autoPetition,
  p_auto_parameters: autoParameters
});
//console.log('autoResponse:',autoResponse);
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


async function autoAssignTask(autoId,header,secondary, autoPetition){//is this a student from auto or the current subject???
console.log('autoAssignTask()','task:',header, 'step:',secondary,'autoPetition',autoPetition);  
//where find student_id   manager_id ?
const studentId = autoPetition.appro_id; // the current subject is assumed to be the one to become the student, unless student was set in the automation
const managerId = appState.query.defaultManagerId; // the default manager is assigned as the assigner unless set in the automation
// func needs const { task_header_id, task_step_id, student_id, manager_id, assigned_by_automation } = payload;
const autoParameters ={'task_header_id':header, 'task_step_id':secondary, 'student_id':studentId, 'manager_id':managerId, 'automation_id':autoPetition.automation_id};
//console.log('autoParameters',autoParameters);
//console.log('autoPetition',autoPetition);
// Call RPC
const autoResponse =await supabase.rpc('execute_automation', {
  p_auto_petition: autoPetition,
  p_auto_parameters: autoParameters
});
//console.log('autoResponse:',autoResponse);
return;

}


async function autoRelateAppros(autoId,payload, autoPetition) {//Jan 26. When a task was also added to the answer, the error message in this 'relate' function says missing task, student or step. Why is the relate being treated as an assign task? 
  //console.log('autoRelateAppros(): autoId',autoId, 'payload:',payload);//16:40 appro_is WRONG id here, but was right in line 17
  //console.log('autoPetition', autoPetition);

  const autoParameters ={'appro_is_id':autoPetition.appro_id, 'relationship':payload.relationship, 'of_appro_id':payload.of_appro_id, 'automation_id':autoPetition.automation_id};
  //console.log('autoParameters',autoParameters);
  //console.log('autoPetition',autoPetition);
// Call RPC
 const autoResponse = await supabase.rpc('execute_automation', {
    p_auto_petition: autoPetition,
    p_auto_parameters: autoParameters
  });
//console.log('autoResponse:',autoResponse);
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


async function autoSendMessage(auto_id,message_from_id, message_text, message_to_id){
console.log('autoSendMessage()');  

}
async function autoMoveStudent (auto_id,from_step, to_step){
console.log('autoMoveStudent()');  

}