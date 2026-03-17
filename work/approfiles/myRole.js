import { executeIfPermitted } from "../../registry/executeIfPermitted";

//  ./plans.js
console.log('plans.js loaded');


function getTemplateHTML() { console.log('getTemplateHTML()');
  return `<h2 class="text-xl font-bold text-gray-800 mb-4">Every one in the organisation has a role</h2>`
}

// plans appro id fab5776c-d7e9-4d2a-b52e-85b19ba9ae53
//aims appro id ada3685a-7f9d-4cfd-b96f-8272e12e468e


async function determineRole(panel)
{ const aimsApproId = 'ada3685a-7f9d-4cfd-b96f-8272e12e468e';
const aimsAppro = await executeIfPermitted(null, 'readApprofileById',{approfileId: aimsApproId});
console.log('determineRole() placeholder');


panel.innerHTML =  getTemplateHTML() +`<div class="rounded-lg p-6 shadow-md border relative  whitespace-pre-line">
<p>The inital role of a new user is to determine what you want to do.
</p>
<p>
Deciding what you want to do is by working through your initial assigned tasks and answering questions in surveys. 
</p>
<p>
The answers chosen in surveys change what groups you join or what tasks are assigned to you.  
</p>
The contents of this 'My role' module will change as you move through tasks and surveys.
</p>
<p class="text-sm text-gray-400"> (The detailed coding for changing the role is not yet implemented - March 10 2026)</div>

<div class="rounded-lg p-6 shadow-md border relative  whitespace-pre-line"><i>If you were using the app to create and manage your own organisation you would help determine roles. " </i></div>`

//panel.innerHTML = aimsAppro.description;

}
export function render(panel, petition = {}) {
    console.log('plans Render(', panel, petition, ')');
   determineRole(panel);

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