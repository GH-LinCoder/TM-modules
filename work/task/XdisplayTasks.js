import { appState } from '../../state/appState.js';
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';
import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';

// displayTasks.js - Read-only task display
export function render(panel, query = {}) {
    console.log('displayTasks.render()', panel, query);
    
    const display = new TaskDisplay();
    display.render(panel, query);
}

class TaskDisplay {
    async render(panel, query = {}) {
        console.log('TaskDisplay.render()', panel, query);
        
        const studentId = query.student || this.getCurrentStudentId();
        
        try {
            // READ TASK ASSIGNMENTS:
            const assignments = await executeIfPermitted(
                studentId, 
                'readStudentAssignments', 
                { student_id: studentId }
            );
            
            if (!assignments || assignments.length === 0) {
                panel.innerHTML = this.getNoTasksHTML();
                return;
            }
            
            // RENDER READ-ONLY TASK CARDS:
            panel.innerHTML = this.getTaskDisplayHTML(assignments);
            
        } catch (error) {
            console.error('Error loading tasks:', error);
    //        panel.innerHTML = this.getErrorHTML(error.message);
        }
    }
    
    getTaskDisplayHTML(assignments) {
        return `
            <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-xl font-semibold mb-4">My Task Assignments</h2>
                <div class="space-y-4">
                    ${assignments.map(assignment => this.renderReadOnlyTaskCard(assignment)).join('')}
                </div>
            </div>
        `;
    }
    
    renderReadOnlyTaskCard(assignment) {
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
            <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-semibold text-lg">${assignment.task_name}</h3>
                        <p class="text-gray-600 text-sm">${assignment.task_description}</p>
                        <div class="mt-2 text-xs text-gray-500">
                            Assigned: ${new Date(assignment.assigned_at).toLocaleDateString()}
                            ${assignment.manager_name ? ` | Manager: ${assignment.manager_name}` : ''}
                        </div>
                    </div>
                    <div>${statusBadge}</div>
                </div>
                
                <!-- CURRENT STEP DISPLAY (READ-ONLY) -->
                <div class="mt-4 p-3 bg-white rounded border">
                    <div class="text-sm font-medium">Current Step: ${assignment.step_order}</div>
                    <h4 class="text-lg font-bold">${assignment.step_name}</h4>
                    <p class="text-sm text-gray-600">${assignment.step_description}</p>
                </div>
            </div>
        `;
    }
}