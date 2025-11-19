//  ./registry/registry.js
console.log('Imported: registry.js');

// A lookup table for your new JavaScript-based modules.
// This is where you will add new entries as you convert more forms.
//15:00 sept 22  the .html are now legacy, probably never used. Change made in menuListeners.js

export const registry = { // this registry is for loading a new page to the right of the dashboard. 
// data-action values for admin dashboard


//////////          MENU           /////////
'adminDash':()=>import('../work/dash/adminDash.js'),
'myDash':()=>import('../work/dash/myDash.js'),           
'howTo': () => import('../work/how/howTo.js'),
'bug-report' :()=> import('../notes/notes.js'),
'selector-dialogue' :()=> import('../work/select/selectRemember.js'),
'plans' :() => import('../plans.js'),
'login':()=>import('../auth/login.js'),



//////////          QUICK STATS   AdminDash           /////////                 
'quick-stats-section.html': ()=> import('../dash/quickStatsSection.js'),

//  connected to Quick-stats, display but no actual data
'data': () => import('../work/data/dataTables.js'),
'analytics': () => import('../work/data/analytics.js'),
'managers-stats':() => import('../work/task/managers-stats.js'),
'authors-stats':() => import('../work/task/authors-stats.js'),
'students-stats' :() => import('../work/student/students-stats.js'),
'assignments-stats':() => import('../work/task/assignments-stats.js'),
'humans-stats' :() => import('../work/approfiles/humans-stats.js'),
'approfiles-stats':()=> import('../work/approfiles/appro-stats.js'),

'tasks-stats' :() => import('../work/task/tasks-stats.js'),
'steps-stats' :() => import('../work/task/steps-stats.js'),




//////////          TASK MANAGEMENT    AdminDash       /////////                 
'assignment-management-section': ()=> import('../dash/assignmentManagementSection.js'),
'task-management-section': ()=> import('../dash/taskManagementSection.js'),
'author-management-section': ()=> import('../dash/authorManagementSection.js'),
'student-management-section': ()=> import('../dash/studentManagementSection.js'),
'manager-management-section': ()=> import('../dash/managerManagementSection.js'),
'task&member-management-section': ()=> import('../dash/task&memberManagementSection.js'),

'assign-task-dialogue': () => import('../work/task/assignTask.js'),
'assignTaskForm': () => import('../work/task/assignTask.js'), //legacy?

'create-task-dialogue': () => import('../work/task/createTask.js'),
'createTaskForm': () => import('../work/task/createTask.js'), //legacy?
'edit-task-dialogue': () => import('../work/task/editTask.js'),
'editTask': () => import('./editTask.js'), //legacy?
//'-management-section': ()=> import('../work/dash/ManagementSection.js'),

'display-students':()=> import('../work/task/displayTasksManager.js'),
'move-student-dialogue': () => import('../work/student/moveStudent.js'),
'moveStudent': () => import('../student/moveStudent.js'),//legacy?


//'display-tasks' :()=> import('../work/task/displayTasks.js'), // changed 20:29 Oct 21
'display-tasks' :()=> import('../work/task/displayTasksStudent.js'),


//////////          APPRO MANAGEMENT    AdminDash       /////////                 
'approfile-management-section': ()=> import('../dash/approfileManagementSection.js'),// from button has .html

"create-approfile-dialogue":()=> import('../work/approfiles/createApprofile.js'),
'createApprofile': () => import('./createApprofile.js'), // legacy?
'edit-approfile-dialogue':()=> import('../work/approfiles/editApprofile.js'),
'relate-approfiles-dialogue': () => import('../work/approfiles/relateApprofiles.js'),
'relateApprofile': () => import('../work/approfiles/relateApprofile.js'), //legacy?
'display-related-approfiles-dialogue': () => import('../work/approfiles/displayRelations.js'),

'member-management-section': ()=> import('../dash/approfileManagementSection.js'), //???


//////////          RELATIONS & HIERARCHY MANAGEMENT      AdminDash     /////////     
'display-relations' :()=> import('../work/approfiles/displayRelations.js'),



//////////          KNOWLEDGE MANAGEMENT         AdminDash  /////////           //Confusing naming      
'survey-management-section': ()=> import('../dash/surveyManagementSection.js'),

'create-survey-dialogue': () => import('../surveys/createSurveyQwen.js'),
'display-survey-dialogue' : () => import('../surveys/displaySurveyQwen.js'),
'display-this-survey' :()=> import('../surveys/displaySurveyQwen.js'), //changed 19:30 Oct 22
//'display-surveys':()=> import('../surveys/displayStudentSurveys.js'),  
'display-surveys':()=> import('../surveys/displaySurveyQwen.js'),  //test 21:00 oct 27 - do direct and make dual use
'assign-survey-dialogue' :()=> import('../surveys/assignSurvey.js'),
'edit-survey-dialogue':()=> import('../surveys/EditSurvey.js'),
//////////          SETTINGS            AdminDash      /////////                 
'money-management-section': () => import('../dash/moneyManagementSection.js'),
'open-permissions-dialogue': () => import('../db/permissionsModule.js'),   





//////////          AUTO-BACKGROUND                  /////////
'auto-assign-task' :() => import('../work/task/autoAssignTasks.js'),  //? not directly loaded?
'auto-relate-appro': () => import('../work/approfiles/autoRelateAppro.js'), //?not directly loaded
'auto-execute-automations':() => import('../utils/autoExecuteAutomations.js'), //this imports the above 2






//possible further modules for admin dashboard

'editStep': () => import('./editStep.js'),
'editMember': () => import('./editMember.js'),
'editAssignment': () => import('./editAssignment.js'),
'editApprofile': () => import('./editApprofile.js'),
'editHowto': () => import('./editHowto.js'),

'createHowto': () => import('./createHowto.js'),
'viewHowto': () => import('./viewHowto.js'),









// old html stub versions for admin dashboard Probably can be deleted

'assignTaskForm.html': () => import('../work/task/assignTask.js'),
'createTaskForm.html': () => import('../work/task/createTask.js'),


//'createTaskForm.html': () => import('../work/task/createTask.js'),
'moveStudentForm.html': () => import('../work/student/moveStudent.js'),
'relateApprofileForm.html': () => import('../work/approfiles/relateApprofile.js'),

'howTo.html': () => import('../work/how/howTo.js'),

'data.html': () => import('../work/data/dataTables.js'),
'analytics.html': () => import('../work/data/analytics.js'),
'managers.html':() => import('../work/task/managers-stats.js'),
'authors.html':() => import('../work/task/authors-stats.js'),
'assignments.html':() => import('../work/task/assignments-stats.js'),
'members.html' :() => import('../work/data/memberss.js'),
'plans.html' :() => import('../plans.js'),
'tasks.html' :() => import('../work/task/tasks-stats.js'),
'steps.html' :() => import('../work/task/steps-stats.js'),

'adminDash.html':()=>import('../work/dash/adminDash.js'),
'memberDash.html':()=>import('../work/dash/myDash.js'),

'login.html':()=>import('../auth/login.js'),


//'editApprofile:() => import('./editApprofile.js'),

};


/* other admin dashboard data-* values
data-value=

members-count
unique-students-count
unique-managers-count
unique-authors-count 
authors-count
students-count
managers-count

assignments-count
tasks-count

approfiles-count
task-approfiles-count
member-approfiles-count
approfiles-count
abstract-approfiles-count

relationships-count
relations-count

howto-count

Things on bottom of page, no data-
User Roles
Rewards
Support
Messages

*/
