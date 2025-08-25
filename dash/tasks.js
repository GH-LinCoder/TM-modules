// ./dash/tasks.js
import { readAllTasks, readAllAssignments, readProfilesByIds } from '../db/dataReader.js';

let tasks = [];
let assignments = [];
let profileMap = {};
let sortedTasks = [];
let sortOrder = 'alpha-asc'; // 'alpha-asc' or 'alpha-desc'
let loading = false;


// Set up sort button event listeners
document.querySelectorAll('[data-toggle="tasks"]').forEach(button => {
  button.addEventListener('click', () => {
    const order = button.dataset.sort;
    handleSort(order);
  });
});

// Set up refresh button
document.querySelectorAll('[data-action="refresh-tasks"]').forEach(button => {
  button.addEventListener('click', () => {
    loadTaskData();
  });
});

// Main render function
export async function renderTasks() {
    const title = document.querySelectorAll('[data-title="tasks"]');
  const list = document.querySelectorAll('[data-list="tasks"]');
  const refreshBtn = document.querySelector('[data-action="refresh-tasks"]');

  // Update title
  if (title) {
    title.textContent = `Tasks (${tasks.length})`;
  }

  // Update refresh button state
  if (refreshBtn) {
    refreshBtn.disabled = loading;
    refreshBtn.textContent = loading ? 'Loading...' : 'Refresh';
  }

  // Render list
  if (loading) {
    list.innerHTML = '<p class="text-center text-gray-500 py-8">Loading tasks...</p>';
    return;
  }

  if (sortedTasks.length === 0) {
    list.innerHTML = '<p class="text-center text-gray-500 py-8">No tasks found.</p>';
    return;
  }

  const html = sortedTasks.map(task => `
    <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div class="flex justify-between items-start mb-2">
        <h3 class="font-medium text-gray-900">${task.name || 'Unnamed Task'}</h3>
        <span class="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
          ${truncateId(task.id)}
        </span>
      </div>
      
      ${task.description ? `<p class="text-sm text-gray-600 mb-3">${task.description}</p>` : ''}
      
      ${task.external_url ? `
        <a href="${task.external_url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 text-sm mb-3 block">
          ${task.external_url}
        </a>
      ` : ''}
      
      <div class="flex flex-wrap gap-2 text-xs text-gray-500">
        <span>Author: ${profileMap[task.author_id]?.name || 'Unknown'}</span>
        <span>|</span>
        <span>Created: ${new Date(task.created_at).toLocaleDateString()}</span>
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

// Sort tasks
function sortTasks(data, order) {
  let sorted = [...data];
  
  if (order === 'alpha-asc') {
    sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  } else if (order === 'alpha-desc') {
    sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
  }
  
  sortedTasks = sorted;
  renderTasks();
}

// Handle sort button click
function handleSort(order) {
  sortOrder = order;
  
  // Update active state on buttons
  document.querySelectorAll('[data-sort]').forEach(btn => {
    if (btn.dataset.sort === order) {
      btn.classList.add('bg-blue-600', 'text-white');
      btn.classList.remove('bg-white', 'text-blue-600', 'border');
    } else {
      btn.classList.remove('bg-blue-600', 'text-white');
      btn.classList.add('bg-white', 'text-blue-600', 'border');
    }
  });
  
  sortTasks(tasks, order);
}

// Load task data
async function loadTaskData() {
  const list = document.getElementById('tasks-list');
  
  if (!list) return;
  
  loading = true;
  renderTasks(); // Show loading state
  
  try {
    const [tasksData, assignmentsData] = await Promise.all([
      readAllTasks(),
      readAllAssignments(),
    ]);

    // Get all author IDs from tasks
    const authorIds = [...new Set(tasksData.map(task => task.author_id))];
    const profiles = await readProfilesByIds(authorIds);
    profileMap = createProfileMap(profiles);

    tasks = tasksData;
    assignments = assignmentsData;
    sortTasks(tasksData, 'alpha-asc');
  } catch (error) {
    console.error('Error loading task ', error);
    list.innerHTML = '<p class="text-red-600">Error loading task data</p>';
  } finally {
    loading = false;
    renderTasks();
  }
}

// Initial render
document.addEventListener('DOMContentLoaded', () => {
  loadTaskData();
});