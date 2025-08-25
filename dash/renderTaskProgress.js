// ./dash/taskProgress.js

// Render a task progress card. It includes an indicator of how far along the student is
function createTaskProgress(task, role = 'student', onViewDetails = null, onMessage = null) {
  const progressPercentage = (task.currentStage / task.totalStages) * 100;
  
  return `
    <div class="task-progress bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow" data-task-id="${task.id}">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-lg font-semibold text-gray-900">${task.name}</h3>
        <span class="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
          Stage ${task.currentStage} of ${task.totalStages}
        </span>
      </div>
      <p class="text-gray-600 text-sm mb-4">${task.description}</p>
      
      <div class="space-y-2 mb-4">
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-500">Progress</span>
          <span class="font-medium">${Math.round(progressPercentage)}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-blue-600 h-2 rounded-full" style="width: ${progressPercentage}%"></div>
        </div>
      </div>
      
      <div class="grid md:grid-cols-2 gap-4 text-sm mb-4">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          <span class="text-gray-500">Manager:</span>
          <span class="font-medium">${task.manager.name}</span>
        </div>
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <span class="text-gray-500">Assigned:</span>
          <span class="font-medium">${task.assignedDate}</span>
        </div>
      </div>
      
      <div class="flex flex-wrap gap-2 pt-2">
        ${onViewDetails ? `
          <button 
            class="flex items-center gap-2 px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm"
            data-action="view-details"
            data-task-id="${task.id}"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
            </svg>
            View Details
          </button>
        ` : ''}
        
        ${onMessage && role === 'student' ? `
          <button 
            class="flex items-center gap-2 px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm"
            data-action="message-manager"
            data-task-id="${task.id}"
          >
            Message Manager
          </button>
        ` : ''}
      </div>
    </div>
  `;
}

// Function to render a list of task progress cards
export function renderTaskProgress(container, tasks, role = 'student', onViewDetails = null, onMessage = null) {
  if (!container) return;
  
  const html = tasks.map(task => 
    createTaskProgress(task, role, onViewDetails, onMessage)
  ).join('');
  
  container.innerHTML = html;
  
  // Set up event listeners
  if (onViewDetails) {
    container.querySelectorAll('[data-action="view-details"]').forEach(button => {
      button.addEventListener('click', (e) => {
        const taskId = e.currentTarget.getAttribute('data-task-id');
        onViewDetails(taskId);
      });
    });
  }
  
  if (onMessage) {
    container.querySelectorAll('[data-action="message-manager"]').forEach(button => {
      button.addEventListener('click', (e) => {
        const taskId = e.currentTarget.getAttribute('data-task-id');
        onMessage(taskId);
      });
    });
  }
}

// Example usage:
/*
const tasks = [
  {
    id: 1,
    name: "Frontend Development Course",
    description: "Complete React and TypeScript fundamentals",
    currentStage: 3,
    totalStages: 8,
    stageName: "Component Architecture",
    stageDescription: "Learn about component composition and state management patterns",
    manager: { name: "Sarah Wilson", id: 2 },
    author: { name: "Mike Johnson", id: 3 },
    assignedDate: "Feb 1, 2024"
  }
];

// In your member dashboard render function:
renderTaskProgress(
  document.getElementById('my-tasks-container'), 
  tasks, 
  'student',
  (taskId) => console.log('View details for task:', taskId),
  (taskId) => console.log('Message manager for task:', taskId)
);
*/