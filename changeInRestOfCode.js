        case 'open-create-task-dialogue':
            // Use the new function to load the JavaScript module.
            // The rest of your old logic (like renderPanel) is no longer needed here.
            loadModule(action);
            break;

// Define the listener as a named function outside the methods.
// This is the single, reusable function reference.
function handleClick(event) {
    console.log('Button was clicked!');
}

export default {
    render(targetElement) {
        // Find the button and attach the listener
        const myButton = targetElement.querySelector('.my-button');
        if (myButton) {
            myButton.addEventListener('click', handleClick);
        }
    },
    destroy(targetElement) {
        // Find the button again and remove the listener using the same function reference
        const myButton = targetElement.querySelector('.my-button');
        if (myButton) {
            myButton.removeEventListener('click', handleClick);
        }
    }
};



// Inside your main application script
import TaskForm from './createTaskForm.js';

// Now you can use the toolbox's tools
TaskForm.render(someElement); // to add event listener




// the load module

// A lookup table for your new JavaScript-based modules.
// This is where you will add new entries as you convert more forms.
const dialogModules = {
    'open-create-task-dialogue': () => import('./forms/taskForm.js')
};

// This function handles the entire process of loading a module and rendering its content.
async function loadModule(action) {
    const container = document.getElementById('container'); // Assuming 'container' is your main content frame.
    
    // Check if the module for this action exists in our lookup table.
    const getModule = dialogModules[action];

    if (getModule) {
        try {
            // Dynamically import the module using async/await.
            const module = await getModule();
            
            // Call the render method from the imported module.
            // This is where the magic happens: the module injects its own HTML and attaches its own listeners.
            module.default.render(container);

            console.log(`Successfully loaded and rendered module for action: ${action}`);
        } catch (error) {
            console.error(`Failed to load module for action: ${action}`, error);
        }
    } else {
        console.warn(`No module found for action: ${action}`);
    }
}
