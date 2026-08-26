// ./work/dash/myDash.js
//import { appState } from '../../state/appState.js';
//import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { petitionBreadcrumbs } from '../../ui/breadcrumb.js';
//import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';
//import { icons } from '../../registry/iconList.js';

console.log('myDash.js loaded version March 2026 - layout refactor');

function getTemplateHTML() {
    return `
        <!-- DASHBOARD CONTAINER STRUCTURE -->
        <div class="my-dashboard bg-gray-100 min-h-screen" data-module="myDash" data-destination='new-panel'>
            



            <!-- DASHBOARD HEADER (unchanged) -->
            <div class="px-0 md:px-6 py-4 border-b bg-green-200 flex justify-between items-center">
                <div class="name" data-value="userName"  title="The logged-in user name. If this isn't you, please login">userName
                </div> <i> ~ using the app for creating & managing an organisation</i>
                <div>
                    <h1 class="text-2xl font-bold" data-dash-title="admin">My Dashboard</h1>
                    <p class="text-sm text-gray-500" data-dash-sub_title="my">Check my tasks, surveys, messages & settings</p>
                </div>
            </div>
            
            <div class="container mx-auto w-full px-0 md:px-4 py-8 flex flex-col gap-8">
                


<!-- data-value is used in some numbers and data-count is used in others. Don't know why. Don't know if it matters  March 7 2026  -->

<!-- 2. THINGS TO DO SECTION (new structure) -->
                <div class=" bg-gray-100 rounded-lg shadow p-0 md:p-6 border-t border-blue-500">
                    <!--h2 class="text-xl font-bold text-gray-800 mb-4">Doing my bit ✨  <i>Tasks to handle - click the card below 🔧</i></h2-->



                    <!-- Tasks List -->
                    <div class="mb-6">
                        <div class="flex items-center justify-between mb-2">
                            <h2 class="text-xl font-bold text-grey-800">Doing my bit ✨  <i>Tasks to handle - click the card below</i> 🔧</h2>
                      
                    </div>

                    <div class="bg-blue-50 p-0 md:p-3 rounded border border-grey-200 text-sm text-grey-700">
                        I have <span data-value="active-tasks" >?</span> active tasks. <br>
                        Click on a card to see the details (a card is a rectangle with words inside).
                        The details will appear below.<br>
                        Tasks are where you can do your bit.<br>

                                                <div class="  cursor-pointer hover:text-blue-600 hover:underline text-sm font-sm text-blue-700 mb-2" 
                                                data-section="tasks-section-list" 
                                                data-action="display-task-choice" 
                                                data-destination ="tasks-section" 
                                                title='Shows a list of all available tasks. You can take on any task by clicking it.' >
                          <i>(If you want extra tasks click here to add tasks) 🔧</i>
                        
                        </div>
                    </div>

                        <!-- Preserved data-list for existing task loader -->
                    <div class="bg-indigo-100 space-y-1" data-list="my-tasks" data-section="tasks-section">

                       

                        <!--div class="mt-3 flex gap-2 "  data-action="display-task-choice" data-destination ="tasks-section" title='Shows a list of all available tasks. You can take on any task by clicking it.' >
                        <p class="text-sm font-sm text-blue-700 mb-2">If you want more tasks click here to add tasks 🔧</p>
                        
                        </div-->

 <!-- Tasks LOAD HERE    removed from button: data-section="tasks-section"  12:30 Aug 16 2026-->

                    </div>
<!--moved the choose more tasks to above the place where they will display-->

         <!-- Counts are now clickable -->
            <div class="text-sm  flex gap-3">
                <span class="text-green-500 cursor-pointer hover:text-blue-600 hover:underline" 
                  data-count="completed-tasks" 
                  data-action="view-completed-tasks"
                  data-destination ="tasks-section"
                  data-section ='task-section'
                  title="Click to view completed tasks">
                    <span data-value="completed-tasks" >?</span> completed ✓
                </span>

            <span class="cursor-pointer hover:text-red-800 hover:underline" 
                  data-count="abandoned-tasks" 
                  data-action="view-abandoned-tasks"
                  data-destination ="tasks-section"
                  data-section ='task-section'
                  title="Click to view abandoned tasks">
                <span data-value="abandoned-tasks" >?</span> abandoned ✗
            </span>
        </div>  

<!-- having the task toggle link here means it is pushed to below the long list of tasks so can't easily toggle off. -->

        </div>

        </div>


       <!-- the surveys are in their own bordered section. Very similar to tasks --> 
                <div class=" bg-gray-100 rounded-lg shadow p-0 md:p-6 border-t border-orange-500">



                    <!-- Surveys List -->
                    <div class="mb-6">
                        <div class="flex items-center justify-between mb-2">
                            <h2 class="text-lg font-semibold text-orange-600">Having my say - click a card below 📜</h2>
                            
                        </div>

                        <div class="bg-orange-50 p-3 rounded border border-indigo-200 text-sm text-grey-700">
                        I have <span data-value="available-surveys" >?</span> active surveys.<br>
                        Click on a survey you wish to view. The details will appear below.
                        <br>Your feedback shapes our direction. Answer surveys to have your say.
                        
                        
                       <div class="cursor-pointer hover:text-blue-600 hover:underline text-sm font-sm text-blue-700 mb-2"  
                       data-section="survey-section-list"
                       data-action="display-survey-choice" 
                       data-destination ="surveys-section" 
                       title='Shows a list of all available surveys. You can take on any survey by clicking it.' >
                        <i>(If you want to answer more surveys you can add to your list)</i>  📜 
                       </div>
                            </div>
                        <!-- Preserved data-list for existing survey loader -->
                        <div class="bg-orange-100 space-y-1" data-list="my-surveys" data-section="surveys-section">

                            <!-- Surveys LOAD HERE  removed from button data-section="surveys-section"  12:31 Aug 16 2026-->
                        

                  <!--div class="mt-3 flex gap-2 "  data-action="display-survey-choice" data-destination ="surveys-section"  >
                        <h3 class="text-sm font-sm text-blue-700 mb-2">Toggle more surveys you can add to your list  📜</h3>
                        <p class="text-sm text-gray-600 mb-3">Scroll down & click any survey you can take on. Surveys make choices. </p>
                    </div-->


                       <!--div class="cursor-pointer hover:text-blue-600 hover:underline text-sm font-sm text-blue-700 mb-2"  
                       data-action="display-survey-choice" 
                       data-destination ="surveys-section" 
                       title='Shows a list of all available surveys. You can take on any survey by clicking it.' >
                        <i>If you want to answer more surveys you can add to your list</i>  📜 
                       </div-->




                   </div>
<!--moved the choose more surveys to above the place where they will display-->
 <!-- Counts are now clickable -->
        <div class="text-sm text-gray-500 flex gap-3">
            <span class="cursor-pointer hover:text-indigo-600 hover:underline" 
                  data-count="completed-surveys" 
                  data-action="view-completed-surveys"
                   data-section ='surveys-section'
                   data-destination ="surveys-section"
                  title="Click to view completed surveys">
                <span data-value="completed-surveys" >?</span> completed ✓
            </span>
            <span class="cursor-pointer hover:text-red-600 hover:underline" 
                  data-count="abandoned-surveys" 
                  data-action="view-abandoned-surveys"
                   data-section ='surveys-section'
                   data-destination ="surveys-section"
                  title="Click to view abandoned surveys">
                <span data-value="abandoned-surveys" >?</span> abandoned ✗
            </span>
        </div>
                 
     
     
        </div>

                    <!-- Messages Placeholder -->
                    <!--div>
                        <h3 class="text-lg font-semibold text-green-700 mb-2">Messages 💬</h3>
                        <div class="bg-gray-50 p-2 md:p-4 rounded border text-sm text-gray-600">                     
                            <p class="mb-3 bg-indigo-50 p-3 rounded border border-indigo-200 text-sm text-grey-700"> Use the top menu [Messages] to contact others.  Scroll to the right or on a phone 'swipe left' <i> Click menu button to close the messages</i>
                            </p>
                        </div>
                    </div-->
                </div>

                    <div data-anchor="detail-placeholder" class="text-center py-0 md:py-8 text-gray-500">
<!-- anchor to scroll too. There seems to be a problem scrolling to the display-area in Chrome. 
It goes to end of section. Firefox (localhost) goes to start. 
May be because of dynamic injection of card contents into same display-area
Therefore use this anchor div instead -->
                    </div>

                    <!-- flexmain.getDisplayArea() find this element for new-panel injections -->
                    <div data-section="display-area">
    <div id="detail-content" data-panel="inject-here"></div>
</div>

                <!-- 4. DETAIL DISPLAY AREA (single injection point for expanded content) -->
                <div class="bg-white rounded-lg shadow px-0 md:px-6 border-t border-blue-500">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-xl font-bold text-gray-800">
                        <span class="text-purple-700">Roles</span>, <span class="text-green-700">Aims</span> &<span class='text-orange-700'>Plans</span></h2>
                    </div>





                <!-- 3. ROLE / AIMS / PLANS CARD ROW (clickable cards using normal petitioner method) -->

 <div class="mb-3 bg-indigo-50 p-3 rounded border  border-indigo-200 text-sm text-grey-700">
 Click a card once to open the module. <i>Click the card again to close the module</i></div>
                <div class="flex flex-col md:flex-row p-2 md:p-4" data-section="role-aims-plans" data-destination="display-area">

                    <div class="flex-1 bg-white rounded-lg shadow p-2 md:p-4 border-l-4 border-purple-400" data-action="my-role">
                        <h3 class="text-lg font-semibold text-purple-700 mb-2">My Role 👤</h3>
                        <p class="text-sm text-gray-600 mb-3">View permissions, groups, and capabilities. There are <span data-value="available-relations" >?</span> items related to your role</p>
                    </div>
    
                    <div class="flex-1 bg-white rounded-lg shadow p-2 md:p-4 border-l-4 border-green-400" data-action="aims">
                        <h3 class="text-lg font-semibold text-green-700 mb-2">Our Aims 🎯</h3>
                        <p class="text-sm text-gray-600 mb-3">Read our mission and long-term goals.</p>                   
                    </div>

                    <div class="flex-1 bg-white rounded-lg shadow p-2 md:p-4 border-l-4 border-orange-400" data-action="plans">
                        <h3 class="text-lg font-semibold text-orange-700 mb-2">Our Plans 🗓️</h3>
                        <p class="text-sm text-gray-600 mb-3">See current priorities and short-term objectives.</p>
                    </div>
                </div>
</div>


<!-- 1. PROFILE SECTION (empty container - displayProfile.js injects content) -->
    
<div > 

        <!--div class="mb-0 md:mb-3 bg-blue-50 p-0 md:p-3 rounded border border-blue-200 text-sm text-blue-700">    
         <p>Navigation: click menu button at top of screen - new stuff opens to right of dashboard (scroll if needed)</p>
         <p> click a card within the page [rectangles with words in them]. - new stuff opens in the dashboard (scroll down if needed)</p>
         <p>If you get lost click top menu button [My Dash] - that will close all the extra bits and return you to the dashboard ready for another adventure.</p>
         <p>The dashboard is on 1 page. The browser back button will return you to the login page.</p>
         <p>What the page displays depends on what you click. </p>
         <p>When you click a card the new information opens below and you have to scroll down to see it.</p> 
         <p>When you click a menu button it opens to the right and you may have to scroll to the right to see it.</p>
         <p>The design is easier on a large screen.</p>
         <p> If it gets messy click [My Dash]</p>
                 </div-->
   <div  data-section="profile-section"  class="bg-green-50 rounded-lg shadow px-0 md:px-6 border-t border-green-500">
        <!-- displayProfile.render() will inject the profile template here -->
   </div>

</div>


                <!-- 5. SETTINGS (kept minimal)  -->
                <div class="bg-gray-150 rounded-lg shadow p-0 md:p-6 border-t border-gray-500" data-section='settings' data-destination='settings'>
                  <h2 class="text-lg font-semibold mb-2">Settings  ⚙️</h2>
                  <p class="text-sm text-gray-500 mb-4">System configuration and settings</p>

                  <div class="grid md:grid-cols-2 lg:grid-cols-4 p-2 md:p-4">
                    
                    <div class="bg-gray-50 border border-gray-200 rounded-lg p-2 md:p-4 cursor-pointer hover:shadow-md" data-action="recruitment-management-section">
                      <h3 class="text-sm font-medium text-gray-800">Invite others to join 📢</h3>
                      <p class="text-xs text-gray-500">You can use a link on social media or email to recruit others to join.</p>
                    </div>


                    <div class="bg-gray-50 border border-gray-200 rounded-lg p-2 md:p-4 cursor-pointer hover:shadow-md" >
                      <h3 class="text-sm font-medium text-gray-800">Rewards</h3>
                      <p class="text-xs text-gray-500">Check reward systems and my achievements</p>
                    </div>

                    <div class="bg-gray-50 border border-gray-200 rounded-lg p-2 md:p-4 cursor-pointer hover:shadow-md" >
                      <h3 class="text-sm font-medium text-gray-800">Support</h3>
                      <p class="text-xs text-gray-500">Access support tools and documentation</p>
                    </div>

                    <div class="bg-gray-50 border border-gray-200 rounded-lg p-2 md:p-4 cursor-pointer hover:shadow-md" >
                      <h3 class="text-sm font-medium text-gray-800">Affiliate Links</h3>
                      <p class="text-xs text-gray-500">Ways to buy things where the organisation receives a commission</p>
                    </div>
 
                  </div> 
                </div>
                
                ${petitionBreadcrumbs()}
            </div>
        </div>
    `;
}

export function render(panel, petition = {}) {
    console.log('adminDash Render()');
    //    console.log('adminDash Render(', panel, petition, ')');
    panel.innerHTML = getTemplateHTML();
}

