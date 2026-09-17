//  ./mutate/managerManagementSection.js
console.log('managerManagementSection.js loaded');

import { petitionBreadcrumbs } from'../ui/breadcrumb.js';

function getTemplateHTML() { console.log('getTemplateHTML()');
  return `
<!-- manager Management section -->
<!--div class="bg-green-100 rounded-lg shadow p-6" data-section="permission-management-section"-->
  <h2 class="text-lg font-semibold mb-2">Permission Management</h2>
  <p class="text-sm text-gray-500 mb-4">Click to carryout the action, it opens in a new panel to the right </p>

  <!-- managers -->
  

  
<!-- permision management section -->
<div class="bg-red-100 rounded-lg shadow p-6" data-section="permission-management" data-destination='permission-management'>
  <h2 class="text-lg font-semibold mb-2">Creating, granting, removing permissions</h2>
  <p class="text-sm text-gray-500 mb-4">Click to carry-out the action, it opens below (you may need to scroll down) </p>

      <!-- Return -->
  <div class="bg-gray-200 border border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-300 flex flex-col justify-center items-center text-center" data-action="permission-management-section">
    <h3 class="text-sm font-bold text-blue-700">◀️ CLOSE SECTION</h3>
    <p class="text-[9px] text-blue-600 uppercase">Return</p>
  </div>

  <div class="grid md:grid-cols-3 lg:grid-cols-4 gap-6" id="permission-cards">
  

  
  
      <!-- Create -->
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4  cursor-pointer" data-action="open-create-bundle-appro">
    <h3 class="text-sm font-medium text-blue-700 mb-1">Create a new permission bundle 🎆📦🔐</h3>
    <p class="text-xs text-blue-600"> Admin can put permissions together in bundles and later assign all those permissions to someone in one go.</p>
  </div>
  


      <!-- Grant bundle of permissions -->
  <div class="bg-yellow-100 border border-red-200 rounded-lg p-4 cursor-pointer" data-action="open-bundle-permissions-dialogue">
    <h3 class="text-sm font-medium text-red-700 mb-1">Grant a BUNDLE of permissions to someone 📦🔐</h3>
    <p class="text-xs text-red-600">
    Usually permissions are granted in preset bundles.
The bundle has a name and a list of underlying permissions and a scope<br>
(]BUNDLE:name[) - (]permission name[) - [scope]. <br>
    </p>
    <p class="text-xs text-red-600">
    When a bundle of permissions is granted to someone the details can be seen in the display function 
    </p>
  </div>

  <!-- Grant single permission -->
  <div class="bg-green-50 border border-red-200 rounded-lg p-4 cursor-pointer" data-action='open-permissions-dialogue'>
    <h3 class="text-sm font-medium text-red-700 mb-1">Grant a permission to someone 🔐</h3>
    <p class="text-xs text-red-600">This is for bespoke permissions where you need to select specific permissions to grant to someone. 
    Sometimes you need to grant a specific permission that is not in a bundle.
    Both kinds end up as individual permissions stored as a colection of three things<br>
    [the person] - [the permission name] - [ the scope of the permission ]<br> 
    </p>
  </div>

  <!-- Revoke permission or bundle of permissions -->
    <div class="bg-yellow-50 border border-red-200 rounded-lg p-4 cursor-pointer" data-action='open-permissions-revoke-dialogue'>
    <h3 class="text-sm font-medium text-red-700 mb-1">Revoke a permission someone has 🗑️ 🔐</h3>
    <p class="text-xs text-red-600">Removing a permission or bundle of permissions effects the individual's ability to see or change data in the database. 
    <br>
    All bundle permissions are stored as individual permissions:<br>
    [the person] - [the permission name] - [ the scope of the permission ]<br>
    </p>
  </div>

      <!-- Display -->
  <div class="bg-blue-100 border border-red-200 rounded-lg p-4 cursor-pointer" data-action="display-related-approfiles-dialogue">
    <h3 class="text-sm font-medium text-red-700 mb-1">Display permissions 👁️🔐</h3>
     <p class="text-xs text-blue-600">See who has which permisions. The permissions are under the 'Rules' tab.</p>
    </div>


 <!-- Search -->
  <div class="bg-gray-50 border border-blue-200 rounded-lg p-4 cursor-pointer" data-action="permission-search">
    <h3 class="text-sm font-medium text-gray-300 mb-1">Search permissions</h3>
    <p class="text-xs text-gray-300">This searches the permissions. If you want to search approfiles, try the other section. </p>
  </div>


    <!-- Edit -->
  <div class="bg-gray-50 border border-blue-200 rounded-lg p-4" data-action="edit-permission-bundle">
    <h3 class="text-sm font-medium text-gray-300 mb-1">Edit an existing permission Bundle</h3>
    <p class="text-xs text-gray-300">Editing a bundle means removing or adding permissions.</p>
  </div>

      <!-- Delete -->
  <div class="bg-gray-50 border border-blue-200 rounded-lg p-4" data-action="delete-permission_bundle">
    <h3 class="text-sm font-medium text-gray-300 mb-1">Delete an existing permission bundle</h3>
    <p class="text-xs text-gray-300">Deletion of a bundle means that you can't grant that bundle of permissions to anyone in future, but deleting it does not effect anyone who had been granted this bundle. They continue to have the permissions. When you display permissions for such a person you will no longer know that they were granted this bundle if you delete the bundle.</p>
  </div>

</div>
<!--/div-->

               ${petitionBreadcrumbs()} 
`}


export function render(panel, petition = {}) {
    console.log('managerManagement Render(', panel, petition, ')');
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
