// ./work/dash/myDash.js
console.log('myDash.js loaded');
import { petitionBreadcrumbs } from '../../ui/breadcrumb.js';
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';
import { appState } from '../../state/appState.js';


function getTemplateHTML() {
  return `
<!-- DASHBOARD TOGGLE & TITLE -->
<div class="px-6 py-4 border-b bg-green-200 flex justify-between items-center">
  <div class="name" title="Toggle between admin & my dashboard">
    <!--div class="text-sm text-blue-600 hover:underline" data-action="toggle-dash">my/Admin</div-->
  </div>

  <div>
    <h1 class="text-2xl font-bold" data-dash-title="admin">My Dashboard</h1>
    <p class="text-sm text-gray-500" data-dash-sub_title="my">Check my tasks, update my details, manage my students...</p>
  </div>
  <!--button class="text-sm text-blue-600 hover:underline" onclick="signOut()">Sign out</button-->
</div>

<!-- MAIN DASHBOARD CONTENT -->
<div class="container mx-auto px-4 py-8 flex flex-col gap-8">

  <!-- PROFILE CARD  -->
  <div class="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row items-center md:items-start gap-8" data-component="profile-card">
    
    <!-- Left side: Avatar and Name -->
    <div class="flex-shrink-0 text-center">
      <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-semibold" data-user="avatar">
        <span data-user="initials">JD</span>
      </div>
      <h6 class="text-xl font-semibold" data-user="name">John Doe</h6>
    </div>

    <!-- Right side: User Details and Edit Button -->
    <div class="flex-1 space-y-4">
      <div class="space-y-3 text-sm text-gray-600">
        <div class="flex items-center gap-2 flex-wrap">
          <span data-user="email">john.doe@example.com</span>
          <span data-user="mid"><b>ID:</b> <span data-user="student-id">1c8557ab...</span></span>       
          <span data-user="join-date"><b>Joined:</b> 24 August 2025</span>
          <span data-user="last-login"><b>Last login:</b> 2:30 PM 24 August 2025</span>
        </div>
      
        <button 
          class="w-full border border-gray-300 rounded-lg py-2 text-sm font-medium hover:bg-gray-50"
          data-action="edit-profile"
        >
          Edit <span class="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm" data-user="role">my</span> Profile
        </button>
      </div>
    </div>
  </div>

  <!-- STATS OVERVIEW -->
  <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4" data-section="stats">
    <div class="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center" data-stat="active-tasks">
      <div class="p-2 bg-blue-100 rounded-lg mr-3">
        <div class="w-6 h-6"></div>
      </div>
      <div>
        <p class="text-sm text-gray-500">Active Tasks</p>
        <p class="text-2xl font-bold" data-value="active-tasks">0</p>
        <p class="text-xs text-gray-500">Currently in progress</p>
      </div>
    </div>
    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center" data-stat="completed-tasks">
      <div class="p-2 bg-green-100 rounded-lg mr-3">
        <div class="w-6 h-6"></div>
      </div>
      <div>
        <p class="text-sm text-gray-500">Completed Tasks</p>
        <p class="text-2xl font-bold" data-value="completed-tasks">0</p>
        <p class="text-xs text-gray-500">Successfully finished</p>
      </div>
    </div>
    <div class="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center" data-stat="abandoned-tasks">
      <div class="p-2 bg-red-100 rounded-lg mr-3">
        <div class="w-6 h-6"></div>
      </div>
      <div>
        <p class="text-sm text-gray-500">Abandoned Tasks</p>
        <p class="text-2xl font-bold" data-value="abandoned-tasks">0</p>
        <p class="text-xs text-gray-500">Previously stopped</p>
      </div>
    </div>
    <div class="bg-white rounded-lg shadow p-4 flex items-center" data-stat="available-tasks">
      <div class="p-2 bg-indigo-100 rounded-lg mr-3">
        <div class="w-6 h-6"></div>
      </div>
      <div>
        <p class="text-sm text-gray-500">Available Tasks</p>
        <p class="text-2xl font-bold" data-value="available-tasks">0</p>
        <p class="text-xs text-gray-500">Ready to join</p>
      </div>
    </div>
  </div>

  <!-- MY TASKS -->
  <div data-section="my-tasks">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold">My Tasks</h2>
      <div class="flex gap-2">
        <button 
          class="border border-gray-300 rounded-lg px-3 py-1 text-sm flex items-center gap-2 hover:bg-gray-50"
          data-action="browse-tasks"
        >
          Browse All Tasks
        </button>
        <button 
          class="border border-blue-300 bg-blue-50 text-blue-700 rounded-lg px-3 py-1 text-sm flex items-center gap-2 hover:bg-blue-100"
          data-action="refresh-tasks"
        >
          Refresh
        </button>
      </div>
    </div>
    <div class="space-y-6" data-list="my-tasks">
      <!-- Tasks will be loaded here dynamically -->
      <div class="text-center py-8 text-gray-500" data-placeholder="loading">
        My tasks would be loaded here...
      </div>
    </div>
  </div>

  <!-- MY STUDENTS -->
  <div data-section="my-students">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold">My Students</h2>
      <button 
        class="border border-gray-300 rounded-lg px-3 py-1 text-sm flex items-center gap-2 hover:bg-gray-50"
        data-action="view-all-students"
      >
        View All
      </button>
    </div>
    <div class="bg-white rounded-lg shadow p-12 text-center" data-placeholder="no-students">
      <h3 class="text-lg font-semibold mb-2">No Students Assigned</h3>
      <p class="text-gray-500 mb-4">You haven't been assigned as a manager for any tasks yet.</p>
    </div>
  </div>

  <!-- QUICK ACTIONS -->
  <div class="bg-white rounded-lg shadow p-6" data-section="quick-actions">
    <h3 class="text-lg font-semibold mb-2">Quick Actions</h3>
    <p class="text-gray-500 text-sm mb-4">Common tasks and shortcuts</p>
    <div class="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
      <button class="flex flex-col items-center gap-2 p-4 border rounded hover:bg-gray-50" data-action="invite-friend">
        <span class="text-sm">Invite a Friend</span>
      </button>
      <button class="flex flex-col items-center gap-2 p-4 border rounded hover:bg-gray-50" data-action="copy-recruit-link">
        <span class="text-sm">Copy Recruit Link</span>
      </button>
      <button class="flex flex-col items-center gap-2 p-4 border rounded hover:bg-gray-50" data-action="check-rewards">
        <span class="text-sm">Check Rewards</span>
      </button>
      <button class="flex flex-col items-center gap-2 p-4 border rounded hover:bg-gray-50" data-action="update-profile">
        <span class="text-sm">Update Profile</span>
      </button>
      <button class="flex flex-col items-center gap-2 p-4 border rounded hover:bg-gray-50" data-action="contact-support">
        <span class="text-sm">Contact Support</span>
      </button>
    </div>
  </div>
</div>

`;
}

// GET STUDENT ID FROM CLIPBOARD OR USE DEFAULT
function getCurrentStudentId() {  //If admin has selected an appro as student or as other, use that id
  const clipboardStudents = getClipboardItems({ as: 'student', type: 'app-human' });
  const clipboardOther = getClipboardItems({ as: 'other', type: 'app-human' });
  
  if (clipboardStudents.length > 0) {
    return clipboardStudents[0].entity.id;
  }
  if (clipboardOther.length > 0) {
    return clipboardOther[0].entity.id;
  }
  const DEV_STUDENT_ID = '1c8557ab-12a5-4199-81b2-12aa26a61ec5';

  
  // Fallback to DEV student ID
  return DEV_STUDENT_ID; // DEV fallback student ID (replace with real auth later)
//

}





// ✅ RENDER SINGLE TASK CARD
function renderTaskCard(assignment) {
  const isAbandoned = assignment.step_order === 1;
  const isCompleted = assignment.step_order === 2;
  const isActive = assignment.step_order >= 3;
  
  let statusBadge = '';
  if (isAbandoned) {
    statusBadge = '<span class="inline-block px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Abandoned</span>';
  } else if (isCompleted) {
    statusBadge = '<span class="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Completed</span>';
  } else if (isActive) {
    statusBadge = `<span class="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Step ${assignment.step_order}</span>`;
  }

  return `
    <div class="bg-white rounded-lg shadow p-6" data-task-id="${assignment.task_header_id}" data-assignment-id="${assignment.assignment_id}">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <h3 class="text-lg font-semibold">${assignment.task_name || 'Untitled Task'}</h3>
          <p class="text-gray-600 text-sm">${assignment.task_description || 'No description'}</p>
          <div class="mt-2 text-sm text-gray-500">
            <span class="font-medium">Manager:</span> ${assignment.manager_name || 'Not assigned'}
            <span class="mx-2">•</span>
            <span class="font-medium">Assigned:</span> ${new Date(assignment.assigned_at).toLocaleDateString()}
          </div>
        </div>
        <div class="flex gap-2">
          <button class="text-blue-600 hover:underline text-sm" data-action="view-details" data-assignment-id="${assignment.assignment_id}">
            View Details
          </button>
          <button class="text-blue-600 hover:underline text-sm" data-action="message-manager">
            Message
          </button>
        </div>
      </div>
      
      <div class="mt-4 bg-gray-50 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            ${statusBadge}
            <h4 class="font-medium mt-2">${assignment.step_name || 'No step name'}</h4>
            <p class="text-sm text-gray-600 mt-1">
              ${assignment.step_description ? assignment.step_description.substring(0, 150) + (assignment.step_description.length > 150 ? '...' : '') : 'No description'}
            </p>
          </div>
          ${isActive ? `
            <button class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700" 
                    data-action="advance-task" 
                    data-assignment-id="${assignment.assignment_id}">
              Advance Step
            </button>
          ` : ''}
        </div>
      </div>
    </div>
       ${petitionBreadcrumbs()} 
  `;
}

// ✅ LOAD REAL STUDENT PROFILE DATA
async function loadStudentProfile(panel, studentId) {
    try {
      // Get student approfile
      if(!studentId) return;
      const studentProfile = await executeIfPermitted(
        appState.query.userId,
        'readApprofileById',
        { approfileId: studentId }
      );
      
      if (!studentProfile) return;
      
      // Update profile card
      const nameEl = panel.querySelector('[data-user="name"]');
      const emailEl = panel.querySelector('[data-user="email"]');
      const initialsEl = panel.querySelector('[data-user="initials"]');
      const studentIdEl = panel.querySelector('[data-user="student-id"]');
      
      if (nameEl) nameEl.textContent = studentProfile.name || 'Unknown';
      if (emailEl) emailEl.textContent = studentProfile.email || 'No email';
      if (studentIdEl) studentIdEl.textContent = studentId.substring(0, 8) + '...';
      
      // Set initials
      if (initialsEl && studentProfile.name) {
        const initials = studentProfile.name
          .split(' ')
          .map(word => word[0])
          .join('')
          .substring(0, 2)
          .toUpperCase();
        initialsEl.textContent = initials;
      }
      
      // TODO: Add real join date and last login when you have that data
      const joinDateEl = panel.querySelector('[data-user="join-date"]');
      const lastLoginEl = panel.querySelector('[data-user="last-login"]');
      if (joinDateEl) joinDateEl.innerHTML = `<b>Joined:</b> ${studentProfile.created_at ? new Date(studentProfile.created_at).toLocaleDateString() : 'Unknown'}`;
      if (lastLoginEl) lastLoginEl.innerHTML = `<b>Last login:</b> ${new Date().toLocaleString()}`;
      
    } catch (error) {
      console.error('Error loading student profile:', error);
    }
  }



// ✅ LOAD TASKS FOR CURRENT STUDENT
async function loadStudentTasks(panel) {
  let studentId = getCurrentStudentId();
  if(studentId) {
  const taskList = panel.querySelector('[data-list="my-tasks"]');

  try {
    // ✅ USE YOUR EXISTING REGISTRY FUNCTION
    const assignments = await executeIfPermitted(
      appState.query.userId, 
      'readStudentAssignments', 
      { student_id: studentId }
    );
  
    // Update student ID display
    const studentIdEl = panel.querySelector('[data-user="student-id"]');
    if (studentIdEl) {
      studentIdEl.textContent = studentId.substring(0, 8) + '...';
    }
    
    if (assignments.length === 0) {
      taskList.innerHTML = '<div class="text-center py-8 text-gray-500">No tasks assigned yet.</div>';
      return;
    }
    
    // Render tasks
    taskList.innerHTML = assignments.map(renderTaskCard).join('');
    
    // Update stats
    const activeTasks = assignments.filter(a => a.step_order >= 3).length;
    const completedTasks = assignments.filter(a => a.step_order === 2).length;
    const abandonedTasks = assignments.filter(a => a.step_order === 1).length;
    
    panel.querySelector('[data-value="active-tasks"]').textContent = activeTasks;
    panel.querySelector('[data-value="completed-tasks"]').textContent = completedTasks;
    panel.querySelector('[data-value="abandoned-tasks"]').textContent = abandonedTasks;
    
    // Add event listeners
    addTaskEventListeners(panel, assignments);
    
  } catch (error) {
    console.error('Error loading student tasks:', error);
    taskList.innerHTML = `
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p class="text-red-800">Failed to load tasks: ${error.message}</p>
        <button class="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" data-action="retry-load">
          Retry
        </button>
      </div>
    `;
  }
 }
}

// ✅ ADD EVENT LISTENERS FOR TASK ACTIONS
function addTaskEventListeners(panel, assignments) {
  // View Details - opens moveStudent
  panel.querySelectorAll('[data-action="view-details"]').forEach(button => {
    button.addEventListener('click', (e) => {
      const assignmentId = e.target.dataset.assignmentId;
      openMoveStudent(assignmentId);
    });
  });
  
  // Advance Task - direct advancement
  panel.querySelectorAll('[data-action="advance-task"]').forEach(button => {
    button.addEventListener('click', (e) => {
      const assignmentId = e.target.dataset.assignmentId;
      openMoveStudent(assignmentId);
    });
  });
  
  // Refresh button
  const refreshBtn = panel.querySelector('[data-action="refresh-tasks"]');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadStudentTasks(panel);
    });
  }
  
  // Retry button
  const retryBtn = panel.querySelector('[data-action="retry-load"]');
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      loadStudentTasks(panel);
    });
  }
}

// ✅ OPEN MOVE STUDENT MODULE
function openMoveStudent(assignmentId) {
  // Create new panel (adapt to your existing panel system)
  const newPanel = document.createElement('div');
  newPanel.className = 'dashboard-panel';
  
  // Find the dashboard container and add the panel
  const dashboard = document.querySelector('.container.mx-auto');
  if (dashboard) {
    dashboard.parentElement.appendChild(newPanel);
  } else {
    document.body.appendChild(newPanel);
  }
  
  // Import and render moveStudent
  import('../student/moveStudent.js').then((module) => {
    module.render(newPanel, { assignment_id: assignmentId });
  }).catch((error) => {
    console.error('Failed to load moveStudent:', error);
    newPanel.innerHTML = '<div class="p-4 text-red-600">Failed to load task details.</div>';
  });
}

export function render(panel, petition = {}) {
  console.log('myDash Render(', panel, petition, ')');
  panel.innerHTML = getTemplateHTML();
 // panel.innerHTML += petitionBreadcrumbs();
 onClipboardUpdate(() => {
  let  studentId = getCurrentStudentId();
  loadStudentProfile(panel, studentId);

    // Load tasks
    loadStudentTasks(panel);
    });
  // Load tasks after a brief delay to ensure DOM is ready
  setTimeout(async () => {
    const studentId = getCurrentStudentId();

    // ✅ LOAD STUDENT PROFILE
    await loadStudentProfile(panel, studentId);
    
    // Load tasks
    loadStudentTasks(panel);
  }, 100);
}