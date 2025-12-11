// ./work/task/taskSelfMnagement.js
// Checks database appro relations to find out if a supplied task has been related as being self-managed
//A self managed task allows the student to be the task manager.
//The db allows such an assignment
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { appState } from '../../state/appState.js';
//import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';
import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';
//import {icons} from '../../registry/iconList.js';




export function render(panel, query = {}) {
  console.log('taskSelfManagement.render:', panel, query);
  panel.innerHTML = getTemplateHTML();
  const taskId ='9f4daee7-49a9-4e8d-a204-b82b4208b8eb';// static test
  const taskAppro = findTheTaskApproFromTheTaskId(taskId);
showToast('Appro:',taskAppro.id, taskAppro.name);
console.log('Appro:', taskAppro.id, taskAppro.name);
  const result = checkIfApproIsMemberSelfManaged(taskAppro.id);
    showToast('Appro self managed:', result);
    console.log('Appro self managed:', result, '8384ce43-9196-4f2f-a96d-032c3a9fe51c');

  
}

export async function findTheTaskApproFromTheTaskId(taskId){
//needs the taskId and then will try to read the approId for that task
let taskAppro=null;
try{
       taskAppro = await executeIfPermitted(appState.query.userId, 'readApprofileByTaskId', { taskId });
}catch (error) {
    console.log(error.message);
    showToast('Error reading appro:' +error.message, 'error');
    return [];
}

return taskAppro;
}


export async function checkIfApproIsMemberSelfManaged(approId){
let result=false;
    try{//func needs:     const { approfile_is, relationship, of_approfile} = payload;
       result = await executeIfPermitted(appState.query.userId, 'readRelationshipExists', { 
        appro_is_id:approId, 
        relationship:'a member', 
        of_appro_id:'8384ce43-9196-4f2f-a96d-032c3a9fe51c' });// that is the appro id of the appro 'Self managed'
}catch (error) {
    console.log(error.message);
    showToast('Error reading relation:' +error.message, 'error');
return [];
}
return result;
}



function getTemplateHTML() {
  return `
    <div id="taskSelfManagement" class="edit-task-dialogue relative z-10 flex flex-col h-full" data-destination="new-panel">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 z-10 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-xl font-semibold text-gray-900">Edit Task  19:31 Nov 30</h3>
            <div class="space-y-2">
             <p> task Self Management module. function: readApprofileByTaskId</p> 
             .from('app_profiles')
      .select('id, name')
      .eq('task_header_id', taskId)
      .single();<p>
            </div>
</div>
</div> ${ petitionBreadcrumbs }
</div>  `;
}
