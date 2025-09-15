/**
 * A central registry that maps data-action:"data-*  " action names to their metadata and
 * a reference to the actual function for some work process.
 * (There is a separate registry for loading modules as pages or section mutations)
 */
export const registryWorkActions = {



//////////////////////////   COUNTING   ///////////////////////

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


readApprofiles: {
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
      tables: ['task_headers', 'task_steps'],
      columns: ['id', 'name', 'description'],
      type: 'SELECT',
      requiredArgs:['supabase', 'userId', 'taskId']
    },
    handler: async (supabase, userId, taskId) => {
      console.log('taskId;',taskId);
      const { data, error } = await supabase
        .from('task_headers')
        .select('id, name, description')
//        .select('id, name, description, task_steps(*)')
        .eq('id', encodeURIComponent(taskId));  // encodeURIComponent(value) for .eq() & .like()
      if (error) throw error;
      return data[0];
    }
  },// end of read Task with steps











}//EOF
// 18:43 sunday 14 Sept added encodeURIComponent(    )  around values in .eq because Supabase has been warning
// with [HTTP/3 406  GET  