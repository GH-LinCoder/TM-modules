/**
 * A central registry that maps function names to their metadata and
 * a reference to the actual function.
 */
export const functionRegistry = {

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

tasksCount:{
  // Metadata for the permissions system
  metadata: {
    tables: ['tasks'],
    columns: [],
    type: 'SELECT',
    requiredArgs:['supabase', 'userId']
    // This could also hold other data like required user roles or permissions
  },
  // The actual function that interacts with the database
handler: async  (supabase, userId) =>{
  console.log('tasksCount()');
  const { count, error } = await supabase
  .from('tasks')
  .select('*', { count: 'exact', head: true }); // ← head: true = don't return rows, just count 

  if (error) {
    console.error('Error counting tasks:', error.message);
    throw new Error('Failed to count tasks.');
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




  // Function to insert a new task header
  insertTask: {
    // Metadata for the permissions system
    metadata: {
      tables: ['task_headers'],
      columns: ['name', 'description'],
      type: 'INSERT',
      requiredArgs:['supabase', 'userId', 'name', 'description']
      // This could also hold other data like required user roles or permissions
    },
    // The actual function that interacts with the database
    handler: async (supabase, userId, taskName, taskDescription) => {
      const { data, error } = await supabase
        .from('task_headers')
        .insert([{
          name: taskName,
          description: taskDescription
        }])
        .select();
      if (error) throw error;
      return data[0];
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
        .eq('id', taskId);
      if (error) throw error;
      return data[0];
    }
  },
};
