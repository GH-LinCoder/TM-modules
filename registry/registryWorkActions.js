// ./../../registry/registryWorkActions.js

//import { linkNoteToCategories } from "../notes/saveNoteWithTags";



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


// For auto-assign-task  // this is used because it has an entry in the automations column that is lacking in createAssignment
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
      }])
      .select()
      .single();

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

surveysCount:{
  // Metadata for the permissions system
  metadata: {
    tables: ['survey_headers'],
    columns: [],
    type: 'SELECT',
    requiredArgs:['supabase', 'userId']
    // This could also hold other data like required user roles or permissions
  },
  // The actual function that interacts with the database
handler: async  (supabase, userId) =>{
  console.log('surveysCount()');
  const { count, error } = await supabase
  .from('survey_headers')
  .select('id', { count: 'exact', head: true }); // ← head: true = don't return rows, just count 

  if (error) {
    console.error('Error counting surveys:', error.message);
    throw new Error('Failed to count surveys.');
  }
  
  return count// if use {count} it would be in form  {count: 23}
}
},

respondentsCount:{
  // Metadata for the permissions system
  metadata: {
    tables: ['unique_respondents'], //VIEW not a table
    columns: [],
    type: 'SELECT',
    requiredArgs:['supabase', 'userId']
    // This could also hold other data like required user roles or permissions
  },
  // The actual function that interacts with the database
handler: async  (supabase, userId) =>{
  console.log('respondentsCount()');
  const { count, error } = await supabase
  .from('unique_respondents')
  .select('*', { count: 'exact', head: true }); // ← head: true = don't return rows, just count 

  if (error) {
    console.error('Error counting respondents:', error.message);
    throw new Error('Failed to count respondents.');
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
  columns: ['id', 'step_id','sort_int', 'manager_id', 'student_id', 'assigned_at', 'abandoned_at', 'completed_at', 'task_header_id', 'survey_header_id', 'survey_question_id'],
  type: 'INSERT',
  requiredArgs: [ 'student_id'], 
  optionalArgs: ['task_header_id','step_id','manager_id', 'survey_header_id', 'survey_question_id'] // depends on task or survey
}, // Should this check for duplicate assignment???
handler: async (supabase, userId, payload) => {
  const { task_header_id, step_id, student_id, manager_id, survey_header_id, survey_question_id } = payload;
console.log('registry -createAssignment()');
//this says duolicate even when no such thing 

let existing=null;

if (task_header_id) {
  existing = await supabase
    .from('task_assignments')
    .select('id')
    .eq('student_id', student_id)
    .eq('task_header_id', task_header_id)
    .limit (1);
} else if (survey_header_id) {
  existing = await supabase
    .from('task_assignments')
    .select('id')
    .eq('student_id', student_id)
    .eq('survey_header_id', survey_header_id)
    .limit (1);
}

if (existing && existing.data.length > 0) { console.log (existing);
  throw new Error('Assignment already exists for this student');
}


if(task_header_id) { console.log('task_header_id:', task_header_id);
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
  else 
  if (survey_header_id) { console.log('survey_header_id:', survey_header_id);
    const { data, error } = await supabase
  .from('task_assignments')
  .insert({
    student_id: student_id,
    survey_header_id: survey_header_id,
    survey_question_id: survey_question_id
  })
  .select() //Return the inserted row
  .single(); //Return single object
  if (error) throw error;
  return data.id; //

  } 
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
    //  .single();  // throws error if a single row not found

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
      .select('id, name, description, step_order, external_url')
      .eq('task_header_id', encodeURIComponent(taskId)) // encodeURIComponent(value) for .eq() & .like()
      .order('step_order');
    if (error) throw error;
    return data;
  }
},

//TASKS

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
// edit task is sending:  14:00 Oct 25 2025
// taskId: state.currentTaskId,
//stepOrder: order, // This should be a number
//stepName,
//stepDescription,
//stepUrl

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
console.log('updtaeTaskStep:', stepDescription);
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
      .select('id, name, email, notes, phone, sort_int, avatar_url, created_at, updated_at, description, auth_user_id, external_url, task_header_id, survey_header_id')
      .order('name');
  
    if (error) throw error;
  
    // Separate into three groups
    const humanApprofiles = [];
    const taskApprofiles = [];
    const surveyApprofiles = []; //added 9:22 Nov 1 2025
    const abstractApprofiles = [];
  
    data.forEach(profile => {
      if (profile.auth_user_id) {
        humanApprofiles.push(profile);
      } else if (profile.task_header_id) {
        taskApprofiles.push(profile);
      } else if (profile.survey_header_id){
        surveyApprofiles.push(profile); //added 9:22 Nov 1 2025
      } else {
        abstractApprofiles.push(profile);
      } 
    });

    if (error) throw error;
    return {
      humanApprofiles,
      taskApprofiles,
      surveyApprofiles, //added 9:22 Nov 1 2025
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

//new 22:00 Nov 28 replacement of readApprofileRelationships to include type icon

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

    const isRels = await supabase
      .from('approfile_relations_view')
      .select('*')
      .eq('approfile_is', approfileId);

    const ofRels = await supabase
      .from('approfile_relations_view')
      .select('*')
      .eq('of_approfile', approfileId);

      const ids = [
        approfileId,                                   // subject itself
        ...isRels.data.map(r => r.of_approfile),       // of-appros
        ...ofRels.data.map(r => r.approfile_is)        // is-appros
      ];
       
console.log('ids:',ids);
    const profiles = await supabase
      .from('app_profiles')
      .select('id, auth_user_id, survey_header_id, task_header_id')
      .in('id', ids);
console.log('profiles:',profiles);
    // build a lookup map of appro id → icon
    const profileMap = {};
    for (const ap of profiles.data || []) {
      let icon = '🎭'; // default abstract
      if (ap.auth_user_id) {
        icon = '👥'; // human
      } else if (ap.survey_header_id) {
        icon = '📜'; // survey
      } else if (ap.task_header_id) {
        icon = '🔧'; // task
      }
      profileMap[ap.id] = icon;
    }
console.log('profileMap',profileMap);
    return {
      is: isRels.data || [],
      of: ofRels.data || [],
      iconMap:profileMap    
    };
  }
},


/*
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
*/
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


readStudentAssignments: {
  metadata: {
    tables: ['task_assignment_view', 'survey_assignment_view'],
    columns: [
      'assignment_id', 'student_id', 'task_header_id', 'task_name', 'task_description','task_external_url',
      'step_order', 'step_name', 'step_description', 'manager_id', 'manager_name', 'assigned_at',
      'survey_id', 'survey_name', 'survey_description'
    ],
    type: 'SELECT',
    requiredArgs: ['student_id'],
    optionalArgs: ['type'] // Add 'type' as an optional argument
  },
  handler: async (supabase, userId, payload) => {
    const { student_id, type } = payload;

    let taskData = [];
    let surveyData = [];

    if (!type || type === 'task') {
      const { data, error } = await supabase
        .from('task_assignment_view')
        .select(`
          assignment_id, student_id, student_name, task_header_id, task_name, task_description, 
          step_order, step_name, step_description, manager_id, manager_name, assigned_at, task_external_url
        `)
        .eq('student_id', student_id)
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      taskData = data;
    }

    if (!type || type === 'survey') {
      const { data, error } = await supabase
        .from('survey_assignment_view')
        .select(`
          assignment_id, student_id, survey_header_id, survey_name, survey_description,
          assigned_at
        `)
        .eq('student_id', student_id)
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      surveyData = data;
    }

    const combinedData = [...taskData, ...surveyData].sort((a, b) =>
      new Date(b.assigned_at) - new Date(a.assigned_at)
    );

    return combinedData;
  }
},

readManagerAssignments: {
  metadata: {
    tables: ['task_assignment_view'],
    columns: [
      'assignment_id', 'student_id', 'student_name', 'task_header_id', 'task_name', 'task_description', 
      'step_order', 'step_name', 'step_description', 'manager_id', 'manager_name', 'assigned_at'
    ],
    type: 'SELECT',
    requiredArgs: ['manager_id']
  },
  handler: async (supabase, userId, payload) => {
    const { manager_id } = payload;

    const { data, error } = await supabase
      .from('task_assignment_view')
      .select(`
        assignment_id, student_id, student_name, task_header_id, task_name, task_description, 
        step_order, step_name, step_description, manager_id, manager_name, assigned_at
      `)
      .eq('manager_id', manager_id)
      .order('task_name', { ascending: true })
      .order('student_name');

    if (error) throw error;
    return data;
  }
}
,



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
    //  .order('category') // category is in relationships, not listed in approfiles
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


//////////    NOTES BUG REPORT MESSAGES   /////////
saveNoteStatus: {
  metadata: {
    tables: ['notes'],  
    columns: ['status', 'id'],
    type: 'UPDATE',
    requiredArgs: ['noteId', 'newStatus'] 
  },
  // Updates the status of a note.  //NEED MOVE TO REGISTRY
  handler: async (supabase, userId, payload)=> {
    const {noteId, newStatus} = payload;
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
},
/** //MOVED TO REGISTRY from The Lab 4 Nov 2025
 * Inserts a new note and returns its ID. Updated to accept object containg the params
 */
insertNote:{
  metadata: {
    tables: ['notes'],  
    columns: ['author_id', 'audience_id', 'reply_to_id', 'title', 'content', 'status'],
    type: 'INSERT',
    requiredArgs: ['author_id',  'content'] //  
  },
handler: async (supabase,userId, payload) => {
  const {
    author_id,
    audience_id = null,
    reply_to_id = null,
    title = 'AutoTitle',
    content,
    status = null
  } = payload;
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

    if (error) throw new Error(`insertNote failed: ${error.message}`);


    return data[0].id;
  } catch (error) {
    console.error('❌ insertNote failed:', error);
    throw error;
  }
}
},
/** //NEED MOVE TO REGISTRY
 * Fetches a page of notes.
 */  
// In fetchNotes.js - return with consistent naming
fetchNotes: {
metadata: {
      tables: ['notes_view'],  
      columns: ['id', 'sort_int', 'author_id', 'audience_id', 'reply_to_id', 'title', 'content', 'status'],
      type: 'SELECT',
      requiredArgs: ['page', 'pageSize'] // are they required? 
    },
    handler: async (supabase, userId, payload) => {
      const { page = 1, pageSize = 10 } = payload;
      console.log("fetchNotes() page", page);
    
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;
    
      const { data, count, error } = await supabase
        .from('notes_view')  //changed from notes to notes_view 22:17 Nov 5  problem of repetitions also id is now called notes_id
        .select('*', { count: 'exact' }) // the ten could all be the same note with 10 tags
        .order('sort_int', { ascending: false })
        .range(start, end);
    
      if (error) {
        console.error('Error fetching notes:', error);
        return { notes: [], totalCount: 0, message: error.message };
      }
    
      return { notes: data, totalCount: count };
    }
    
},

readCategoryMap:{
metadata: {
  tables: ['notes_categories'],
  columns: ['id', 'category_name'],
  type: 'SELECT',
  requiredArgs: []
},
handler: async(supabase, userId, payload) => {
const {data, error} = await supabase 
  .from('notes_categories')
  .select('id, category_name');
  if (error) {
    console.error('Error fetching notes:', error);
            } 
           console.log('data',data); // data is array of 34 objects
return data;
          }
},

linkNoteToCategories:{
metadata: {
  tables:['notes_categorised'],
  columns:['note_id', 'note_category_id'],
  requiredArgs:['rows']
},

handler: async(supabase, userId, payload) => {
const {rows} = payload; 
const { error } = await supabase
.from('notes_categorised')
.upsert(rows, {
  onConflict: ['note_id', 'note_category_id'],
  ignoreDuplicates: true
});

if (error) {
console.error('❌ Error linking note to categories:', error);
return error;}
return null; // success
}
},


reactToNoteClick: {
  metadata: {
    tables: ['notes'],
    columns: ['id', 'status'],
    type: 'UPDATE',
    requiredArgs: ['noteId', 'newStatus']
  },
  handler: async (supabase, userId, payload) => {
    const { noteId, newStatus } = payload;

    const { error } = await supabase
      .from('notes')
      .update({ status: newStatus })
      .eq('id', noteId);

    if (error) {
      console.error(`❌ Failed to update status for note ${noteId}:`, error);
      return { success: false, message: error.message };
    }

    return { success: true };
  }
},






//TASKS

readTaskHeaders: {
  metadata: {
    tables: ['task_headers'],
    columns: ['id', 'name', 'sort_int', 'author_id', 'created_at', 'description', 'external_url'],
    type: 'SELECT',
    requiredArgs: [],
    optionalArgs: ['taskName'] // 
  },
  handler: async (supabase, userId, payload) => {
    console.log('readTaskHeaders()', payload);

    let query = supabase
      .from('task_headers')
      .select('id, name, sort_int, author_id, created_at, description, external_url');

    if (payload?.taskName) {
      query = query.eq('name', payload.taskName);
    }

    query = query.order('name');

    const { data, error } = await query;

    if (error) throw error;
    return data;
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
      taskId = taskId.task_header_id;  //this is weird
  //  console.log('readTaskWithSteps for taskId;',taskId);
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
  //  console.log('readAllSteps()');
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
 //   console.log('readAllStudent');
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
console.log('create survey:','userId:',userId, 'payload;', payload);
    
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
updateSurvey: {
  metadata: {
    tables: ['survey_headers'],
    columns: ['name', 'description', 'external_url', 'author_id'],
    type: 'UPDATE',
    requiredArgs: ['surveyName', 'surveyDescription'] // ← should include url and author
  },
  handler: async (supabase, userId, payload) => {

    const { surveyId, surveyName, surveyDescription} = payload; // should include authorId ?
    console.log('UpdateSurvey:',surveyName, 'userId:',userId, 'surveyId:',surveyId);
    const { data, error } = await supabase

    .from('survey_headers')
      .update({
        name: surveyName,
        description :  surveyDescription || null,
      //  author_id: userId 
      })
      .eq('id', surveyId) 
      .select()
      .single();

    if (error) throw error;
    return data; // ← returns { id, name, description, ... }
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
        //author_id: userId // ← there is no such column
      })
      .select()
      .single();

    if (error) throw error;
    return data; // ← returns { id, name, description, ... }
  }
},

//SURVEYS
updateSurveyQuestion: {
  metadata: {
    tables: ['survey_questions'],
    columns: ['name', 'description'], 
    type: 'UPDATE',
    requiredArgs: ['questionName', 'questionId'] // ← payload fields
  },
  handler: async (supabase, userId, payload) => {

    const { questionId, questionName, questionDescription} = payload;
    console.log('UpdateQuestion:',questionName, 'userId:',userId, 'questionId:',questionId);
    const { data, error } = await supabase

    .from('survey_questions')
      .update({
        name: questionName,
        description :  questionDescription || null,
      //  author_id: userId 
      })
      .eq('id', questionId) 
      .select()
      .single();

    if (error) throw error;
    return data; // ← returns { id, name, description, ... }
  }
},


updateSurveyQuestionSoftDelete: {
  metadata: {
    tables: ['survey_questions'],
    columns: ['deleted_at', 'deleted_by', 'is_deleted'],
    type: 'UPDATE',
    requiredArgs: ['questionId', 'userId']
  },
  handler: async (supabase, userId, payload) => {
    const { questionId } = payload;

    /* Check if question exists  ???
    const {  existingQuestion, error: fetchError } = await supabase
      .from('survey_questions')
      .select('id, survey_header_id')
      .eq('id', questionId)
      .single();

    if (fetchError) throw fetchError;
    if (!existingQuestion) throw new Error('Question not found');
*/
    // Perform soft delete
    const { data, error } = await supabase
      .from('survey_questions')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: userId
      })
      .eq('id', questionId)
      .select()
      .single();

    if (error) throw error;
    return data;
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

//SURVEYS
updateSurveyAnswer: {
  metadata: {
    tables: ['survey_answers'],
    columns: ['id', 'name', 'description', 'automations', 'created_at', 'last_updated_at', 'survey_question_id' ], 
    type: 'UPDATE',
    requiredArgs: ['answerName', 'answerId']
  },
  handler: async (supabase, userId, payload) => {
    const { answerId, answerName, answerDescription} = payload;
    const { data, error } = await supabase
      .from('survey_answers')
      .update({
        name: answerName,
        description:answerDescription || null
        //external_url: taskUrl || null,
        //author_id: userId // ← no such column use passed userId
      })
      .eq('id', answerId)
      .select()
      .single();

    if (error) throw error;
    return data; // ← returns { id, name, description, ... }
  }
},


//AUTOMATIONS

readTaskAutomations: {
  metadata: {
    tables: ['automations'],
    columns: [
      'id',
      'name',
      'description',
      'task_header_id',
      'task_step_id',
      'survey_answer_id',
      'student_id',
      'from_step',
      'to_step',
      'appro_is_id',
      'relationship',
      'of_appro_id',
      'appro_relations_id',
      'automation_number',
      'source_task_step_id',
      'manager_id',
      'task_assignment_id',
      'created_at',
      'last_updated_at',
      'is_deleted'
    ],
    type: 'SELECT',
    requiredArgs: ['source_task_stepId']
  },
  handler: async (supabase, userId, payload) => {
    const { source_task_step_id} = payload;
console.log('registryReadTaskAutomations-stepId:',source_task_step_id);
    // Validate required args
 /*
    for (const arg of ['source_task_step_id']) {
      if (payload[arg] === undefined || payload[arg] === null) {
        throw new Error("Missing required argument: " + arg);
      }
    } */

    // Query automations table
    const { data, error } = await supabase
      .from('automations')
      .select('*')
      
      .eq('source_task_step_id', source_task_step_id)
      .is('deleted_at', null) // exclude soft-deleted
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error reading task automations:', error.message);
      throw new Error('Failed to read task automations.');
    }

    return data;
  }
},

//Newer version with corrected arg check (not using "this.") File 001 has previous versions


createAutomationAddTaskByTask: {
  metadata: {
    tables: ['automations'],
    columns: ['name', 'source_task_step_id', 'task_header_id', 'task_step_id', 'automation_number'],
    type: 'INSERT',
    requiredArgs: ['source_task_step_id', 'task_header_id', 'task_step_id']
  },
  handler: async (supabase, userId, payload) => {
    const { source_task_step_id, task_header_id, task_step_id, name, automation_number } = payload;
   /*
    for (const arg of this.metadata.requiredArgs) {
      if (payload[arg] === undefined || payload[arg] === null) {
        throw new Error("Missing required argument: " + arg);
      }
    }*/
    const { data, error } = await supabase
      .from('automations')
      .insert({
        source_task_step_id,
        task_header_id,
        task_step_id,
        name: name || 'Assign Task Automation',
        automation_number: automation_number || null
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
},

createAutomationAddSurveyByTask: {
  metadata: {
    tables: ['automations'],
    columns: ['name', 'source_task_step_id', 'survey_header_id', 'automation_number'],
    type: 'INSERT',
    requiredArgs: ['source_task_step_id', 'survey_header_id']
  },
  handler: async (supabase, userId, payload) => {
    const { source_task_step_id, survey_header_id, name, automation_number } = payload;
  //  for (const arg of this.metadata.requiredArgs) {
  //    if (payload[arg] === undefined || payload[arg] === null) {
  //      throw new Error("Missing required argument: " + arg);
   //   }
  //  }

    console.log('stpId',source_task_step_id, //need this 
      'surveyId',survey_header_id, 
      'name',name, 
    'auto#',automation_number);

//automations table needs: source_task_step_id, survey_header_id, name, automation_number

    const { data, error } = await supabase
      .from('automations')
      .insert({
        source_task_step_id,
        survey_header_id,
        name: name || 'Assign Survey Automation',
        automation_number: automation_number
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
},

createAutomationRelateByTask: {
  metadata: {
    tables: ['automations'],
    columns: ['name', 'source_task_step_id', 'appro_is_id', 'relationship', 'of_appro_id', 'automation_number'],
    type: 'INSERT',
    requiredArgs: ['source_task_step_id', 'appro_is_id', 'relationship', 'of_appro_id']
  },
  handler: async (supabase, userId, payload) => {
    const { source_task_step_id, appro_is_id, relationship, of_appro_id, name, automation_number } = payload;
  //  for (const arg of this.metadata.requiredArgs) {
  //    if (payload[arg] === undefined || payload[arg] === null) {
  //      throw new Error("Missing required argument: " + arg);
  //    }
  //  }
    const { data, error } = await supabase
      .from('automations')
      .insert({
        source_task_step_id,
        appro_is_id, //?? usually should be respondent not specified when creating automation
        relationship,
        of_appro_id, // bug 16:35 Nov 26 'null'
        name: name || 'error name missing createAutomationRelateByTask',
        automation_number: automation_number || null
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
},

createAutomationDeleteRelationByTask: {
  metadata: {
    tables: ['automations'],
    columns: ['name', 'source_task_step_id', 'appro_is_id', 'of_appro_id', 'automation_number'],
    type: 'INSERT',
    requiredArgs: ['source_task_step_id', 'appro_is_id', 'of_appro_id']
  },
  handler: async (supabase, userId, payload) => {
    const { source_task_step_id, appro_is_id, of_appro_id, name, automation_number } = payload;
   /* for (const arg of this.metadata.requiredArgs) {
      if (payload[arg] === undefined || payload[arg] === null) {
        throw new Error("Missing required argument: " + arg);
      }
    } */
    const { data, error } = await supabase
      .from('automations')
      .insert({
        source_task_step_id,
        appro_is_id,
        of_appro_id,
        name: name || 'Delete Relation Automation',
        automation_number: automation_number || null,
        relationship: 'DELETE'
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
},

createAutomationSendMessageByTask: {
  metadata: {
    tables: ['automations'],
    columns: ['name', 'source_task_step_id', 'message_content', 'recipient_id', 'automation_number'],
    type: 'INSERT',
    requiredArgs: ['source_task_step_id', 'message_content', 'recipient_id']
  },
  handler: async (supabase, userId, payload) => {
    const { source_task_step_id, message_content, recipient_id, name, automation_number } = payload;
 /*   for (const arg of this.metadata.requiredArgs) {
      if (payload[arg] === undefined || payload[arg] === null) {
        throw new Error("Missing required argument: " + arg);
      }
    } */
    const { data, error } = await supabase
      .from('automations')
      .insert({
        source_task_step_id,
        message_content,
        recipient_id,
        name: name || 'Send Message Automation',
        automation_number: automation_number || null
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
},

createAutomationAddTaskBySurvey: {
  metadata: {
    tables: ['automations'],
    columns: ['name', 'survey_answer_id', 'task_header_id', 'task_step_id', 'automation_number'],
    type: 'INSERT',
    requiredArgs: ['survey_answer_id', 'task_header_id', 'task_step_id']
  },
  handler: async (supabase, userId, payload) => {
    const { survey_answer_id, task_header_id, task_step_id, name, automation_number } = payload;
  /*  for (const arg of this.metadata.requiredArgs) {
      if (payload[arg] === undefined || payload[arg] === null) {
        throw new Error("Missing required argument: " + arg);
      }
    } */
    const { data, error } = await supabase
      .from('automations')
      .insert({
        survey_answer_id,
        task_header_id,
        task_step_id,
        name: name || 'Assign Task by Survey Automation',
        automation_number: automation_number || null
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
},

createAutomationAddSurveyBySurvey: {
  metadata: {
    tables: ['automations'],
    columns: ['name', 'survey_answer_id', 'survey_header_id', 'automation_number'],
    type: 'INSERT',
    requiredArgs: ['survey_answer_id', 'survey_header_id']
  },
  handler: async (supabase, userId, payload) => {
    const { survey_answer_id, survey_header_id, name, automation_number } = payload;
  /*  for (const arg of this.metadata.requiredArgs) {
      if (payload[arg] === undefined || payload[arg] === null) {
        throw new Error("Missing required argument: " + arg);
      }
    } */
    const { data, error } = await supabase
      .from('automations')
      .insert({
        survey_answer_id,
        survey_header_id,
        name: name || 'Assign Survey by Survey Automation',
        automation_number: automation_number || null
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
},

createAutomationRelateBySurvey: {
  metadata: {
    tables: ['automations'],
    columns: ['name', 'survey_answer_id', 'appro_is_id', 'relationship', 'of_appro_id', 'automation_number'],
    type: 'INSERT',
    requiredArgs: ['survey_answer_id', 'appro_is_id', 'relationship', 'of_appro_id']
  },
  handler: async (supabase, userId, payload) => {
    const { survey_answer_id, appro_is_id, relationship, of_appro_id, name, automation_number } = payload;
   /* for (const arg of this.metadata.requiredArgs) {
      if (payload[arg] === undefined || payload[arg] === null) {
        throw new Error("Missing required argument: " + arg);
      }
    } */
    const { data, error } = await supabase
      .from('automations')
      .insert({
        survey_answer_id,
        appro_is_id,
        relationship,
        of_appro_id,
        name: name || 'Relate by Survey Automation',
        automation_number: automation_number || null
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
},

createAutomationDeleteRelationBySurvey: {
  metadata: {
    tables: ['automations'],
    columns: ['name', 'survey_answer_id', 'appro_is_id', 'of_appro_id', 'automation_number'],
    type: 'INSERT',
    requiredArgs: ['survey_answer_id', 'appro_is_id', 'of_appro_id']
  },
  handler: async (supabase, userId, payload) => {
    const { survey_answer_id, appro_is_id, of_appro_id, name, automation_number } = payload;
   /* for (const arg of this.metadata.requiredArgs) {
      if (payload[arg] === undefined || payload[arg] === null) {
        throw new Error("Missing required argument: " + arg);
      }
    } */
    const { data, error } = await supabase
      .from('automations')
      .insert({
        survey_answer_id,
        appro_is_id,
        of_appro_id,
        name: name || 'Delete Relation by Survey Automation',
        automation_number: automation_number || null,
        relationship: 'DELETE'
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
},

createAutomationSendMessageBySurvey: {
  metadata: {
    tables: ['automations'],
    columns: ['name', 'survey_answer_id', 'message_content', 'recipient_id', 'automation_number'],
    type: 'INSERT',
    requiredArgs: ['survey_answer_id', 'message_content', 'recipient_id']
  },
  handler: async (supabase, userId, payload) => {
    const { survey_answer_id, message_content, recipient_id, name, automation_number } = payload;
 /*   for (const arg of this.metadata.requiredArgs) {
      if (payload[arg] === undefined || payload[arg] === null) {
        throw new Error("Missing required argument: " + arg);
      }
    } */
    const { data, error } = await supabase
      .from('automations')
      .insert({
        survey_answer_id,
        message_content,
        recipient_id,
        name: name || 'Send Message by Survey Automation',
        automation_number: automation_number || null
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
},



// end of newer version of the automations functions with checking of passed arguments. File 001 has previous versions


/*
createAutomationAddTaskByTask, 
createAutomationAddTaskBySurvey, 

createAutomationAddSurveyByTask, 
createAutomationAddSurveyBySurvey, 

createAutomationRelateByTask, 
createAutomationRelateBySurvey

createAutomationSendMessageByTask, 
createAutomationSendMessageBySurvey, 

createAutomationDeleteRelationByTask, 
createAutomationDeleteRelationBySurvey, 
*/


//AUTOMATIONS  //this function tries to do too much. It has spawned the above narrower versions
createSurveyAutomation:{
  metadata: {
    tables: ['automations'],
    columns: [  'name',
      'survey_answer_id',
      'source_task_step_id',
      'task_header_id',
      'task_step_id',
      'manager_id',
      'student_id',
      'appro_is_id',
      'relationship',
      'of_appro_id',
      'automation_number'], //WRONG?
    type: 'INSERT',
    requiredArgs: [] // ← WRONG  they depend on what is being saved
  },
  handler: async (supabase, userId, payload) => { // itemName 
    const { surveyAnswerId, source_task_step_id , taskId, manager_id, student_id, task_step_id, itemName, approfile_is_id, relationship, ofApprofileId, automation_number   } = payload;
//what is   approfile_is_id  and approfileId at moment of creating an automation in a survey or task???  
console.log('createSurveyAutomation  source_task_step_id:', source_task_step_id); // 22:40 Oct 14  UNDEFINED    10:58 Oct 15 NULL 

    const { data, error } = await supabase
      .from('automations')
      .insert({
        survey_header_id: surveyId || null,
        survey_answer_id: surveyAnswerId || null, // this is either valid or null
        source_task_step_id:source_task_step_id || null, //this is either null or valid //new 22;09 Oct 14

        task_header_id:taskId || null,
        task_step_id: task_step_id || null,  
        manager_id:manager_id || null,  //new 22;09 Oct 14
        student_id:student_id || null,   //new 22;09 Oct 14


        name: itemName,

        appro_is_id: approfile_is_id || null, //At moment of creating survey this is unlikely to be specified. 
        relationship:relationship || null,
        of_appro_id: ofApprofileId || null,

        automation_number : automation_number || null, 
        
      })
      .select()
      .single();

    if (error) throw error;
    return data; // ← returns { id, name, description, ... }
  }
},

//SURVEYS     DELETE (soft)
softDeleteAutomation:{
  metadata: {
    tables: ['automations'],
    columns: ['is_deleted', 'deleted_at', 'deleted_by'],
    type: 'UPDATE',
    requiredArgs: ['automationId', 'deletedBy']
  },
  handler: async (supabase, userId, payload) => {
    const { automationId, deletedBy } = payload;
console.log('registry softDelete', automationId, 'by', deletedBy);
    const { data, error } = await supabase
      .from('automations')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: deletedBy
      })
      .eq('id', automationId)
      .select()
      .single();

    if (error) throw error;
    return data; // returns the updated automation row
  }
},






/////////////////////////////////////    READ  SURVEYS   //////////////////////

//SURVEYS
readSurveyHeaders:{
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
      .select('id, name, description, author_id, created_at, last_updated_at, automations  ')
     // .eq('id',surveyId);

    if (error) throw error;
    return data;
  }
},

//SURVEYS
readSurveyQuestion:{
  metadata: {
    tables: ['survey_questions'],
    columns: ['name', 'description', 'author_id', 'created_at', 'last_updated_at'], //?
    type: 'SELECT',
    requiredArgs: ['surveyId'] 
  },
  handler: async (supabase, userId, payload) => {
    console.log('readSurveyHeaders()');
   const { surveyId } = payload;
    const { data, error } = await supabase
      .from('survey_questions')
      .select('id, name, description, author_id, created_at, last_updated_at, question_number')
     .eq('survey_header_id',surveyId);

    if (error) throw error;
    return data;
  }
},

//SURVEYS
readSurveyAnswers:{
  metadata: {
    tables: ['survey_answers'],
    columns: ['name', 'description', 'author_id', 'created_at', 'last_updated_at'], //?
    type: 'SELECT',
    requiredArgs: ['questionId'] 
  },
  handler: async (supabase, userId, payload) => {
    console.log('readSurveyHeaders()');
   const { questionId } = payload;
    const { data, error } = await supabase
      .from('survey_answers')
      .select('id, name, description, author_id, created_at, last_updated_at, answer_number')
     .eq('survey_question_id',questionId);

    if (error) throw error;
    return data;
  }
},



//SURVEYS
readSurveyView:{    // VIEW   Read only   // surveys show-up in this view if they have 1+ question & 1+ answers 
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