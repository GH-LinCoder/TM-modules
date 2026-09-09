(./copilot-instructions.md file size =~ 1,700 words. Possibly 2,300 tokens. Updated 10:30 Sept 8 2026)
a simpler context file is available at `./projectContext.md`


# Prime Directive for AI:

    You are an expert Vanilla JavaScript and Supabase developer. You must strictly adhere to the 'Petition' routing system described below. NEVER bypass executeIfPermitted() for database operations, and NEVER assume a React/Vue component lifecycle. All UI must be injected and cleaned up properly."

# AI Agent Instructions for TM-modules
## 001 The project
An organizational OS focused on tasks, surveys and relationship management. A platform that enables loosely connected humans to build and self-manage an organization. The fledgling organization builds its own tasks, surveys and structure using the platforms tools. The tasks and surveys can spawn other tasks and surveys to create automated funnels & workflows. Relationships between tasks, surveys, people and abstrct concepts can be specified via choose and click interfaces and visulaised through node-edge graphs.

## 002 Three Core Domain Workflows summary
1. **Tasks & Steps** — Create tasks with multiple steps. Each step can spawn automated code execution of selected actions
2. **Surveys** — User selection of a survey answer can trigger automated code execution for conditional workflows.
3. **Relations & Hierarchy** — Every person, task & survey is represented by a unqique identifier called an 'appro'. Admin can also create any number of appros to represent anything of importance to the organisation. Admin can relate any appro with any other appro to create structure that can be visualised. Thus creating organizational hierarchies and structures.

## 003 Key features
Key features include task creation/assignment (with code branching), survey-driven workflows, relationship/hierarchy visualization, and member subscriptions.

### 004 Three Core Domain Workflows details
1. **Tasks & Steps** — Create tasks with multiple steps. Each step can branch execution based on decisions (manually or via surveys). Tasks can be educational courses, to-do lists where each step represents what to do next, or progress registers where eachstep is a passive record of how far something has progressed. Each step can trigger any number of predetermined code executions. As at Sept 6th 2026 there are only 3 predetermined code 'automations': Assign a task to the user, assign a survey to the user, relate the user to a specific appro. Other are to bedeveloped.
2. **Surveys** — Survey responses can also trigger code execution dependent on which answer the user clicks. This enables surveys to be used to create funnels or decision points. A user can be related to another appro that represents that decision such as an appro that represents a group. Also spawning tasks or surveys allow for the creation of funnels, driving conditional workflows
3. **Relations & Hierarchy** — Define and visualize relationships between persons, creating organizational hierarchies and structures. Appros can represent anything of importance to the organization, and relationships can be established between any appro, enabling complex organizational structures to be built and visualized.

## 005 Architecture Overview

**Core Layers:**
1. **`flexmain.js`** — Central orchestrator: state change → panel management → module loading/rendering
2. **`state/appState.js`** — Single source of truth for all application state, including user context and pending actions
3. **`registry/`** — Two separate registries:
   - `registryLoadModule.js`: Maps action names → lazy-loaded UI modules (work, dash, etc.)
   - `registryWorkActions.js`: Maps data actions → handler functions with metadata (tables, columns, type)
4. **`db/`** — Database abstraction layer (Supabase-based):
   - `supabase.js`: Singleton client factory
   - `executeIfPermitted.sql`: User permissions. Supabase function that decides if the current authUser has permission on the current table and operation. This is checked by lookup tables where every regisrty function is listed with the permission that is required for it to be executed & the appro that repesents generic permission for that function.
   -`permission_judge.sql` : Ignores User permissions. Decides whether this action has been assigned to this user.   if Supabase function for automations (the code to be exectuted from a task-step or from a survey-answer) This does NOT depend on the user's permissions. The 'judge' checks if the details sent to it by the automation match any assignment that the user has. If there is a matching assignment to do this action on this table by this user, then the judge returns true so that the automation can be executed. This to try to prevent malicious code executing actions. 

## 006 Module loading:**
```
User clicks an HTML element where there are the following attributes (data-module, data-action, data-section, data-destination)
  ↓
Listener extracts what we call the 'petition'  {Module, Section, Action, Destination}
  ↓
appState.query.petitioner = petition (+ history tracking in appState.query.petitionHistory)
  ↓
state-change event → flexmain.js openClosePanelsByRule()
  ↓
registry maps action → loads module (lazy import)
  ↓
Module renders into display area (section-based or new-panel) Varies based on large or small screen


Click → Petition → appState → state-change → flexmain → registryLoadModule → module.render()

```

## 007 User interfaces

The landing page is organise.html which is the only page other than the login page in the app. It displays a logo, name of the organisation, and a horizontal menu of buttons. (This is hidden behind a 'hamburger' icon in small screens.) The script that immediately runs (flexmain.js) loads various modules into sections of the page. 

The first menu button, if clicked, closes the 'my Dash' dashboard and loads the 'admin dash' (adminDash) dashboard which gives access to various modules.

Any visitor can see both dashboards, but to see data or touch the database the visitor needs to be logged-in, authenticated & have been granted specific permissions.


### 008 **Module Loading & Rendering**
- **Modules**: All Export a `render(panel, query)` function
- **All modules are lazy-imported from registryLoadModule.js**: `() => import('../path/to/module.js')`
- **Rendering destination**: Determined by `appState.query.petitioner.Destination`:
  - A section name (e.g., 'task-management') → renders into `[data-section="task-management"]`
  - 'new-panel' → renders into `[data-panel="inject-here"]` (Small screens always load into the current dashboard area, larger screens sometimes load to the right of the dashboard with flex of widths)

### 009 **Database Access & permissions**
- **No direct SQL or API queries from client**: All database access routes for a user go through a single js function`executeIfPermitted(userId, action, payload)` which calls the API. (RLS then calls the rpc is_permitted that determines if the user-table-operation tuplet is permitted)
- **Permission infrastructure exists but needs to be stress tested with multiple users**:

### 010 **Tasks and surveys direct access**
When user clicks an answer to a survey question or moves to a step in a task there may be an automation that executes code. That code probably does something for which the user does not have permission to do. Therefore the `isPermitted` function is not appropriate. Instead the `permission_judge` decides. The automation collects data about the current user and the details of what is to be done and sends that to the `permission_judge` which looks in the `assignments table` for a match to all the sent data. If there is an exact match the judge assumes the request is genuine and returns 'true'. 


### 011  **Permission Tables** 
  - `permission_molecule_required`,  Table stores details of every function that touches the database (requires human intevention to load all newly programmed registry functions - point of failure by ommission if devs forget to regsiter new functions. KNOWN TECH DEBT) 
  - `permission_relationships` Table of every possible permission. For API this is read only. Loading it is done via SQL generated from a javascript script run in a browser which reads a new registry function and determines what actions the function does on which tables. The generator produces sql output with a standard syntax to represent a permission. This sql has to be manually run to store it in the `permission_relationships` table and in the `./auth/permissionsMoleculeGenerator.html` 

-`permissionsMoleculeGenerator` in `./auth/`. Dev copy paste in the input field the new function to be registered. The generator outputs two pieces of SQL. One to write into the `permission_molecule_required` table the special syntax of the permissions that are required for this new function. The other is to write this new function definition into `permission_relationships`
[Note: this is a point of failure & a crude manual system which needs to be automated. KNOWN TECH DEBT]

- `permission_relations` Table stores the specific permissions that any appro has. One row for one permission. Most users will have many rows of these individual permissions because most work requires access to more than one function, but permissions are by individual function not by work or role. [Note: any appro, not just users can be granted permissions. This makes bundles of permissions possible]

### 012 **Permission bundles**

-`Bundles of permissions` This is not a table. Any appro can be granted permissions. This means admin can create an appro (e.g. 'Edit Tasks') then grant that appro the appropriate function permissions to be able to edit tasks. Then when needing to grant those permissions to a user, instead of granting all the function permissions separately, admin treats the appro as a permission and just grants that one. (The software that records permissions resolves that appro to its parts, grants each individual permission and stores the reminder that they are all part of a bundle. This allows later deletion or simpler display)


- There are views which present the above permissions and which can be used to check who has what permission.


### 013. **Data Transfer Between Modules**
Modules do NOT communicate directly with each other. All data transfer happens through `appState`:
- **`petitioner`** — Request object for loading modules/actions (see Petition Object Structure)
- **`clipboard`** — Shared data store for user selections and inter-module data transfer
  - Most modules listen for clipboard changes via state-change events
  - Typical flow: User selects item in display → item added to clipboard → other modules react and update

### 014. **Listener Pattern**
- `listeners/adminListeners.js`: Reads petition from clicked elements
- All elements that are to launch a module have `data-action`, `data-section`, `data-module`, `data-destination` attributes
- Click event → `readPetition()` → `appState.setPetitioner()` → state-change event

## 015 File Organization

``` Produced by tree -d -L 3 > folders.txt
.
├── auth
├── dash (the subsections of dashboards in modules that inject html)
├── db
├── dist
│   └── assets
│       └── logos
├── htmlStubs  (legacy)
├── ideas      (legacy)
├── images     (store of possible art / icons. Not used)
├── js         (legacy)
├── legal
├── listeners
├── notes      (internal messaging and bug report and not taking module)
├── public
│   └── assets
│       └── logos
├── registry   (all db functions and all loading modules pathways, also icons list)
├── rules      (Permissions related)
├── sql
│   ├── functions  
│   ├── sandbox
│   └── tableDefinitions
├── state  (appState definition)
├── surveys (legacy - see below within work for current survey code)
├── ui
├── utils
├── work
   ├── approfiles
   ├── dash    (the myDash and adminDash modules)
   ├── data    (legacy)
   ├── how     (for context beased guides)
   ├── select  (sole function for selecting anything from db)
   ├── student (modules related to persons assigned to a task)
   ├── survey  (Methods of creating, editing, displaying surveys)
   ├── task    (Methods of creating, editing, displaying tasks)
   └── user     (Single function to display new signups - highly restricted permission)

.gitignore
404.html
aims.js
favicon.js
organise.html
flexmain.js
package-lock.json
package.json
plans.js
projectContext.md
vite.config.js
```

## 016 Common Tasks

### Adding a New Feature (e.g., new task management action)
1. **Create handler** in `work/task/yourFeature.js` with `render(panel, query)` export:
   ```javascript
   console.log('yourFeature.js loaded');
   export function render(panel, query) {
     console.log('yourFeature render()', query);
     panel.innerHTML = getTemplateHTML();
     attachListeners(panel);
   }
   function getTemplateHTML() {
     return `<div data-section="your-section"><!-- UI here --></div>`;
   }
   function attachListeners(panel) {
     panel.addEventListener('click', (e) => {
       const action = e.target.closest('[data-action]')?.dataset.action;
       if (action) handleAction(action);
     });
   }
   ```

2. **Register module** in `registry/registryLoadModule.js`:
   ```javascript
   'your-action': () => import('../work/task/yourFeature.js')
   ```

3. **Add data action handler** in `registry/registryWorkActions.js` (if database interaction needed):
   ```javascript
   yourDataAction: {
     metadata: { 
       tables: ['table_name'], 
       columns: ['col1', 'col2'], 
       type: 'SELECT', // or INSERT/UPDATE/DELETE
       requiredArgs: ['param1']
     },
     handler: async (supabase, userId, payload) => {
       const { param1 } = payload;
       const { data, error } = await supabase
         .from('table_name')
         .select('*')
         .eq('id', param1);
       if (error) throw error;
       return data;
     }
   }
   ```

4. **Register permission requirement** in database `permission_molecule_required` table

5. **Add HTML elements** in parent component with correct `data-*` attributes:
   ```html
   <div data-module="adminDash" data-section="your-section" data-destination="your-section">
     <button data-action="your-action">Click me</button>
   </div>
   ```

6. **Test**: 
   - Verify petition flows correctly in console logs
   - Check that module renders to correct destination
   - Verify permissions will be enforced once implementation is complete

### Listening for Clipboard Changes
Modules that respond to user selections should listen for clipboard updates:
```javascript
window.addEventListener('state-change', (event) => {
  if (event.detail.type === 'CLIPBOARD_UPDATE') {
    const selected = appState.query.clipboard;
    // React to selection and update module UI
    updateDisplay(selected);
  }
});
```

### Calling Database Operations
Always use `executeIfPermitted()` to access the database:
```javascript
import { executeIfPermitted } from '../registry/executeIfPermitted.js';

// In your module/handler
const result = await executeIfPermitted(userId, 'yourDataAction', {
  param1: value1,
  param2: value2
});
```

Never access Supabase directly from UI modules. Always route through the registry.

### Modifying Database Access
1. **Never bypass `executeIfPermitted()`** — all DB operations must route through it
2. **Update action handler** in `registryWorkActions.js` (add columns, change table access, etc.)
3. **Update metadata** — ensure `tables` and `columns` arrays accurately reflect what the query accesses
4. **Document function permissions** — add entry to `permission_molecule_required` table and the `permission_relationships` table.by using the `./auth/permissionsMoleculeGenerator.html` 
(Or refactor to be a node.js script that directly accesses the `permission_relations` table
and the `permission_relationships` table.)
5. **Test**: Verify operation completes and returns expected data

### Debugging State Flow
1. **Check console logs** from `flexmain.js`, `appState.js`, `adminListeners.js` for petition & petitioner values
2. **Inspect `appState.query`** in browser DevTools for current state snapshot
3. **Trace `panelsOnDisplay` array** in `flexmain.js` to see which panels are rendered
4. **Check browser Network tab** for Supabase RPC calls (each registered action becomes an RPC call)

### Understanding Petition Flow
Trace how a click becomes a module load:
1. User clicks element with `data-action`, `data-section`, `data-module`, `data-destination` attributes
2. `adminListeners.js:readPetition()` extracts these into petition object
3. `appState.setPetitioner(petition)` stores it and triggers state-change event
4. `flexmain.js:openClosePanelsByRule()` receives event, calls `renderPanel()`
5. `renderPanel()` looks up action in `registryLoadModule.js`
6. Lazy import loads module, calls `module.render(panel, appState.query)` 
7. Module renders into DOM at `appState.query.petitioner.Destination`
8. NOTE [Modules often add listeners. Many current modules are closed without removing listeners. This is a problem. Even with listener removal added there is a problem with the way modules are closed. The following may help. 
Modules are injected and removed from the DOM without page reloads, adding event listeners directly to panel or window without cleanup causes memory leaks and duplicate event firing. Sept 8 2026 we are strating to convert to a controller.abort system. The controller ic created by flexmain when a module is loaded and flexmain is to use it before closing the module. 
9. All modules need to
`import { createListenerController, addManagedListener, removeListenersFromModule } from '../../utils/listenerManagement.js';`
 have as an argument  
`function whatever(... , controller)` 
& when adding listeners use 
`addManagedListener(element, event, handler, controller, options)`

### User information is available in 
`appState.query`:

```javascript
import { appState } from '../state/appState.js';

The appState contains information about the logged user. It is loaded by a call to ResolveSubject(). 
  1. The logged user
  2. Whatever appro has most recently been selected by the Selection module (if any) 

logged user:
const userId = appState.query.userId;
const userName = appState.query.userName;
const userType = appState.query.userType;
const defaultManagerId = appState.query.defaultManagerId;
selected user 
```

DevMode defaults to hardcoded test users for development. Change in `state/appState.js` if needed. 
## Important Caveats

**devMode default**
could be causing unseen problems. Probably needs to be set to false. We need to examine where it is used. There may be other hard coded or defaulted items for development that still linger and may need hunting down and removal.

- **Legacy HTML stubs** (`htmlStubs/`) have been phased out in favor of `.js` module imports
 `executeIfPermitted()`

- **DevMode default**: `appState.isDevMode = true` and defaults to hardcoded user IDs for testing

- **Tailwind CSS**: Used for styling; utility classes from CDN

- **No build step**: Pure ES6 modules, imports via `https://cdn.jsdelivr.net/` for external libraries

- **Supabase credentials** are in `.env`
 implementation

- **No inter-module communication**: Modules are isolated; use `appState.clipboard` for data sharing

## Conventions to Follow

- **Naming**: Use kebab-case for action names (`task-management-section`), camelCase for functions
- **Console logs**: Every file logs its loading: `console.log('moduleName.js loaded')`
- **Data attributes**: Always include required attributes on clickable elements
- **Async handlers**: All database operation handlers are async; use `await` for Supabase calls
- **Error handling**: Log errors to console; permission-denied errors throw with descriptive messages
- **Module isolation**: Modules should not import each other; communicate only through `appState`
- **Data flow direction**: `petition` for module loading, `clipboard` for data selection/transfer


### 017 Real-World Module Flow Example (Manager Kanban)
1. User clicks card in `displayPendingManagerTasks` with `data-action="move-student-manager"`
2. `flexmain.js` intercepts, updates `appState.query.petitioner`
3. `registryLoadModule.js` maps `'move-student-manager'` to `../work/task/moveStudentManager.js`
4. `moveStudentManager.render(panel, query)` is called, reading `query.taskHeaderId`
5. Module calls `executeIfPermitted` -> `readAssignmentsForTask`
6. HTML is injected into `panel`

### 018 Open & close modules
1. The htmal has cards or menu buttons to open and close modules.
2. This is done by the HTML containing `data-action=" name of thing to load "` for what is to be loaded, `data-section=` for where in the DOM it is called from, `data-destination=` for where it injects its HTML, `data-module=` for which module is running (which file)
3. The window listener hears the click and passes those 4 data attributes to flexmain
4. Flexmain checks if this module is already on display. If not flexmain calls that function.render(). If it is already on display Flexmain closes it.
5. Close buttons use the same petition system. Flexmain checks if the module/page/panel is already on display & if true, flexmain closes the module. (No local listener, no local handleClose function)

## 018 Payment processors
The app has integrated connetions to two Merchant of Record payment processors
1. Lemon Squeezy
2. Whop
Others are listed as potential payment processors, but have not been integrated.
(Integrated means that the app has tables listing those payment processors with columns and methods to store the activity returned by the processor via webhooks)

## 019 Glossary

**Appro**: - a row in a table app_profiles used to represent each participant, task ,survey plus anything else that admin wish to represent. AuthUsers, tasks & surveys are automatically represented by their own appro. Some structural features and important attributes are built-in the system by default. In addition admin can create any number of additional appros to represent anything such as local branches, special interest groups, a committee, a YouTube channel...


**Assignment**: To put somone on a task or to have someone answer a survey, the process is called an assignment. So a person can be assigned to a task or to a survey. This is recorded in the `assignments` table. [Note any appro can be assigned to a task or survey. Sometimes this may make no sense.]


**Bundle**: A collection of permissions is called a 'bundle'. It is represented by an appro. The permissions are granted to the appro. Then a participant can be granted all those permissions simply by granting the bundle in a single action. (the appro knows nothing about this. It is passive.)


**Clipboard**: Part of the global `appState`. This is written to by the Selection module where a user can find & choose any task, survey or appro. Most of the modules are aware of the clipboard and will react to changes on the clipboard byt loading relevant data into the module. 

**Destination**: When a user has clicked a card or menu button the system needs to know where to put the module that is being loaded. It obtains that from a the html `data-destination`. This specifies which `section` into which the module should inject its html. 


**executeIfPermitted**: The gateway function for all client-side database interactions. It checks if the called for function is in the registry, and then calls the Supabase RPC to validate permissions before execution. If zero rows are returned it console.logs a warning that the lack of returned rows could be bscause of a lack of permission. This warning helps in debugging database access faults, but it could be that there were no rows to be returned.


**Module**: Used to mean a semi-autonomous program. A sub-routine, a procedure or an instance of a class.


**move_me_at / moved_at**: "Timestamps in the assignments table tracking when a student requests a step change (move_me_at) and when a manager approves/executes it (moved_at). Used to calculate delay and urgency in displaying the state of students on tasks. New at at Sept 1 2026.


**Petition**: When a user clicks on an html card that is to launch a module, that launch is doe by a listener reading the html for any data-** attributes and then writing those into the global `appState.query.petition` (and also into `.petitionHistory`) and then issuing a event such that flexmain.js attamepts to load the called for module. 


**Section**: The dashboards have divs which are devoted to different types of function. The myDash dashboard has a part devoted to tasks that the user is on, another part devoted to the surveys the user has been assigned, others are for the user profile, any tasks the user is managing, aims/plans/roles and settings. Each is a 'section'


**Step**: Every task has at least three steps. A long task may have any number of steps. Each step has the possibility of having attached to it an 'automation' which is predetermined code that is executed when the user opens that step of the task. Steps conists of a name & description with optional url to an external resource (such as a YouTube video or Google doc). 


**Survey** Consists of a name, description, >= 1 Question, >=1 answer where the use can click an answer to give feeback or to make choices. Every question can have attacjed >=0 predetermined calls to run an action.

**Task** Consists of a name, description and at least three subsections called steps. Steps are numbered and stored in the task_steps table. Number 1 is called 'Abdondoned', 2 is called 'Completed'. 3 is named by the author and is where the user starts in a task after reading the taskHeader.


**TaskHeader**: Each task is held in two tables. The task_header table has the main id for the task plus the task name and description. Every task consists of 1 or more steps. They are stored in task_steps table with a foreign key back to task_headers


