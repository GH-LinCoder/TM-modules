//  ./work/data/analytics.js
console.log('analytics.js loaded');


function getTemplateHTML() { console.log('getTemplateHTML()');
  return `<div class="tab-section" id="analytics-tab">
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    
    <!-- Students & Members -->
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-semibold mb-4">Students & Members</h3>
      <div class="space-y-2">
        <div class="flex justify-between">
          <span>Unique Students:</span>
          <span class="px-2 py-1 border rounded text-sm" id="unique-students-count">0</span>
        </div>
        <div class="flex justify-between">
          <span>Total Student Assignments:</span>
          <span class="px-2 py-1 border rounded text-sm" id="student-assignments-count">0</span>
        </div>
        <div class="flex justify-between">
          <span>Students/Members Ratio:</span>
          <span class="px-2 py-1 border rounded text-sm" id="student-member-ratio">0%</span>
        </div>
        <div class="text-sm text-muted-foreground">
          Average assignments per student: <span id="student-avg-assignments">0</span>
        </div>
      </div>
    </div>

    <!-- Managers & Members -->
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-semibold mb-4">Managers & Members</h3>
      <div class="space-y-2">
        <div class="flex justify-between">
          <span>Unique Managers:</span>
          <span class="px-2 py-1 border rounded text-sm" id="unique-managers-count">0</span>
        </div>
        <div class="flex justify-between">
          <span>Total Manager Assignments:</span>
          <span class="px-2 py-1 border rounded text-sm" id="manager-assignments-count">0</span>
        </div>
        <div class="flex justify-between">
          <span>Managers/Members Ratio:</span>
          <span class="px-2 py-1 border rounded text-sm" id="manager-member-ratio">0%</span>
        </div>
        <div class="text-sm text-muted-foreground">
          Average assignments per manager: <span id="manager-avg-assignments">0</span>
        </div>
      </div>
    </div>

    <!-- Authors & Members -->
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-semibold mb-4">Authors & Members</h3>
      <div class="space-y-2">
        <div class="flex justify-between">
          <span>Unique Authors:</span>
          <span class="px-2 py-1 border rounded text-sm" id="unique-authors-count">0</span>
        </div>
        <div class="flex justify-between">
          <span>Total Authored Tasks:</span>
          <span class="px-2 py-1 border rounded text-sm" id="author-tasks-count">0</span>
        </div>
        <div class="flex justify-between">
          <span>Authors/Members Ratio:</span>
          <span class="px-2 py-1 border rounded text-sm" id="author-member-ratio">0%</span>
        </div>
        <div class="text-sm text-muted-foreground">
          Average tasks per author: <span id="author-avg-tasks">0</span>
        </div>
      </div>
    </div>

    <!-- Most Active Tasks -->
    <div class="bg-white rounded-lg shadow p-6 md:col-span-1 lg:col-span-2">
      <h3 class="text-lg font-semibold mb-4">Most Active Tasks (Top 5)</h3>
      <div class="space-y-2" id="top-tasks-list">
        <!-- Task items will be injected here -->
        <div class="text-muted-foreground">No tasks with assignments found.</div>
      </div>
    </div>

    <!-- Most Active Students -->
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-semibold mb-4">Most Active Students (Top 5)</h3>
      <div class="space-y-2" id="top-students-list">
        <!-- Student items will be injected here -->
        <div class="text-muted-foreground">No students with assignments found.</div>
      </div>
    </div>

  </div>
</div>`}

export function render(panel, petition = {}) {
    console.log('data Render(', panel, petition, ')');
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