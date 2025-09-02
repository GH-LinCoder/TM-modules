// Example of how to use the AdvanceTaskDialog class with dynamic loading

// Function to load the HTML template
async function loadHTMLTemplate() {
  // If you have the HTML as a string or need to fetch it
  const response = await fetch('/path/to/advance-task-dialog.html');
  const html = await response.text();
  
  // Create a temporary element to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Append to DOM
  document.body.appendChild(tempDiv.firstElementChild);
}

// Function to load the script dynamically
async function loadScript() {
  try {
    // Dynamically import the module
    const module = await import('/path/to/AdvanceTaskDialog.js');
    return module.default; // Return the default export (the class)
  } catch (error) {
    console.error('Failed to load script:', error);
    throw error;
  }
}

// Main function to show the dialog
async function showAdvanceTaskDialog() {
  try {
    // Load the HTML template first
    await loadHTMLTemplate();
    
    // Load the script
    const AdvanceTaskDialog = await loadScript();
    
    // Create an instance of the dialog
    const dialog = new AdvanceTaskDialog({
      onAdvance: () => console.log('Student advanced'),
      onReverse: () => console.log('Student reversed'),
      onClose: () => console.log('Dialog closed'),
      onAction: (action) => console.log(`Action: ${action}`)
    });
    
    // Show the dialog and wait for the result
    const studentMoved = await dialog.show();
    
    // Handle the result
    console.log(`Student was ${studentMoved ? 'moved' : 'not moved'}`);
    
    // Clean up when done
    dialog.destroy();
    
    return studentMoved;
  } catch (error) {
    console.error('Error showing dialog:', error);
    throw error;
  }
}

// Example of attaching to an event listener
document.getElementById('triggerButton').addEventListener('click', async () => {
  try {
    const result = await showAdvanceTaskDialog();
    console.log('Final result:', result);
  } catch (error) {
    console.error('Failed to show dialog:', error);
  }
});
