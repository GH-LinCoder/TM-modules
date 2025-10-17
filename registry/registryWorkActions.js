// ./../../registry/registryWorkActions.js

/**
 * A central registry that maps data-action:"data-*  " action names to their metadata and
 * a reference to the actual function for some work process.
 * (There is a separate registry for loading modules as pages or section mutations)
 */

// Possibly better to order by table. If done could split into smaller files ? Not sure how this file is loaded. Is there a better arrangement?


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


// For auto-assign-task
autoAssignTask: {
  metadata: {
    tables: ['task_assignments'],
    columns: ['id', 'step_id', 'sort_int', 'manager_id', 'student_id', 'assigned_at', 'abandoned_at', 'completed_at', 'task_header_id', 'assigned_by_automation'],
    type: 'INSERT',
    requiredArgs: ['task_header_id', 'step_id', 'student_id', 'assigned_by_automation']
  },
  handler: async (supabase, userId, payload) => {
    const { task_header_id, step_id, student_id, manager_id, assigned_by_automation } = payload;
    console.log('autoAssignTask()', payload);
    
    const { data, error } = await supabase
      .from('task_assignments')
      .insert({
        student_id: student_id,
        manager_id: manager_id, // or derive from context
        task_header_id: task_header_id,
        step_id: step_id,
        assigned_by_automation: assigned_by_automation // Your audit trail column
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }
},

// For auto-relate-appro
autoRelateAppro: {
  metadata: {
    tables: ['approfile_relations'],
    columns: ['id', 'sort_int', 'approfile_is', 'relationship', 'of_approfile', 'created_at', 'assigned_by_automation'],
    type: 'INSERT',
    requiredArgs: ['approfile_is', 'relationship', 'of_approfile', 'assigned_by_automation']
  },
  handler: async (supabase, userId, payload) => {
    const { approfile_is, relationship, of_approfile, assigned_by_automation } = payload;
    console.log('autoRelateAppro()', payload);

    const { data, error } = await supabase
      .from('approfile_relations')
      .insert([{ 
        approfile_is: approfile_is,
        relationship: relationship,
        of_approfile: of_approfile,
        assigned_by_automation: assigned_by_automation // Your audit trail column
      }]);

    if (error) throw error;
    return data;
  }
},




/////////////////////////////////////   COUNT   ///////////////////////
//APPRO
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


//ASSIGNMENT
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
//ASSIGNMENT
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
//ASSIGNMENT
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

//PROFILES
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


//ASSIGNMENT
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
//TASKS
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



/////////////////////////////////////   CREATE  INSERT    ///////////////////
//APPRO
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

//ASSIGNMENT
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




//TASK
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
      .eq('name', taskName) // encodeURIComponent(value) was removed 22:22 oct 17  for .eq() & .like()
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

//TASKS
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

//TASKS
/*
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
    return { success: true }; // why not return the NEW.id?
  }
},  */ // changed to below 10:13 Oct 15

createTaskStep: {
  metadata: {
    tables: ['task_steps'],
    columns: ['name', 'description', 'external_url', 'step_order', 'task_header_id', 'author_id'],
    type: 'INSERT',
    requiredArgs: ['taskId', 'stepOrder', 'stepName', 'stepDescription']
  },
  handler: async (supabase, userId, payload) => {
    const { taskId, stepOrder, stepName, stepDescription, stepUrl } = payload;

    const { data, error } = await supabase
      .from('task_steps')
      .insert({
        name: stepName,
        description: stepDescription,
        external_url: stepUrl || null,
        step_order: stepOrder,
        task_header_id: taskId,
        author_id: userId
      })
      .select()  // Returns the inserted record
      .single(); // Returns single object, not array

    if (error) throw error;
    return data; // Return full object, not just ID
  }
},

//APPRO
createApprofileRelation: {
  metadata: {
    tables: ['approfile_relations'],
    columns: ['id' ,'sort_int', 'approfile_is', 'relationship', 'of_approfile', 'created_at'],
    type: 'INSERT',
    requiredArgs: ['supabase', 'userId', 'approfile_is', 'relationship', 'of_approfile']
  },
  handler: async (supabase, userId, payload) => {
    const { approfile_is, relationship, of_approfile } = payload;
    console.log('writeApprofileRelation()', payload);

    const { data, error } = await supabase
      .from('approfile_relations')
      .insert([{ 
        approfile_is:approfile_is, 
        relationship:relationship, 
        of_approfile: of_approfile }]);

    if (error) throw error;
    return data;

  }
},




///////////////////////////////////// UPDATE   /////////////////////

//TASKS
updateTaskStep: {
  metadata: {
    tables: ['task_steps'],
    columns: ['name', 'description', 'external_url=null'],
    type: 'UPDATE',
    requiredArgs: ['taskId', 'stepOrder', 'stepName', 'stepDescription']
  },
  handler: async (supabase, userId, payload) => {
    const { taskId, stepOrder, stepName, stepDescription, stepUrl } = payload;

    const {data, error } = await supabase
      .from('task_steps')
      .update({
        name: stepName,
        description: stepDescription,
        step_order:stepOrder,
        external_url: stepUrl || null
      })
      .eq('task_header_id', taskId) 
      .eq('step_order',stepOrder)  
      .select() 
      .single()
    if (error) throw error;
    
    return data;
  }
},

//TASKS
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

//APPRO
updateApprofile: {
  metadata: {
    tables: ['app_profiles'],
    columns: ['id', 'name', 'email', 'notes', 'phone', 'sort_int', 'avatar_url', 'created_at','updated_at','description',  'auth_user_id', 'external_url', 'task_header_id'],
    type: 'UPDATE',
    requiredArgs: ['id', 'name', 'description'] // id is required for update
  },
  handler: async (supabase, userId, payload) => {
    console.log('updateApprofile()');
    const { id, name, description } = payload; // id is required for update & name same as sent

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
//TASKS
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




/////////////////////////////////////  SELECT  READ DATA   ///////////////////////

//APPRO
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

//APPRO
readProfilesByIds:{// possibly not used
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

//APPRO
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

// APPRO
readApprofileById:{
  metadata: {
    tables: ['app_profiles'],
    columns: ['id', 'name', 'email', 'created_at'],
    type: 'SELECT',
    requiredArgs: ['approfileId']
  },
  handler: async (supabase, userId, payload) => {
    const { approfileId } = payload;
    const { data, error } = await supabase
      .from('app_profiles')
      .select('id, name, email, created_at')
      .eq('id', approfileId)
      .single();
    
    if (error) throw error;
    return data;
  }
},

//APPRO
readApprofileRelationships: {
  metadata: {
    tables: ['approfile_relationships_view'],
    columns: ['*'],
    type: 'SELECT',
    requiredArgs: ['approfileId']
  },
  handler: async (supabase, userId, payload) => {
    const { approfileId } = payload;
    
    // Get relationships where approfile IS something
    const isRels = await supabase
      .from('approfile_relations_view')
      .select('*')
      .eq('approfile_is', approfileId);
    
    // Get relationships where approfile IS the OF target  
    const ofRels = await supabase
      .from('approfile_relations_view')
      .select('*')
      .eq('of_approfile', approfileId);
    
    return {
      is: isRels.data || [],
      of: ofRels.data || []
    };
  }
},

// GENERIC
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

//TASK_ASSIGMENT
readThisAssignment:{//requires the assignment_id (not the task_header_id. Returns a single row )
  metadata: {
  tables: ['task_assignment_view'],  //VIEW not a table
  columns: ['step_id', 'step_name','step_description', 'task_name', 'manager_id', 'step_order','student_id', 'assigned_at', 'abandoned_at', 'completed_at','manager_name','student_name','assignment_id', 'task_header_id', 'task_description'],
  type: 'SELECT',
  requiredArgs: ['assignment_id'] // ← id of a row in assignment which is also task_assignments.id
},
handler: async (supabase, userId, payload) => {
  const { assignment_id} = payload;
console.log('readThisAssignment{}','id:',assignment_id,'payload:', payload);
  const { data, error } = await supabase
  .from('task_assignment_view')
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

//TASK_ASSIGMENT
readAllAssignments:{// VIEW  not a table returns all rows )
  metadata: {
  tables: ['task_assignment_view2'],  //VIEW not a table
  columns: ['step_id', 'step_name','step_description', 'task_name', 'manager_id', 'step_order','student_id', 'assigned_at', 'abandoned_at', 'completed_at','manager_name','student_name','assignment_id', 'task_header_id', 'task_description'],
  type: 'SELECT',
  requiredArgs: []
},
handler: async (supabase, userId, payload) => {
  const { assignment_id} = payload;
console.log('readAllAssignment{}','id:',assignment_id,'payload:', payload);
  const { data, error } = await supabase
  .from('task_assignment_view')
  .select('assignment_id, task_header_id, task_name, task_description, student_id, student_name, manager_id, manager_name, step_id, step_order, step_name, step_description, assigned_at,abandoned_at,completed_at')
  //.eq('assignment_id', encodeURIComponent(assignment_id))
  //.eq('task_header_id', encodeURIComponent(task_header_id))
  .select() //Return the inserted row
  //.single(); //Return single object

  if (error) throw error;
  console.log('readThisAssignment{} data:',data);
    return data; //
  } 
},


//TASK_ASSIGMENT
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

//TASK_ASSIGMENT
readStudentAssignments: {
  metadata: {
    tables: ['task_assignment_view'],
    columns: ['assignment_id', 'student_id', 'task_header_id', 'task_name', 'task_description', 'step_order', 'step_name', 'step_description', 'manager_id', 'manager_name', 'assigned_at'],
    type: 'SELECT',
    requiredArgs: ['student_id']
  },
  handler: async (supabase, userId, payload) => {
    const { student_id } = payload;
    const { data, error } = await supabase
      .from('task_assignment_view')
      .select('assignment_id, student_id, task_header_id, task_name, task_description, step_order, step_name, step_description, manager_id, manager_name, assigned_at')
      .eq('student_id', student_id)
      .order('assigned_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
},


//RELATIONSHIPS
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

//RELATIONSHIPS
readRelationshipExists:{
  metadata: {
    tables: ['approfile_relations'], 
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

//APPRO
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

//TASKS
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

//TASKS
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


  //TASKS
  readTaskWithSteps: {
    metadata: {
      tables: ['task_with_steps_view'], // VIEW not a table
      columns: ['task_id', 'task_name','step_id', 'step_order', 'step_description'],
      type: 'SELECT',
      requiredArgs:['supabase', 'userId', 'taskId']
    },
    handler: async (supabase, userId, taskId) => {// assume receive {task_header_id:task_header_id}
      taskId = taskId.task_header_id;
      console.log('taskId;',taskId);
      const { data, error } = await supabase
        .from('task_with_steps_view')
        .select('task_name, step_id, step_order, step_name, step_description')
//        .select('id, name, description, task_steps(*)')
        .eq('task_id', encodeURIComponent(taskId));  // encodeURIComponent(value) for .eq() & .like()
      if (error) throw error;
      return data; //an array of the steps
    }
  },// end of read Task with steps

//TASKS
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



// the below don't call the db  they call other functions.
//  I don't think this can work from the registry
//TASK_ASSIGNMENTS
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
//TASK_ASSIGNMENTS
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
//TASK_ASSIGNMENTS
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

///////  end of functions that call functions




/////////////////////////////////////   SURVEYS   //////////////////////

//SURVEYS new 20:23 Oct 6
createSurvey: {
  metadata: {
    tables: ['survey_headers'],
    columns: ['name', 'description', 'external_url', 'author_id'],
    type: 'INSERT',
    requiredArgs: ['surveyName', 'surveyDescription']
  },
  handler: async (supabase, userId, payload) => {
    const { surveyName, surveyDescription } = payload;

    
    // Check for duplicate name - just check if any records exist
    const { count, error: fetchError } = await supabase
      .from('survey_headers')
      .select('id', { count: 'exact', head: true })  // Only get count, not data
      .eq('name', surveyName);

    if (count > 0) {
      throw new Error('A survey with that name exists. Your survey needs a different name.');
    }

    const { data, error } = await supabase
      .from('survey_headers')
      .insert({
        name: surveyName,
        description: surveyDescription,
        author_id: userId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
},

//SURVEYS
createSurveyQuestion: {
  metadata: {
    tables: ['survey_questions'],
    columns: ['name', 'description', 'survey_header_id'], //WRONG?
    type: 'INSERT',
    requiredArgs: ['surveyName', 'surveyDescription'] // ← payload fields
  },
  handler: async (supabase, userId, payload) => {
    const { surveyId, questionText, question_number } = payload;

    // Check for duplicate name  ???
  /*
    const {  existingSurveyQuestion, error: fetchError } = await supabase
      .from('survey_questions')
      .select('id')
      .eq('name', encodeURIComponent(surveyQuestionName)) // encodeURIComponent(value) for .eq() & .like()
      .single();

    if (existingSurveyQuestion) {
      throw new Error('A survey with that name exists. Your survey needs a different name.');
    }  
      
     surveyId: newSurvey.id, // Use the survey ID from the header save
                questionText: questionText
    
    */
//console.log('Create: question_number', question_number);
    const { data, error } = await supabase
      .from('survey_questions')
      .insert({
        survey_header_id: surveyId,
        name: questionText,
        question_number:question_number,
        //external_url: taskUrl || null,
        author_id: userId // ← use passed userId
      })
      .select()
      .single();

    if (error) throw error;
    return data; // ← returns { id, name, description, ... }
  }
},

//SURVEYS
createSurveyAnswer: {
  metadata: {
    tables: ['survey_answers'],
    columns: ['name', 'description', 'survey_header_id'], //WRONG?
    type: 'INSERT',
    requiredArgs: ['surveyName', 'surveyDescription'] // ← payload fields  WRONG
  },
  handler: async (supabase, userId, payload) => {
    const { questionId, answerText, answer_number } = payload;

    // Check for duplicate name  ???
  /*
    const {  existingSurveyQuestion, error: fetchError } = await supabase
      .from('survey_questions')
      .select('id')
      .eq('name', encodeURIComponent(surveyQuestionName)) // encodeURIComponent(value) for .eq() & .like()
      .single();

    if (existingSurveyQuestion) {
      throw new Error('A survey with that name exists. Your survey needs a different name.');
    }  
      
     surveyId: newSurvey.id, // Use the survey ID from the header save
                questionText: questionText
    
    */

    const { data, error } = await supabase
      .from('survey_answers')
      .insert({
        survey_question_id: questionId,
        name: answerText,
        answer_number:answer_number,
        //external_url: taskUrl || null,
        //author_id: userId // ← no such column use passed userId
      })
      .select()
      .single();

    if (error) throw error;
    return data; // ← returns { id, name, description, ... }
  }
},

//AUTOMATIONS
createSurveyAutomation: {
  metadata: {
    tables: ['automations'],
    columns: ['name', 'description', 'survey_header_id'], //WRONG?
    type: 'INSERT',
    requiredArgs: ['surveyName', 'surveyDescription'] // ← payload fields  WRONG
  },
  handler: async (supabase, userId, payload) => { // itemName 
    const { surveyAnswerId,source_task_step_id , taskId, manager_id, student_id, task_step_id, itemName, approfile_is_id, relationship, approfileId, automation_number   } = payload;

console.log('createSurveyAutomation  source_task_step_id:', source_task_step_id); // 22:40 Oct 14  UNDEFINED    10:58 Oct 15 NULL 

    // Check for duplicate name  ???
  /*
    const {  existingSurveyQuestion, error: fetchError } = await supabase
      .from('survey_questions')
      .select('id')
      .eq('name', encodeURIComponent(surveyQuestionName)) // encodeURIComponent(value) for .eq() & .like()
      .single();

    if (existingSurveyQuestion) {
      throw new Error('A survey with that name exists. Your survey needs a different name.');
    }  
      
     surveyId: newSurvey.id, // Use the survey ID from the header save
                questionText: questionText
    
    */

    const { data, error } = await supabase
      .from('automations')
      .insert({
        survey_answer_id: surveyAnswerId, // this is either valid or null
        source_task_step_id:source_task_step_id, //this is either null or valid //new 22;09 Oct 14

        task_header_id:taskId,
        task_step_id: task_step_id,  
        manager_id:manager_id,  //new 22;09 Oct 14
        student_id:student_id,   //new 22;09 Oct 14


        name: itemName,

        appro_is_id: approfile_is_id, // ← use passed userId ?  //THIS IS WRONG. At moment of creating surveu this would be the id of the admin author. 
        relationship:relationship,
        of_appro_id: approfileId,

        automation_number : automation_number, 
        
      })
      .select()
      .single();

    if (error) throw error;
    return data; // ← returns { id, name, description, ... }
  }
},


/////////////////////////////////////    READ  SURVEYS   //////////////////////

//SURVEYS
readSurveyHeaders: {
  metadata: {
    tables: ['survey_headers'],
    columns: ['name', 'description', 'author_id', 'created_at', 'last_updated_at', 'automations'], // automations not curren
    type: 'SELECT',
    requiredArgs: ['surveyId'] // could be either id or name?
  },
  handler: async (supabase, userId, payload) => {
    console.log('readSurveyHeaders()');
   // const { surveyId } = payload;
    const { data, error } = await supabase
      .from('survey_headers')
      .select('name, description, author_id, created_at, last_updated_at, automations  ')
     // .eq('id',surveyId);

    if (error) throw error;
    return data;
  }
},

//SURVEYS
readSurveyView:{    // VIEW   Read only
  metadata: {
  tables: ['survey_view'],
  columns: ['survey_id','survey_name', 'survey_description', 'author_id', 'survey_created_at', 'question_id', 'question_text', 'question_description', 'question_number', 'answer_id', 'answer_text' , 'answer_description', 'answer_number',  'automation_id', 'automation_name', 'automation_number' ],
  type: 'SELECT',
  requiredArgs: ['survey_id'] // could be either id or name?
},
handler: async (supabase, userId, payload) => {
  console.log('readSurveyView()');
  const { survey_id } = payload;
  const { data, error } = await supabase
    .from('survey_view')
    .select('*')
    .eq('survey_id',survey_id);

  if (error) throw error;
  return data;
}
},


}//EOF
// 18:43 sunday 14 Sept added encodeURIComponent(    )  around values in .eq because Supabase has been warning
// with [HTTP/3 406  GET  