import { appState } from '../state/appState.js';
import { executeIfPermitted } from '../registry/executeIfPermitted.js';
import { showToast } from '../ui/showToast.js';
//import { petitionBreadcrumbs } from '../ui/breadcrumb.js';
import { getClipboardItems, onClipboardUpdate } from '../utils/clipboardUtils.js';
import { resolveSubject, detectContext, applyPresentationRules } from '../utils/contextSubjectHideModules.js';

console.log('Imported: loadMyDashWithData.js');

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
        loadSection('relations');
        loadSection('students'); //the tasks that the student manages (these are 'my students')
        
        respondToClipboardChange()
  }


function respondToClipboardChange(){

        onClipboardUpdate(() => {
     
          updateProfileAndStats(); 
        }); 
}



async function updateProfileAndStats(){
   subject = await resolveSubject(); // why calling this again? Commented-out 22:39 Dec 19 BECAUSE needs it if clipboard is changing the subject
  // loadStudentProfile();
    updateQuickStats();
}

/* removed 18:38 Oct 27

function  getCurrentSubjectId() {
        const clipboardStudents = getClipboardItems({ as: 'student', type: 'app-human' });
        const clipboardOther = getClipboardItems({ as: 'other', type: 'app-human' });
        console.log('getCurrentStudentId() Clipboard contents:', appState.clipboard);
        if (clipboardStudents.length > 0) {
            console.log ('getCurrentSubjectId() AS student',clipboardStudents[0].entity.id);
            return clipboardStudents[0].entity.id;
        }
        if (clipboardOther.length > 0) {
            console.log ('getCurrentSubjectId() AS other',clipboardOther[0].entity.id);
            return clipboardOther[0].entity.id;
        }
        
        // Fallback to DEV student ID
        
        console.log ('getCurrentSubjectId() appstate.userId',appState.query.userId);
        return  appState.query.userId;
    }
*/
/*
    async function loadStudentProfile() {  //works 11:00 Oct 27 - will read id from clipboard if exists when myDash renders
       if(subject.type!='relations')
        try {
            const studentProfile = await executeIfPermitted(
                subject.id,
                'readApprofileById',
                { approfileId: subject.id }
            );
            console.log('studentProfile',studentProfile);
            if (!studentProfile) return;
            




            // Update profile card
            const nameEl = document.querySelector('[data-user="name"]');
            const emailEl = document.querySelector('[data-user="email"]');
            const initialsEl = document.querySelector('[data-user="initials"]');
            const userIdEl = document.querySelector('[data-user="user-id"]');
            const studentJoinedEl = document.querySelector('[data-user="join-date"]');

            //Needs joined
            //needs last login - not got sessions yet oct 23
            
            if (nameEl) nameEl.textContent = studentProfile.name || 'Choose a user name';
            if (emailEl) emailEl.textContent = studentProfile.email || 'No email?';
            if (userIdEl) userIdEl.textContent = subject.id;
            if (studentJoinedEl) studentJoinedEl.textContent = studentProfile.created_at.substring(0, 10) || 'error';
            // Set initials
            if (initialsEl && studentProfile.name) {
                const initials = studentProfile.name.substring(0, 3)
                initialsEl.textContent = initials;
            }
            
        } catch (error) {
            console.error('Error loading student profile:', error);
        }

          // Update stats after profile loads
    //await this.updateQuickStats();
    }
*/
  async function updateQuickStats() { // seems to be working 11:14 Oct 27  (tried two different subjectIds)
        console.log('updateQuickStats()');
      if(subject.type !='relations')  
        try {
            // Get all assignments for current student
            const assignments = await executeIfPermitted(
                subject.id, 
                'readStudentAssignments', 
                { student_id: subject.id }
            );
            
            if (!assignments || assignments.length === 0) {
                setStatsValues(0, 0, 0, 0, 0, 0);
                return;
            }
            
            // Count different assignment types
            const activeTasks = assignments.filter(a => a.step_order >= 3).length;
            const completedTasks = assignments.filter(a => a.step_order === 2).length;
            const abandonedTasks = assignments.filter(a => a.step_order === 1).length;
            
            // Get surveys (when implemented)
            
            const surveys = await getAssignedSurveys();
            const availableSurveys = surveys?.length || 0;
        
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
    try {
//        const studentId = this.getCurrentStudentId();
        if (!subject.id) return [];
        
        // Read from task_assignments where survey_header_id is not null
        const { data, error } = await executeIfPermitted(
            appState.query.userId,
            'readStudentAssignments', 
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
    //    console.log('loadSection()', sectionName);
        
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
        console.log(`Loading ${sectionName} section via petition:`, petition);
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