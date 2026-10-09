//./dash/upgradeModulesSection.js
import { petitionBreadcrumbs } from '../ui/breadcrumb.js';                                                                                                

console.log('upgradeModulesSection.js loaded');                                                                                                

function getTemplateHTML() { console.log('getTemplateHTML()');
return ` 
<div class="bg-green-100 rounded-lg shadow p-6" data-section="modules-market-section" data-destination="modules-market-section"> <h2 class="text-lg font-semibold mb-2">Potential Upgrade Modules</h2> 
<p class="text-sm text-gray-500 mb-4">These are external open-source tools and concepts that could be added as optional upgrade modules.</p> 
<div class="grid md:grid-cols-3 lg:grid-cols-4 gap-6" id="upgrade-cards">


<div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-action="modules-market-section"> 
 <h3 class="text-sm font-medium text-blue-700 mb-1">◀️ Return to previous section</h3> 
 <p class="text-xs text-blue-600">Click here as a back button to return this section to its previous contents.</p> </div>
  
 
<div class="bg-white border border-gray-200 rounded-lg p-4" data-action="upgrade-tiptap">
    <h3 class="text-sm font-medium text-gray-800 mb-1">
        <a href="https://tiptap.dev/" target="_blank" rel="noopener noreferrer" class="hover:underline text-blue-600">Tiptap (Modern Editor)</a>
    </h3>
    <p class="text-xs text-gray-600 mb-1">MIT • Headless • Based on ProseMirror. High-quality rich text editing.</p>
    <p class="text-xs text-gray-500">Perfect for the Task/Survey Editor. Supports extensions, markdown, and can save directly to your Appro blobs.</p>
</div>

            <div class="bg-white border border-gray-200 rounded-lg p-4" data-action="upgrade-excalidraw"> 
                <h3 class="text-sm font-medium text-gray-800 mb-1"> <a href="https://excalidraw.com/" target="_blank" rel="noopener noreferrer" class="hover:underline text-blue-600">Excalidraw (Whiteboard)</a> </h3> 
                <p class="text-xs text-gray-600 mb-1">MIT • Vanilla JS/React • Real-time virtual whiteboard.</p> <p class="text-xs text-gray-500">Good for brainstorming, planning, and mapping processes. Can store boards as appro JSON blobs.</p> </div>



<div class="bg-purple-50 border border-purple-200 rounded-lg p-4" data-action="upgrade-hocuspocus">
    <h3 class="text-sm font-medium text-purple-800 mb-1">
        <a href="https://tiptap.dev/hocuspocus" target="_blank" rel="noopener noreferrer" class="hover:underline text-blue-600">Hocuspocus (Collaboration)</a>
    </h3>
    <p class="text-xs text-purple-700 mb-1">MIT/Custom • Node.js • Real-time backend for collaborative editing.</p>
    <p class="text-xs text-purple-600">The "multiplayer" engine. Allows multiple admins to edit the same task or spreadsheet simultaneously with live cursors.</p>
</div>

 <div class="bg-white border border-gray-200 rounded-lg p-4" data-action="upgrade-luckysheet"> 
    <h3 class="text-sm font-medium text-gray-800 mb-1">     
        <a href="https://github.com/dream-num/Luckysheet" target="_blank" rel="noopener noreferrer" class="hover:underline text-blue-600">Luckysheet (Spreadsheet)</a> </h3> 
        <p class="text-xs text-gray-600 mb-1">MIT • Vanilla JS • Excel-like UI, formulas, formatting. Stores data as JSON, easy to map to Postgres.</p> 
        <p class="text-xs text-gray-500">Use as an embedded spreadsheet for budgets, rosters, planning. Can sync with appro and relation tables.</p> </div> 

 <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4" data-action="upgrade-nocodb"> 
                <h3 class="text-sm font-medium text-yellow-800 mb-1"> <a href="https://nocodb.com/" target="_blank" rel="noopener noreferrer" class="hover:underline text-blue-600">NocoDB (Spreadsheet UI for DB)</a> </h3>
                 <p class="text-xs text-yellow-700 mb-1">AGPL v3 • Node.js • Turns Postgres into a spreadsheet-style UI with views and relations.</p> <p class="text-xs text-yellow-600">Can be embedded or used as inspiration. Copyleft licence means care is needed if offered as SaaS.</p> </div>

 <div class="bg-white border border-gray-200 rounded-lg p-4" data-action="upgrade-firefly"> 
                <h3 class="text-sm font-medium text-gray-800 mb-1"> <a href="https://www.firefly-iii.org/" target="_blank" rel="noopener noreferrer" class="hover:underline text-blue-600">Firefly III (Finance)</a> </h3> <p class="text-xs text-gray-600 mb-1">AGPL v3 • PHP/Laravel • Expense tracking, budgets, categories, reports.</p> <p class="text-xs text-gray-500">Could be self-hosted alongside this app and connected via webhooks or API for financial summaries.</p> </div> 


  <div class="bg-white border border-gray-200 rounded-lg p-4" data-action="upgrade-tanstack-table"> 
            <h3 class="text-sm font-medium text-gray-800 mb-1"> <a href="https://tanstack.com/table" target="_blank" rel="noopener noreferrer" class="hover:underline text-blue-600">TanStack Table (Data Views)</a> </h3> 
            <p class="text-xs text-gray-600 mb-1">MIT • JS/React • Headless table logic. You control rendering, filtering, and persistence.</p>
             <p class="text-xs text-gray-500">Best for “organisation data views” such as members, tasks, and budgets backed by Postgres tables.</p> 
            </div>


            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4" data-action="upgrade-invoiceninja"> <h3 class="text-sm font-medium text-yellow-800 mb-1"> <a href="https://www.invoiceninja.com/" target="_blank" rel="noopener noreferrer" class="hover:underline text-blue-600">InvoiceNinja (Invoicing)</a> </h3> 
                <p class="text-xs text-yellow-700 mb-1">Elastic License • PHP/Node • Invoicing, client management, payment reconciliation.</p> <p class="text-xs text-yellow-600">Useful for reimbursements or invoices. Licence restricts commercial SaaS resale, so use with care.</p> </div>

            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-action="upgrade-custom-ledger"> <h3 class="text-sm font-medium text-blue-700 mb-1">Custom appro-based ledger</h3>
                 <p class="text-xs text-blue-600 mb-1">Your own JS + Postgres code using appros and relations to model transactions.</p> <p class="text-xs text-blue-500">Build lightweight bookkeeping on top of existing primitives and payment webhooks. No external dependency.</p> </div>

            <div class="bg-white border border-gray-200 rounded-lg p-4" data-action="upgrade-calcom"> 
                <h3 class="text-sm font-medium text-gray-800 mb-1"> <a href="https://cal.com/" target="_blank" rel="noopener noreferrer" class="hover:underline text-blue-600">Cal.com (Scheduling)</a> </h3> 
                <p class="text-xs text-gray-600 mb-1">MIT • Next.js/Node • Open-source scheduling and booking.</p> <p class="text-xs text-gray-500">Can be used for volunteer shifts, meetings, and events. Integrates via iframe or API with tasks.</p> </div>


            <div class="bg-white border border-gray-200 rounded-lg p-4" data-action="upgrade-documenso"> 
                <h3 class="text-sm font-medium text-gray-800 mb-1"> <a href="https://documenso.com/" target="_blank" rel="noopener noreferrer" class="hover:underline text-blue-600">Documenso (Document Signing)</a> </h3>
                 <p class="text-xs text-gray-600 mb-1">MIT/Apache • Next.js/PG • Open-source DocuSign alternative.</p> <p class="text-xs text-gray-500">Useful for volunteer agreements and consent forms. Signatures can trigger automations and permission bundles.</p> </div>


            <div class="bg-white border border-gray-200 rounded-lg p-4" data-action="upgrade-livekit"> 
                <h3 class="text-sm font-medium text-gray-800 mb-1"> <a href="https://livekit.io/" target="_blank" rel="noopener noreferrer" class="hover:underline text-blue-600">LiveKit (Audio/Video)</a> </h3> 
                <p class="text-xs text-gray-600 mb-1">Apache 2.0 • Go backend, JS SDK • Real-time audio/video.</p> <p class="text-xs text-gray-500">Suitable for town halls, training sessions, and meetings. A strong candidate for a premium meetings module.</p> </div> 

            <div class="bg-white border border-gray-200 rounded-lg p-4" data-action="upgrade-umami"> 
                <h3 class="text-sm font-medium text-gray-800 mb-1"> <a href="https://umami.is/" target="_blank" rel="noopener noreferrer" class="hover:underline text-blue-600">Umami (Analytics)</a> </h3> 
                <p class="text-xs text-gray-600 mb-1">MIT • Node.js/Next.js/PG • Privacy-friendly analytics.</p> <p class="text-xs text-gray-500">Can track task completion, survey responses, and logins. Dashboards can be embedded in the admin area.</p> </div> 

            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4" data-action="upgrade-metabase"> <h3 class="text-sm font-medium text-yellow-800 mb-1"> <a href="https://www.metabase.com/" target="_blank" rel="noopener noreferrer" class="hover:underline text-blue-600">Metabase (BI Dashboards)</a> </h3> 
                <p class="text-xs text-yellow-700 mb-1">AGPL • Java • Business intelligence dashboards and charts.</p> <p class="text-xs text-yellow-600">Connects directly to Postgres. Can be embedded for advanced reporting, with AGPL licence considerations.</p> </div>

            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4" data-action="upgrade-n8n">
                 <h3 class="text-sm font-medium text-yellow-800 mb-1"> <a href="https://n8n.io/" target="_blank" rel="noopener noreferrer" class="hover:underline text-blue-600">n8n (Workflow Automation)</a> </h3> 
                 <p class="text-xs text-yellow-700 mb-1">Fair-code • Node.js • Visual workflow automation with many connectors.</p> <p class="text-xs text-yellow-600">Can complement your own automation engine for power users. Licence restricts some commercial SaaS uses.</p> </div>

                 </div> 
                 </div> ${petitionBreadcrumbs()} `} 
                 
export function render(panel, petition = {}) { 
    console.log('upgradeModules Render'); 
     panel.innerHTML = getTemplateHTML();
    }