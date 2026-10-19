// ./dash/loadRunDashWithData.js
import { appState } from '../state/appState.js';
//import { executeIfPermitted } from '../registry/executeIfPermitted.js';
//import { showToast } from '../ui/showToast.js';
//import { petitionBreadcrumbs } from '../ui/breadcrumb.js';
import { onClipboardUpdate } from '../utils/clipboardUtils.js';
import { resolveSubject} from '../utils/resolveSubjectPlus2.js'
console.log('loadRunDashWithData.js   loaded');

let subject=null;
let data = null;

export async function loadRunDashWithData() {
  console.log('loadRunDashWithData()');

//showToast('This website only stores essential data.' ,'info', 3000);

subject = await resolveSubject();  
 updateBanner();
 respondToClipboardChange()

  
data ='User: '+ appState.query.userName + ' Auth 🆔: ' + appState.query.userAuthId;

console.log('data',data);
updateAll('[data-value="user-details"]', data); //user name and appro id of the logged in user

data = 'Data: '+ subject.name + ' Appro 🆔: ' + subject.approUserId;  // subjet.id is auth id
console.log('data',data);
updateAll('[data-value="data-details"]', data); //name and appro id of the selected item (from clipboard or default) 

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



function respondToClipboardChange(){
        onClipboardUpdate(() => {
         updateBanner();
        }); 
}


//data-value="user-details"
//data-value="data-details"

async function updateBanner() { 
if(!subject) {console.log('Error - no subject returned');

}

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
        
    }
    