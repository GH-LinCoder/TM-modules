// ./js/dataReader.js

import{createSupabaseClient, supabase} from './supabase.js';

const supabase = createSupabaseClient();

export async function readAllMembers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, email, created_at')
    .order('username');

  if (error) {
    console.error('Error fetching members:', error.message);
    throw new Error('Failed to fetch all members.');
  }
  
  return data || [];
}

export async function readAllTasks() {
  const { data, error } = await supabase
    .from('task_headers')
    .select('id, name, author_id, created_at, description, external_url')
    .order('name');

  if (error) {
    console.error('Error fetching tasks:', error.message);
    throw new Error('Failed to fetch all tasks.');
  }
  
  return data || [];
}

export async function readAllAssignments() {
  const { data, error } = await supabase
    .from('task_assignments')
    .select('id, student_id, manager_id, task_header_id, assigned_at, completed_at, abandoned_at')
    .order('assigned_at', { ascending: false });

  if (error) {
    console.error('Error fetching assignments:', error.message);
    throw new Error('Failed to fetch all assignments.');
  }
  
  return data || [];
}

export async function readAllSteps() {
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

export async function readAllRelatedIds(tableName, idColumnName) {
  const { data, error } = await supabase
    .from(tableName)
    .select(idColumnName);

  if (error) {
    console.error(`Error fetching all IDs from ${tableName}.${idColumnName}:`, error.message);
    throw new Error(`Failed to fetch IDs from ${tableName}.${idColumnName}.`);
  }

  return data || [];
}

export async function readUniqueRelatedIds(tableName, idColumnName) {
  const allIdRecords = await readAllRelatedIds(tableName, idColumnName);

  if (allIdRecords.length === 0) {
    return [];
  }

  const uniqueIds = [...new Set(allIdRecords.map(record => record[idColumnName]))];

  return uniqueIds;
}

export async function readProfilesByIds(ids) {
  if (ids.length === 0) {
    return [];
  }
  
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, username, email');

  if (profilesError) {
    console.error('Error fetching profiles by IDs:', profilesError.message);
    throw new Error('Failed to fetch profiles by IDs.');
  }
  
  return profiles.map(profile => ({
    id: profile.id,
    name: profile.username || 'Unknown User',
    email: profile.email || 'No Email Provided'
  })).sort((a, b) => a.name.localeCompare(b.name));
}

// Convenience wrappers
export async function readAllStudentEntries() {
  console.log('readAllStudentEntries');
  return await readAllRelatedIds('task_assignments', 'student_id');
}

export async function readAllManagerEntries() {
  console.log('readAllManagerEntries');
  return await readAllRelatedIds('task_assignments', 'manager_id');
}

export async function readAllAuthorEntries() {
  console.log('readAllAuthorEntries');
  return await readAllRelatedIds('task_headers', 'author_id');
}

export async function readUniqueStudents() {
  console.log('readUniqueStudents');
  return await readUniqueRelatedIds('task_assignments', 'student_id');
}

export async function readUniqueManagers() {
  console.log('readUniqueManagers');
  return await readUniqueRelatedIds('task_assignments', 'manager_id');
}

export async function readUniqueAuthors() {
  console.log('readUniqueAuthors');
  try {
    return await readUniqueRelatedIds('task_headers', 'author_id');
  } catch (error) {
    console.error('Error in getStudentIDs (from new function call):', error);
    throw error;
  }
}