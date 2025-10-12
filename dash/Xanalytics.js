// ./dash/analytics.js
import { 
  readAllMembers, 
  readAllAssignments, 
  readUniqueStudents, 
  readUniqueManagers, 
  readUniqueAuthors, 
  readProfilesByIds 
} from '../db/dataReader.js';

let members = [];
let assignments = [];
let uniqueStudents = [];
let uniqueManagers = [];
let uniqueAuthors = [];
let profileMap = {};
let studentMemberRatio = 0;
let managerMemberRatio = 0;
let authorMemberRatio = 0;
let mostActiveTasks = [];
let mostActiveStudents = [];
let loading = false;

// Set up refresh button
document.querySelectorAll('[data-action="refresh-analytics"]').forEach(button => {
  button.addEventListener('click', () => {
    loadAnalyticsData();
  });
});

// Create profile map helper
function createProfileMap(profiles) {
  return profiles.reduce((acc, profile) => {
    acc[profile.id] = profile;
    return acc;
  }, {});
}

// Main render function
export async function renderAnalytics() {
  const title = document.getElementById('analytics-title');
  const list = document.getElementById('analytics-list');
  const refreshBtn = document.querySelector('[data-action="refresh-analytics"]');

  // Update title
  if (title) {
    title.textContent = 'Analytics';
  }

  // Update refresh button state
  if (refreshBtn) {
    refreshBtn.disabled = loading;
    refreshBtn.textContent = loading ? 'Loading...' : 'Refresh';
  }

  // Render list
  if (loading) {
    list.innerHTML = '<p class="text-center text-gray-500 py-8">Loading analytics...</p>';
    return;
  }

  // Calculate ratios
  const totalMembers = members.length;
  if (totalMembers > 0) {
    studentMemberRatio = uniqueStudents.length / totalMembers;
    managerMemberRatio = uniqueManagers.length / totalMembers;
    authorMemberRatio = uniqueAuthors.length / totalMembers;
  } else {
    studentMemberRatio = 0;
    managerMemberRatio = 0;
    authorMemberRatio = 0;
  }

  // Render analytics
  list.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <div class="grid grid-cols-1 gap-3">
          <div class="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
            <div>
              <div class="font-medium text-blue-900">Students & Members</div>
              <div class="text-sm text-blue-700">Unique Students: ${uniqueStudents.length}</div>
            </div>
            <span class="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
              ${(studentMemberRatio * 100).toFixed(1)}%
            </span>
          </div>
          
          <div class="flex justify-between items-center p-3 bg-green-50 rounded-lg">
            <div>
              <div class="font-medium text-green-900">Managers & Members</div>
              <div class="text-sm text-green-700">Unique Managers: ${uniqueManagers.length}</div>
            </div>
            <span class="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
              ${(managerMemberRatio * 100).toFixed(1)}%
            </span>
          </div>
          
          <div class="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
            <div>
              <div class="font-medium text-purple-900">Authors & Members</div>
              <div class="text-sm text-purple-700">Unique Authors: ${uniqueAuthors.length}</div>
            </div>
            <span class="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
              ${(authorMemberRatio * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
      
      <div class="space-y-4">
        <div>
          <h3 class="text-sm font-medium text-gray-900 mb-3">Most Active Tasks (Top 5)</h3>
          <div class="space-y-2">
            ${mostActiveTasks.length > 0 ? 
              mostActiveTasks.map(task => `
                <div class="flex justify-between items-center p-2 border rounded">
                  <span class="text-sm font-medium">Task ${task.id?.slice(0, 8)}...</span>
                  <span class="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                    ${task.count} assignments
                  </span>
                </div>
              `).join('') :
              '<div class="text-sm text-gray-500">No tasks with assignments found.</div>'
            }
          </div>
        </div>
        
        <div>
          <h3 class="text-sm font-medium text-gray-900 mb-3">Most Active Students (Top 5)</h3>
          <div class="space-y-2">
            ${mostActiveStudents.length > 0 ? 
              mostActiveStudents.map(student => `
                <div class="flex justify-between items-center p-2 border rounded">
                  <span class="text-sm font-medium">${student.name}</span>
                  <span class="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                    ${student.count} assignments
                  </span>
                </div>
              `).join('') :
              '<div class="text-sm text-gray-500">No students with assignments found.</div>'
            }
          </div>
        </div>
      </div>
    </div>
  `;
}

// Load analytics data
async function loadAnalyticsData() {
  const list = document.getElementById('analytics-list');
  
  if (!list) return;
  
  loading = true;
  renderAnalytics(); // Show loading state
  
  try {
    // Fetch all data concurrently
    const [
      membersData,
      assignmentsData,
      uniqueStudentsIds,
      uniqueManagersIds,
      uniqueAuthorsIds
    ] = await Promise.all([
      readAllMembers(),
      readAllAssignments(),
      readUniqueStudents(),
      readUniqueManagers(),
      readUniqueAuthors(),
    ]);

    // Create profile map for all unique IDs
    const allUniqueIds = [
      ...uniqueStudentsIds,
      ...uniqueManagersIds,
      ...uniqueAuthorsIds,
    ];
    const uniqueProfileIds = [...new Set(allUniqueIds)];
    const profiles = await readProfilesByIds(uniqueProfileIds);
    profileMap = createProfileMap(profiles);

    // Set main data
    members = membersData;
    assignments = assignmentsData;
    uniqueStudents = uniqueStudentsIds.map(id => profileMap[id]).filter(Boolean);
    uniqueManagers = uniqueManagersIds.map(id => profileMap[id]).filter(Boolean);
    uniqueAuthors = uniqueAuthorsIds.map(id => profileMap[id]).filter(Boolean);

    // Calculate most active tasks
    const taskAssignmentCounts = {};
    assignmentsData.forEach(assignment => {
      taskAssignmentCounts[assignment.task_header_id] = (taskAssignmentCounts[assignment.task_header_id] || 0) + 1;
    });
    
    mostActiveTasks = Object.entries(taskAssignmentCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 5)
      .map(([id, count]) => ({
        id,
        name: 'Unknown Task',
        count,
      }));

    // Calculate most active students
    const studentAssignmentCounts = {};
    assignmentsData.forEach(assignment => {
      studentAssignmentCounts[assignment.student_id] = (studentAssignmentCounts[assignment.student_id] || 0) + 1;
    });
    
    mostActiveStudents = Object.entries(studentAssignmentCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 5)
      .map(([id, count]) => ({
        id,
        name: profileMap[id]?.name || 'Unknown Student',
        count,
      }));

  } catch (error) {
    console.error('Error loading analytics ', error);
    list.innerHTML = '<p class="text-red-600">Error loading analytics data</p>';
  } finally {
    loading = false;
    renderAnalytics();
  }
}

// Initial render
document.addEventListener('DOMContentLoaded', () => {
  loadAnalyticsData();
});