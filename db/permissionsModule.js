//  ./db/permissionsModule.js
import { petitionBreadcrumbs } from '../ui/breadcrumb.js';
import { renderPermissions } from '../work/approfiles/relateApprofiles.js';

console.log('permissionsModule.js loaded');


export function render(panel, query = {}) {
  console.log('Render permissions module:', panel, query);
  panel.innerHTML = getTemplateHTML1();
  //attachListeners(panel);
 renderPermissions(panel,query={},'permissionRelation');
/*  
let sourceTable=null;
if(relationType === 'permissionRelation') sourceTable = 'permission_relationships';
else if (relationType === 'ordinaryRelation') sourceTable ='relationships'; 
else {console.log('relationType unknown', relationType) }
*/
  // DOM elements

}

function getTemplateHTML1() {
  return `
    <div id="createPermissionsDialog" class="relative z-10 flex flex-col h-full">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 z-10 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-xl font-semibold text-gray-900">Create Permission 🪪</h3>
          <button data-action="close-dialog" class="text-gray-500 hover:text-gray-700" aria-label="Close">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
                <div class="p-6">
          <div class="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 class="font-medium text-blue-800 mb-2">Instructions:</h4>
            <p class="text-blue-700 text-sm">
              Relate a permission to the user to allow that user to read or write to the database.
              There are several ways planned to grant permissions, but currently the only implememted way is to relate the user to a scope via a function permission.
            </p>
            <ul class="text-blue-700 text-sm mt-2 space-y-1">
              <li>• The aim is to be able to click through to a section of a dashboard you want to assign to a person</li>
              <li>• Then come back to this module and choose from the drop down which section you want to grant access to</li>
              <li>• The module would then tell you what you are granting and would detail the effect</li>
              <li>• But that is in the future.</li>
<li>The current system is laborious and finicky </li>
<li>1) Click the [select] button in the top of screen menu bar</li>
<li>2) Select the 'scope' of the permission you want to grant. This is in 'Abstract appros'.  Scope is how wide the permission is and this is usyally a single word wuch as Tasks or Surveys </li>
<li>3) Pick the person you want to grant the permissions to. Find the person in 'Human appros'</li>
<li>4) Go to the admin dash </li>
<li>5) Go to the 'User Management' section </li>
<li>6) Click Grant User Permission </li>
              </ul>
          </div>

        <!--div class="bg-gray-200 p-6 space-y-6">
          <div id="createApprofileForm" class="space-y-4">
          <label for="approfileName" class="block text-sm font-medium text-gray-700 mb-1">
                Permission Name *
          </label>
            <input id="permissionName" placeholder="Unique name for this permission" maxlength="64" required class="w-full p-2 border rounded" />
            <p id="approfileNameCounter" class="text-xs text-gray-500">0/64 characters</p>
         <label for="approfileDescription" class="block text-sm font-medium text-gray-700 mb-1">
                Description *
         </label>
            <textarea id="approfileDescription" placeholder="Description" rows="3" maxlength="500" required class="w-full p-2 min-h-80 border rounded"></textarea>
            <p id="approfileDescriptionCounter" class="text-xs text-gray-500">0/500 characters</p>

            <button id="savePermissionBtn" class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">Save Permission</button>
          </div>
        </div-->
      </div>
    </div>
       ${petitionBreadcrumbs()} 
  `;
}            
