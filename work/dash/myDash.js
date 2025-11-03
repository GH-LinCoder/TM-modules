// ./work/dash/myDash.js
import { appState } from '../../state/appState.js';
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { petitionBreadcrumbs } from '../../ui/breadcrumb.js';
import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';
import { icons } from '../../registry/iconList.js';


//  ./work/dash/adminDash.js
console.log('myDash.js loaded version 10:22 Oct 27');


function getTemplateHTML() {
    return `
        <!-- DASHBOARD CONTAINER STRUCTURE -->
        <div class="my-dashboard bg-gray-100 min-h-screen" data-module="myDash" data-destination='new-panel'>
            
            <!-- DASHBOARD HEADER -->
            <div class="px-6 py-4 border-b bg-green-200 flex justify-between items-center">
                <div class="name" title="Toggle between admin & my dashboard">
                    <!--div class="text-sm text-blue-600 hover:underline" data-action="toggle-dash">my/Admin</div-->
                </div>
                
                <div>
                    <h1 class="text-2xl font-bold" data-dash-title="admin">My Dashboard -version 21:50 Nov 3</h1>
                    <p class="text-sm text-gray-500" data-dash-sub_title="my">Check my tasks, update my details, manage my students...</p>
                </div>
                <!--button class="text-sm text-blue-600 hover:underline" onclick="signOut()">Sign out</button-->
            </div>
            
            <div class="container mx-auto px-4 py-8 flex flex-col gap-8">
                
                <!-- PROFILE CARD -->
                <div class="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row items-center md:items-start gap-8" data-component="profile-card">
                    <div class="flex-shrink-0 text-center">
                        <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-semibold" data-user="avatar">
                            <span data-user="initials">JD</span>
                        </div>
                        <h6 class="text-xl font-semibold" data-user="name">data-user=name</h6>
                    </div>
                    
                    <div class="flex-1 space-y-4">
                        <div class="space-y-3 text-sm text-gray-600">
                            <div class="flex items-center gap-2 flex-wrap">
                                📧<span data-user="email">????.???@example.com</span>
                                <span data-user="mid"><b>🆔</b> <span data-user="student-id">???</span></span>       
                                <span ><b>Joined:</b><span data-user="join-date"> ???? ?? ??</span></span>
                                <span data-user="last-login"><b>Last login:</b> ??:?? PM ???? ?? ??</span>
                            </div>
                            
                            <button 
                                class="w-full border border-gray-300 rounded-lg py-2 text-sm font-medium hover:bg-gray-50"
                                data-action="edit-profile">
                                Edit <span class="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm" data-user="role">my</span>🪪 Profile
                            </button>
                        </div>
                    </div>
                </div>
                

<!--  INSTRUCTIONS   -->                           
                    <div class="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                       <h4 class="text-ml font-bold text-blue-500 mb-4">my Dashboard</h4>
                       <ul class="list-disc list-inside mt-2 text-sm text-blue-500">
                       <li>At the top are your basic details which you can edit. 'My profile'</li>
                       <li>Next are some summary statistics of things you have done or are doing. 'Quick Stats'</li>
                       <li>next are things that you may want to do often 'Quick Acts'</li>
                        <li> One of our mottoes is: "Have your say, do your bit."</li>
                        <li> We use surveys as a key part of both those things. 'Have your say'</li>
                        <li> You may see surveys in the section below</li>
                        <li> Doing your bit often involves tasks in another section below. 'Do your bit' </li>
                        <li>The other motto is 'No one is an island'. You can see your relations with groups, volunteers, events & organisations. </li>
                      <li>If you are on a task you are referred to as 'the student'. If you manage a task looking after another student you are referred to as 'the manager'</li>
                      <li>There is a section for any tasks where you are the manager. </li>
                        </ul>  
                    </div>


                <!-- QUICK STATS -->
                <div class="bg-blue-200 rounded-lg shadow p-6" data-section="quick-stats" data-destination="quick-stats">
                    <h2 class="text-lg font-semibold mb-2">Quick Stats 🧮</h2>
                    <p class="text-sm text-gray-500 mb-4">Summaries: Click for details. Click card again to close.</p>
                    <div class="grid md:grid-cols-3 lg:grid-cols-4 gap-6" id="stats-cards">
                        <div class="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center" data-stat="active-tasks">
                            <div class="p-2 bg-blue-100 rounded-lg mr-3">
                                <div class="w-6 h-6"><p class="text-2xl font-bold" data-value="active-tasks">?</p></div>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500">Active Tasks</p>
                                <p class="text-xs text-gray-500">Currently in progress</p>
                            </div>
                        </div>
                        
                        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center" data-stat="completed-tasks">
                            <div class="p-2 bg-green-100 rounded-lg mr-3">
                                <div class="w-6 h-6"><p class="text-2xl font-bold" data-value="completed-tasks">?</p></div>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500">Completed Tasks</p>
                                <p class="text-xs text-gray-500">Successfully finished</p>
                            </div>
                        </div>
                        
                        <div class="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center" data-stat="abandoned-tasks">
                            <div class="p-2 bg-red-100 rounded-lg mr-3">
                                <div class="w-6 h-6"><p class="text-2xl font-bold" data-value="abandoned-tasks">?</p></div>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500">Abandoned Tasks</p>
                                <p class="text-xs text-gray-500">Previously stopped</p>
                            </div>
                        </div>
                        
                        <div class="bg-white rounded-lg shadow p-4 flex items-center" data-stat="available-surveys">
                            <div class="p-2 bg-indigo-100 rounded-lg mr-3">
                                <div class="w-6 h-6"><p class="text-2xl font-bold" data-value="available-surveys">?</p></div>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500">Surveys</p>
                                <p class="text-xs text-gray-500">Ready to be answered</p>
                            </div>
                        </div>
                        
                        <div class="bg-white rounded-lg shadow p-4 flex items-center" data-stat="available-tasks">
                            <div class="p-2 bg-indigo-100 rounded-lg mr-3">
                                <div class="w-6 h-6"><p class="text-2xl font-bold" data-value="available-relations">?</p></div>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500">Relations</p>
                                <p class="text-xs text-gray-500">My connections</p>
                            </div>
                        </div>
                        
                        <div class="bg-white rounded-lg shadow p-4 flex items-center" data-stat="available-rewards">
                            <div class="p-2 bg-indigo-100 rounded-lg mr-3">
                                <div class="w-6 h-6"><p class="text-2xl font-bold" data-value="available-rewards">?</p></div>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500">Rewards</p>
                                <p class="text-xs text-gray-500">My rewards</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- QUICK ACTS -->
                <div class="bg-red-100 rounded-lg shadow p-6" data-section="quick-acts" data-destination="quick-acts">
                    <h2 class="text-lg font-semibold mb-2">Quick Acts 🌀</h2>
                    <p class="text-sm text-gray-500 mb-4">Fast access to common tasks. (Click the card again to close)</p>
                    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 cursor-pointer hover:shadow-md" data-action="invite-friend-dialogue">
                            <h3 class="text-sm font-medium text-yellow-500">Invite a friend</h3>
                            <p class="text-xs text-gray-500">Let some you know, know somthing you know that they should know to know.</p>
                        </div>
                        
                        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 cursor-pointer hover:shadow-md" data-action="recruit-link-dialogue">
                            <h3 class="text-sm font-medium text-yellow-700">Copy recruit link</h3>
                            <p class="text-xs text-gray-500">If you email this link and that person joins you will get thanks for being the recruiter</p>
                        </div>
                        
                        <div class="bg-red-50 border border-green-200 rounded-lg p-4 cursor-pointer hover:shadow-md" data-action="check-rewards-dialogue">
                            <h3 class="text-sm font-medium text-green-700">Check Rewards</h3>
                            <p class="text-xs text-gray-500">When doing your bit there may be rewards</p>
                        </div>
                        
                        <div class="bg-green-50 border border-blue-200 rounded-lg p-4 cursor-pointer hover:shadow-md" data-action="update-approfile-dialogue">
                            <h3 class="text-sm font-medium text-yellow-500">Update Details</h3>
                            <p class="text-xs text-gray-500">Your details are held in your approfile.</p>
                        </div>
                        
                        <div class="bg-green-50 border border-blue-200 rounded-lg p-4 cursor-pointer hover:shadow-md" data-action="local-support-dialogue">
                            <h3 class="text-sm font-medium text-blue-700">Contact local support</h3>
                            <p class="text-xs text-gray-500">This is to message the support from within your organisation. (For support from the suppliers of the software please ask via the admin dash or ask admin to make contact</p>
                        </div>
                    </div>
                </div>
                
                <!-- SURVEYS SECTION -->
                <div data-section="surveys-section" class="bg-gray-50 rounded-lg shadow p-6 border border-gray-500">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-2xl font-bold">Have your say (surveys) 📜</h2>
                        <div class="flex gap-2" class="border border-red-200" data-action="display-student-surveys" >
                        </div>
                    
                    <div class="bg-orange-100 space-y-6" data-list="my-surveys">
                        <!-- Surveys will be loaded here dynamically -->
                    </div>

                    </div>
                </div>
                
                <!-- TASKS SECTION -->
                <div data-section="tasks-section" class="bg-blue-100 rounded-lg shadow p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-2xl font-bold">Do your bit (tasks) 🔧</h2>
                        <div class="flex gap-2"></div>
                        <!--  INSTRUCTIONS   -->                           
                    <div class="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                       <h4 class="text-ml font-bold text-blue-500 mb-4">Doing my bit through tasks</h4>
                       <ul class="list-disc list-inside mt-2 text-sm text-blue-500">
                       <li>If you have been assigned a task it will apear here</li>
                       <li>You can see what step of the task you are on, and what you have already done.</li>
                       <li>You can message the manager of the task</li>
                        <li> The manager can message you</li>
                        <li> If the task is self-managed you will find how to do that in the other section. You can't move between steps of a task in this section</li>
                        <li> If you have lost all hope you can mark the task as abandoned. This cannot be reversed except by being assigned to the task again.</li>
                        <li> Some tasks are self managed (see below). Some are automated. Some tasks are fully self-contained and some are just a record of some process taking place externally</li>
                        <li> Completion is reached step by step.</li>
                        <li></li>
                      <li>If you are on a task you are referred to as 'the student'. If you also manage the task you are on, that will be shown here, but managed in the other section</li>
                      <li>Moving yourself through a task is done in that other section</li>
                      <li></li>
                        </ul>  
                    </div>

                    </div>

                    <div class="bg-indigo-100 space-y-6" data-list="my-tasks">
                        <!-- Tasks will be loaded here dynamically -->
                                            </div>
                </div>
                
                <!-- RELATIONS SECTION -->
                <div data-section="relations-section">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-2xl font-bold">No one is an island 🏝️ (relations) 🖇️</h2>
                        <div class="flex gap-2" class="border border-red-200"></div>
                         <!--  INSTRUCTIONS   -->                           
                    <div class="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                       <h4 class="text-ml font-bold text-blue-500 mb-4">How I relate to others</h4>
                       <ul class="list-disc list-inside mt-2 text-sm text-blue-500">
                       <li>If you have been related to another person or a group or a task or some abstract concept here is where you can explore</li>
                       <li>You can see who you have been related to. This may be a person or an interest group or a branch or an unlimited number of things</li>
                       <li>Clicking on whatever you are related to shows who else is connected to that</li>
                        <li>If you find that you aren't connected to much or you seem to be oddly connected to something here is what to do...</li>
                        <li> If you want to be more connected try seeking out surveys to have your say, or assigning yourself to tasks to do your bit. These surveys and tasks are likely to automatically connect you to others</li>
                        <li> If you see connections that you don't think are appropriate, please message an admin.</li>
                        <li> Some relations are automated and may produce unexpected results. Some tasks and many surveys have 'automations' that relate the student based on steps in the task or answers to questions. Everyone should check their relations</li>
                        <li> </li>
                        <li></li>
                      <li>Note that you may have been 'related' to a task. This is different to being assinged to the task. If you are on a task you are referred to as 'the student' and you move through it step by step. However, you could be related to a task because it covers a subject dear to you, or because it is a task that you created, or have completed.</li>
                      <li></li>
                      <li></li>
                        </ul>  
                    </div>
                    </div>
                    <div class="bg-orange-100 space-y-6" >
                        <!-- Relations will be loaded here dynamically -->

                    </div>
                </div>
                
                <!-- STUDENTS SECTION -->
                <div data-section="students-section">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-2xl font-bold">My Students 🧑‍🎓</h2>
                    </div>

<!--  INSTRUCTIONS   -->                           
                    <div class="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                       <h4 class="text-ml font-bold text-blue-500 mb-4">Doing my bit as a manager</h4>
                       <ul class="list-disc list-inside mt-2 text-sm text-blue-500">
                       <li>If you have been appointed as a manger of a task, all those tasks and students will appear here</li>
                       <li>You can see what step of the task each student is on.</li>
                       <li>You can message the student</li>
                        <li> The student can message you</li>
                        <li> You can move the student to the next step of the task</li>
                        <li> You can mark the task as abandoned by that student</li>
                        <li> When you judge that the student has finished the final step, moving forward marks the task as completed</li>
                        <li>You can't jump straight to 'completed,' this can only be reached step by step.</li>
                        <li>Once abandoned, the only way to recover is to assign the task again</li>
                      <li>If you are on a task you are referred to as 'the student'. If you also manage the task you are on, that will be shown here</li>
                      <li>Moving yourself through a task is done in this section</li>
                      <li></li>
                        </ul>  
                    </div>

<!--the module injects cards here on a white background -->

        </div>   
        
        <!-- Settings -->
<div class="bg-gray-100 rounded-lg shadow p-6" data-section='settings' data-destination='settings'>
  <h2 class="text-lg font-semibold mb-2">Settings  ⚙️</h2>
  <p class="text-sm text-gray-500 mb-4">System configuration and settings</p>
  <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

    <div class="bg-gray-50 border border-gray-200 rounded-lg p-4" onclick="showToast('User Roles not yet implemented')">
      <h3 class="text-sm font-medium text-gray-800">My Roles</h3>
      <p class="text-xs text-gray-500">Manage my permissions and roles</p>
    </div>

    <div class="bg-gray-50 border border-gray-200 rounded-lg p-4" onclick="showToast('Rewards not yet implemented')">
      <h3 class="text-sm font-medium text-gray-800">Rewards</h3>
      <p class="text-xs text-gray-500">Check reward systems and my achievements</p>
    </div>

    <div class="bg-gray-50 border border-gray-200 rounded-lg p-4" data-action="money-management-section">
      <h3 class="text-sm font-medium text-gray-800">Money</h3>
      <p class="text-xs text-gray-500">Becoming a member, managing membership fees , subscriptions, donations</p>
    </div>

    <div class="bg-gray-50 border border-gray-200 rounded-lg p-4" onclick="showToast('Support not yet implemented')">
      <h3 class="text-sm font-medium text-gray-800">Support</h3>
      <p class="text-xs text-gray-500">Access support tools and documentation</p>
    </div>

    <div class="bg-gray-50 border border-gray-200 rounded-lg p-4" onclick="showToast('Messages not yet implemented')">
      <h3 class="text-sm font-medium text-gray-800">Messages</h3>
      <p class="text-xs text-gray-500">System notifications and announcements</p>
    </div>


  </div>
</div>
    </div>
</div>
        
        ${petitionBreadcrumbs()}
    `;
}

export function render(panel, petition = {}) {
    console.log('adminDash Render(', panel, petition, ')');
   panel.innerHTML = getTemplateHTML(); // 

     //? query.petitioner : 'unknown';
 //   console.log('Petition:', petition);
  //  panel.innerHTML+= `<p class="text-xs text-gray-400 mt-4">Context: ${petition.Module} - ${petition.Section} - ${petition.Action}- ${petition.Destination}</p>`;
   // panel.innerHTML+=petitionBreadcrumbs();//this reads 'petition' and prints the values at bottom of the render panel
  }
//petitioner

// is passed when the adminListeners() function calls appState.setQuery({callerContext: action});
//it has to be called prior to passing it in the query{} object when we call this module
//in adminListeners.js, when we call appState.setQuery(), we need to have added petitioner: petition
//then we can access it here in the render() function
//we can also add a default value of 'unknown' if it is not passed
//so we can see where we are when we open the a new page

//the call here isn't from adminListeners it is from the menu button in the dashboard
//so we need to also assign petitioner: {Module:'dashboard', Section:'menu', Action:'howTo'} when we call this module from the menu button
//we can do this in the dashboardListeners.js file
//we can also add a default value of 'unknown' if it is not passed