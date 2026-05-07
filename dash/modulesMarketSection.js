import { petitionBreadcrumbs } from '../ui/breadcrumb.js';

console.log('upgradeModulesSection.js loaded');

function getTemplateHTML() {
    return `
<div class="bg-gray-50 rounded-lg shadow-inner p-6" data-section="modules-market-section" data-destination="modules-market-section">
    <div class="flex justify-between items-center mb-6">
        <div>
            <h2 class="text-2xl font-bold text-gray-800">Platform Upgrade Market</h2>
            <p class="text-sm text-gray-500">These are potential upgrades to the app to extend your organization's power. 
            If you are a customer who would be interested in having one of these upgrades integrated in your organization you will be able to indicate your interest in having one or more of these modules. 
            This registration of interest is done through a 'letter of intent' which is not binding.</p> 
            <p>If you are a developer interested in integrating one of these modules into our app, you can also indicate your interest in doing so. 
            If we approve of your plans you could receive a royalty payment from each sale.</p>
        </div>
        <div class="hidden md:flex gap-4 text-[10px] uppercase font-bold tracking-tighter">
            <span class="flex items-center gap-1"><div class="w-3 h-3 bg-green-200 rounded-full"></div> Permissive</span>
            <span class="flex items-center gap-1"><div class="w-3 h-3 bg-yellow-200 rounded-full"></div> License Care</span>
            <span class="flex items-center gap-1"><div class="w-3 h-3 bg-blue-200 rounded-full"></div> Our own licence</span>
        </div>
    </div>

    <div class="space-y-10">
        
        <section>
            <h3 class="text-xs font-bold uppercase tracking-widest text-green-400 mb-4 border-b pb-1">Content & Collaboration</h3>
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

                <div class="bg-gray-200 border border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-300 flex flex-col justify-center items-center text-center" data-action="modules-market-section">
                    <h3 class="text-sm font-bold text-gray-700">◀️ CLOSE MARKET</h3>
                    <p class="text-[9px] text-gray-500 uppercase">Return to Settings</p>
                </div>

                
                <div class="bg-green-50 border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow" data-action="upgrade-tiptap">
                    <h3 class="text-sm font-bold text-green-900">
                        <a href="https://tiptap.dev/" target="_blank" rel="noopener noreferrer" class="hover:underline">Tiptap Editor</a>
                    </h3>
                    <p class="text-[9px] bg-green-200 text-green-800 px-1 rounded w-max mb-2 uppercase">MIT • Green Light</p>
                    <p class="text-xs text-green-700">High-quality rich text editing. Perfect for the Task/Survey Editor.</p>
                </div>


                <div class="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:shadow-md transition-shadow" data-action="upgrade-hocuspocus">
                    <h3 class="text-sm font-bold text-purple-900">
                        <a href="https://tiptap.dev/hocuspocus" target="_blank" rel="noopener noreferrer" class="hover:underline">Hocuspocus</a>
                    </h3>
                    <p class="text-[9px] bg-purple-200 text-purple-800 px-1 rounded w-max mb-2 uppercase">MIT/Custom • Multiplayer</p>
                    <p class="text-xs text-purple-700">The engine for real-time collaborative editing with live cursors.</p>
                </div>

                <div class="bg-green-50 border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow" data-action="upgrade-excalidraw">
                    <h3 class="text-sm font-bold text-green-900">
                        <a href="https://excalidraw.com/" target="_blank" rel="noopener noreferrer" class="hover:underline">Excalidraw</a>
                    </h3>
                    <p class="text-[9px] bg-green-200 text-green-800 px-1 rounded w-max mb-2 uppercase">MIT • Green Light</p>
                    <p class="text-xs text-green-700">Virtual whiteboard for brainstorming. Save boards as JSON blobs.</p>
                </div>

                <div class="bg-green-50 border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow" data-action="upgrade-documenso">
                    <h3 class="text-sm font-bold text-green-900">
                        <a href="https://documenso.com/" target="_blank" rel="noopener noreferrer" class="hover:underline">Documenso</a>
                    </h3>
                    <p class="text-[9px] bg-green-200 text-green-800 px-1 rounded w-max mb-2 uppercase">MIT • Green Light</p>
                    <p class="text-xs text-green-700">Open-source document signing for agreements and consent forms.</p>
                </div>
            </div>
        </section>

        <section>
            <h3 class="text-xs font-bold uppercase tracking-widest text-blue-400 mb-4 border-b pb-1">Data & Finance</h3>
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div class="bg-green-50 border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow" data-action="upgrade-luckysheet">
                    <h3 class="text-sm font-bold text-green-900">
                         <a href="https://github.com/dream-num/Luckysheet" target="_blank" rel="noopener noreferrer" class="hover:underline">Luckysheet</a>
                    </h3>
                    <p class="text-[9px] bg-green-200 text-green-800 px-1 rounded w-max mb-2 uppercase">MIT • Green Light</p>
                    <p class="text-xs text-green-700">Excel-like UI for budgets. Stores JSON data for easy Postgres mapping.</p>
                </div>

                <div class="bg-green-50 border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow" data-action="upgrade-tanstack-table">
                    <h3 class="text-sm font-bold text-green-900">
                        <a href="https://tanstack.com/table" target="_blank" rel="noopener noreferrer" class="hover:underline">TanStack Table</a>
                    </h3>
                    <p class="text-[9px] bg-green-200 text-green-800 px-1 rounded w-max mb-2 uppercase">MIT • Green Light</p>
                    <p class="text-xs text-green-700">Advanced data views and powerful filtering for member lists.</p>
                </div>

                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow" data-action="upgrade-custom-ledger">
                    <h3 class="text-sm font-bold text-blue-900">Our own Ledger</h3>
                    <p class="text-[9px] bg-blue-200 text-blue-800 px-1 rounded w-max mb-2 uppercase">Our own • Green Light</p>
                    <p class="text-xs text-blue-700">Lightweight bookkeeping built on your existing Appro relations.</p>
                </div>

                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 hover:shadow-md transition-shadow" data-action="upgrade-nocodb">
                    <h3 class="text-sm font-bold text-yellow-900">
                        <a href="https://nocodb.com/" target="_blank" rel="noopener noreferrer" class="hover:underline">NocoDB</a>
                    </h3>
                    <p class="text-[9px] bg-yellow-200 text-yellow-800 px-1 rounded w-max mb-2 uppercase">AGPL • Caution</p>
                    <p class="text-xs text-yellow-700">Spreadsheet-style DB manager. Licensing care needed for SaaS.</p>
                </div>
            </div>
        </section>

        <section>
            <h3 class="text-xs font-bold uppercase tracking-widest text-yellow-400 mb-4 border-b pb-1">Operations & Measurement</h3>
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div class="bg-green-50 border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow" data-action="upgrade-calcom">
                    <h3 class="text-sm font-bold text-green-900">
                        <a href="https://cal.com/" target="_blank" rel="noopener noreferrer" class="hover:underline">Cal.com</a>
                    </h3>
                    <p class="text-[9px] bg-green-200 text-green-800 px-1 rounded w-max mb-2 uppercase">MIT • Green Light</p>
                    <p class="text-xs text-green-700">Scheduling for shifts and events. Ready for task integration.</p>
                </div>

                <div class="bg-green-50 border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow" data-action="upgrade-livekit">
                    <h3 class="text-sm font-bold text-green-900">
                         <a href="https://livekit.io/" target="_blank" rel="noopener noreferrer" class="hover:underline">LiveKit</a>
                    </h3>
                    <p class="text-[9px] bg-green-200 text-green-800 px-1 rounded w-max mb-2 uppercase">Apache • Green Light</p>
                    <p class="text-xs text-green-700">Real-time video/audio. Now supports AI Voice Agents. 'Multiplayer' training sessions or AI-assisted town halls."</p>
                </div>

                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 hover:shadow-md transition-shadow" data-action="upgrade-n8n">
                    <h3 class="text-sm font-bold text-yellow-900">
                        <a href="https://n8n.io/" target="_blank" rel="noopener noreferrer" class="hover:underline">n8n Automation</a>
                    </h3>
                    <p class="text-[9px] bg-yellow-200 text-yellow-800 px-1 rounded w-max mb-2 uppercase">Fair-code • Caution</p>
                    <p class="text-xs text-yellow-700">Ai workflows, but based on an open source version of Zapier to connect to external services.</p>
                </div>


            </div>
        </section>

<div class="space-y-10">
        
        <section>
            <h3 class="text-xs font-bold uppercase tracking-widest text-red-600 mb-4">Graph & Relation Mapping</h3>
            <div class="grid md:grid-cols-2 gap-4">
                
                <div class="bg-green-50 border border-green-200 rounded-lg p-4" data-action="upgrade-cytoscape">
                    <h3 class="text-sm font-bold text-green-900">
                        <a href="https://js.cytoscape.org/" target="_blank" rel="noopener noreferrer" class="hover:underline">Cytoscape.js (Network Maps)</a>
                    </h3>
                    <p class="text-[9px] bg-green-200 text-green-800 px-1 rounded w-max mb-2 uppercase">MIT • Visual Mapping</p>
                    <p class="text-xs text-green-700">The solution for Node-Edge data. Automatically map relations between tasks, users, and organizations into a visual web.</p>
                </div>

                <div class="bg-white border border-gray-200 rounded-lg p-4" data-action="upgrade-g6">
                    <h3 class="text-sm font-bold text-gray-800">
                        <a href="https://g6.antv.vision/en" target="_blank" rel="noopener noreferrer" class="hover:underline">G6 Relationship Graph</a>
                    </h3>
                    <p class="text-[9px] bg-gray-200 text-gray-700 px-1 rounded w-max mb-2 uppercase">MIT • High Performance</p>
                    <p class="text-xs text-gray-600">Specializes in visual analysis. Ideal for seeing "who is linked to what" across your entire database.</p>
                </div>


                <div class="bg-green-50 border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow" data-action="upgrade-tiptap">
                    <h3 class="text-sm font-bold text-green-900">
                        <a href="https://leafletjs.com/examples.html" target="_blank" rel="noopener noreferrer" class="hover:underline">Open source map marker</a>
                    </h3>
                    <p class="text-[9px] bg-green-200 text-green-800 px-1 rounded w-max mb-2 uppercase">MIT • Green Light</p>
                    <p class="text-xs text-green-700">Show locations or areas to leaflet or routes on top of a real map.</p>
                </div>
            </div>
        </section>



<section>
  <h3 class="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4 border-b pb-1">
    Paid for email
  </h3>
  <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

    <!-- SendGrid -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow" data-action="upgrade-sendgrid">
      <h3 class="text-sm font-bold text-blue-900">
        <a href="https://sendgrid.com/" target="_blank" rel="noopener noreferrer" class="hover:underline">SendGrid</a>
      </h3>
      <p class="text-[9px] bg-blue-200 text-blue-800 px-1 rounded w-max mb-2 uppercase">API • Bulk & Transactional</p>
      <p class="text-xs text-blue-700">
        Popular email API for bulk and transactional mail. REST + SMTP, easy integration, solid deliverability.
      </p>
    </div>

    <!-- Mailgun -->
    <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-4 hover:shadow-md transition-shadow" data-action="upgrade-mailgun">
      <h3 class="text-sm font-bold text-indigo-900">
        <a href="https://www.mailgun.com/" target="_blank" rel="noopener noreferrer" class="hover:underline">Mailgun</a>
      </h3>
      <p class="text-[9px] bg-indigo-200 text-indigo-800 px-1 rounded w-max mb-2 uppercase">API • Developer Focused</p>
      <p class="text-xs text-indigo-700">
        Developer‑friendly email API with strong logs and analytics. Great for programmatic sending and control.
      </p>
    </div>

    <!-- Postmark -->
    <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 hover:shadow-md transition-shadow" data-action="upgrade-postmark">
      <h3 class="text-sm font-bold text-amber-900">
        <a href="https://postmarkapp.com/" target="_blank" rel="noopener noreferrer" class="hover:underline">Postmark</a>
      </h3>
      <p class="text-[9px] bg-amber-200 text-amber-800 px-1 rounded w-max mb-2 uppercase">API • Transactional</p>
      <p class="text-xs text-amber-700">
        Fast, reliable transactional email (resets, receipts, notifications). Simple API, high inbox placement.
      </p>
    </div>

    <!-- Amazon SES -->
    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 hover:shadow-md transition-shadow" data-action="upgrade-ses">
      <h3 class="text-sm font-bold text-yellow-900">
        <a href="https://aws.amazon.com/ses/" target="_blank" rel="noopener noreferrer" class="hover:underline">Amazon SES</a>
      </h3>
      <p class="text-[9px] bg-yellow-200 text-yellow-800 px-1 rounded w-max mb-2 uppercase">API • Low Cost</p>
      <p class="text-xs text-yellow-700">
        Very low‑cost high‑volume email via AWS. Powerful but more complex setup (IAM, domains, DKIM).
      </p>
    </div>

    <!-- Brevo -->
    <div class="bg-teal-50 border border-teal-200 rounded-lg p-4 hover:shadow-md transition-shadow" data-action="upgrade-brevo">
      <h3 class="text-sm font-bold text-teal-900">
        <a href="https://www.brevo.com/" target="_blank" rel="noopener noreferrer" class="hover:underline">Brevo (Sendinblue)</a>
      </h3>
      <p class="text-[9px] bg-teal-200 text-teal-800 px-1 rounded w-max mb-2 uppercase">API • Marketing & Bulk</p>
      <p class="text-xs text-teal-700">
        Email + marketing platform with API support. Good for campaigns, newsletters, and contact‑list based sending.
      </p>
    </div>
</div>
</section>

<section>
  <h3 class="text-xs font-bold uppercase tracking-widest text-orange-400 mb-4 border-b pb-1">
    Internal upgrades
  </h3>
  <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

    <!-- Bulk selection -->
    <div class="bg-teal-50 border border-teal-200 rounded-lg p-4 hover:shadow-md transition-shadow" data-action="upgrade-brevo">
      <h3 class="text-sm font-bold text-teal-900">
        Bulk Selection
      </h3>
      <p class="text-[9px] bg-teal-200 text-teal-800 px-1 rounded w-max mb-2 uppercase">Select module. Selecting >1 item</p>
      <p class="text-xs text-teal-700">
        Use standard shift click or control/command click to select more than 1 item from a list. This needs an array and the modules all need to be upgraded to handle arrays and the registry functions probably to use array databse capability
      </p>
    </div>

    <!-- Refacter Selector -->
    <div class="bg-teal-50 border border-teal-200 rounded-lg p-4 hover:shadow-md transition-shadow" data-action="upgrade-brevo">
      <h3 class="text-sm font-bold text-teal-900">
        Refacter Selector
      </h3>
      <p class="text-[9px] bg-teal-200 text-teal-800 px-1 rounded w-max mb-2 uppercase">Selector module, needs tabs or search</p>
      <p class="text-xs text-teal-700">
The Selector module has checkboxes a dropdown & can only select one item. This will not scale. Also the output offers chouces of how to classify the output. Many of these are not valid. The design needs to be reworked 
      </p>
    </div>

    <!-- Surveys -->
    <div class="bg-teal-50 border border-teal-200 rounded-lg p-4 hover:shadow-md transition-shadow" data-action="upgrade-brevo">
      <h3 class="text-sm font-bold text-teal-900">
        Surveys
      </h3>
      <p class="text-[9px] bg-teal-200 text-teal-800 px-1 rounded w-max mb-2 uppercase">Refactor design</p>
      <p class="text-xs text-teal-700">
Automation display needs to respond to whether the auto should or should not be shown. The questions should probably appear one at a time. Add video capability. Auto adjust video size to screen size. The design needs a rethink.
      </p>
    </div>

        <!-- Tasks -->
    <div class="bg-teal-50 border border-teal-200 rounded-lg p-4 hover:shadow-md transition-shadow" data-action="upgrade-brevo">
      <h3 class="text-sm font-bold text-teal-900">
        Tasks
      </h3>
      <p class="text-[9px] bg-teal-200 text-teal-800 px-1 rounded w-max mb-2 uppercase">Adjust design</p>
      <p class="text-xs text-teal-700">
 Only display 1 step at a time. Reduce size of 'abandon' button. Auto adjust video size to screen size.     
      </p>
    </div>


    <!-- Admin Dash -->
    <div class="bg-teal-50 border border-teal-200 rounded-lg p-4 hover:shadow-md transition-shadow" data-action="upgrade-brevo">
      <h3 class="text-sm font-bold text-teal-900">
        Admin Dash
      </h3>
      <p class="text-[9px] bg-teal-200 text-teal-800 px-1 rounded w-max mb-2 uppercase">Redesign</p>
      <p class="text-xs text-teal-700">
The current design was a prediction of what would be needed. Update it to what we actually need. 
      </p>
    </div>


    <!-- myDash -->
    <div class="bg-teal-50 border border-teal-200 rounded-lg p-4 hover:shadow-md transition-shadow" data-action="upgrade-brevo">
      <h3 class="text-sm font-bold text-teal-900">
        Display survey cards
      </h3>
      <p class="text-[9px] bg-teal-200 text-teal-800 px-1 rounded w-max mb-2 uppercase">Choose more surveys</p>
      <p class="text-xs text-teal-700">
Display task cards has code to allow the user to see and self-assign tasks. Copy paste and adapt that code from display task cards and apply it to display survey cards so that the user can see and self assign surveys.
      </p>
    </div>

    <!-- Bug Fix -->
    <div class="bg-teal-50 border border-teal-200 rounded-lg p-4 hover:shadow-md transition-shadow" data-action="upgrade-brevo">
      <h3 class="text-sm font-bold text-teal-900">
        Bug fix
      </h3>
      <p class="text-[9px] bg-teal-200 text-teal-800 px-1 rounded w-max mb-2 uppercase">Read the bug reports and choose some to fix</p>
      <p class="text-xs text-teal-700">
The Notes system has bug reports. However one bug report is that you can't read bug reports. This is because notes are filtered based on whether they are addressed to you or from you. (You don't see other notes that don't connect to you) This makes it impossible to see bug reports that aren't addressed to you. A way around this is for the owner to do an sql search.
      </p>
    </div>


    <!-- Notes -->
    <div class="bg-teal-50 border border-teal-200 rounded-lg p-4 hover:shadow-md transition-shadow" data-action="upgrade-brevo">
      <h3 class="text-sm font-bold text-teal-900">
        Bug fix - Notes
      </h3>
      <p class="text-[9px] bg-teal-200 text-teal-800 px-1 rounded w-max mb-2 uppercase">Read the bug reports and choose some to fix</p>
      <p class="text-xs text-teal-700">
You can't read bug reports. This is because notes are filtered based on whether they are addressed to you or from you. (You don't see other notes that don't connect to you) This makes it impossible to see bug reports that aren't addressed to you. A way around this is for the owner to do an sql search.
This is a bigger problem that senior admin cannot access all of the notes because they are also limited by the filtering rules. This needs to be considered and solved.
</p>
    </div>




  </div>
</section>


        </div>
${petitionBreadcrumbs()}
`;
}

export function render(panel, petition = {}) {
    panel.innerHTML = getTemplateHTML();
}