//  ./work/data/assignments.js
console.log('assignments.js loaded');


function getTemplateHTML() { console.log('getTemplateHTML()');
  return `<!--  ASSIGNMENTS  -->
<div class="bg-white rounded-lg shadow p-6">
  <div class="tab-section" data-section="assignments-section">
    <h2  class="text-xl font-bold mb-4" data-title="assignments">
      Assignments (<span class="text-sm text-gray-500" data-count="assignments">0</span>)
    </h2>

    <!-- View Type Toggle -->
    <div class="flex space-x-4 mb-4">
      <label class="flex items-center space-x-2">
        <input type="radio" name="assignmentView" value="all" checked data-toggle="assignments" />
        <span>All</span>
      </label>
      <label class="flex items-center space-x-2">
        <input type="radio" name="assignmentView" value="unique" data-toggle="assignments" />
        <span>Unique</span>
      </label>
    </div>

    <!-- Assignment List Placeholder -->
    <div data-list="assignments" class="space-y-2 max-h-96 overflow-y-auto">
      <!-- Assignment items will be injected here -->
    </div>
  </div>
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