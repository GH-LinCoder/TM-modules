import { executeIfPermitted } from "./registry/executeIfPermitted";

//  ./plans.js
console.log('plans.js loaded');


function getTemplateHTML() { console.log('getTemplateHTML()');
  return `<h2 class="text-xl font-bold text-gray-800 mb-4">The aims of our organisation</h2>`
  + ` <button data-action="aims" class="text-gray-500 hover:text-gray-700" aria-label="Close">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>`
}

// plans appro id fab5776c-d7e9-4d2a-b52e-85b19ba9ae53
//aims appro id ada3685a-7f9d-4cfd-b96f-8272e12e468e


async function readAppro(panel)
{ const aimsApproId = 'ada3685a-7f9d-4cfd-b96f-8272e12e468e';
const aimsAppro = await executeIfPermitted(null, 'readApprofileById',{approfileId: aimsApproId});
console.log('aimsAppro',aimsAppro);


panel.innerHTML = getTemplateHTML()  + `<div class="rounded-lg p-6 shadow-md border relative  whitespace-pre-line"> ${aimsAppro.description}</div>
<div class="rounded-lg p-6 shadow-md border relative  whitespace-pre-line"><i>If you were using the app to create and manage your own organisation. You would edit this aim by editing the appro that stores this description: "Aims of the Organisation" with id: ada3685a-7f9d-4cfd-b96f-8272e12e468e</i></div>`


//panel.innerHTML = aimsAppro.description;

}
export function render(panel, petition = {}) {
    console.log('plans Render(', panel, petition, ')');
   readAppro(panel);

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