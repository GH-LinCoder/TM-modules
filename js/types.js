// ./js/types.js
// Data Type Definitions for the Application
// Use this file as a reference for data shapes and function signatures

/**
 * @typedef {string} UUID
 */

/**
 * @typedef {Object.<string, UUID>} GenericIdRecord
 */

/**
 * Represents a user profile from the database
 * @typedef {Object} ProfileRecord
 * @property {UUID} id - The unique identifier
 * @property {string} username - The user's display name
 * @property {string} email - The user's email address
 * @property {string} [created_at] - ISO timestamp when profile was created
 */

/**
 * Simplified profile for display purposes
 * @typedef {Object} SimpleProfile
 * @property {UUID} id - The unique identifier
 * @property {string} name - Display name (from username or full_name)
 * @property {string} email - User's email
 */

/**
 * Valid table names for queries
 * @typedef {'task_assignments' | 'task_headers' |'task_steps'|'app_profiles'|'profiles' |'app_event_log' |'app_event_labels'|'approfile_relations'|'relationships'} QueryTable
 */

/**
 * Valid ID column names for assignment tables
 * @typedef {'student_id' | 'manager_id' | 'author_id'} IdColumnName
 */


/**
 * A Profile which is a READ ONLY local copy of auth()
 * Do not write here. Use app_profiles for local data
 * @typedef {Object} Member
 * @property {string} id - UUID
 * @property {string} username - Login/display name
 * @property {string} email - Email address
 * @property {string} created_at - ISO timestamp
 */

/**
 * An app_profile record
 * @typedef {Object} approfile
 * @property {string} id - UUID
 * @property {string} name - Approfile name
 * @property {string} description - Approfile description
 * @property {string} external_url - Optional external link
 * @property {string} email - Contact email
 * @property {string} phone - Contact phone
 * @property {string} notes - Future expansion
 * @property {string} Updated_at - ISO timestamp
 * @property {string} created_at - ISO timestamp
 * @property {string} author_user_id - UUID of creator
 * @property {string} task_header_id - UUID of creator
 */

/**
 * An appprofile_relation record
 * @typedef {Object} appprofile_relation
 * @property {string} id - UUID
 * @property {string} approfile_is - UUID of the approfile before the relation
 * @property {string} relation_type (FK to relationships table) - Type of relation, e.g. 'parent', 'boss', 'member', 'associate'
 * @property {string} of_approfile - UUID of the approfile after the relation
* @property {string} created_at - ISO timestamp

 */

/**
 * A realtionships record
 * @typedef {Object} relationships
 * @property {string} id - UUID
 * @property {string} name - of kind of relationship  e.g. 'parent', 'boss', 'member', 'associate'
 * @property {string} description - More detailed explanation (if needed) of this type of relation
*  @property {string} created_at - ISO timestamp
 */



/**
 * A task definition
 * @typedef {Object} Task
 * @property {string} id - UUID
 * @property {string} name - Task title
 * @property {string} author_id - UUID of the creator
 * @property {string} created_at - ISO timestamp
 * @property {string|null} description - Optional description
 * @property {string|null} external_url - Optional link to external instructions
 */

/**
 * A task assignment record
 * @typedef {Object} Assignment
 * @property {string} id - UUID
 * @property {string} student_id - UUID of assigned student
 * @property {string} manager_id - UUID of assigned manager
 * @property {string} task_header_id - UUID of the task
 * @property {string} assigned_at - ISO timestamp when assigned
 * @property {string|null} completed_at - ISO timestamp when completed
 * @property {string|null} abandoned_at - ISO timestamp when abandoned
 */

/**
 * A step within a task
 * @typedef {Object} Step
 * @property {string} id - UUID
 * @property {string} task_header_id - UUID of parent task
 * @property {string} name - Step title
 * @property {number} step_order - Order in the sequence (>=3)
 * @property {string} created_at - ISO timestamp
 * @property {string|null} description - Optional description
 * @property {string|null} external_url - Optional external link
 * @property {string} author_id - UUID of step creator
 */


/**
 * A event log definition. Either auto db trigger or app logic creates these. Cannot all be null
 * @typedef {Object} app_event_log
 * @property {string} id - UUID  //or is it int8 ?
 * @property {string|null} event_i_u_d - Type of event INSERT, UPDATE, DELETE. Used by auto db trigger
 * @property {string|null} source_table_name - Table that changed. Used by auto db trigger
 * @property {string|null} event_name - Task title (FK to app_event_labels)
 * @property {string|null} source_table_name - Text name of table that changed. Used by auto db trigger
 * @property {string|null} description - Human & app use this description
 * @property {string|null} name - - Human & app use this description
* @property {string} created_at - ISO timestamp
*/

/**
 * A event log label definition
 * @typedef {Object} app_event_label
 * @property {string} id - UUID 
 * @property {string} code - Text with underscores, no spaces. Used by app logic
 * @property {string} name -  Title may be same as code but with spaces
 * @property {string} description - Human & app use this description
 * @property {string} created_at - ISO timestamp
 * @property {int} sort_int - order for display
*/

/**
 * A dialogue query definition — standard object used when opening a form and exchanging data
 * @typedef {Object} dialogue_query
 * @property {string} userId - UUID of the person making the query (used for permission checking)
 * @property {string} formName - Unique identifier for the form being opened
 * @property {string|null} recordId - UUID of the record being viewed or edited; null if creating new
 * @property {boolean|null} READ_request - Whether the form is requesting read access
 * @property {boolean|null} INSERT_request - Whether the form is requesting insert/create access
 * @property {boolean|null} UPDATE_request - Whether the form is requesting update access
 * @property {boolean|null} DELETE_request - Whether the form is requesting delete access
 * @property {string|null} permission - Explicit permission level if known (e.g. 'admin', 'owner', 'viewer')
 * @property {string|null} callerContext - Optional: where this form was triggered from (e.g. 'adminDash', 'analyticsPanel')
 * @property {string|null} purpose - Optional: reason for opening the form (e.g. 'editStudent', 'reviewTask', 'assignRole')
 * @property {object|null} payload - Optional: data passed into the form (e.g. preloaded values, filters)
 * @property {object|null} response - Optional: data returned from the form after interaction
 */





/**
 * Example usage in JSDoc:
 * 
 * @param {Task} task - The task to render
 * @param {HTMLElement} container - Where to render it
 * @returns {void}
 */
function renderTask(task, container) {
  // VS Code will now show autocomplete and type hints
  container.innerHTML = `<h3>${task.name}</h3>`;
}