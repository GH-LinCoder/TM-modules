import { appState } from '../state/appState.js';
import { getClipboardItems, onClipboardUpdate } from '../utils/clipboardUtils.js';
import { executeIfPermitted } from '../registry/executeIfPermitted.js';

// new functions to find data - External file to be imported by each module

//should use cache to prevent repeated db calls

export function detectMyDash(panel = null) {
 if (panel) {
        return panel.closest('[data-module]')?.dataset.module === 'myDash';
    }
    
    // ✅ If no panel, query the document directly
    return document.querySelector('[data-module="myDash"]') !== null;

  }

  // Return the latest item from the clipboard. If nothing there return the default value from appState (which is a person's id and name)
/*

resolveSubject
Returns three possible types of info on the current subject

check result.source

='clipboard' - the subject has been selected by the user via the clipboard. This is probably not the current user.  

='appState' there was no one on the clipboard and no one is logged in. This is a default identity 

='authUser' The data is for the logged in current user. This will include the auth id, the appro id for that user (may be different), name, email and created_at

*/

  export async function resolveSubject() {
    console.log('resolveSubject()');
//moved this to start 19:05 May 3. So many errors over this.
const authUser = await executeIfPermitted( null,'getAuthenticatedUser', {approfileId: null });
if(authUser) {console.log('Authenticated user found:', authUser); appState.query.userAuthId = authUser.id;}
console.log('appState.query.userAuthId',appState.query.userAuthId,'authUser',authUser);//ok
let approUserId=null;

if(appState.query.userAuthId) 

  { //avoid throwing error if not found
  const approData  = await executeIfPermitted( null,'readApprofileByAuthUserId', {authUserId: appState.query.userAuthId });
  console.log('approData',approData);  //ok has name
  if(approData.data){ 
   // console.log('approData',approData);
    appState.query.userName = approData.data.name || 'Needs to choose a name';   
    console.log ('appState.query.userName',appState.query.userName,'approData.data',approData.data), 'approId', approData.data.id;
    appState.query.userId = approData.data.id; //appro id
//    console.log('approData',approData,'approUserId', approUserId) 
   } 
   console.log('authUser',appState.query.userAuthId, 'approId',appState.query.userId, 'userName', appState.query.userName);
  }


    const clipboardItems = getClipboardItems(); // no type filter
    //console.log('clipboardItems', clipboardItems);
  
    /*  21:20 Jan 14  weird... 
    when logged-in as wed1156 
      profile ok, but nosurveys, relations or tasks shown 

if then put on clipboard , 
lose approId,  auth is wrong, lost type, source
but see tasks, surveys, relations & managed

    'auth:', entity.items.id,
    'appro:',entity.items.approUserId,
    'name:',entity.items.name,
    'email:',entity.items.email,
    'created',entity.items.created_at,
    'type:',entity.items.type,
    'source:',entity.items.source);
  */

//Need to send back all three values and let the calling module determine which to use. Or put them in the appState.query together with a timestamp. If time is within 10? seconds don't update


    if (clipboardItems.length > 0) { //treat the first item on the clipboard as the subject? (first is most recent?)
      const entity = clipboardItems[0].entity;
    //  console.log('entity',entity);
      return {
        id: entity.item.auth_user_id,
        approUserId:entity.id,
        name: entity.item.name,
        email:entity.item.email,
        created_at:entity.item.created_at,

        type: entity.type,
        source:'clipboard'
      };
    }
  //only here if there was nothing on the clipboard.
//check if there is someone logged in. If so use that id

//only continues if nothing on clipbaord

//console.log('context  authUser',authUser);
//func needs { authUserId } = payload;  // if auth doesn't know a name, get the name from the appro for that auth user
//remember that appro id != authId. The app mostly does not use authId. auth_user_id is a column in the appro & may be != to the appro id
//sorry for the complication. It is based on the idea that not exposing authId is safer.





if (authUser ) return {
              id:authUser.id, 
              approUserId:appState.query.userId || null, //added  || nul 12:00 Jan 13
              name:appState.query.userName || 'unknown',
              email:authUser.email,
              created_at:authUser.created_at,

              type: 'app-human',
              source:'authUser'}
              ; 
  
              else return {//this is a default mock test user - but myDash ignores it and just displays 'unknown' when no one is logged in March 19
      id:appState.query.userAuthId,  
      approUserId: appState.query.userId,
      name: appState.query.userName,
      email:appState.query.userEmail,
      created_at:appState.query.created_at,

      type: appState.query.userType,
      source:'appState'
    };
  }
/* appState.query contains this default mock test user:
  userAuthId:'e0c6201d-66e0-4b1c-8826-027ec059d523',
userId :'e0c6201d-66e0-4b1c-8826-027ec059d523',//Huyie T&M vidoes task, member of TestMock,
userName:'Huyie Evridge',
userEmail:'huyie@test.com',
userType: 'app-human',
created_at:'2025-07-28 18:13:47.723148+00',
*/



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

export function myDashOrAdminDashDisplay(panel, isMyDash) { // is this doing anything? 14:13 Feb 18
    const dropdownContainer = panel.querySelector('[data-role="subject-dropdown"]')?.closest('div');//this is the dropdown for selecting the subject of the display
    const instructions = panel.querySelector('[data-action="selector-dialogue"]');//this is an active area which, if clicked, opens the [Select] module
    if (isMyDash) {
      if (dropdownContainer) dropdownContainer.style.display = 'none'; //don't display the dropdown in myDash
      if (instructions) instructions.style.display = 'none'; //don't open the [Select] module if clicked in myDash, only in adminDash
    } //else {
     // if (dropdownContainer) dropdownContainer.style.display = '';
    //  if (instructions) instructions.style.display = '';
    //}
    
  } 
//moved the above from displayRelations 18:16 Oct 27