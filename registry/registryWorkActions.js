// ./../../registry/registryWorkActions.js

/**
 * A central registry that maps data-action:"data-*  " action names to their metadata and
 * a reference to the actual function for some work process.
 * (There is a separate registry for loading modules as pages or section mutations)
 */
export const registryWorkActions = {



// DEV  ------------------------------ probably delete later
readGenericTable: {
  metadata: {
    tables: ['app_profiles'], // mock 
    columns: ['id', 'name', 'email', 'notes', 'phone', 'sort_int', 'avatar_url', 'created_at','updated_at','description',  'auth_user_id', 'external_url', 'task_header_url',],
    type: 'SELECT',
    requiredArgs: []
  },
  handler: async (supabase, userId, payload) => {
    const { tableName } = payload;
    if (!tableName) throw new Error('tableName required');
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*');
    
    if (error) throw error;
    return data;
  }
},




//////////////////////////   COUNTING   ///////////////////////

approfilesCount:{
  metadata: {
    tables: ['app_profiles'],
    columns: ['id', 'name', 'email', 'notes', 'phone', 'sort_int', 'avatar_url', 'created_at','updated_at','description',  'auth_user_id', 'external_url', 'task_header_url',],
    type: 'SELECT',
    requiredArgs: []
  },
  handler: async  (supabase, userId) =>{
    console.log('approfilesCount()');
    const { count, error } = await supabase
    .from('app_profiles')
    .select('*', { count: 'exact', head: true }); // ← head: true = don't return rows, just count 

    if (error) {
      console.error('Error counting members:', error.message);
      throw new Error('Failed to count members.');
    }
    
    return count// if use {count} it would be in form  {count: 23}
  }
},



assignmentsCount:{
  // Metadata for the permissions system
  metadata: {
    tables: ['task_assignments'],
    columns: [],
    type: 'SELECT',
    requiredArgs:['supabase', 'userId']
    // This could also hold other data like required user roles or permissions
  },
  // The actual function that interacts with the database
handler: async  (supabase, userId) =>{
  console.log('assignmentsCount()');
  const { count, error } = await supabase
  .from('task_assignments')
  .select('*', { count: 'exact', head: true }); // ← head: true = don't return rows, just count 

  if (error) {
    console.error('Error counting assignments:', error.message);
    throw new Error('Failed to count assignments.');
  }
  
  return count// if use {count} it would be in form  {count: 23}
}
},

authorsCount:{
  // Metadata for the permissions system
  metadata: {
    tables: ['unique_authors'], //VIEW not a table
    columns: [],
    type: 'SELECT',
    requiredArgs:['supabase', 'userId']
    // This could also hold other data like required user roles or permissions
  },
  // The actual function that interacts with the database
handler: async  (supabase, userId) =>{
  console.log('authors_count()');
  const { count, error } = await supabase
  .from('unique_authors')
  .select('*', { count: 'exact', head: true }); // ← head: true = don't return rows, just count 

  if (error) {
    console.error('Error counting authors:', error.message);
    throw new Error('Failed to count authors.');
  }
  
  return count// if use {count} it would be in form  {count: 23}
}
},

managersCount:{
  // Metadata for the permissions system
  metadata: {
    tables: ['unique_managers'], //VIEW not a table
    columns: [],
    type: 'SELECT',
    requiredArgs:['supabase', 'userId']
    // This could also hold other data like required user roles or permissions
  },
  // The actual function that interacts with the database
handler: async  (supabase, userId) =>{
  console.log('managersCount()');
  const { count, error } = await supabase
  .from('unique_managers')
  .select('*', { count: 'exact', head: true }); // ← head: true = don't return rows, just count 

  if (error) {
    console.error('Error counting managers:', error.message);
    throw new Error('Failed to count managers.');
  }
  
  return count// if use {count} it would be in form  {count: 23}
}
},


  membersCount:{
    // Metadata for the permissions system
    metadata: {
      tables: ['profiles'],
      columns: [],
      type: 'SELECT',
      requiredArgs:['supabase', 'userId']
      // This could also hold other data like required user roles or permissions
    },
    // The actual function that interacts with the database
  handler: async  (supabase, userId) =>{
    console.log('membersCount()');
    const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true }); // ← head: true = don't return rows, just count 

    if (error) {
      console.error('Error counting members:', error.message);
      throw new Error('Failed to count members.');
    }
    
    return count// if use {count} it would be in form  {count: 23}
  }
},



studentsCount:{
  // Metadata for the permissions system
  metadata: {
    tables: ['unique_students'], //VIEW not a table
    columns: [],
    type: 'SELECT',
    requiredArgs:['supabase', 'userId']
    // This could also hold other data like required user roles or permissions
  },
  // The actual function that interacts with the database
handler: async  (supabase, userId) =>{
  console.log('studentsCount()');
  const { count, error } = await supabase
  .from('unique_students')
  .select('*', { count: 'exact', head: true }); // ← head: true = don't return rows, just count 

  if (error) {
    console.error('Error counting students:', error.message);
    throw new Error('Failed to count students.');
  }
  
  return count// if use {count} it would be in form  {count: 23}
}
},

tasksCount:{
  // Metadata for the permissions system
  metadata: {
    tables: ['task_headers'],
    columns: [],
    type: 'SELECT',
    requiredArgs:['supabase', 'userId']
    // This could also hold other data like required user roles or permissions
  },
  // The actual function that interacts with the database
handler: async  (supabase, userId) =>{
  console.log('tasksCount()');
  const { count, error } = await supabase
  .from('task_headers')
  .select('*', { count: 'exact', head: true }); // ← head: true = don't return rows, just count 

  if (error) {
    console.error('Error counting tasks:', error.message);
    throw new Error('Failed to count tasks.');
  }
  
  return count// if use {count} it would be in form  {count: 23}
}
},



 /////////////     CREATING  (INSERTING)    ///////////////////

 createApprofile:{
  metadata: {
    tables: ['app_profiles'],
    columns: ['id', 'name', 'email', 'notes', 'phone', 'sort_int', 'avatar_url', 'created_at','updated_at','description',  'auth_user_id', 'external_url', 'task_header_url',],
    type: 'INSERT',
    requiredArgs: ['name', 'description']
  },
  handler: async (supabase, userId, payload) => {
    console.log('Create Approfile()');
    const { name, description } = payload;

    const { data, error } = await supabase
      .from('app_profiles')
      .insert({name:name, description:description})
      .select() //Return the inserted row
      .single(); //Return single object
    if (error) throw error;
    return data; // ✅ Return the array of task headers
  }
 },


createAssignment:{
  metadata: {
  tables: ['task_assignments'],
  columns: ['id', 'step_id','sort_int', 'manager_id', 'student_id', 'assigned_at', 'abandoned_at', 'completed_at', 'task_header_id'],
  type: 'INSERT',
  requiredArgs: ['task_header_id','step_id', 'student_id','manager_id'] // ← payload fields
},
handler: async (supabase, userId, payload) => {
  const { task_header_id, step_id, student_id, manager_id } = payload;
console.log('createAssignment()');
  const { data, error } = await supabase
  .from('task_assignments')
  .insert({
    student_id: student_id,
    manager_id: manager_id || null,
    task_header_id: task_header_id,
    step_id: step_id
  })
  .select() //Return the inserted row
  .single(); //Return single object

  if (error) throw error;
    return data.id; //
  } 
},





createTask: {
  metadata: {
    tables: ['task_headers'],
    columns: ['name', 'description', 'external_url', 'author_id'],
    type: 'INSERT',
    requiredArgs: ['taskName', 'taskDescription'] // ← payload fields
  },
  handler: async (supabase, userId, payload) => {
    const { taskName, taskDescription, taskUrl } = payload;

    // Check for duplicate name
    const {  existingTask, error: fetchError } = await supabase
      .from('task_headers')
      .select('id')
      .eq('name', encodeURIComponent(taskName)) // encodeURIComponent(value) for .eq() & .like()
      .single();

    if (existingTask) {
      throw new Error('A task with that name exists. Your task needs a different name.');
    }

    const { data, error } = await supabase
      .from('task_headers')
      .insert({
        name: taskName,
        description: taskDescription,
        external_url: taskUrl || null,
        author_id: userId // ← use passed userId
      })
      .select()
      .single();

    if (error) throw error;
    return data; // ← returns { id, name, description, ... }
  }
},

readTaskSteps: {
  metadata: {
    tables: ['task_steps'],
    columns: ['id', 'name', 'description', 'step_order'],
    type: 'SELECT',
    requiredArgs: ['taskId']
  },
  handler: async (supabase, userId, payload) => {
    const { taskId } = payload;
    const { data, error } = await supabase
      .from('task_steps')
      .select('id, name, description, step_order')
      .eq('task_header_id', encodeURIComponent(taskId)) // encodeURIComponent(value) for .eq() & .like()
      .order('step_order');
    if (error) throw error;
    return data;
  }
},


////////////////////////////////  UPDATE   /////////////////////

updateTaskStep: {
  metadata: {
    tables: ['task_steps'],
    columns: ['name', 'description', 'external_url=null'],
    type: 'UPDATE',
    requiredArgs: ['taskId', 'stepOrder', 'stepName', 'stepDescription']
  },
  handler: async (supabase, userId, payload) => {
    const { taskId, stepOrder, stepName, stepDescription, stepUrl } = payload;

    const { error } = await supabase
      .from('task_steps')
      .update({
        name: stepName,
        description: stepDescription,
        step_order:stepOrder,
        external_url: stepUrl || null
      })
      .eq('task_header_id', encodeURIComponent(taskId)) // encodeURIComponent(value) for .eq() & .like()
      .eq('step_order', encodeURIComponent(stepOrder)); // encodeURIComponent(value) for .eq() & .like()

    if (error) throw error;
    return { success: true };
  }
},

assignmentUpdateStep:{
  // Metadata for the permissions system
  metadata: {
    tables: ['task_assignments'],
    columns: [],
    type: 'UPDATE',
    requiredArgs:['supabase', 'userId', 'assignment_id', 'step_id' ]
    // This could also hold other data like required user roles or permissions
  },
  // The actual function that interacts with the database
handler: async  (supabase, userId, payload) =>{
  const { step_id, assignment_id } = payload;
  console.log('assignmentUpdateStep() stepId:',step_id,'assignment_id:',assignment_id);
  const { data, error } = await supabase
  .from('task_assignments')
  .update({step_id:step_id}) // ←  
.eq('id',assignment_id);
  if (error) {
    console.error('Error update assignment:', error.message);
    throw new Error('Failed to update assignment.');
  }
  
  return data// returns an empty array. Length=0  ?
}
},

updateApprofile: {
  metadata: {
    tables: ['app_profiles'],
    columns: ['id', 'name', 'email', 'notes', 'phone', 'sort_int', 'avatar_url', 'created_at','updated_at','description',  'auth_user_id', 'external_url', 'task_header_id'],
    type: 'UPDATE',
    requiredArgs: ['id', 'name', 'description'] // id is required for update
  },
  handler: async (supabase, userId, payload) => {
    console.log('updateApprofile()');
    const { id, name, description } = payload; //// id is required for update & name same as sent

    if (!id) {
      throw new Error('id is required for update');
    }

    const { data, error } = await supabase
      .from('app_profiles')
      .update({ 
        name: name, 
        description: description,
        updated_at: new Date().toISOString() // ✅ Good practice to update timestamp
      })
      .eq('id', id) // ✅ Supabase uses .eq() for WHERE conditions
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
},
/*
updateTaskHeader: {// not used ? 
  metadata: {
    tables: ['task_headers'],
    columns: ['name', 'description', 'external_url', 'author_id'],
    type: 'INSERT',
    requiredArgs: ['taskName', 'taskDescription'] // ← payload fields
  },
  handler: async (supabase, userId, payload) => {
    const { taskName, taskDescription, taskUrl } = payload;

    const { data, error } = await supabase
      .from('task_headers')
      .update({
        name: taskName,
        description: taskDescription,
        external_url: taskUrl || null,
        author_id: userId // ← use passed userId
      })
      .select()
      .single();

    if (error) throw error;
    return data; // ← returns { id, name, description, ... }
  }
},
*/

updateTask: {
  metadata: {
    tables: ['task_headers'],
    columns: ['name', 'description', 'external_url'],
    type: 'UPDATE',
    requiredArgs: ['id', 'name', 'description']
  },
  handler: async (supabase, userId, payload) => {
    const { id, name, description, external_url } = payload;

    const { data, error } = await supabase
      .from('task_headers')
      .update({
        name: name,
        description: description,
        external_url: external_url || null,
        updated_at: new Date().toISOString() // Good practice to update timestamp
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
},






//////////////////////////////// INSERT   ///////////////////////////////
createTaskStep: {
  metadata: {
    tables: ['task_steps'],
    columns: ['name', 'description', 'external_url', 'step_order', 'task_header_id', 'author_id'],
    type: 'INSERT',
    requiredArgs: ['taskId', 'stepOrder', 'stepName', 'stepDescription']
  },
  handler: async (supabase, userId, payload) => {
    const { taskId, stepOrder, stepName, stepDescription, stepUrl } = payload;

    const { error } = await supabase
      .from('task_steps')
      .insert({
        name: stepName,
        description: stepDescription,
        external_url: stepUrl || null,
        step_order: stepOrder,
        task_header_id: taskId,
        author_id: userId
      });

    if (error) throw error;
    return { success: true };
  }
},

///////////////////  READING DATA   /////////////////////////

/*
readApprofiles: {//need to be able to filter by "task_header_id" or "auth_user_id"
  //if !null an entry in one of those columns tells us what kind of approfile it is.
  //humans would have an entry in "auth_user_id". Tasks would have an entry in "task_header_id"
  // grpups or abstract would be null in both. (Groups may end up having their own column?)
  metadata: {
    tables: ['app_profiles'],
    columns: ['id', 'name', 'email', 'notes', 'phone', 'sort_int', 'avatar_url', 'created_at','updated_at','description',  'auth_user_id', 'external_url', 'task_header_url',],
    type: 'SELECT',
    requiredArgs: []
  },
  handler: async (supabase, userId, payload) => {
    console.log('readApp_profiles()');
    const { data, error } = await supabase
      .from('app_profiles')
      .select('id, name, email, notes, phone, sort_int, avatar_url, created_at, updated_at, description, auth_user_id, external_url, task_header_id')
      .order('name');

    if (error) throw error;
    return data; // ✅ Return the array of task headers
  }
}, */


readApprofiles: {//need to be able to filter by "task_header_id" or "auth_user_id"
  //if !null an entry in one of those columns tells us what kind of approfile it is.
  //humans would have an entry in "auth_user_id". Tasks would have an entry in "task_header_id"
  // grpups or abstract would be null in both. (Groups may end up having their own column?)
  metadata: {
    tables: ['app_profiles'],
    columns: ['id', 'name', 'email', 'notes', 'phone', 'sort_int', 'avatar_url', 'created_at','updated_at','description',  'auth_user_id', 'external_url', 'task_header_url',],
    type: 'SELECT',
    requiredArgs: []
  },
  handler: async (supabase, userId, payload) => {
    console.log('readApp_profiles()');
    const { data, error } = await supabase
      .from('app_profiles')
      .select('id, name, email, notes, phone, sort_int, avatar_url, created_at, updated_at, description, auth_user_id, external_url, task_header_id')
      .order('name');
  
    if (error) throw error;
  
    // Separate into three groups
    const humanApprofiles = [];
    const taskApprofiles = [];
    const abstractApprofiles = [];
  
    data.forEach(profile => {
      if (profile.auth_user_id) {
        humanApprofiles.push(profile);
      } else if (profile.task_header_id) {
        taskApprofiles.push(profile);
      } else {
        abstractApprofiles.push(profile);
      }
    });

    if (error) throw error;
    return {
      humanApprofiles,
      taskApprofiles,
      abstractApprofiles
    }; 
  }
}, 


readProfilesByIds:{
  metadata: {
    tables: ['app_profiles'],
    columns: ['id', 'name', 'email', 'notes', 'phone', 'sort_int', 'avatar_url', 'created_at','updated_at','description',  'auth_user_id', 'external_url', 'task_header_url',],
    type: 'SELECT',
    requiredArgs: ['ids']
  },
handler: async (supabase, userId, payload) => {
    console.log('readProfilesByIds');
  
    if (ids.length === 0) { return []; }
  
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, notes, phone, sort_int, avatar_url, created_at, updated_at, description, auth_user_id, external_url, task_header_id');

    if (error) throw error;
  return data;
 }
},

readApprofileByName:{
  metadata: {
    tables: ['app_profiles'],
    columns: ['id', 'name', 'email', 'notes', 'phone', 'sort_int', 'avatar_url', 'created_at','updated_at','description',  'auth_user_id', 'external_url', 'task_header_url',],
    type: 'SELECT',
    requiredArgs: ['approfileName']
  },
handler: async (supabase, userId, payload) => {
    console.log('readProfilesByName');
    const { approfileName } = payload;
    if (approfileName===null) { return []; }
  
  const { data, error } = await supabase
    .from('app_profiles')
    .select('id, name, email, notes, phone, sort_int, avatar_url, created_at, updated_at, description, auth_user_id, external_url, task_header_id')
    .eq('name',encodeURIComponent(approfileName));
    if (error) throw error;
  return data;
 }
},





//*
readThisColumnIdFromThatTable:{
metadata:{
  tables:['any_table'], //
  columns:['any_columns'],
  type: 'SELECT',
  requiredArgs:['tableName', 'columnNameId']
},
handler: async (supabase, userId, payload) =>{
  const { tableName, columnNameId } = payload;
  console.log(`readAllRelatedIds from ${tableName}.${columnNameId}`);
  const { data, error } = await supabase
    .from(tableName)
    .select(columnNameId);

  if (error) {
    console.error(`Error fetching all IDs from ${tableName}.${columnNameId}:`, error.message);
    throw new Error(`Failed to fetch IDs from ${tableName}.${columnNameId}.`);
  }
  return data || [];
 }
},
//*/

////////////////////////////////  the below don't call the db  they call other functions.
////////////////////////////////  I don't think this can work from the registry

readAllStudent:{
  metadata:{
    tables:['task_assignments'], //
    columns:['student_id'],
    type: 'SELECT',
    requiredArgs:[],
    },
handler: async(supabase, userId) => {
    console.log('readAllStudent');
    return await readThisColumnIdFromThatTable('task_assignments', 'student_id');
 }
},

readAllManager:{
  metadata:{
    tables:['task_assignments'], //
    columns:['manager_id'],
    type: 'SELECT',
    requiredArgs:[],
    },
handler: async(supabase, userId) => {
  console.log('readAllManagers');
  return await readAllRelatedIds('task_assignments', 'manager_id');
 }
},

readAllAuthor:{
  metadata:{
    tables:['task_headers'], //
    columns:['author_id'],
    type: 'SELECT',
    requiredArgs:[],
    },
handler: async(supabase, userId) => {
    console.log('readAllAuthors');
    return await readThisColumnIdFromThatTable('task_assignments', 'author_id');
 }
},

///////////////////////////  end of functions that call functions




readThisAssignment:{//requires the assignment_id (not the task_header_id. Returns a single row )
  metadata: {
  tables: ['task_assignment_view2'],  //VIEW not a table
  columns: ['step_id', 'step_name','step_description', 'task_name', 'manager_id', 'step_order','student_id', 'assigned_at', 'abandoned_at', 'completed_at','manager_name','student_name','assignment_id', 'task_header_id', 'task_description'],
  type: 'SELECT',
  requiredArgs: ['assignment_id'] // ← id of a row in assignment which is also task_assignments.id
},
handler: async (supabase, userId, payload) => {
  const { assignment_id} = payload;
console.log('readThisAssignment{}','id:',assignment_id,'payload:', payload);
  const { data, error } = await supabase
  .from('task_assignment_view2')
  .select('task_name,student_name,manager_id,step_id,step_name,assigned_at,abandoned_at,completed_at')
  .eq('assignment_id', encodeURIComponent(assignment_id))
  //.eq('task_header_id', encodeURIComponent(task_header_id))
  .select() //Return the inserted row
  //.single(); //Return single object

  if (error) throw error;
  console.log('readThisAssignment{} data:',data);
    return data; //
  } 
},


readAllAssignments:{// VIEW  not a table returns all rows )
  metadata: {
  tables: ['task_assignment_view2'],  //VIEW not a table
  columns: ['step_id', 'step_name','step_description', 'task_name', 'manager_id', 'step_order','student_id', 'assigned_at', 'abandoned_at', 'completed_at','manager_name','student_name','assignment_id', 'task_header_id', 'task_description'],
  type: 'SELECT',
  requiredArgs: []
},
handler: async (supabase, userId, payload) => {
  const { assignment_id} = payload;
console.log('readThisAssignment{}','id:',assignment_id,'payload:', payload);
  const { data, error } = await supabase
  .from('task_assignment_view2')
  .select('task_name,student_name,manager_id,step_id,step_name,assigned_at,abandoned_at,completed_at')
  //.eq('assignment_id', encodeURIComponent(assignment_id))
  //.eq('task_header_id', encodeURIComponent(task_header_id))
  .select() //Return the inserted row
  //.single(); //Return single object

  if (error) throw error;
  console.log('readThisAssignment{} data:',data);
    return data; //
  } 
},



readAssignmentExists:{ //requires the task_header_id could return ZERO rows ONE row or MANY rows
  metadata: {
  tables: ['task_assignment_view2'],  //VIEW not a table
  columns: ['step_id', 'step_name','step_description', 'task_name', 'manager_id', 'step_order','student_id', 'assigned_at', 'abandoned_at', 'completed_at','manager_name','student_name','assignment_id', 'task_header_id', 'task_description'],
  type: 'SELECT',
  requiredArgs: ['task_header_id', 'student_id','manager_id'] // ← payload fields
},
handler: async (supabase, userId, payload) => {
  const { task_header_id, student_id} = payload;
console.log('readAssignment2Exists()');
  const { data, error } = await supabase
  .from('task_assignment_view')
  .select('task_name,student_name,manager_id,step_id,step_name,assigned_at,abandoned_at,completed_at')
  .eq('student_id', encodeURIComponent(student_id))
  .eq('task_header_id', encodeURIComponent(task_header_id))
  .select() //Return the inserted row
  //.single(); //Return single object

  if (error) throw error;
  console.log('readAssignmentExists() data:',data);
    return data; //
  } 
},


readRelationships: {
  metadata: {
    tables: ['relationships'],
    columns: ['id', 'name','category','description','created_at'],
    type: 'SELECT',
    requiredArgs: []
  },
  handler: async (supabase, userId, payload) => {
    console.log('readRelationships()');
    const { data, error } = await supabase
      .from('relationships')
      .select('id, name, category, description, created_at ')
      .order('category') // category is in relationships, not listed in approfiles
      .order('name');

    if (error) throw error;
    return data;
  }
},

readRelationshipExists:{
  metadata: {
    tables: ['approfile_relations'],  //VIEW not a table
    columns: ['rel_name', 'created_at', 'relation_id', 'approfile_is', 'of_approfile', 'relationship', 'rel_description','approfile_is_name', 'of_approfile.name'],
    type: 'SELECT',
    requiredArgs: ['approfile_is', 'of_approfile', 'relationship'] 
  },
  handler: async (supabase, userId, payload) => {
    const { approfile_is, of_approfile, relationship} = payload;
  console.log('readRelationExists{}','payload:', payload);
    const { data, error } = await supabase
    .from('approfile_relations')
    .select('*')
    .eq('approfile_is', approfile_is)
    .eq('relationship', encodeURIComponent(relationship))
    .eq('of_approfile', of_approfile)
    .select() //Return the inserted row
    //.single(); //Return single object
  console.log('data-readRelationshipExists:',data);
    if (error) throw error;
    console.log('readRelationshipExists{} data:',data);
      return data; //
    } 
  },


readApprofile_relations_view:{
  metadata: {
    tables: ['approfile_relations'],  //VIEW not a table
    columns: ['rel_name', 'created_at', 'relation_id', 'approfile_is', 'of_approfile', 'relationship', 'rel_description','approfile_is_name', 'of_approfile.name'],
    type: 'SELECT',
    requiredArgs: [] 
  },
  handler: async (supabase, userId, payload) => {
//    const { approfile_is, of_approfile, relationship} = payload;
  //console.log('approfile_relations_view{}','payload:', payload);
    const { data, error } = await supabase
    .from('approfile_relations_view')
    .select('*')
    .order('approfile_is_name');
  console.log('approfile_relations_view:',data);
    if (error) throw error;
    console.log('approfiel_relations_view data:',data);
      return data; //
    }
},

createApprofileRelation: {
  metadata: {
    tables: ['approfile_relations'],
    columns: ['id', 'approfile_is', 'relationship', 'of_approfile', 'created_at'],
    type: 'INSERT',
    requiredArgs: ['supabase', 'userId', 'approfile_is', 'relationship', 'of_approfile']
  },
  handler: async (supabase, userId, payload) => {
    const { approfile_is, relationship, of_approfile } = payload;
    console.log('writeApprofileRelation()', payload);

    const { data, error } = await supabase
      .from('approfile_relations')
      .insert([{ approfile_is:approfile_is, relationship:relationship, of_approfile: of_approfile }]);

    if (error) throw error;
    return data;
  }
},




readTaskHeaders: {
  metadata: {
    tables: ['task_headers'],
    columns: ['id', 'name', 'sort_int', 'author_id', 'created_at', 'description', 'external_url'],
    type: 'SELECT',
    requiredArgs: []
  },
  handler: async (supabase, userId, payload) => {
    console.log('readTaskHeaders()');
    const { data, error } = await supabase
      .from('task_headers')
      .select('id, name, sort_int, author_id, created_at, description, external_url')
      .order('name');

    if (error) throw error;
    return data; // ✅ Return the array of task headers
  }
},

readStep3Id:{ //find the id of step 3 of a given task
  metadata: {
  tables: ['task_steps'],
  columns: ['id'],
  type: 'SELECT',
  requiredArgs: ['task_header_Id']
},
handler: async (supabase, userId, payload) => {
  const { task_header_id } = payload;
  console.log('readStep3()');
  const { data, error } = await supabase
  .from('task_steps')
  .select('id')
  .eq('task_header_id', encodeURIComponent(task_header_id))
  .eq('step_order', 3)
  .single();

  if (error) throw error;
    return data.id; // should return an id:iiud of step 3 from task_steps associated with the selectedTask task_header_id
 }
},    


  // Function to read a task and all its steps
  readTaskWithSteps: {
    metadata: {
      tables: ['task_with_steps'], // VIEW not a table
      columns: ['task_id', 'task_name','step_id', 'step_order', 'step_description'],
      type: 'SELECT',
      requiredArgs:['supabase', 'userId', 'taskId']
    },
    handler: async (supabase, userId, taskId) => {// assume receive {task_header_id:task_header_id}
      taskId = taskId.task_header_id;
      console.log('taskId;',taskId);
      const { data, error } = await supabase
        .from('task_with_steps')
        .select('task_name, step_id, step_order, step_name, step_description')
//        .select('id, name, description, task_steps(*)')
        .eq('task_id', encodeURIComponent(taskId));  // encodeURIComponent(value) for .eq() & .like()
      if (error) throw error;
      return data; //an array of the steps
    }
  },// end of read Task with steps


  readAllSteps:{ //is this useful??
   
    metadata: {
      tables: ['task_steps'],
      columns: ['id', 'task_header_id', 'name', 'step_order', 'created_at', 'description', 'external_url', 'author_id'],
      type: 'SELECT',
      requiredArgs:['supabase', 'userId']
    }, 
    handler: async (supabase,userId)=>{
    console.log('readAllSteps()');
    const { data, error } = await supabase
      .from('task_steps')
      .select('id, task_header_id, name, step_order, created_at, description, external_url, author_id')
      .order('task_header_id, step_order');    
    if (error) {
      console.error('Error fetching task_steps:', error.message);
      throw new Error('Failed to fetch all task steps.');
    }
    return data || [];
    }
  },








}//EOF
// 18:43 sunday 14 Sept added encodeURIComponent(    )  around values in .eq because Supabase has been warning
// with [HTTP/3 406  GET  