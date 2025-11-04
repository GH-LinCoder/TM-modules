// collectUserChoices.js
console.log("collectUserChoices.js");
const checkboxGroups = ['main', 'events', 'process', 'business', 'resource'];
const radioGroups = ['importance'];

/**
 * Reads selected checkboxes and radio buttons and returns an array of tag values.
 * This is a passive function — no event listeners, just a snapshot of current state.
 */
export function collectUserChoices() {
  console.log('collectUserChoices()');
  const tagsArray = [];

  // Handle checkboxes
  for (const group of checkboxGroups) {
    const checkboxes = document.querySelectorAll(`input[name="${group}"][type="checkbox"]`);
    for (const checkbox of checkboxes) {
      if (checkbox.checked) {
        tagsArray.push(checkbox.value);
      }
    }
  }

  // Handle radio buttons
  for (const group of radioGroups) {
    const selected = document.querySelector(`input[name="${group}"][type="radio"]:checked`);
    if (selected) {
      tagsArray.push(selected.value);
    }
  }

  console.log('Tags collected:', tagsArray);
  return tagsArray;
}
