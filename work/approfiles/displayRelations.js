// ./work/approfiles/displayRelations.js
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { appState } from '../../state/appState.js';
import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';
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
  subjectSource: null,
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
  console.info('[VerbDebug] initial resolved subject', resolved);
  state.subjectId = resolved.approUserId;
  state.subjectName = resolved.name;
  state.subjectType = resolved.type;
  state.subjectSource = 'resolved';
//console.log('resolved',resolved,'resolved.name:',resolved.name, 'resolved.type',resolved.type, 'state.subjectType',state.subjectType );

  attachTabsListeners(panel);
  if (!isMyDash) {
    populateApprofileSelect(panel);
    attachDropdownListener(panel);
    attachClickItemListener(panel);
  }
attachBundleToggleListener(panel);


  displayByMode(panel);

  onClipboardUpdate(() => resolveSubjectAgain(panel));
}

async function resolveSubjectAgain(panel) {
  const resolved = await resolveSubject();
  state.subjectId = resolved.approUserId;
  state.subjectName = resolved.name;
  state.subjectType = resolved.type;
  state.subjectSource = 'clipboard';
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
      const option = e.target.options[e.target.selectedIndex];
      state.subjectId = id;
      state.subjectName = name;
      state.subjectType = option.dataset.contentType || 'app-human';
      state.subjectSource = 'clipboard';
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
    const entity = item.entity || {};
    const record = entity.item || entity;
    const type = normalizeVerbType(entity.type || record.type);
    const headerId = type === 'survey'
      ? (record.survey_header_id || record.header_id)
      : (record.task_header_id || record.header_id);
    option.value = headerId || entity.id;
    option.textContent = item.entity.name;
    option.dataset.contentType = entity.type || record.type || 'app-human';
    select.appendChild(option);
  });

  // Restore previous selection if still valid
  if (previous && Array.from(select.options).some(option => option.value === previous)) {
    select.value = previous;
  } else if (approfiles.length === 1) {
    // Auto-select if only one option
    const only = approfiles[0];
    const entity = only.entity || {};
    const record = entity.item || entity;
    const type = normalizeVerbType(entity.type || record.type);
    state.subjectId = type === 'survey'
      ? (record.survey_header_id || record.header_id || entity.id)
      : (record.task_header_id || record.header_id || entity.id);
    state.subjectName = only.entity.name;
    state.subjectType = entity.type || record.type || 'app-human';
    state.subjectSource = 'clipboard';
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
      state.subjectId = flowBox.dataset.contentId;  //appro
      state.subjectName = flowBox.dataset.contentName;
      state.subjectType = flowBox.dataset.contentType;
      state.subjectSource = 'flow-click';
/*
      if (flowBox.dataset.clickMode === 'noun') {
      // is this changing the mode when in verb and clicking an item that isn't a task or survey???
      //that is disorienting. The change can be done by user if wishes by clicking the tab
      //
        state.displayMode = 'noun';
        updateTabs(panel, state.displayMode);
      }
*/
      console.info('[VerbDebug] clicked flow item', {
        id: state.subjectId,
        name: state.subjectName,
        type: state.subjectType,
        mode: state.displayMode
      });

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
  const container = panel.querySelector('#relationshipsContainer');
  showLoading(container);

  switch (state.displayMode) {
    case 'noun':
      return renderNoun(panel);

    case 'verb':
      return renderVerb(panel);

    case 'work':
       return renderWork(panel);

    case 'rule':
      return renderRules(panel);

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

  const subject = await resolveSubjectIdentity('noun');
  let rowsOfRelationData =null; 
 try{
  rowsOfRelationData = await executeIfPermitted(state.userId, 'readApprofileRelationships', { approfileId: subject.approId });
}catch (error) { console.error('loadOrdinaryRelations failed:', error); throw error; // let displayByMode handle it
               }
//console.log('rowsOfRelationData',rowsOfRelationData);
const container = panel.querySelector('#relationshipsContainer');

  if (!rowsOfRelationData || (!rowsOfRelationData.is.length && !rowsOfRelationData.of.length)) {
    container.innerHTML = emptyMessage(subject.name);
    return;
  }
//rearrange the lists of items to be displayed so that similar items are grouped together
  const groupsIs = putNounDataIntoGroups(rowsOfRelationData.is);
  const groupsOf = putNounDataIntoGroups(rowsOfRelationData.of);

  let html = `<div class="p-4 border rounded-lg">
    <h3 class="text-xl font-bold mb-4">Relations</h3>
    <h4 class="font-semibold text-center">${subject.name} is:</h4>
    ${getHTMLForNounGroups(groupsIs, state.subjectName, rowsOfRelationData.iconMap)}
    <h4 class="font-semibold text-center">of ${subject.name}:</h4>
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
//console.log('rowsOfRelationData.is',rowsOfRelationData.is);

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

const DEFAULT_WELCOME_TASK_ID = 'dc9a0e71-4adf-42e7-8649-3620089e4df8';

function normalizeVerbType(type) {
  if (!type) return 'task';
  if (type === 'app-human' || type === 'human') return 'human';
  if (type === 'app-task' || type === 'task' || type === 'tasks') return 'task';
  if (type === 'app-survey' || type === 'survey' || type === 'surveys') return 'survey';
  if (type === 'relation' || type === 'relate' || type === 'unrelate') return 'relation';
  if (type === 'app-abstract' || type === 'app-appro' || type === 'appro') return 'appro';
  return 'task';
}

function isTaskOrSurveyType(type) {
  const normalizedType = normalizeVerbType(type);
  return normalizedType === 'task' || normalizedType === 'survey';
}

function getVerbCardClasses(type) {
  switch (normalizeVerbType(type)) {
    case 'survey':
      return 'bg-green-100 border border-yellow-400 rounded-r-2xl p-3';
    case 'appro':
      return 'rounded-2xl bg-green-100 border border-green-400 p-4';
    case 'relation':
      return 'rounded-tr-2xl rounded-bl-2xl bg-orange-100 border border-orange-400 p-4';
    case 'task':
    default:
      return 'bg-blue-100 border border-blue-400 rounded-l-2xl p-3';
  }
}

function getVerbTypeLabel(type) {
  const normalizedType = normalizeVerbType(type);
  return normalizedType === 'appro'
    ? 'Appro'
    : normalizedType.charAt(0).toUpperCase() + normalizedType.slice(1);
}

function getVerbItemTitle(type, name, id, details = []) {
  const lines = [`${getVerbTypeLabel(type)}: ${name || 'Unknown'}`];
  if (id) lines.push(`ID: ${id}`);
  lines.push(...details.filter(Boolean));
  return escapeHtml(lines.join('\n'));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getAutomationTarget(auto) {
  const targetData = parseJson(auto.target_data);
  return {
    target: targetData.target || {},
    payload: targetData.payload || {}
  };
}

function getAutomationTargetKind(target) {
  if (target?.type === 'task' || target?.type === 'app-task') return 'task';
  if (target?.type === 'survey' || target?.type === 'app-survey') return 'survey';
  return target?.type || 'other';
}

function parseJson(value) {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn('Could not parse automation JSON:', value, error.message);
    return {};
  }
}

async function resolveSubjectIdentity(mode, candidate = null) {
  const source = candidate || {
    id: state.subjectId,
    name: state.subjectName,
    type: state.subjectType
  };
  const sourceId = source.id;
  const sourceType = normalizeVerbType(source.type);

  if (!sourceId) {
    return {
      id: sourceId,
      approId: sourceId,
      directId: sourceId,
      name: source.name || 'Selected item',
      type: sourceType
    };
  }

  try {
    const result = await executeIfPermitted(state.userId, 'readApprofiles', {});
    const profiles = [
      ...(result?.humanApprofiles || []),
      ...(result?.taskApprofiles || []),
      ...(result?.surveyApprofiles || []),
      ...(result?.abstractApprofiles || [])
    ];
    const profile = profiles.find(item => String(item.id) === String(sourceId))
      || profiles.find(item => sourceType === 'survey'
        && String(item.survey_header_id) === String(sourceId))
      || profiles.find(item => sourceType !== 'survey'
        && String(item.task_header_id) === String(sourceId));

    if (profile) {
      const type = profile.task_header_id
        ? 'task'
        : profile.survey_header_id
          ? 'survey'
          : sourceType;
      const approId = profile.id;
      const directId = profile.task_header_id || profile.survey_header_id || profile.id;
      const resolved = {
        id: mode === 'verb' ? directId : approId,
        approId,
        directId,
        name: profile.name || source.name || 'Selected item',
        type
      };
      state.subjectId = resolved.id;
      state.subjectName = resolved.name;
      state.subjectType = resolved.type;
      state.subjectHeaderId = resolved.directId;
      return resolved;
    }
  } catch (error) {
    console.warn('Could not resolve subject identity:', error);
  }

  return {
    id: sourceId,
    approId: sourceId,
    directId: sourceId,
    name: source.name || 'Selected item',
    type: sourceType
  };
}

function getSelectedTaskOrSurveyFromClipboard() {
  const clipboardItems = getClipboardItems();
  console.info('[VerbDebug] clipboard items', clipboardItems.map(item => ({
    as: item?.as,
    entity: item?.entity,
    timestamp: item?.meta?.timestamp
  })));
  const selected = clipboardItems.find(item => {
    const type = item?.entity?.type || item?.type;
    return type === 'app-task' || type === 'app-survey'
      || type === 'task' || type === 'tasks'
      || type === 'survey' || type === 'surveys';
  });

  if (!selected) return null;

  const entity = selected.entity || selected;
  const item = entity.item || entity;
  const type = normalizeVerbType(entity.type || item.type);
  const headerId = type === 'survey'
    ? (item.survey_header_id || item.header_id || entity.id || item.id)
    : (item.task_header_id || item.header_id || entity.id || item.id);

  console.info('[VerbDebug] selected clipboard item', {
    entity,
    item,
    type,
    headerId,
    entityId: entity.id,
    itemId: item.id
  });

  return {
    id: headerId || item.id || entity.id,
    name: item.name || entity.name || 'Selected item',
    type
  };
}

async function getVerbSubject() {
  const explicitFlowSubject = state.subjectId && state.subjectSource === 'flow-click'
    ? {
        id: state.subjectId,
        name: state.subjectName || 'Selected item',
        type: normalizeVerbType(state.subjectType)
      }
    : null;

  if (explicitFlowSubject) {
    console.info('[VerbDebug] using explicit subject', explicitFlowSubject);
    return explicitFlowSubject;
  }

  const storedTaskOrSurvey = state.subjectId && isTaskOrSurveyType(state.subjectType)
    ? {
        id: state.subjectId,
        name: state.subjectName || 'Selected item',
        type: normalizeVerbType(state.subjectType)
      }
    : null;

  if (storedTaskOrSurvey) {
    console.info('[VerbDebug] using stored subject', storedTaskOrSurvey);
    return storedTaskOrSurvey;
  }

  const clipboardTaskOrSurvey = getSelectedTaskOrSurveyFromClipboard();
  if (clipboardTaskOrSurvey) {
    console.info('[VerbDebug] using clipboard subject', clipboardTaskOrSurvey);
    return clipboardTaskOrSurvey;
  }

  const defaultName = 'Welcome';
  const taskHeaders = await executeIfPermitted(state.userId, 'readTaskHeaders', {});
  const taskHeader = (taskHeaders || []).find(item => item.id === DEFAULT_WELCOME_TASK_ID);

  const defaultSubject = {
    id: DEFAULT_WELCOME_TASK_ID,
    name: taskHeader?.name || defaultName,
    type: 'task'
  };
  console.info('[VerbDebug] using default subject', defaultSubject);
  return defaultSubject;
}

async function renderVerb(panel) {
  console.log('renderVerb()');

  const container = panel.querySelector('#relationshipsContainer');
  if (!container) return;

  try {
    const rawSubject = await getVerbSubject();
    const subject = await resolveSubjectIdentity('verb', rawSubject);

    const taskNameMap = await loadTaskNameMap();
    const surveyNameMap = await loadSurveyNameMap();
    const approfileNameMap = await loadApprofileNameMap();

    const automations = subject.type === 'survey'
      ? await executeIfPermitted(state.userId, 'readSurveyAutomationsByHeader', { surveyHeaderId: subject.id })
      : await executeIfPermitted(state.userId, 'readTaskAutomationsByHeader', { taskHeaderId: subject.id });

    console.info('[VerbDebug] verb query result', {
      subject,
      automationCount: automations?.length || 0,
      automations
    });

    const spawned = automations.filter(auto => {
      const source = parseJson(auto.source_data);
      return normalizeVerbType(source?.type) === subject.type
        && String(source?.header) === String(subject.id);
    });

    const spawnedBy = automations.filter(auto => {
      const targetData = getAutomationTarget(auto);
      const target = targetData.target;
      const payload = targetData.payload;
      const targetType = normalizeVerbType(target?.type);

      if (targetType === subject.type && String(target?.header) === String(subject.id)) {
        return true;
      }

      return targetType === 'relation'
        && (String(payload?.of_appro_id) === String(subject.id)
          || String(payload?.appro_is_id) === String(subject.id));
    });

    console.info('[VerbDebug] classified automations', {
      subject,
      spawnedCount: spawned.length,
      spawnedByCount: spawnedBy.length,
      spawned,
      spawnedBy
    });

    const subjectLabel = subject.name || 'Selected item';

    const buildFlow = (rows, mode) => {
      if (!rows || rows.length === 0) {
        return `<div class="text-center text-gray-500 italic py-3">No items</div>`;
      }

      return rows.map(auto => {
        const source = parseJson(auto.source_data) || {};
        const { target, payload } = getAutomationTarget(auto);

        if (mode === 'spawns') {
          const targetKind = getAutomationTargetKind(target);
          const targetHeader = target?.header || null;
          const targetType = targetKind === 'survey' ? 'survey' : 'task';
          const relationTargetId = payload.of_appro_id || null;
          const relationTargetName = relationTargetId
            ? (approfileNameMap[relationTargetId] || relationTargetId)
            : null;
          const targetName = targetKind === 'survey'
            ? (surveyNameMap[targetHeader] || 'Survey')
            : targetKind === 'task'
              ? (taskNameMap[targetHeader] || 'Task')
              : `${payload.relationship || targetKind}${payload.of_appro_id
                ? `: ${approfileNameMap[payload.of_appro_id] || payload.of_appro_id}`
                : ''}`;
          const isRelationAction = targetKind !== 'task' && targetKind !== 'survey';
          const targetCardType = isRelationAction ? 'relation' : targetType;
          const automationDetails = [
            auto.name && `Automation: ${auto.name}`,
            auto.automation_number != null && `Automation number: ${auto.automation_number}`
          ];
          const sourceDetails = [
            source.secondary && `Step/question ID: ${source.secondary}`,
            source.tertiary && `Answer ID: ${source.tertiary}`,
            ...automationDetails
          ];
          const targetDetails = isRelationAction
            ? [
                payload.relationship && `Relationship: ${payload.relationship}`,
                relationTargetId && `Related appro ID: ${relationTargetId}`,
                ...automationDetails
              ]
            : [
                target.secondary && `Step/question ID: ${target.secondary}`,
                target.tertiary && `Answer ID: ${target.tertiary}`,
                ...automationDetails
              ];
          const subjectTitle = getVerbItemTitle(subject.type, subjectLabel, subject.id, sourceDetails);
          const targetTitle = getVerbItemTitle(targetCardType, targetName, targetHeader || relationTargetId, targetDetails);
          const subjectCardClasses = getVerbCardClasses(subject.type);
          const targetCardClasses = getVerbCardClasses(targetCardType);

          return `
            <div class="flex justify-center items-center my-4 gap-2">
              <div title="${subjectTitle}" class="flow-box ${subjectCardClasses} font-bold text-gray-900">
                <span title="${subjectTitle}" class="appro-name cursor-pointer bg-gray-100 hover:bg-green-300" data-clicked="name" data-content-id="${subject.id}" data-content-type="${subject.type}" data-content-name="${subjectLabel}">${subjectLabel}</span>
              </div>
              <div class="px-5 py-3 bg-gray-200 border rounded-3xl font-bold italic text-indigo-700">spawns ➡️</div>
              <div title="${targetTitle}" class="flow-box ${targetCardClasses} font-bold text-gray-900">
                ${isRelationAction
                  ? relationTargetId
                    ? `<span title="${targetTitle}" class="appro-name cursor-pointer bg-gray-100 hover:bg-green-300"
                        data-clicked="name"
                        data-click-mode="noun"
                        data-content-id="${relationTargetId}"
                        data-content-type="app-abstract"
                        data-content-name="${relationTargetName}">${targetName}</span>`
                    : `<span title="${targetTitle}">${targetName}</span>`
                  : `<span title="${targetTitle}" class="appro-name cursor-pointer bg-gray-100 hover:bg-green-300" data-clicked="name" data-content-id="${targetHeader || 'unknown'}" data-content-type="${targetType}" data-content-name="${targetName}">${targetName}</span>`}
              </div>
            </div>
          `;
        }

        const sourceType = normalizeVerbType(source?.type);
        const sourceHeader = source?.header || null;
        const sourceName = sourceType === 'survey'
          ? (surveyNameMap[sourceHeader] || 'Survey')
          : (taskNameMap[sourceHeader] || 'Task');
        const sourceTitle = getVerbItemTitle(sourceType, sourceName, sourceHeader, [
          source.secondary && `Step/question ID: ${source.secondary}`,
          source.tertiary && `Answer ID: ${source.tertiary}`,
          auto.name && `Automation: ${auto.name}`,
          auto.automation_number != null && `Automation number: ${auto.automation_number}`
        ]);
        const subjectTitle = getVerbItemTitle(subject.type, subjectLabel, subject.id);
        const sourceCardClasses = getVerbCardClasses(sourceType);
        const subjectCardClasses = getVerbCardClasses(subject.type);

        return `
          <div class="flex justify-center items-center my-4 gap-2">
            <div title="${sourceTitle}" class="flow-box ${sourceCardClasses} font-bold text-gray-900">
              <span title="${sourceTitle}" class="appro-name cursor-pointer bg-gray-100 hover:bg-green-300" data-clicked="name" data-content-id="${sourceHeader || 'unknown'}" data-content-type="${sourceType}" data-content-name="${sourceName}">${sourceName}</span>
            </div>
            <div class="px-5 py-3 bg-gray-200 border rounded-3xl font-bold italic text-indigo-700">spawns</div>
            <div title="${subjectTitle}" class="flow-box ${subjectCardClasses} font-bold text-gray-900">
              <span title="${subjectTitle}" class="appro-name cursor-pointer bg-gray-100 hover:bg-green-300" data-clicked="name" data-content-id="${subject.id}" data-content-type="${subject.type}" data-content-name="${subjectLabel}">${subjectLabel}</span>
            </div>
          </div>
        `;
      }).join('');
    };

    const html = `
      <div class="p-4 border rounded-lg bg-amber-50">
        <h3 class="text-xl font-bold mb-4">Verb</h3>
        <h4 class="font-semibold text-center mb-4">${subjectLabel}</h4>
        <div class="mb-6">
          <h5 class="text-center font-bold text-indigo-700 mb-2">Spawns</h5>
          ${buildFlow(spawned, 'spawns')}
        </div>
        <div>
          <h5 class="text-center font-bold text-indigo-700 mb-2">Is spawned by</h5>
          ${buildFlow(spawnedBy, 'spawnedBy')}
        </div>
      </div>
    `;

    container.innerHTML = html;
  } catch (error) {
    console.error('renderVerb failed:', error);
    showError(container, error);
  }
}

async function loadTaskNameMap() {
  try {
    const taskHeaders = await executeIfPermitted(state.userId, 'readTaskHeaders', {});
    const map = {};
    (taskHeaders || []).forEach(row => {
      if (row?.id) map[row.id] = row.name || 'Task';
    });
    return map;
  } catch (error) {
    console.warn('Could not load task names for verb view:', error);
    return {};
  }
}

async function loadSurveyNameMap() {
  try {
    const surveyHeaders = await executeIfPermitted(state.userId, 'readSurveyHeaders', {});
    const map = {};
    (surveyHeaders || []).forEach(row => {
      if (row?.id) map[row.id] = row.name || 'Survey';
    });
    return map;
  } catch (error) {
    console.warn('Could not load survey names for verb view:', error);
    return {};
  }
}

async function loadApprofileNameMap() {
  try {
    const result = await executeIfPermitted(state.userId, 'readApprofiles', {});
    const map = {};
    const groups = [
      result?.humanApprofiles,
      result?.taskApprofiles,
      result?.surveyApprofiles,
      result?.abstractApprofiles
    ];

    groups.flat().forEach(row => {
      if (row?.id) map[row.id] = row.name || row.id;
    });
    return map;
  } catch (error) {
    console.warn('Could not load approfile names for verb view:', error);
    return {};
  }
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
      { approfileId: state.subjectId }  //appro
    );
  } catch (err) {
    console.error('renderWork failed:', err);
    return showError(container, err);
  }
//console.log('renderWork() read relations',result);
  const { subject, assignments } = result;

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



function renderPlaceholder(panel, text) {
  panel.querySelector('#relationshipsContainer').innerHTML = `
    <div class="text-center text-gray-500 py-8">${text}</div>
  `;
}

//
// ────────────────────────────────────────────────────────────────
//   6. SHARED RENDERING UTILITIES
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



//gemini 20:36 Sept 18
function putPermissionsDataIntoGroups(perms) {
  if (!perms) return [];
  const groups = {};

  perms.forEach(rel => {
    if (rel.is_deleted) return;

    const cat = rel.category;
    if (!groups[cat]) groups[cat] = [];

    const bundleId = rel.assigned_from_bundle;

    if (bundleId) {
      // Find existing bundle group within the category
      let bundleGroup = groups[cat].find(
        item => item.isBundleContainer && item.bundleId === bundleId
      );

      if (!bundleGroup) {
        bundleGroup = {
          isBundleContainer: true,
          bundleId: bundleId,
          bundleName: rel.bundle_name || 'Permission Bundle',
          approfile_is: rel.approfile_is,
          approfile_is_name: rel.approfile_is_name,
          of_approfile: rel.of_approfile,
          of_approfile_name: rel.of_approfile_name,
          items: []
        };
        groups[cat].push(bundleGroup);
      }
      bundleGroup.items.push(rel);
    } else {
      // Standalone permission
      groups[cat].push(rel);
    }
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

function renderRelationshipFlow(rel, subjectName, iconMap) {
  // If this item is a aggregated Bundle Container:
  if (rel.isBundleContainer) {
    const leftName = rel.approfile_is_name || rel.approfile_is;
    const rightName = rel.of_approfile_name || rel.of_approfile;
    const leftIcon = iconMap?.[rel.approfile_is] || '❔';
    const rightIcon = iconMap?.[rel.of_approfile] || '❔';
// between green-300 | bg-emerald-100 or teal-200 teal-300   cyan-200   | blue-200
    const leftBg = leftName === subjectName ? 'bg-green-100' : 'bg-blue-200';
    const rightBg = rightName === subjectName ? 'bg-green-100' : 'bg-blue-200';

    const innerRows = rel.items.map(subRel => `
      <div class="text-xs text-gray-600 bg-white p-1 rounded border mb-1 flex justify-between">
        <span>${subRel.relationship || subRel.name}</span>
        <!--span class="text-gray-400 font-mono">${subRel.relation_id?.slice(0, 8)}...</span-->
        <span class="text-gray-400 font-mono">${subRel.relation_id}</span>
      </div>
    `).join('');

    return `
      <div class="my-3" data-bundle-id="${rel.bundleId}">
        <!-- Main Bundle Flow Row -->
        <div class="flex justify-center items-center -space-x-3">
                <div class="flow-box mix-blend-multiply px-4 py-2 ${leftBg} border-l-2 border-t-2 border-b-2 border-blue-900 rounded-md font-bold text-blue-900 text-sm">
            <span class="appro-icon cursor-pointer px-2 py-1 bg-yellow-100 hover:bg-yellow-300 rounded-full"
                  data-clicked="icon" data-content-id="${rel.approfile_is}" data-content-name="${leftName}">
              ${leftIcon}
            </span>
            <span class="appro-name cursor-pointer bg-gray-100 hover:bg-green-300 px-1 rounded"
                  data-clicked="name" data-content-id="${rel.approfile_is}" data-content-name="${leftName}">
              ${leftName}
            </span>
          </div>

          <!-- Middle permission name: Bundle Name & Toggle Button -->
          <button data-toggle="toggle-bundle"  class="mix-blend-multiply px-3 py-1 bg-cyan-100 rounded-md font-bold italic text-indigo-700">
            📦 ${rel.bundleName}
            <span class="text-xs bg-indigo-800 text-indigo-200 px-2 py-0.5 rounded-full">${rel.items.length}</span>
            <span class="bundle-arrow text-xs">▼</span>
          </button>

 <div class="mix-blend-multiply flow-box px-4 py-2 ${rightBg}  border-t-2 border-b-2 border-r-2 border-purple-700 rounded-md font-bold text-blue-900 text-sm">
            <span class="appro-name cursor-pointer bg-gray-100 hover:bg-green-300 px-1 rounded"
                  data-clicked="name" data-content-id="${rel.of_approfile}" data-content-name="${rightName}">
              ${rightName}
            </span>
            <span class="appro-icon cursor-pointer px-2 py-1 bg-yellow-100 hover:bg-yellow-300 rounded-full"
                  data-clicked="icon" data-content-id="${rel.of_approfile}" data-content-name="${rightName}">
              ${rightIcon}
            </span>
          </div>
        </div>

        <!-- Hidden Child Permissions Container -->
        <div class="bundle-details hidden mt-3 pt-2 border-t border-indigo-200 max-h-48 overflow-y-auto px-4">
          <div class="text-xs font-semibold text-indigo-900 mb-1">Included Permissions:</div>
          ${innerRows}
        </div>
      </div>
    `;
  }

  // Tuplet design for single permissions 
  const leftName = rel.approfile_is_name || rel.approfile_is;
  const rightName = rel.of_approfile_name || rel.of_approfile;
  const leftType = rel.approfile_is_type || 'app-human';
  const rightType = rel.of_approfile_type || 'app-human';
  const leftIcon = iconMap?.[rel.approfile_is] || '❔';
  const rightIcon = iconMap?.[rel.of_approfile] || '❔';

  const leftBg = leftName === subjectName ? 'bg-green-100' : 'bg-blue-200';
  const rightBg = rightName === subjectName ? 'bg-green-100' : 'bg-blue-200';

  return `
    <div class="flex justify-center items-center my-4 -space-x-3">
      <div class="flow-box mix-blend-multiply px-4 py-2 ${leftBg} border-l-2 border-t-2 border-b-2 border-blue-900 rounded-md font-bold text-blue-900 text-sm">
        <span class="appro-icon cursor-pointer px-3 py-3 bg-yellow-100 hover:bg-yellow-300 rounded-full "
          data-clicked="icon" data-content-id="${rel.approfile_is}" data-content-name="${leftName}" data-content-type="${leftType}">
          ${leftIcon}
        </span>
        <span class="appro-name cursor-pointer bg-gray-100 hover:bg-green-300"
          data-clicked="name" data-content-id="${rel.approfile_is}" data-content-name="${leftName}" data-content-type="${leftType}">
          ${leftName}
        </span>
      </div>

      <div class="mix-blend-multiply px-4 py-1 bg-cyan-100 rounded-md font-bold italic text-indigo-700">
        ${rel.relationship}
      </div>

      <div class="mix-blend-multiply flow-box px-4 py-2 ${rightBg}  border-t-2 border-b-2 border-r-2 border-purple-700 rounded-md font-bold text-blue-900 text-sm">
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

function attachBundleToggleListener(panel) {
    console.log('attachBundleToggleListener() called');
    panel.addEventListener('click', e => {
    console.log('attachBundleToggleListener CLICKED');
    const btn = e.target.closest('[data-toggle="toggle-bundle"]');
    if (!btn) return;

    const bundleCard = btn.closest('[data-bundle-id]');
    if (!bundleCard) return;

    const details = bundleCard.querySelector('.bundle-details');
    const arrow = btn.querySelector('.bundle-arrow');

    if (details) {
      const isHidden = details.classList.contains('hidden');
      details.classList.toggle('hidden');
      if (arrow) {
        arrow.textContent = isHidden ? '▲' : '▼';
      }
    }
  });
}

function emptyMessage(name) {
  return `
    <div class="bg-yellow-50 border border-yellow-200 rounded p-4 text-center">
      <p class="text-yellow-800">No relationships found for "${name}".</p>
    </div>
  `;
}

function showLoading(container) {
//spinner here?
   container.innerHTML = '<div class="p-4 text-gray-600 flex items-center gap-2"><span class="animate-spin">⏳</span> Loading...</div>';
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
//   7. TEMPLATE
// ────────────────────────────────────────────────────────────────
//

function getTemplateHTML() {
  return `
    <div class="edit-task-dialogue flex flex-col h-full">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">

        <div class="p-6 border-b flex justify-between items-center">
          <h3 class="text-xl font-semibold">Display Relations</h3>
          <button data-action="display-related-approfiles-dialogue" class="text-gray-500 hover:text-gray-700">✖</button>
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
    { id: 'noun', label: 'Noun' , title: 'relationships between appros representing users, tasks, surveys, and appros representing anything like departments, branches, interest groups, aims, concepts, etc'},
    { id: 'verb', label: 'Verb' , title: 'How tasks & surveys spawn actions'},
    { id: 'work', label: 'Work' , title: 'What tasks & surveys you are assigned'},
    { id: 'rule', label: 'Rule' , title: 'Your permissions to do things'}
  ];

  return `
    <div class="mode-tabs flex gap-2 border-b pb-2">
      ${modes.map(m => `
        <button class="mode-tab px-4 py-2 rounded-t-md ${m.id === activeMode
          ? 'bg-white font-bold border border-gray-300 border-b-0'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
          data-mode="${m.id}" title="${m.title}">
          ${m.label}
        </button>
      `).join('')}
    </div>
  `;
}