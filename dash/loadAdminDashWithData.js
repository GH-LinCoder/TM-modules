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

console.log('Imported: loadAdminDashWithData.js');

function updateStat(key, value) {
  const selector = `[data-stat="${key}"]`;
  updateAll(selector, value);
}



/**
 * Loads data and injects it into the admin dashboard
 */
export async function loadAdminDashWithData() {
  console.log('loadAdminDashWithData()');
  try {
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

    // Inject data into DOM
    injectStatsData(members, tasks, assignments, uniqueStudents, uniqueManagers, uniqueAuthors);
    injectManagementData(members, tasks, assignments, uniqueStudents, uniqueManagers, authorProfiles); //authorProfiles?
    injectActivityData(members, tasks, assignments);

    updateDeltas(members, assignments, tasks);

    console.log('Admin dashboard data fetched');
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    
    // Show error message
    const container = document.querySelector('#main-container') || 
    document.querySelector('#primary-panel') ||
    document.querySelector('[data-panel="inject-here"]')
    ;
    if (container) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4';
      errorDiv.innerHTML = '<strong>Error:</strong> loadAdminDashWithData() Failed.';
      container.insertBefore(errorDiv, container.firstChild);
    }
  }
}


/**
 * Injects data into the Quick Stats section
 */
function injectStatsData(members, tasks, assignments, uniqueStudents, uniqueManagers, uniqueAuthors) {
  // Update all instances of each data value
  updateAll('[data-value="members-count"]', members.length);
  updateAll('[data-value="assignments-count"]', assignments.length);
  updateAll('[data-value="tasks-count"]', tasks.length);
  updateAll('[data-value="authors-count-unique"]', uniqueAuthors.length);
  updateAll('[data-value="students-count-unique"]', uniqueStudents.length);
  updateAll('[data-value="managers-count-unique"]', uniqueManagers.length);

  // Debug logging
  //console.log('quickStats:', members, tasks, assignments, uniqueStudents, uniqueManagers, uniqueAuthors);
  
  // Verify elements were found and updated
  const stats = [
    { selector: '[data-value="members-count"]', value: members.length },
    { selector: '[data-value="assignments-count"]', value: assignments.length },
    { selector: '[data-value="tasks-count"]', value: tasks.length },
    { selector: '[data-value="authors-count-unique"]', value: uniqueAuthors.length },
    { selector: '[data-value="students-count-unique"]', value: uniqueStudents.length },
    { selector: '[data-value="managers-count-unique"]', value: uniqueManagers.length }
  ];

  stats.forEach(item => {
    const elements = document.querySelectorAll(item.selector);
    if (elements.length > 0) {
  //    console.log(`Found ${elements.length} element(s) for ${item.selector}, updated to ${item.value}`);
    } else {
      console.log(`NOT FOUND: ${item.selector}`);
    }
  });
}  

/**
 * Injects data into the Task & Member Management section
 */
function injectManagementData(members, tasks, assignments, uniqueStudents, uniqueManagers, authorProfiles) {
  // Update all instances of each data value
  updateAll('[data-value="members-count"]', members.length);
  updateAll('[data-value="assignments-count"]', assignments.length);
  updateAll('[data-value="tasks-count"]', tasks.length);
  updateAll('[data-value="authors-count"]', authorProfiles.length);//doesn't find this one but does find next 2  if the html has authors-count the js says '23' but if authors-count-unique it gets it right
  updateAll('[data-value="students-count"]', uniqueStudents.length); //need change html students-count-unique
  updateAll('[data-value="managers-count"]', uniqueManagers.length); //need change html managers-count-unique
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
      title: 'System event did not occur',
      description: 'Been a slow day',
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

// Add this at the top level
function updateAll(selector, value) {
  const elements = document.querySelectorAll(selector);
  if (elements.length === 0) {
    console.warn(`No elements found for selector: ${selector}`);
    return;
  }
  elements.forEach(el => {
    el.textContent = value;
  });
}

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
  
  updateAll('[data-delta="members-month"]', `+${newMembersThisMonth} new this month`);

  // New assignments this week
  const newAssignmentsThisWeek = assignments.filter(assignment => 
    new Date(assignment.assigned_at) > oneWeekAgo
  ).length;
  
  updateAll('[data-delta="assignments-week"]', `+${newAssignmentsThisWeek} this week`);

  // New tasks this month
  const newTasksThisMonth = tasks.filter(task => 
    new Date(task.created_at) > oneMonthAgo
  ).length;
  
  updateAll('[data-delta="tasks-month"]', `+${newTasksThisMonth} added this month`);
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