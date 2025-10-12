// ./dash/managers.js
import { readUniqueManagers, readAllManagerEntries, readProfilesByIds } from '../db/dataReader.js';

let managerViewType = 'unique'; // 'all' or 'unique'
let uniqueManagers = [];
let allManagerEntries = [];
let profileMap = {};

// Create profile map helper
function createProfileMap(profiles) {
  return profiles.reduce((acc, profile) => {
    acc[profile.id] = profile;
    return acc;
  }, {});
}

// Set up event listeners
document.querySelectorAll('[data-toggle="managers"]').forEach(radio => {
  radio.addEventListener('change', () => {
    managerViewType = radio.value;
    renderManagers();
  });
});

// Main render function
export async function renderManagers() {
  const title = document.querySelectorAll('[data-title="managers"]');
  const list = document.querySelectorAll('[data-list="managers"]');

  list.innerHTML = '<p>Loading...</p>';

  // Load data if not already loaded
  if (uniqueManagers.length === 0 && allManagerEntries.length === 0) {
    await loadManagerData();
  }

  // Update title
  const count = managerViewType === 'unique' ? uniqueManagers.length : allManagerEntries.length;
  title.textContent = managerViewType === 'unique' ? `Managers (${count})` : `All Manager Assignments (${count})`;

  // Render list
  if (count === 0) {
    list.innerHTML = `
      <div class="text-center text-gray-500 py-8">
        No ${managerViewType === 'unique' ? 'unique' : 'all'} managers found.
      </div>
    `;
    return;
  }

  const html = (managerViewType === 'unique' ? uniqueManagers : allManagerEntries)
    .map((entry, index) => {
      let profile;
      if (managerViewType === 'unique') {
        profile = entry;
      } else {
        profile = profileMap[entry.manager_id];
      }
      
      if (!profile) return '';

      return `
        <div key="${profile.id}${managerViewType === 'all' ? `-${index}` : ''}" class="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
          <div class="font-medium text-gray-900">${profile.name}</div>
          <div class="text-sm text-gray-600">${profile.email}</div>
        </div>
      `;
    })
    .join('');

  list.innerHTML = `
    <div class="space-y-2 max-h-80 overflow-y-auto">
      ${html}
    </div>
  `;
}

// Load manager data
async function loadManagerData() {
  try {
    const [uniqueManagersIds, allManagerEntriesData] = await Promise.all([
       readUniqueManagers(),
       readAllManagerEntries(),
    ]);

    const uniqueProfileIds = [...new Set(uniqueManagersIds)];
    const profiles = await  readProfilesByIds(uniqueProfileIds);
    profileMap = createProfileMap(profiles);

    uniqueManagers = uniqueManagersIds.map(id => profileMap[id]).filter(Boolean);
    allManagerEntries = allManagerEntriesData;
  } catch (error) {
    console.error('Error loading manager data:', error);
    const list = document.getElementById('managers-list');
    list.innerHTML = '<p class="text-red-600">Error loading manager data</p>';
  }
}

// Initial render
document.addEventListener('DOMContentLoaded', () => {
  renderManagers();
});