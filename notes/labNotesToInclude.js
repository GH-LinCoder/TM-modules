// need to build this into T&M/notes/notes.js


   // Updates the status of a note.  //NEED MOVE TO REGISTRY
   export async function saveNoteStatus(supabase, noteId, newStatus) {
    console.log("saveNoteStatus()");
    const { data, error } = await supabase
      .from('notes')
      .update({ status: newStatus })
      .eq('id', noteId);
  
    if (error) {
      console.error(`Failed to update status for note ${noteId}:`, error);
    }
    return { data, error };
  }


/** //NEED MOVE TO REGISTRY
 * Inserts a new note and returns its ID. Updated to accept object containg the params
 */
export async function insertNote(supabase, noteData) {
  const {
    author_id,
    audience_id = null,
    reply_to_id = null,
    title = 'AutoTitle',
    content,
    status = null
  } = noteData;

  console.log("📝 insertNote data:", { author_id, content, title }); // Debug

  try {
    const { data, error } = await supabase
      .from('notes')
      .insert([{
        author_id,
        audience_id,
        reply_to_id,
        title,
        content,
        status
      }])
      .select('id');

    if (error) throw error;

    return data[0].id;
  } catch (error) {
    console.error('❌ insertNote failed:', error);
    throw error;
  }
}
/** //NEED MOVE TO REGISTRY
 * Fetches a page of notes.
 */  
// In fetchNotes.js - return with consistent naming
export async function fetchNotes(supabase, page = 1, pageSize = 10) {
    console.log("fetchNote()", page);

  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data, count, error } = await supabase
    .from('notes')
    .select('*', { count: 'exact' })
    .order('sort_int', { ascending: false })
    .range(start, end);

  if (error) {
    console.error('Error fetching notes:', error);
    return { notes: [], totalCount: 0 };
  }

  return { notes: data, totalCount: count };
}