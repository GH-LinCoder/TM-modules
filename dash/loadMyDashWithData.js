import { appState } from '../state/appState.js';
import { executeIfPermitted } from '../registry/executeIfPermitted.js';
import { showToast } from '../ui/showToast.js';
//import { petitionBreadcrumbs } from '../ui/breadcrumb.js';
import { getClipboardItems, onClipboardUpdate } from '../utils/clipboardUtils.js';
import { detectMyDash,resolveSubject, myDashOrAdminDashDisplay} from '../utils/contextSubjectHideModules.js'
console.log('loadMyDashWithData.js   loaded');

let subject=null;
//const userId=appState.query.userId;

export async function loadMyDashWithData() {
  console.log('loadMyDashWithData()');

showToast('This website uses cookies. [ ] I agree so I can use the site.  [ ] I refuse and will not use the site');


subject = await resolveSubject();  
  updateProfileAndStats();

  // Load each section via petition system Only do this once !
  loadSection('profile');
  loadSection('surveys'); //return;
        loadSection('tasks'); //the tasks that the student is on
     //   loadSection('relations');
     //   loadSection('students'); //the tasks that the student manages (these are 'my students')
        
        respondToClipboardChange()
  }


function respondToClipboardChange(){

        onClipboardUpdate(() => {
          //  console.log('detectMyDash-returns',detectMyDash());
     if (!detectMyDash()) return; //normaly sent'panel'
          updateProfileAndStats(); 
        loadSection('surveys'); //ADDED 23:13 March 13  Because changing the subject through the clipboard was not changing this data
        loadSection('tasks'); //ADDED 23:13 March 13  Still not working properly as not displaying any cards at all - but could be RLS

        }); 
}



async function updateProfileAndStats(){
   subject = await resolveSubject(); // why calling this again? Commented-out 22:39 Dec 19 BECAUSE needs it if clipboard is changing the subject
  // loadStudentProfile();
    updateQuickStats();
}


  async function updateQuickStats() { // seems to be working 11:14 Oct 27  (tried two different subjectIds)
subject = await resolveSubject(); 
if(!subject) {console.log('Error - no subject returned'); return}

  const NON_PROFILE_TYPES = ['relations', 'surveys', 'tasks', 'assignments'];
  if (NON_PROFILE_TYPES.includes(subject.type)) {return;} //we only display appros.


/*
console.log('resolveSubject', subject,
   'auth:', subject.id,
    'appro:',subject.approUserId,
    'name:',subject.name,
    'email:',subject.email,
    'created',subject.created_at,
    'type:',subject.type,
    'source:',subject.source);
*/
        try {//console.log('sending to readStudentAssignments subject.id',subject.id, 'student id:',subject.approUserId);
            // Get all assignments for current student
            //function needs const { student_id, type } = payload;
            const assignments = await executeIfPermitted(
                subject.id, 
                'readStudentAssignments', 
                { student_id: subject.approUserId, type: subject.type } //if send type 'app-human' the registry will not look for assignments !! 22:36 March 13  WHY?
            );
//          console.log('assignments',assignments);  //correctly recieved assignments 22:40 March 13 but not displaying
            if (!assignments || assignments.length === 0) {
                setStatsValues('?', '?', '?','?' , '?', '?'); // what is this?
                return;
            }
            
            // Count different assignment types
            const activeTasks = assignments.taskData.filter(a => a.step_order >= 3).length;
            const completedTasks = assignments.taskData.filter(a => a.step_order === 2).length;
            const abandonedTasks = assignments.taskData.filter(a => a.step_order === 1).length;
            
            // Get surveys (when implemented)
            
            const surveys = assignments.surveyData;
  //          console.log('surveys', surveys); //why log just surveys?
           const availableSurveys = surveys?.length || 0; //why this?
        
            const relationsCount = await getRelationsCount();
  // const relations = relationsObject.is.length + relationsObject.of.length;
            
            // Update stats display
            setStatsValues(activeTasks, completedTasks, abandonedTasks, availableSurveys, relationsCount);
            
        } catch (error) {
            console.error('Error updating quick stats:', error);
            //setStatsValues(0, 0, 0, 0, 0, 0);
        }
    }
    
 function setStatsValues(active, completed, abandoned, surveys, relations, rewards) {
    console.log('setStatsValues');
    const stats = {
            'active-tasks': active,
            'completed-tasks': completed, 
            'abandoned-tasks': abandoned,
            'available-surveys': surveys,
            'available-relations': relations,
            'available-rewards': rewards
        };
        
        Object.entries(stats).forEach(([statId, value]) => {
            const el = document.querySelector(`[data-value="${statId}"]`);
            if (el) el.textContent = value;
        });
    }

async function getAssignedSurveys() {
    console.log('getAssignedSurveys()');
    try {
//        const studentId = this.getCurrentStudentId();
        if (!subject.id) return [];
        
        // Read from task_assignments where survey_header_id is not null
        const { data, error } = await executeIfPermitted(
            appState.query.userId,
            'readAssignmentsSurveys', 
            { student_id: subject.id }
        );
        
        if (error) throw error;
        return data || [];
        
    } catch (error) {
        console.error('Error getting assigned surveys:', error);
        return [];
    }
}

async function getRelationsCount() {
    console.log('getRelationsCount()');
    try {
                if (!subject.id) return [];
                
                // Read from relations
                const { is = [], of = [] } = await executeIfPermitted(
                    appState.query.userId,
                    'readApprofileRelationships', 
                    { approfileId: subject.id }
                  );
                  
                  const totalCount = is.length + of.length;
                  return totalCount;
                
            } catch (error) {
                console.error('Error getting assigned surveys:', error);
                return [];
            }


}
    
function  loadSection(sectionName) {
        console.log('loadSection()', sectionName);
        
        // Create petition for this section
        const petition = {
            Module: 'myDash',
            Section: sectionName,
            Action: `display-${sectionName}`,
            Destination: `${sectionName}-section`,
            student: subject.id
        };
        
        // Signal state change to load module
        appState.setPetitioner(petition);
//        console.log(`Loading ${sectionName} section via petition:`, petition);
    }





function updateAll(selector, value) {
  console.log('updateAll', selector, value);
    const elements = document.querySelectorAll(selector);
  if (elements.length === 0) {
    console.warn(`No elements found for selector: ${selector}`);
    return;
  }
  elements.forEach(el => {
    el.textContent = value;
  });
}