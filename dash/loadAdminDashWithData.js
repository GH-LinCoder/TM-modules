// ./dash/loadAdminDashWithData.js
import {executeIfPermitted} from '../registry/executeIfPermitted.js';

console.log('Imported: loadAdminDashWithData.js');


export async function loadAdminDashWithData() {
  console.log('loadAdminDashWithData()');
  // Update all instances of each data value

    //change 20:09 sept 13   trying to replace with the new memberCount()
    // completed 21:19  took 70 mins

    //19:13 Sept 19 2025 deleted all the old diret calls & the loading of functions from dataReaders 
    let count; // this was done line by line to test each one. Could be done in a loop
    count = await executeIfPermitted(null, 'membersCount', null); 
    updateAll('[data-value="members-count"]', count);
    
    count = await executeIfPermitted(null, 'assignmentsCount', null); 
    updateAll('[data-value="assignments-count"]', count);
  
   count = await executeIfPermitted(null, 'tasksCount', null); 
    updateAll('[data-value="tasks-count"]', count);

    count = await executeIfPermitted(null, 'surveysCount', null); 
    updateAll('[data-value="surveys-count"]', count);
  
    count = await executeIfPermitted(null, 'authorsCount', null);
    updateAll('[data-value="authors-count-unique"]', count);//doesn't find this one but does find next 2  if the html has authors-count the js says '23' but if authors-count-unique it gets it right
  
  
    count = await executeIfPermitted(null, 'studentsCount', null);
    updateAll('[data-value="students-count-unique"]', count); //need change html students-count-unique
   
    count = await executeIfPermitted(null, 'managersCount', null); 
    updateAll('[data-value="managers-count-unique"]', count); //need change html managers-count-unique

    count = await executeIfPermitted(null, 'approfilesCount', null); 
    updateAll('[data-value="approfiles-count"]', count);

    count = await executeIfPermitted(null, 'respondentsCount', null);
    updateAll('[data-value="respondents-count-unique"]', count); //need change html students-count-unique
  
    count = await executeIfPermitted(null, 'relationsCount', null);
    updateAll('[data-value="relations-count"]', count); 



    
  }


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


//////////////////////////   below not used     19:20 Sept 19 2025


//can't currently work as we aren't reading the relevant data
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

//what is this?
function updateStat(key, value) {
  const selector = `[data-stat="${key}"]`;
  updateAll(selector, value);
}