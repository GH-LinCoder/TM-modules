// work/relate/relateApprofiles.js
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { appState } from '../../state/appState.js';
import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';
import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';

import {getClipboardAppros} from './getClipboardAppros.js';

const userId = appState.query.userId;
let relationType ='ordinary';//could be permission
let ApproIsType = 'ordinary'; //could be a bundle (ordinary ={human, task, survey, abstract}) Not sure if this matters
let title = null;
let category = null;

let permissionTuplet ={ //this is built and changed as the user selects items from the dropdowns. It is then used on click of submit
approIsId:null,
approIsName: null,
relationshipName: null,
relationshipType:null,
ofApproId:null,
ofApproName: null
}



let permissionsFromBundle = null;
let numberOfPermissions = null;

let informationFeedback = null;

console.log('🔥 relateApprofiles.js: START');


export function grantBundlePermissions(panel){
  console.log('grantBundlePermission()')
relationType='permission';
category = 'bundle';
renderPermissions(panel,{}, 'permission');
}


//put permissions in the BUNDLE
export function relateBundleToPermissions(panel, bundleData){
  console.log('relateBundleToPermissions', bundleData);
 // title = 'Put permissions in the Bundle';
//  const titleEl=panel.querySelector('[data-title="relate-title"]');

  ApproIsType = 'bundle'; // an appro that reprsents a bundle of permissions uses a special syntax in names. This is forced and cannot be user edited
  relationType='permission';
  //prefix = '(]BUNDLE:'; // prefix and suffix will encase the user input name of the bundle
 //suffix ='[)';

 //console.log('relationType',relationType);
  renderPermissions(panel,{}, 'permission');
}

//PERMISSIONS
export function renderPermissions(panel,query={}){
  relationType='permission';
  console.log('renderPermissions(relationType)', relationType);
//over write the default title 
  if (ApproIsType === 'bundle')  title = 'Put permissions in the Bundle';
  else title = 'Grant Permission';



  panel.innerHTML = getTemplateHTML();
  const dialog = panel.querySelector('[data-form="relateDialog"]');
  const form = panel.querySelector('[data-form="relateForm"]');
  const approfile1Select = panel.querySelector('[data-form="approfile1Select"]');
  const approfile2Select = panel.querySelector('[data-form="approfile2Select"]');
  const relationshipSelect = panel.querySelector('[data-form="relationshipSelect"]');
  const relateBtn = panel.querySelector('[data-form="relateBtn"]');
   informationFeedback = panel.querySelector('[data-task="information-feedback-relate"]');

if (informationFeedback) {
      informationFeedback.innerHTML += `<div class="p-1 text-sm bg-purple-50 border border-purple-200 rounded">
      Title: ${title}  Type:${ApproIsType}</div>`;
    }

  const titleEl = panel.querySelector('[data-form="relateTitle"]');
console.log('titleEl',titleEl);
  if(titleEl) titleEl.innerHTML = title;



  init(panel, {
    dialog,
    form,
    approfile1Select,
    approfile2Select,
    relationshipSelect,
    relateBtn,
    informationFeedback,
    relationType
  });  
}

//ALL other appro relations
export function render(panel, query = {}) {
   //console.log('relationType',relationType);
  console.log('document', document);
  console.log('relateApprofiles.js render() called');
  panel.innerHTML = getTemplateHTML();
/*  
let sourceTable=null;
if(relationType === 'permissionRelation') sourceTable = 'permission_relationships';
else if (relationType === 'ordinaryRelation') sourceTable ='relationships'; 
else {console.log('relationType unknown', relationType) }
*/
  // DOM elements
  const dialog = panel.querySelector('[data-form="relateDialog"]');
  const form = panel.querySelector('[data-form="relateForm"]');
  const approfile1Select = panel.querySelector('[data-form="approfile1Select"]');
  const approfile2Select = panel.querySelector('[data-form="approfile2Select"]');
  const relationshipSelect = panel.querySelector('[data-form="relationshipSelect"]');
  const relateBtn = panel.querySelector('[data-form="relateBtn"]');
if(!informationFeedback) informationFeedback = panel.querySelector('[data-task="information-feedback-relate"]');

  init(panel, {
    dialog,
    form,
    approfile1Select,
    approfile2Select,
    relationshipSelect,
    relateBtn,
    informationFeedback,
    relationType
  });
     //     panel.innerHTML+=petitionBreadcrumbs();//this reads 'petition' and prints the values at bottom of the render panel
}

function getTemplateHTML() {
  return `
    <div id="relateDialog" data-form="relateDialog" class="relate-dialog   flex flex-col h-full">
    <!-- INSTRUCTIONS -->
        <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p class="text-sm text-blue-800">
            <strong>How to use:</strong><br>
            1. Uses the [Select] menu to select which appros to relate<br>
            2. The names will appear in the dropdowns in this module.<br>
            3. Choose one in each dropdown.<br>
            4. Choose the relationship or permission in the middle dropdown.<br>
            5. The button will become enabled when you have chosen enough items.<br> 
            6. The button shows what you are about to write to the database.<br>
            7. Read it. If correct Click the button to store it.<br>
            8. IMPORTANT: To relate tasks or surveys make sure you have selected the appro for the task, and not the actual task or survey.
            Only appros can be related. (Tasks & surveys can be assigned but not related. Sorry, it is confusing)
          </p>
        </div>  
    
    <div class="bg-white rounded-lg shadow-lg w-auto max-w-4xl mx-4 z-10 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900" data-form="relateTitle">Relate Appros 🖇️</h3>
            <p class="text-sm text-gray-600">Create a relationship between two approfiles</p>
            <button class="text-gray-500 hover:text-gray-700" data-action="close-dialog" aria-label="Close">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        <div class="p-6 space-y-6">
          <div class="space-y-2">
            <label for="approfile1Select" class="block text-sm font-medium text-gray-700">Select First Approfile</label>
            <select id="approfile1Select" data-form="approfile1Select" class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500" required>
              <option value="">Select an approfile</option>
            </select>
          </div>
          <div class="space-y-2">
            <label for="relationshipSelect" class="block text-sm font-medium text-gray-700">Select Relationship</label>
            <select id="relationshipSelect" data-form="relationshipSelect" class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500" required>
              <option value="">Select a relationship</option>
            </select>
          </div>
          <div class="space-y-2">
            <label for="approfile2Select" class="block text-sm font-medium text-gray-700">Select Second Approfile</label>
            <select id="approfile2Select" data-form="approfile2Select" class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500" required>
              <option value="">Select an approfile</option>
            </select>
          </div>
          <div class="text-sm text-gray-500 space-y-2 p-3 bg-gray-50 rounded-lg">
            <p>Create a semantic relationship between two approfiles (people, tasks, groups).</p>
            <p>📋 Items from your clipboard will appear in dropdowns with "(clipboard)" label.</p>
            <p>Example: "John" → "member" → "Project Team"</p>
          </div>
          <button type="submit" id="relateBtn" data-form="relateBtn" 
            class="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled>
            Waiting for selections from the dropdowns...
          </button>
        </div>
        <div class="bg-green-100 flex flex-col md:flex-row justify-center gap-4 pt-4 border-t border-gray-200">
          <p class="text-lg font-bold">Information:</p>
          <p data-task="information-feedback-relate"></p>
        </div>
      </div>
    </div>
       ${petitionBreadcrumbs()} 
  `;
}


function init(panel, elements) {
  const { dialog, form, approfile1Select, approfile2Select, relationshipSelect, relateBtn, informationFeedback, relationType } = elements;
  
  console.log('relateApprofiles.js init() relationType',relationType);
  
  // Close dialog
  dialog.querySelectorAll('[data-action="close-dialog"]').forEach(el => {
    el.addEventListener('click', () => {
      if (panel.parentElement) {
        panel.parentElement.removeChild(panel);
      }
    });
  });

  // submit Button click
  relateBtn.addEventListener('click', (e) => handleRelate(e, {
    approfile1Select,
    approfile2Select,
    relationshipSelect,
    relateBtn,
    informationFeedback,
    relationType
  }));  // relationType determines if permissions or ordinary. removed ,relationType. I don't think this is ever set in the button. It's a global

  // Check if dealing with a BUNDLE & Update button state on change
  approfile1Select.addEventListener('change',async (e) => {await checkHandleApproIsBundle(e.target.selectedOptions[0],relateBtn, panel); 
    updateSubmitButtonState({
    approfile1Select,
    approfile2Select,
    relationshipSelect,
    relateBtn
  })
  }
);

  // when a selection is made - check if the selected permission is a BUNDLE
  relationshipSelect.addEventListener('change', async (e) => { await checkHandleRelationshipBundle(e.target.selectedOptions[0],relateBtn, panel); 
    updateSubmitButtonState({ 
    approfile1Select,
    approfile2Select,
    relationshipSelect,
    relateBtn
  })
  }
);

  approfile2Select.addEventListener('change', async(e) => {await checkHandleOfApproBundle(e.target.selectedOptions[0],relateBtn, panel);
    updateSubmitButtonState({
    approfile1Select,
    approfile2Select,
    relationshipSelect,
    relateBtn
  })
}
);


  // Load relationships
  populateRelationshipsDropdown(relationshipSelect, relationType);
   //console.log('relationType',relationType);
  // Clipboard integration
  populateFromClipboard({
    approfile1Select,
    approfile2Select,
    informationFeedback
  });
   //console.log('relationType',relationType);
  onClipboardUpdate(() => {
    populateFromClipboard({
      approfile1Select,
      approfile2Select,
      informationFeedback
    });
  });
   //console.log('relationType',relationType);
}

/**
 * 
 * let permissionTuplet ={
 * approIsId:null,
 *approIsName: null,
 *relationshipName: null,
 *ofApproId:null,
 *ofApproName: null}
 */


async function checkHandleApproIsBundle(selected,relateBtn, panel){ //why do anything special when applying permission to a bundle??
  console.log('checkHandleApproIsBundle');
   //console.log('relationType',relationType);
const approIsId = selected.value;
const approIsName = selected.textContent.replace(' (clipboard)', '');

console.log('approIsId', approIsId, 'approIsName',approIsName);
if (informationFeedback) {
      informationFeedback.innerHTML += `<div class="p-1 text-sm bg-purple-50 border border-purple-200 rounded">
      Want to grant permissions to:${approIsName} whose appro id is: [ ${approIsId} ]</div>`;
    }
permissionTuplet.approIsId = approIsId;
permissionTuplet.approIsName = approIsName;
console.log('tuplet:',permissionTuplet);
}



async function checkHandleRelationshipBundle(selected,relateBtn, panel){//this is the selection.option
 //console.log('relationType',relationType); //ordinary !!
 category = selected.dataset.category;
const id = selected.dataset.id;
const relationshipName = selected.value;
console.log('handleBundle()',selected, 'relationshipName',relationshipName, 'category', category, 'id', id);
//what is that id??? f8ccb6ca-22bb-4ee7-b3dc-a17cb2d6d2e5 . What table is this from ??
//id is the id of the relationship It isn't the id of the budnle appro

//const informationFeedback = panel.querySelector('[data-task="information-feedback"]');  
  if (informationFeedback) {
      informationFeedback.innerHTML += `<div class="p-1 text-sm bg-purple-50 border border-purple-200 rounded">
      Selected permission:${relationshipName} Recognised as category: [ ${category} ] with appro id:${id}</div>`;
    }
if(category==='bundle') {await extractBundleContents(category, relationshipName, id, panel); permissionTuplet.relationshipType = category}

permissionTuplet.relationshipName = relationshipName;

}


async function checkHandleOfApproBundle(selected,relateBtn, panel){
  console.log('checkHandleOfApproBundle');
   //console.log('relationType',relationType);
const ofApproId = selected.value;
const ofApproName = selected.textContent.replace(' (clipboard)', '');

console.log('ofApproId', ofApproId, 'ofApproName',ofApproName);
if (informationFeedback) {
      informationFeedback.innerHTML += `<div class="p-1 text-sm bg-purple-50 border border-purple-200 rounded">
      Want to grant permissions with scope :${ofApproName} which has appro id of: [ ${ofApproId} ]</div>`;
    }
permissionTuplet.ofApproId = ofApproId;
permissionTuplet.ofApproName = ofApproName; 
console.log('tuplet:',permissionTuplet);
}


async function extractBundleContents(category, value, id, panel){
if (category != 'bundle' || !id) {console.log("category or id error"); return; }
 //console.log('relationType',relationType);
//read the permission_relations db to find any entries for this bundle by appro_is id
try {     //registry needs: const { approfileId } = payload;
      permissionsFromBundle = await executeIfPermitted(userId, 'readPermissionRelationsById', {approfileId:id}); // 
console.log('permissionsFromBundle', permissionsFromBundle, 'for bundle_id:',id);// that function returns an object
//{is: isRels.data || [], of: ofRels.data || [], iconMap:profileMap }; // empty arrays 15:40 April 1 because appro_is id not id of the relation

      numberOfPermissions = permissionsFromBundle.is.length;
//const informationFeedback = panel.querySelector('[data-task="information-feedback"]');  
  if (informationFeedback) {
      informationFeedback.innerHTML += `<div class="p-1 text-sm bg-purple-50 border border-purple-200 rounded">
      <p>The bundle :${value} contains ${numberOfPermissions} permissions.  Recognised as category: [ ${category} ] with appro id:${id}</p>
      <p>Containing these permissions:</p></div>`;
    
    }
permissionsFromBundle.is.forEach((p) => 
informationFeedback.innerHTML += `<div class="p-1 text-sm bg-purple-50 border border-purple-200 rounded">
 ${p.approfile_is_name} permission ${p.relationship} with scope: ${p.of_approfile_name} </div>`);

    } catch (error) {
  console.error('Failed to load permissions:', error);
//  console.log('');
} 
}





async function populateRelationshipsDropdown(relationshipSelect, relationType) {
      console.log('populateRelationshipsDropdown relationType:', relationType);//permission

    try { let relationships = []
    
    if(relationType === 'ordinary') relationships = await executeIfPermitted(userId, 'readRelationships');
    else if(relationType === 'permission') relationships = await executeIfPermitted(userId, 'readPermissionRelationships');
    else {
      console.log('relationType unknown', relationType);
      throw new Error('Unknown relation type: ' + relationType);
    }
    if (!relationships || relationships.length === 0) {
      throw new Error('No relationships found');
    }
console.log('relationshipsArray.', relationships);  // bundle_id null or uuid  category= 'bundle'
    relationshipSelect.innerHTML = '<option value="" disabled selected>Select relationship</option>';
    //console.log("relateApprofiles document=", document);//thhis is the button 'click to store'
    relationships.forEach(rel => {
//      console.log('rel.category', rel.category); //correct
      const option = document.createElement('option');
      option.value = rel.name;
      option.textContent = rel.name;
      option.dataset.category =rel.category; // added 14:48 April 1
      option.dataset.id = rel.bundle_id; // added 14:48 April 1 but that is the id of the row in relationships. Not the bundle appro id
      relationshipSelect.appendChild(option);
      //console.log('dataset.category',option.dataset.category ); //correct
    });
    
  } catch (error) {
    console.error('Error populating relationships dropdown:', error);
    showToast('Failed to load relationships', 'error');
  }
/*
  const informationFeedback = panel.querySelector('[data-task="information-feedback"]');  
  if (informationFeedback) {
      informationFeedback.innerHTML += `<div class="p-1 text-sm bg-purple-50 border border-purple-200 rounded">
      Relationships loaded. Type:${relationType}</div>`;
    }
*/  //need panel
 //console.log('relationType',relationType);
}
/*
function getClipboardAppros(){
  const allAppros = getClipboardItems({ type: 'app-human' })
  .concat(getClipboardItems({ type: 'app-task' }))
  .concat(getClipboardItems({ type: 'app-abstract' }))
  .concat(getClipboardItems({ type: 'app-survey' })) 
  .concat(getClipboardItems({ type: 'app-task' }))
return allAppros;
} */


function populateFromClipboard({ approfile1Select, approfile2Select, informationFeedback }) {
  //this function has odd rules about what it autofills
  console.log('populateFromClipboard()');
   //console.log('relationType',relationType);
  const approfiles =getClipboardAppros(); //moved to separate function

  // Get all approfile types
/*
  const approfiles = getClipboardItems({ type: 'app-human' })
    .concat(getClipboardItems({ type: 'app-task' }))
    .concat(getClipboardItems({ type: 'app-abstract' }))
    .concat(getClipboardItems({ type: 'app-survey' })) 
    .concat(getClipboardItems({ type: 'app-task' }))
 ; */ //added surveys and tasks 18:57 Nov 27 2025
  
  // Auto-fill if exactly two items and fields are empty
  if (approfiles.length === 2 && !approfile1Select.value && !approfile2Select.value) {
    approfile1Select.value = approfiles[0].entity.id;
    approfile2Select.value = approfiles[1].entity.id;
    if (informationFeedback) {
      informationFeedback.innerHTML += `<div class="p-1 text-sm bg-purple-50 border border-purple-200 rounded">
      Auto-filled from clipboard</div>`;
    }
//console.log('autofill',approfiles[0].entity);



  }
  
  // Add to dropdowns
  addClipboardItemsToDropdown(approfiles, approfile1Select);
  addClipboardItemsToDropdown(approfiles, approfile2Select);

 if(approfile1Select.value)    {
      informationFeedback.innerHTML += `<div class="p-1 text-sm bg-purple-50 border border-purple-200 rounded">
      Want to grant permissions to:${approfiles[0].entity.name} whose appro id is: [ ${approfile1Select.value} ]</div>`;
permissionTuplet.approIsId = approfile1Select.value;
permissionTuplet.approIsName = approfiles[0].entity.name;
console.log('tuplet:',permissionTuplet);

    } 

  updateSubmitButtonState({
    approfile1Select,
    approfile2Select,
    relationshipSelect: document.querySelector('[data-form="relationshipSelect"]'),
    relateBtn: document.querySelector('[data-form="relateBtn"]')
  });
   //console.log('relationType',relationType);
}

function addClipboardItemsToDropdown(items, selectElement) {
  if (!items || items.length === 0 || !selectElement) return;
   //console.log('relationType',relationType);
  items.forEach(item => {
    const existingOption = Array.from(selectElement.options).find(opt => opt.value === item.entity.id);
    if (!existingOption) {
      const option = document.createElement('option');
      option.value = item.entity.id;
      option.textContent = `${item.entity.name} (clipboard)`;
      option.dataset.source = 'clipboard';
      selectElement.appendChild(option);
    }
  });
}

function updateSubmitButtonState({ approfile1Select, approfile2Select, relationshipSelect, relateBtn }) {
  console.log('updateSubmitButtonState()');
  
  const approfile1Selected = approfile1Select?.value !== '';
  const relationshipSelected = relationshipSelect?.value !== '';
  const approfile2Selected = approfile2Select?.value !== '';


 //console.log('relationType',relationType); // how is it always ordinary?  when line 362 'permission' ?

//could contain check if the selected values are the same as the passed values. If so disable button & text displayed to 'waiting for change'


//normally all three dropdowns have to be selected. But if the relationship is a bundle of permissions we can use the bundle scope so the ofAppro does not haave to be selected
let selectionComplete = (approfile1Selected && relationshipSelected && (approfile2Selected || permissionTuplet.relationshipType === 'bundle')   );

//BUTTON enable / disable
if (relateBtn) {
        console.log('permissionTuplet.relationshipType',permissionTuplet.relationshipType); //if 'bundle' don't need scope, will use bundle scope
    
    relateBtn.disabled = !selectionComplete;
    //    relateBtn.disabled = !(approfile1Selected && relationshipSelected && (approfile2Selected || permissionTuplet.relationshipType === 'bundle')   );



//BUTTON Text displayed - inform user what is selected

const approIsName = permissionTuplet.approIsName || ' (Please select the first dropdown) ';
const relationshipName = permissionTuplet.relationshipName || ' (Please select middle dropdown) ';

let ofApproName = permissionTuplet.ofApproName;
if(!ofApproName || approfile2Select.value === '') //this could check the text but something intrinsic is better
  if(category==='bundle') ofApproName = ' default BUNDLE scope '; else ofApproName = ' (Please select last dropdown) ';

const someDropdownsSelected = (approfile1Selected || approfile2Selected || relationshipSelected );

    if (someDropdownsSelected) 
    {//show text when any of the three dropdowns are selected
     if (relationType === 'ordinary')
     relateBtn.textContent = 'Relate: ' + approIsName + ' is ' + relationshipName + ' of '+ ofApproName;
else if (relationType === 'permission')     
     relateBtn.textContent = 'Grant: ' + approIsName + ' permission: ' + relationshipName + ' with scope: '+ ofApproName;
    }
  } //       relateBtn.textContent = 'Create: ' + permissionTuplet.approIsName + ' permitted: ' + permissionTuplet.relationshipName + ' with scope: '+ permissionTuplet.ofApproName;
}

async function handleRelate(e, { approfile1Select, approfile2Select, relationshipSelect, relateBtn, informationFeedback, relationType }) {
  e.preventDefault();
  console.log('handleRelate()');
 //console.log('relationType',relationType);
  relateBtn.disabled = true;
/* 
permissionTuplet ={ //this is built and changed as the user selects items from the dropdowns. It is then used on click of submit
approIsId:null,
approIsName: null,
relationshipName: null,
relationshipType:null,
ofApproId:null,
ofApproName: null
}
*/

 try {
    relateBtn.textContent = 'Creating relationship...'; //needs different for different types
    
if(relationType ==='ordinary'){

    const newRelation = await executeIfPermitted(userId, 'createApprofileRelation', {
      approfile_is:permissionTuplet.approIsId,
      relationship:permissionTuplet.relationshipName,
      of_approfile:permissionTuplet.ofApproId

    });
}
 else if(relationType ==='permission' && permissionTuplet.relationshipType != 'bundle'){
      const newRelation = await executeIfPermitted(userId, 'createPermissionRelation', {
      approfile_is:permissionTuplet.approIsId,
      relationship:permissionTuplet.relationshipName,
      of_approfile:permissionTuplet.ofApproId

    }); }
else if (relationType ==='permission' && permissionTuplet.relationshipType === 'bundle'){
    //need to map the bundle array substituting the user id in place of the bundle id
// and if permissionTuplet.ofApproId !=null then also map the ofAppro (scope) into the array
//then write that array to the permission_relations table by calling executeIfPermitted 
// with the name of a new registry function that handles array write
console.log('bundle permissionsFromBundle',permissionsFromBundle);
    // 3. Transform to user-grant format
 let  permissionsToGrant = permissionsFromBundle.is.map(permBund => ({
      approfile_is: permissionTuplet.approIsId,              // ← User receiving permission
      relationship: permBund.relationship,   // e.g., '(]insertNote_INSERT[)'
      of_approfile: permissionTuplet.ofApproId || permBund.of_approfile,          // ← Scope from grant screen (override)
    assigned_from_bundle: permBund.approfile_is
    }));
console.log('permissionsToGrant', permissionsToGrant); //looks okay 14:03 Apr 2

      informationFeedback.innerHTML += `<div class="p-1 text-sm bg-purple-50 border border-purple-200 rounded">
         Remapping the bundle ${permissionTuplet.relationshipName} to apply it to ${permissionTuplet.approIsName}
     </div>`;

const bundleGranted = await executeIfPermitted(userId, 'grantBundlePermissions', {permissionsToGrant});
 
console.log('bundleGranted',bundleGranted);

 if (bundleGranted) showToast('Bundle granted successfully!', 'success', 5000);


}

    relateBtn.textContent = 'Relation created! - create another or close'; // possible change message by type
    showToast('Relation created successfully!', 'success', 1000);
    
    // Clear selections for next relationship// this makes it harder to do another similar relation
 //   approfile1Select.value = '';
  //  approfile2Select.value = '';
  //  relationshipSelect.value = '';
    
    updateSubmitButtonState({
      approfile1Select,
      approfile2Select,
      relationshipSelect,
      relateBtn
    });
    
  } catch (error) {
    console.error('Failed :', error);
    showToast('Failed to create relation: ' + error.message, 'error');
    relateBtn.disabled = false;
    relateBtn.textContent = 'Change something to be able to do another...';
  }  //console.log('relationType',relationType);
}





async function OLDhandleRelate(e, { approfile1Select, approfile2Select, relationshipSelect, relateBtn, informationFeedback, relationType }) {
  e.preventDefault();
  console.log('handleRelate()');
 //console.log('relationType',relationType);
  relateBtn.disabled = true;
// bundle era not going to use these. We have all the data in permissionTuplet
  const approfile_is = approfile1Select.value;
  const of_approfile = approfile2Select.value;
  const relationship = relationshipSelect.value;

  if (!approfile_is || !of_approfile || !relationship) { // redundant
    showToast('Please select both approfiles and a relationship', 'error');
    relateBtn.disabled = false;
    return;
  }

  try {
    relateBtn.textContent = 'Creating relationship...'; //needs different for different types
    
if(relationType ==='ordinary'){

    const newRelation = await executeIfPermitted(userId, 'createApprofileRelation', {
      approfile_is,
      of_approfile,
      relationship
    });
}
 else if(relationType ==='permission'){
      const newRelation = await executeIfPermitted(userId, 'createPermissionRelation', {
      approfile_is,
      of_approfile,
      relationship
    });
 }



    relateBtn.textContent = 'Relationship created! - create another or close';
    showToast('Relationship created successfully!', 'success');
    
    // Clear selections for next relationship// this makes it harder to do another similar relation
 //   approfile1Select.value = '';
  //  approfile2Select.value = '';
  //  relationshipSelect.value = '';
    
    updateSubmitButtonState({
      approfile1Select,
      approfile2Select,
      relationshipSelect,
      relateBtn
    });
    
  } catch (error) {
    console.error('Failed :', error);
    showToast('Failed to create relationship: ' + error.message, 'error');
    relateBtn.disabled = false;
    relateBtn.textContent = 'Create Relationship';
  }  //console.log('relationType',relationType);
}