import {functionRegistry} from './gemini-function-registry'
import{createSupabaseClient} from './supabase.js';
// --- DEMONSTRATION OF USAGE ---

supabase = createSupabaseClient();

async function runDemo() {
  try {
    // 1. Demonstrate an insert operation
   // const newRecord = await execute('insertTask', 'New Task from Demo', 'This is a task created by the registry.');
   // console.log('Result of insertTask:', newRecord);

    // 2. Demonstrate a read operation
    const taskIdToRead =  'bd603a0c-6b69-42e6-b6d6-9a7d2df05ca1'     //newRecord.id;
    const taskData = await execute('readTaskWithSteps', taskIdToRead);
    console.log('Result of readTaskWithSteps:', taskData);

  } catch (error) {
    console.error('An error occurred during execution:', error.message);
  }
}

// Run the demonstration
runDemo();
