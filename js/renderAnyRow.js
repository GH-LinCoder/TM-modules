/**
 * Creates a display element for a single key-value pair.
 * It handles different data types for a clean presentation.
 * @param {string} key - The property name (e.g., 'name', 'price').
 * @param {*} value - The property value.
 * @returns {HTMLElement} - The created div element displaying the data.
 */
function createDisplayElement(key, value) {
    const itemContainer = document.createElement('div');
    itemContainer.classList.add('flex', 'flex-col', 'space-y-1', 'py-2');

    const label = document.createElement('span');
    label.classList.add('text-sm', 'font-medium', 'text-gray-500', 'uppercase');
    // Simple text formatting for labels (e.g., 'firstName' becomes 'First Name')
    label.textContent = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

    const displayValue = document.createElement('span');
    displayValue.classList.add('text-lg', 'font-semibold', 'text-gray-900');

    // Handle different data types for display
    if (typeof value === 'boolean') {
        displayValue.textContent = value ? 'Yes' : 'No';
        displayValue.classList.add('text-green-600');
    } else if (value instanceof Date) {
        displayValue.textContent = value.toLocaleDateString();
    } else {
        displayValue.textContent = value;
    }

    itemContainer.appendChild(label);
    itemContainer.appendChild(displayValue);
    return itemContainer;
}

/**
 * Renders a complete card dynamically into a specified container element.
 * It displays each property of the record as a separate line item.
 * @param {object} record - The record object to be displayed.
 * @param {HTMLElement} containerEl - The DOM element where the card will be rendered.
 */
function renderRecordAsCard(record, containerEl) {
    // Clear any existing content in the container
    containerEl.innerHTML = '';
    
    const card = document.createElement('div');
    card.classList.add('bg-white', 'p-6', 'rounded-xl', 'shadow-md', 'space-y-4', 'border', 'border-gray-200');

    // Add a title to the card
    const title = document.createElement('h2');
    title.classList.add('text-2xl', 'font-bold', 'text-gray-800', 'mb-4');
    title.textContent = 'Record Details';
    card.appendChild(title);

    // Iterate over the record's properties to create display elements
    for (const key in record) {
        if (Object.hasOwnProperty.call(record, key)) {
            const displayElement = createDisplayElement(key, record[key]);
            card.appendChild(displayElement);
        }
    }

    // Append the complete card to the container
    containerEl.appendChild(card);
}
