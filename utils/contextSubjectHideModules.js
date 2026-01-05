import { appState } from '../state/appState.js';
import { getClipboardItems, onClipboardUpdate } from '../utils/clipboardUtils.js';
import { executeIfPermitted } from '../registry/executeIfPermitted.js';

// new functions to find data - External file to be imported by each module

export function detectContext(panel) {
    let context = panel.closest('[data-module]')?.dataset.module === 'myDash'
    console.log('context', context);
    return context;

  }

  // Return the latest item from the clipboard. If nothing there return the default value from appState (which is a person's id and name)
export async function resolveSubject() {
    const clipboardItems = getClipboardItems(); // no type filter
    console.log('clipboardItems', clipboardItems);
  
    if (clipboardItems.length > 0) { //treat the first item on the clipboard as the subject? (first is most recent?)
      const entity = clipboardItems[0].entity;
      return {
        id: entity.id,
        name: entity.name || entity.id, // fallback to ID if name is missing
        type: entity.type || '',
        source:'clipboard'
      };
    }
  //only here if there was nothing on the clipboard.
//check if there is someone logged in. If so use that id


const authUser = await executeIfPermitted( null,'getAuthenticatedUser', {approfileId: null });
console.log('context  authUser',authUser);
//func needs { authUserId } = payload;  // if auth doesn't know a name, get the name from the appro for that auth user
//remeber that appro id != authId. The app mostly does not use authId. auth_user_id is a column in the appro & may be != to the appro id
//sorry for the complication. It is based on the idea that not exposing authId is safer.
if(authUser && !authUser.name) { const userTempData  = await executeIfPermitted( null,'readApprofileByAuthUserId', {authUserId: authUser.id });  
authUser.name = userTempData.name; } 


console.log('authUser',authUser);

if (authUser ) return {
              id:authUser.id, 
              name:authUser.name || 'unknown',
              email:authUser.email,
              type: 'app-human',
              source:'authUser'}
              ; 
  
              else return {
      id: appState.query.userId,
      name: appState.query.userName,
      type: appState.query.userType,
      source:'appState'
    };
  }
  
/* return from registry
{
      id: user?.id,
      email: user?.email,
      created_at: user?.created_at,
      confirmed_at:user?.confirmed_at,
      
      last_sign_in_at: user?.identities.last_sign_in_at  //fails? not available here, can get in local storage
 
       // role: user?.role, // if you add custom claims
      // user?.user_metadata?.full_name, etc.
      //isAuthenticated: user?.isAuthenticated, //fails?
}
*/

export function applyPresentationRules(panel, isMyDash) {
    const dropdownContainer = panel.querySelector('[data-role="subject-dropdown"]')?.closest('div');
    const instructions = panel.querySelector('[data-action="selector-dialogue"]');
    if (isMyDash) {
      if (dropdownContainer) dropdownContainer.style.display = 'none';
      if (instructions) instructions.style.display = 'none';
    } //else {
     // if (dropdownContainer) dropdownContainer.style.display = '';
    //  if (instructions) instructions.style.display = '';
    //}
    
  } 
//moved the above from displayRelations 18:16 Oct 27