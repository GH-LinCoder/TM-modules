import { appState } from '../../state/appState.js';
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
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
  //console.log('displayProfile.render()', panel, query);
  console.log('displayProfile.render()');
  
  if (!panel || !panel.isConnected) {
    console.warn('Render target not found or disconnected');
    return;
  }
  panel.innerHTML = getTemplateHTML();

respondToClipboardChange();
await displayAppro();

 }
 




async function displayAppro(){
console.log('displayAppro()');
subject = await resolveSubject(); 
if(!subject) {console.log('Error - no subject returned'); return}

  const NON_PROFILE_TYPES = ['relations', 'surveys', 'tasks', 'assignments'];
  if (NON_PROFILE_TYPES.includes(subject.type)) {return;} //we only display appros.

console.log('profiles -resolveSubject', subject,
   'auth:', subject.id,
    'appro:',subject.approUserId,
    'name:',subject.name,
    'email:',subject.email,
    'created',subject.created_at,
    'type:',subject.type,
    'source:',subject.source);
// function needs userApproId
const approUserId = subject.approUserId;
const activePlans = await executeIfPermitted(subject.id,'readActivePaymentPlans',{approUserId});

/** the registry returns
 .from('user_active_purchases')
    .select(`
      plan_name,
      plan_description,
      status
    `)
    .eq('app_profile_id', approUserId)
    .in('status', ['active', 'trialing', 'past_due']);
 * 
 */

            // Update profile card
            const initialsEl = document.querySelector('[data-user="initials"]');

            const nameEl = document.querySelector('[data-user="name"]');
            const placeholderEl = document.querySelector('[data-user="placeholder"]');
            const emailEl = document.querySelector('[data-user="email"]');

            const approIdEl = document.querySelector('[data-user="appro-id"]');
            const authIdEl = document.querySelector('[data-user="auth-id"]');
            
            const createdAtEl = document.querySelector('[data-user="created-at"]');

            const badgesEl = document.querySelector('[data-user="badges"]'); 

                        const typeEl = document.querySelector('[data-user="type"]');
            const sourceEl = document.querySelector('[data-user="source"]');

            //email and authId should be toggled. Normally concealed, but click to reveal. This is so won't be exposed if we do a screen video or if used in a public place
            //But April 14, just partly hidden.
            if (nameEl) nameEl.textContent = subject.name || 'Choose a user name';
            if (approIdEl) approIdEl.textContent = subject.approUserId;
            
           
            
// After your existing element selections:
//nst emailEl = panel.querySelector('[data-user="email"]');
//nst authIdEl = panel.querySelector('[data-user="auth-id"]');

// ... set name, etc. ...
console.log('subject.id',subject.id);
// CONCEAL EMAIL + AUTH ID: Click container to reveal both
if (emailEl && authIdEl) {
  // Store full values
  const fullEmail = subject.email || 'No email';
  const fullAuthId = subject.id || 'No auth ID';
  console.log('fullAuthId',fullAuthId);
  // Obscure initially
  emailEl.textContent = '••••@••••.•••';
  authIdEl.textContent = '••••••••-••••-••••-••••-••••••••••••';

const text = renderActivePlans(activePlans);  
//console.log(text);
badgesEl.innerHTML = text;
  
  // Find a common parent to wrap (or create one)
  // The email and auth-id spans are siblings inside .flex.items-center
  const container = emailEl.closest('.flex.items-center');
  
  if (container) {
    container.classList.add('cursor-pointer', 'group');
    container.title = 'Click to reveal email and auth ID';
    
    // Add subtle hint (insert after auth-id)
    const hintEl = document.createElement('span');
    hintEl.className = 'text-xs text-gray-400 group-hover:text-gray-600 transition ml-1';
    hintEl.textContent = '[ show 👁️ ]';
    hintEl.title = 'Click to reveal';
     emailEl.parentNode?.insertBefore(hintEl, emailEl);
    // Change hint classes: This hides the 'show' message. Fades in on hover. Probably not good.
//hintEl.className = 'text-xs text-gray-300 group-hover:text-gray-600 transition mr-1 opacity-0 group-hover:opacity-100';
    // Toggle logic
    let isRevealed = false;
    container.addEventListener('click', (e) => {
      // Avoid triggering if clicking other interactive elements
      if (e.target.closest('[data-action], button, a')) return;
      
      e.stopPropagation();
      isRevealed = !isRevealed;
      
      if (isRevealed) {
        emailEl.textContent = fullEmail;
        authIdEl.textContent = fullAuthId;
        hintEl.textContent = '[ hide ❎  ]';
        hintEl.title = 'Click to hide';
        container.classList.add('bg-yellow-50', 'px-1', 'rounded');
      } else {
        emailEl.textContent = '••••@••••.•••';
        authIdEl.textContent = '••••••••-••••-••••-••••-••••••••••••';
        hintEl.textContent = '[ show 👁️ ]';
        hintEl.title = 'Click to reveal';
        container.classList.remove('bg-yellow-50', 'px-1', 'rounded');
      }
    });
  }
}



            
            if (createdAtEl) createdAtEl.textContent = subject.created_at?.substring(0, 10) || 'error';
           // if (lastLoginEl) lastLoginEl.textContent = subject.lastLogin_at.substring(0, 10) || 'error';
            
            if (typeEl) typeEl.textContent = subject.type;
            if (sourceEl) sourceEl.textContent = subject.source;

            if(placeholderEl) placeholderEl.textContent = ''; //remove error guidance

            // Set initials 
            if (initialsEl && subject.name) {
              //                const initials = ">>" + subject.name.substring(0, 18) +' '+ subject.name.substring(3, 12)+"<<";
//const LON = subject.name.length;
              const initials = ">¬" + subject.name.substring(0,4) +'#'
              + subject.name.substring(3,6)+"*ap"+ subject.name.substring(4,7)+"@pro" 
              + subject.name.substring(2,6)+ "*"+subject.name.substring(5,9)
              + subject.name.substring(3,7)+ "]["+subject.name.substring(6,10)+')(';
                initialsEl.textContent = initials;
            }
}







function renderActivePlans(plans) {
  console.log('renderActivePlans', plans);
  
  if (!plans?.length) return '';  // Return empty string, not undefined
  
  // Build the container
  const container = document.createElement('div');
  container.className = 'mt-4 space-y-2';
  container.innerHTML = `<p class="text-xs font-medium text-gray-600">🏆 <b>Badges</b></p>`;
  
  // Build HTML for each plan (view columns: plan_name, current_period_end, status, amount, currency, provider_name)
  const planHTML = plans.map(plan => {
    // ✅ Use view column names (snake_case)
    const planName = plan.plan_name || 'Unknown Plan';
    const periodEnd = plan.current_period_end;  // ← Was: plan.endDate
    const status = plan.status;
    const amount = plan.amount;
    const currency = plan.currency;
    const provider = plan.provider_name;
    
    // Determine if active and calculate days until renewal
    const isActive = status === 'active';
    const statusLabel = isActive ? 'Active' : status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
    
    const daysUntil = periodEnd 
      ? Math.floor((new Date(periodEnd) - new Date()) / (1000 * 60 * 60 * 24))
      : null;
    
    // Build badge text
    let text = `<span class="font-semibold text-indigo-700">${escapeHtml(planName)}</span>`;
    
    // Add price if available
    if (amount != null && currency) {
      text += `<span class="text-gray-500 ml-2">• ${currency} ${amount}</span>`;
    }
    
    // Add status
    text += `<span class="text-gray-500 ml-2">• ${statusLabel}</span>`;
    
    // Add renewal countdown if active and has end date
    if (daysUntil != null && daysUntil > 0 && isActive) {
      text += `<span class="text-gray-400 ml-1">(${daysUntil}d)</span>`;
    }
    
    // Add provider name (optional, subtle)
    if (provider) {
      text += `<span class="text-gray-300 ml-2 text-xs">via ${escapeHtml(provider)}</span>`;
    }
    
    // Return the HTML for ONE plan
    return `<div class="px-3 py-2 bg-indigo-50 border border-indigo-200 rounded text-sm">${text}</div>`;
  }).join('');  // Join all plan HTML strings
  
  // Add all plans to container
  container.innerHTML += planHTML;
  
  // Return the full HTML string
  return container.outerHTML;
}

// Helper: Escape HTML to prevent XSS
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}






function respondToClipboardChange(){  // it doesn't instantly respond. Need to refresh the myDash to show clipboard content
  console.log('respondToClipboardChange()');
  onClipboardUpdate(() => {
          displayAppro(); 
        }); 
}






//only called if attachListener were called
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
<div class="w-20 h-20  rounded-full bg-green-200 text-white text-lg font-semibold" data-user="avatar" >
  <div data-user="initials">Organise using this app, have your say, do your bit</div>
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
                                       
                                <span data-user="badges"></span>                        
                 <!--button id="updateBtn" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"  data-action='edit-approfile-dialogue' data-destination='profile-section'>
                Click for the edit form
              </button-->
        


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