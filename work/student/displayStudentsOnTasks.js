// ./work/tasks/displayPendingManagerTasks.js
import { appState } from '../../state/appState.js';
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { resolveSubject } from '../../utils/contextSubjectHideModules.js';

console.log('displayStudentsOnTasks.js loaded');

export async function render(panel, query = {}) {
  console.log('Render pending manager tasks:', panel, query);
  
  panel.innerHTML = '<div class="p-4 text-gray-600 flex items-center gap-2"><span class="animate-spin">⏳</span> Loading pending requests...</div>';

  try {
    // ✅ Get the current logged-in user's ID directly, no need for petition.student
    const subject = await resolveSubject();
    const userId = subject.id;
    


    // ✅ Call the combined registry function we designed
    const pendingTasks = await executeIfPermitted(
      userId,
      'readPendingManagerTasks',
      { user_id: userId }
    );

    if (!pendingTasks || pendingTasks.length === 0) {
      panel.innerHTML = `
        <div class="text-gray-500 text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <p class="text-lg font-medium">All caught up! 🎉</p>
          <p class="text-sm">No students are currently waiting for your approval to move to the next step.</p>
        </div>`;
      return;
    }
console.log('pending tasks',pendingTasks); // this has task_header_id: "2e8a83a9-90cd-4f98-a586-6bf3c618a6b9" }
    // ✅ Group by task to show one summary card per task
    const taskMap = new Map();
   const assignmentRoles = {};

pendingTasks.forEach(row => {
  
  assignmentRoles[row.assignment_id] = row.manager_role;
    
  const headerId = row.assignment?.task_header_id;

  if (!taskMap.has(headerId)) {
    taskMap.set(headerId, {
      task_header_id: headerId, 
      task_name: row.task_name,
      task_description: row.task_description,
      manager_role: row.manager_role,
      waiting_count: 0,
      max_delay_hours: 0
    });
  }
  
  const task = taskMap.get(headerId);
  task.waiting_count += 1;
  
  if (row.move_me_at) {
    const hours = (Date.now() - new Date(row.move_me_at).getTime()) / (1000 * 60 * 60);
    if (hours > task.max_delay_hours) task.max_delay_hours = hours;
  }
});
    appState.query.petitioner.assignmentRoles = assignmentRoles;
    const tasksArray = Array.from(taskMap.values());

    // ✅ Render the summary cards
    panel.innerHTML = `<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4" data-list="pending-manager-tasks"></div>`;
    const container = panel.querySelector('[data-list="pending-manager-tasks"]');
    container.innerHTML = '';

    tasksArray.forEach(task => {
      const card = document.createElement('div');
      console.log('task',task);
      // Visual cue for urgency and role
      let roleBadge = '';
     // if (task.manager_role === 'default') roleBadge = '<span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Default Manager</span>';
    //  else if (task.manager_role === 'author') roleBadge = '<span class="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">Author (Fallback)</span>';
    //  else if (task.manager_role === 'assigned') roleBadge = '<span class="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">Assigned</span>';
    //   appState.query.petitioner.managerRole = task.manager_role;
    // console.log('managerRole:', appState.query.petitioner.managerRole); //really should use setPetion not arbitrary assignments
     
      let urgencyText = task.max_delay_hours > 24 ? '🔴 Days late' : (task.max_delay_hours > 2 ? '🟡 hours late' : '🟢 Recent');

      card.className = 'bg-white border border-blue-200 rounded-lg p-4 cursor-pointer hover:shadow-md hover:border-blue-400 transition-all flex justify-between items-center';
      
      // ✅ This data-action will trigger your existing Kanban module!
      // Make sure 'display-manager-kanban' matches the data-action registered for moveStudentManager.js
      card.dataset.action = 'move-student-manager'; 
      card.dataset.destination = 'display-area';
      card.dataset.taskHeaderId = task.task_header_id; 
//never read?
//or pass via appState?
console.log('task.task_header_id',task.task_header_id); 
 card.addEventListener('click', () => {
  appState.query.petitioner.taskHeaderId = task.task_header_id;
});

      card.innerHTML = `
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <h4 class="text-sm font-semibold text-blue-800">${task.task_name}</h4>


  <button data-action="display-pending-manager-tasks" data-module="pending-manager-tasks" data-section="display-area" data-destination="display-area" class="text-gray-500 hover:text-gray-700" aria-label="Close">
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
  </button>

            ${roleBadge}
          </div>
          <p class="text-xs text-gray-600 mb-2 line-clamp-2">${task.task_description || ''}</p>
          <div class="flex items-center gap-3 text-xs font-medium">
            <span class="text-blue-600 font-bold">${task.waiting_count} student(s) waiting</span>
            <span>${urgencyText}</span>
          </div>
        </div>
        <span class="text-blue-500 text-2xl ml-2">›</span>
      `;
//21:22 sept 8




      container.appendChild(card);
    });

  } catch (err) {
    console.error('Error loading pending manager tasks:', err);
      panel.innerHTML = `<div class="text-red-600 p-4 bg-red-50 rounded-lg border border-red-200">Error loading data: ${err.message}</div>`;
  }
}