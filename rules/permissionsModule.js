//  ./db/permissionsModule.js
import { renderPermissions } from '../work/approfiles/relateApprofiles.js';

console.log('permissionsModule.js loaded');


export function render(panel, query = {}) { //wrapper to call the module with a passed argument
  console.log('Render permissions module:', panel, query);
 renderPermissions(panel,query={},'permission'); //permissionsModule is just a warpper the tells the relate module to handle permissions
}
