//  ./work/dash/adminDash.js
console.log('adminDash.js loaded');
//import { showToast } from '../../flexmain.js';
import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';

function getTemplateHTML() { console.log('getTemplateHTML()');
  return `
<section data-page-type="dashboard" data-permission="admin" data-module="adminDash" data-destination='new-panel'>
 
  <!-- dashboard content -->
<div class="min-h-screen bg-gray-200 text-gray-900">


<!-- DASHBOARD HEADER -->   
<!-- DASHBOARD HEADER -->   
<div class="px-6 py-4 border-b bg-blue-200 flex justify-between items-center gap-4">
  
  <!-- Left Side: Group User & Data Details together -->
  <div class="flex flex-col gap-1 min-w-0">
    <div class="userDetails text-sm text-gray-500 truncate" data-value="user-details" title="User name and auth of the logged in person">Logged-in user details to be loaded</div>
    <div class="dataDetails text-sm text-gray-500 truncate" data-value="data-details" title="Name and appro id of the last item selected with the selection tool">Any selected item data details to be loaded</div>
  </div>

  <!-- Right Side: Title & Description -->
  <div class="flex-1 min-w-0 text-right">
    <h1 class="text-xl md:text-2xl font-bold truncate" data-dash-title="admin">Admin Dashboard</h1>
    <p class="text-sm text-gray-500 truncate" data-dash-sub_title="admin">See data, manage members, tasks, relations & knowledge.</p>
    <p class="text-sm text-gray-500 truncate" data-dash-sub_title="admin">Click the menu <em>How?</em> button for help</p>
  </div>

</div>

<!-- Quick Acts -->
<div class="bg-gray-100 rounded-lg shadow p-6" data-section="quick-acts" data-destination="quick-acts">
  <h2 class="text-lg font-semibold mb-2">Quick Acts 🌀</h2>
  <p class="text-sm text-gray-500 mb-4">Fast access to common admin tasks. They open below. (Click the card again to close)</p>

  <!-- Matrix: 3 rows × 4 columns -->
  <div class="grid grid-cols-4 gap-4">

    <!-- ===================== -->
    <!-- ROW 1 — APPRO ACTIONS -->
    <!-- ===================== -->

    <!-- Appro: Create -->
    <div class="rounded-2xl bg-green-50 border border-green-200 p-4 cursor-pointer hover:shadow-md" data-action="create-approfile-dialogue">
      <h3 class="text-sm font-medium text-green-700">Create Appro 🎆🪪</h3>
      <p class="text-xs text-gray-600 hidden md:block" >Create a new approfile, often abstract, representing a concept, aim, or person.</p>
    </div>

    <!-- Appro: Edit -->
    <div class="rounded-2xl bg-green-50 border border-green-200 p-4 cursor-pointer hover:shadow-md" data-action="edit-approfile-dialogue">
      <h3 class="text-sm font-medium text-green-700">Edit Appro 🖊️🪪</h3>
      <p class="text-xs text-gray-600 hidden md:block" >Modify an existing approfile’s details, structure, or meaning.</p>
    </div>

    <!-- Appro: View -->
    <div class="rounded-2xl bg-green-50 border border-green-200 p-4 cursor-pointer hover:shadow-md" data-action="display-related-approfiles-dialogue">
      <h3 class="text-sm font-medium text-green-700">View Appros 👁️🪪🖇️</h3>
      <p class="text-xs text-gray-600 hidden md:block" >Explore how appros relate, connect, and form hierarchy.</p>
    </div>

    <!-- Appro: Assign -->
    <div class="rounded-2xl bg-green-50 p-4 cursor-pointer hover:shadow-md" data-action="relate-approfiles-dialogue">
      <h3 class="text-sm font-medium text-green-700">Relate Appro 🪪🖇️</h3>
      <p class="text-xs text-gray-600 hidden md:block" >Relate one appro to another, defining structure and relationships.</p>
    </div>


    <!-- ====================== -->
    <!-- ROW 2 — SURVEY ACTIONS -->
    <!-- ====================== -->

    <!-- Survey: Create -->
    <div class="bg-yellow-50 border border-yellow-200 rounded-r-2xl p-3 cursor-pointer hover:shadow-md" data-action="create-survey-dialogue">
      <h3 class="text-sm font-medium text-yellow-700">Create Survey 🎆📜</h3>
      <p class="text-xs text-gray-600 hidden md:block" >Author a new survey for onboarding, training, or information gathering.</p>
    </div>

    <!-- Survey: Edit -->
    <div class="bg-yellow-50 border border-yellow-200 rounded-r-2xl p-3 cursor-pointer hover:shadow-md" data-action="edit-survey-dialogue">
      <h3 class="text-sm font-medium text-yellow-700">Edit Survey 🖊️📜</h3>
      <p class="text-xs text-gray-600 hidden md:block" >Modify questions, flow, or branching logic.</p>
    </div>

    <!-- Survey: View -->
    <div class="bg-gray-50 border border-yellow-200 rounded-r-2xl p-3 cursor-pointer hover:shadow-md" data-action="view-survey-dialogue">
      <h3 class="text-sm font-medium text-yellow-700">View Survey 👁️📜</h3>
      <p class="text-xs text-gray-600 hidden md:block" >TO BE IMPLEMENTED Preview or inspect survey structure and content.</p>
    </div>

    <!-- Survey: Assign -->
    <div class="bg-yellow-50 border border-yellow-200 rounded-r-2xl p-3 cursor-pointer hover:shadow-md" data-action="assign-survey-dialogue">
      <h3 class="text-sm font-medium text-yellow-700">Assign Survey 👨‍🔧📜</h3>
      <p class="text-xs text-gray-600 hidden md:block" >Assign a survey to a person or thing for onboarding or training.</p>
    </div>


    <!-- ===================== -->
    <!-- ROW 3 — TASK ACTIONS -->
    <!-- ===================== -->

    <!-- Task: Create -->
    <div class="bg-blue-50 border border-blue-200 rounded-l-2xl p-3 cursor-pointer hover:shadow-md" data-action="create-task-dialogue">
      <h3 class="text-sm font-medium text-blue-700">Create Task 🎆🔧</h3>
      <p class="text-xs text-gray-600 hidden md:block" >Author a new task: training course, progress tracker, recipe, or soft production line.</p>
    </div>

    <!-- Task: Edit -->
    <div class="bg-blue-50 border border-blue-200 rounded-l-2xl p-3 cursor-pointer hover:shadow-md" data-action="edit-task-dialogue">
      <h3 class="text-sm font-medium text-blue-700">Edit Task 🖊️🔧</h3>
      <p class="text-xs text-gray-600 hidden md:block" >Modify task steps, instructions, or structure.</p>
    </div>

    <!-- Task: View -->
    <div class="bg-blue-50 border border-blue-200 rounded-l-2xl p-3 cursor-pointer hover:shadow-md" data-action="display-task-summary">
      <h3 class="text-sm font-medium text-blue-700">View Task 👁️🔧</h3>
      <p class="text-xs text-gray-600 hidden md:block" >Inspect task details, steps, and progress logic.</p>
    </div>

    <!-- Task: Assign -->
    <div class="bg-blue-50 border border-blue-200 rounded-l-2xl p-3 cursor-pointer hover:shadow-md" data-action="assign-task-dialogue">
      <h3 class="text-sm font-medium text-blue-700">Assign Task 👨‍🔧🔧</h3>
      <p class="text-xs text-gray-600 hidden md:block" >Assign a person or thing to a task: training, production line, or progress tracker.</p>
    </div>

  </div>
</div>



<!-- INFORMATION SECTION added April 5 2026-->
<div id='informationSection'></div>

  <div class="container mx-auto px-4 py-8 space-y-8">
    
  <!-- Quick Stats -->
  <div class="bg-blue-200 rounded-lg shadow p-6" data-section="quick-stats" data-destination = "quick-stats">
    <h2 class="text-lg font-semibold mb-2">Quick Stats 🧮</h2>
    <p class="text-sm text-gray-500 mb-4">Summaries: Click for details. They open in a new panel to the right. Click card again to close.</p>
  <div class="grid md:grid-cols-3 lg:grid-cols-4 gap-6" id="stats-cards">



        <!-- tempSignup -->
    <div class="bg-orange-50 border border-blue-100 rounded-lg p-4" data-action="tempSignup-stats">
      <h3 class="text-sm font-medium text-blue-700 mb-1">Signups & Confirmed</h3>
      <span class="text-2xl font-bold text-blue-900" data-value="tempSignup-count">?</span>
      <span class="text-xs text-blue-600"> not yet confirmed</span>
      <!--p class="text-xs text-blue-400 mt-1" data-delta="tempsignups-month">+? new this month</p-->
    

        <!-- Signup-onfirmed -->
    <div class="bg-orange-50 border border-blue-200 rounded-lg p-4" data-action="signup-stats">
      <!--h3 class="text-sm font-medium text-blue-700 mb-1">Confirmed signups</h3-->
      <span class="text-2xl font-bold text-blue-900" data-value="signup-count">?</span>
      <span class="text-xs text-blue-600">confirmed</span>
      <!--p class="text-xs text-blue-400 mt-1" data-delta="confirmed-month">+? new this month</p-->
    </div>
</div> 

    <!-- Approfiles Human -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-action="humans-stats">
      <h3 class="text-sm font-medium text-blue-700 mb-1">Approfiles-Human</h3>
      <p class="text-2xl font-bold text-blue-900" data-value="members-count">?</p>
      <p class="text-xs text-blue-600">Registered users</p>
      <p class="text-xs text-blue-400 mt-1" data-delta="members-month">+? new this month</p>
    </div>

        <!-- Approfiles -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-action="approfiles-stats">
      <h3 class="text-sm font-medium text-blue-700 mb-1">Approfiles total</h3>
      <p class="text-2xl font-bold text-blue-900" data-value="approfiles-count">?</p>
      <p class="text-xs text-blue-600">Humans + tasks + surveys + abstracts</p>
      <p class="text-xs text-blue-400 mt-1" data-delta="members-month">+? new this month</p>
    </div> 

        <!-- Approfile_relations -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-action="relations-stats">
      <h3 class="text-sm font-medium text-blue-700 mb-1">Approfile Relations</h3>
      <p class="text-2xl font-bold text-blue-900" data-value="relations-count">?</p>
      <p class="text-xs text-blue-600">The number of links between appros</p>
      <p class="text-xs text-blue-400 mt-1" data-delta="members-month">+? new this month</p>
    </div>


        <!-- Assignments -->
    <div class="bg-red-50 border border-red-200 rounded-lg p-4" data-action="assignments-stats">
      <h3 class="text-sm font-medium text-red-700 mb-1">Assignments</h3>
      <p class="text-2xl font-bold text-red-900" data-value="assignments-count">?</p>
      <p class="text-xs text-red-600">Students, managers & assigned tasks, respondents & assigned surveys</p>
      <p class="text-xs text-red-400 mt-1" data-delta="assignments-week">+? this week</p>
    </div>

    <!-- Tasks -->
    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4" data-action="tasks-stats">
      <h3 class="text-sm font-medium text-yellow-700 mb-1">Tasks</h3>
      <p class="text-2xl font-bold text-yellow-900" data-value="tasks-count">?</p>
      <p class="text-xs text-yellow-600">Available tasks</p>
      <p class="text-xs text-yellow-400 mt-1" data-delta="tasks-month">+? added this month</p>
    </div>

    <!-- Authors -->
    <div class="bg-yellow-50 border border-purple-200 rounded-lg p-4" data-action="authors-stats">
      <h3 class="text-sm font-medium text-purple-700 mb-1">Authors</h3>
      <p class="text-2xl font-bold text-purple-900" data-value="authors-count-unique">?</p>
      <p class="text-xs text-purple-600">Task creators</p>
    </div>

    <!-- Students of Tasks -->
    <div class="bg-red-50 border border-green-200 rounded-lg p-4" data-action="students-stats">
      <h3 class="text-sm font-medium text-green-700 mb-1">Students</h3>
      <p class="text-2xl font-bold text-green-900" data-value="students-count-unique">?</p>
      <p class="text-xs text-green-600">Members on tasks</p>
    </div>

    <!-- Managers -->
    <div class="bg-red-50 border border-indigo-200 rounded-lg p-4" data-action="managers-stats">
      <h3 class="text-sm font-medium text-indigo-700 mb-1">Managers</h3>
      <p class="text-2xl font-bold text-indigo-900" data-value="managers-count-unique">?</p>
      <p class="text-xs text-indigo-600">Task supervisors</p>
    </div>

    <!-- Surveys -->
    <div class="bg-orange-50 border border-yellow-200 rounded-lg p-4" data-action="surveys-stats">
      <h3 class="text-sm font-medium text-yellow-700 mb-1">surveys</h3>
      <p class="text-2xl font-bold text-yellow-900" data-value="surveys-count">?</p>
      <p class="text-xs text-yellow-600">Available Surveys</p>
      <p class="text-xs text-yellow-400 mt-1" data-delta="tasks-month">+? added this month</p>
    </div>

    <!-- Respondents to Surveys -->
    <div class="bg-orange-50 border border-yellow-200 rounded-lg p-4" data-action="respondent-stats">
      <h3 class="text-sm font-medium text-yellow-700 mb-1">Respondents</h3>
      <p class="text-2xl font-bold text-yellow-900" data-value="respondents-count-unique">?</p>
      <p class="text-xs text-yellow-600">Persons assigned to answer a survey</p>
      <p class="text-xs text-yellow-400 mt-1" data-delta="tasks-month">+? added this month</p>
    </div>


    
        <!-- Analytics -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-action="analytics">
      <h3 class="text-sm font-medium text-blue-700 mb-1">Analytics</h3>
    </div>


  </div>
</div>




<!-- Recent Activity -->
<div class="bg-white rounded-lg shadow p-6" data-destination='new-panel'>
  <h2 class="text-lg font-semibold mb-2">Recent Activity 🫣</h2>
  <p class="text-sm text-gray-500 mb-4">Latest system events and user actions</p>
  <div class="space-y-4" id="activity-list">

    <div class="activity-item" data-activity="db">
      <p class="text-sm"><strong>source table</strong></p>
      <p class="text-xs text-gray-600"> row </p>
      <p class="text-xs text-gray-600"> event </p>
      <p class="text-xs text-gray-400">time</p>
      <p class="text-xs text-gray-600">abreviated id</p>
    </div>

    <div class="activity-item" data-activity="work">
      <p class="text-sm"><strong>name</strong></p>
      <p class="text-xs text-gray-600">descriptiom</p>
      <p class="text-xs text-gray-400">time</p>
      <p class="text-xs text-gray-600">abreviated id</p>
    </div>

    <div class="activity-item" data-activity="work">
      <p class="text-sm"><strong>name</strong></p>
      <p class="text-xs text-gray-600">descriptiom</p>
      <p class="text-xs text-gray-400">time</p>
      <p class="text-xs text-gray-600">abreviated id</p>
    </div>

    <div class="activity-item" data-activity="db">
      <p class="text-sm"><strong>source table</strong></p>
      <p class="text-xs text-gray-600"> row </p>
      <p class="text-xs text-gray-600"> event </p>
      <p class="text-xs text-gray-400">time</p>
      <p class="text-xs text-gray-600">abreviated id</p>
    </div>


  </div>
</div>



<!-- User Management -->
 <div class="bg-orange-100 rounded-lg  shadow p-6" data-section='user-management' data-destination='user-management'>
   <h2 class="text-lg font-semibold mb-2">Management </h2>
   <p class="text-sm text-gray-500 mb-4">Clicking any card expands that section below. Everything you can do, you probably do it in the expanded section.</p>
  
   <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

        <!-- Signup-confirmed -->
    <div class="bg-orange-50 border border-blue-200 rounded-lg p-4" data-action="signup-stats">
      <h3 class="text-sm font-medium text-blue-700 mb-1">Confirmed signups</h3>
      <p class="text-2xl font-bold text-blue-900" data-value="signup-count">?</p>
      <p class="text-xs text-blue-600">Signed-up, and confirmed</p>
      <p class="text-xs text-blue-400 mt-1" data-delta="confirmed-month">+? new this month</p>
    

<!-- New signups -->    
    <div class="bg-yellow-100 border border-orange-200 rounded-lg p-4 cursor-pointer" data-action="display-temp-signups">
      <!--p class="text-3xl font-bold text-yellow-900" data-value="temp_signup_table"></p-->
      <h3 class="text-sm font-medium text-yellow-700"> See temp signup table </h3>
      <p class="text-xs text-gray-600">Exclusive permission</p>
    </div>
</div>



<!-- permision management section -->
<div class="bg-red-100 border border-gray-200 rounded-lg  p-4 cursor-pointer"" data-section="permission-management-section" data-action="permission-management-section" data-destination='user-management' 
title="Grant & remove permissions. Create bundles.">
  <h3 class="text-sm font-medium text-gray-800">Permission Management</h3>
  <p class="text-xs text-gray-500">
  🔐 Grant permissions<br> 
  🔒 Remove permissions<br>
  📦 Create bundles of permissions</p>
</div>
  </div>
</div>

    <!-- section removed sep 15 2026 -->
    <!--div class="grid md:grid-cols-3 lg:grid-cols-4 gap-6" id="permission-cards"-->
    <!-- Create -->
    <!-- Grant bundle of permissions -->
    <!-- Grant single permission -->
    <!-- Revoke permission or bundle of permissions -->
    <!-- Display -->
    <!-- Search -->
    <!-- Edit -->
    <!-- Delete --> 
    <!--/div-->


<!-- Settings -->
<div class="bg-gray-100 rounded-lg shadow p-6" data-section='settings' data-destination='settings'>
  <h2 class="text-lg font-semibold mb-2">Settings  ⚙️  ⚙️</h2>
  <p class="text-sm text-gray-500 mb-4">System configuration and administrative settings</p>

  <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">


    <div class="bg-blue-100 border border-gray-200 rounded-lg p-4 cursor-pointer" data-action="modules-market-section">
      <h3 class="text-sm font-medium text-gray-800">Upgrades and Developer Market 🏗️</h3>
      <p class="text-xs text-gray-500">Purchase major upgrades or earn by developing upgrades</p>
    </div>

    <div class="bg-green-200 border border-gray-200 rounded-lg p-4 cursor-pointer" data-action="money-management-section">
      <h3 class="text-sm font-medium text-gray-800">Money💷💵💶</h3>
      <p class="text-xs text-gray-500">Setting-up and managing membership fees , subscriptions, donations</p>
    </div>

    <div class="bg-gray-50 border border-gray-200 rounded-lg p-4" data-action="rewards-section">
      <h3 class="text-sm font-medium text-gray-800">Rewards</h3>
      <p class="text-xs text-gray-500">Configure reward systems and achievements</p>
    </div>


    <div class="bg-gray-50 border border-gray-200 rounded-lg p-4" data-action="support-section">
      <h3 class="text-sm font-medium text-gray-800">Support</h3>
      <p class="text-xs text-gray-500">Access support tools and documentation</p>
    </div>

    <div class="bg-gray-50 border border-gray-200 rounded-lg p-4" data-action="messages-section">
      <h3 class="text-sm font-medium text-gray-800">Messages</h3>
      <p class="text-xs text-gray-500">System notifications and announcements</p>
    </div>


  </div>
</div>


  

  </div>
</div>
<!-- Task Management -->
<!-- KNOWLEDGE MANAGEMENT -->
<!-- Relations & hierarchy Management -->
<!-- AUTOMATION MANAGEMENT -->

   ${petitionBreadcrumbs()} 
`}


export function render(panel, petition = {}) {
    console.log('adminDash Render(', panel, petition, ')');
    panel.innerHTML = getTemplateHTML();

}
