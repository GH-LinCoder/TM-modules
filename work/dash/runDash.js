//  ./work/dash/runDash.js
console.log('runDash.js loaded');
//import { showToast } from '../../flexmain.js';
import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';

function getTemplateHTML() { console.log('getTemplateHTML()');
    // data-permission probably not used sept 2026
    //data-page-type possibly not used sept 2026
  return `
<section data-page-type="dashboard" data-permission="admin" data-module="runDash" data-destination='new-panel'>
 
  <!-- dashboard content -->
<div class="min-h-screen bg-gray-200 text-gray-900">


 <!-- DASHBOARD HEADER -->   
<div class="px-6 py-4 border-b bg-blue-200 flex justify-between items-center gap-4">
  
  <!-- Left Side: Group User & Data Details together -->
  <div class="flex flex-col gap-1 min-w-0">
    <div class="userDetails text-sm text-gray-500 truncate" data-value="user-details" title="User name and auth of the logged in person">Logged-in user details to be loaded</div>
    <div class="dataDetails text-sm text-gray-500 truncate" data-value="data-details" title="Name and appro id of the last item selected with the selection tool">Any selected item data details to be loaded</div>
  </div>

  <!-- Right Side: Title & Description -->
  <div class="flex-1 min-w-0 text-right">
    <h1 class="text-xl md:text-2xl font-bold truncate" data-dash-title="admin">Manager Dashboard</h1>
    <p class="text-sm text-gray-500 truncate" data-dash-sub_title="admin">Manage & Confirm connections.</p><p class="text-sm text-gray-500 truncate"> 
    Move students through tasks.</p>
    <p class="text-sm text-gray-500 truncate" data-dash-sub_title="admin">Click the menu <em>How?</em> button for help</p>
  </div>

</div>

<!-- Quick Acts -->
<div class="bg-gray-100 rounded-lg shadow p-6" data-section="quick-acts" data-destination="quick-acts">
  <h2 class="text-lg font-semibold mb-2">Quick Acts 🌀</h2>
  <p class="text-sm text-gray-500 mb-4">Fast access to common management tasks. They open below. (Click the card again to close)</p>

  <!-- Matrix: 4 rows by 3 columns -->
  <div class="grid grid-cols-3 gap-4">


    <!-- ===================== -->
    <!-- ROW 0 — ALL RESOURCES -->
    <!-- ===================== -->


 <!-- Connections: All 🪪 📜 🔧-->
    <div class=" bg-green-50 border border-orange-400 p-4 cursor-pointer hover:shadow-md" data-action="display-all-connections">
      <h3 class="text-sm font-medium text-green-700">Connections: All  </h3>
      <p class="text-xs text-gray-600 hidden md:block" > NOT YET IMPLEMENTED <br>See assignments & relations. These can be your own new connections, plus any new connections for resources you manage.</p>
    </div>

    <!-- Managed: All 🪪 📜 🔧-->
    <div class=" bg-blue-50 border border-orange-400 p-4 cursor-pointer hover:shadow-md" data-action="display-all-managed">
      <h3 class="text-sm font-medium text-green-700">Managed: All </h3>
      <p class="text-xs text-gray-600 hidden md:block" >NOT YET IMPLEMENTED<br> Anything that you manage.</p>
    </div>

    <!-- future: ??? 🪪 📜 🔧-->
    <div class=" bg-orange-50 border border-orange-400 p-4 cursor-pointer hover:shadow-md" data-action="">
      <h3 class="text-sm font-medium text-green-700">future </h3>
      <p class="text-xs text-gray-600 hidden md:block" >TO BE IMPLEMENTED</p>
    </div>





    <!-- ===================== -->
    <!-- ROW 1 — APPRO RESOURCES -->
    <!-- ===================== -->

    <!-- Appro: Connections -->
    <div class="rounded-2xl bg-green-50 border border-green-400 p-4 cursor-pointer hover:shadow-md" data-action="display-connected-appros">
      <h3 class="text-sm font-medium text-green-700">Connections: Appros 🪪</h3>
      <p class="text-xs text-gray-600 hidden md:block" >You and many other persons and things are represented by an appro. See any new conection of your own appro or any appros you manage.</p>
    </div>

    <!-- Appro: Managed -->
    <div class="rounded-2xl bg-blue-50 border border-green-400 p-4 cursor-pointer hover:shadow-md" data-action="display-managed-appros">
      <h3 class="text-sm font-medium text-green-700">Managed: Appros </h3>
      <p class="text-xs text-gray-600 hidden md:block" >NOT YET IMPLEMENTED<br>See any appros you manage (includes your own appro)</p>
    </div>

    <!-- Appro: ??? -->
    <div class="rounded-2xl bg-orange-50 border border-green-400 p-4 cursor-pointer hover:shadow-md" data-action="">
      <h3 class="text-sm font-medium text-green-700">future </h3>
      <p class="text-xs text-gray-600 hidden md:block" >TO BE IMPLEMENTED</p>
    </div>




    <!-- ====================== -->
    <!-- ROW 2 — SURVEY RESOURCES -->
    <!-- ====================== -->

    <!-- Survey: Connections -->
    <div class="bg-green-50 border border-yellow-400 rounded-r-2xl p-3 cursor-pointer hover:shadow-md" data-action="display-connected-surveys">
      <h3 class="text-sm font-medium text-yellow-700">Connections: Surveys 📜</h3>
      <p class="text-xs text-gray-600 hidden md:block" >See any new connections you have with surveys or any surveys you manage that have new connections</p>
    </div>

    <!-- Survey: Managed -->
    <div class="bg-blue-50 border border-yellow-400 rounded-r-2xl p-3 cursor-pointer hover:shadow-md" data-action="display-managed-surveys">
      <h3 class="text-sm font-medium text-yellow-700">Managed: Surveys </h3>
      <p class="text-xs text-gray-600 hidden md:block" >NOT YET IMPLEMENTED<br>See all the surveys you manage</p>
    </div>

    <!-- Survey: ??? -->
    <div class="bg-orange-50 border border-yellow-400 rounded-r-2xl p-3 cursor-pointer hover:shadow-md" data-action="">
      <h3 class="text-sm font-medium text-yellow-700">future </h3>
      <p class="text-xs text-gray-600 hidden md:block" >TO BE IMPLEMENTED</p>
    </div>

  


    <!-- ===================== -->
    <!-- ROW 3 — TASK RESOURCES -->
    <!-- ===================== -->

    <!-- Task: Connections -->
    <div class="bg-green-50 border border-blue-400 rounded-l-2xl p-3 cursor-pointer hover:shadow-md" data-action="display-connected-tasks">
      <h3 class="text-sm font-medium text-blue-700">Connections: Tasks 🔧</h3>
      <p class="text-xs text-gray-600 hidden md:block" >See any new connection you have with tasks or any new connections of tasks you manage</p>
    </div>

    <!-- Task: Managed -->
    <div class="bg-blue-50 border border-blue-400 rounded-l-2xl p-3 cursor-pointer hover:shadow-md" data-action="display-managed-tasks">
      <h3 class="text-sm font-medium text-blue-700">Managed: Tasks </h3>
      <p class="text-xs text-gray-600 hidden md:block" >NOT YET IMPLEMENTED<br>See all the tasks you manage</p>
    </div>


    <!-- Task: Move students -->
    <div class="bg-orange-50 border border-blue-400 rounded-l-2xl p-3 cursor-pointer hover:shadow-md"  
     data-section="pending-manager-tasks"  
     data-action="display-students-on-tasks" 
     data-destination="display-area" 
     title="View students waiting for your approval to move to the next step">
      <h3 class="text-sm font-medium text-blue-700">This is where I manage my students through their tasks. 🔧🛼🧑‍🎓</h3>
      <p class="text-xs text-gray-600">
     Click to see tasks where students are waiting for me to approve their next step.
     <i>Only if I manage a task where there are students who want to move to the next step</i>
     </p>
    </div>
  </div>
</div>

<div data-section="display-area" data-destination="display-area"></div>


<!-- INFORMATION SECTION added April 5 2026-->
<div id='informationSection'></div>

  <div class="container mx-auto px-4 py-8 space-y-8">
    
  <!-- Quick Stats -->

<!--  management section -->

  </div>
</div>



<!-- Settings -->
<div class="bg-gray-100 rounded-lg shadow p-6" data-section='settings' data-destination='settings'>
  <h2 class="text-lg font-semibold mb-2">Settings  ⚙️  ⚙️</h2>
  <p class="text-sm text-gray-500 mb-4">System configuration and administrative settings</p>

  <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">


    <div class="bg-blue-100 border border-gray-200 rounded-lg p-4 cursor-pointer" data-action="modules-market-section">
      <h3 class="text-sm font-medium text-gray-800">Upgrades and Developer Market 🏗️</h3>
      <p class="text-xs text-gray-500">Purchase major upgrades or earn by developing upgrades</p>
    </div>

    <div class="bg-green-200 border border-gray-200 rounded-lg p-4 cursor-pointer" data-action="money-management-section">
      <h3 class="text-sm font-medium text-gray-800">Money💷💵💶</h3>
      <p class="text-xs text-gray-500">Setting-up and managing membership fees , subscriptions, donations</p>
    </div>

    <div class="bg-gray-50 border border-gray-200 rounded-lg p-4" data-action="rewards-section">
      <h3 class="text-sm font-medium text-gray-800">Rewards</h3>
      <p class="text-xs text-gray-500">Configure reward systems and achievements</p>
    </div>


    <div class="bg-gray-50 border border-gray-200 rounded-lg p-4" data-action="support-section">
      <h3 class="text-sm font-medium text-gray-800">Support</h3>
      <p class="text-xs text-gray-500">Access support tools and documentation</p>
    </div>

    <div class="bg-gray-50 border border-gray-200 rounded-lg p-4" data-action="messages-section">
      <h3 class="text-sm font-medium text-gray-800">Messages</h3>
      <p class="text-xs text-gray-500">System notifications and announcements</p>
    </div>


  </div>
</div>


  

  </div>
</div>

   ${petitionBreadcrumbs()} 
`}


export function render(panel, petition = {}) {
    console.log('runDash Render(', panel, petition, ')');
    panel.innerHTML = getTemplateHTML();

}
