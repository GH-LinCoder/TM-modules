//  ./work/how/howTo.js
console.log('howTo.js loaded');
import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';
import {appState} from '../../state/appState.js';

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

function getContextHTML(petition) { console.log('getContextHTML()');
  return `<div bg-blue-100 class="bg-white p-6 rounded-lg shadow">
  <h2 class="text-xl font-bold text-gray-800 mb-4">Context how to</h2>
  <p class="text-gray-600">The information <em>changes</em> when doing different things </p>
  <ul class="list-disc list-inside mt-2 text-sm text-gray-500">
    <li>You want context specific help related to</li>
    <li></li>
    <li>module:<b>${petition.Module}</b></li>
<li></li>
    <li>section:<b>${petition.Section}</b></li>
  <li></li>
    <li>for action:<b>${petition.Action}</b></li>
    <li></li>
    <li> displayed in:<b>${petition.Destination}</b></li>
   <li></li>
   <li></li>
    <li>As at 23:13 Sept 10 2025 the database system for that has not yet been implemented</li>
   <li></li> 

    <li>The <em>How?</em> button brings up these instructions & a 2nd click closes this page.</li>
  </ul>
</div>`}




export function render(panel, petition = {}) {
    console.log('HowTo Render(', panel, petition, ')');
    panel.innerHTML = getTemplateHTML();

     //? query.petitioner : 'unknown';
    console.log('Petition:', petition);
      // panel.innerHTML+= `<p class="text-xs text-gray-400 mt-4">Context: ${petition.Module} - ${petition.Section} - ${petition.Action}- ${petition.Destination}</p>`;}
      panel.innerHTML+=petitionBreadcrumbs();//this reads 'petition' and prints the values at bottom of the render panel
  //  }

    window.addEventListener('state-change', (e) => {
      const { petitioner, petitionHistory } = appState.query;
    console.log('howToEventListener');
      if (petitioner.Module === 'howTo' || petitioner.Module === 'howTo.html') {
        const previous = petitionHistory[petitionHistory.length - 1];
        panel.innerHTML = getContextHTML(previous);
        //updateInstructionsBasedOn(previous);
      } else panel.innerHTML = getContextHTML(petitioner); //panel is defined inside render. it is sent to render(panel, petition)
    }); }
    



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