//  ./work/how/howTo.js
console.log('howTo.js loaded');


function getTemplateHTML() { console.log('getTemplateHTML()');
  return `<div class="bg-white p-6 rounded-lg shadow">
  <h2 class="text-xl font-bold text-gray-800 mb-4">How To Use</h2>
  <p class="text-gray-600">Clicking the <em>How?</em> button brings up information.</p>
  <ul class="list-disc list-inside mt-2 text-sm text-gray-500">
    <li>The admin or member dashboard is always open on the left, next to the menu.</li>
    <li>Click the admin/dash menu button to only see the dashboard (closes other pages). Clicking the dasboard button in this way also refreshes the data displayed inside the dashboard by reading from the database. </li>
    <li>To open any other page <em>click the menu button</em></li>
    <li>Also click its menu button to close the page</li>
    <li> Cards (boxes) inside the dashboard offer other information or actions.</li>
    <li>Single left click will open a new page to the left. A 2nd left click on the same card closes that page. </li>
    <li>Actions pages (like 'Create a Task') can display data from the database, take your input and write it to the database.</li>
    <li>Click the <em>X</em> if there is one in the top right corner the page to close it. Or click the card or click the menu for the dashboard</li>
    <li>Clicking the current dashboard's menu button closes all other buttons, returns the dashboard to full screen and refreshes the data. </li>

    <li>The <em>How?</em> button brings up these instructions</li>
  </ul>
</div>`}

export function render(panel, petition = {}) {
    console.log('HowTo Render(', panel, petition, ')');
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