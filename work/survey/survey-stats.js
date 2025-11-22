//  ./surveys/survey-stats.js
console.log('survey-stats.js loaded');


function getTemplateHTML() { console.log('getTemplateHTML()');
  return `
<!--  SURVEYS  -->
<div class="bg-white rounded-lg shadow p-6">
  <div class="tab-section" data-section="surveys-section">
    <h2  class="text-xl font-bold mb-4" data-title="surveys">
    surveys (<span class="text-sm text-gray-500" data-count="surveys">0</span>)
    </h2>

  
    <label class="flex items-center space-x-2">
        <input type="radio" name="survey_view" value="unique" data-toggle="surveys" />
        <span>Could be average number of questions per survey</span>
      </label>
            <label class="flex items-center space-x-2">
        <input type="radio" name="survey_view" value="unique" data-toggle="surveys" />
        <span>Could be average number of answers per question</span>
      </label>
            <label class="flex items-center space-x-2">
        <input type="radio" name="survey_view" value="unique" data-toggle="surveys" />
        <span>Average number of automations per question</span>
      </label>
      </label>
            <label class="flex items-center space-x-2">
        <input type="radio" name="assignmentView" value="unique" data-toggle="assignments" />
        <span>Surveys currently assigned</span>
      </label>

      <label class="flex items-center space-x-2">
        <input type="radio" name="assignmentView" value="unique" data-toggle="assignments" />
        <span>New surveys in last 28 days</span>
      </label>

  </div>
</div>  
`}

export function render(panel, petition = {}) {
    console.log('surveys Render(', panel, petition, ')');
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