//  ./work/dash/memberDash.js
console.log('memberDash.js loaded');
import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';

function getTemplateHTML() { console.log('getTemplateHTML()');
  return `
<!-- DASHBOARD TOGGLE & TITLE -->
<div class="px-6 py-4 border-b bg-green-200 flex justify-between items-center">
  <div class="name" title="Toggle between admin & member dashboard">
    <!--div class="text-sm text-blue-600 hover:underline" data-action="toggle-dash">Member/Admin</div-->
  </div>

  <div>
    <h1 class="text-2xl font-bold" data-dash-title="admin">Member Dashboard</h1>
    <p class="text-sm text-gray-500" data-dash-sub_title="member">Check your tasks, update your details, manage your students...</p>
  </div>
  <!--button class="text-sm text-blue-600 hover:underline" onclick="signOut()">Sign out</button-->
</div>

<!-- MAIN DASHBOARD CONTENT -->
<div class="container mx-auto px-4 py-8 flex flex-col gap-8">

  <!-- PROFILE CARD  -->
  <div class="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row items-center md:items-start gap-8" data-component="profile-card">
    
    <!-- Left side: Avatar and Name -->
    <div class="flex-shrink-0 text-center">
      <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-semibold" data-user="avatar">
      <h6 class="text-xl font-semibold" data-user="name">johnPetts</h6>
      </div>
      
      </div>

    <!-- Right side: User Details and Edit Button -->
    <div class="flex-1 space-y-4">
      <div class="space-y-3 text-sm text-gray-600">
        <div class="flex items-center gap-2">
          <span data-user="email">johnPetts@example.com</span>
          <span data-user="mid"><b>ID:</b> 3eFHb889</span>       
          <span data-user="join-date"><b>Joined:</b> 24 August 2025</span>
          <span data-user="last-login"><b>Last login:</b> 2:30 PM 24 August 2025</span>
        </div>
      
      <!--div class="pt-4 border-t"-->
        <button 
          class="w-full border border-gray-300 rounded-lg py-2 text-sm font-medium hover:bg-gray-50"
          data-action="edit-profile"
        >
          Edit <span class="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm" data-user="role">Member</span> Profile
        </button>
      </div>
    </div>
  </div>

  <!-- STATS OVERVIEW -->
  <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4" data-section="stats">
    <div class="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center" data-stat="active-tasks">
      <div class="p-2 bg-blue-100 rounded-lg mr-3">
        <div class="w-6 h-6"></div>
      </div>
      <div>
        <p class="text-sm text-gray-500">Active Tasks</p>
        <p class="text-2xl font-bold" data-value="active-tasks">2</p>
        <p class="text-xs text-gray-500">Currently in progress</p>
        <div class="mt-2 text-xs text-green-600" data-trend="active-tasks">
          <span>+25%</span> from last month
        </div>
      </div>
    </div>
    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center" data-stat="completed-tasks">
      <div class="p-2 bg-green-100 rounded-lg mr-3">
        <div class="w-6 h-6"></div>
      </div>
      <div>
        <p class="text-sm text-gray-500">Completed Tasks</p>
        <p class="text-2xl font-bold" data-value="completed-tasks">5</p>
        <p class="text-xs text-gray-500">Successfully finished</p>
        <div class="mt-2 text-xs text-green-600" data-trend="completed-tasks">
          <span>+12%</span> from last month
        </div>
      </div>
    </div>
    <div class="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center" data-stat="abandoned-tasks">
      <div class="p-2 bg-red-100 rounded-lg mr-3">
        <div class="w-6 h-6"></div>
      </div>
      <div>
        <p class="text-sm text-gray-500">Abandoned Tasks</p>
        <p class="text-2xl font-bold" data-value="abandoned-tasks">3</p>
        <p class="text-xs text-gray-500">Previously stopped</p>
        <div class="mt-2 text-xs text-red-600" data-trend="abandoned-tasks">
          <span>-5%</span> from last month
        </div>
      </div>
    </div>
    <div class="bg-white rounded-lg shadow p-4 flex items-center" data-stat="available-tasks">
      <div class="p-2 bg-indigo-100 rounded-lg mr-3">
        <div class="w-6 h-6"></div>
      </div>
      <div>
        <p class="text-sm text-gray-500">Available Tasks</p>
        <p class="text-2xl font-bold" data-value="available-tasks">8</p>
        <p class="text-xs text-gray-500">Ready to join</p>
      </div>
    </div>
  </div>

  <!-- MY TASKS -->
  <div data-section="my-tasks">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold">My Tasks</h2>
      <button 
        class="border border-gray-300 rounded-lg px-3 py-1 text-sm flex items-center gap-2 hover:bg-gray-50"
        data-action="browse-tasks"
      >
        Browse All Tasks
      </button>
    </div>
    <div class="space-y-6" data-list="my-tasks">
      <div class="bg-white rounded-lg shadow p-6" data-task-id="1">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h3 class="text-lg font-semibold" data-task="name">Frontend Development Course</h3>
            <p class="text-gray-600 text-sm" data-task="description">Complete React and TypeScript fundamentals</p>
            <div class="mt-2 text-sm">
              <span class="text-gray-500">Manager: </span>
              <span data-task="manager">Sarah Wilson</span>
              <span class="mx-2">•</span>
              <span class="text-gray-500">Author: </span>
              <span data-task="author">Mike Johnson</span>
              <span class="mx-2">•</span>
              <span class="text-gray-500">Assigned: </span>
              <span data-task="assigned-date">Feb 1, 2024</span>
            </div>
          </div>
          <div class="flex gap-2">
            <button class="text-blue-600 hover:underline text-sm" data-action="view-details">View Details</button>
            <button class="text-blue-600 hover:underline text-sm" data-action="message-manager">Message</button>
          </div>
        </div>
        <div class="ml-6 border-l-4 border-l-blue-500 bg-gray-50 p-4 mt-4 rounded-r-lg" data-component="current-stage">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-medium" data-stage="name">Stage 3: Component Architecture</h4>
              <p class="text-sm text-gray-600" data-stage="description">Learn about component composition and state management patterns</p>
            </div>
            <div class="flex items-center gap-2">
              <button class="border rounded p-1 hover:bg-gray-200" data-action="prev-stage">←</button>
              <span class="text-sm text-gray-500" data-stage="progress">3 of 8</span>
              <button class="border rounded p-1 hover:bg-gray-200" data-action="next-stage">→</button>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow p-6" data-task-id="2">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h3 class="text-lg font-semibold" data-task="name">Database Design Basics</h3>
            <p class="text-gray-600 text-sm" data-task="description">Learn SQL and database normalization</p>
            <div class="mt-2 text-sm">
              <span class="text-gray-500">Manager: </span>
              <span data-task="manager">David Chen</span>
              <span class="mx-2">•</span>
              <span class="text-gray-500">Author: </span>
              <span data-task="author">Lisa Park</span>
              <span class="mx-2">•</span>
              <span class="text-gray-500">Assigned: </span>
              <span data-task="assigned-date">Feb 10, 2024</span>
            </div>
          </div>
          <div class="flex gap-2">
            <button class="text-blue-600 hover:underline text-sm" data-action="view-details">View Details</button>
            <button class="text-blue-600 hover:underline text-sm" data-action="message-manager">Message</button>
          </div>
        </div>
        <div class="ml-6 border-l-4 border-l-blue-500 bg-gray-50 p-4 mt-4 rounded-r-lg" data-component="current-stage">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-medium" data-stage="name">Stage 1: Introduction to Databases</h4>
              <p class="text-sm text-gray-600" data-stage="description">Understanding relational database concepts and ER diagrams</p>
            </div>
            <div class="flex items-center gap-2">
              <button class="border rounded p-1 hover:bg-gray-200" data-action="prev-stage">←</button>
              <span class="text-sm text-gray-500" data-stage="progress">1 of 5</span>
              <button class="border rounded p-1 hover:bg-gray-200" data-action="next-stage">→</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- MY STUDENTS -->
  <div data-section="my-students">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold">My Students</h2>
      <button 
        class="border border-gray-300 rounded-lg px-3 py-1 text-sm flex items-center gap-2 hover:bg-gray-50"
        data-action="view-all-students"
      >
        View All
      </button>
    </div>
    <div class="bg-white rounded-lg shadow p-12 text-center" data-placeholder="no-students">
      <h3 class="text-lg font-semibold mb-2">No Students Assigned</h3>
      <p class="text-gray-500 mb-4">You haven't been assigned as a manager for any tasks yet.</p>
    </div>
  </div>

  <!-- QUICK ACTIONS -->
  <div class="bg-white rounded-lg shadow p-6" data-section="quick-actions">
    <h3 class="text-lg font-semibold mb-2">Quick Actions</h3>
    <p class="text-gray-500 text-sm mb-4">Common tasks and shortcuts</p>
    <div class="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
      <button class="flex flex-col items-center gap-2 p-4 border rounded hover:bg-gray-50" data-action="invite-friend">
        <span class="text-sm">Invite a Friend</span>
      </button>
      <button class="flex flex-col items-center gap-2 p-4 border rounded hover:bg-gray-50" data-action="copy-recruit-link">
        <span class="text-sm">Copy Recruit Link</span>
      </button>
      <button class="flex flex-col items-center gap-2 p-4 border rounded hover:bg-gray-50" data-action="check-rewards">
        <span class="text-sm">Check Rewards</span>
      </button>
      <button class="flex flex-col items-center gap-2 p-4 border rounded hover:bg-gray-50" data-action="update-profile">
        <span class="text-sm">Update Profile</span>
      </button>
      <button class="flex flex-col items-center gap-2 p-4 border rounded hover:bg-gray-50" data-action="contact-support">
        <span class="text-sm">Contact Support</span>
      </button>
    </div>
  </div>
</div>

`}

export function render(panel, petition = {}) {
    console.log('memberDash Render(', panel, petition, ')');
    panel.innerHTML = getTemplateHTML();

     //? query.petitioner : 'unknown';
    console.log('Petition:', petition);
   // panel.innerHTML+= `<p class="text-xs text-gray-400 mt-4">Context: ${petition.Module} - ${petition.Section} - ${petition.Action}- ${petition.Destination}</p>`;}
   panel.innerHTML+=petitionBreadcrumbs();//this reads 'petition' and prints the values at bottom of the render panel
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