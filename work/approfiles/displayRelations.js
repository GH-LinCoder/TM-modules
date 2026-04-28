// ./work/approfiles/displayRelations.js
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { appState } from '../../state/appState.js';
import { onClipboardUpdate } from '../../utils/clipboardUtils.js';
import { detectMyDash, resolveSubject, myDashOrAdminDashDisplay } from '../../utils/contextSubjectHideModules.js';
import { getClipboardAppros } from './getClipboardAppros.js';

console.log('displayRelations.js (refactored) loaded');

//
// ────────────────────────────────────────────────────────────────
//   1. STATE
// ────────────────────────────────────────────────────────────────
//

const state = {
  displayMode: 'noun',
  subjectId: null,
  subjectName: null,
  subjectType: null,
  subjectHeaderId: null,      // task_header_id or survey_header_id (when applicable)

    userId: appState.query.userId //???
};

//
// ────────────────────────────────────────────────────────────────
//   2. ENTRY POINT
// ────────────────────────────────────────────────────────────────
//

export function render(panel) {
  panel.innerHTML = getTemplateHTML();
  init(panel);
}

async function init(panel) {
  const isMyDash = detectMyDash(panel);
  myDashOrAdminDashDisplay(panel, isMyDash);

  const resolved = await resolveSubject();
  state.subjectId = resolved.approUserId;
  state.subjectName = resolved.name;
  state.subjectType = resolved.type;
//console.log('resolved',resolved,'resolved.name:',resolved.name, 'resolved.type',resolved.type, 'state.subjectType',state.subjectType );

  attachTabsListeners(panel);
  if (!isMyDash) {
    populateApprofileSelect(panel);
    attachDropdownListener(panel);
    attachClickItemListener(panel);
  }

  displayByMode(panel);

  onClipboardUpdate(() => resolveSubjectAgain(panel));
}

async function resolveSubjectAgain(panel) {
  const resolved = await resolveSubject();
  state.subjectId = resolved.approUserId;
  state.subjectName = resolved.name;
  state.subjectType = resolved.type;
  displayByMode(panel);
}

//
// ────────────────────────────────────────────────────────────────
//   3. EVENT HANDLERS
// ────────────────────────────────────────────────────────────────
//

function attachTabsListeners(panel) {
  const tabs = panel.querySelectorAll('.mode-tab');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      state.displayMode = tab.dataset.mode;
      updateTabs(panel, state.displayMode);
      displayByMode(panel);
    });
  });
}

function attachDropdownListener(panel) {
  const select = panel.querySelector('[data-role="subject-dropdown"]');
  if (!select) return;

  if (select.dataset.listenerAttached === 'true') return;

  select.addEventListener('change', async e => {
    const id = e.target.value;
    const name = e.target.options[e.target.selectedIndex].textContent;
  //  const type = 'need to read from dataset'; //???????????????????????????????????????????????
    if (id) {
      state.subjectId = id;
      state.subjectName = name;
//      state.subjectType = type;  ///??????????????????????????
      displayByMode(panel);
    }
  });

  select.dataset.listenerAttached = 'true';
}

async function populateApprofileSelect(panel) {
  const approfiles = getClipboardAppros();
  const select = panel.querySelector('[data-role="subject-dropdown"]');
  if (!select) return;

  // Save current selection
  const previous = select.value;

  // Rebuild options
  select.innerHTML = '<option value="">Select an approfile from clipboard...</option>';

  approfiles.forEach(item => {
    const option = document.createElement('option');
    option.value = item.entity.id;
    option.textContent = item.entity.name;
    select.appendChild(option);
  });

  // Restore previous selection if still valid
  if (previous && approfiles.some(a => a.entity.id === previous)) {
    select.value = previous;
  } else if (approfiles.length === 1) {
    // Auto-select if only one option
    const only = approfiles[0];
    select.value = only.entity.id;
    state.subjectId = only.entity.id;
    state.subjectName = only.entity.name;
    //state.subjectType =   ?????????????????????????????????????????
    displayByMode(panel);
  }

  attachDropdownListener(panel);
}



function attachClickItemListener(panel) {
  panel.addEventListener('click', async e => {
    const flowBox = e.target.closest('[data-content-id]');
    if (!flowBox) return;

    const clickTarget = e.target.closest('[data-clicked]');
    if (!clickTarget) return;

    const clickType = clickTarget.dataset.clicked;

    if (clickType === 'name') {
      state.subjectId = flowBox.dataset.contentId;
      state.subjectName = flowBox.dataset.contentName;
      state.subjectType = flowBox.dataset.contentType;  //this has been wrong when clicking task - says app-human

//console.log('Clicked item: state.subjectId',state.subjectId,'state.subjectName',state.subjectName,'state.subjectType',state.subjectType );

      displayByMode(panel);
    }

    if (clickType === 'icon') {
      showToast('Detail view not implemented yet', 'info');
    }
  });
}

//
// ────────────────────────────────────────────────────────────────
//   4. MODE DISPATCHER
// ────────────────────────────────────────────────────────────────
//

async function displayByMode(panel) {
  console.log(`displayByMode(): ${state.displayMode}`);
const container = panel.querySelector('#relationshipsContainer'); showLoading(container);

  switch (state.displayMode) {
    case 'noun':
      return renderNoun(panel);

    case 'rule':
      return renderRules(panel);

    case 'verb':
      showToast('Verb mode not implemented yet', 'warning');
      return renderPlaceholder(panel, 'Verb mode not implemented');

    case 'work':
//      showToast('Work mode not implemented yet', 'warning');
       return renderWork(panel);

    default:
      console.warn('Unknown mode:', state.displayMode);
      return renderPlaceholder(panel, 'Unknown mode');
  }
}

//
// ────────────────────────────────────────────────────────────────
//   5. MODE RENDERERS
// ────────────────────────────────────────────────────────────────
//

async function renderNoun(panel) {
  console.log('renderNoun()');
 // const data = await loadOrdinaryRelations(state.subjectId);

  let rowsOfRelationData =null; 
 try{
  rowsOfRelationData = await executeIfPermitted(state.userId, 'readApprofileRelationships', { approfileId:state.subjectId});
}catch (error) { console.error('loadOrdinaryRelations failed:', error); throw error; // let displayByMode handle it
               }
//console.log('rowsOfRelationData',rowsOfRelationData);
const container = panel.querySelector('#relationshipsContainer');

  if (!rowsOfRelationData || (!rowsOfRelationData.is.length && !rowsOfRelationData.of.length)) {
    container.innerHTML = emptyMessage(state.subjectName);
    return;
  }
//rearrange the lists of items to be displayed so that similar items are grouped together
  const groupsIs = putNounDataIntoGroups(rowsOfRelationData.is);
  const groupsOf = putNounDataIntoGroups(rowsOfRelationData.of);

  let html = `<div class="p-4 border rounded-lg">
    <h3 class="text-xl font-bold mb-4">Relations</h3>
    <h4 class="font-semibold text-center">${state.subjectName} is:</h4>
    ${getHTMLForNounGroups(groupsIs, state.subjectName, rowsOfRelationData.iconMap)}
    <h4 class="font-semibold text-center">of ${state.subjectName}:</h4>
    ${getHTMLForNounGroups(groupsOf, state.subjectName, rowsOfRelationData.iconMap)}
  </div>`;

  container.innerHTML = html;
}

async function renderRules(panel) {
  console.log('renderRules()');
//  const data = await loadPermissionRelations(state.subjectId);// why call that function that just calls another function?

let rowsOfRelationData =null;
try {
    // Capture the RPC return object (which includes {success, is, of, iconMap})
    const result = await executeIfPermitted(state.userId, 'readPermissionRelationsById', { 
      approfileId: state.subjectId 
    });

    // 1. Check if the RPC actually succeeded
    if (result && result.success) {
      rowsOfRelationData = result; 
    } else {
      console.warn('Permission denied or RPC failed:', result?.hint);
      // Handle the "No Access" state in the UI
      const container = panel.querySelector('#relationshipsContainer');
      container.innerHTML = `<div class="p-4 text-red-500">Access Denied. ${result?.hint?.message || ''}</div>`;
      return;
    }

  } catch (error) { 
    console.error('loadPermissionRelations failed:', error); 
    throw error; 
  }

  const container = panel.querySelector('#relationshipsContainer');

  // 2. Now rowsOfRelationData is the object containing .is and .of
  if (!rowsOfRelationData || (!rowsOfRelationData.is.length && !rowsOfRelationData.of.length)) {
    container.innerHTML = emptyMessage(state.subjectName);
    return;
  }

  const groupsIs = putPermissionsDataIntoGroups(rowsOfRelationData.is);
  const groupsOf = putPermissionsDataIntoGroups(rowsOfRelationData.of);

  let html = `<div class="p-4 border rounded-lg bg-red-50">
    <h3 class="text-xl font-bold mb-4">Permissions</h3>
    <h4 class="font-semibold text-center">${state.subjectName} has permissions:</h4>
    ${getHTMLForPermissionGroups(groupsIs, state.subjectName, rowsOfRelationData.iconMap)}
    ${getHTMLForPermissionGroups(groupsOf, state.subjectName, rowsOfRelationData.iconMap)}
  </div>`;

  container.innerHTML = html;
}



//refactor of renderWork  2:40 Feb 22
async function renderWork(panel) {
  console.log('renderWork()');

  const container = panel.querySelector('#relationshipsContainer');
  showLoading(container);

  //
  // 1. Load Work‑mode data from registry
  //
  let result;
  try {
    result = await executeIfPermitted(
      state.userId,
      'readWorkRelationsById',
      { approfileId: state.subjectId }
    );
  } catch (err) {
    console.error('renderWork failed:', err);
    return showError(container, err);
  }
//console.log('renderWork() read relations',result);
  const { subject, assignments, iconMap } = result; //iconMap is not needed, but is here anyway

//console.log('subject:', subject);
//  console.log('assignments:', assignments);
//  console.log('iconMap:', iconMap);

  //
  // 2. Handle empty case
  //
  if (!assignments || assignments.length === 0) {
    container.innerHTML = emptyMessage(subject?.name || 'This item');
    return;
  }

  //
  // 3. Optional grouping: tasks vs surveys
  //
  const taskAssignments = assignments.filter(a => a.activity.type === 'app-task');
  const surveyAssignments = assignments.filter(a => a.activity.type === 'app-survey');

  //
  // 4. Build HTML
  //
  let html = `
    <div class="p-4 border rounded-lg bg-green-50">
      <h3 class="text-xl font-bold mb-4">Work Assignments</h3>
      <h4 class="font-semibold text-center mb-4">${subject.name}</h4>
  `;

  //
  // Render a section
  //
  function renderSection(title, rows) {
    if (rows.length === 0) return '';

    return `
      <h4 class="font-semibold text-center mt-6 mb-2">${title}</h4>
      ${rows.map(renderDuplet).join('')}
    `;
  }

  //
  // Render a single duplet (student — assigned to — activity)
  //
  function renderDuplet(duplet) {
    const s = duplet.student;
    const a = duplet.activity;

    return `
      <div class="flex justify-center items-center my-4 gap-2">

        <div class="flow-box px-5 py-3 bg-blue-100 border-2 border-blue-700 rounded-md font-bold text-blue-900">
          <span class="appro-icon cursor-pointer px-3 py-3 bg-yellow-100 hover:bg-yellow-300 rounded-full"
            data-clicked="icon"
            data-content-id="${s.appro_id}"
            data-content-type="${s.type}"
            data-content-name="${s.name}">
            ${s.icon}
          </span>
          <span class="appro-name cursor-pointer bg-gray-100 hover:bg-green-300"
            data-clicked="name"
            data-content-id="${s.appro_id}"
            data-content-type="${s.type}"
            data-content-name="${s.name}">
            ${s.name}
          </span>
        </div>

        <div class="px-5 py-3 bg-gray-200 border rounded-3xl font-bold italic text-indigo-700">
          assigned to
        </div>

        <div class="flow-box px-5 py-3 bg-purple-100 border-2 border-purple-700 rounded-md font-bold text-blue-900">
          <span class="appro-name cursor-pointer bg-gray-100 hover:bg-green-300"
            data-clicked="name"
            data-content-id="${a.appro_id}"
            data-content-type="${a.type}"
            data-content-name="${a.name}">
            ${a.name}
          </span>
          <span class="appro-icon cursor-pointer px-3 py-3 bg-yellow-100 hover:bg-yellow-300 rounded-full"
            data-clicked="icon"
            data-content-id="${a.appro_id}"
            data-content-type="${a.type}"
            data-content-name="${a.name}">
            ${a.icon}
          </span>
        </div>

      </div>
    `;
  }

  //
  // 5. Add grouped sections
  //
  html += renderSection('Task Assignments', taskAssignments);
  html += renderSection('Survey Assignments', surveyAssignments);

  html += `</div>`;

  container.innerHTML = html;
}







/*
async function renderWork(panel) {
  console.log('renderWorks()');
//  const rowsOfRelationData = await loadWorkRelations(state.subjectId);
let rowsOfRelationData = null;
try { console.log('loadWorkRelations() state.subjectType',state.subjectType, 'id',state.subjectId);
    rowsOfRelationData = await executeIfPermitted(state.userId, 'readWorkRelationsById', { approfileId: state.subjectId, subjectType:  state.subjectType});
    
  } catch (error) {
    console.error('loadWorkRelations failed:', error);
    throw error; // let displayByMode handle it
  }

console.log('rowsOfRelationData:',rowsOfRelationData);

  const container = panel.querySelector('#relationshipsContainer');

  if (!rowsOfRelationData || (!rowsOfRelationData.is.length && !rowsOfRelationData.of.length)) {
    container.innerHTML = emptyMessage(state.subjectName);
    return;
  }

  const groupsIs = putWorkDataIntoGroups(rowsOfRelationData.is);
  const groupsOf = putWorkDataIntoGroups(rowsOfRelationData.of);
console.log('groupIs',groupsIs,'groupOf',groupsOf, 'rowsOfRelationData',rowsOfRelationData);

let html = `<div class="p-4 border rounded-lg bg-green-50">
    <h3 class="text-xl font-bold mb-4">Work Assignments</h3>

    <h4 class="font-semibold text-center">${state.subjectName} is assigned to:</h4> 
    ${getHTMLForNounGroups(groupsIs, state.subjectName, rowsOfRelationData.iconMap)} <!--//needs tyoe //the icon displays//Why use different words 'is assigned' / 'Assigned to' ????--> 
    <h4 class="font-semibold text-center">Assigned to ${state.subjectName}:</h4> <!--// something else is assigned to the subject of the display-->
    ${getHTMLForNounGroups(groupsOf, state.subjectName, rowsOfRelationData.iconMap)} <!-- //needs type // there is no iconMap -->
  </div>`;

  container.innerHTML = html;
}
*/

function renderPlaceholder(panel, text) {
  panel.querySelector('#relationshipsContainer').innerHTML = `
    <div class="text-center text-gray-500 py-8">${text}</div>
  `;
}

//
// ────────────────────────────────────────────────────────────────
//   6. DATA LOADERS  - irrelevant diversion. Dlete this section
// ────────────────────────────────────────────────────────────────
//
/*
async function loadOrdinaryRelations(id) {
    try{
  return executeIfPermitted(state.userId, 'readApprofileRelationships', { approfileId: id });
}catch (error) { console.error('loadOrdinaryRelations failed:', error); throw error; // let displayByMode handle it
               }
}
async function loadPermissionRelations(id) {
    try{
  return executeIfPermitted(state.userId, 'readPermissionRelationsById', { approfileId: id });
}catch (error) { console.error('loadPermissionRelations failed:', error); throw error; // let displayByMode handle it
               }
}

async function loadWorkRelations(id) {//why does this function exist? it just calls another function and returns the return. Why not call that function directly?
  try { console.log('loadWorkRelations() state.subjectType',state.subjectType, 'id',id);
    return executeIfPermitted(state.userId, 'readWorkRelationsById', { approfileId: id, subjectType:  state.subjectType});
    
  } catch (error) {
    console.error('loadWorkRelations failed:', error);
    throw error; // let displayByMode handle it
  }
}

async function loadVerbRelations(id) {
  try {
    return await executeIfPermitted(); //add function when ready
  } catch (error) {
    console.error('loadVerbRelations failed:', error);
    throw error; // let displayByMode handle it
  }
}
*/

//
// ────────────────────────────────────────────────────────────────
//   7. SHARED RENDERING UTILITIES
// ────────────────────────────────────────────────────────────────
//

function updateTabs(panel, mode) {
  const tabs = panel.querySelectorAll('.mode-tab');

  tabs.forEach(tab => {
    const m = tab.dataset.mode;

    tab.classList.remove('bg-white', 'font-bold', 'border', 'border-gray-300', 'border-b-0');
    tab.classList.add('bg-gray-100', 'text-gray-600', 'hover:bg-gray-200');

    if (m === mode) {
      tab.classList.remove('bg-gray-100', 'text-gray-600', 'hover:bg-gray-200');
      tab.classList.add('bg-white', 'font-bold', 'border', 'border-gray-300', 'border-b-0');
    }
  });
}

function putNounDataIntoGroups(relations) {
  if (!relations) return [];
  const groups = {};

  relations.forEach(rel => {
    if (rel.is_deleted) return;
    const type = rel.relationship;
    if (!groups[type]) groups[type] = [];
    groups[type].push(rel);
  });

  return Object.keys(groups).sort().map(type => ({
    relationship: type,
    items: groups[type]
  }));
}


function putWorkDataIntoGroups(relations) {
  if (!relations) return [];
  const groups = {};

  relations.forEach(rel => {
    if (rel.is_deleted) return;
    const type = rel.relationship;
    if (!groups[type]) groups[type] = [];
    groups[type].push(rel);
  });

  return Object.keys(groups).sort().map(type => ({
    relationship: type,
    items: groups[type]
  }));
}






function putPermissionsDataIntoGroups(perms) {
  if (!perms) return [];
  const groups = {};

  perms.forEach(rel => {
    if (rel.is_deleted) return;

    const cat = rel.category;

    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(rel);
  });

  return Object.keys(groups).sort().map(cat => ({
    category: cat,
    items: groups[cat]
  }));
}

function getHTMLForNounGroups(groups, subjectName, iconMap) { //needs to render the type
  return groups.map(group => `
    <div class="mb-4">
      <div class="font-bold text-indigo-700">${group.relationship}</div>
      ${group.items.map(rel => renderRelationshipFlow(rel, subjectName, iconMap)).join('')}
    </div>
  `).join('');
}

function getHTMLForPermissionGroups(groups, subjectName, iconMap) {
  return groups.map(group => `
    <div class="mb-4">
      <div class="font-bold text-indigo-700">${group.category}</div>
      ${group.items.map(rel => renderRelationshipFlow(rel, subjectName, iconMap)).join('')}
    </div>
  `).join('');
}

function renderRelationshipFlow(rel, subjectName, iconMap) { //rel needs to have the type in it. Does it? NO, it doesn't.

  console.log('renderRelationshipFlow()');
 // console.log('Left ID:', rel.approfile_is, 'Right ID:', rel.of_approfile);

  const leftName = rel.approfile_is_name || rel.approfile_is;
  const rightName = rel.of_approfile_name || rel.of_approfile;

  const leftType = rel.approfile_is_type || 'app-human'; //likely to be app-human but not certain Why default to something wrong?
  const rightType = rel.of_approfile_type || 'app-human'; //?? why default to app-human?

  const leftIcon = iconMap?.[rel.approfile_is] || '❔';
  const rightIcon = iconMap?.[rel.of_approfile] || '❔';

  const leftBg = leftName === subjectName ? 'bg-green-100' : 'bg-blue-200';
  const rightBg = rightName === subjectName ? 'bg-green-100' : 'bg-blue-200';

  return `
    <div class="flex justify-center items-center my-4 gap-1">
      <div class="flow-box px-5 py-3 ${leftBg} border-4 border-blue-900 rounded-md font-bold text-blue-900">
        <span class="appro-icon cursor-pointer px-3 py-3 bg-yellow-100 hover:bg-yellow-300 rounded-full"
          data-clicked="icon" data-content-id="${rel.approfile_is}" data-content-name="${leftName}" data-content-type="${leftType}">
          ${leftIcon}
        </span>
        <span class="appro-name cursor-pointer bg-gray-100 hover:bg-green-300"
          data-clicked="name" data-content-id="${rel.approfile_is}" data-content-name="${leftName}" data-content-type="${leftType}">
          ${leftName}
        </span>
      </div>

      <div class="px-5 py-3 bg-gray-200 border rounded-3xl font-bold italic text-indigo-700">
        ${rel.relationship}
      </div>

      <div class="flow-box px-5 py-3 ${rightBg} border-2 border-purple-700 rounded-md font-bold text-blue-900">
        <span class="appro-name cursor-pointer bg-gray-100 hover:bg-green-300"
          data-clicked="name" data-content-id="${rel.of_approfile}" data-content-name="${rightName}" data-content-type="${rightType}">
          ${rightName}
        </span>
        <span class="appro-icon cursor-pointer px-3 py-3 bg-yellow-100 hover:bg-yellow-300 rounded-full"
          data-clicked="icon" data-content-id="${rel.of_approfile}" data-content-name="${rightName}" data-content-type="${rightType}">
          ${rightIcon}
        </span>
      </div>
    </div>
  `;
}

function emptyMessage(name) {
  return `
    <div class="bg-yellow-50 border border-yellow-200 rounded p-4 text-center">
      <p class="text-yellow-800">No relationships found for "${name}".</p>
    </div>
  `;
}

function showLoading(container) {
  container.innerHTML = `
    <div class="text-center py-8 text-gray-500 italic">
      Loading…
    </div>
  `;
}

function showError(container, error) {
  container.innerHTML = `
    <div class="bg-red-50 border border-red-200 text-red-800 p-4 rounded">
      <p class="font-bold">Error loading data</p>
      <p class="text-sm">${error.message}</p>
    </div>
  `;
}


//
// ────────────────────────────────────────────────────────────────
//   8. TEMPLATE
// ────────────────────────────────────────────────────────────────
//

function getTemplateHTML() {
  return `
    <div class="edit-task-dialogue flex flex-col h-full">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">

        <div class="p-6 border-b flex justify-between items-center">
          <h3 class="text-xl font-semibold">Display Relations</h3>
          <button data-action="close-dialog" class="text-gray-500 hover:text-gray-700">✖</button>
        </div>

        <div class="p-4">
          ${renderTabs('noun')}
        </div>

        <div class="p-4">
          <label class="block text-sm font-medium mb-2">Select Approfile:</label>
          <select data-role="subject-dropdown" class="w-full p-2 border rounded">
            <option value="">Select an approfile from clipboard...</option>
          </select>
        </div>

        <div id="relationshipsContainer" class="min-h-32 p-4 text-center text-gray-500">
          Waiting for data…
        </div>

      </div>
    </div>
  `;
}

function renderTabs(activeMode) {
  const modes = [
    { id: 'noun', label: 'Noun' },
    { id: 'verb', label: 'Verb' },
    { id: 'work', label: 'Work' },
    { id: 'rule', label: 'Rule' }
  ];

  return `
    <div class="mode-tabs flex gap-2 border-b pb-2">
      ${modes.map(m => `
        <button class="mode-tab px-4 py-2 rounded-t-md ${m.id === activeMode
          ? 'bg-white font-bold border border-gray-300 border-b-0'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
          data-mode="${m.id}">
          ${m.label}
        </button>
      `).join('')}
    </div>
  `;
}