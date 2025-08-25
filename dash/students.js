// ./dash/students.js
import { readUniqueStudents, readAllStudentEntries, readProfilesByIds } from '../db/dataReader.js';

let studentViewType = 'unique'; // 'all' or 'unique'
let uniqueStudents = [];
let allStudentEntries = [];
let profileMap = {};

// Create profile map helper
function createProfileMap(profiles) {
  return profiles.reduce((acc, profile) => {
    acc[profile.id] = profile;
    return acc;
  }, {});
}



// Set up event listeners
document.querySelectorAll('[data-toggle="students"]').forEach(radio => {
  radio.addEventListener('change', () => {
    studentViewType = radio.value;
    renderStudents();
  });
});

// Main render function
export async function renderStudents() {
    const title = document.querySelectorAll('[data-title="students"]');
  const list = document.querySelectorAll('[data-list="students"]');

  list.innerHTML = '<p>Loading...</p>';

  // Load data if not already loaded
  if (uniqueStudents.length === 0 && allStudentEntries.length === 0) {
    await loadStudentData();
  }

  // Update title
  const count = studentViewType === 'unique' ? uniqueStudents.length : allStudentEntries.length;
  title.textContent = studentViewType === 'unique' ? `Students (${count})` : `All Student Assignments (${count})`;

  // Render list
  if (count === 0) {
    list.innerHTML = `
      <div class="text-center text-gray-500 py-8">
        No ${studentViewType === 'unique' ? 'unique' : 'all'} students found.
      </div>
    `;
    return;
  }

  const html = (studentViewType === 'unique' ? uniqueStudents : allStudentEntries)
    .map((entry, index) => {
      let profile;
      if (studentViewType === 'unique') {
        profile = entry;
      } else {
        profile = profileMap[entry.student_id];
      }
      
      if (!profile) return '';

      return `
        <div key="${profile.id}${studentViewType === 'all' ? `-${index}` : ''}" class="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
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

// Load student data
async function loadStudentData() {
  const list = document.getElementById('students-list');
  
  if (!list) return;
  
  try {
    const [uniqueStudentsIds, allStudentEntriesData] = await Promise.all([
      readUniqueStudents(),
      readAllStudentEntries(),
    ]);

    const uniqueProfileIds = [...new Set(uniqueStudentsIds)];
    const profiles = await readProfilesByIds(uniqueProfileIds);
    profileMap = createProfileMap(profiles);

    uniqueStudents = uniqueStudentsIds.map(id => profileMap[id]).filter(Boolean);
    allStudentEntries = allStudentEntriesData;
  } catch (error) {
    console.error('Error loading student ', error);
    list.innerHTML = '<p class="text-red-600">Error loading student data</p>';
  } finally {
    renderStudents();
  }
}

// Initial render
document.addEventListener('DOMContentLoaded', () => {
  renderStudents();
});