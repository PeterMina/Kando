// Type definitions for API (using JSDoc since this is a JavaScript project)

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} firstName
 * @property {string} lastName
 * @property {'Free' | 'Pro'} tier
 * @property {string} createdAt
 */

/**
 * @typedef {Object} CreateUserDTO
 * @property {string} email
 * @property {string} password
 * @property {string} firstName
 * @property {string} lastName
 */

/**
 * @typedef {Object} LoginRequest
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} UserLoginResponse
 * @property {User} user
 * @property {string} token
 */

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {string} [description]
 * @property {string} userId
 * @property {string} deadline
 * @property {'Low' | 'Medium' | 'High'} priority
 * @property {'PENDING' | 'IN_PROGRESS' | 'DONE'} [status]
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} CreateTaskDTO
 * @property {string} title
 * @property {string} [description]
 * @property {string} userId
 * @property {string} deadline
 * @property {'Low' | 'Medium' | 'High'} priority
 */

/**
 * @typedef {Object} UpdateTaskDTO
 * @property {string} [title]
 * @property {string} [description]
 * @property {string} [deadline]
 * @property {'Low' | 'Medium' | 'High'} [priority]
 */

/**
 * @typedef {Object} UpdateTaskStatusDTO
 * @property {'PENDING' | 'IN_PROGRESS' | 'DONE'} status
 */

/**
 * @typedef {Object} ErrorResponse
 * @property {number} status
 * @property {string} message
 */

export {};
