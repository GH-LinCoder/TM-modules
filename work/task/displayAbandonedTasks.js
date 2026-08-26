//  ./work/task/displayabandonedTasks.js
import { renderCompletedAbandonedTasks } from './displayTaskCards.js';

console.log('displayAbandonedTasks.js loaded');


export function render(panel, query = {}) { //wrapper to call the module with a passed argument
  console.log('Render displaTaskCards module:', panel, query);
 renderCompletedAbandonedTasks(panel,query,'abandoned'); //this Module is just a warpper the tells what to display for the display module 
}