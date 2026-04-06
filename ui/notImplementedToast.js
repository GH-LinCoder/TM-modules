import { showToast } from '../../ui/showToast.js';

export function notImplementedToast(panel, featureName) {
  console.log('notImplementedToast', panel, featureName);
  showToast(`${featureName} not yet implemented.`, 'warning', 1000);
}