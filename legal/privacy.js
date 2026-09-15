//  ../legal/privacy.js

import { petitionBreadcrumbs } from '../ui/breadcrumb.js';
console.log('privacy.js loaded');


function getTemplateHTML() { console.log('getTemplateHTML()');
  return `
<div class="mb-2 p-2 bg-gray-100">
  <h3 class="text-xl font-semibold text-gray-900">Privacy</h3>
<button data-action="privacy" data-section = "menu" class="text-gray-500 hover:text-gray-700" aria-label="Close">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>


</div>
<div class="mb-5 p-2 md:p-5 bg-white border">


<p>1. The website is designed to require the minimum of details about you.</p>
<p> ~  </p>
<p>2. It requires an email address. This does not have to be your everyday email. </p>
<p> ~  </p>
<p>3. There is no reason to put your name in this website. Choose a user name.</p>
<p> ~  </p>
<p>4. The database only stores additional information about what you do or choose inside the website</p>
<p> ~  </p>
<p>5. This additional information is to enable the website to respond to your choices and preferences</p>
<p> ~  </p>
<p>6. Any data will be stored solely for the functioning of the website service including reacting to your choices and communicating with you.</p>
<p> ~  </p>
<p>7. Cookies are used so that the system can know which data is visible to you. This is used while you are on this website.</p>
<p> ~  </p>
<p>8. The website is designed such that the user can see data that is stored relevant to the user.</p>
<p> ~ </p>
<p>9. Data is stored for as long as needed to allow you to interact with the website and for however long after as required by law or normal record keeping</p> 
<p> ~ </p>
<p>10. Supabase</p>
<p>Data is stored on a database service called Supabase. Their data protection policies are available at <a href="https://supabase.com/privacy" target="_blank">supabase.com/privacy</a></p>

</div


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