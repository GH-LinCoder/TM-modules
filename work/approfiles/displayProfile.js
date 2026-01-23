import { appState } from '../../state/appState.js';
//import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
//import { showToast } from '../../ui/showToast.js';
//import { petitionBreadcrumbs } from '../ui/breadcrumb.js';
import { onClipboardUpdate } from '../../utils/clipboardUtils.js';
import { resolveSubject } from '../../utils/contextSubjectHideModules.js';


/*Display profile obtains data from resolveSubject
resolveSubject - what does it return?

The three types all return the same format object
sorce is 
1st clipboard
2nd authUser
3rd appstate default user

              id:authUser.id, 
              approUserId:approUserId || null, //added  || nul 12:00 Jan 13
              name:authUser.name || 'unknown',
              email:authUser.email,
              created_at
              type: 'app-human',
              source:'authUser'}

what it lacks is 'last login' which is only availeble from a call to a different auth function which needs prc - see in sql/functions             
*/






console.log('displayProfile.js - loaded');

let subject=null;

export async function render(panel, query = {}) { //Called from loader (standard interface) 
  console.log('displayProfile.render()', panel, query);
  if (!panel || !panel.isConnected) {
    console.warn('Render target not found or disconnected');
    return;
  }
  panel.innerHTML = getTemplateHTML();

respondToClipboardChange();
displayAppro();
 }
 




async function displayAppro(){

subject = await resolveSubject(); 
if(!subject) {console.log('Error - no subject returned'); return}

  const NON_PROFILE_TYPES = ['relations', 'surveys', 'tasks', 'assignments'];
  if (NON_PROFILE_TYPES.includes(subject.type)) {return;} //we only display appros.



console.log('resolveSubject', subject,
   'auth:', subject.id,
    'appro:',subject.approUserId,
    'name:',subject.name,
    'email:',subject.email,
    'created',subject.created_at,
    'type:',subject.type,
    'source:',subject.source);


            // Update profile card
            const initialsEl = document.querySelector('[data-user="initials"]');

            const nameEl = document.querySelector('[data-user="name"]');
            const placeholderEl = document.querySelector('[data-user="placeholder"]');
            const emailEl = document.querySelector('[data-user="email"]');

            const approIdEl = document.querySelector('[data-user="appro-id"]');
            const authIdEl = document.querySelector('[data-user="auth-id"]');
            
            const createdAtEl = document.querySelector('[data-user="created-at"]');
            const lastLoginEl = document.querySelector('[data-user="last-login"]'); 

                        const typeEl = document.querySelector('[data-user="type"]');
            const sourceEl = document.querySelector('[data-user="source"]');

            
            if (nameEl) nameEl.textContent = subject.name || 'Choose a user name';
            if (emailEl) emailEl.textContent = subject.email || 'No email?';
            if (approIdEl) approIdEl.textContent = subject.approUserId;
            if (authIdEl) authIdEl.textContent = subject.id;
            if (createdAtEl) createdAtEl.textContent = subject.created_at?.substring(0, 10) || 'error';
           // if (lastLoginEl) lastLoginEl.textContent = subject.lastLogin_at.substring(0, 10) || 'error';
            
            if (typeEl) typeEl.textContent = subject.type;
            if (sourceEl) sourceEl.textContent = subject.source;

            if(placeholderEl) placeholderEl.textContent = ''; //remove error guidance

            // Set initials  -- not used
            if (initialsEl && subject.name) {
                const initials = subject.name.substring(0, 3)
                initialsEl.textContent = initials;
            }
}






function attachListener(panel){
  console.log('attachListeners()');
const updateBtn = panel.querySelector('#updateBtn');
console.log('panel,profile,updateBtn',panel, updateBtn);
if(!updateBtn) {console.log('no button'); return};

updateBtn.addEventListener('click', ()=> updateAppro() );
 //console.log('updateAppro');
//put the subjectId on the clipboard and load the editAppro module.
}


function respondToClipboardChange(){  // it doesn't instantly respond. Need to refresh the myDash to show clipboard content
        onClipboardUpdate(() => {
          displayAppro(); 
        }); 
}







function updateAppro(subject){ //?  what was this for???  Why load onto clipboard? Is it for admin to be able to reuse elsewhere?
  console.log('updateAppro()', subject);
//put the subjectId on the clipboard and load the editAppro module.

    const clipboardItem = {
      entity: {
        id: subject.id,
        name: subject.name, //this is loading into the select dropdown in edit subject but not in name
        type: 'app-human',
        item: {auth_user_id:subject.id, id:subject.id, email:subject.email, name:subject.name, created_at:subject.created_at} // edit appro reads the name & id in item
      },
      as: 'other',
      meta: {
        timestamp: Date.now(),
        source: 'display-subject',
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
 }


function getTemplateHTML() {
    return `
                <!-- PROFILE CARD -->
<div class="w-20 h-20  rounded-full bg-blue-500 text-white text-lg font-semibold" data-user="avatar" >
  <!--div data-user="initials">ABC</div-->
</div>
<h6 class="text-xl font-semibold" data-user="name">Waiting for database.</h6> 
<div data-user='placeholder'> Are you logged in? Perhaps new here & haven't confirmed email? Or perhaps have no permissions?</div>                  
                    
<div class="flex-1 space-y-4">
  <div class="space-y-3 text-sm text-gray-600">
    <div class="flex items-center gap-2 flex-wrap">
                                📧<span data-user="email">???@???.???</span>
                                
                                <span ><b>appro🆔<span data-user="appro-id"> ???? ?? ??</b></span></span>
                                <span >auth🆔<span data-user="auth-id"> ???? ?? ??</span></span>

                                <span ><b>Joined:</b><span data-user="created-at"> ???? ?? ??</span></span>
                                <span ><b>Last login:</b><span data-user="last-login"> ???? ?? ??</span></span>
                                
                               
                                <span >type: <span data-user="type"> ???? ?? ??</span></span>
                                <span >source: <span data-user="source"> ???? ?? ??</span></span>


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