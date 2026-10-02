import { appState } from '../state/appState.js';
import { getClipboardItems} from '../utils/clipboardUtils.js';
import { executeIfPermitted } from '../registry/executeIfPermitted.js';

// functions to find data - External file to be imported by each module

//should use cache to prevent repeated db calls



  // Return the latest item from the clipboard. If nothing there return the default value from appState (which is a person's id and name)

  export async function resolveSubject() {
    console.log('resolveSubject()');

//AUTH USER
    const authUser = await executeIfPermitted( null,'getAuthenticatedUser');
    if(authUser) {
                //console.log('Authenticated user found:', authUser); 
    //store the logged in user details in the global so can be accessed by modules                
    appState.query.userAuthId = authUser.id;}
                //console.log('appState.query.userAuthId',appState.query.userAuthId,'authUser',authUser);//ok
                //let approUserId=null;

if(appState.query.userAuthId) //collect some other data about the lgged in user

  { //avoid throwing error if not found
  const approData  = await executeIfPermitted( null,'readApprofileByAuthUserId', {authUserId: appState.query.userAuthId });
  console.log('approData',approData);  //ok has name
  if(approData.data){ 
                           // console.log('approData',approData);
    appState.query.userName = approData.data.name || 'Needs to choose a name';   
                           //   console.log ('appState.query.userName',appState.query.userName,'approData.data',approData.data), 'approId', approData.data.id;
    appState.query.userId = approData.data.id; //Should rename to approUserId to avoid confusion with authUserId.  This is the id of the appro record for this user, which may be different from the authUserId.  The appro record is what the app uses for most things, not the authUserId.  The authUserId is only used for authentication and is not exposed to the app in most cases.
    console.log('approData',approData,'userAuthId', appState.query.userAuthId) 
   } 
                            //   console.log('authUser',appState.query.userAuthId, 'approId',appState.query.userId, 'userName', appState.query.userName);
  }

//CLIPBAORD
    const clipboardItems = getClipboardItems();
                     //console.log('clipboardItems', clipboardItems); 
                    //what is this for???  
                    // Why is it searching for a task or survey rather than returning the most recent item on the clipboard?

/* removed Oct 2 2026. No idea what it was for
    const preferredClipboardItem = (() => {
      const taskOrSurvey = clipboardItems.find(item => {
        const type = item?.entity?.type || item?.type;
        return type === 'app-task' || type === 'app-survey'
          || type === 'task' || type === 'tasks'
          || type === 'survey' || type === 'surveys';
      });
      return taskOrSurvey || clipboardItems[0] || null;
    })();
*/

//new version 17:43 Oct 2 2026 -return the last entry on the clipboard if there is one.
    if (clipboardItems.length > 0) {
      const entity = clipboardItems[clipboardItems.length - 1].entity;
      const item = entity?.item || entity || {};

      console.log('subject ids',{type: entity.type,entityId: entity.id,itemId: item.id});

      return {
        id: entity.id,
        approUserId: entity.id, //if not an appro this will be a task or survey id. 
        name:entity.name || 'Selected item',
        created_at: item.created_at || null,
//        type: entity.type || item.type || 'app-human', //this defaulted to human. Why?
        type: entity.type || item.type || 'unknown', //removed human. 17:24 Oct 2 2026
        source: 'clipboard'
      };
    }

    //only here in code if there was nothing on the clipboard.
    //check if there is someone logged in. If so use that id

                //console.log('context  authUser',authUser);
                //remember that appro id != authId. The app mostly does not use authId. auth_user_id is a column in the appro & may be != to the appro id
                //sorry for the complication. It is based on the idea that not exposing authId is safer.

//if there is nothing selected on the clipboard we act as if the authUser has been selected
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

export function detectMyDash(panel = null) {//What is this for???
 if (panel) {
        return panel.closest('[data-module]')?.dataset.module === 'myDash';
    }
    
    // ✅ If no panel, query the document directly
    return document.querySelector('[data-module="myDash"]') !== null;

  }