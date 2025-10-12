//  ./work/student/students.js
console.log('students.js loaded');

import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';


function getTemplateHTML() { console.log('getTemplateHTML()');
  return `
<!-- STUDENTS  -->

<div class="bg-white rounded-lg shadow p-6" >
  <div class="tab-section" data-section="students-section"></div>
  <h2 class="text-xl font-bold mb-4" data-title="students">
    Students (<span class= "text-sm text-gray-500" data-count="students">0</span>)
  </h2>

  <div class="flex space-x-4 mb-4">
    <label class="flex items-center space-x-2">
      <input type="radio" name="studentView" value="all" data-toggle="students" />
      <span>All</span>
    </label>
    <label class="flex items-center space-x-2">
      <input type="radio" name="studentView" value="unique" checked data-toggle="students" />
      <span>Unique</span>
    </label>
  </div>

  <div class="space-y-2 max-h-96 overflow-y-auto" data-list="students">
    <!-- Student items will be injected here -->
  </div>
</div>    
   ${petitionBreadcrumbs()} 
`}

export function render(panel, petition = {}) {
    console.log('students Render(', panel, petition, ')');
    panel.innerHTML = getTemplateHTML();

     //? query.petitioner : 'unknown';
    console.log('Petition:', petition);
   // panel.innerHTML+= `<p class="text-xs text-gray-400 mt-4">Context: ${petition.Module} - ${petition.Section} - ${petition.Action}- ${petition.Destination}</p>`;}
  // panel.innerHTML+=petitionBreadcrumbs();//this reads 'petition' and prints the values at bottom of the render panel
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