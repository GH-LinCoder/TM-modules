//  ./db/permissionsModule.js

console.log('permissionsModule.js loaded);


export function render(panel, query = {}) {
  console.log('Render permissions module:', panel, query);
  panel.innerHTML = getTemplateHTML();
  //attachListeners(panel);

}

function getTemplateHTML() {
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
              Create a new permission to to allow a person to read or write to the database, or have a specific role in your system.
              There are several ways to grant permissions.
            </p>
            <ul class="text-blue-700 text-sm mt-2 space-y-1">
              <li>• The easiest is to click through to a section of a dashboard you want to assign to a person</li>
              <li>• Then come back to this module and choose from the drop down which section you want to grant access to</li>
              <li>• The module will tell you want you are granting and will detail the effect</li>
              <li>• Click "Grant Permission" when you're ready to create it</li>
            </ul>
          </div>

        <div class="bg-gray-200 p-6 space-y-6">
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
        </div>
      </div>
    </div>
       ${petitionBreadcrumbs()} 
  `;
}            
