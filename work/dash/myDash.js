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
            <div class="px-6 py-4 border-b bg-green-200 flex justify-between items-center">
                <div class="name" title="Toggle between admin & my dashboard"></div>
                <div>
                    <h1 class="text-2xl font-bold" data-dash-title="admin">My Dashboard</h1>
                    <p class="text-sm text-gray-500" data-dash-sub_title="my">Check my tasks, update my details, manage my students...</p>
                </div>
            </div>
            
            <div class="container mx-auto px-4 py-8 flex flex-col gap-8">
                
<!-- 1. PROFILE SECTION (empty container - displayProfile.js injects content) -->
    <div class="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row items-center md:items-start gap-8" data-section="profile-section">
        <!-- displayProfile.render() will inject the profile template here -->
    </div>

<!-- data-value is used in some numbers and data-count is used in others. Don't know why. Don't know if it matters  March 7 2026  -->

<!-- 2. THINGS TO DO SECTION (new structure) -->
                <div class="bg-white rounded-lg shadow p-6 border-t-4 border-blue-500">
                    <h2 class="text-xl font-bold text-gray-800 mb-4">Things to Do ✨ complete tasks, answer surveys, respond to messages</h2>
                    
                    <!-- Tasks List -->
                    <div class="mb-6">
                        <div class="flex items-center justify-between mb-2">
                            <h3 class="text-lg font-semibold text-blue-700">Tasks 🔧</h3>
         <!-- Counts are now clickable -->
            <div class="text-sm text-gray-500 flex gap-3">
                <span class="cursor-pointer hover:text-blue-600 hover:underline" 
                  data-count="completed-tasks" 
                  data-action="view-completed-tasks"
                  title="Click to view completed tasks">
                    <span data-value="completed-tasks" >?</span> completed ✓
                </span>

            <span class="cursor-pointer hover:text-red-600 hover:underline" 
                  data-count="abandoned-tasks" 
                  data-action="view-abandoned-tasks"
                  title="Click to view abandoned tasks">
                <span data-value="abandoned-tasks" >?</span> abandoned ✗
            </span>
        </div>                        
    </div>

                        <div class="mb-3 bg-blue-50 p-3 rounded border border-blue-200 text-sm text-blue-700">
                        You have <span data-value="active-tasks" >?</span> active tasks. Click on any single task you wish to view. The details will appear in the section below. Tasks are where you can do your bit.
            
                        </div>
                        <!-- Preserved data-list for existing task loader -->
                        <div class="bg-indigo-100 space-y-6" data-list="my-tasks" data-section="tasks-section">
                            <!-- Tasks loaded here by existing code -->
                        </div>
                        <div class="mt-3 flex gap-2">
                            <button class="text-sm text-blue-600 hover:underline" data-action="browse-tasks" title="Click to choose a new task for yourself. Tasks drive relations and surveys">Find a new task</button>
                            
                        </div>
                    </div>

                    <!-- Surveys List -->
                    <div class="mb-6">
                        <div class="flex items-center justify-between mb-2">
                            <h3 class="text-lg font-semibold text-orange-600">Surveys 📜</h3>
                             <!-- Counts are now clickable -->
        <div class="text-sm text-gray-500 flex gap-3">
            <span class="cursor-pointer hover:text-indigo-600 hover:underline" 
                  data-count="completed-surveys" 
                  data-action="view-completed-surveys"
                  title="Click to view completed surveys">
                <span data-value="completed-surveys" >?</span> completed ✓
            </span>
            <span class="cursor-pointer hover:text-red-600 hover:underline" 
                  data-count="abandoned-surveys" 
                  data-action="view-abandoned-surveys"
                  title="Click to view abandoned surveys">
                <span data-value="abandoned-surveys" >?</span> abandoned ✗
            </span>
        </div>
                        </div>
                        <div class="mb-3 bg-indigo-50 p-3 rounded border border-indigo-200 text-sm text-indigo-700">
                        You have <span data-value="available-surveys" >?</span> active surveys. Click on any single survey you wish to view. The details will appear in section below.
                            Your feedback shapes our direction. Answer surveys to have your say.
                        </div>
                        <!-- Preserved data-list for existing survey loader -->
                        <div class="bg-orange-100 space-y-6" data-list="my-surveys" data-section="surveys-section">
                            <!-- Surveys loaded here by existing code -->
                        </div>
                        <div class="mt-3 flex gap-2">
                            <button class="text-sm text-indigo-600 hover:underline" data-action="browse-surveys" title="Click to choose a new survey for yourself. Surveys drive relations & tasks">Find a new survey</button>
                            
                        </div>
                    </div>

                    <!-- Messages Placeholder -->
                    <div>
                        <h3 class="text-lg font-semibold text-green-700 mb-2">Messages 💬</h3>
                        <div class="bg-gray-50 p-4 rounded border text-sm text-gray-600">
                        
                            <p class="mt-1">Use the Notes system to contact others.</p>
                            <button class="nav-btn mt-2" data-page="bug-report" data-action="bug-report" data-destination="new-panel">
                                Send a message / Bug Report
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 4. DETAIL DISPLAY AREA (single injection point for expanded content) -->
                <div class="bg-white rounded-lg shadow p-6 border-b-4 border-blue-500">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-xl font-bold text-gray-800">Select a 
                        <span class="text-blue-700">task</span>, <span class="text-orange-600">survey</span>, or <span class="text-green-700">message</span> above to view details here.</h2>
                        <!--button class="text-sm text-gray-500 hover:text-gray-700" data-action="close-detail">✕ Close</button-->
                    </div>
                    <div id="detail-placeholder" class="text-center py-8 text-gray-500">
<!-- not sure if this suggest button should exist. The code should suggest something if nothing is assigned. and find new is already in the task and survey section. -->
                        <button class="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200" data-action="suggest-item">Suggest something for me</button>
                    </div>

                    <!-- flexmain.getDisplayArea() find this element for new-panel injections -->
                    <div data-section="display-area">
    <div id="detail-content" data-panel="inject-here"></div>
</div>


                <!-- 3. ROLE / AIMS / PLANS CARD ROW (clickable cards, existing nav-btn pattern) -->
                <div class="flex flex-col md:flex-row gap-4">
                    <div class="flex-1 bg-white rounded-lg shadow p-4 border-l-4 border-purple-400">
                        <h3 class="text-lg font-semibold text-purple-700 mb-2">My Role 👤</h3>
                        <p class="text-sm text-gray-600 mb-3">View your permissions, groups, and capabilities. There are <span data-value="available-relations" >?</span> items related to your role</p>
                        
                        <button class="nav-btn w-full" data-page="my-role" data-action="view-role" data-destination="new-panel">View My Role</button>
                    </div>
                    <div class="flex-1 bg-white rounded-lg shadow p-4 border-l-4 border-green-400">
                        <h3 class="text-lg font-semibold text-green-700 mb-2">Our Aims 🎯</h3>
                        <p class="text-sm text-gray-600 mb-3">Read our mission and long-term goals.</p>
                        <button class="nav-btn w-full" data-page="aims" data-action="aims" data-destination="new-panel">View Aims</button>
                    </div>
                    <div class="flex-1 bg-white rounded-lg shadow p-4 border-l-4 border-orange-400">
                        <h3 class="text-lg font-semibold text-orange-700 mb-2">Our Plans 🗓️</h3>
                        <p class="text-sm text-gray-600 mb-3">See current priorities and short-term objectives.</p>
                        <button class="nav-btn w-full" data-page="plans" data-action="plans" data-destination="new-panel">View Plans</button>
                    </div>
                </div>



                <!-- 5. SETTINGS (kept minimal, unchanged) -->
                <div class="bg-gray-100 rounded-lg shadow p-6" data-section='settings' data-destination='settings'>
                  <h2 class="text-lg font-semibold mb-2">Settings  ⚙️</h2>
                  <p class="text-sm text-gray-500 mb-4">System configuration and settings</p>
                  <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div class="bg-gray-50 border border-gray-200 rounded-lg p-4" onclick="showToast('User Roles not yet implemented')">
                      <h3 class="text-sm font-medium text-gray-800">My Roles</h3>
                      <p class="text-xs text-gray-500">Manage my permissions and roles</p>
                    </div>

                    <div class="bg-gray-50 border border-gray-200 rounded-lg p-4" data-action="recruitment-management-section")>
                      <h3 class="text-sm font-medium text-gray-800">Invite others to join</h3>
                      <p class="text-xs text-gray-500">You can use a link on social media or email to recruit others to join.</p>
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
                
                ${petitionBreadcrumbs()}
            </div>
        </div>
    `;
}

export function render(panel, petition = {}) {
    console.log('adminDash Render(', panel, petition, ')');
    panel.innerHTML = getTemplateHTML();
}