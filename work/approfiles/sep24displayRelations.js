// ./work/approfiles/displayRelations.js
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { appState } from '../../state/appState.js';
import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';

console.log('displayRelations.js loaded');

const userId = appState.query.userId;

export function render(panel, query = {}) {
  console.log('displayRelations.render()', panel, query);
  panel.innerHTML = getTemplateHTML();
  init(panel, query);
}

function getTemplateHTML() {
  return `
    <div class="bg-white rounded-lg shadow p-6">
      <div class="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 class="text-lg font-semibold text-blue-800 mb-2">Display Relationships</h3>
        <p class="text-blue-700 text-sm">
          View all relationships for a selected approfile. 
          Select an approfile from your clipboard below.
        </p>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Select Approfile:
          </label>
          <select id="approfileSelect" class="w-full p-2 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500">
            <option value="">Select an approfile from clipboard...</option>
          </select>
        </div>

        <div id="relationshipsContainer" class="min-h-32">
          <div class="text-gray-500 text-center py-8">
            No approfile selected. Please select an approfile.
          </div>
        </div>
      </div>
    </div>
  `;
}

function init(panel, query) {
  console.log('displayRelations.init()');
  
  // Initialize with empty state
  renderRelationships(panel, null);
  
  // Load approfiles from clipboard
  populateApprofileSelect(panel);
  
  // Listen for clipboard updates
  onClipboardUpdate(() => {
    populateApprofileSelect(panel);
  });
  
  // Handle approfile selection
  const select = panel.querySelector('#approfileSelect');
  select?.addEventListener('change', async (e) => {
    const approfileId = e.target.value;
    if (approfileId) {
      await loadAndRenderRelationships(panel, approfileId);
    } else {
      renderRelationships(panel, null);
    }
  });
}

function populateApprofileSelect(panel) {
  const approfiles = getClipboardItems({ type: 'app-human' })
    .concat(getClipboardItems({ type: 'app-task' }))
    .concat(getClipboardItems({ type: 'app-abstract' }));
  
  const select = panel.querySelector('#approfileSelect');
  if (!select) return;
  
  // Save current selection
  const currentSelection = select.value;
  
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
  } else if (approfiles.length === 1) {
    // Auto-select if only one option
    select.value = approfiles[0].entity.id;
    loadAndRenderRelationships(panel, approfiles[0].entity.id);
  }
}

async function loadAndRenderRelationships(panel, approfileId) {
  try {
    const relationships = await loadRelationships(approfileId);
    renderRelationships(panel, relationships);
  } catch (error) {
    console.error('Error loading relationships:', error);
    showToast('Failed to load relationships: ' + error.message, 'error');
    renderRelationships(panel, []);
  }
}

async function loadRelationships(approfileId) {
  console.log('loadRelationships for approfileId:', approfileId);
  
  if (!approfileId) {
    throw new Error('approfileId is required');
  }
  
  const result = await executeIfPermitted(userId, 'readApprofileRelationships', { 
    approfileId: approfileId 
  });
  
  console.log('Raw result:', result);
  return result || { is: [], of: [] };
}

function renderRelationships(panel, relationshipsData) {
  const container = panel.querySelector('#relationshipsContainer');
  if (!container) return;
  
  // Handle case where no approfile is selected
  if (relationshipsData === null) {
    container.innerHTML = `
      <div class="text-gray-500 text-center py-8">
        No approfile selected. Please select an approfile.
      </div>
    `;
    return;
  }
  
  const isRelationships = relationshipsData.is || [];
  const ofRelationships = relationshipsData.of || [];
  
  if (isRelationships.length === 0 && ofRelationships.length === 0) {
    container.innerHTML = `
      <div class="bg-yellow-50 border border-yellow-200 rounded p-4 text-center">
        <p class="text-yellow-800">No relationships found for this approfile.</p>
      </div>
    `;
    return;
  }
  
  let html = '';
  
  // Render "IS" relationships (selected approfile is the subject)
  if (isRelationships.length > 0) {
    html += `
      <div class="mb-6">
        <h4 class="font-medium text-blue-800 mb-3 pb-2 border-b border-blue-200">
          ${isRelationships.length} Relationship${isRelationships.length !== 1 ? 's' : ''} WHERE this approfile IS the subject:
        </h4>
        <div class="space-y-3">
          ${isRelationships.map(rel => `
            <div class="p-3 bg-blue-50 rounded border border-blue-200">
              <div class="font-medium text-blue-900">${rel.approfile_is_name || rel.approfile_is}</div>
              <div class="text-sm text-blue-700 flex items-center justify-center my-2">
                <span class="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs font-medium">${rel.relationship}</span>
              </div>
              <div class="font-medium text-blue-900">OF ${rel.of_approfile_name || rel.of_approfile}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  // Render "OF" relationships (selected approfile is the object)
  if (ofRelationships.length > 0) {
    html += `
      <div>
        <h4 class="font-medium text-purple-800 mb-3 pb-2 border-b border-purple-200">
          ${ofRelationships.length} Relationship${ofRelationships.length !== 1 ? 's' : ''} WHERE this approfile IS the object:
        </h4>
        <div class="space-y-3">
          ${ofRelationships.map(rel => `
            <div class="p-3 bg-purple-50 rounded border border-purple-200">
              <div class="font-medium text-purple-900">${rel.approfile_is_name || rel.approfile_is}</div>
              <div class="text-sm text-purple-700 flex items-center justify-center my-2">
                <span class="px-2 py-1 bg-purple-200 text-purple-800 rounded text-xs font-medium">${rel.relationship}</span>
              </div>
              <div class="font-medium text-purple-900">OF ${rel.of_approfile_name || rel.of_approfile}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  container.innerHTML = `<div class="bg-gray-50 rounded p-3">${html}</div>`;
}