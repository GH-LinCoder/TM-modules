# AI Agent Instructions for TM-modules

A lightweight organizational OS focused on tasks, surveys and relationship management. The app itself is used as a living guide for implementing its features.

## Three Core Domain Workflows
1. **Tasks & Steps** — Create tasks with multiple steps. Each step can branch execution based on decisions (manually or via surveys).
2. **Surveys** — Survey responses can trigger task branching and code execution, driving conditional workflows.
3. **Relations & Hierarchy** — Define and visualize relationships between persons, creating organizational hierarchies and structures.

Key features include task creation/assignment (with code branching), survey-driven workflows, relationship/hierarchy visualization, and member subscriptions.

### Three Core Domain Workflows
1. **Tasks & Steps** — Create tasks with multiple steps. Each step can branch execution based on decisions (manually or via surveys)
2. **Surveys** — Survey responses can trigger task branching and code execution, driving conditional workflows
3. **Relations & Hierarchy** — Define and visualize relationships between persons, creating organizational hierarchies and structures

## Architecture Overview

**Core Layers:**
1. **`flexmain.js`** — Central orchestrator: state change → panel management → module loading/rendering
2. **`state/appState.js`** — Single source of truth for all application state, including user context and pending actions
3. **`registry/`** — Two separate registries:
   - `registryLoadModule.js`: Maps action names → lazy-loaded UI modules (work, dash, etc.)
   - `registryWorkActions.js`: Maps data actions → handler functions with metadata (tables, columns, type)
4. **`db/`** — Database abstraction layer (Supabase-based):
   - `supabase.js`: Singleton client factory
   - `databaseCentral.js`: Future hub for coordinating requests (currently documented but not fully active)
   - `executeIfPermitted.js`: Secure entry point for database operations (permissions currently always granted during development)

**Data Flow:**
```
User clicks element (data-action, data-section, data-destination attributes)
  ↓
Listener extracts petition {Module, Section, Action, Destination}
  ↓
appState.query.petitioner = petition (+ history tracking)
  ↓
state-change event → flexmain.js openClosePanelsByRule()
  ↓
registry maps action → loads module (lazy import) OR fetches data
  ↓
Module renders into display area (section-based or new-panel)
```

## Key Patterns & Conventions

### 1. **Petition Object Structure**
The "petition" is the standard request object used throughout the app:
```javascript
{
  Module: 'adminDash' | 'myDash' | 'howTo' | 'login' | etc.,
  Section: 'task-management' | 't&m-management' | etc., // granular area
  Action: 'task-management-section' | 'create-task-dialogue' | etc., // intent
  Destination: section name | 'new-panel' // where to render
}
```
- Stored in `appState.query.petitioner`
- Previous petitions tracked in `appState.query.petitionHistory` (enables context-aware help via howTo module)
- Actions beginning with 'data-' trigger database operations instead of UI module loads

### 2. **Module Loading & Rendering**
- **UI modules**: Located in `work/`, `dash/`, `htmlStubs/`. Export a `render(panel, query)` function
- **Management sections**: `dash/*ManagementSection.js` files generate card-based UI with `getTemplateHTML()` function
- **All modules are lazy-imported**: `() => import('../path/to/module.js')` in registries
- **Rendering destination**: Determined by `appState.query.petitioner.Destination`:
  - A section name (e.g., 'task-management') → renders into `[data-section="task-management"]`
  - 'new-panel' → renders into `[data-panel="inject-here"]`

### 3. **Database Operations & Security (WIP)**
- **No direct SQL or API queries from client**: All database access routes through `executeIfPermitted(userId, action, payload)`
- **Permission infrastructure exists but is in development**:
  - `permission_atoms` table is populated
  - `permission_molecule_required`, `permission_molecule_roles`, `permission_user_cache` tables exist but not yet populated
  - Database functions for permission checking are not yet written
  - **Current state**: `permissions.js` is a placeholder; all permissions are currently granted during development
- **Future dual-layer checking** (once implemented):
  1. JavaScript-level: `registry/permissions.js` will check if user *should* be permitted
  2. Database-level: Supabase RLS policies and stored functions will enforce access control
- **Action registry metadata** includes:
  - `tables`: List of affected tables
  - `columns`: Specific columns accessed
  - `type`: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE'
  - `requiredArgs`: Arguments the handler function expects
  - `handler`: Async function `(supabase, userId, payload) => result`

### 4. **Permission Model (Under Development)**
Atom-based system (defined in `securityPermissions.md`):
- **Atom**: `ACTION@table#column` (e.g., `SELECT@task_headers#name`, `UPDATE@task_assignments`)
- **Molecule**: Array of atoms granted to a user or role
- **Lookup tables** (Supabase — infrastructure exists, not yet fully populated):
  - `permission_atoms`: All possible atoms (populated)
  - `permission_molecule_required`: Function name → required atoms (exists, not yet used)
  - `permission_molecule_roles`: Role name → granted atoms (exists, not yet used)
  - `permission_user_cache`: User ID → granted atoms (exists, not yet used)
- **Future design goal**: Permissions finer than role-based, more restricted than row-level security
- **Note**: Currently all permissions are granted; full enforcement will be implemented when database functions are complete

### 5. **Data Transfer Between Modules**
Modules do NOT communicate directly with each other. All data transfer happens through `appState`:
- **`petitioner`** — Request object for loading modules/actions (see Petition Object Structure)
- **`clipboard`** — Shared data store for user selections and inter-module data transfer
  - Most modules listen for clipboard changes via state-change events
  - Typical flow: User selects item in display → item added to clipboard → other modules react and update

### 6. **Listener Pattern**
- `listeners/adminListeners.js`: Reads petition from clicked elements
- All elements MUST have `data-action`, `data-section`, `data-module`, `data-destination` attributes
- Click event → `readPetition()` → `appState.setPetitioner()` → state-change event

## File Organization

```
work/              # User-facing features (features, dialogues, displays)
├── task/          # Task creation, assignment, display, management
├── student/       # Student-related operations
├── approfiles/    # Profile management, relationships, hierarchy
├── survey/        # Survey creation & display
└── ...
dash/              # Admin/member dashboard sections
├── loadAdminDashWithData.js   # Populates admin dashboard with stats
├── loadMyDashWithData.js      # Populates member dashboard
├── *ManagementSection.js      # Task, Member, Student, Assignment, etc. management panels
└── ...
db/                # Database abstraction
├── supabase.js    # Singleton client factory
├── databaseCentral.js  # Future: coordinates all DB requests (documented, not fully active)
└── executeIfPermitted.js  # Permission-checked execution entry point
registry/          # Function/action registries
├── registryLoadModule.js      # Action → UI module mappings
├── registryWorkActions.js     # Data action → handler function mappings
├── permissions.js             # JavaScript-level permission checking
└── executeIfPermitted.js      # Bridge to secured database operations
state/             # Application state
├── appState.js    # Central state object with query, userId, petitioner, etc.
└── petitionSchema.js  # (Reference for petition structure)
listeners/         # Event handling
├── adminListeners.js   # Read petitions from DOM clicks
├── menuListeners.js    # Menu toggle logic
└── windowEventListener.js  # Global state change listener
ui/                # Reusable UI components
├── breadcrumb.js  # Breadcrumb navigation
└── ...
```

## Common Tasks

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

4. **Register permission requirement** in database `permission_molecule_required` table (once permissions are active)

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
4. **Document future permissions** — add entry to `permission_molecule_required` table structure once permissions are implemented
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

### Accessing User Context
User information is available in `appState.query`:
```javascript
import { appState } from '../state/appState.js';

const userId = appState.query.userId;
const userName = appState.query.userName;
const userType = appState.query.userType;
const defaultManagerId = appState.query.defaultManagerId;
```

DevMode defaults to hardcoded test users for development. Change in `state/appState.js` if needed.

## Important Caveats

- **Legacy HTML stubs** (`htmlStubs/`) are being phased out in favor of `.js` module imports
- **databaseCentral.js** is documented architectural intent but currently not actively used; all DB access goes through `executeIfPermitted()`
- **DevMode default**: `appState.isDevMode = true` and defaults to hardcoded user IDs for testing
- **Tailwind CSS**: Used for styling; utility classes from CDN
- **No build step**: Pure ES6 modules, imports via `https://cdn.jsdelivr.net/` for external libraries
- **Supabase credentials** are in `db/supabase.js` (anonKey, not a secret in dev)
- **Permission system is placeholder**: All permissions currently granted; full enforcement pending database function implementation
- **No inter-module communication**: Modules are isolated; use `appState.clipboard` for data sharing

## Conventions to Follow

- **Naming**: Use kebab-case for action names (`task-management-section`), camelCase for functions
- **Console logs**: Every file logs its loading: `console.log('moduleName.js loaded')`
- **Data attributes**: Always include required attributes on clickable elements
- **Async handlers**: All database operation handlers are async; use `await` for Supabase calls
- **Error handling**: Log errors to console; permission-denied errors throw with descriptive messages
- **Module isolation**: Modules should not import each other; communicate only through `appState`
- **Data flow direction**: `petition` for module loading, `clipboard` for data selection/transfer
