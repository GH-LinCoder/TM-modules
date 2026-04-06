//  ./rules/permissionsBundleModule.js
//import { petitionBreadcrumbs } from '../ui/breadcrumb.js';
import { grantBundlePermissions } from '../work/approfiles/relateApprofiles.js';

console.log('permissionsModule.js loaded');


export function render(panel, query = {}) {
  console.log('Render permissions module:', panel, query);
  //panel.innerHTML = getTemplateHTML1();
  //attachListeners(panel);
grantBundlePermissions(panel); //go to the bundles entry function


//  renderPermissions(panel,query={},'permission'); //permissionsModule is just a warpper the tells the relate module to handle permissions
  
}