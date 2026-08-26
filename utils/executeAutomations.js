import { executeIfPermitted } from '../registry/executeIfPermitted.js';
import { showToast } from '../ui/showToast.js';
import { appState } from '../state/appState.js';
import { createSupabaseClient } from '../db/supabase.js';

// The Supabase client is created once and passed to the functions.
const supabase = createSupabaseClient();

export async function executeAutomations(automations, subject, autoPetition){//autoPetition gathers the data to be sent to permissions_judge
  console.log('executeAutomations() automations:',automations, ', subject: ',subject,', autoPetition:', autoPetition);//subject correct here but is getting changed wrongly 16:40 dec 26
  if(!automations || automations.length ===0) {console.log('No automations to execute'); return;}

//put the handling of completed and abandonded here so surveys and tasks can ignore automations if not active. 22:44 Aug 24 2026 that restriction has been put in displayOneSurvey. 
// Perhaps better put here



const assignmentRow = await executeIfPermitted(subject.id, 'readThisSurveyOrTaskAssignment',{ assignment_id: autoPetition.assignment_id }
);

// Determine survey state
let endedOrActive;
if (assignmentRow.completed_at) { endedOrActive = 'completed';
} else if (assignmentRow.abandoned_at) { endedOrActive = 'abandoned';
} else { endedOrActive = 'active';
}
console.log('assignmentRow',assignmentRow,'endOrActive',endedOrActive);
if(endedOrActive!='active'){
showToast(`This survey is ${endedOrActive}. Automations will not run.`);
return
}






let autoResponses = [];
console.log('executeAutomations() automations',automations);

  for (const auto of automations) { //changed from automations.forEach(auto => {  so that await can be used  17:23 March 12

    if(auto.auto_deleted_at) {console.log('fails on test of auto.is_deleted auto_id:',auto.auto_id,'dated:', auto.auto_deleted_at); continue;} //this is very confuing in that if any auto is deleted it logs it

  // Due to a weird bug we have decided to create a copy of autoPetition with only the automation_id changed. When we had >1 automations the relate was being treated as an assign task in some strnage way
  const autoPetitionForThisAuto = {
    ...autoPetition,
    automation_id: auto.id
  };

const type = auto.target_data.target.type; // 
console.log('type:',type);
const autoId = auto.id;

const header = auto.target_data.target.header;
const secondary = auto.target_data.target.secondary;

const payload = auto.target_data.payload;
let autoResponse = null;

//console.log('type',type,'autoId',autoId,'header',header,'secondary',secondary,'payload',payload); Add autoResponse = await 17:23 March 12
if (type === 'survey') { console.log('→ Calling autoAssignSurvey'); autoResponse = await autoAssignSurvey(autoId,header, autoPetitionForThisAuto);}
else
  if (type === 'task') { console.log('→ Calling autoAssignTask');  autoResponse = await autoAssignTask(autoId,header,secondary, autoPetitionForThisAuto);} // needs student_id and manager_id
else 
  if (type === 'relate') {console.log('→ Calling autoRelateAppros with autoId, payload, autoPetitionFoThisAuto'); autoResponse = await autoRelateAppros(autoId,payload, autoPetitionForThisAuto);};
// need to collect the autoResponses
if (autoResponse) {
            autoResponses.push(autoResponse);
            console.log('✅ Automation result collected:', autoResponse);


}; 

}
console.log('executeAutomations() autoResponses',autoResponses); 
 return autoResponses;  // returns the collection of json messages not just a single response
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
console.log('executeAutomations- calling rpc execute_automation with the autoPetition & autParameters');

const autoResponse =await supabase.rpc('execute_automation', {
  p_auto_petition: autoPetition,
  p_auto_parameters: autoParameters
});
console.log('autoResponse from the rpc:',autoResponse);
return autoResponse;


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
console.log('autoResponse:',autoResponse);
return autoResponse;

}


async function autoRelateAppros(autoId,payload, autoPetition) {//Jan 26. When a task was also added to the answer, the error message in this 'relate' function says missing task, student or step. Why is the relate being treated as an assign task? 
  //console.log('autoRelateAppros(): autoId',autoId, 'payload:',payload);//16:40 appro_is WRONG id here, but was right in line 17
  //console.log('autoPetition', autoPetition);

  const autoParameters ={'appro_is_id':autoPetition.appro_id, 'relationship':payload.relationship, 'of_appro_id':payload.of_appro_id, 'automation_id':autoPetition.automation_id};
  //console.log('autoParameters',autoParameters);
  //console.log('autoPetition',autoPetition);
// Call RPC
console.log('executeAutomations- calling rpc execute_automation with the autoPetition ',autoPetition ,'& autoParameters', autoParameters);
 const autoResponse = await supabase.rpc('execute_automation', {
    p_auto_petition: autoPetition,
    p_auto_parameters: autoParameters
  });
console.log('autoResponse:',autoResponse); //correctly logs 17:35 March 12 but 
return autoResponse;
}


async function autoSendMessage(auto_id,message_from_id, message_text, message_to_id){
console.log('autoSendMessage()');  

}
async function autoMoveStudent (auto_id,from_step, to_step){
console.log('autoMoveStudent()');  

}