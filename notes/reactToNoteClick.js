// reactToNoteClick.js
console.log('ui/reactToNoteClick.js');

import { createSupabaseClient } from '../db/client.js';

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




/*
function findNextStatus(currentStatus) {
  // Treat undefined, null, or empty string as "unclassified"
  if (currentStatus === undefined || currentStatus === null || currentStatus === '') {
    currentStatus = 6;
  }

  // Normalize stringified numbers
  if (!isNaN(currentStatus)) {
    currentStatus = Number(currentStatus);
  }

  switch (currentStatus) {
    case 6: return 9;
    case 9: return 7;
    case 7: return 8;
    case 8: return 'No status';
    case 'No status': return 6;
    default: return 6; // fallback for anything unexpected
  }
}*/



/*
function findNextStatus(currentStatus) {

    // Normalize to number if it's numeric. added 19:20 16 Aug. Suspect it is a string '6' etc
if (!isNaN(currentStatus) && currentStatus !== '') {
  currentStatus = Number(currentStatus);
    
    switch(currentStatus) {
        case 6:
            return 9;
        case 9:
            return 7;
        case 7:
            return 8;
        case 8:
            return 'No status';
        case 'No status':
            return 6;
        default:
            return 6;
    }// end switch
  }// end if
}//end of func
*/
function getIconFromStatus(status) {
    if (statusMap[status]) {
        return statusMap[status].icon;
    }
    return '';
}

export async function reactToNoteClick(noteId) {
    console.log(`reactToNoteClick(${noteId})`);

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
    
    // Set a new timer to update the database after a delay
    const timer = setTimeout(async () => {
        if (Number.isInteger(nextStatus)) {
            const supabase = createSupabaseClient();
            await saveNoteStatus(supabase, noteId, nextStatus);
        }
        debounceTimers.delete(noteId);
    }, 2000);
    
    debounceTimers.set(noteId, timer);
}

export async function saveNoteStatus(supabase, noteId, newStatus) {
    console.log("saveNoteStatus()", newStatus);
    const { data, error } = await supabase
        .from('notes')
        .update({ status: newStatus })
        .eq('id', noteId);

    if (error) {
        console.error(`Failed to update status for note ${noteId}:`, error);
    }

    return { data, error };
}
