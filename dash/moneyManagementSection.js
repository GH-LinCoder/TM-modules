//  ./dash/moneyManagementSection.js
console.log('moneyManagementSection.js loaded');
import { petitionBreadcrumbs } from'../ui/breadcrumb.js';

function getTemplateHTML() { console.log('getTemplateHTML()');
  return `
<!-- money Management section -->
<div class="bg-green-100 rounded-lg shadow p-6" data-section="money-management" data-destination="new-panel">
  <h2 class="text-lg font-semibold mb-2">Members, subscriptions & donation Management</h2>
  <p class="text-sm text-gray-500 mb-4">Click to carryout the action, it opens in a new panel to the right </p>
<div class="grid md:grid-cols-3 lg:grid-cols-4 gap-6" id="stats-cards">

  <!-- money -->
  
      <!-- Return -->
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-action="money-management-section">
    <h3 class="text-sm font-medium text-blue-700 mb-1">◀️ Return to previous section</h3>
    
    <p class="text-xs text-blue-600">Click here as a back button to return the section to its previous contents.</p>
  </div>
  
  <!-- Search -->
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-action="payment-supplier-search">
    <h3 class="text-sm font-medium text-blue-700 mb-1">Search suppliers</h3>
    <p class="text-xs text-blue-600">This searches the available payment platforms.</p>
  </div>

      <!-- Create -->
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-action="create-payment-system">
    <h3 class="text-sm font-medium text-blue-700 mb-1">Create a payment system</h3>
    <p class="text-xs text-blue-600">It is your choice what payment systems you use. Some have the ability to connect with this app. For those there will be an available task to step you through the process.</p>
  </div>
       
      <!-- Delete -->
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-action="delete-payment-system">
    <h3 class="text-sm font-medium text-blue-700 mb-1">Delete a payment system</h3>
    <p class="text-xs text-blue-600">A task to help you through the process of ceasing using a payment supplier.</p>
  </div>

      <!-- relate -->
  <div class="bg-red-50 border border-red-200 rounded-lg p-4" data-action="relate-approfiles">
    <h3 class="text-sm font-medium text-red-700 mb-1">Relate the payment system by approfiles to...</h3>
    
    <p class="text-xs text-red-600">Everything is relative. 
    The process of relating is between approfiles. A payment system or aspects of it can be related to tasks or to abstract approfiles. </p>
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
