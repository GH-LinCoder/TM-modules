//  ./work/survey/displayAbandonedsurveys.js
import { renderCompletedAbandonedSurveys } from './displaySurveyCards.js';

console.log('displayAbandoneddSurveys.js loaded');


export function render(panel, query = {}, controller) { //wrapper to call the module with a passed argument
  console.log('Render displayAbandonedSurveyCards module:', panel, query);
 renderCompletedAbandonedSurveys(panel,query,controller,'abandoned'); //this Module is just a wrapper the tells what to display for the display module 
}