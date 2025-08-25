// ./dash/members.js
import { readAllMembers } from '../db/dataReader.js';

let members = [];
let sortedMembers = [];
let sortOrder = 'desc'; // 'asc', 'desc', 'alpha-asc', 'alpha-desc'
let loading = false;

// Set up sort button event listeners
document.querySelectorAll('[data-toggle="managers"]').forEach(radio => {
radio.addEventListener('change', () => {
    const order = radio.value;
    handleSort(order);
  });
});


/*
// Set up refresh button - don't think there is one Commented out 11:27 aug 25 2025
document.querySelectorAll('[data-action="refresh-members"]').forEach(button => {
  button.addEventListener('click', () => {
    loadMemberData();
  });
});
*/

// Main render function
export async function renderMembers() {
  const title = document.querySelectorAll('[data-title="members"]');
  const list = document.querySelectorAll('[data-list="members"]');
//  const refreshBtn = document.querySelector('[data-action="refresh-members"]');

  // Update title
  if (title) {
    title.textContent = `Members (${members.length})`;
  }

  // Update refresh button state
  if (refreshBtn) {
    refreshBtn.disabled = loading;
    refreshBtn.textContent = loading ? 'Loading...' : 'Refresh';
  }

  // Render list
  if (loading) {
    list.innerHTML = '<p class="text-center text-gray-500 py-8">Loading members...</p>';
    return;
  }

  if (sortedMembers.length === 0) {
    list.innerHTML = '<p class="text-center text-gray-500 py-8">No members found.</p>';
    return;
  }

  const html = sortedMembers.map(member => `
    <div class="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
      <div class="flex justify-between items-start">
        <div>
          <div class="font-medium text-gray-900">${member.username || 'Unknown'}</div>
          <div class="text-sm text-gray-600">${member.email || 'No email'}</div>
        </div>
        <div class="text-right">
          <div class="text-xs text-gray-500">Created</div>
          <div class="text-sm font-medium">${new Date(member.created_at).toLocaleDateString()}</div>
        </div>
      </div>
    </div>
  `).join('');

  list.innerHTML = `
    <div class="space-y-2 max-h-80 overflow-y-auto">
      ${html}
    </div>
  `;
}

// Sort members
function sortMembers(data, order) {
  let sorted = [...data];
  
  if (order === 'asc') {
    sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  } else if (order === 'desc') {
    sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else if (order === 'alpha-asc') {
    sorted.sort((a, b) => (a.username || '').localeCompare(b.username || ''));
  } else if (order === 'alpha-desc') {
    sorted.sort((a, b) => (b.username || '').localeCompare(a.username || ''));
  }
  
  sortedMembers = sorted;
  renderMembers();
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
  
  sortMembers(members, order);
}

// Load member data
async function loadMemberData() {
  const list = document.getElementById('members-list');
  
  if (!list) return;
  
  loading = true;
  renderMembers(); // Show loading state
  
  try {
    members = await readAllMembers();
    sortMembers(members, sortOrder);
  } catch (error) {
    console.error('Error loading member ', error);
    list.innerHTML = '<p class="text-red-600">Error loading member data</p>';
  } finally {
    loading = false;
    renderMembers();
  }
}

// Initial render
document.addEventListener('DOMContentLoaded', () => {
  loadMemberData();
});