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
                                <span data-user="email">????.???@example.com</span>
                                <span data-user="mid"><b>ID:</b> <span data-user="student-id">???</span></span>       
                                <span ><b>Joined:</b><span data-user="join-date"> ???? ?? ??</span></span>
                                <span data-user="last-login"><b>Last login:</b> ??:?? PM ???? ?? ??</span>
                            </div>
                            
                            <button 
                                class="w-full border border-gray-300 rounded-lg py-2 text-sm font-medium hover:bg-gray-50"
                                data-action="edit-profile">
                                Edit <span class="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm" data-user="role">my</span> Profile
                            </button>
                        </div>
                    </div>
                </div>
                

<!--  INSTRUCTIONS   -->                           
                    <div class="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                       <h4 class="text-ml font-bold text-blue-500 mb-4">my Dashboard</h4>
                       <ul class="list-disc list-inside mt-2 text-sm text-blue-500">
                       <li>At the top are your basic details which you can edit. 'My profile'</li>
                       <li>Next are some summary statistics of things you have done or are doing. 'Quick Stats'</li>
                       <li>next are things that you may want to do often 'Quick Acts'</li>
                        <li> One of our mottoes is: "Have your say, do your bit."</li>
                        <li> We use surveys as a key part of both those things. 'Have your say'</li>
                        <li> You may see surveys in the section below</li>
                        <li> Doing your bit often involves tasks in another section below. 'Do your bit' </li>
                        <li>The other motto is 'No one is an island'. You can see your relations with groups, volunteers, events & organisations. </li>
                      <li>If you are on a task you are referred to as 'the student'. If you manage a task looking after another student you are referred to as 'the manager'</li>
                      <li>There is a section for any tasks where you are the manager. </li>
                        </ul>  
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
                <div data-section="surveys-section" class="bg-gray-50 rounded-lg shadow p-6 border border-gray-500">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-2xl font-bold">Have your say (surveys)</h2>
                        <div class="flex gap-2" class="border border-red-200" data-action="display-student-surveys" >
                        </div>
                    
                    <div class="bg-orange-100 space-y-6" data-list="my-surveys">
                        <!-- Surveys will be loaded here dynamically -->
                    </div>

                    </div>
                </div>
                
                <!-- TASKS SECTION -->
                <div data-section="tasks-section" class="bg-blue-100 rounded-lg shadow p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-2xl font-bold">Do your bit (tasks)</h2>
                        <div class="flex gap-2"></div>
                        <!--  INSTRUCTIONS   -->                           
                    <div class="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                       <h4 class="text-ml font-bold text-blue-500 mb-4">Doing my bit through tasks</h4>
                       <ul class="list-disc list-inside mt-2 text-sm text-blue-500">
                       <li>If you have been assigned a task it will apear here</li>
                       <li>You can see what step of the task you are on, and what you have already done.</li>
                       <li>You can message the manager of the task</li>
                        <li> The manager can message you</li>
                        <li> If the task is self-managed you will find how to do that in the other section. You can't move between steps of a task in this section</li>
                        <li> If you have lost all hope you can mark the task as abandoned. This cannot be reversed except by being assigned to the task again.</li>
                        <li> Some tasks are self managed (see below). Some are automated. Some tasks are fully self-contained and some are just a record of some process taking place externally</li>
                        <li> Completion is reached step by step.</li>
                        <li></li>
                      <li>If you are on a task you are referred to as 'the student'. If you also manage the task you are on, that will be shown here, but managed in the other section</li>
                      <li>Moving yourself through a task is done in that other section</li>
                      <li></li>
                        </ul>  
                    </div>

                    </div>

                    <div class="bg-indigo-100 space-y-6" data-list="my-tasks">
                        <!-- Tasks will be loaded here dynamically -->
                                            </div>
                </div>
                
                <!-- RELATIONS SECTION -->
                <div data-section="relations-section">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-2xl font-bold">No one is an island (relations)</h2>
                        <div class="flex gap-2" class="border border-red-200"></div>
                         <!--  INSTRUCTIONS   -->                           
                    <div class="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                       <h4 class="text-ml font-bold text-blue-500 mb-4">How I relate to others</h4>
                       <ul class="list-disc list-inside mt-2 text-sm text-blue-500">
                       <li>If you have been related to another person or a group or a task or some abstract concept here is where you can explore</li>
                       <li>You can see who you have been related to. This may be a person or an interest group or a branch or an unlimited number of things</li>
                       <li>Clicking on whatever you are related to shows who else is connected to that</li>
                        <li>If you find that you aren't connected to much or you seem to be oddly connected to something here is what to do...</li>
                        <li> If you want to be more connected try seeking out surveys to have your say, or assigning yourself to tasks to do your bit. These surveys and tasks are likely to automatically connect you to others</li>
                        <li> If you see connections that you don't think are appropriate, please message an admin.</li>
                        <li> Some relations are automated and may produce unexpected results. Some tasks and many surveys have 'automations' that relate the student based on steps in the task or answers to questions. Everyone should check their relations</li>
                        <li> </li>
                        <li></li>
                      <li>Note that you may have been 'related' to a task. This is different to being assinged to the task. If you are on a task you are referred to as 'the student' and you move through it step by step. However, you could be related to a task because it covers a subject dear to you, or because it is a task that you created, or have completed.</li>
                      <li></li>
                      <li></li>
                        </ul>  
                    </div>
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

<!--  INSTRUCTIONS   -->                           
                    <div class="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                       <h4 class="text-ml font-bold text-blue-500 mb-4">Doing my bit as a manager</h4>
                       <ul class="list-disc list-inside mt-2 text-sm text-blue-500">
                       <li>If you have been appointed as a manger of a task, all those tasks and students will appear here</li>
                       <li>You can see what step of the task each student is on.</li>
                       <li>You can message the student</li>
                        <li> The student can message you</li>
                        <li> You can move the student to the next step of the task</li>
                        <li> You can mark the task as abandoned by that student</li>
                        <li> When you judge that the student has finished the final step, moving forward marks the task as completed</li>
                        <li>You can't jump straight to 'completed,' this can only be reached step by step.</li>
                        <li>Once abandoned, the only way to recover is to assign the task again</li>
                      <li>If you are on a task you are referred to as 'the student'. If you also manage the task you are on, that will be shown here</li>
                      <li>Moving yourself through a task is done in this section</li>
                      <li></li>
                        </ul>  
                    </div>

<!--the module injects cards here on a white background -->

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
        return  appState.query.userId;
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
            const studentJoinedEl = panel.querySelector('[data-user="join-date"]');

            //Needs joined
            //needs last login - not got sessions yet oct 23
            
            if (nameEl) nameEl.textContent = studentProfile.name || 'Unknown';
            if (emailEl) emailEl.textContent = studentProfile.email || 'No email';
            if (studentIdEl) studentIdEl.textContent = this.currentStudentId.substring(0, 8) + '...';
            if (studentJoinedEl) studentJoinedEl.textContent = studentProfile.created_at.substring(0, 10) || 'error';
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
                id: this.currentStudentId, // Why refering to this person as currentStudent???
                name: 'Current Person',   // this should be the actual current student name shouldn't it?
                type: 'app-human'  
            },
            as: 'student',  // WHY ???  This may be okay for listing tasks, but not so good for when treating as manager
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