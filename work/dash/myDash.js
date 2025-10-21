// ./work/dash/myDash.js
import { appState } from '../../state/appState.js';
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { petitionBreadcrumbs } from '../../ui/breadcrumb.js';
import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';
import { icons } from '../../registry/iconList.js';

console.log('myDash.js loaded');

const userId = appState.query.userId;

export function render(panel, query = {}) {
    console.log('myDash.render(', panel, query, ')');
    
    // Render the container structure
    panel.innerHTML = getTemplateHTML();
    
    // Initialize the dashboard
    const display = new MyDashboard();
    display.init(panel, query);
}

function getTemplateHTML() {
    return `
        <!-- DASHBOARD CONTAINER STRUCTURE -->
        <div class="my-dashboard bg-gray-100 min-h-screen" data-module="myDash" data-destination='new-panel'>
            
            <!-- DASHBOARD HEADER -->
            <div class="px-6 py-4 border-b bg-green-200 flex justify-between items-center">
                <div class="name" title="Toggle between admin & my dashboard">
                    <!--div class="text-sm text-blue-600 hover:underline" data-action="toggle-dash">my/Admin</div-->
                </div>
                
                <div>
                    <h1 class="text-2xl font-bold" data-dash-title="admin">My Dashboard</h1>
                    <p class="text-sm text-gray-500" data-dash-sub_title="my">Check my tasks, update my details, manage my students...</p>
                </div>
                <!--button class="text-sm text-blue-600 hover:underline" onclick="signOut()">Sign out</button-->
            </div>
            
            <div class="container mx-auto px-4 py-8 flex flex-col gap-8">
                
                <!-- PROFILE CARD -->
                <div class="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row items-center md:items-start gap-8" data-component="profile-card">
                    <div class="flex-shrink-0 text-center">
                        <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-semibold" data-user="avatar">
                            <span data-user="initials">JD</span>
                        </div>
                        <h6 class="text-xl font-semibold" data-user="name">data-user=name</h6>
                    </div>
                    
                    <div class="flex-1 space-y-4">
                        <div class="space-y-3 text-sm text-gray-600">
                            <div class="flex items-center gap-2 flex-wrap">
                                <span data-user="email">john.doe@example.com</span>
                                <span data-user="mid"><b>ID:</b> <span data-user="student-id">1c8557ab...</span></span>       
                                <span data-user="join-date"><b>Joined:</b> 24 August 2025</span>
                                <span data-user="last-login"><b>Last login:</b> 2:30 PM 24 August 2025</span>
                            </div>
                            
                            <button 
                                class="w-full border border-gray-300 rounded-lg py-2 text-sm font-medium hover:bg-gray-50"
                                data-action="edit-profile">
                                Edit <span class="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm" data-user="role">my</span> Profile
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- QUICK STATS -->
                <div class="bg-blue-200 rounded-lg shadow p-6" data-section="quick-stats" data-destination="quick-stats">
                    <h2 class="text-lg font-semibold mb-2">Quick Stats</h2>
                    <p class="text-sm text-gray-500 mb-4">Summaries: Click for details. Click card again to close.</p>
                    <div class="grid md:grid-cols-3 lg:grid-cols-4 gap-6" id="stats-cards">
                        <div class="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center" data-stat="active-tasks">
                            <div class="p-2 bg-blue-100 rounded-lg mr-3">
                                <div class="w-6 h-6"><p class="text-2xl font-bold" data-value="active-tasks">?</p></div>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500">Active Tasks</p>
                                <p class="text-xs text-gray-500">Currently in progress</p>
                            </div>
                        </div>
                        
                        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center" data-stat="completed-tasks">
                            <div class="p-2 bg-green-100 rounded-lg mr-3">
                                <div class="w-6 h-6"><p class="text-2xl font-bold" data-value="completed-tasks">?</p></div>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500">Completed Tasks</p>
                                <p class="text-xs text-gray-500">Successfully finished</p>
                            </div>
                        </div>
                        
                        <div class="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center" data-stat="abandoned-tasks">
                            <div class="p-2 bg-red-100 rounded-lg mr-3">
                                <div class="w-6 h-6"><p class="text-2xl font-bold" data-value="abandoned-tasks">?</p></div>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500">Abandoned Tasks</p>
                                <p class="text-xs text-gray-500">Previously stopped</p>
                            </div>
                        </div>
                        
                        <div class="bg-white rounded-lg shadow p-4 flex items-center" data-stat="available-surveys">
                            <div class="p-2 bg-indigo-100 rounded-lg mr-3">
                                <div class="w-6 h-6"><p class="text-2xl font-bold" data-value="available-surveys">?</p></div>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500">Surveys</p>
                                <p class="text-xs text-gray-500">Ready to be answered</p>
                            </div>
                        </div>
                        
                        <div class="bg-white rounded-lg shadow p-4 flex items-center" data-stat="available-tasks">
                            <div class="p-2 bg-indigo-100 rounded-lg mr-3">
                                <div class="w-6 h-6"><p class="text-2xl font-bold" data-value="available-relations">?</p></div>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500">Relations</p>
                                <p class="text-xs text-gray-500">My connections</p>
                            </div>
                        </div>
                        
                        <div class="bg-white rounded-lg shadow p-4 flex items-center" data-stat="available-rewards">
                            <div class="p-2 bg-indigo-100 rounded-lg mr-3">
                                <div class="w-6 h-6"><p class="text-2xl font-bold" data-value="available-rewards">?</p></div>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500">Rewards</p>
                                <p class="text-xs text-gray-500">My rewards</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- QUICK ACTS -->
                <div class="bg-red-100 rounded-lg shadow p-6" data-section="quick-acts" data-destination="quick-acts">
                    <h2 class="text-lg font-semibold mb-2">Quick Acts</h2>
                    <p class="text-sm text-gray-500 mb-4">Fast access to common tasks. (Click the card again to close)</p>
                    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 cursor-pointer hover:shadow-md" data-action="invite-friend-dialogue">
                            <h3 class="text-sm font-medium text-yellow-500">Invite a friend</h3>
                            <p class="text-xs text-gray-500">Let some you know, know somthing you know that they should know to know.</p>
                        </div>
                        
                        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 cursor-pointer hover:shadow-md" data-action="recruit-link-dialogue">
                            <h3 class="text-sm font-medium text-yellow-700">Copy recruit link</h3>
                            <p class="text-xs text-gray-500">If you email this link and that person joins you will get thanks for being the recruiter</p>
                        </div>
                        
                        <div class="bg-red-50 border border-green-200 rounded-lg p-4 cursor-pointer hover:shadow-md" data-action="check-rewards-dialogue">
                            <h3 class="text-sm font-medium text-green-700">Check Rewards</h3>
                            <p class="text-xs text-gray-500">When doing your bit there may be rewards</p>
                        </div>
                        
                        <div class="bg-green-50 border border-blue-200 rounded-lg p-4 cursor-pointer hover:shadow-md" data-action="update-approfile-dialogue">
                            <h3 class="text-sm font-medium text-yellow-500">Update Details</h3>
                            <p class="text-xs text-gray-500">Your details are held in your approfile.</p>
                        </div>
                        
                        <div class="bg-green-50 border border-blue-200 rounded-lg p-4 cursor-pointer hover:shadow-md" data-action="local-support-dialogue">
                            <h3 class="text-sm font-medium text-blue-700">Contact local support</h3>
                            <p class="text-xs text-gray-500">This is to message the support from within your organisation. (For support from the suppliers of the software please ask via the admin dash or ask admin to make contact</p>
                        </div>
                    </div>
                </div>
                
                <!-- SURVEYS SECTION -->
                <div data-section="surveys-section">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-2xl font-bold">Surveys (have your say)</h2>
                        <div class="flex gap-2" class="border border-red-200"></div>
                    </div>
                    <div class="bg-orange-100 space-y-6" data-list="my-surveys">
                        <!-- Surveys will be loaded here dynamically -->
                        <div class="text-center py-8 text-gray-500" data-placeholder="loading">
                            Surveys that I can reply to would be loaded here...
                        </div>
                    </div>
                </div>
                
                <!-- TASKS SECTION -->
                <div data-section="tasks-section">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-2xl font-bold">Tasks (do your bit)</h2>
                        <div class="flex gap-2"></div>
                    </div>
                    <div class="bg-indigo-100 space-y-6" data-list="my-tasks">
                        <!-- Tasks will be loaded here dynamically -->
                                            </div>
                </div>
                
                <!-- RELATIONS SECTION -->
                <div data-section="relations-section">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-2xl font-bold">Relations (no one is an island)</h2>
                        <div class="flex gap-2" class="border border-red-200"></div>
                    </div>
                    <div class="bg-orange-100 space-y-6" >
                        <!-- Relations will be loaded here dynamically -->

                    </div>
                </div>
                
                <!-- STUDENTS SECTION -->
                <div data-section="students-section">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-2xl font-bold">My Students</h2>
                    </div>
                    <div class="bg-green-100 rounded-lg shadow p-12 text-center" data-placeholder="no-students">
                        <h3 class="text-lg font-semibold mb-2">No Students Assigned</h3>
                        <p class="text-gray-500 mb-4">I could become a manager to monitor student tasks.</p>
                    </div>
                </div>
            </div>
        </div>
        
        ${petitionBreadcrumbs()}
    `;
}

class MyDashboard {
    constructor() {
        this.currentStudentId = null;
    }
    
    init(panel, query = {}) {
        console.log('MyDashboard.init()', panel, query);
        
        // Get current student ID
        this.currentStudentId = this.getCurrentStudentId();
        console.log('Current student ID:', this.currentStudentId);
        
        // Load profile data
        this.loadStudentProfile(panel);
        
        // Load all sections via petition system
        this.loadDashboardSections(panel);
        
        // Set up clipboard update listener
        onClipboardUpdate(() => {
            this.currentStudentId = this.getCurrentStudentId();
            this.loadStudentProfile(panel);
            this.loadDashboardSections(panel);
            
        });
        
        // Attach event listeners
        this.attachListeners(panel);
    }
    
    getCurrentStudentId() {
        const clipboardStudents = getClipboardItems({ as: 'student', type: 'app-human' });
        const clipboardOther = getClipboardItems({ as: 'other', type: 'app-human' });
        
        if (clipboardStudents.length > 0) {
            return clipboardStudents[0].entity.id;
        }
        if (clipboardOther.length > 0) {
            return clipboardOther[0].entity.id;
        }
        
        // Fallback to DEV student ID
        return '1c8557ab-12a5-4199-81b2-12aa26a61ec5';
    }
    
    async loadStudentProfile(panel) {
        try {
            const studentProfile = await executeIfPermitted(
                userId,
                'readApprofileById',
                { approfileId: this.currentStudentId }
            );
            
            if (!studentProfile) return;
            
            // Update profile card
            const nameEl = panel.querySelector('[data-user="name"]');
            const emailEl = panel.querySelector('[data-user="email"]');
            const initialsEl = panel.querySelector('[data-user="initials"]');
            const studentIdEl = panel.querySelector('[data-user="student-id"]');
            
            if (nameEl) nameEl.textContent = studentProfile.name || 'Unknown';
            if (emailEl) emailEl.textContent = studentProfile.email || 'No email';
            if (studentIdEl) studentIdEl.textContent = this.currentStudentId.substring(0, 8) + '...';
            
            // Set initials
            if (initialsEl && studentProfile.name) {
                const initials = studentProfile.name
                    .split(' ')
                    .map(word => word[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase();
                initialsEl.textContent = initials;
            }
            
        } catch (error) {
            console.error('Error loading student profile:', error);
        }

          // Update stats after profile loads
    await this.updateQuickStats(panel);
    }
    
//async readStduentAssignments()



    async updateQuickStats(panel) {
        console.log('updateQuickStats()');
        
        try {
            // Get all assignments for current student
            const assignments = await executeIfPermitted(
                userId, 
                'readStudentAssignments', 
                { student_id: this.currentStudentId }
            );
            
            if (!assignments || assignments.length === 0) {
                this.setStatsValues(panel, 0, 0, 0, 0, 0, 0);
                return;
            }
            
            // Count different assignment types
            const activeTasks = assignments.filter(a => a.step_order >= 3).length;
            const completedTasks = assignments.filter(a => a.step_order === 2).length;
            const abandonedTasks = assignments.filter(a => a.step_order === 1).length;
            
            // Get surveys (when implemented)
            
            const surveys = await this.getAssignedSurveys();
            const availableSurveys = surveys?.length || 0;
        

            // Get relations (when implemented)    // THIS CAN'T WORK. NO SUCH FUNCTION. displayRelations handles this as a loadable module.
  //          const relations = await this.getStudentRelations();
  //          const availableRelations = relations?.length || 0;
            
            // Update stats display
            this.setStatsValues(panel, activeTasks, completedTasks, abandonedTasks, availableSurveys, 0);
            
        } catch (error) {
            console.error('Error updating quick stats:', error);
            this.setStatsValues(panel, 0, 0, 0, 0, 0, 0);
        }
    }
    

    // In displaySurveys.js:
async getAssignedSurveys() {
    try {
        const studentId = this.getCurrentStudentId();
        if (!studentId) return [];
        
        // Read from task_assignments where survey_header_id is not null
        const { data, error } = await executeIfPermitted(
            appState.query.userId,
            'readStudentAssignments', 
            { student_id: studentId }
        );
        
        if (error) throw error;
        return data || [];
        
    } catch (error) {
        console.error('Error getting assigned surveys:', error);
        return [];
    }
}

// In displayTasks.js:  NO SUCH FUNCTION  - the module that knows how to do this is displayRelations and it loads. It isn't a callable function
async getStudentRelations() {
    try {
        const studentId = this.getCurrentStudentId();
        if (!studentId) return { is: [], of: [] };
        
        // Read relationships for this student
        const { data, error } = await executeIfPermitted(
            appState.query.userId,
            'readApprofileRelationships',
            { student_id: studentId }
        );
        
        if (error) throw error;
        return data || { is: [], of: [] };
        
    } catch (error) {
        console.error('Error getting student relations:', error);
        return { is: [], of: [] };
    }
}


    setStatsValues(panel, active, completed, abandoned, surveys, relations, rewards) {
        const stats = {
            'active-tasks': active,
            'completed-tasks': completed, 
            'abandoned-tasks': abandoned,
            'available-surveys': surveys,
            'available-relations': relations,
            'available-rewards': rewards
        };
        
        Object.entries(stats).forEach(([statId, value]) => {
            const el = panel.querySelector(`[data-value="${statId}"]`);
            if (el) el.textContent = value;
        });
    }


    loadDashboardSections(panel) {
        console.log('loadDashboardSections()');
        
        // Store student ID in clipboard for child modules
        appState.clipboard = [{
            entity: {
                id: this.currentStudentId,
                name: 'Current Student',
                type: 'app-human'
            },
            as: 'student',
            meta: {
                timestamp: Date.now(),
                source: 'myDash'
            }
        }];
        
        // Load each section via petition system
        this.loadSection('surveys', panel);
        this.loadSection('tasks', panel);
        this.loadSection('relations', panel);
        this.loadSection('students', panel);
    }
    
    loadSection(sectionName, panel) {
        console.log('loadSection()', sectionName);
        
        // Create petition for this section
        const petition = {
            Module: 'myDash',
            Section: sectionName,
            Action: `display-${sectionName}`,
            Destination: `${sectionName}-section`,
            student: this.currentStudentId
        };
        
        // Signal state change to load module
        appState.setPetitioner(petition);
        console.log(`Loading ${sectionName} section via petition:`, petition);
    }
    
    attachListeners(panel) {
        console.log('attachListeners()');
        
        // Quick action buttons
        panel.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.closest('[data-action]')?.dataset.action;
                if (action) {
                    this.handleQuickAction(action, panel);
                }
            });
        });
        
        // Profile edit button
        panel.querySelector('[data-action="edit-profile"]')?.addEventListener('click', () => {
            this.handleEditProfile(panel);
        });
    }
    
    handleQuickAction(action, panel) {
        console.log('handleQuickAction()', action);
        
        // Create petition for quick action
        const petition = {
            Module: 'myDash',
            Section: 'quick-acts',
            Action: action,
            Destination: 'dialog'
        };
        
        // Signal state change to load module
        appState.setPetitioner(petition);
        console.log(`Loading quick action via petition:`, petition);
    }
    
    handleEditProfile(panel) {
        console.log('handleEditProfile()');
        
        // Create petition for profile editing
        const petition = {
            Module: 'myDash',
            Section: 'profile',
            Action: 'edit-profile',
            Destination: 'dialog',
            student: this.currentStudentId
        };
        
        // Signal state change to load module
        appState.setPetitioner(petition);
        console.log(`Loading profile edit via petition:`, petition);
    }
}