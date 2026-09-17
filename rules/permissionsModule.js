//  ./rules/permissionsModule.js
import { grantASinglePermission } from '../work/approfiles/relateApprofiles.js';

console.log('permissionsModule.js loaded');


export function render(panel, query = {}) { //wrapper to call the module with a passed argument
  console.log('grantASinglePermission:', panel, query);
 grantASinglePermission(panel,query={},'permission'); //permissionsModule is just a wrapper the tells the relate module to handle permissions
}
