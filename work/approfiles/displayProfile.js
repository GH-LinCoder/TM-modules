import { appState } from '../../state/appState.js';
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
//import { petitionBreadcrumbs } from '../ui/breadcrumb.js';
import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';
import { resolveSubject, detectContext, applyPresentationRules } from '../../utils/contextSubjectHideModules.js';

console.log('displayProfile.js - loaded');

let subject=null;

export async function render(panel, query = {}) { //Called from loader (standard interface) 
  console.log('displayProfile.render()', panel, query);
  if (!panel || !panel.isConnected) {
    console.warn('Render target not found or disconnected');
    return;
  }
  panel.innerHTML = getTemplateHTML();

updateProfile();
respondToClipboardChange();

  subject = await resolveSubject(); // Has this already been done by loadMyDashWithData??
  console.log('resolveSubject',resolveSubject);//this may be != to auth id of that person
if(!subject) {console.log('Error - no subject returned'); return}

if(!appState.userIdentified) showToast('There is no authenticated user detected. You may wish to login');

 else{ 
  
  let profile=null;

  try { // check if the subject already has an appro
    //func needs     const { approfileId } = payload;
    profile = await executeIfPermitted(subject.id, 'readApprofileById', {//chamged from ByAuthId 18:50 dec 24
      approfileId: subject.id
    });
  } catch (err) {
    console.error('No profile found:', err.message); // NEW auth user?
    showToast('No appro means no relations. Please fill in your appro details. Choose a userName.');
     
//    console.log('inside error: profile', profile);
  }


if(profile) console.log('profile:', profile, 'name', profile.name); //profile ok here 
 
/*  typical appro for auth user   
{ 
id: "51cf02e4-a69c-41f3-bcff-52d0208df529", 
name: "Adam Adminium", 
email: "admin@test.com", 
created_at: "2025-07-24T23:11:50.509134+00:00" 
}
*/ 

/* getAuthenticatedUser probably returns this:
{
id: user?.id,
email: user?.email,
created_at: user?.created_at,
}
*/

if (!profile) {profile ={  // no profile means a new auth user who needs an appro and relations
  id:subject.id,
   name:'Edit this...',
  email:subject.email,
created_at:subject.created_at || null} 
  createAppro(profile); //subject???
}
else
if(!profile.name) updateAppro(profile);

attachListener(panel, profile);
 }
 
//    onClipboardUpdate(() => {
  //    subject = resolveSubject();
     // loadAndRenderRelationships(panel, updatedSubject.id, updatedSubject.name);
     
 //   });
 

}

function attachListener(panel, profile){
  console.log('attachListeners()');
const updateBtn = panel.querySelector('#updateBtn');
console.log('panel,profile,updateBtn',panel, profile, updateBtn);
if(!updateBtn) {console.log('no button'); return};


updateBtn.addEventListener('click', ()=> updateAppro(profile) );
 //console.log('updateAppro');
//put the subjectId on the clipboard and load the editAppro module.

}


function respondToClipboardChange(){

        onClipboardUpdate(() => {
     
          updateProfile(); 
        }); 
}


async function updateProfile(){
console.log('updateProfile');
 subject = await resolveSubject(); // why calling this again? Commented-out 22:39 Dec 19 BECAUSE needs it if clipboard is changing the subject
  
 //profiles are based on appros, but the uuid could be a task, survey, relation, assignment etc. Not sure if .type covers them all
 console.log(subject.type);// if the subject is from the clipboard it could be any of the things that Selection handles 
 if(subject.type!='relations' && subject.type!='surveys' && subject.type !='tasks' && subject.type !='assignments') loadStudentProfile();


}


    async function loadStudentProfile() {  //works 11:00 Oct 27 - will read id from clipboard if exists when myDash renders
       if(subject.type!='relations' && subject.type!='surveys' && subject.type !='tasks' && subject.type !='assignments')
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



//  saveBtn?.addEventListener('click', handleApprofileUpdate);

async function createAppro(subject){
  console.log('createAppro');// id  name:admin@test  type app-human
  // direct create an appro then load editor?
const newId = await executeIfPermitted(subject.id, 'createApproFromNewAuthUser', { authUserId: subject.id });
subject.id = newId;
updateAppro(subject)
}



/* 
The clipboard format:

 { entity: {…}, as: "other", meta: {…} } as: "other"

entity: 
{ id: "6004dc44-a451-417e-80d4-e9ac53265beb", name: "cannie", type: "app-human", … }
id: "6004dc44-a451-417e-80d4-e9ac53265beb"

item: 
{ 
id: "6004dc44-a451-417e-80d4-e9ac53265beb", <--- in 'profile'
name: "cannie", <--- in 'profile'
email: "can@not.do",  <--- in 'profile'
… }

auth_user_id: "6004dc44-a451-417e-80d4-e9ac53265beb"  
avatar_url: null
created_at: "2025-09-20T19:09:44.614635+00:00" <--- in 'profile'
description: null
email: "can@not.do"
external_url: null
id: "6004dc44-a451-417e-80d4-e9ac53265beb"
name: "cannie"
notes: null
phone: null
sort_int: 42
survey_header_id: null
task_header_id: null
updated_at: null
*/

/*
profile format:
   
Object { 
id: "51cf02e4-a69c-41f3-bcff-52d0208df529", 
name: "Adam Adminium", 
email: "admin@test.com", 
created_at: "2025-07-24T23:11:50.509134+00:00" }
*/ 

//    onClipboardUpdate(() => {
//      const updatedSubject = resolveSubject();
     // render(panel, {}); // but render doesn't fill in the details
      
  //  });


function updateAppro(profile){ //?
  console.log('updateAppro()', profile);
//put the subjectId on the clipboard and load the editAppro module.

    const clipboardItem = {
      entity: {
        id: profile.id,
        name: profile.name, //this is loading into the select dropdown in edit profile but not in name
        type: 'app-human',
        item: {auth_user_id:profile.id, id:profile.id, email:profile.email, name:profile.name, created_at:profile.created_at} // edit appro reads the name & id in item
      },
      as: 'other',
      meta: {
        timestamp: Date.now(),
        source: 'display-profile',
        id: `clipboard-${Date.now()}-${Math.random().toString(36)}`
      }
    };

// Store
    if (!appState.clipboard) appState.clipboard = [];
    appState.clipboard.push(clipboardItem);

    if (document) { console.log('document recognised');
      document.dispatchEvent(new CustomEvent('clipboard:item-added', { bubbles:true, composed:true, detail: clipboardItem }));
    }
//which one is appropriate?
    // After updating the display
document.dispatchEvent(new CustomEvent('clipboard:updated', {
  detail: { clipboard: appState.clipboard }
}));


console.log(appState.clipboard);
    /* not needed as the code in the html calls this anyway   
console.log('clipboardItem',clipboardItem);
    //create petition & event to load the editor
const petition =
    {
  "Module": "myDash",
  "Section": "profile-section",
  "Action": "editApprofile",
  "Destination": "profile-section",
 // "student": subjectId
}

 appState.setPetitioner(petition)
*/

 }


function getTemplateHTML() {
    return `
                <!-- PROFILE CARD -->
<div class="w-20 h-20  rounded-full bg-blue-500 text-white text-lg font-semibold" data-user="avatar" >
  <!--div data-user="initials">ABC</div-->
</div>
<h6 class="text-xl font-semibold" data-user="name">Waiting for database</h6>                  
                    
<div class="flex-1 space-y-4">
  <div class="space-y-3 text-sm text-gray-600">
    <div class="flex items-center gap-2 flex-wrap">
                                📧<span data-user="email">???@???.???</span>
                                      
                                <span ><b>Joined:</b><span data-user="join-date"> ???? ?? ??</span>
                                <span data-user="last-login"><b>Last login:</b> ??:?? PM ???? ?? ??</span>
                                <span data-user="mid"><b>🆔</b> <span data-user="user-id">???</span>
    

                 <button id="updateBtn" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"  data-action='edit-approfile-dialogue' data-destination='profile-section'>
                Click for the edit form
              </button>
        


      <div id="editProfileForm" class="flex items-center gap-2 flex-wrap space-y-6 bg-gray-50 p-6 rounded-lg   hidden">
        <div>
              <label for="userName" class="block text-sm font-medium text-gray-700 mb-1">
                User Name * </label>
              <input id="userName" placeholder="Short & unique user name for display" maxlength="32" required class="w-full p-2 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              <p id="userNameCounter" class="text-xs text-gray-500 mt-1">0/32 characters</p>
              <p id="nameError" class="text-xs text-red-500 mt-1 hidden">This name already exists. Please choose a different name.</p>
        </div>

        <div>
              <label for="approfileDescription" class="block text-sm font-medium text-gray-700 mb-1">
                Description (optional) </label>
              <textarea id="profileDescription" placeholder="This is optional and can be left blank or be very short or detailed as you wish" rows="4" maxlength="2000" required class="w-full p-2 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
              <p id="profileDescriptionCounter" class="text-xs text-gray-500 mt-1">0/2000 characters</p>
        </div>

        <div class="flex gap-4">
              <button id="saveBtn" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
                Update/create appro
              </button>
        </div>

    </div>
  </div>
</div>


    `}