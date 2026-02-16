//  ./mutate/userManagementSection.js
console.log('userManagementSection.js loaded');

import { petitionBreadcrumbs } from'../ui/breadcrumb.js';

function getTemplateHTML() { console.log('getTemplateHTML()');
  return `
<!-- user Management section -->
<div class="bg-green-100 rounded-lg shadow p-6" data-section="user-management">
  <h2 class="text-lg font-semibold mb-2">temp signup user Management</h2>
  <p class="text-sm text-gray-500 mb-4">Click to carryout the action, it opens in a new panel to the right </p>
<div class="grid md:grid-cols-3 lg:grid-cols-4 gap-6" id="stats-cards">

  <!-- users -->
  
      <!-- Return -->
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-action="user-signup-section">
    <h3 class="text-sm font-medium text-blue-700 mb-1">◀️ Return to previous section</h3>
    
    <p class="text-xs text-blue-600">Click here as a back button to return the section to its previous contents.</p>
  </div>
  
  <!-- Search -->
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-action="user-search">
    <h3 class="text-sm font-medium text-blue-700 mb-1">Search users</h3>
    <p class="text-xs text-blue-600">This searches the users. If you want to search all approfiles, try the other section. </p>
  </div>

      <!-- Create -->
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-action="create-user">
    <h3 class="text-sm font-medium text-blue-700 mb-1">Create a user</h3>
    <p class="text-xs text-blue-600">users supervise tasks and determine the advancement of the student. Admin can appoint someone as a user of a task or of a step in a task.</p>
  </div>
    
    <!-- Edit -->
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-action="edit-user">
    <h3 class="text-sm font-medium text-blue-700 mb-1">Edit a user</h3>
    <p class="text-xs text-blue-600">Editing a user mean removing the user from a task or step.</p>
  </div>

      <!-- Delete -->
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-action="delete-user">
    <h3 class="text-sm font-medium text-blue-700 mb-1">Delete a user</h3>
    <p class="text-xs text-blue-600">Deletion of a user is only done by either marking the task completed or abandonded, the record remains in the system</p>
  </div>

      <!-- See signups -->
  <div class="bg-red-50 border border-red-200 rounded-lg p-4" data-action="display-temp-signups">
    <h3 class="text-sm font-medium text-red-700 mb-1">Display temp signups</h3>
    <p class="text-xs text-red-600">The new user's details are stored in the temp signup table. This shows if they have logged in, whether an appro has been created, 
    whether they have been granted myDash permissions and notes permissions and whether the appro is assigned to the 'welcome' task </p>
  <div id="temp-signups-display">Waiting for database table 'temp_signups' </div>
    </div>

      <!-- relate -->
  <div class="bg-red-50 border border-red-200 rounded-lg p-4" data-action="relate-user">
    <h3 class="text-sm font-medium text-red-700 mb-1">Relate a user to...</h3>
    
    <p class="text-xs text-red-600">users can be related. Each user has an approfile.
    The process of relating is between approfiles. A user can be related to other users or tasks or anything that has an approfile, directly or via a 3rd abstract approfile. </p>
  </div>


</div>
</div>
               ${petitionBreadcrumbs()} 
`}


export function render(panel, petition = {}) {
    console.log('userManagement Render(', panel, petition, ')');
    panel.innerHTML = getTemplateHTML();

     //? query.petitioner : 'unknown';
    console.log('Petition:', petition);

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
