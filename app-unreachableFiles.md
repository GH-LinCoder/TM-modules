
-------------------old junk?

Unreachable / legacy / stale modules
Stale registry references that point to files that do not exist:
createApprofile.js
createHowto.js
editApprofile.js
editAssignment.js
editHowto.js
editMember.js
surveys/displayStudentSurveys.js
surveys/displaySurveyQwen.js
viewHowto.js
work/approfiles/relateApprofile.js
work/dash/ManagementSection.js
work/data/members.js
XdisplayStudentSurveys.js
work/task/displayTasks.js
work/task/editStep.js




---------------------------- more old junk?


High-confidence unreachable/legacy modules by folder:

htmlStubs/*: legacy HTML stubs; not part of the live lazy-load registry
surveys/*: old survey experiments; not in the live registry except the old direct prototypes
adminDash001.js, adminDash002.js, myDash001.js, XmemberDash.js: legacy dashboard variants
work/approfiles/* variants such as displayRelations003.js, displayRelations004.js, displayRelations005.js, displayMyRelations.js, sep24displayRelations.js, XeditApprofile.js, XrelateApprofiles.js, OKrelateApprofiles.js, etc.: not in the live registry
work/task/* variants such as assignTask001.js, assignTask003.js, createTask001.js, createTask002.js, displayOneTask001.js, displayTasksManager004.js, displayTasksStudent004.js, displayTasksStudent005.js, displayTasksStudentDOUBLE.js, editTask003.js, editTask004.js, editTask005.js, studentBased001.js, taskSelfManagement.js, moveStudent001.js: legacy or experimental
work/survey/* variants such as displaySurvey014.js, displaySurvey015.js, displayOneSurvey001.js, editSurvey008.js, createSurvey001.js, createSurvey002.js: legacy or prototype chain
js/*, ideas/*, notes/X*, dash/X*: not reachable from the live UI registry
databaseCentral.js is a support module, not a top-level UI module in the lazy-loader path