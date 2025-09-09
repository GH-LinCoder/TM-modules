//  ./mutate/memberManagementSection.js
console.log('memberManagementSection.js loaded');


function getTemplateHTML() { console.log('getTemplateHTML()');
  return `
<!-- Member Management section -->
<div class="bg-green-100 rounded-lg shadow p-6" data-section="member-management">
  <h2 class="text-lg font-semibold mb-2">Member Management</h2>
  <p class="text-sm text-gray-500 mb-4">Click to carryout the action, it opens in a new panel to the right </p>
<div class="grid md:grid-cols-3 lg:grid-cols-4 gap-6" id="stats-cards">

  <!-- Members -->
  
      <!-- Return -->
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-action="task&member-management-section">
    <h3 class="text-sm font-medium text-blue-700 mb-1">Return to previous section</h3>
    
    <p class="text-xs text-blue-600">Click here as a back button to return the section to its previous contents.</p>
  </div>
  
  <!-- Search -->
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-action="member-search">
    <h3 class="text-sm font-medium text-blue-700 mb-1">Search Members</h3>
    <p class="text-xs text-blue-600">This searches the users. If you want to search all approfiles, try the other section. </p>
  </div>

      <!-- Create -->
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-action="create-member">
    <h3 class="text-sm font-medium text-blue-700 mb-1">Create a Member</h3>
    <p class="text-xs text-blue-600">Normally members are created by their signing-up to be an authenticated user.</p>
  </div>
    
    <!-- Edit -->
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-action="edit-member">
    <h3 class="text-sm font-medium text-blue-700 mb-1">Edit a Member</h3>
    <p class="text-xs text-blue-600">There may be many things to edit. Not yet defined.</p>
  </div>

      <!-- Delete -->
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-action="delete-member">
    <h3 class="text-sm font-medium text-blue-700 mb-1">Delete a Member</h3>
    <p class="text-xs text-blue-600">Deletion marks the record as deleted, but does not erase it from the system</p>
  </div>

      <!-- Assign -->
  <div class="bg-red-50 border border-red-200 rounded-lg p-4" data-action="assign-member">
    <h3 class="text-sm font-medium text-red-700 mb-1">Assign to a task</h3>
    <p class="text-xs text-red-600">This places the member on the task. (If you are trying to assign a non-member try the approfiles section.)</p>
  </div>

      <!-- relate -->
  <div class="bg-red-50 border border-red-200 rounded-lg p-4" data-action="relate-member">
    <h3 class="text-sm font-medium text-red-700 mb-1">Relate a Member to...</h3>
    
    <p class="text-xs text-red-600">Relate a member to someone or something.
    (If you want to assign someone to a task use the other method. 
    You can 'relate' a person to a task, but it doesn't put them on the task)</p>
  </div>




</div>
</div>`}


export function render(panel, petition = {}) {
    console.log('MemberManagement Render(', panel, petition, ')');
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
