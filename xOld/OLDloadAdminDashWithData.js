// ./dash/loadAdminDashWithData.js
import { 
  readAllMembers,
  readAllTasks,
  readAllAssignments,
  readUniqueStudents,
  readUniqueManagers,
  readUniqueAuthors,
  readProfilesByIds
} from '../db/dataReader.js';
console.log('loadAdminDashWithData.js');
/**
 * Loads data and injects it into the admin dashboard
 */
export async function loadAdminDashWithData() {
  console.log('loadAdminDashWithData()');
  try {
    // Show loading state
    const statsCards = document.querySelector('[id="stats-cards"]');
    if (statsCards) { //the following line is stupid. This deletes all the design of the card
    //  statsCards.innerHTML = '<p class="text-center py-8 text-gray-500">Loading dashboard data...</p>';
    }

    // Fetch all data concurrently
    const [
      members,
      tasks,
      assignments,
      uniqueStudents,
      uniqueManagers,
      uniqueAuthors
    ] = await Promise.all([
      readAllMembers(),
      readAllTasks(),
      readAllAssignments(),
      readUniqueStudents(),
      readUniqueManagers(),
      readUniqueAuthors()
    ]);

    // Get profiles for authors
    const authorProfiles = await readProfilesByIds(uniqueAuthors);
//document.addEventListener('DOMContentLoaded', function() {


// Debug: Check if the element exists
console.log('Looking for data-value="authors-count-unique"');

// Check all elements with data-value
const allDataValues = document.querySelectorAll('[data-value]');
console.log('All data-value elements:', Array.from(allDataValues).map(el => el.getAttribute('data-value')));

// Try to find the specific element
const authorsCount = document.querySelector('[data-value="authors-count-unique"]');
console.log('authorsCount element:', authorsCount);

if (authorsCount) {
    console.log('Element found - updating content');
    authorsCount.textContent = uniqueAuthors.length;
} else {
    console.log('Element not found - check HTML and DOM loading timing');
}


    // Inject data into DOM
    injectStatsData(members, tasks, assignments, uniqueStudents, uniqueManagers, uniqueAuthors);
    injectManagementData(members, tasks, assignments, uniqueStudents, uniqueManagers, authorProfiles);
    injectActivityData(members, tasks, assignments);
//});
    console.log('Admin dashboard data loaded successfully');
  } catch (error) {
    console.error('Error loading admin dashboard data:', error);
    
    // Show error message
    const container = document.querySelector('.container');
    if (container) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4';
      errorDiv.innerHTML = '<strong>Error:</strong> Failed to load dashboard data. Please try again.';
      container.insertBefore(errorDiv, container.firstChild);
    }
  }
}

/**
 * Injects data into the Quick Stats section
 */
function injectStatsData(members, tasks, assignments, uniqueStudents, uniqueManagers, uniqueAuthors) {
  // Members
  const membersCount = document.querySelector('[data-value="members-count"]');
  if (membersCount) {
    membersCount.textContent = members.length;
  }
console.log('quickStats:',members, tasks, assignments, uniqueStudents, uniqueManagers, uniqueAuthors);
  // Assignments
  const assignmentsCount = document.querySelector('[data-value="assignments-count"]');
  if (assignmentsCount) {
    assignmentsCount.textContent = assignments.length;
  }
console.log('quickStats:assign',assignmentsCount.textContent);
  // Tasks
  const tasksCount = document.querySelector('[data-value="tasks-count"]');
  if (tasksCount) {
    tasksCount.textContent = tasks.length;
  }
console.log('quickStats:task',tasksCount.textContent);
  
// these next 3 querySelector cannot find the locations.
// Authors
  const authorsCount = document.querySelector('[data-value="authors-count-unique"]');
  if (authorsCount) {console.log('quickStats: authorsCount found');
    authorsCount.textContent = uniqueAuthors.length;
  } else console.log('quickStats:authorsCount not found ');
//console.log('quickStats:author',authorsCount.textContent);

  // Students
  const studentsCount = document.querySelector('[data-value="students-count-unique"]');
  if (studentsCount) { console.log('studentCount found');
    studentsCount.textContent = uniqueStudents.length;
  } else console.log('studentCount missing');
//console.log('quickStats:student',studentsCount.textContent);
  // Managers
  const managersCount = document.querySelector('[data-value="managers-count-unique"]');
  if (managersCount) { console.log('managerCount found');
    managersCount.textContent = uniqueManagers.length;
  } else console.log('managerCount missing');
console.log('quickStats:manager',managersCount.textContent);

  // Update deltas with recent activity calculations
//  updateDeltas(members, assignments, tasks);
}  

/**
 * Injects data into the Task & Member Management section
 */
function injectManagementData(members, tasks, assignments, uniqueStudents, uniqueManagers, authorProfiles) {
  // Members count
  const membersValue = document.querySelector('[data-value="members-count"]');
  if (membersValue) {
    membersValue.textContent = members.length;
  }

  // Assignments count
  const assignmentsValue = document.querySelector('[data-value="assignments-count"]');
  if (assignmentsValue) {
    assignmentsValue.textContent = assignments.length;
  }

  // Tasks count
  const tasksValue = document.querySelector('[data-value="tasks-count"]');
  if (tasksValue) {
    tasksValue.textContent = tasks.length;
  }

  // Authors count
  const authorsValue = document.querySelector('[data-value="authors-count"]');
  if (authorsValue) {
    authorsValue.textContent = authorProfiles.length;
  }

  // Students count
  const studentsValue = document.querySelector('[data-value="students-count"]');
  if (studentsValue) {
    studentsValue.textContent = uniqueStudents.length;
  }

  // Managers count
  const managersValue = document.querySelector('[data-value="managers-count"]');
  if (managersValue) {
    managersValue.textContent = uniqueManagers.length;
  }
}

/**
 * Injects recent activity data
 */
function injectActivityData(members, tasks, assignments) {
  const activityList = document.getElementById('activity-list');
  if (!activityList) return;

  // Clear existing content
  activityList.innerHTML = '';

  // Create recent activity items (most recent first)
  const activities = [];

  // New member registration
  if (members.length > 0) {
    const latestMember = members.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
    if (latestMember) {
      activities.push({
        type: 'new-member',
        title: 'New member registered',
        description: `${latestMember.username}`,
        time: formatTimeAgo(latestMember.created_at)
      });
    }
  }

  // Recent task creation
  if (tasks.length > 0) {
    const latestTask = tasks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
    if (latestTask) {
      activities.push({
        type: 'task-created',
        title: 'New task created',
        description: latestTask.name,
        time: formatTimeAgo(latestTask.created_at)
      });
    }
  }

  // Recent assignment
  if (assignments.length > 0) {
    const latestAssignment = assignments[0]; // Already sorted by assigned_at
    const task = tasks.find(t => t.id === latestAssignment.task_header_id);
    if (task) {
      activities.push({
        type: 'member-assigned',
        title: 'Member assigned to task',
        description: task.name,
        time: formatTimeAgo(latestAssignment.assigned_at)
      });
    }
  }

  // Add placeholder activities to fill gaps
  while (activities.length < 4) {
    activities.push({
      type: 'placeholder',
      title: 'System event occurred',
      description: 'Additional activity',
      time: `${Math.floor(Math.random() * 6) + 1} hours ago`
    });
  }

  // Render activities
  activities.slice(0, 4).forEach(activity => {
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    activityItem.setAttribute('data-activity', activity.type);
    
    activityItem.innerHTML = `
      <p class="text-sm"><strong>${activity.title}</strong></p>
      <p class="text-xs text-gray-600">${activity.description}</p>
      <p class="text-xs text-gray-400">${activity.time}</p>
    `;
    
    activityList.appendChild(activityItem);
  });
}

/**
 * Updates delta values (e.g., "+8 new this month")
 */
function updateDeltas(members, assignments, tasks) {
  const now = new Date();
  const oneMonthAgo = new Date(now);
  oneMonthAgo.setMonth(now.getMonth() - 1);
  
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(now.getDate() - 7);

  // New members this month
  const newMembersThisMonth = members.filter(member => 
    new Date(member.created_at) > oneMonthAgo
  ).length;
  
  const membersDelta = document.querySelector('[data-delta="members-month"]');
  if (membersDelta) {
    membersDelta.textContent = `+${newMembersThisMonth} new this month`;
  }

  // New assignments this week
  const newAssignmentsThisWeek = assignments.filter(assignment => 
    new Date(assignment.assigned_at) > oneWeekAgo
  ).length;
  
  const assignmentsDelta = document.querySelector('[data-delta="assignments-week"]');
  if (assignmentsDelta) {
    assignmentsDelta.textContent = `+${newAssignmentsThisWeek} this week`;
  }

  // New tasks this month
  const newTasksThisMonth = tasks.filter(task => 
    new Date(task.created_at) > oneMonthAgo
  ).length;
  
  const tasksDelta = document.querySelector('[data-delta="tasks-month"]');
  if (tasksDelta) {
    tasksDelta.textContent = `+${newTasksThisMonth} added this month`;
  }
}

/**
 * Format timestamp as "X minutes/hours/days ago"
 */
function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
}