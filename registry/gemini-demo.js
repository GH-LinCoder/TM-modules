// --- DEMONSTRATION OF USAGE ---
async function runDemo() {
  try {
    // 1. Demonstrate an insert operation
   // const newRecord = await execute('insertTask', 'New Task from Demo', 'This is a task created by the registry.');
   // console.log('Result of insertTask:', newRecord);

    // 2. Demonstrate a read operation
    const taskIdToRead = newRecord.id;
    const taskData = await execute('readTaskWithSteps', taskIdToRead);
    console.log('Result of readTaskWithSteps:', taskData);

  } catch (error) {
    console.error('An error occurred during execution:', error.message);
  }
}

// Run the demonstration
runDemo();
