import { appState } from '../state/appState.js';
import { getClipboardItems, onClipboardUpdate } from '../utils/clipboardUtils.js';


// new functions to find data - External file to be imported by each module

export function detectContext(panel) {
    let context = panel.closest('[data-module]')?.dataset.module === 'myDash'
    console.log('context', context);
    return context;

  }

  // Return the latest item from the clipboard. If nothing there return the default value from appState (which is a person's id and name)
export  function resolveSubject() {
    const clipboardItems = getClipboardItems(); // no type filter
    console.log('clipboardItems', clipboardItems);
  
    if (clipboardItems.length > 0) {
      const entity = clipboardItems[0].entity;
      return {
        id: entity.id,
        name: entity.name || entity.id, // fallback to ID if name is missing
        type: entity.type || ''
      };
    }
  
    return {
      id: appState.query.userId,
      name: appState.query.userName,
      type: appState.query.userType
    };
  }
  

export function applyPresentationRules(panel, isMyDash) {
    const dropdownContainer = panel.querySelector('[data-role="subject-dropdown"]')?.closest('div');
    const instructions = panel.querySelector('[data-action="selector-dialogue"]');
    if (isMyDash) {
      if (dropdownContainer) dropdownContainer.style.display = 'none';
      if (instructions) instructions.style.display = 'none';
    } //else {
     // if (dropdownContainer) dropdownContainer.style.display = '';
    //  if (instructions) instructions.style.display = '';
    //}
    
  } 
//moved the above from displayRelations 18:16 Oct 27