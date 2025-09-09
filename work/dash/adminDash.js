//  ./work/stask/tasks.js
console.log('adminDash.js loaded');


function getTemplateHTML() { console.log('getTemplateHTML()');
  return `
<section data-page-type="dashboard" data-permission="admin" data-module="adminDash">
 
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
      <h1 class="text-2xl font-bold" data-dash-title="admin">Admin Dashboard</h1>
      <p class="text-sm text-gray-500" data-dash-sub_title="admin">Manage members, tasks, and monitor system performance</p>
    </div>
    <!-- button class="text-sm text-blue-600 hover:underline" data-action="sign-out">Sign out</button -->
  </div>

  <div class="container mx-auto px-4 py-8 space-y-8">
    
  <!-- Quick Stats -->
  <div class="bg-blue-200 rounded-lg shadow p-6" data-section="quick-stats">
    <h2 class="text-lg font-semibold mb-2">Quick Stats</h2>
    <p class="text-sm text-gray-500 mb-4">Summaries: Click for details</p>
  <div class="grid md:grid-cols-3 lg:grid-cols-4 gap-6" id="stats-cards">

    <!-- Members -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-action="members-stats">
      <h3 class="text-sm font-medium text-blue-700 mb-1">Members</h3>
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

  </div>
</div>


  <!-- Quick Actions -->
  <div class="bg-red-100 rounded-lg shadow p-6" data-section="quick-acts">
    <h2 class="text-lg font-semibold mb-2">Quick Acts</h2>
    <p class="text-sm text-gray-500 mb-4">Fast access to common admin tasks</p>
    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4" >


<!-- CREATE TASK -->    
    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 cursor-pointer hover:shadow-md" data-action="create-task-dialogue">
      <h3 class="text-sm font-medium text-yellow-500">Create Task</h3>
      <p class="text-xs text-gray-500">Author a new task</p>
</div>

<!-- ASSIGN TASK -->    
    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 cursor-pointer hover:shadow-md" data-action='assign-task-dialogue'>
      <h3 class="text-sm font-medium text-yellow-700">Assign Task</h3>
      <p class="text-xs text-gray-500">Link members to tasks</p>
    </div>

<!-- MOVE STUDENT -->    
    <div class="bg-red-50 border border-green-200 rounded-lg p-4 cursor-pointer hover:shadow-md" data-action='move-student-dialogue'>
      <h3 class="text-sm font-medium text-green-700">Move Student</h3>
      <p class="text-xs text-gray-500">Step by step</p>
    </div>

<!-- RELATE APPROFILES -->
    <div class="bg-green-50 border border-blue-200 rounded-lg p-4 cursor-pointer hover:shadow-md" data-action='relate-approfiles-dialogue'>
      <h3 class="text-sm font-medium text-blue-700">Relate Approfiles</h3>
      <p class="text-xs text-gray-500">Show how two approfiles are related to each other </p>
    </div>

  </div>
</div>


<!-- Recent Activity -->
<div class="bg-white rounded-lg shadow p-6">
  <h2 class="text-lg font-semibold mb-2">Recent Activity</h2>
  <p class="text-sm text-gray-500 mb-4">Latest system events and user actions</p>
  <div class="space-y-4" id="activity-list">

    <div class="activity-item" data-activity="new-member">
      <p class="text-sm"><strong>New member registered</strong></p>
      <p class="text-xs text-gray-600">M125 – Sarah Johnson</p>
      <p class="text-xs text-gray-400">2 minutes ago</p>
    </div>

    <div class="activity-item" data-activity="task-completed">
      <p class="text-sm"><strong>Task completed</strong></p>
      <p class="text-xs text-gray-600">M089 – React Fundamentals</p>
      <p class="text-xs text-gray-400">15 minutes ago</p>
    </div>

    <div class="activity-item" data-activity="task-created">
      <p class="text-sm"><strong>New task created</strong></p>
      <p class="text-xs text-gray-600">Database Design Course</p>
      <p class="text-xs text-gray-400">1 hour ago</p>
    </div>

    <div class="activity-item" data-activity="member-assigned">
      <p class="text-sm"><strong>Member assigned to task</strong></p>
      <p class="text-xs text-gray-600">M045 – Frontend Bootcamp</p>
      <p class="text-xs text-gray-400">2 hours ago</p>
    </div>

  </div>
</div>


<!-- Task & Member Management -->
<div class="bg-green-100 rounded-lg shadow p-6" data-section='t&m-management'>
  <h2 class="text-lg font-semibold mb-2">Task & Member Management</h2>
  <p class="text-sm text-gray-500 mb-4">Everything you can do, you probably do it here</p>
  <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

<!-- MEMBER -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-action='member-management-section'>
      <p class="text-3xl font-bold text-blue-900" data-value="members-count">?</p>
      <h3 class="text-sm font-medium text-blue-700">Members</h3>
      <p class="text-xs text-gray-500">View, edit, and manage members</p>
    </div>

<!-- ASSIGNMENT -->
    <div class="bg-red-50 border border-red-200 rounded-lg p-4" data-action='assignment-management-section'>
      <p class="text-3xl font-bold text-red-900" data-value="assignments-count">?</p>
      <h3 class="text-sm font-medium text-red-700">Assignments</h3>
      <p class="text-xs text-gray-500">Track and manage task assignments</p>
    </div>

<!-- TASK -->    
    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4" data-action='task-management-section'>
      <p class="text-3xl font-bold text-yellow-900" data-value="tasks-count">?</p>
      <h3 class="text-sm font-medium text-yellow-700">Tasks</h3>
      <p class="text-xs text-gray-500">Create, edit, and organize tasks</p>
    </div>

<!-- AUTHORS -->    
    <div class="bg-yellow-50 border border-purple-200 rounded-lg p-4" data-action='author-management-section'>
      <p class="text-3xl font-bold text-purple-900" data-value="authors-count-unique">?</p>
      <h3 class="text-sm font-medium text-purple-700">Authors</h3>
      <p class="text-xs text-purple-500">View and manage task authors</p>
    </div>    

<!-- STUDENT -->
    <div class="bg-red-50 border border-green-200 rounded-lg p-4" data-action='student-management-section'>
      <p class="text-3xl font-bold text-green-900" data-value="students-count">?</p>
      <h3 class="text-sm font-medium text-green-700">Students</h3>
      <p class="text-xs text-green-500">View and manage students assigned to tasks</p>
    </div>

<!-- MANAGERS -->    
    <div class="bg-red-50 border border-indigo-200 rounded-lg p-4" data-action='manager-management-section'>
      <p class="text-3xl font-bold text-indigo-900" data-value="managers-count">?</p>
      <h3 class="text-sm font-medium text-indigo-700">Managers</h3>
      <p class="text-xs text-indigo-500">View and manage task managers</p>
    </div>

  </div>
</div>


<!-- Relationship & hierarchy Management -->
  <div class="bg-orange-100 rounded-lg shadow p-6">
    <h2 class="text-lg font-semibold mb-2">Relationship & hierarchy Management</h2>
    <p class="text-sm text-gray-500 mb-4">Everything you can do, you probably do it here</p>
    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

<!-- ALL APPPROFILES-->         
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-section="approfiles">
      <p class="text-3xl font-bold text-blue-900" data-value="approfiles-count">?</p>
      <h3 class="text-sm font-medium text-blue-700">All Approfiles</h3>
      <p class="text-xs text-gray-500">View, edit, and manage any kind of approfiles</p>
    </div>

<!-- TASK APPROFILES-->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-section="task-approfiles">
      <p class="text-3xl font-bold text-indigo-900" data-value="task-profiles-count">?</p>
      <h3 class="text-sm font-medium text-indigo-700">Task approfiles</h3>
      <p class="text-xs text-gray-500">View and manage the approfiles for tasks</p>
    </div>

<!-- MEMBER APPROFILES-->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-section="member_approfiles">
      <p class="text-3xl font-bold text-purple-900" data-value="member-approfiles-count">?</p>
      <h3 class="text-sm font-medium text-purple-700">Member approfiles</h3>
      <p class="text-xs text-gray-500">View and manage the approfiles for members</p>
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
  <div class="bg-indigo-200 rounded-lg shadow p-6">
    <h2 class="text-lg font-semibold mb-2">Knowledge Management</h2>
    <p class="text-sm text-gray-500 mb-4">Everything you can do, you probably do it here</p>
    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

<!-- ALL HOWTOS-->         
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-section="profiles">
      <p class="text-3xl font-bold text-blue-900" data-value="howto-count">63</p>
      <h3 class="text-sm font-medium text-blue-700">All how to knowledge</h3>
      <p class="text-xs text-gray-500">View, edit, and manage any of the training or instructional knowledge</p>
    </div>

<!-- TASK KNOWLEDGE-->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-section="task-approfiles">
      <p class="text-3xl font-bold text-indigo-900" data-value="task-approfiles-count">8</p>
      <h3 class="text-sm font-medium text-indigo-700">Task knowledge</h3>
      <p class="text-xs text-gray-500">View and manage the knowledge for tasks</p>
    </div>

<!-- MEMBER KNOWLEDGE-->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-section="member_approfiles">
      <p class="text-3xl font-bold text-purple-900" data-value="member-approfiles-count">23</p>
      <h3 class="text-sm font-medium text-purple-700">Member knowledge</h3>
      <p class="text-xs text-gray-500">View and manage the knowledge for members</p>
    </div>

<!-- GROUP KNOWLEDGE-->    
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-section="group_approfiles">
      <p class="text-3xl font-bold text-blue-900" data-value="profiles-count">3</p>
      <h3 class="text-sm font-medium text-blue-700">Group knowledge</h3>
      <p class="text-xs text-gray-500">View, edit, and manage  the knowledge for groups</p>
    </div>

<!-- ABSTRACT KNOWLEDGE-->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-section="abstract_approfiles">
      <p class="text-3xl font-bold text-pink-900" data-value="abstract-approfiles-count">3</p>
      <h3 class="text-sm font-medium text-pink-700">Abstract knowledge</h3>
      <p class="text-xs text-gray-500">View and manage abstract knowledge</p>
    </div>

<!-- RELATE KNOWLEDGE-->    
    <div class="bg-red-50 border border-red-200 rounded-lg p-4" data-section="relationships">
      <p class="text-3xl font-bold text-yellow-900" data-value="relationships-count">8</p>
      <h3 class="text-sm font-medium text-yellow-700">Relationship knowledge</h3>
      <p class="text-xs text-gray-500">Assign and organize knowledge about relationships between approfiles</p>
    </div>

<!-- RELATIONSHIPS KNOWLEDGE-->    
    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4" data-section="relations">
      <p class="text-3xl font-bold text-red-900" data-value="relations-count">40</p>
      <h3 class="text-sm font-medium text-red-700">Relations</h3>
      <p class="text-xs text-gray-500">Create and edit the knowledge on the concept of a relationship that can be applied to any two approfiles</p>
    </div>

  </div>
</div>



<!-- Settings -->
<div class="bg-gray-100 rounded-lg shadow p-6">
  <h2 class="text-lg font-semibold mb-2">Settings</h2>
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

`}

export function render(panel, petition = {}) {
    console.log('adminDash Render(', panel, petition, ')');
    panel.innerHTML = getTemplateHTML();

     //? query.petitioner : 'unknown';
    console.log('Petition:', petition);
    panel.innerHTML+= `<p class="text-xs text-gray-400 mt-4">Context: ${petition.Module} - ${petition.Section} - ${petition.Action}</p>`;
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