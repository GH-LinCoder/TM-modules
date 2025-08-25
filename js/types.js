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
 * @typedef {'task_assignments' | 'task_headers'} QueryTable
 */

/**
 * Valid ID column names for assignment tables
 * @typedef {'student_id' | 'manager_id' | 'author_id'} IdColumnName
 */

/**
 * A member of the system (from profiles table)
 * @typedef {Object} Member
 * @property {string} id - UUID
 * @property {string} username - Login/display name
 * @property {string} email - Email address
 * @property {string} created_at - ISO timestamp
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