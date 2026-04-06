//  ./db/permissionsModule.js
import { petitionBreadcrumbs } from '../ui/breadcrumb.js';
//import { renderPermissions } from '../work/approfiles/relateApprofiles.js';
import { createBundleAppro} from '../work/approfiles/createApprofile.js';

import{relateBundleToPermissions} from '../work/approfiles/relateApprofiles';
console.log('createBundleAppro.js loaded');


export function render(panel, query = {}) {
  console.log('Render createBundleAppro', panel, query);

  panel.innerHTML = getTemplateHTML(); //display instructioons

const displayArea1 =panel.querySelector('#display-area1'); //create an area where the called module can display

const displayArea2 =panel.querySelector('#display-area2'); //create an area where the called module can display

createBundleAppro(displayArea1); //call the module by its bundle entry function
// this module doesn't know the bundle data. createBundleAppro knows it
relateBundleToPermissions(displayArea2, 'need data here'); // does this overwrite the previous module or add to it?
//BUG only the first module displays. Without the module calls the two areas display, but anything injected into area 1 seems to erase area2


  //panel.innerHTML = getTemplateHTML1();
  //attachListeners(panel);
// renderPermissions(panel,query={},'permissionRelation'); //permissionsModule is just a warpper the tells the relate module to handle permissions
/*  
let sourceTable=null;
if(relationType === 'permissionRelation') sourceTable = 'permission_relationships';
else if (relationType === 'ordinaryRelation') sourceTable ='relationships'; 
else {console.log('relationType unknown', relationType) }
*/
  // DOM elements



}

function getTemplateHTML() { //this was a previous design, but not used
  return `
    <div id="createPermissionsBundle" class="relative z-10 flex flex-col h-full">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 z-10 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-xl font-semibold text-gray-900">Create Permission Bundle 🪪</h3>
          <button data-action="close-dialog" class="text-gray-500 hover:text-gray-700" aria-label="Close">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
                <div class="p-6">
          <div class="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 class="font-medium text-blue-800 mb-2">Instructions:</h4>
            
            <ul class="text-blue-700 text-sm mt-2 space-y-1">
              <li>• First we create a file called an appro to represent the bundle of permissions. </li>
              <li>• You give the appro a name that describes what the bundle is for, like "edit tasks" or "publish surveys"</li>
              <li>• Then you select the basic permissions to go into the bundle</li>
              <li>• When done you get to review and confirm it</li>
<li>This is complicated, laborious and finicky. Which is why the app comes with many preset bundles. </li>
<li>1) step by step instructions to be placed here...</li>
<li>2) Select the 'scope' of the permission you want to grant. This is in 'Abstract appros'.  Scope is how wide the permission is and this is usyally a single word wuch as Tasks or Surveys </li>
<li>3) </li>
<li>4) </li>
<li>5) </li>
<li>6) </li>
              </ul>
          </div>

        <div id="display-area1" class="bg-green-100">
<!-- display Area for creatAppro -->
displayArea1 for createAppro
        </div>
<div>============</div>
        <div id="display-area2" class="bg-blue-100">
        display-area2 for relateAppro
<!-- display Area for relateAppro -->
        </div>

      </div>
    </div>
       ${petitionBreadcrumbs()} 
  `;
}            
