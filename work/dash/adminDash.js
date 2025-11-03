//  ./work/dash/adminDash.js
console.log('adminDash.js loaded');
//import { showToast } from '../../flexmain.js';
import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';

function getTemplateHTML() { console.log('getTemplateHTML()');
  return `
<section data-page-type="dashboard" data-permission="admin" data-module="adminDash" data-destination='new-panel'>
 
  <!-- dashboard content -->
<div class="min-h-screen bg-gray-200 text-gray-900">
  <!-- Header -->
<!-- DASHBOARD TOGGLE-->   
  <div class="px-6 py-4 border-b bg-blue-200 flex justify-between items-center">
    <div class = "name"  title="Toggle between admin or member dashboard">
      <!--button class="text-sm text-blue-600 hover:underline" data_action='toggleDash'>Member/Admin</button -->
    </div>

<!-- DASHBOARD TITLE + DESCRIPTION-->   
   <div>
      <h1 class="text-2xl font-bold" data-dash-title="admin">Admin Dashboard  -version 21:50 Nov 3</h1>
      <p class="text-sm text-gray-500" data-dash-sub_title="admin">See data, manage members, tasks, relations & knowledge.</p>
      <p class="text-sm text-gray-500" data-dash-sub_title="admin">Click the menu <em>How?</em> button for help</p>
    </div>
    <!-- button class="text-sm text-blue-600 hover:underline" data-action="sign-out">Sign out</button -->
  </div>

  <div class="container mx-auto px-4 py-8 space-y-8">
    
  <!-- Quick Stats -->
  <div class="bg-blue-200 rounded-lg shadow p-6" data-section="quick-stats" data-destination = "quick-stats">
    <h2 class="text-lg font-semibold mb-2">Quick Stats 🧮</h2>
    <p class="text-sm text-gray-500 mb-4">Summaries: Click for details. They open in a new panel to the right. Click card again to close.</p>
  <div class="grid md:grid-cols-3 lg:grid-cols-4 gap-6" id="stats-cards">

    <!-- Approfiles Human -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-action="humans-stats">
      <h3 class="text-sm font-medium text-blue-700 mb-1">Approfiles-Human</h3>
      <p class="text-2xl font-bold text-blue-900" data-value="members-count">?</p>
      <p class="text-xs text-blue-600">Registered users</p>
      <p class="text-xs text-blue-400 mt-1" data-delta="members-month">+? new this month</p>
    </div>

        <!-- Assignments -->
    <div class="bg-red-50 border border-red-200 rounded-lg p-4" data-action="assignments-stats">
      <h3 class="text-sm font-medium text-red-700 mb-1">Assignments</h3>
      <p class="text-2xl font-bold text-red-900" data-value="assignments-count">?</p>
      <p class="text-xs text-red-600">Students, managers & assigned tasks</p>
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

    <!-- Students -->
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

        <!-- Approfiles -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-action="approfiles-stats">
      <h3 class="text-sm font-medium text-blue-700 mb-1">Approfiless total</h3>
      <p class="text-2xl font-bold text-blue-900" data-value="approfiles-count">?</p>
      <p class="text-xs text-blue-600">Humans + tasks + abstracts</p>
      <p class="text-xs text-blue-400 mt-1" data-delta="members-month">+? new this month</p>
    </div>

        <!-- Approfiles -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-action="analytics">
      <h3 class="text-sm font-medium text-blue-700 mb-1">Analytics</h3>
    </div>


  </div>
</div>


  <!-- Quick Acts -->
  <div class="bg-red-100 rounded-lg shadow p-6" data-section="quick-acts" data-destination='quick-acts'>
    <h2 class="text-lg font-semibold mb-2">Quick Acts 🌀</h2>
    <p class="text-sm text-gray-500 mb-4">Fast access to common admin tasks. They open in a new panel to the right. (Click the card again to close)</p>
    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4" >


<!-- CREATE TASK -->    
    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 cursor-pointer hover:shadow-md" data-action="create-task-dialogue">
      <h3 class="text-sm font-medium text-yellow-500">Create Task 🔧</h3>
      <p class="text-xs text-gray-500">Author a new task as a training course, or to track progress, or as a step by step recipe, or as a soft production line.</p>
</div>

<!-- ASSIGN TASK -->    
    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 cursor-pointer hover:shadow-md" data-action='assign-task-dialogue'>
      <h3 class="text-sm font-medium text-yellow-700">Assign Task 👨‍🔧</h3>
      <p class="text-xs text-gray-500">Put a person or a thing on a task. Could be a training course, could be a soft production line</p>
    </div>

<!-- ASSIGN SURVEY -->    
    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 cursor-pointer hover:shadow-md" data-action='assign-survey-dialogue'>
      <h3 class="text-sm font-medium text-yellow-700">Assign Survey 🎆📜 </h3>
      <p class="text-xs text-gray-500">Put a person or a thing on a task. Could be a training course, could be a soft production line</p>
    </div>    

<!-- MOVE STUDENT -->    
    <div class="bg-red-50 border border-green-200 rounded-lg p-4 cursor-pointer hover:shadow-md" data-action='move-student-dialogue'>
      <h3 class="text-sm font-medium text-green-700">Move Student 🧑‍🎓</h3>
      <p class="text-xs text-gray-500">Every task starts with a third step...  You can move the student to the next step, and maybe even complete the task, (or give-up)</p>
    </div>

<!-- CREATE APPROFILE -->    
    <div class="bg-green-50 border border-blue-200 rounded-lg p-4 cursor-pointer hover:shadow-md" data-action="create-approfile-dialogue">
      <h3 class="text-sm font-medium text-yellow-500">Create Appro 🎆🪪</h3>
      <p class="text-xs text-gray-500">Create a new approfile, probably an abstract one to represent a concept or an aim or a person.</p>
</div>    

<!-- RELATE APPROFILES -->
    <div class="bg-green-50 border border-blue-200 rounded-lg p-4 cursor-pointer hover:shadow-md" data-action="relate-approfiles-dialogue">
      <h3 class="text-sm font-medium text-blue-700">Relate one appro to another appro 🎆🖇️ </h3>
      <p class="text-xs text-gray-500">One thing IS [some relationship] OF another thing. Connecting two approfiles, building structure and hierarchy. </p>
    </div>

<!-- VIEW RELATED APPROFILES -->
    <div class="bg-green-50 border border-blue-200 rounded-lg p-4 cursor-pointer hover:shadow-md" data-action="display-related-approfiles-dialogue">
      <h3 class="text-sm font-medium text-blue-700">Display related appros 👁️🖇️</h3>
      <p class="text-xs text-gray-500">See how a chosen thing IS [some relationship] OF any other things. Display hierarchy & connections. </p>
    </div>


<!-- SELECTOR -->
    <div class="bg-green-50 border border-indigo-200 rounded-lg p-4 cursor-pointer hover:shadow-md" data-action='selector-dialogue' data-destination='new-panel'>
      <h3 class="text-sm font-medium text-indigo-700">Select to remember 📝</h3>
      <p class="text-xs text-gray-500">List things & click to remember them. Can use to automatically fill-in forms. (Opens in new panel)</p>
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


<!-- Task Management -->
<div class="bg-green-100 rounded-lg shadow p-6" data-section='task-management' data-destination='task-management'>
  <h2 class="text-lg font-semibold mb-2">Task Management 🔧</h2>
  <p class="text-sm text-gray-500 mb-4">Clicking any card expands that section below. Everything you can do, you probably do it in the expanded section.</p>
  <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">



<!-- ASSIGNMENT -->
    <div class="bg-red-50 border border-red-200 rounded-lg p-4" data-action='assignment-management-section'>
      <p class="text-3xl font-bold text-red-900" data-value="assignments-count">?</p>
      <h3 class="text-sm font-medium text-red-700">Assignment of tasks 👨‍🔧</h3>
      <p class="text-xs text-gray-500">Track and manage task assignments</p>
    </div>

<!-- TASK -->    
    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4" data-action='task-management-section'>
      <p class="text-3xl font-bold text-yellow-900" data-value="tasks-count">?</p>
      <h3 class="text-sm font-medium text-yellow-700">Tasks 🔧</h3>
      <p class="text-xs text-gray-500">Create, edit, and organize tasks</p>
    </div>

<!-- AUTHORS -->    
    <div class="bg-yellow-50 border border-purple-200 rounded-lg p-4" data-action='author-management-section'>
      <p class="text-3xl font-bold text-purple-900" data-value="authors-count-unique">?</p>
      <h3 class="text-sm font-medium text-purple-700">Authors of tasks</h3>
      <p class="text-xs text-purple-500">View and manage task authors</p>
    </div>    

<!-- STUDENT -->
    <div class="bg-red-50 border border-green-200 rounded-lg p-4" data-action='student-management-section'>
      <p class="text-3xl font-bold text-green-900" data-value="students-count-unique">?</p>
      <h3 class="text-sm font-medium text-green-700">Students of tasks</h3>
      <p class="text-xs text-green-500">View and manage students assigned to tasks</p>
    </div>

<!-- MANAGERS -->    
    <div class="bg-red-50 border border-indigo-200 rounded-lg p-4" data-action='manager-management-section'>
      <p class="text-3xl font-bold text-indigo-900" data-value="managers-count-unique">?</p>
      <h3 class="text-sm font-medium text-indigo-700">Managers of tasks</h3>
      <p class="text-xs text-indigo-500">View and manage task managers</p>
    </div>

  </div>
</div>


<!-- Relations & hierarchy Management -->
  <div class="bg-orange-100 rounded-lg shadow p-6" data-section='r&h-management' data-destination='r&h-management'>
    <h2 class="text-lg font-semibold mb-2">Relations & hierarchy Management 🏯</h2>
    <p class="text-sm text-gray-500 mb-4">Clicking any card expands that section below. Everything you can do, you probably do it in the expanded section.</p>
    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">


<!-- Approfiles -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-action='approfile-management-section'>
      <p class="text-3xl font-bold text-blue-900" data-value="approfiles-count">?</p>
      <h3 class="text-sm font-medium text-blue-700">Appros 🪪</h3>
      <p class="text-xs text-gray-500">View, edit, and manage any kind of approfiles: personal, task based or abstract, approfiles</p>
    </div>


<!-- HUMAN APPROFILES-->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-section="member_approfiles">
      <p class="text-3xl font-bold text-purple-900" data-value="member-approfiles-count">?</p>
      <h3 class="text-sm font-medium text-purple-700">Human approfiles</h3>
      <p class="text-xs text-gray-500">View and manage the approfiles for members</p>
    </div>


    <!-- TASK APPROFILES-->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-section="task-approfiles">
      <p class="text-3xl font-bold text-indigo-900" data-value="task-profiles-count">?</p>
      <h3 class="text-sm font-medium text-indigo-700">Task approfiles</h3>
      <p class="text-xs text-gray-500">View and manage the approfiles for tasks</p>
    </div>

<!-- GROUP APPROFILES-->    
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-section="group_approfiles">
      <p class="text-3xl font-bold text-blue-900" data-value="approfiles-count">?</p>
      <h3 class="text-sm font-medium text-blue-700">Group Profiles</h3>
      <p class="text-xs text-gray-500">View, edit, and manage  the approfiles fo groups</p>
    </div>

<!-- ABSTRACT APPROFILES-->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-section="abstract_approfiles">
      <p class="text-3xl font-bold text-pink-900" data-value="abstract-app-profiles-count">?</p>
      <h3 class="text-sm font-medium text-pink-700">Abstract approfiles</h3>
      <p class="text-xs text-gray-500">View and manage abstract approfiles</p>
    </div>

<!-- RELATE APPROFILES-->    
    <div class="bg-red-50 border border-red-200 rounded-lg p-4" data-section="relationships">
      <p class="text-3xl font-bold text-yellow-900" data-value="relationships-count">?</p>
      <h3 class="text-sm font-medium text-yellow-700">Relationships</h3>
      <p class="text-xs text-gray-500">Assign and organize relationships between approfiles</p>
    </div>

<!-- RELATIONSHIPS-->    
    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4" data-section="relations">
      <p class="text-3xl font-bold text-red-900" data-value="relations-count">?</p>
      <h3 class="text-sm font-medium text-red-700">Relations</h3>
      <p class="text-xs text-gray-500">Create and edit the concept of a relationship that can be applied to any two approfiles</p>
    </div>

  </div>
</div>


<!-- KNOWLEDGE MANAGEMENT -->
  <div class="bg-indigo-200 rounded-lg shadow p-6" data-section='knowledge-management' data-destination='knowledge-management'>
    <h2 class="text-lg font-semibold mb-2">Knowledge Management 📚</h2>
    <p class="text-sm text-gray-500 mb-4">Clicking any card expands that section below. Everything you can do, you probably do it in the expanded section.</p>
    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

    <!-- Surveys & Quiz-->         
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-section="knowledge" data-action="survey-management-section">
      <p class="text-3xl font-bold text-blue-900" data-value="surveys-count">?</p>
      <h3 class="text-sm font-medium text-blue-700">Surveys & Quiz 📜</h3>
      <p class="text-xs text-gray-500">View, edit, and manage any survey or quiz including automations</p>
    </div>


<!-- ALL HOWTOS-->         
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-section="knowledge">
      <p class="text-3xl font-bold text-blue-900" data-value="howto-count">?</p>
      <h3 class="text-sm font-medium text-blue-700">All how to knowledge</h3>
      <p class="text-xs text-gray-500">View, edit, and manage any of the training or instructional knowledge</p>
    </div>

<!-- TASK KNOWLEDGE-->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-section="task-apknowledge">
      <p class="text-3xl font-bold text-indigo-900" data-value="task-knowledge-count">?</p>
      <h3 class="text-sm font-medium text-indigo-700">Task knowledge</h3>
      <p class="text-xs text-gray-500">View and manage the knowledge for tasks</p>
    </div>

<!-- MEMBER KNOWLEDGE-->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-section="member_approfiles">
      <p class="text-3xl font-bold text-purple-900" data-value="member-approfiles-count">?</p>
      <h3 class="text-sm font-medium text-purple-700">Member knowledge</h3>
      <p class="text-xs text-gray-500">View and manage the knowledge for members</p>
    </div>

<!-- GROUP KNOWLEDGE-->    
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-section="group_approfiles">
      <p class="text-3xl font-bold text-blue-900" data-value="profiles-count">?</p>
      <h3 class="text-sm font-medium text-blue-700">Group knowledge</h3>
      <p class="text-xs text-gray-500">View, edit, and manage  the knowledge for groups</p>
    </div>

<!-- ABSTRACT KNOWLEDGE-->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-section="abstract_approfiles">
      <p class="text-3xl font-bold text-pink-900" data-value="abstract-approfiles-count">?</p>
      <h3 class="text-sm font-medium text-pink-700">Abstract knowledge</h3>
      <p class="text-xs text-gray-500">View and manage abstract knowledge</p>
    </div>

<!-- RELATE KNOWLEDGE-->    
    <div class="bg-red-50 border border-red-200 rounded-lg p-4" data-section="relationships">
      <p class="text-3xl font-bold text-yellow-900" data-value="relationships-count">?</p>
      <h3 class="text-sm font-medium text-yellow-700">Relationship knowledge</h3>
      <p class="text-xs text-gray-500">Assign and organize knowledge about relationships between approfiles</p>
    </div>

<!-- RELATIONSHIPS KNOWLEDGE-->    
    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4" data-section="relations">
      <p class="text-3xl font-bold text-red-900" data-value="relations-count">?</p>
      <h3 class="text-sm font-medium text-red-700">Relations</h3>
      <p class="text-xs text-gray-500">Create and edit the knowledge on the concept of a relationship that can be applied to any two approfiles</p>
    </div>

  </div>
</div>


<!-- AUTOMATION MANAGEMENT -->
  <div class="bg-yellow-50 rounded-lg shadow p-6" data-section='automation-management' data-destination='automation-management'>
    <h2 class="text-lg font-semibold mb-2">Automation Management 🚂</h2>
    <p class="text-sm text-gray-500 mb-4">Clicking any card expands that section below. Everything you can do, you probably do it in the expanded section.</p>
    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

    <!-- Surveys & Quiz-->         
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-section="automation" data-action="automation-survey">
      <p class="text-3xl font-bold text-blue-900" data-value="surveys-count">?</p>
      <h3 class="text-sm font-medium text-blue-700">Surveys & Quiz automations </h3>
      <p class="text-xs text-gray-500">View, edit, and manage any survey or quiz including automations</p>
    </div>

    <!-- TASK automation-->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-section="automation-task">
      <p class="text-3xl font-bold text-indigo-900" data-value="task-automation-count">?</p>
      <h3 class="text-sm font-medium text-indigo-700">Task automations</h3>
      <p class="text-xs text-gray-500">View and manage the automation for tasks</p>
    </div>

    <!-- HOWTOS-->         
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-section="automation-knowledge">
      <p class="text-3xl font-bold text-blue-900" data-value="howto-count">?</p>
      <h3 class="text-sm font-medium text-blue-700">How to automation</h3>
      <p class="text-xs text-gray-500">View, edit, and manage any of the training or instructional automation</p>
    </div>



<!-- MEMBER automation-->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-section="automation-member">
      <p class="text-3xl font-bold text-purple-900" data-value="member-approfiles-count">?</p>
      <h3 class="text-sm font-medium text-purple-700">Member automation</h3>
      <p class="text-xs text-gray-500">View and manage the automation for members</p>
    </div>

<!-- GROUP automation-->    
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-section="automation-group">
      <p class="text-3xl font-bold text-blue-900" data-value="profiles-count">?</p>
      <h3 class="text-sm font-medium text-blue-700">Group automation</h3>
      <p class="text-xs text-gray-500">View, edit, and manage  the automation for groups</p>
    </div>

<!-- ABSTRACT automation-->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-section="automation-abstract">
      <p class="text-3xl font-bold text-pink-900" data-value="abstract-approfiles-count">?</p>
      <h3 class="text-sm font-medium text-pink-700">Abstract automation</h3>
      <p class="text-xs text-gray-500">View and manage abstract automation</p>
    </div>

<!-- RELATE automation-->    
    <div class="bg-red-50 border border-red-200 rounded-lg p-4" data-section="automation-relations">
      <p class="text-3xl font-bold text-yellow-900" data-value="relationships-count">?</p>
      <h3 class="text-sm font-medium text-yellow-700">Relationship automation</h3>
      <p class="text-xs text-gray-500">Assign and organize automation about relationships between approfiles</p>
    </div>

<!-- RELATIONSHIPS automation-->    
    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4" data-section="automation-relationships">
      <p class="text-3xl font-bold text-red-900" data-value="relations-count">?</p>
      <h3 class="text-sm font-medium text-red-700">Relations</h3>
      <p class="text-xs text-gray-500">Create and edit the automation on the concept of a relationship that can be applied to any two approfiles</p>
    </div>

  </div>
</div>


<!-- Settings -->
<div class="bg-gray-100 rounded-lg shadow p-6" data-section='settings' data-destination='settings'>
  <h2 class="text-lg font-semibold mb-2">Settings  ⚙️  ⚙️</h2>
  <p class="text-sm text-gray-500 mb-4">System configuration and administrative settings</p>
  <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

    <div class="bg-gray-50 border border-gray-200 rounded-lg p-4" onclick="showToast('User Roles not yet implemented')">
      <h3 class="text-sm font-medium text-gray-800">User Roles</h3>
      <p class="text-xs text-gray-500">Manage user permissions and role assignments</p>
    </div>

    <div class="bg-gray-50 border border-gray-200 rounded-lg p-4" onclick="showToast('Rewards not yet implemented')">
      <h3 class="text-sm font-medium text-gray-800">Rewards</h3>
      <p class="text-xs text-gray-500">Configure reward systems and achievements</p>
    </div>

    <div class="bg-gray-50 border border-gray-200 rounded-lg p-4" data-action="money-management-section">
      <h3 class="text-sm font-medium text-gray-800">Money💷💵💶</h3>
      <p class="text-xs text-gray-500">Setting-up and managing membership fees , subscriptions, donations</p>
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

<!-- deleted old hidden forms.  15:52 Sept 9 2025 -->

   
</section>
   ${petitionBreadcrumbs()} 
`}

export function render(panel, petition = {}) {
    console.log('adminDash Render(', panel, petition, ')');
    panel.innerHTML = getTemplateHTML();

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