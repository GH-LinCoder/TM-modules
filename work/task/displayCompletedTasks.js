//  ./work/task/displayCompletedTasks.js
import { renderCompletedAbandonedTasks } from './displayTaskCards.js';

console.log('displayCompletedTasks.js loaded');


export function render(panel, query = {}, controller) { //wrapper to call the module with a passed argument
  console.log('Render displaTaskCards module:', panel, query);
 renderCompletedAbandonedTasks(panel,query,controller,'completed'); //this Module is just a warpper the tells what to display for the display module 
}
