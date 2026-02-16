// ./work/approfiles/displayRelations.js
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { appState } from '../../state/appState.js';
import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';
import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';
import {  detectContext,resolveSubject, applyPresentationRules} from '../../utils/contextSubjectHideModules.js'
import {getClipboardAppros} from './getClipboardAppros.js';

console.log('displayRelations.js loaded 12:45 Oct 26');

/**
 * bugs feb 14 2026
 * Clicking on an appro in the display is supposed to make that appro the new subject of the display 
 * This sometimes works, but after a 2nd attempt to change the subject there is no response. I don't know why
 * This used to work properly. Probably broken by the changes on resolving subject or calling for permissions separately.
 * Also there should be a check that the appro is an authUser and only then check for permissions.
 * No point in calling for permissions for any other kind of appro
 * 
 * The code is confusing because it uses 'subject' and 'object' where it should use approIs and ofAppro.
 * subject should mean the chosen appro that is the basis of the current display. There is no object.
 * subject can be approIs or ofAppro depnding on what has been clicked.
 */


const displayMode = 'noun'; // defualt setting showing appro relations  see idea below for enum
/**
 * const displayModes = Object.freeze({
    noun: 'approRelations',
    verb: 'actionConnections',
    read: 'readDetailsOfTasksSurveysOrItems',
    assign: 'assignmentsOfPersonsOrActions',
    permissions: 'permissionsHeldOrRequired'
});
 * 
 * 
 * 
 * noun: appros and their relations. Appros are name tags so displaying them is the 'noun' mode
 * verb: displaying what effect something has on other things. Showing tasks and survey automations or other 'doing' connections. Doing means verbs
 * read: Examining the details of a task or survey, not what they affect but what they contain
 * assign: Seeing what tasks or surveys have been assigned to whom. Can click from student to see assignments or from the assigned thing to see who has been assigned to it
 * permissions: click a permission to find who has it. Click a person to see what permissions. Click a task to see what permissions required 
 * 
 */



const userId = appState.query.userId; //probably legacy 

const defaultId=appState.query.userId;
//const defaultName='default';
let currentSelection=defaultId;


function attachDropdownListener(panel) {
    const select = panel.querySelector('[data-role="subject-dropdown"]'); //change 16:17 Oct 27 // correct use of 'subject'

  if (!select) return;

  // Check if listener already attached
  if (select.dataset.listenerAttached === 'true') {
   // console.log('Listener already attached, skipping');
    return;
  }

  // Add the listener
  select.addEventListener('change', async (e) => {
   // console.log('DropdownChange,NameFound calling loadAndRender');
    const approfileId = e.target.value;
    console.log('click produced this value:',approfileId);
    const selectedName = e.target.options[e.target.selectedIndex].textContent;
    if (approfileId) { console.log('approfileId:',approfileId); 
      await loadAndrenderRelations(panel, approfileId, selectedName); 
    } else {
      renderRelations(panel, null, null); 
    }
  });

  // Mark as attached AFTER successfully adding listener
  select.dataset.listenerAttached = 'true';
//  console.log('Dropdown listener attached');
}

function attachClickItemListener(panel) {
  // Remove any existing click listener first
  if (panel._clickListener) {
    panel.removeEventListener('click', panel._clickListener);
  }
  
// ATTACH CLICK LISTENER TO PANEL (persists through re-renders)
  panel.addEventListener('click', async (e) => {
  
//    const flowBox = e.target.closest('.flow-box'); // If a box conatins the subject of the display that box is displayed differentlly
 const flowBox = e.target.closest('[data-content-id]');//changed 21:33 Feb 14. No difference noted
  console.log('box clicked:', flowBox, 'dataset',flowBox?.dataset);// flowBox is null

if(!flowBox) return;

const clickType = e.target.dataset.clicked; // 'icon' or 'name'
if (!clickType) return; // Not a click on an icon or name, ignore

  if (clickType === 'name'){ // the main part of the box has been clicked, not the icon. This means setting the name as the subject of the display & redrawing it. (Could exclude if unchanged)

    const subjectId = flowBox.dataset.contentId;  //this is getting the name not the id
//    const subjectName = flowBox.textContent;// this includes the icon BAD code
const subjectName = flowBox.dataset.contentName;// that seems to work. But could be better to compare id rather than name
      console.log('Box clicked to give:', subjectId, subjectName);
      await loadAndrenderRelations(panel, subjectId, subjectName);
    }
else if (clickType === 'icon'){ // will have to call a different function after determining if the con is for a task or survey or other thing that can be explored
  console.log('Icon clicked. No implementation yet');

}


});
}

export function render(panel, query = {}) { //Called from loader (standard interface) 
  console.log('displayRelations.render()', panel, query);
  if (!panel || !panel.isConnected) {
    console.warn('Render target not found or disconnected');
    return;
  }
  panel.innerHTML = getTemplateHTML();
  init(panel, query);
      //    panel.innerHTML+=petitionBreadcrumbs();//this reads 'petition' and prints the values at bottom of the render panel
}

function getTemplateHTML() {
  return `

    <div  class="edit-task-dialogue relative z-10 flex flex-col h-full" data-destination="new-panel">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 z-10 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-xl font-semibold text-gray-900">Display Relations 🖇️  20:50 Oct 23</h3>
          <button data-action="close-dialog" class="text-gray-500 hover:text-gray-700" aria-label="Close">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

          <div class="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200" data-action="selector-dialogue">
            <h4 class="font-medium text-blue-800 mb-2">Instructions:</h4>
            <p class="text-blue-700 text-sm">
              Select an approfile from your clipboard below.
            </p>
            <ul class="text-blue-700 text-sm mt-2 space-y-1">
              <li>• You can view how any one appro is related to others</li>
              <li>. The initial display may be about you</li>
              <li>• Or you can click to open the [Select] module</li>
              <li>• Then the dropdown will fill with whatever you select in that module</li>
              <li>If the selection has already been made then the dropdown Auto-fills from the clipboard.</li>
              <li> Click the [Select] menu button or click here to open the Selector</li>
            </ul>

            <ul class="text-blue-700 text-sm mt-2 space-y-1">
              <li>To click an item watch to see when the cursor changes to indicate the item can be clicked</li>
              <li>Clicking a [name] is a request to redraw the display with that name as the subject of the display</li>
              <li>Clicking an ico changes the mode of the display</li>
              <li></li>
              <li></li>
              <li> Click the [Select] menu button or click here to open the Selector</li>
            </ul>


          </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">loadAndrenderRelations
            Select Approfile:
          </label>
<select data-role="subject-dropdown" class="w-full p-2 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500">

            <option value="">Select an approfile from clipboard...</option>
          </select>
        </div>

        <div id="relationshipsContainer" class="min-h-32">
          <div class="text-gray-500 text-center py-8">
            waiting for database or waiting for you to use [Select] module to choose what to display
          </div>
        </div>
      </div>
    </div>

        <!-- INFORMATION FEEDBACK -->
        <div class="bg-green-100 flex flex-col md:flex-row justify-center gap-4 pt-4 border-t border-gray-200 mt-6">
          <p class="text-lg font-bold">Information:</p>
          <p id="informationFeedback" data-task="information-feedback"></p>
        </div>
      </div>


    ${petitionBreadcrumbs()} 
  `;
}



function showInformation(panel, approName) {
const  informationFeedback = panel.querySelector('#informationFeedback');
if(!informationFeedback) return;
  informationFeedback.innerHTML += `<div class="my-2 p-3 bg-white border rounded shadow-sm flex items-center justify-between">
        <div>
          <div class="font-medium">${approName}</div>
          
        </div>
      </div>
    `
  }


async  function init(panel) { // called from render() 2nd function to run
    console.log('init()');

    const isMyDash = detectContext(panel);
    applyPresentationRules(panel, isMyDash);
  
    const resolvedSubject = await resolveSubject(); //this is a potentially different use of the word
    console.log('resolvedSubject',resolvedSubject, 'name' , resolvedSubject.name); // name no icon
    if(resolvedSubject.type==='relation') 
    loadFromRelations(panel, resolvedSubject.approUserId); 
    else
    loadAndrenderRelations(panel, resolvedSubject.approUserId, resolvedSubject.name);
  
    onClipboardUpdate(() => {
    checkClipboardThenNormalRender(panel);
//      loadAndrenderRelations(panel,resolvedSubject.id, subject.name);
     // if (!isMyDash) populateApprofileSelect(panel); // optional
    });
  console.log('isMyDash?',isMyDash);

  
    if (!isMyDash) {
      populateApprofileSelect(panel);
      attachDropdownListener(panel);
      attachClickItemListener(panel); //allows click on the display to change subject of display
    }
  }
    
async function checkClipboardThenNormalRender(panel){
const resolvedSubject = await resolveSubject();
      loadAndrenderRelations(panel,resolvedSubject.approUserId, resolvedSubject.name);

}


function loadFromRelations(panel, subjectId){
//needs to display the one relation referred to.
console.log('needs to display the one relation referred to');

}

async function populateApprofileSelect(panel) {

  const approfiles = getClipboardAppros();//replaced 19:45 Nov 27
  /*
  const approfiles = getClipboardItems({ type: 'app-human' })
    .concat(getClipboardItems({ type: 'app-task' }))
    .concat(getClipboardItems({ type: 'app-abstract' }));
  */
console.log('populateappro select()');

  const select = panel.querySelector('[data-role="subject-dropdown"]');
  if (!select) {currentSelection = defaultId } // previously return    changed 12:00 Oct 27
else  currentSelection = select.value;

 // Save current selection
  
  // Rebuild options
  select.innerHTML = '<option value="">Select an approfile from clipboard...</option>';
  
  approfiles.forEach(item => {
    const option = document.createElement('option');
    option.value = item.entity.id;
    option.textContent = item.entity.name;
    select.appendChild(option);
  });
  
  // Restore selection if still valid
  if (currentSelection && approfiles.some(item => item.entity.id === currentSelection)) {
    select.value = currentSelection;
  } else if (approfiles.length === 1) { //change to approLength=approfiles.length; if approLength >0 select.value = approfiles[approLength-1] //select newest entry
    // Auto-select if only one option
    select.value = approfiles[0].entity.id;
    await loadAndrenderRelations(panel, approfiles[0].entity.id, approfiles[0].entity.name);
  }
  attachDropdownListener(panel);

  return approfiles.length

}


async function loadAndrenderRelations(panel, approfileId, approfileName) { 
  console.log("loadAndrenderRelations CALLED WITH:", { approfileId, approfileName });//aprofile name no icon when called from init
// but contains the icon when called from a click on the display
 if(!approfileId) {
  const resolvedSubject = await resolveSubject(); 
  approfileId=resolvedSubject.approUserId, 
  approfileName = resolvedSubject.name; 
console.log('resolvedSubject',resolvedSubject, 'approfileNme:',approfileName);

  if(resolvedSubject.type ==='relations') {loadFromRelations(panel, resolvedSubject.id); return} // should render the one relationship but not implemented
   };


  console.log('loadAndrenderRelations approfileId()');

  try {
    const relationsOrdinary = await loadOrdinaryRelations(approfileId);
    const relationsPermissions = await loadPermissionRelations(approfileId);//should check if appro is a auth user. Don't check for permissions for abstract appros

    renderRelations(panel, relationsOrdinary, relationsPermissions, approfileName);
  } catch (error) {
    console.error('Error loading relationships:', error);
    showToast('Failed to load relationships: ' + error.message, 'error');
    renderRelations(panel, { is: [], of: [] }, approfileName);
  }
  
}

async function loadOrdinaryRelations(approfileId) {
  console.log('loadOrdinaryRelations for approfileId:', approfileId);
  
  if (!approfileId) {
    throw new Error('approfileId is required');
  }
  
  const result = await executeIfPermitted(userId, 'readApprofileRelationships', { 
    approfileId: approfileId 
  });
  
//console.log('Raw result:', result);// object { is:[] , of:[] , iconMap:{} }
  return result || { is: [], of: [], iconMap:{} };
}

async function loadPermissionRelations(approfileId) {
  console.log('loadPermissionRelations for approfileId:', approfileId);
  
  if (!approfileId) {
    throw new Error('approfileId is required');
  }
  
  const result = await executeIfPermitted(userId, 'readPermissionRelationsById', { 
    approfileId: approfileId 
  });
  
//console.log('Raw result:', result);// object { is:[] , of:[] , iconMap:{} }
  return result || { is: [], of: [], iconMap:{} };
}





function renderRelations(panel, ordinaryRelationsData, permissionsRelationsData, approfileName) {
  console.log('ordinary',ordinaryRelationsData, 'permissions',permissionsRelationsData, 'approfileNme', approfileName);
  const container = panel.querySelector('#relationshipsContainer');
  if (!container) return;

  // Handle no approfile selected
  if (ordinaryRelationsData === null || approfileName === null) {
    container.innerHTML = `
      <div class="text-gray-500 text-center py-8">
        No approfile selected. Please select an approfile.
      </div>
    `;
    //attachClickItemListener(panel); // Still attach listener for empty state
    return;
  }

  // Extract data with fallbacks
  const ordinaryIs = ordinaryRelationsData.is || [];
  const ordinaryOf = ordinaryRelationsData.of || [];
  const permissionsIs = permissionsRelationsData?.is || [];
  const permissionsOf = permissionsRelationsData?.of || [];
  const iconMap = ordinaryRelationsData.iconMap || {};

  // Check if we have any data at all
  const hasAnyData = [...ordinaryIs, ...ordinaryOf, ...permissionsIs, ...permissionsOf].length > 0;

  if (!hasAnyData) {
    container.innerHTML = `
      <div class="bg-yellow-50 border border-yellow-200 rounded p-4 text-center">
        <p class="text-yellow-800">No relationships found for this approfile.</p>
        <p class="text-gray-500 italic py-2">"${approfileName}"</p>
        <p class="text-gray-600 text-sm">(This could happen if you are not logged-in or if you have recently signed-up & not confirmed email, or if you have no permissions yet)</p>
        <p class="text-yellow-800">No one is an island; admin needs to help.</p>
      </div>
    `;
    //attachClickItemListener(panel);
    return;
  }

  // Build the complete HTML
  let html = '';

  // ORDINARY RELATIONSHIPS SECTION
  html += '<div class="mb-8 p-4 border border-gray-200 rounded-lg">';
  html += '<h3 class="text-xl font-bold mb-4 text-gray-900">Relations</h3> <i>Admin permissions are needed to change subject of map</i>';
  
  const ordinaryIsGroups = groupAndFilterRelations(ordinaryIs); // does what?
  const ordinaryOfGroups = groupAndFilterRelations(ordinaryOf);
  
  if (ordinaryIsGroups.length > 0) {
    html += `<h4 class="text-lg font-semibold mb-3 text-center text-gray-800">${approfileName} is:</h4>`;
    html += renderRelationshipGroups(ordinaryIsGroups, 'is', approfileName, iconMap);  //aprofileName = subject of display
  } else {
    html += renderEmptySection(`${approfileName} is`, 'is');
  }
  
  if (ordinaryOfGroups.length > 0) {
    html += `<h4 class="text-lg font-semibold mb-3 text-center text-gray-800">of ${approfileName}:</h4>`;
    html += renderRelationshipGroups(ordinaryOfGroups, 'of', approfileName, iconMap); //aprofileName = subject of display
  } else {
    html += renderEmptySection(`of ${approfileName}`, 'of');
  }
  html += '</div>';

// PERMISSIONS SECTION - SIMPLE FLAT LIST
  if (permissionsRelationsData && permissionsRelationsData.length > 0) {
     html += '<div class="mb-8 p-4 border border-blue-200 rounded-lg bg-blue-50">';
    html += '<h3 class="text-xl font-bold mb-4 text-blue-900">Permissions</h3>';
    
    // Treat all permissions as "is" relationships for display purposes
    const permissionGroups = groupAndFilterRelations(permissionsRelationsData);
    
    if (permissionGroups.length > 0) {
      html += `<h4 class="text-lg font-semibold mb-3 text-center text-blue-800">${approfileName} has permissions:</h4>`;
      html += renderRelationshipGroups(permissionGroups, 'is', approfileName, iconMap);
    } else {
      html += renderEmptySection(`${approfileName} has permissions`, 'is');
    }
    html += '</div>';
  }

  showInformation(panel, approfileName);
  container.innerHTML = html;

  // ATTACH CLICK LISTENERS AFTER RENDERING
  //attachClickItemListener(panel);
}



// Helper functions (same as before)
function groupAndFilterRelations(relations, isPermission = false) { //I don't understand this function
  if (!relations || relations.length === 0) return [];

  const groups = {};
  
  relations
    .filter(rel => !rel.is_deleted)
    .forEach(rel => {
      let relType = rel.relationship;
      
      if (isPermission && relType.startsWith('(]') && relType.endsWith('[)')) { //what is this?
        relType = relType.substring(2, relType.length - 2);
      }
      
      if (!groups[relType]) groups[relType] = [];
      groups[relType].push(rel);
    });

  return Object.keys(groups)
    .sort()
    .map(relType => ({
      relationship: relType,
      items: groups[relType]
    }));
}

function renderRelationshipGroups(groups, isOrOf, approName, iconMap) {//approName is subject of the display
  let html = '';
  
  groups.forEach(group => {
    html += `<div class="mb-4">`;
    html += `<div class="text-base font-bold mb-2 text-indigo-700">${group.relationship}</div>`;
    
    group.items.forEach(rel => {
/*
 // DEBUG: Log the actual relationship data
      console.log('Relationship item:', {
        isOrOf,
        subject: rel.approfile_is_name || rel.approfile_is,
        subject_id: rel.approfile_is,
        object: rel.of_approfile_name || rel.of_approfile,
        object_id: rel.of_approfile,
        relationship: rel.relationship
      });

*/
//Moved the partial deconstruction from here

        html += renderRelationshipFlow(group.relationship, rel, iconMap, isOrOf, approName); //approName is the subject of display

/*
      if (isOrOf === 'is') {
        html += renderRelationshipFlow(group.relationship, rel, iconMap, 'subject'); //is this subject or approIs ?
      } else {
//        html += renderRelationshipFlow(ofAppro, ofApproIcon, group.relationship, subject, subjectIcon, rel, 'other'); //this is wrong. Subject and ofAppro should not change order.
 html += renderRelationshipFlow(group.relationship,  rel, iconMap, 'other'); //approIs is always on the left & ofAppro on right.     
} */
    });
    
    html += '</div>';
  });
  
  return html;
}
//why is rel sent which we need to use to extract the idswhile sending all the other stuff individually?
function renderRelationshipFlow(groupRelationship, rel, iconMap, isOrOf, approName) {// but what is passed is approIs NOT approIs. 
  //  const boxClass = boxType === 'subject' ? 'flow-box-subject' : 'flow-box-other'; // the subject of the display gets special styling. Other boxes do not.
//console.log('groupRelationship', groupRelationship, 'isOrOf', isOrOf, 'approName:',approName,'rel:', rel);//boxclass seems to be a meanignless name with no actual styling
//the deconstruction of items from rel have been moved here instead of above
console.log( 'isOrOf', isOrOf, 'approName:',approName,'rel:', rel); // approname has the icon in it !
      const approIsName = rel.approfile_is_name || rel.approfile_is;
      const ofApproName = rel.of_approfile_name || rel.of_approfile;
      const approIsIcon = iconMap[rel.approfile_is] || '❔';
      const ofApproIcon = iconMap[rel.of_approfile] || '❔';
      
const approIsBgColor = (approName === approIsName) ? 'bg-green-100' : 'bg-blue-200'; // it would be better to compare ids, but we have the name, not the id
const ofApproBgColor = (approName === ofApproName) ? 'bg-green-100' : 'bg-blue-200';
// problem approName may include the icon before the approis or after the ofAppro.
// 👥 Lin Coder   or    Counts 🎭  changed the code that finds the name - now it only selects the actual name line 77?

    return `
<div class="flex justify-center items-center my-4 gap-1">
  <div class="flow-box px-5 py-3 ${approIsBgColor} border-4 border-blue-900 rounded-md font-bold text-blue-900 " //   cursor-pointer  hover:${approIsBgColor === 'bg-green-200' ? 'bg-green-300' : 'bg-blue-300'}
 
      <!-- ICON: separate element, not clickable yet --> 
    <span class="appro-icon cursor-pointer px-3 py-3 bg-yellow-100 hover:bg-yellow-300 rounded-full"
      data-clicked="icon" 
      data-content-id="${rel.approfile_is}" 
      data-content-name="${approIsName}" 
      title="Click to open task or survey ${approIsName}">
      ${approIsIcon} 
    </span>
 
      <!-- NAME: click to centre this appro & redraw display --> 
    <span class="appro-name cursor-pointer bg-gray-100 hover:bg-green-300" 
      data-clicked="name" 
      data-content-id="${rel.approfile_is}" 
      data-content-name="${approIsName}" 
      title="Click to centre on ${approIsName}"> ${approIsName} </span>
  </div>
~<=
  <div class="px-5 py-3 bg-gray-100 border-1 border-blue-900 rounded-3xl font-bold text-center italic text-indigo-700">
        ${groupRelationship}
  </div>
=>~
  <div class="flow-box px-5 py-3 ${ofApproBgColor} border-2 border-purple-700 rounded-md font-bold text-blue-900  "//cursor-pointer hover:${ofApproBgColor === 'bg-green-200' ? 'bg-green-300' : 'bg-blue-300'} 

     <!-- NAME: click to centre this appro & redraw display --> 
    <span class="appro-name cursor-pointer  bg-gray-100  hover:bg-green-300" 
      data-clicked="name" 
      data-content-id="${rel.of_approfile}" 
      data-content-name="${ofApproName}" 
      title="Click to centre on ${ofApproName}"> ${ofApproName} 
    </span>
  

     <!-- ICON: separate element, not clickable yet --> 
    <span class="appro-icon cursor-pointer px-3 py-3 bg-yellow-100 hover:bg-yellow-300 rounded-full"
      data-clicked="icon" 
      data-content-id="${rel.of_approfile}" 
      data-content-name="${ofApproName}" 
      title="Click to open task or survey ${ofApproName}" 
      data-clicked="icon"> 
      ${ofApproIcon} 
    </span>
  </div>

</div>
  `; 
   
} 
//Click the name part of the box - the selected item becomes the subject of the display. Display redrawn featuring the selected item. (Could exclude if selected is already the subject)
//Click an icon causes a change of display type.
// If a task icon is clicked - want to open the actual task in summary mode to check its details
// If a survey icon is clicked want to open the survey in summary mode to check its details.
// ALSO - the mode has now changed and the display is to show the things that the task or survey affects (what its automations do) Mode to display the automations and what things are spawned or changed.
//That is to change the display into showing action connections instead of relations between named things.
//
// Need to consider how to cope with different needs- 
//
// 1) Click icon to convert to displaying 'verb' (actions and effects) instead of the normal 'noun' of relations between appros
// 2) Clicking to read the details of a task or survey
// 3) Default mode of relations between appros
// when do we get mode 1 and when mode 2?
//Start in mode 3. Click icon to change to mode 2. 
//In mode 2 the icon click converts to mode 1

function renderEmptySection(title) {
  return `
    <div class="text-center py-4 border border-purple-900 rounded-xl mb-4 cursor-pointer" data-action="relate-approfiles-dialogue">
      <div class="text-lg font-bold text-gray-800 mb-2">${title} 🏝️</div>
      <p class="text-gray-600">No one is an island; you can use click to relate this lonely appro.</p>
    </div>
  `;
}