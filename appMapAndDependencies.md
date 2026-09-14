

<!--The intial entry point to the app is organise.html. The following is GH-copilots attempt to find every thing the follows from that landing page, every direct link and every lazy-load module that can be called. It ignores external links to payment processors. It does not list what can be linked from the Task external urls.

It has attempted to indicate all live reachable files and separately files that are not reachable which may be legacy or temporary rollback files created when making major edits to a working file (these are suffixed 001, 002 etc)

Excluded:

dist
node_modules
xOld
.gitignore
.env
vite.config.js -->

<!------------------organise.html-->

Petition flow from the real entry point
organise.html
-> loads flexmain.js
-> flexmain.js imports:
- menuListeners.js
- adminListeners.js
- windowEventListener.js
- registryLoadModule.js
- appState.js
-> menuListeners.js handles nav clicks, sets:
appState.setPetitioner({ Section:'menu', Action:'myDash', Destination:'new-panel' })
-> windowEventListener.js listens for state-change
-> openClosePanelsByRule() in flexmain.js
-> renderPanel() in flexmain.js
-> registry[Action] in registryLoadModule.js
-> lazy import e.g. () => import('../work/dash/myDash.js')
-> module exports render(panel, query) and renders into the selected panel/section

<!--The key interpretation is in: -->

adminListeners.js: readPetition(e) builds {Module, Section, Action, Destination}
appState.js: setPetitioner() stores the petition and emits the state-change
windowEventListener.js: calls openClosePanelsByRule(payload.petitioner.Action)
flexmain.js: resolves the action via registry[...] and calls module.render(panel, query)
Complete non-excluded workspace inventory


<!--------------------------------included files -->


The project contains 482 non-excluded files.

Root-level:
404.html, 404.js, ReadMe.md, XopenClosePanelsByRules.js, aims.js, eslint.config.mjs, extractor.js, favicon.ico, flexmain.js, flexmain004.js, flexmain005.js, folders.txt, index.html, index006.html, index007.html, jsconfig.json, memberButtons.html, openClosePanelsByRules001.js, organise.html, organise001.html, orgOS.html, package-lock.json, package.json, permissions.txt, permissionsSchema.html, plans.js, projectContext.md, sectionCardGenerator.js, securityPermissions.md, sortButtons.html, status, studentMove003.html, styles.css, supabase_2.58.5_linux_amd64.deb, symanticClipbaord.js, thoughts-3-nov-2025, tmMeaning.html, work, surveys, auth, dash, db, listeners, notes, registry, rules, sql, state, ui, utils, legal, js, ideas, images, htmlStubs, public

auth:
login-signup.js, login-signup001.js, login.js, permissionArchitecture.sql, permissionsMoleculeGenerator.html, permitted.js

dash:
Xanalytics.js, Xauthors.js, Xmanager.js, Xmembers.js, Xstudents.js, approfileManagementSection.js, assignmentManagementSection.js, authorManagementSection.js, loadAdminDashWithData.js, loadMyDashWithData.js, loadMyDashWithData001.js, loadMyDashWithData002.js, managerManagementSection.js, modulesMarketSection.js, moneyManagementSection.js, paymentProcessorsSection.js, providerMockupSection.js, quickStatsSection.js, readme.md, recruitmentManagementSection.js, steps.js, studentManagementSection.js, surveyManagementSection.js, task&memberManagementSection.js, taskManagementSection.js, tasks.js, userManagementSection.js

db:
auth.js, auth_how_use.html, databaseCentral.js, fetchNotes.js, readme.md, schema.html, supabase.js

listeners:
adminListeners.js, menuListeners.js, menuListeners001.js, windowEventListener.js

notes:
Xnotes.html, XrenderNotes.js, cleanupNoteInput.js, collectUserChoices.js, displayNotes.js, favicon.ico, labNotesToInclude.js, noteListeners.js, notes.js, reactToClearAllButton.js, reactToNoteClick.js, reactToPageButton.js, reactToSaveButton.js, reactToSaveButtonGH.js, rowsFromNotesWithCategories100rows, saveNoteWithTags.js, saveNoteWithTags001.js, tags.js, theLabNotesFork.md

registry:
CardVisualRegistry.js, dbSchema.js, executeIfPermitted.js, iconList.js, permissions.js, registryLoadModule.js, registryUtilities.js, registryWorkActions.002js, registryWorkActions.js, registryWorkActions_function_table_action_extracted.json

rules:
createBundleAppro.js, permissionsBundleModule.js, permissionsModule.js

state:
appState.js, autoPetitionSchema.js, petitionSchema.js

ui:
breadcrumb.js, notImplementedToast.js, readme.md, selectList.js, showToast.js

utils:
assignmentBase.js, assignmentBase002.js, autoExecuteAutomations.js, clipboardUtils.js, contextSubjectHideModules.js, displayHelpers.js, escapeHTML.js, executeAutomations.js, moveByRadio.js, surveyCardRenderer.js, surveySummaryRenderer.js, surveySummaryRenderer001.js, surveySummaryRenderer002.js, tableSchema.js

legal:
privacy.js

js:
XdynamicLoadScript.html, XmoveStudent.js, possibleCallDynamicLoads.js, qwensortMyList.js, renderAnyRow.js, renderForm.js, renderList.html, renderListB.html, sortMyList.js, sortThisList.js, statsCards.html, types.js

ideas:
IDEAdbCentral-QUEUE.js, IDEAreactToListPaginationButton.js, IDEAreactToSaveNoteButton.js, IDEArenderStatsCard.js, IDEArenderTaskProgress.js

htmlStubs:
404.html, DEMOmoveStudentForm.html, OLDadmin.html, Original-memberDash.html, XmoveStudent.js, XmoveStudentComplete.html, XmoveStudentForm.html, XmoveStudentVertical.html, adminDash.html, analytics.html, assignTaskForm.html, assignments.html, authors.html, createTaskForm.html, data.html, dataDisplay.html, dataMOCK.html, howTo.html, login.html, managers.html, memberDash.html, members.html, mock.html, moveStudent.html, moveStudentCopy.html, notes.html, plans.html, readme.md, relateApprofilesForm.html, sortButtons.html, statsCard.html, steps.html, students.html, tasks.html

public:
MM.png, btcpay.png, buymeacoffee.png, lemonsqueezy.png, paddle.png, paypal.png, polar.png, stripe.png, subscribestar.png, whop.png, favicon-bqra.ico, favicon-mm.ico, favicon.ico

approfiles:
OKrelateApprofiles.js, QWENcreateApprofile.js, XeditApprofile.js, XrelateApprofiles.js, appro-stats.js, autoRelateAppro.js, createApprofile.js, deleteRelation.js, deleteRelation001.js, displayMyRelations.js, displayProfile.js, displayRelations.js, displayRelations003.js, displayRelations004.js, displayRelations005.js, displayVerbs.js, editApprofile.js, getClipboardAppros.js, humans-stats.js, myRole.js, relateApprofiles.js, relateApprofiles001.js, selectApprofiles.js, sep24displayRelations.js, testFormat.html, testFormat2.html

dash:
XmemberDash.js, adminDash.js, adminDash001.js, adminDash002.js, myDash.js, myDash001.js

data:
analytics.js, dataTables.js, draft.js

how:
howManyTasks.js, howTo.js

select:
selectRemember.js

student:
moveStudent.js, moveStudent001.js, students-stats.js

survey:
EditSurvey007.js, SurveyBase.js, SurveyBase001.js, assignSurvey.js, createSurvey.js, createSurvey001.js, createSurvey002.js, displayAbandonedSurveys.js, displayCompletedSurveys.js, displayOneSurvey.js, displayOneSurvey001.js, displaySurvey.js, displaySurvey014.js, displaySurvey015.js, displaySurveyCards.js, displaySurveyChoice.js, editSurvey.js, editSurvey008.js, readSurveyNormal.js, survey-stats.js, surveyUtils.js

task:
XXassignmentBase.js, XassignmentBase.js, assignTask-clipboard-aware-.js, assignTask.js, assignTask001.js, assignTask003.js, assignments-stats.js, authors-stats.js, autoAssignTask.js, createTask.js, createTask001.js, createTask002.js, createTaskTM.html, displayAbandonedTasks.js, displayCompletedTasks.js, displayOneTask.js, displayOneTask001.js, displayPendingManagerTasks.js, displayTaskCards.js, displayTaskChoice.js, displayTaskSummary.js, displayTasksManager.js, displayTasksManager004.js, displayTasksStudent.js, displayTasksStudent004.js, displayTasksStudent005.js, displayTasksStudentDOUBLE.js, editTask.js, editTask003.js, editTask004.js, editTask005.js, editTaskHeader.js, managers-stats.js, moveStudentManager.js, steps-stats.js, studentBased001.js, taskSelfManagement.js, tasks-stats.js

user:
displayTempSignups.js

surveys:
EditSurvey.js, EditSurvey001.js, EditSurvey002.js, EditSurvey003.js, EditSurveyCLIPBORD.js, SurveyBase.js, SurveyBase001.js, SurveyBase002.js, XSurveyBase.js, XdisplayStudentSurveys.js, XdisplaySurveyQwen.js, XdisplaySurveys.js, assignSurvey.js, copilot.js, createSurveyQwen.js, createSurveyQwen001.js, createSurveyQwen002.js, createSurveyQwen004.js, createSurveyQwen005.js, createSurveyQwen012.js, createSurveyQwen013.js, createSurveyQwen014.js, createSurveyQwen10.js, createSurveyQwenWORKS.js, displayStudentSurveys001.js, displaySurveyQwen001.js, displaySurveyQwen002.js, displaySurveyQwen003.js, displaySurveyQwen006.js, displaySurveyQwen007.js, displaySurveyQwen008.js, displaySurveyQwen009.js, displaySurveyQwen010.js, displaySurveyQwen011.js, gemini.html, oct4createSurveyQwen.js, oldOct3createSurveyQwen.js, survey-stats.js, surveyFormat.js

sql and functions etc were also in the workspace, but they are not UI modules; they are database definitions and not part of the frontend reachability map.










------of which some are Reachable modules or files 
      

Reachable modules in the live UI registry
The live registry in registryLoadModule.js contains 84 entries, but 16 are stale/non-existent. The current reachable module set resolves to 69 existing files.

Live reachable files:
aims.js
login-signup.js
login.js
approfileManagementSection.js
assignmentManagementSection.js
authorManagementSection.js
managerManagementSection.js
modulesMarketSection.js
moneyManagementSection.js
paymentProcessorsSection.js
providerMockupSection.js
quickStatsSection.js
recruitmentManagementSection.js
studentManagementSection.js
surveyManagementSection.js
task&memberManagementSection.js
taskManagementSection.js
userManagementSection.js
privacy.js
notes.js
plans.js
createBundleAppro.js
permissionsBundleModule.js
permissionsModule.js
autoExecuteAutomations.js
appro-stats.js
autoRelateAppro.js
deleteRelation.js
displayRelations.js
editApprofile.js
humans-stats.js
relateApprofiles.js
adminDash.js
myDash.js
analytics.js
dataTables.js
howTo.js
selectRemember.js
moveStudent.js
students-stats.js
assignSurvey.js
createSurvey.js
displayAbandonedSurveys.js
displayCompletedSurveys.js
displaySurvey.js
displaySurveyCards.js
displaySurveyChoice.js
editSurvey.js
survey-stats.js
assignTask.js
assignments-stats.js
authors-stats.js
autoAssignTask.js
createTask.js
displayAbandonedTasks.js
displayCompletedTasks.js
displayOneTask.js
displayPendingManagerTasks.js
displayTaskCards.js
displayTaskChoice.js
displayTaskSummary.js
displayTasksManager.js
displayTasksStudent.js
editTask.js
managers-stats.js
moveStudentManager.js
steps-stats.js
tasks-stats.js
displayTempSignups.js




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




<!-------------------Graph -->

<!--Text-only reachability graph
Here is the live graph as a user traverses the UI:-->

````mermaidfollowed bygraph TD`

organise.html
-> nav button click (data-action="myDash")
-> menuListeners.js reads .nav-btn
-> appState.setPetitioner({ Section:'menu', Action:'myDash', Destination:'new-panel' })
-> windowEventListener.js
-> openClosePanelsByRule('myDash')
-> renderPanel()
-> registryLoadModule.js['myDash']
-> () => import('../work/dash/myDash.js')
-> myDash.render(panel, query)

organise.html
-> nav button click (data-action="adminDash")
-> menuListeners.js
-> appState.setPetitioner({ Section:'menu', Action:'adminDash', Destination:'new-panel' })
-> windowEventListener.js
-> openClosePanelsByRule('adminDash')
-> renderPanel()
-> registryLoadModule.js['adminDash']
-> () => import('../work/dash/adminDash.js')
-> adminDash.render(panel, query)

adminDash.render(...)
-> card click with data-action="task-management-section"
-> adminListeners.js:readPetition()
-> appState.setPetitioner({ Module:'adminDash', Section:'task-management', Action:'task-management-section', Destination:'task-management' })
-> openClosePanelsByRule('task-management-section')
-> registryLoadModule.js['task-management-section']
-> () => import('../dash/taskManagementSection.js')
-> taskManagementSection.render(panel, query)

taskManagementSection.render(...)
-> card click with data-action="create-task-dialogue"
-> appState.setPetitioner({ ... Action:'create-task-dialogue', Destination:'task-management' })
-> registryLoadModule.js['create-task-dialogue']
-> () => import('../work/task/createTask.js')
-> createTask.render(panel, query)

taskManagementSection.render(...)
-> card click with data-action="edit-task-dialogue"
-> registryLoadModule.js['edit-task-dialogue']
-> () => import('../work/task/editTask.js')
-> editTask.render(panel, query)

taskManagementSection.render(...)
-> card click with data-action="assign-task-dialogue"
-> registryLoadModule.js['assign-task-dialogue']
-> () => import('../work/task/assignTask.js')
-> assignTask.render(panel, query)

taskManagementSection.render(...)
-> card click with data-action="display-task-summary"
-> registryLoadModule.js['display-task-summary']
-> () => import('../work/task/displayTaskSummary.js')
-> displayTaskSummary.render(panel, query)

adminDash.render(...)
-> card click with data-action="survey-management-section"
-> registryLoadModule.js['survey-management-section']
-> () => import('../dash/surveyManagementSection.js')
-> surveyManagementSection.render(panel, query)

surveyManagementSection.render(...)
-> card click with data-action="create-survey-dialogue"
-> registryLoadModule.js['create-survey-dialogue']
-> () => import('../work/survey/createSurvey.js')
-> createSurvey.render(panel, query)

surveyManagementSection.render(...)
-> card click with data-action="edit-survey-dialogue"
-> registryLoadModule.js['edit-survey-dialogue']
-> () => import('../work/survey/editSurvey.js')
-> editSurvey.render(panel, query)

surveyManagementSection.render(...)
-> card click with data-action="assign-survey-dialogue"
-> registryLoadModule.js['assign-survey-dialogue']
-> () => import('../work/survey/assignSurvey.js')
-> assignSurvey.render(panel, query)

adminDash.render(...)
-> card click with data-action="approfile-management-section"
-> registryLoadModule.js['approfile-management-section']
-> () => import('../dash/approfileManagementSection.js')
-> approfileManagementSection.render(panel, query)

approfileManagementSection.render(...)
-> create-approfile-dialogue
-> createApprofile.js
-> createApprofile.render(panel, query)

approfileManagementSection.render(...)
-> edit-approfile-dialogue
-> editApprofile.js
-> editApprofile.render(panel, query)

approfileManagementSection.render(...)
-> relate-approfiles-dialogue
-> relateApprofiles.js
-> relateApprofiles.render(panel, query)

approfileManagementSection.render(...)
-> display-related-approfiles-dialogue
-> displayRelations.js
-> displayRelations.render(panel)

myDash.render(...)
-> card click with data-action="display-task-choice"
-> registryLoadModule.js['display-task-choice']
-> () => import('../work/task/displayTaskChoice.js')
-> displayTaskChoice.render(panel)

myDash.render(...)
-> card click with data-action="display-survey-choice"
-> registryLoadModule.js['display-survey-choice']
-> () => import('../work/survey/displaySurveyChoice.js')
-> displaySurveyChoice.render(panel)

myDash.render(...)
-> data-action display-surveys
-> registryLoadModule.js['display-surveys']
-> () => import('../work/survey/displaySurveyCards.js')
-> displaySurveyCards.render(panel, petition, renderType='active')

myDash.render(...)
-> data-action display-tasks
-> registryLoadModule.js['display-tasks']
-> () => import('../work/task/displayTaskCards.js')
-> displayTaskCards.render(panel, petition, renderType='active')

myDash.render(...)
-> my-role
-> myRole.js

myDash.render(...)
-> display-profile
-> displayProfile.js

organise.html menu also routes directly to:

howTo -> howTo.js
selector-dialogue -> selectRemember.js
bug-report -> notes.js
login-signup -> login-signup.js
privacy -> privacy.js
aims -> aims.js
plans -> plans.js
Summary:

````


The app’s real frontier is the registry map in registryLoadModule.js.
The live UI reaches the working JS modules via petition → state-change → openClosePanelsByRule() → registry → lazy import → render().
The biggest legacy layer is the old htmlStubs/* and older surveys/* / work/*_001 / X* variants, which are not part of the live dispatch graph.

MAI-Code-1.1-Flash • 1x
