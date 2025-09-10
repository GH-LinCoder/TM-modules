//  ./mutate/task&memberManagementSection.js
console.log('task&memberManagementSection.js loaded');
import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';

function getTemplateHTML() { console.log('getTemplateHTML()');
  return `
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
</div>`}


export function render(panel, petition = {}) {
    console.log('task&memberManagement Render(', panel, petition, ')');
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





