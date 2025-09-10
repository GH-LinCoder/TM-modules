//  ./ui/breadcrumb.js

import { appState } from "../state/appState.js";

export function petitionBreadcrumbs(){
const petition = appState.query.petitioner;
console.log('petition:',petition);
    return    `<p class="text-xs text-gray-400 mt-4">Context: ${petition.Module} - ${petition.Section} - ${petition.Action}- ${petition.Destination}</p>`;
}