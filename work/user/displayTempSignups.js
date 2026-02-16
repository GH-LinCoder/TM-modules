// ./work/task/displayTempSignups.js
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
//import { appState } from '../../state/appState.js';
//import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';
import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';
//import {icons} from '../../registry/iconList.js';

console.log('displayTempSignups.js loaded');

export async function render(panel, query = {}) {
  console.log('showTempSignups.render:', panel, query);
  panel.innerHTML = getTemplateHTML();
//  createDynamicTable();
  panel.querySelector('#dynamic-table').innerHTML = await createDynamicTable();
}



async function readTableFromDb(){
     try {console.log('readTableFromDb');
    const table = await executeIfPermitted(null, 'readTempSignup', null);
    console.log(table);
    return table;
  } catch (error) {
    console.error('Failed to read table from db:', error);
    showToast('Could not read db', 'error');
  }
  
}


async function createDynamicTable() {
const data = await readTableFromDb();

  // Handle empty or error states
  if (!data || data.error) {
    return '<div class="text-red-500 p-4">Failed to load data</div>';
  }
  
  if (data.length === 0) {
    return '<div class="text-gray-500 text-center p-8">No data available</div>';
  }
  
  // Get column names from first row (excluding internal Supabase fields)
  const firstRow = data[0];
  const allKeys = Object.keys(firstRow);
  const columns = allKeys.filter(key => 
    !key.startsWith('id') && 
    !key.endsWith('_at') && 
    key !== 'created_at' &&
    key !== 'user_id'
  );
  
  // Add timestamp columns at the end for better organization
  const timestampColumns = allKeys.filter(key => key.endsWith('_at') || key === 'created_at');
  const finalColumns = [...columns, ...timestampColumns].filter(col => col !== 'id');
  
  // Generate table HTML
  let html = `
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead class="bg-gray-50">
          <tr>
  `;
  
  // Header row
  finalColumns.forEach(col => {
    const displayName = formatColumnName(col);
    html += `<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${displayName}</th>`;
  });
  
  html += `
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
  `;
  
  // Data rows
  data.forEach(row => {
    html += '<tr class="hover:bg-gray-50">';
    finalColumns.forEach(col => {
      const value = row[col];
      const cellContent = formatCellValue(value, col);
      html += `<td class="px-4 py-3 text-sm">${cellContent}</td>`;
    });
    html += '</tr>';
  });
  
  html += `
        </tbody>
      </table>
    </div>
  `;
  
  return html;
}

// Helper functions
function formatColumnName(columnName) {
  // Convert snake_case to Title Case
  return columnName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

function formatCellValue(value, columnName) {
  if (value === null || value === undefined) {
    return '<span class="text-gray-400">—</span>';
  }
  
  // Handle timestamps
  if (columnName.endsWith('_at') || columnName === 'created_at') {
    if (typeof value === 'string' && value.includes('T')) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    }
    return value;
  }
  
  // Handle boolean values
  if (typeof value === 'boolean') {
    return value ? '✅' : '❌';
  }
  
  // Handle long strings (truncate with tooltip)
  if (typeof value === 'string' && value.length > 50) {
    const truncated = value.substring(0, 47) + '...';
    return `<span title="${escapeHtml(value)}" class="cursor-help">${escapeHtml(truncated)}</span>`;
  }
  
  // Handle UUIDs (show first 8 chars)
  if (typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    return `<span class="font-mono text-xs text-gray-600">${value.substring(0, 8)}...</span>`;
  }
  
  // Default: escape HTML and return
  return escapeHtml(String(value));
}

function escapeHtml(text) {
  if (typeof text !== 'string') return text || '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}





function getTemplateHTML() {console.log('getTemplateHTML()');
  return `
    <div id="editTaskDialog" class="edit-task-dialogue relative z-10 flex flex-col h-full w-full" data-destination="new-panel">
      <div class="bg-white rounded-lg shadow-lg w-full  z-10 max-h-[90vh] overflow-y-auto">

        <div class="p-6 border-b border-gray-200 flex justify-between items-center">

            <h3 class="text-xl font-semibold text-gray-900">Display tempSignups  22:00 Jan 31</h3>


          <button data-action="close-dialog" class="text-gray-500 hover:text-gray-700" aria-label="Close">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="p-6">
          
          
            <div class="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 class="font-medium text-blue-800 mb-2">Instructions:</h4>
           
                <ul class="text-blue-700 text-sm mt-2 space-y-1">
              <li>This is a display.</li>  
              <li>• You can view the username, appro created, myDash granted, notes granted and task assigned dates</li>
              <li>• </li>  
              <li>• </li>
                <li>• </li>        
                </ul>
            </div>
            <div class="bg-green-100 flex flex-col md:flex-row justify-center gap-4 pt-4 border-t border-gray-200">
                            <p class="text-lg font-bold">Information:</p>
                            <div id="informationSection" class="w-full">
                                <!-- Information cards will be added here -->
                            </div>
            </div>

<div id="temp-signups-container">
  <h3 class="text-xl font-semibold mb-4">New Signups</h3>
  <div id="dynamic-table">Loading...</div>
</div>


          </div>
        </div>
      </div>
    </div>
       ${petitionBreadcrumbs()} 
  `;
}