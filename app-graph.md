<!-------------------Graph -->

<!--Text-only reachability graph
Here is the live graph as a user traverses the UI:-->

# UI Traversal & Reachability Graph
missing displayOneTask  displayOneSurvey
```text

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