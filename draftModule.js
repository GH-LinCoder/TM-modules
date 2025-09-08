//  ./work/dash/memberDash.js
console.log('memberDash.js loaded');

//import 

function getTemplateHTML() { console.log('getTemplateHTML()');
  return `
<div class="bg-white p-6 rounded-lg shadow">
  <h2 class="text-xl font-bold text-gray-800 mb-4">Dashboard</h2>
  <p class="text-gray-600">This is a mock.html a page for test.</p>
  <ul class="list-disc list-inside mt-2 text-sm text-gray-500">
    <li>Mockity</li>
    <li>Mock</li>
    <li>Mock</li>
  </ul>
</div>

`}

export function render(panel, petition = {}) {
    console.log('memberDash Render(', panel, petition, ')');
    panel.innerHTML = getTemplateHTML();

     //? query.petitioner : 'unknown';
    console.log('Petition:', petition);
    panel.innerHTML+= `<p class="text-xs text-gray-400 mt-4">Context: ${petition.Module} - ${petition.Section} - ${petition.Action}</p>`;

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

}