//  ./work/approfiles/appro-stats.js
console.log('appro-stats.js loaded');


function getTemplateHTML() { console.log('getTemplateHTML()');
  return `
  <!--   APPROFILES  -->  
<div class="bg-white rounded-lg shadow p-6" >
  <div class="tab-section" data-section="quick-stats"></div>
  

 <div class="flex space-x-4 mb-4">
    <span class="text-sm font-medium">Sort by:</span>
     
            <label class="flex items-center space-x-2">
        <input type="radio" name="approView" value="appros-desc" data-toggle="appros" />
        <span>abstract  a-z</span>
      </label>
      <label class="flex items-center space-x-2">
        <input type="radio" name="approView" value="appros-asc" data-toggle="appros" />
        <span>abstract  z-a</span>
      </label>

      <label class="flex items-center space-x-2">
        <input type="radio" name="approView" value="appros-asc" data-toggle="appros" />
        <span>Tasks</span>
      </label>

      <label class="flex items-center space-x-2">
        <input type="radio" name="approView" value="appros-asc" data-toggle="appros" />
        <span>Human a-z (includes mockTest)  See other section for details</span>
      </label>
      <label class="flex items-center space-x-2">
        <input type="radio" name="approView" value="appros-asc" data-toggle="appros" />
               <span>Human  z-a (includes mockTest)  See other section for details</span>
      </label>





 </div>

  <div class="space-y-2 max-h-96 overflow-y-auto" data-list="appros">
 <h2 class="text-xl font-bold mb-4" data-title="appros">
    Approfiles (<span class="text-sm text-gray-500" data-count="approfiles">?</span>)
  </h2>

 
  </div>
</div>
`}

export function render(panel, petition = {}) {
    console.log('approStats Render(', panel, petition, ')');
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