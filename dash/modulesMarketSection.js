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
            <h3 class="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 border-b pb-1">Content & Collaboration</h3>
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
            <h3 class="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 border-b pb-1">Data & Finance</h3>
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
            <h3 class="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 border-b pb-1">Operations & Measurement</h3>
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
            <h3 class="text-xs font-bold uppercase tracking-widest text-blue-600 mb-4">Graph & Relation Mapping</h3>
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
            </div>
        </section>


        </div>
</div>
${petitionBreadcrumbs()}
`;
}

export function render(panel, petition = {}) {
    panel.innerHTML = getTemplateHTML();
}