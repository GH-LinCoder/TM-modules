// utils/getMoveByRadioHTML.js

export function getMoveByRadioHTML(){
return`<div class="mb-4" border border-green-200 rounded-lg p-4">
  <label class="block text-sm font-medium text-gray-700 mb-2">Who decides when to move from step to step:</label>
  
  <div class="flex gap-4">
    <label class="flex items-center cursor-pointer group">
      <input type="radio" name="move_by" value="student"  class="w-4 h-4 text-blue-600">
      <span class="ml-2 text-sm text-gray-700" title="The person on the task can move from step to step via navigation buttons">
        Student
      </span>
    </label>
    
    <label class="flex items-center cursor-pointer group">
      <input type="radio" name="move_by" value="manager" class="w-4 h-4 text-blue-600">
      <span class="ml-2 text-sm text-gray-700" title="Moving from step to step is decided by the manager">
        Manager
      </span>
    </label>
    
    <label class="flex items-center cursor-pointer group">
      <input type="radio" name="move_by" value="auto" class="w-4 h-4 text-blue-600">
      <span class="ml-2 text-sm text-gray-700" title="Movement between steps is controlled by software">
        Auto
      </span>
    </label>
  </div>
</div> `

}

export function updateMoveByRadio(panel, selectedTaskId, tasks) {//what is this for?
  if (!selectedTaskId) return;

  // Find the task data matching the selected dropdown value
  const selectedTaskItem = tasks.find(t => String(t.entity.item.id) === String(selectedTaskId));
  if (!selectedTaskItem) return;

  const currentMoveBy = selectedTaskItem.entity.item.move_by || 'student'; 
  console.log('🎯 Target move_by value:', currentMoveBy);

  const moveByRadio = panel.querySelector(`input[name="move_by"][value="${currentMoveBy}"]`);
  if (moveByRadio) {
    moveByRadio.checked = true;
    console.log('✅ Radio button successfully checked');
  }
}