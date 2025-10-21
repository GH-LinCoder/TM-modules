// ./work/dash/displayMyRelations.js (modified for student view)
import { appState } from '../../state/appState.js';
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';
import { petitionBreadcrumbs } from'../../ui/breadcrumb.js';

console.log('displayRelations.js loaded');

const userId = appState.query.userId;

export function render(panel, query = {}) {
    console.log('displayRelations.render()', panel, query);
    
    const display = new RelationsDisplay();
    display.render(panel, query);
}

class RelationsDisplay {
    constructor() {
        this.studentId = null;
    }

    async render(panel, query = {}) {
        console.log('RelationsDisplay.render()', panel, query);
        
        // Get student ID from clipboard or query
        this.studentId = this.getCurrentStudentId(query);
        
        if (!this.studentId) {
            panel.innerHTML = this.getNoStudentHTML();
            return;
        }
        
        panel.innerHTML = this.getTemplateHTML();
        await this.loadAndDisplayRelations(panel);
        
        // Setup clipboard update listener for student changes
        onClipboardUpdate(() => {
            const newStudentId = this.getCurrentStudentId(query);
            if (newStudentId !== this.studentId) {
                this.studentId = newStudentId;
                this.loadAndDisplayRelations(panel);
            }
        });
    }

    getCurrentStudentId(query = {}) { //Ther is no such thing as query.studentId   I wish we could stick to reality
        // Priority: query.studentId > clipboard student > default user
        if (query.studentId) return query.studentId;
        
        const clipboardStudents = getClipboardItems({ as: 'student' });
        if (clipboardStudents.length > 0) {
            return clipboardStudents[0].entity.id;
        }
        
        // Fallback to current user (for self-view)
        return appState.query.userId;
    }

    getTemplateHTML() {
        return `
            <div id="relationsDisplay" class="relations-display relative z-10 flex flex-col h-full">
                <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 z-10 max-h-[90vh] overflow-y-auto">
                    <div class="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h3 class="text-xl font-semibold text-gray-900">My Relations 🖇️</h3>
                        <button data-action="close-dialog" class="text-gray-500 hover:text-gray-700" aria-label="Close">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 class="font-medium text-blue-800 mb-2">Relationships</h4>
                        <p class="text-blue-700 text-sm">
                            These are the relationships you have with other parts of the organisation.
                            Some were created automatically when you responded to surveys or completed tasks.
                            Others may have been created by administrators or yourself.
                        </p>
                    </div>

                    <div class="bg-gray-200 p-6 space-y-6">
                        <div id="relationsContainer" class="space-y-4">
                            <!-- Relations will be loaded here -->
                            <div class="text-center py-8 text-gray-500" data-placeholder="loading">
                                Loading relationships...
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            ${petitionBreadcrumbs()}
        `;
    }

    getNoStudentHTML() {
        return `
            <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 z-10 max-h-[90vh] overflow-y-auto p-6">
                <div class="text-center py-8 text-red-500">
                    <p>No student selected. Please select a student first.</p>
                </div>
            </div>
        `;
    }

    async loadAndDisplayRelations(panel) {
        const container = panel.querySelector('#relationsContainer');
        if (!container) return;
        
        try {
            // Load relations for this specific student
            const relations = await executeIfPermitted(
                userId, 
                'readApprofileRelationships', 
                {  approfileId: this.studentId }
            );
            
            if (!relations || relations.length === 0) {
                container.innerHTML = this.getNoRelationsHTML();
                return;
            }
            
            // Display relations using existing logic (modified for student view)
            this.displayRelations(panel, relations, this.studentId);
            
        } catch (error) {
            console.error('Error loading relations:', error);
            container.innerHTML = `
                <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <p class="text-red-800">Failed to load relationships: ${error.message}</p>
                </div>
            `;
        }
    }

    displayRelations(panel, relationsData, studentId) {
        const container = panel.querySelector('#relationsContainer');
        if (!container) return;
        
        const { is: isRelationships, of: ofRelationships } = relationsData;
        
        if ((!isRelationships || isRelationships.length === 0) && 
            (!ofRelationships || ofRelationships.length === 0)) {
            container.innerHTML = this.getNoRelationsHTML();
            return;
        }
        
        // Group and sort relationships (reuse existing logic)
        const groupedIs = this.groupRelationships(isRelationships);
        const groupedOf = this.groupRelationships(ofRelationships);
        
        let html = '';
        
        // IS SECTION (student IS related TO others)
        if (groupedIs.length > 0) {
            html += `
                <div class="section bg-white p-4 rounded-lg border border-gray-300 mb-6">
                    <div class="section-title text-lg font-semibold mb-3 text-center text-blue-800">
                        I am related to:
                    </div>
            `;
            
            groupedIs.forEach(group => {
                html += `
                    <div class="relationship-group mb-4">
                        <h4 class="text-md font-medium text-blue-600 mb-2">${group.relationship}</h4>
                `;
                
                group.items.forEach(rel => {
                    const subject = rel.approfile_is_name || 'Unknown';
                    const object = rel.of_approfile_name || 'Unknown';
                    html += `
                        <div class="relationship-item flex items-center justify-between p-3 bg-blue-50 rounded border mb-2">
                            <div class="flex-1">
                                <span class="font-medium">${object}</span>
                                <span class="text-sm text-gray-600 ml-2">(${rel.relationship})</span>
                            </div>
                            <div class="text-xs text-gray-500">
                                Since: ${new Date(rel.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    `;
                });
                
                html += `</div>`;
            });
            
            html += `</div>`;
        }
        
        // OF SECTION (others ARE related TO student)
        if (groupedOf.length > 0) {
            html += `
                <div class="section bg-white p-4 rounded-lg border border-gray-300">
                    <div class="section-title text-lg font-semibold mb-3 text-center text-green-800">
                        Others related to me:
                    </div>
            `;
            
            groupedOf.forEach(group => {
                html += `
                    <div class="relationship-group mb-4">
                        <h4 class="text-md font-medium text-green-600 mb-2">${group.relationship}</h4>
                `;
                
                group.items.forEach(rel => {
                    const subject = rel.approfile_is_name || 'Unknown';
                    const object = rel.of_approfile_name || 'Unknown';
                    html += `
                        <div class="relationship-item flex items-center justify-between p-3 bg-green-50 rounded border mb-2">
                            <div class="flex-1">
                                <span class="font-medium">${subject}</span>
                                <span class="text-sm text-gray-600 ml-2">(${rel.relationship})</span>
                            </div>
                            <div class="text-xs text-gray-500">
                                Since: ${new Date(rel.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    `;
                });
                
                html += `</div>`;
            });
            
            html += `</div>`;
        }
        
        container.innerHTML = html;
        
        // Add click listeners for exploration (if needed)
        this.attachRelationClickListeners(panel);
    }

    groupRelationships(rels) {
        const groups = {};
        rels.forEach(rel => {
            const relType = rel.relationship;
            if (!groups[relType]) groups[relType] = [];
            groups[relType].push(rel);
        });
        
        // Sort relationship types alphabetically
        return Object.keys(groups)
            .sort()
            .map(relType => ({
                relationship: relType,
                items: groups[relType]
            }));
    }

    attachRelationClickListeners(panel) {
        // Add click listeners for exploring related approfiles (if desired)
        const relationItems = panel.querySelectorAll('.relationship-item');
        relationItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const relationElement = e.target.closest('.relationship-item');
                if (relationElement) {
                    // Extract approfile ID from data attributes or text
                    // This would trigger exploration of the clicked approfile
                    console.log('Relation clicked - exploration functionality can be added here');
                }
            });
        });
    }

    getNoRelationsHTML() {
        return `
            <div class="text-center py-8 text-gray-500 bg-white rounded-lg border">
                <p>No relationships found.</p>
                <p class="text-sm mt-2">Your responses to surveys and completion of tasks may create relationships automatically.</p>
            </div>
        `;
    }
}