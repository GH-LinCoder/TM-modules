//  ./registry/registry.js
console.log('Imported: registry.js');

// A lookup table for your new JavaScript-based modules.
// This is where you will add new entries as you convert more forms.


export const registry = {

    // data-action values for admin dashboard
'assign-task-dialogue': () => import('../work/task/assignTask.js'),
'create-task-dialogue': () => import('../work/task/createTask.js'),
'move-student-dialogue': () => import('../work/student/moveStudent.js'),
'relate-approfiles-dialogue': () => import('../work/approfiles/relateApprofiles.js'),

'howTo': () => import('../work/how/howTo.js'),

'data': () => import('../work/data/dataTables.js'),
'analytics': () => import('../work/data/analytics.js'),
'managers':() => import('../work/data/managers.js'),
'authors':() => import('../work/data/authors.js'),
'students' :() => import('../work/students/students.js'),
'assignments':() => import('../work/data/assignments.js'),
'members' :() => import('../work/data/members.js'),
'plans' :() => import('../plans.js'),
'tasks' :() => import('../work/task/tasks.js'),
'steps' :() => import('../work/task/steps.js'),

'adminDash':()=>import('../work/dash/adminDash.js'),
'memberDash':()=>import('../work/dash/memberDash.js'),

'login':()=>import('../auth/login.js'),

// sort buttons?  statsCard? 
// old html stub versions for admin dashboard
//'assignTaskForm.html': () => import('../work/task/assignTask.js'),
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
'managers.html':() => import('../work/data/managers.js'),
'authors.html':() => import('../work/data/authors.js'),
'assignments.html':() => import('../work/data/assignments.js'),
'members.html' :() => import('../work/data/memberss.js'),
'plans.html' :() => import('../plans.js'),
'tasks.html' :() => import('../work/task/tasks.js'),
'steps.html' :() => import('../work/task/steps.js'),

'adminDash.html':()=>import('../work/dash/adminDash.js'),
'memberDash.html':()=>import('../work/dash/memberDash.js'),

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