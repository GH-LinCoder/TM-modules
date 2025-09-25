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
  renderRelationships(panel, null, null);
  
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
      const selectedName = e.target.options[e.target.selectedIndex].textContent;
      await loadAndRenderRelationships(panel, approfileId, selectedName);
    } else {
      renderRelationships(panel, null, null);
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
    loadAndRenderRelationships(panel, approfiles[0].entity.id, approfiles[0].entity.name);
  }
}

async function loadAndRenderRelationships(panel, approfileId, approfileName) {
  try {
    const relationships = await loadRelationships(approfileId);
    renderRelationships(panel, relationships, approfileName);
  } catch (error) {
    console.error('Error loading relationships:', error);
    showToast('Failed to load relationships: ' + error.message, 'error');
    renderRelationships(panel, { is: [], of: [] }, approfileName);
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

function renderRelationships(panel, relationshipsData, approfileName) {
  const container = panel.querySelector('#relationshipsContainer');
  if (!container) return;
  
  // Handle case where no approfile is selected
  if (relationshipsData === null || approfileName === null) {
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
  
  // Group and sort relationships by type (alphabetically)
  const groupRelationships = (rels) => {
    const groups = {};
    rels.forEach(rel => {
      const relType = rel.relationship;
      if (!groups[relType]) groups[relType] = [];
      groups[relType].push(rel);
    });
    
    // Sort relationship types alphabetically
    return Object.keys(groups)
      .sort()
      .map(relType => ({
        relationship: relType,
        items: groups[relType]
      }));
  };
  
  const groupedIs = groupRelationships(isRelationships);
  const groupedOf = groupRelationships(ofRelationships);
  
  let html = '';
  
  // IS SECTION
  if (groupedIs.length > 0) {
    html += `
      <div class="section" style="margin-bottom: 24px; border: 1px solid #2a0985; border-radius: 24px; padding: 16px;">
        <div class="section-title" style="font-size: 18px; font-weight: bold; margin-bottom: 8px; color: #374151; text-align: center;">
          ${approfileName} is
        </div>
    `;
    
    groupedIs.forEach(group => {
      html += `
        <div class="relationship-type" style="font-size: 16px; font-weight: bold; margin-bottom: 4px; color: #4f46e5; padding-bottom: 4px;">
          ${group.relationship}
        </div>
      `;
      
      group.items.forEach(rel => {
        const subject = rel.approfile_is_name || rel.approfile_is;
        const object = rel.of_approfile_name || rel.of_approfile;
        html += `
          <div class="relationship-flow" style="display: flex; justify-content: center; align-items: center; margin: 2rem auto; gap: 1rem;">
            <div class="flow-box-subject" style="padding: 0.75rem 1.25rem; background-color: #60b494; border: 4px solid #004080; border-radius: 6px; font-weight: bold; text-align: center; color: #004080;">
              ${subject} is
            </div>
            <div class="flow-box-relation" style="padding: 0.75rem 1.25rem; background-color: #d7e4e2; border: 2px solid #004080; border-radius: 6px; font-weight: bold; text-align: center; font-size: 16px; font-style: italic; color: #4f46e5;">
              ${rel.relationship}
            </div>
            <div class="flow-box-other" style="padding: 0.75rem 1.25rem; background-color: #b8b2db; border: 2px solid #8fa1b3; border-radius: 6px; font-weight: bold; text-align: center; color: #004080;">
              of ${object}
            </div>
          </div>
        `;
      });
    });
    html += `</div>`;
  }
  
  // OF SECTION
  if (groupedOf.length > 0) {
    html += `
      <div class="section" style="margin-bottom: 24px; border: 1px solid #2a0985; border-radius: 24px; padding: 16px;">
        <div class="section-title" style="font-size: 18px; font-weight: bold; margin-bottom: 8px; color: #374151; text-align: center;">
          of ${approfileName}
        </div>
    `;
    
    groupedOf.forEach(group => {
      html += `
        <div class="relationship-type" style="font-size: 16px; font-weight: bold; margin-bottom: 4px; color: #4f46e5; padding-bottom: 4px;">
          ${group.relationship}
        </div>
      `;
      
      group.items.forEach(rel => {
        const subject = rel.approfile_is_name || rel.approfile_is;
        const object = rel.of_approfile_name || rel.of_approfile;
        html += `
          <div class="relationship-flow" style="display: flex; justify-content: center; align-items: center; margin: 2rem auto; gap: 1rem;">
            <div class="flow-box-other" style="padding: 0.75rem 1.25rem; background-color: #b8b2db; border: 2px solid #8fa1b3; border-radius: 6px; font-weight: bold; text-align: center; color: #004080;">
              ${subject} is
            </div>
            <div class="flow-box-relation" style="padding: 0.75rem 1.25rem; background-color: #d7e4e2; border: 2px solid #004080; border-radius: 6px; font-weight: bold; text-align: center; font-size: 16px; font-style: italic; color: #4f46e5;">
              ${rel.relationship}
            </div>
            <div class="flow-box-subject" style="padding: 0.75rem 1.25rem; background-color: #60b494; border: 4px solid #004080; border-radius: 6px; font-weight: bold; text-align: center; color: #004080;">
              of ${object}
            </div>
          </div>
        `;
      });
    });
    html += `</div>`;
  }
  
  container.innerHTML = html;
}