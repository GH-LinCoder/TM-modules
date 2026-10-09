//  ./dash/recruitmentManagementSection.js
console.log('recruitmentManagementSection.js loaded');
import { petitionBreadcrumbs } from'../ui/breadcrumb.js';

function getTemplateHTML() { console.log('getTemplateHTML()');
  return `
<!-- recruitment Management section -->
<div class="bg-green-100 rounded-lg shadow p-6" data-section="recruitment-management" data-destination="new-panel">
  <h2 class="text-lg font-semibold mb-2">How to invite others to join</h2>
  <p class="text-sm text-gray-500 mb-4">Click to carryout the action, it opens in a new panel to the right </p>
<div class="grid md:grid-cols-3 lg:grid-cols-4 gap-6" id="stats-cards">

      <!-- Create -->
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <h3 class="text-sm font-medium text-blue-700 mb-1">Create a referral URL (web address)</h3>
    <p class="text-xs text-blue-600">It is your choice where you use the referral url. </p>
  </div>
       
      <!-- Delete -->
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <h3 class="text-sm font-medium text-blue-700 mb-1">Delete a referral url</h3>
    <p class="text-xs text-blue-600">This is for deleting specail referral urls that you no longer wish to use. (Not yet implemented)</p>
  </div>


</div>
</div>
               ${petitionBreadcrumbs()} 
`}


export function render(panel, petition = {}) {
    console.log('taskManagement Render(', panel, petition, ')');
    panel.innerHTML = getTemplateHTML();

     //? query.petitioner : 'unknown';
    console.log('Petition:', petition);
    // panel.innerHTML+= `<p class="text-xs text-gray-400 mt-4">Context: ${petition.Module} - ${petition.Section} - ${petition.Action}- ${petition.Destination}</p>`;}
   // panel.innerHTML+=petitionBreadcrumbs();//this reads 'petition' and prints the values at bottom of the render panel
  }
//petitioner

// is passed when the buildPetitionListener() function calls appState.setQuery({callerContext: action});
//it has to be called prior to passing it in the query{} object when we call this module
//in buildPetitionListener.js, when we call appState.setQuery(), we need to have added petitioner: petition
//then we can access it here in the render() function
//we can also add a default value of 'unknown' if it is not passed
//so we can see where we are when we open the a new page

//the call here isn't from buildPetitionListener it is from the menu button in the dashboard
//so we need to also assign petitioner: {Module:'dashboard', Section:'menu', Action:'howTo'} when we call this module from the menu button
//we can do this in the dashboardListeners.js file
//we can also add a default value of 'unknown' if it is not passed
