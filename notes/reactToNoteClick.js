// reactToNoteClick.js
console.log('ui/reactToNoteClick.js');

import { executeIfPermitted } from '../registry/executeIfPermitted.js';
import { appState } from '../state/appState.js';
import { resolveSubject, detectContext, applyPresentationRules } from '../utils/contextSubjectHideModules.js';
import { collectUserChoices, messageAddress } from './collectUserChoices.js';


const userId = appState.query.userId;

const statusMap = {
    6: { label: 'Pending (Complete)', icon: '❓', color: 'text-green-500' },
    9: { label: 'Abandoned', icon: '❌', color: 'text-red-500' },
    7: { label: 'Pending (Abandon)', icon: '❓', color: 'text-red-500' },
    8: { label: 'Completed', icon: '✅', color: 'text-green-500' }
};

const debounceTimers = new Map();

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



///////////  HANDLE OWN NOTES


function handleOwnReply(data){  //similar to self - but this is a thread
        console.log('handleOwnReply: similar to self - but this is a thread');
//udience = user.id;  //need chcek where the approIs is
//INSERT with own id as audience
}

function handleOwnSelf(data){  //similar to own reply, but this is a new post unconnected
        console.log('handleOwnSelf: similar to reply - but this is a new independent post');    
//audience = user.id;  //need check where the approIs is

}

function handleOwnTo(data){//
    console.log('handleOwnTo: forwarding');
let audience=null; 
const respondentSelected = document.getElementById('respondentSelect')?.value;
audience = respondentSelected === '' ? null : respondentSelected;
//INSERT with audience from dropdown

}

function handleOwnFrom(data){
        console.log('handleOwnFrom: Change filter - warn on button - disable');
const audience = null;
}


function handleOwnNotes(data){
console.log('handleOwnNotes()');
const {authorId =    data.noteAuthorId,
    noteContent = data.noteContent,
    noteId=       data.noteId.substring(0, data.noteId.length - 5),//remove the suffix -body
    noteInt =     data.noteInt,
    authorName=   data.noteName
} = data;  // not used locally? just pass ?

//check the message radio buttons  self / reply / to / from

// reply -> going to be an INSERT marked id of the note it is replying to "Reply to this note"
// self    -> going to be an UPDATE of current note. Change button to "Update this note"
// to    -> going to be an insert marked with audienceId collected from the dropdown "Forward this note"
//from -> Change button "From filters the diplayed notes." disable button?

/*the possible actions

1)edit/UPDATE -  how choose update vs insert?
2)Edit for new INSERT  
3)INSERT (with or without edit) send to someone else
4)Delete
*/
 
collectUserChoices();// read all the checkboxes & radio

switch (messageAddress){
case 'to': handleOwnTo(data); break;  
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
//udience = user.id;  //need chcek where the approIs is
//INSERT with Other id as audience
}

function handleOtherSelf(data){  //repost other's note as your own
        console.log('handleOtherSelf: similar to reply - but this is a new independent post');    
//audience = user.id;  //need check where the approIs is

}

function handleOtherTo(data){//forward someone else's note
    console.log('handleOtherTo: forwarding');
let audience=null; 
const respondentSelected = document.getElementById('respondentSelect')?.value;
audience = respondentSelected === '' ? null : respondentSelected;
//INSERT with audience from dropdOther

}

function handleOtherFrom(data){//filter displayed notes disable button
        console.log('handleOtherFrom: Change filter - warn on button - disable');
const audience = null;
}



function handleOthersNotes(data){
console.log('handleOthersNotes()');
const {authorId =    data.noteAuthorId,
    noteContent = data.noteContent,
    noteId=       data.noteId.substring(0, data.noteId.length - 5),//remove the suffix -body
    noteInt =     data.noteInt,
    authorName=   data.noteName
} = data;

/** the possible actions

* 1)Copy(edit) and repost INSERT
 * 2)Reply (edit)
 * 3)Forward (edit)
 * 
 */

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



async function getApproIdFromAuthId(authId){

return  await executeIfPermitted('readApprofileByAuthUserId:', {authUserId:authId});

}


async function moveNoteIntoTextArea(cardClickedEl){
console.log('moveNoteIntoTextArea(',cardClickedEl,')');
let userApproId = null; let userAuthId = null;
    const subject = await resolveSubject();
console.log('subject:',subject, 'Source:',subject.source);

if(subject && subject.source =='authUser') {//the user data is authenticated. We have auth & approuserId
//what actions should be allowed if user is from clipboard or default?  Not sure
//perhaps there are limited abilties - allows admin to see what another user sees.
userAuthId = subject.id;
}



  //place text in textarea  //noteId has '--body' as suffix


const data=cardClickedEl.dataset;
const authorId =    data.noteAuthorId;
const noteContent = data.noteContent;
const noteId=       data.noteId.substring(0, data.noteId.length - 5);//remove the suffix -body
const noteInt =     data.noteInt;
const authorName=   data.noteName;

/** result in log:
noteAuthorId: "9066554d-1476-4655-9305-f997bff43cbb"
noteContent: "react to save"
noteId: "e22f6f0e-6086-4ef6-bb48-4579482263b4-body"  <--- note SUFFIX
noteInt: "219"
noteName: "Lin Coder"
 * 
*/
/*
data 
DOMStringMap(4) { noteId → "e22f6f0e-6086-4ef6-bb48-4579482263b4-body", 
noteContent → "react to save", noteName → "Lin Coder", noteInt → "219" }
noteContent: "react to save"
noteId: "e22f6f0e-6086-4ef6-bb48-4579482263b4-body" //<--SUFFIX
noteInt: "219"
noteName: "Lin Coder"
*/

console.log('data','authorId:',authorId, 'noteContent',noteContent,'noteId', noteId, 'noteInt',noteInt,'authorName', authorName );//looks oay 19:17 Jan 8


let textarea = document.getElementById("note-content");
console.log('textarea',textarea);
textarea.value = noteContent;

    //if id == user set button to self? else set to reply?
//if()    

if(userAuthId===authorId) handleOwnNotes(data); 
else handleOthersNotes(data);






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


export async function reactToNoteClick(noteId) { // this is a click to handle the note, not the status
    console.log(`reactToNoteClick(${noteId})`);//the id has '-body' attached as a suffix

    const noteElement = document.querySelector(`[data-note-id="${noteId}"]`);//this find the status panel not the text of the note
    if (!noteElement) {
        console.error(`Note element with ID ${noteId} not found`);
        return;
    }

    
    // Update the UI
//    noteElement.innerHTML += `<span>*</span>`;  // places an asterix on card -temporary indicator


highlight(noteElement); // changes note color and border when selected
    
    // Clear any existing timer for this note
    if (debounceTimers.has(noteId)) {
        clearTimeout(debounceTimers.get(noteId));
        debounceTimers.delete(noteId);
    }

    moveNoteIntoTextArea(noteElement);//noteId has '--body' as suffix



    /*
    // Set a new timer to update the database after a delay
    const timer = setTimeout(async () => {
        if (Number.isInteger(nextStatus)) {
           // const supabase = createSupabaseClient();
            await saveNoteStatus(noteId, nextStatus);
        }
        debounceTimers.delete(noteId);
    }, 2000);
    
    debounceTimers.set(noteId, timer);
*/




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
