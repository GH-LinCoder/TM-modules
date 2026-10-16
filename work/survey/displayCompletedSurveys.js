//  ./work/survey/displayCompletedsurveys.js
import { renderCompletedAbandonedSurveys } from './displaySurveyCards.js';

console.log('displayCompletedSurveys.js loaded');


export function render(panel, query = {}, controller) { //wrapper to call the module with a passed argument
  console.log('Render displayCompletedsurveyCards module:', panel, query);
 renderCompletedAbandonedSurveys(panel,query, controller,'completed'); //this Module is just a warpper the tells what to display for the display module 
}