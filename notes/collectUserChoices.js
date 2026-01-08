// collectUserChoices.js
console.log("collectUserChoices.js");
const checkboxGroups = ['main', 'events', 'process', 'business', 'resource'];
const radioGroups = ['importance', 'message-mode'];

/**
 * Reads selected checkboxes and radio buttons and returns an array of tag values.
 * This is a passive function — no event listeners, just a snapshot of current state.
 */

export let messageAddress = 'self';



export function collectUserChoices() {
  console.log('collectUserChoices()');
  const tagsArray = [];

  // Handle checkboxes
  for (const group of checkboxGroups) {
    const checkboxes = document.querySelectorAll(`input[name="${group}"][type="checkbox"]`);
    for (const checkbox of checkboxes) {
      if (checkbox.checked) { console.log('checkedTag:',checkbox.value);
        tagsArray.push(checkbox.value);
      }
    }
  }

  // Handle importance & message buttons
  for (const group of radioGroups) {
    const selected = document.querySelector(`input[name="${group}"][type="radio"]:checked`);
    if (selected) { console.log('checkedRadio:',selected.value);
      tagsArray.push(selected.value);

if(group == 'message-mode' ) {messageAddress = selected.value; console.log('Collect: messgeAddress', messageAddress);}

    }
  }

//set a local variable?  let messageAddress = 'self';



  console.log('Tags collected:', tagsArray);
  return tagsArray;
}
