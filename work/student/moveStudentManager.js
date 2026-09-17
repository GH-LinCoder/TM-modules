//  ./work/task/moveStudentManager.js

import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { appState } from '../../state/appState.js';
console.log('moveStudentManager.js loaded');
import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';
import {showToast} from'../../ui/showToast.js';


// ✅ TEMPORARY TEST: Hardcode a known task_header_id from your database
//const TEST_TASK_ID = '2e8a83a9-90cd-4f98-a586-6bf3c618a6b9'; //

// "dc9a0e71-4adf-42e7-8649-3620089e4df8" is welcome task but move_by student
// 13251a74-a898-480c-93b3-35ef7f8226ca default task placeholder
//2e8a83a9-90cd-4f98-a586-6bf3c618a6b9 a test task - move_by manager with severl steps and seeded student move_by


// 11:03 Sept 10 'managerRole' is not defined

/**
 * Determines if a drop is allowed based on user permissions.
 * @param {number} currentStep - The step the student is currently in.
 * @param {number} targetStep - The step the student is being dropped into.
 * @param {boolean} managerRole - True if the user is the assigned or default manager (or author of the task).
 * @returns {boolean} True if the drop is allowed.
 */
function isDropAllowed(currentStep, targetStep, managerRole) {
console.log('isDropDownAllowed()', currentStep, targetStep);

if (managerRole && !(targetStep===currentStep+1)) return false;
else if(managerRole && targetStep===currentStep+1) return true ;
//else if (future test of admins) return true; 
else return false; 
}



function addDragDropListeners(panel) { // ✅ Removed managerRole parameter
  console.log('🖱️ Initializing drag and drop.');
  
  const draggableCards = panel.querySelectorAll('.student-card[draggable="true"]');
  const dropZones = panel.querySelectorAll('.students-container');

  draggableCards.forEach(card => {
    card.addEventListener('dragstart', (e) => {
      const dragData = {
        studentId: card.dataset.studentId,
        assignmentId: card.dataset.assignmentId,
        currentStep: parseInt(card.dataset.currentStep, 10),
        managerRole: card.dataset.managerRole // ✅ READ FROM THE CARD!
      };
      e.dataTransfer.setData('application/json', JSON.stringify(dragData));
      e.dataTransfer.effectAllowed = 'move';
      card.classList.add('opacity-50', 'border-dashed', 'border-gray-400');
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('opacity-50', 'border-dashed', 'border-gray-400');
      dropZones.forEach(zone => zone.classList.remove('bg-blue-50', 'border-blue-300', 'border-dashed'));
    });
  });

  dropZones.forEach(zone => {
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      const dataStr = e.dataTransfer.getData('application/json');
      if (!dataStr) return;
      
      const data = JSON.parse(dataStr);
      const targetStep = parseInt(zone.dataset.stepOrder, 10);
      
      // ✅ USE THE ROLE FROM THE DRAG DATA
      console.log('isDropDownAllowed for', data.managerRole, data);

      if (isDropAllowed(data.currentStep, targetStep, data.managerRole)) {
        console.log('can move as', data.currentStep, targetStep, data.managerRole);
        e.dataTransfer.dropEffect = 'move';
        zone.classList.add('bg-blue-50', 'border-blue-300', 'border-dashed');
      } else { 
        console.log('can NOT move as', data.managerRole);
        e.dataTransfer.dropEffect = 'none';
        zone.classList.remove('bg-blue-50', 'border-blue-300', 'border-dashed');
      }
    });

    zone.addEventListener('dragleave', () => {
      zone.classList.remove('bg-blue-50', 'border-blue-300', 'border-dashed');
    });

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('bg-blue-50', 'border-blue-400', 'border-dashed', 'border-2');
      
      const dataStr = e.dataTransfer.getData('application/json');
      if (!dataStr) return;
      
      const data = JSON.parse(dataStr);
      const targetStep = parseInt(zone.dataset.stepOrder, 10);

      // ✅ CHECK PERMISSIONS USING data.managerRole
      if (!isDropAllowed(data.currentStep, targetStep, data.managerRole)) {
        console.warn('⚠️ Drop rejected by permission rules.');
        return;
      }

      console.log('✅ Drop accepted! Requesting confirmation...');
      
      const card = panel.querySelector(`.student-card[data-student-id="${data.studentId}"]`);
      if (!card) return;

      const originalZone = card.parentElement;
      const originalStep = data.currentStep;

      originalZone.removeChild(card);
      zone.appendChild(card);

      card.classList.remove('bg-green-200', 'cursor-move', 'hover:shadow-md', 'opacity-40', 'border-dashed', 'border-gray-400', 'border-2');
      card.classList.add('bg-yellow-200', 'border-yellow-500', 'border-2', 'cursor-pointer', 'animate-pulse');
      card.draggable = "false";
      
      const confirmText = document.createElement('span');
      confirmText.className = 'block text-xs font-bold text-yellow-800 mt-1 text-center';
      confirmText.innerText = 'Click to confirm move';
      card.appendChild(confirmText);

      const timeoutId = setTimeout(() => {
        console.log('⏱️ Confirmation timed out. Reverting move.');
        revertMove(card, originalZone, originalStep);
      }, 10000);

      const handleConfirm = () => {
        clearTimeout(timeoutId);
        card.removeEventListener('click', handleConfirm);
        
        card.classList.remove('bg-yellow-200', 'border-yellow-500', 'border-2', 'cursor-pointer', 'animate-pulse');
        card.classList.add('bg-blue-50', 'opacity-75', 'cursor-not-allowed');
        card.dataset.currentStep = targetStep;
        if (confirmText) confirmText.remove();
        
        // ✅ PASS data.managerRole to the save function
        handleStudentMove(data, targetStep, data.managerRole, card);
      };

      card.addEventListener('click', handleConfirm);
    });
  });
  // Handle "more" toggles for long descriptions
panel.querySelectorAll('.toggle-desc').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const descEl = btn.parentElement;
    const fullText = decodeURIComponent(descEl.dataset.full);
    const isExpanded = btn.textContent === 'less';
    
    if (isExpanded) {
      // Collapse
      const shortText = fullText.substring(0, 300) + '...';
      descEl.childNodes[0].nodeValue = shortText;
      descEl.insertBefore(descEl.childNodes[0], btn);
      btn.textContent = 'more';
    } else {
      // Expand
      descEl.childNodes[0].nodeValue = fullText + ' ';
      descEl.insertBefore(descEl.childNodes[0], btn);
      btn.textContent = 'less';
    }
  });
});
}


function revertMove(card, originalZone, originalStep) {
  // Remove from current (target) zone
  if (card.parentElement) {
    card.parentElement.removeChild(card);
  }
  
  // Put back in original zone
  originalZone.appendChild(card);
  
  // Restore original draggable state and styling
  card.dataset.currentStep = originalStep;
  card.draggable = "true";
  card.classList.remove('bg-yellow-200', 'border-yellow-500', 'border-2', 'cursor-pointer', 'animate-pulse');
  card.classList.add('bg-green-200', 'cursor-move', 'hover:shadow-md');
  
  // Remove confirm text if it still exists
  const confirmText = card.querySelector('.text-yellow-800');
  if (confirmText) confirmText.remove();
}

async function handleStudentMove(data, targetStep, managerRole, card) {
  console.log(`💾 FINAL ACT: Requesting secure move for assignment ${data.assignmentId} to step ${targetStep}`);
  
  try {
    // Build the complete payload
    const payload = {
      ...data, // Includes studentId, assignmentId, currentStep
      targetStep: targetStep,
      managerRole: managerRole,
      task_header_id: appState.query.petitioner.taskHeaderId
    };

    console.log('📦 Payload sent to registry:', payload);

    // Call the registry (which calls the RPC)
    const result = await executeIfPermitted(appState.query.userId, 'managerMoveStudentInAssignment', payload);

    console.log('✅ Database updated successfully:', result);
    
  // Remove delay border classes (all possible delay indicators)
  card.classList.remove(
    'border-green-300', 'border-green-400', 'border-green-500',
    'border-yellow-500', 'border-yellow-600', 'border-yellow-700',
    'border-orange-700', 'border-orange-800', 'border-orange-900',
    'border-red-900',
    'animate-pulse'
  );
  
  // Reset to neutral border
  card.classList.add('border-gray-300');



    // Optional: Re-fetch the Kanban board to ensure UI is 100% synced with DB
    // getAssignmentsForKanban(panelEl); 
    
  } catch (error) {
    console.error('❌ Failed to update step:', error);
    // Revert the visual move if the database rejects it
    // revertMove(card, originalZone, originalStep); 
  }
}

export async function getAssignmentsForKanban(panel) {
  console.log('🚀 Kanban with real data for task:', appState.query.petitioner.taskHeaderId);

  panel.innerHTML = '<div class="p-4 text-gray-600 flex items-center gap-2"><span class="animate-spin">⏳</span> Loading...</div>';

  const taskId = appState.query.petitioner.taskHeaderId;

  try {
    const assignments = await executeIfPermitted(appState.query.userId, 'readAssignmentsForTask', {
      taskId: taskId
    });

    if (!assignments || assignments.length === 0) {
      panel.innerHTML = '<p class="p-4 text-red-600">No assignments found for this task.</p>';
      return;
    }

    const transformedData = transformAssignmentsToKanbanData(assignments, taskId);
    panel.innerHTML = renderKanbanStyle(transformedData);
    
    // ✅ No longer passing managerRole here. It's per-student now.
    addDragDropListeners(panel);

  } catch (error) {
    console.error('❌ Failed to load Kanban data:', error);
    panel.innerHTML = `<p class="p-4 text-red-600">Error loading data: ${error.message}</p>`;
  }
}

// Helper: Group flat assignments by step_order

function transformAssignmentsToKanbanData(assignments, taskId) {
  if (!assignments || assignments.length === 0) return null;

console.log('🔍 Full first row:', assignments[0]);

  const taskInfo = assignments[0];
  const currentUserId = appState.query.userId; // ✅ Get current logged-in user
  const stepsMap = new Map();
  
  assignments.forEach(row => {
    const stepNum = row.current_step || row.step_order || 1;
    const stepName = row.step_name || `Step ${stepNum}`;
    const stepDesc = row.step_description || '';
    const stepId = row.step_id;

    if (!stepsMap.has(stepNum)) {
      stepsMap.set(stepNum, {
        step_order: stepNum,
        step_name: stepName,
        step_description: stepDesc,
        step_description_short: stepDesc.length > 300 ? stepDesc.substring(0, 300) + '...' : stepDesc,
        step_id: stepId,
        student_count: 0,
        students: []
      });
    }

    const stepData = stepsMap.get(stepNum);
    stepData.student_count += 1;
    
 const studentManagerRole = appState.query.petitioner.assignmentRoles[row.assignment_id] || 'ERROR';

    stepData.students.push({
      student_id: row.student_id,
      student_name: row.student_name,
      assignment_id: row.assignment_id,
      manager_id: row.manager_id,
      manager_name: row.manager_name,
      move_by: row.move_by || 'manager',
      move_me_at: row.move_me_at || null,
      moved_at: row.moved_at || null,
      manager_role: studentManagerRole // ✅ Now guaranteed to be accurate per student
    });
  });

  // ... (maxStep and sorting logic here) ...
  const maxStep = Math.max(...Array.from(stepsMap.keys()));
  const nextStepNum = maxStep + 1;
  stepsMap.set(nextStepNum, {
    step_order: nextStepNum,
    step_name: `Step ${nextStepNum}`,
    step_description: 'Next step',
    step_id: null,
    student_count: 0,
    students: []
  });

  const sortedSteps = Array.from(stepsMap.values()).sort((a, b) => a.step_order - b.step_order);

  return {
    task_id: taskId,
    task_name: taskInfo.task_name || 'Unknown Task',
    task_description: taskInfo.task_description || '',
    task_description_short: (assignments[0].task_description || '').length > 300 
    ? assignments[0].task_description.substring(0, 300) + '...' 
    : assignments[0].task_description || '',
    total_students: assignments.length,
    steps: sortedSteps
  };
}


function getDelayminutes(moveMeAt, movedAt) {
  console.log('getDelayminutes())');
  if (!moveMeAt) return null;
  if (movedAt && new Date(movedAt) > new Date(moveMeAt)) return null;
  
  const minutes = (Date.now() - new Date(moveMeAt)) / (1000 * 60 );//minutes
  return minutes;
}



function getDelayVisual(minutes) {
  console.log('getDelayVisual(minutes)',minutes);
  if (minutes === null) return '';
  // Log scale: log(minutes + 1) keeps small delays visible, compresses large ones
  const logminutes = Math.log(minutes + 1);
  console.log('logminutes',logminutes);
  // Map to border width (1-4px) and color
  let borderWidth = Math.round(logminutes)-4; //4 is about 55 minutes, 5 is about 148m 2.5 hrs 6 is 403m = <7 hrs
  console.log('borderWidth',borderWidth);
  if (borderWidth < 1) borderWidth = 1; else if (borderWidth > 10) borderWidth = 10;
       if (logminutes < 4.09) return `border-green-300 border-[${borderWidth}px]`;       // < 60 minutes
  else if (logminutes < 4.80) return `border-green-400 border-[${borderWidth}px]`;       // < 2 hrs
  else if (logminutes < 5.19) return `border-green-500 border-[${borderWidth}px]`;       // < 3 hrs
  else if (logminutes < 5.48) return `border-yellow-500 border-[${borderWidth}px]`;      // < 4 hrs
  else if (logminutes < 5.70) return `border-yellow-600 border-[${borderWidth}px]`;      // < 5 hrs
  else if (logminutes < 5.89) return `border-yellow-700 border-[${borderWidth}px]`;      // < 6 hrs
  else if (logminutes < 6.04) return `border-orange-700 border-[${borderWidth}px]`;      // < 7 hrs
  else if (logminutes < 6.17) return `border-orange-800 border-[${borderWidth}px]`;      // < 8 hrs
  else if (logminutes < 7.27) return `border-orange-900 border-[${borderWidth}px]`;      // < 2 days
  else if (logminutes < 8.37) return `border-red-900 border-[${borderWidth}px]`;         // < 3 days
  return `border-red-900 border-[${borderWidth}px] animate-pulse`;
}



function renderKanbanStyle(data){
  console.log('Rendering moveStudentManager with data:', data);
const stepsHTML = data.steps.map(step => {
const studentsHTML = step.students.map(student => {
  // ✅ Calculate if student has a pending move request
  const hasPendingRequest = student.move_me_at && 
    (!student.moved_at || new Date(student.moved_at) < new Date(student.move_me_at));
  console.log(`Student ${student.student_name} hasPendingRequest:`, hasPendingRequest, 'move_me_at:', student.move_me_at, 'moved_at:', student.moved_at);
  // ✅ Color based on pending request status, not move_by
  let colorClass;
  if (hasPendingRequest) {
    colorClass = 'bg-green-200'; // Green = waiting for manager action
  } else {
    // No pending request - show neutral or move_by type
    const moveByColors = {
      'auto': 'bg-gray-100 border-gray-300',
      'student': 'bg-blue-50 border-blue-300',
      'manager': 'bg-white border-gray-300' // Manager-moveable but no request yet
    };
    colorClass = moveByColors[student.move_by] || 'bg-white border-gray-300';
  }
  
  // Calculate delay for border weight (only if has pending request)
  const delayminutes = hasPendingRequest ? getDelayminutes(student.move_me_at, student.moved_at) : null;
  const delayClass = getDelayVisual(delayminutes);
  
  // Only add hover effect for students with pending requests
  //const hoverClass = hasPendingRequest ? 'hover:shadow-md cursor-move' : '';
  
 // Only allow dragging for students with pending requests (the green ones)
  const isDraggable = hasPendingRequest; 
  const draggableAttr = isDraggable ? 'draggable="true"' : '';
  const hoverClass = isDraggable ? 'hover:shadow-md cursor-move' : 'opacity-75 cursor-not-allowed';
  


  // Add title showing delay if applicable
  const delayText = delayminutes ? ` (Waiting: ${Math.round(delayminutes/60)}h)` : '';
  
  return `
    <div 
      class="student-card ${colorClass} ${delayClass} ${hoverClass} border rounded px-3 py-2 text-sm transition-shadow"
      ${draggableAttr}
      data-student-id="${student.student_id}"
      data-assignment-id="${student.assignment_id}"
       data-current-step="${step.step_order}"
       data-manager-role="${student.manager_role}" 
      data-move-by="${student.move_by}"
      data-move-me-at="${student.move_me_at || ''}"
       title="${isDraggable ? 'Drag directly down to next step' : 'No pending move request'} ${student.student_name}${student.manager_name ? ' (Manager: ' + student.manager_name + ')' : ''}${delayText}"
    >
    <div class="flex items-center gap-2">
        <span>${student.student_name}</span>
        ${isDraggable ? `<span class="text-xs px-2 py-0.5 rounded-full ${
  student.manager_role === 'assigned' ? 'bg-blue-100 text-blue-700' :
  student.manager_role === 'default' ? 'bg-yellow-100 text-yellow-700' :
  student.manager_role === 'author' ? 'bg-gray-100 text-gray-700' :
  'bg-red-100 text-red-700'
}">your role: ${student.manager_role}</span>` : ''
      }
      </div>
    </div>
  `;
}).join('');

    // Show "Drop zone" hint for empty steps
    // Show "Drop zone" hint for empty steps
    const emptyHint = step.student_count === 0 
      ? '<p class="text-xs text-gray-400 italic text-center w-full py-4 pointer-events-none">Drop students on to their next step</p>'
      : '';

    return `
      <div class="step-row flex items-start gap-2 md:gap-4 p-2 md:p-4 border-b border-gray-200 hover:bg-gray-50" data-step-order="${step.step_order}">
        <div class="step-info flex-shrink-0 w-48 md:w-64">
          <div class="flex items-center gap-2 mb-2">
            <h3 class="text-lg font-semibold text-gray-800">Step ${step.step_order}</h3>
               <div class="flex items-center gap-1">
      <div class="text-lg font-bold text-blue-600 bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center">
        ${step.student_count}
      </div>
      <span class="text-xs font-semibold text-blue-600 self-center">students</span>
    </div>
          </div>
          <h4 class="text-sm font-medium text-gray-700 mb-1">${step.step_name}</h4>
          <p class="text-xs text-gray-600 step-desc" data-full="${encodeURIComponent(step.step_description || '')}">
  ${step.step_description_short}
  ${step.step_description.length > 300 ? `<button class="text-blue-600 hover:underline text-xs ml-1 toggle-desc">more</button>` : ''}
</p>
        </div>
        
        <!-- ✅ ADDED: data-step-order, min-h-[60px], and styling for drop feedback -->
        <div class="students-container flex flex-wrap gap-2 flex-1 items-start min-h-[60px] p-2 rounded transition-colors border border-green-300" 
             data-step-order="${step.step_order}">
          ${studentsHTML || emptyHint}
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="p-1 md:p-6">
      <div class="mb-2">
        <h2 class="text-2xl font-bold mb-2">Moving students through a task</h2>
      </div>

<button data-action="move-student-manager" data-section="display-area" data-destination="display-area" class="text-gray-500 hover:text-gray-700" aria-label="Close">
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
  </button>

       <div class="mt-2 md:mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p class="text-sm text-yellow-800">
          <strong>Note:</strong> Students who have requested to move to the next step are highlighted in green. 
          You can click on any highlighted student. Then drag-and-drop onto the next step if you were chosen to manage this student's assignment, or if you are the default manager or the author of the task. 
        <br> 
          </p>
      </div>
      <div class="step-row flex items-start gap-2 md:gap-4 p-2 md:p-4 border-b border-gray-200 hover:bg-gray-50">
        <div class="step-info flex-shrink-0 w-48 md:w-64">
          <div class="flex items-center gap-2 mb-2">
            <h3 class="text-lg font-semibold text-gray-800">Task</h3>
      <div class="text-lg font-bold text-blue-600 bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center">
        ${data.total_students}
      </div>
      <span class="text-xs font-semibold text-blue-600 self-center">students</span>
    </div>
          <h4 class="text-sm font-medium text-gray-700 mb-1">${data.task_name}</h4>
          <p class="text-xs text-gray-600 task-desc" data-full="${encodeURIComponent(data.task_description || '')}">
  ${data.task_description_short}
  ${data.task_description.length > 300 ? `<button class="text-blue-600 hover:underline text-xs ml-1 toggle-desc">more</button>` : ''}
</p>
        </div>
        
        <div class="students-container flex flex-wrap gap-2 flex-1 items-start">
          <p class="text-xs text-gray-400 italic">Task overview</p>
        </div>
      </div>
      
      <div class="task-steps-list">
        ${stepsHTML}
      </div>
      
      
    </div>     ${petitionBreadcrumbs()} 
  `;
}


// the hover information could include when assigned & when asked to move.


export  function render(panel, petition = {}) {
    console.log('moveStudentManager Render(', panel, petition, ')');
const kanbanPanel = getAssignmentsForKanban(panel);
console.log('panel',panel);
panel.innerHTML = kanbanPanel;
  }

  //petitioner

// is passed when the adminListeners() function calls appState.setQuery({callerContext: action});
//it has to be called prior to passing it in the query{} object when we call this module
//in adminListeners.js, when we call appState.setQuery(), we need to have added petitioner: petition
//then we can access it here in the render() function
//we can also add a default value of 'unknown' if it is not passed
//so we can see where we are when we open the a new page

//the call here isn't from adminListeners it is from the menu button in the dashboard
//so we need to also assign petitioner: {Module:'dashboard', Section:'menu', Action:'howTo'} when we call this module from the menu button
//we can do this in the dashboardListeners.js file
//we can also add a default value of 'unknown' if it is not passed
