//  ./mutate/quickStatsSection.js
console.log('quickstats.js loaded');
import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';

function getTemplateHTML() { console.log('getTemplateHTML()');
  return `
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
</div>`}


export function render(panel, petition = {}) {
    console.log('QuickStats Render(', panel, petition, ')');
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
