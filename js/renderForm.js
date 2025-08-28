// --- Core Dynamic Form Functions ---

/* The input to the function is to be a JavaScript object. 
  For example, { "id": 123, "productName": "Widget A", "price": 9.99 }.
  Read the db row & either get it as such a object or map it into one prior to 
  calling renderForm.
  Pass to renderForm the name of the function to be called to save the amended data
    onSaveCallback(updatedRecord);
*/

/**
 * Creates an HTML input element container based on a given key and value.
 * This function handles different input types (text, number, checkbox)
 * and returns a complete div element ready to be appended to the form.
 * * @param {string} key - The property name (e.g., 'name', 'price').
 * @param {*} value - The property value.
 * @returns {HTMLElement} - The created input element container.
 */
function createInputElement(key, value) {
    const container = document.createElement('div');
    container.classList.add('flex', 'flex-col', 'space-y-1', 'mb-4');

    const label = document.createElement('label');
    label.classList.add('text-sm', 'font-medium', 'text-gray-700', 'capitalize');
    // Simple text formatting for labels (e.g., 'firstName' becomes 'First Name')
    label.textContent = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

    const input = document.createElement('input');
    input.id = `input-${key}`;
    input.name = key;
    input.value = value;
    input.classList.add('px-4', 'py-2', 'rounded-lg', 'border-2', 'border-gray-300', 'focus:outline-none', 'focus:border-blue-500', 'transition', 'disabled:bg-gray-200');

    // Make 'id' and 'type' fields read-only
    if (key === 'id' || key === 'type') {
        input.disabled = true;
    }

    // Determine input type based on the value's data type
    if (typeof value === 'number') {
        input.type = 'number';
    } else if (typeof value === 'boolean') {
        input.type = 'checkbox';
        input.checked = value;
        // Remove text input styles for a cleaner checkbox look
        input.classList.remove('px-4', 'py-2', 'rounded-lg', 'border-2', 'border-gray-300'); 
    } else if (key.toLowerCase().includes('date')) {
        input.type = 'date';
    } else {
        input.type = 'text';
    }

    container.appendChild(label);
    container.appendChild(input);
    return container;
}

/**
 * Renders a complete form dynamically into a specified container element.
 * * @param {object} record - The record object to be edited.
 * @param {HTMLElement} formContainerEl - The DOM element where the form will be rendered.
 * @param {function} onSaveCallback - A function to be called on form submission,
 * receiving the updated record data.
 */
function renderForm(record, formContainerEl, onSaveCallback) {
    // Clear any existing content in the form container
    formContainerEl.innerHTML = '';
    
    const form = document.createElement('form');
    form.classList.add('space-y-4');
    
    // Iterate over the record's properties to create form fields
    for (const key in record) {
        if (Object.hasOwnProperty.call(record, key)) {
            const inputElement = createInputElement(key, record[key]);
            form.appendChild(inputElement);
        }
    }

    // Add a submit button
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = 'Save Changes';
    submitBtn.classList.add('w-full', 'py-3', 'px-6', 'bg-blue-600', 'text-white', 'font-semibold', 'rounded-lg', 'shadow-md', 'hover:bg-blue-700', 'transition');
    form.appendChild(submitBtn);

    // Add an event listener to handle form submission
    form.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent default form submission
        
        // Collect data from the form inputs
        const formData = new FormData(form);
        const updatedRecord = {};
        for (let [key, value] of formData.entries()) {
            // Type casting for boolean and number fields
            if (form.elements[key].type === 'checkbox') {
                updatedRecord[key] = form.elements[key].checked;
            } else if (form.elements[key].type === 'number') {
                updatedRecord[key] = parseFloat(value);
            } else {
                updatedRecord[key] = value;
            }
        }
        
        // Call the provided callback function with the updated data
        onSaveCallback(updatedRecord);
    });

    // Append the complete form to the container
    formContainerEl.appendChild(form);
}
