import { createNormalAppro} from './createApprofile.js';

console.log('createNormalAppro.js loaded');


export function render(panel, query = {}) {
  console.log('Render createNormalAppro');
const actionType = 'create normal appro';

createNormalAppro(panel, query, actionType); //call the module by its bundle entry function
// this module doesn't know the bundle data. createBundleAppro knows it
}