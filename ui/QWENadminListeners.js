// ./js/listeners/adminListeners.js

/**
 * Hides all forms with data-form attribute
 */
function hideAllForms() {
  const forms = document.querySelectorAll('[data-form]');
  forms.forEach(form => {
    form.classList.add('hidden');
  });
}

/**
 * Shows a specific form by data-form value
 * @param {string} formName - The data-form value to show
 */
function showForm(formName) {


// Check if the forms exist in the DOM
console.log('All elements with data-form:', document.querySelectorAll('[data-form]').length);

// List all data-form values
document.querySelectorAll('[data-form]').forEach(el => {
    console.log('Found data-form:', el.getAttribute('data-form'), 'Visible:', !el.classList.contains('hidden'));
});


console.log('showForm (', formName, ')');//arrives here  20:06 aug 25

  const form = document.querySelector(`[data-form="${formName}"]`);

  console.log('The form:(', form, ')');// null
  if (form) {
    hideAllForms();
    form.classList.remove('hidden');
  }
}


/**
 * Sets up event listeners for the admin dashboard
 * @param {Element} container - The container element
 */
export function setupAdminListeners(container) {
  // Listen for clicks on the container
console.log('setupAdminListeners (', container, ')');//this is the entire html div being passed !

  container.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    console.log('setupAdminListeners (', target, ')');  //working 20:00 aug 25
    if (!target) {    console.log('fails !target (', target, ')');  return;}
    console.log('after !target (', target, ')');  //
    e.preventDefault();
    const action = target.dataset.action;

    console.log('setupAdminListeners (', action, ')');//getting here 20:04 aug 25  create-task-dialogue

    switch (action) {
      case 'create-task-dialogue':
        showForm('create-task-dialogue');
        break;

      case 'assign-task-dialogue':
        showForm('assign-task-dialogue');
        break;

      case 'close-modal':
        hideAllForms();
        break;

      case 'navigate':
        navigateTo(target.dataset.page);
        break;

      case 'sign-out':
        signOut();
        break;

      default:
        console.warn('Unknown action:', action);
    }
  });

  // Close modal when clicking outside
  container.addEventListener('click', (e) => {
    if (e.target.matches('[data-form]')) {
      hideAllForms();
    }
  });
}