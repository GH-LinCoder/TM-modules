// ./dash/steps.js
import { readAllSteps, readProfilesByIds } from '../db/dataReader.js';

let steps = [];
let profileMap = {};
let loading = false;

// Set up refresh button
document.querySelectorAll('[data-action="refresh-steps"]').forEach(button => {
  button.addEventListener('click', () => {
    loadStepData();
  });
});



// Main render function
export async function renderSteps() {
    const title = document.querySelectorAll('[data-title="steps"]');
    const list = document.querySelectorAll('[data-list="steps"]');
//  const refreshBtn = document.querySelector('[data-action="refresh-steps"]');

  // Update title
  if (title) {
    title.textContent = `Steps (${steps.length})`;
  }

  // Update refresh button state
  if (refreshBtn) {
    refreshBtn.disabled = loading;
    refreshBtn.textContent = loading ? 'Loading...' : 'Refresh';
  }

  // Render list
  if (loading) {
    list.innerHTML = '<p class="text-center text-gray-500 py-8">Loading steps...</p>';
    return;
  }

  if (steps.length === 0) {
    list.innerHTML = '<p class="text-center text-gray-500 py-8">No steps found.</p>';
    return;
  }

  const html = steps.map(step => `
    <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div class="flex justify-between items-start mb-2">
        <h3 class="font-medium text-gray-900">${step.name || 'Unnamed Step'}</h3>
        <span class="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
          Step ${step.step_order}
        </span>
      </div>
      
      ${step.description ? `<p class="text-sm text-gray-600 mb-3">${step.description}</p>` : ''}
      
      ${step.external_url ? `
        <a href="${step.external_url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 text-sm mb-3 block">
          ${step.external_url}
        </a>
      ` : ''}
      
      <div class="flex flex-wrap gap-2 text-xs text-gray-500">
        <span>Task: ${truncateId(step.task_header_id)}</span>
        <span>|</span>
        <span>Author: ${profileMap[step.author_id]?.name || 'Unknown'}</span>
        <span>|</span>
        <span>Created: ${new Date(step.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  `).join('');

  list.innerHTML = `
    <div class="space-y-3 max-h-80 overflow-y-auto">
      ${html}
    </div>
  `;
}

// Helper function to truncate ID
function truncateId(id) {
  return id ? `${id.slice(0, 8)}...` : '---';
}

// Create profile map helper
function createProfileMap(profiles) {
  return profiles.reduce((acc, profile) => {
    acc[profile.id] = profile;
    return acc;
  }, {});
}

// Load step data
async function loadStepData() {
  const list = document.querySelectorAll('[data-list="steps"]');


  
  if (!list) return;
  
  loading = true;
  renderSteps(); // Show loading state
  
  try {
    steps = await readAllSteps();
  

    // Get all author IDs from steps
    const authorIds = [...new Set(steps.map(step => step.author_id))];
    const profiles = await readProfilesByIds(authorIds);
    profileMap = createProfileMap(profiles);
    
  } catch (error) {
    console.error('Error loading step ', error);
    list.innerHTML = '<p class="text-red-600">Error loading step data</p>';
  } finally {
    loading = false;
    renderSteps();
  }
}

// Initial render
document.addEventListener('DOMContentLoaded', () => {
  loadStepData();
});