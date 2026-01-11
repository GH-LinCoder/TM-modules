// reactToNoteClick.js
console.log('ui/reactToNoteClick.js');

import { executeIfPermitted } from '../registry/executeIfPermitted.js';
import { appState } from '../state/appState.js';
import { showToast } from '../ui/showToast.js';
import { resolveSubject, detectContext, applyPresentationRules } from '../utils/contextSubjectHideModules.js';
import { collectUserChoices, messageAddress} from './collectUserChoices.js';


const userId = appState.query.userId;

const statusMap = {
    6: { label: 'Pending (Complete)', icon: '❓', color: 'text-green-500' },
    9: { label: 'Abandoned', icon: '❌', color: 'text-red-500' },
    7: { label: 'Pending (Abandon)', icon: '❓', color: 'text-red-500' },
    8: { label: 'Completed', icon: '✅', color: 'text-green-500' }
};

const debounceTimers = new Map();


let authorName , authorId, noteContent, noteId, noteInt, audienceId =    null;




function findNextStatus(currentStatus) {
  if (currentStatus === 'No status') {
    return 6;
  }

  if (currentStatus === undefined || currentStatus === null || currentStatus === '') {
    return 6; // ← return early instead of assigning
  }

  if (!isNaN(currentStatus)) {
    currentStatus = Number(currentStatus);
  }

  switch (currentStatus) {
    case 6: return 9;
    case 9: return 7;
    case 7: return 8;
    case 8: return 'No status';
    default: return 6;
  }
}

function getIconFromStatus(status) {
    if (statusMap[status]) {
        return statusMap[status].icon;
    }
    return '';
}


export async function reactToStatusClick(noteId){
  console.log(`reactToStatusClick(${noteId})`);

    const noteElement = document.querySelector(`[data-note-id="${noteId}"]`);
    if (!noteElement) {
        console.error(`Note element with ID ${noteId} not found`);
        return;
    }

    const statusBar = noteElement.querySelector('.status-bar');
   if (!statusBar) {
        console.error(`Status bar not found for note ${noteId}`);
        return;
    }
    
// Get status from the status bar element
const currentStatus = statusBar.dataset.notesStatus;
//        if (!currentStatus) {
//        console.error(`Note status not found`);
  //      return;  // this fails because status seems to be '' initially
  //  }

console.log(`Reading status for note ${noteId}`);
console.log('statusBar element:', statusBar);
console.log('statusBar.dataset:', statusBar.dataset);
console.log('statusBar.dataset.notesStatus:', statusBar.dataset.notesStatus);

    
    console.log('currentStatus:', currentStatus);
    
    let nextStatus = findNextStatus(currentStatus);
    let nextIconHTML = '';
    if (Number.isInteger(nextStatus)) {
        nextIconHTML = getIconFromStatus(nextStatus);
    }

    // Update the data attribute
    statusBar.dataset.notesStatus = nextStatus;
    
    // Update the UI
    statusBar.innerHTML = `
        <span>Status: ${nextStatus}</span>
        ${nextIconHTML ? `<span class="ml-2">${nextIconHTML}</span>` : ''}
        <span class="mx-2">•</span>
        <span>Click anywhere to cycle through status choices</span>
    `;
    
    // Clear any existing timer for this note
    if (debounceTimers.has(noteId)) {
        clearTimeout(debounceTimers.get(noteId));
        debounceTimers.delete(noteId);
    }
    console.log('noteId', noteId);
        console.log('nextStatus', nextStatus);
    // Set a new timer to update the database after a delay
    const timer = setTimeout(async () => {
        if (Number.isInteger(nextStatus)) {
           // const supabase = createSupabaseClient();
            await saveNoteStatus(noteId, nextStatus);
        }
        debounceTimers.delete(noteId);
    }, 2000);
    
    debounceTimers.set(noteId, timer);

}


///////////////////////////////////// HANDLE NOTE CLICKS  - can only set-up toggles and variables.

export async function reactToNoteClick(noteId) { // this is a click to handle the note, not the status
    console.log(`reactToNoteClick(${noteId})`);//the id has '-body' attached as a suffix

    const noteElement = document.querySelector(`[data-note-id="${noteId}"]`);//this find the status panel not the text of the note
    if (!noteElement) {
        console.error(`Note element with ID ${noteId} not found`);
        return;
    }

    const data =   storeNoteDetails(noteElement); 
    // Update the UI
    //    noteElement.innerHTML += `<span>*</span>`;  // places an asterix on card -temporary indicator


    highlight(noteElement); // changes note color and border when selected
    
    // Clear any existing timer for this note
    if (debounceTimers.has(noteId)) {
        clearTimeout(debounceTimers.get(noteId));
        debounceTimers.delete(noteId);
    }

    moveNoteIntoTextArea(noteElement);//noteId has '--body' as suffix

    let userAuthId = null;
    const subject = await resolveSubject();
    console.log('subject:',subject, 'Source:',subject.source);

if(subject && subject.source =='authUser') {//the user data is authenticated. We have auth & approuserId
//what actions should be allowed if user is from clipboard or default?  Not sure
//perhaps there are limited abilties - allows admin to see what another user sees.
userAuthId = subject.id;
}

if(userAuthId===authorId) handleOwnNotes(data); 
else handleOthersNotes(data);

}




///////////  HANDLE OWN NOTES


function handleOwnReply(data){  //similar to self - but this should be a thread which references the specific note
    //system can't currently differentiate between a reply to the author and a reply to a specific note
showToast('The setting will send to self, but threads are not yet implemented', 'warning');
//        console.log('handleOwnReply: similar to self - but this should be a thread');

}

function handleOwnSelf(data){  //similar to own reply, but this is a new post unconnected
        //console.log('handleOwnSelf: similar to reply - but this is a new independent post to self');    
// the process of sending goes through because the original code runs. Perhaps these branches should toggle something
showToast('The setting is sending to self', 'warning');
}

function handleOwnTo(data){//
    console.log('handleOwnTo: forwarding'); //Note clicked - load the audience with the author from the note, but audience is read only from collectUserChoices()
showToast('Please check if you are replying to the author or you do want to forward somewhere else', 'warning');

// the process of sending goes through because the original code runs.
// this branch needs to load the note author id.  BUT should the the reply be to the note Id  somehow?

}

function handleOwnFrom(data){
       // console.log('handleOwnFrom: Change filter - warn on button - disable');
// 'save-notes'
//const saveBtn = document.getElementById('save-notes'); //if disabled it won't be re-enabled
//saveBtn.disabled=true; // a clicked note currently has no from action (It could mean display other items from this person)
showToast('(From) currently does nothing to affect a clicked note.','warning');
}


function handleOwnNotes(data){
console.log('handleOwnNotes()');
//This is after a note has been clicked, but before [send/save]. 

collectUserChoices();// read all the checkboxes & radio -- but not assigned to anything???

switch (messageAddress){ // messageAddress is imported from collectUserChoices
case 'to': handleOwnTo(data); break;  //Note clicked - load the aduience with the audthor from the note
case 'self': handleOwnSelf(data); break; // not happening
case 'from': handleOwnFrom(data); break;
case 'reply':handleOwnReply(data); break;
default: console.log('messageAddress unknown:', messageAddress)}

//audience is to whom the message is sent. Reply & to are valid for sending
// only use the value in the dropdown if 'to' has been selected

console.log('messageAddress:',messageAddress);
}

//eo handle own notes


/////////////////  HANDLE NOTES FROM OTHERS 

function handleOtherReply(data){  //reply to the note's author
        console.log('handleOtherReply: similar to self - but this is a thread');
showToast('The setting will send to the author, but threads are not yet implemented', 'warning');

}

function handleOtherSelf(data){  //repost other's note as your own
showToast('Do you want to send this to yourself?', 'warning');
}

function handleOtherTo(data){//forward someone else's note
showToast('The setting will forward the note to whoever you select from the dropdown', 'warning');


}

function handleOtherFrom(data){//filter displayed notes disable button
showToast('(From) currently does not do anything clever with a clicked note', 'warning');

}


function handleOthersNotes(data){
console.log('handleOthersNotes()');


collectUserChoices();// read all the checkboxes & radio

switch (messageAddress){
case 'to': handleOtherTo(data); break;     //forward someone else's note
case 'self': handleOtherSelf(data); break; //repost other's note as your own
case 'from': handleOtherFrom(data); break; //filter displayed notes disable button
case 'reply':handleOtherReply(data); break;//reply to the note's author
default: console.log('messageAddress unknown:', messageAddress)}

//audience is to whom the message is sent. Reply & to are valid for sending
// only use the value in the dropdown if 'to' has been selected

console.log('messageAddress:',messageAddress);

}

//eo handle notes from others





function storeNoteDetails(cardClicked){
    //store the metadata in globals //noteId has '--body' as suffix
console.log('storeNoteDetails()');
    const data=cardClicked.dataset;
authorId =    data.noteAuthorId;
noteContent = data.noteContent;
noteId=       data.noteId.substring(0, data.noteId.length - 5);//remove the suffix -body
noteInt =     data.noteInt;
authorName=   data.noteName;

console.log('authorId',authorId, 'noteInt',noteInt,'authorName',authorName);

/** result in log:
authorId 9066554d-1476-4655-9305-f997bff43cbb 
noteInt 241 
authorName Lin Coder
*/
//console.log('data','authorId:',authorId, 'noteContent',noteContent,'noteId', noteId, 'noteInt',noteInt,'authorName', authorName );//looks oay 19:17 Jan 8
return data;
}


async function moveNoteIntoTextArea(cardClickedEl){
console.log('moveNoteIntoTextArea(',cardClickedEl,')');
  //place text in textarea //
let textarea = document.getElementById("note-content");
console.log('textarea',textarea);
textarea.value = noteContent;
}


function highlight(cardClicked){
  console.log('highlight()', cardClicked, 'dataset',cardClicked.dataset);
  document.querySelectorAll(`[data-note-id]`).forEach(el => {
   // console.log('el:',el, 'cardClicked', cardClicked);
    el.classList.toggle('ring-4', el === cardClicked);
    el.classList.toggle('ring-blue-500', el === cardClicked);
    el.classList.toggle('bg-blue-100', el === cardClicked);
  });
} 






export async function saveNoteStatus(noteId, newStatus) {
    console.log("saveNoteStatus()", newStatus);
    const result = await executeIfPermitted(userId, 'reactToNoteClick', {
      noteId,
      newStatus
    });
    
    if (!result?.success) {
      console.error(`❌ Failed to update status for note ${noteId}:`, result?.message);
    }    
}
