//  ./registry/registry.js
console.log('Imported: registry.js');

// A lookup table for your new JavaScript-based modules.
// This is where you will add new entries as you convert more forms.
//15:00 sept 22  the .html are now legacy, probably never used. Change made in menuListeners.js

export const registry = { // this registry is for loading a new page to the right of the dashboard. 

// test modules
'quick-stats-section.html': ()=> import('../dash/quickStatsSection.js'),
'member-management-section.html': ()=> import('../dash/approfileManagementSection.js'),// from button has .html
'member-management-section': ()=> import('../dash/approfileManagementSection.js'), //from card
'assignment-management-section': ()=> import('../dash/assignmentManagementSection.js'),
'task-management-section': ()=> import('../dash/taskManagementSection.js'),
'author-management-section': ()=> import('../dash/authorManagementSection.js'),
'student-management-section': ()=> import('../dash/studentManagementSection.js'),
'manager-management-section': ()=> import('../dash/managerManagementSection.js'),
'task&member-management-section': ()=> import('../dash/task&memberManagementSection.js'),
//'-management-section': ()=> import('../work/dash/ManagementSection.js'),
'survey-management-section': ()=> import('../dash/surveyManagementSection.js'),

'create-survey-dialogue': () => import('../surveys/createSurveyQwen.js'),
'display-survey-dialogue' : () => import('../surveys/displaySurveyQwen.js'),


// data-action values for admin dashboard
'assign-task-dialogue': () => import('../work/task/assignTask.js'),
'create-task-dialogue': () => import('../work/task/createTask.js'),
'edit-task-dialogue': () => import('../work/task/editTask.js'),

'move-student-dialogue': () => import('../work/student/moveStudent.js'),

"create-approfile-dialogue":()=> import('../work/approfiles/createApprofile.js'),
'edit-approfile-dialogue':()=> import('../work/approfiles/editApprofile.js'),
'relate-approfiles-dialogue': () => import('../work/approfiles/relateApprofiles.js'),
'display-related-approfiles-dialogue': () => import('../work/approfiles/displayRelations.js'),

'money-management-section': () => import('../dash/moneyManagementSection.js'),

//'selector-dialogue' :()=> import('../work/universal/selectAnyRow.js'),
'selector-dialogue' :()=> import('../work/select/selectRemember.js'),


'howTo': () => import('../work/how/howTo.js'),

'data': () => import('../work/data/dataTables.js'),
'analytics': () => import('../work/data/analytics.js'),
'managers-stats':() => import('../work/task/managers-stats.js'),
'authors-stats':() => import('../work/task/authors-stats.js'),
'students-stats' :() => import('../work/student/students-stats.js'),
'assignments-stats':() => import('../work/task/assignments-stats.js'),
'humans-stats' :() => import('../work/approfiles/humans-stats.js'),
'approfiles-stats':()=> import('../work/approfiles/appro-stats.js'),
'plans' :() => import('../plans.js'),
'tasks-stats' :() => import('../work/task/tasks-stats.js'),
'steps-stats' :() => import('../work/task/steps-stats.js'),

'adminDash':()=>import('../work/dash/adminDash.js'),
'myDash':()=>import('../work/dash/myDash.js'),

'login':()=>import('../auth/login.js'),

// sort buttons?  statsCard? 
// old html stub versions for admin dashboard

'assignTaskForm.html': () => {
  console.log('Loading assignTask.js');
  return import('../work/task/assignTask.js');
},
'createTaskForm.html': () => {
  console.log('Loading createTask.js');
  return import('../work/task/createTask.js');
},


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

'assignTaskForm': () => import('../work/task/assignTask.js'),
'createTaskForm': () => import('../work/task/createTask.js'),
'moveStudent': () => import('../student/moveStudent.js'),
'relateApprofile': () => import('../work/approfiles/relateApprofile.js'),

//possible further modules for admin dashboard
'editTask': () => import('./editTask.js'),
'editStep': () => import('./editStep.js'),
'editMember': () => import('./editMember.js'),
'editAssignment': () => import('./editAssignment.js'),
'editApprofile': () => import('./editApprofile.js'),
'editHowto': () => import('./editHowto.js'),

'createHowto': () => import('./createHowto.js'),
'viewHowto': () => import('./viewHowto.js'),


'createApprofile': () => import('./createApprofile.js'),
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