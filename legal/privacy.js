//  ../legal/privacy.js

import { petitionBreadcrumbs } from '../ui/breadcrumb.js';
console.log('plans.js loaded');


function getTemplateHTML() { console.log('getTemplateHTML()');
  return `
<div class="section"><b>
  <h1>Privacy</h1>
</div>
<div class="section">

<lu>
  <li>The website is designed to require the minimum of details about you.</li>
<li> ~  </li>
<li>An email address. This does not have to be your everyday email. </li>
<li>There is no reason to put your name in this website. Choose a user name.</li>
<li> ~  </li>
<li>The database only stores additional information about what you do or choose inside the website</li>
<li>This additional information is to enable the website to respond to your choices and preferences</li>
<li> ~  </li>
<li>Any data will be stored solely for the functioning of the website service including reacting to your choices and communicating with you</li>
<li>Data is stored for as long as needed to allow you to interact with the website and for however long after as required by law or normal record keeping</li>
<li> ~  </li>
<li>The website is designed such that the user can see data that is stored relevant to the user.</li>
<li> ~ </li>
<li>Supabase</li>
<li>Data is stored on a database service called Supabase. Their data protection policies are available at <a href="https://supabase.com/privacy" target="_blank">supabase.com/privacy</a></li>
</b>
</lu>


${petitionBreadcrumbs()} 
`}

export function render(panel, petition = {}) {
    console.log('privacy Render(', panel, petition, ')');
    panel.innerHTML = getTemplateHTML();

     //? query.petitioner : 'unknown';
   // console.log('Petition:', petition);
 //   panel.innerHTML+= `<p class="text-xs text-gray-400 mt-4">Context: ${petition.Module} - ${petition.Section} - ${petition.Action}</p>`;
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