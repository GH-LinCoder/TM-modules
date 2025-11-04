//cleanupNoteInput.js

console.log('cleanupNoteInput.js');

export async function cleanupNoteInput (message='Cleared'){
console.log('cleanupNoteInput()');
//  const noteContent = document.getElementById('note-content')

const note = document.getElementById('note-content');
note.value = "";
note.placeholder = message;

setTimeout(() => {
  note.placeholder = "Enter your notes here & press [Save/send]... (Use the checkboxes to tag your note for later search & retrieval ) The saved notes can be seen by scrolling down. When you look at saved notes you can click them to mark them as pending, completed or abandonded.";
}, 2000); // 2 seconds later


  
//renderNotes
  //reset tags?
  //reset notes text input  'Saved'? 
  
}
