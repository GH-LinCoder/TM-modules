// ../work/tasks/displayTasksManager.js

import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { appState } from '../../state/appState.js';


console.log('displayTaskManager.js loaded');

export async function render(panel, query = {}) {
    const userId = appState.query.userId;
    panel.innerHTML = '<h3 class="text-xl font-bold mb-4">Tasks You Manage</h3>';
  console.log('displayTaskManager  render()');
    try {
      const assignments = await executeIfPermitted(userId, 'readManagerAssignments', {
        manager_id: userId
      });
  
      if (!assignments || assignments.length === 0) {
        panel.innerHTML += `<div class="text-gray-500 text-center py-8">You are not managing any tasks.</div>`;
        return;
      }
  
      const list = document.createElement('ul');
      list.className = 'space-y-4';
  
      assignments.forEach(task => {
        const item = document.createElement('li');
        item.className = 'bg-white p-4 rounded shadow border border-gray-200';
        item.innerHTML = `
          <div class="font-semibold text-gray-800">${task.task_name}</div>
          <div class="text-sm text-gray-600">Student: ${task.student_name}</div>
        `;
        list.appendChild(item);
      });
  
      panel.appendChild(list);
  
    } catch (error) {
      console.error('Error loading manager tasks:', error);
      panel.innerHTML += `<div class="text-red-500 text-center py-8">Failed to load tasks.</div>`;
      showToast('Failed to load manager tasks', 'error');
    }
  }
  