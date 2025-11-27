//  ./dash/approfileManagementSection.js
console.log('approfileManagementSection.js loaded 19:15Oct25');
import { petitionBreadcrumbs } from'../ui/breadcrumb.js';

function getTemplateHTML() { console.log('getTemplateHTML()');
  return `
<!-- approfile Management section -->
<div class="bg-green-100 rounded-lg shadow p-6" data-section="approfile-management" >
  <h2 class="text-lg font-semibold mb-2">Approfile Management 21:00 Nov 27</h2>
  <p class="text-sm text-gray-500 mb-4">Click to carryout the action, it opens in a new panel to the right. (Approfiles include members) </p>
<div class="grid md:grid-cols-3 lg:grid-cols-4 gap-6" id="stats-cards">

  <!-- approfiles -->
  
      <!-- Return     data-action of return it the name of the parent section-->
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-action="member-management-section">
    <h3 class="text-sm font-medium text-blue-700 mb-1"> ◀️ Return to previous section</h3>
    
    <p class="text-xs text-blue-600">Click here as a back button to return the section to its previous contents.</p>
  </div>
  
  <!-- Search -->
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-action="approfile-search-dialogue">
    <h3 class="text-sm font-medium text-blue-700 mb-1">Search Approfiles</h3>
    <p class="text-xs text-blue-600">This searches the users. If you want to search all approfiles, try the other section. </p>
  </div>

  <!-- VIEW RELATED APPROFILES -->
    <div class="bg-green-50 border border-blue-200 rounded-lg p-4 cursor-pointer hover:shadow-md" data-action="display-related-approfiles-dialogue">
      <h3 class="text-sm font-medium text-blue-700">Display related appros 👁️🖇️</h3>
      <p class="text-xs text-gray-500">See how a chosen thing IS [some relationship] OF any other things. Display hierarchy & connections. </p>
    </div>

      <!-- Create -->
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-action="create-approfile-dialogue">
    <h3 class="text-sm font-medium text-blue-700 mb-1">Create an Approfile 🪪</h3>
    <p class="text-xs text-blue-600">Normally approfiles for users are created by their signing-up to be an authenticated user.</p>
  </div>
    
    <!-- Edit -->
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-action="edit-approfile-dialogue">
    <h3 class="text-sm font-medium text-blue-700 mb-1">Edit an Approfile  ✍️ 🪪</h3>
    <p class="text-xs text-blue-600">There may be many things to edit. Not yet defined.</p>
  </div>

      <!-- Delete -->
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-action="delete-approfile-dialogue">
    <h3 class="text-sm font-medium text-blue-700 mb-1">Delete an Approfile</h3>
    <p class="text-xs text-blue-600">Deletion marks the record as deleted, but does not erase it from the system</p>
  </div>


      <!-- relate -->
  <div class="bg-red-50 border border-red-200 rounded-lg p-4" data-action="relate-approfiles-dialogue">
    <h3 class="text-sm font-medium text-gray-700 mb-1">Relate an approfile to...🖇️</h3>
    
    <p class="text-xs text-gray-600">Relate an approfile to someone or something.
    (If you want to assign someone to a task use the other method. 
    You can 'relate' a person to a task, but it doesn't put them on the task)
    Relate an abstract concept to a person or a group or category...</p>
  </div>




</div>
</div>
               ${petitionBreadcrumbs()} 
`}


export function render(panel, petition = {}) {
    console.log('approfileManagement Render(', panel, petition, ')');
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
