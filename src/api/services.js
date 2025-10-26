// API Service Functions
import { apiClient } from './client';

// Health Check
export const healthCheck = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

// Auth Services
export const authService = {
  /**
   * Register a new user
   * @param {import('../types/api').CreateUserDTO} data
   * @returns {Promise<import('../types/api').User>}
   */
  register: async (data) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  /**
   * Login user
   * @param {import('../types/api').LoginRequest} data
   * @returns {Promise<import('../types/api').UserLoginResponse>}
   */
  login: async (data) => {
    const response = await apiClient.post('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },

  /**
   * Logout user
   */
  logout: () => {
    localStorage.removeItem('authToken');
  },
};

// Task Services
export const taskService = {
  /**
   * Create a new task
   * @param {import('../types/api').CreateTaskDTO} data
   * @returns {Promise<import('../types/api').Task>}
   */
  createTask: async (data) => {
    const response = await apiClient.post('/tasks', data);
    return response.data;
  },

  /**
   * Get all tasks with optional filters
   * @param {number} [month] - Month number (1-12)
   * @param {number} [year] - Year
   * @returns {Promise<import('../types/api').Task[]>}
   */
  getTasks: async (month, year) => {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());

    const queryString = params.toString();
    const url = queryString ? `/tasks?${queryString}` : '/tasks';

    const response = await apiClient.get(url);
    return response.data;
  },

  /**
   * Update a task
   * @param {string} id - Task ID
   * @param {import('../types/api').UpdateTaskDTO} data
   * @returns {Promise<import('../types/api').Task>}
   */
  updateTask: async (id, data) => {
    const response = await apiClient.put(`/tasks/${id}`, data);
    return response.data;
  },

  /**
   * Delete a task
   * @param {string} id - Task ID
   * @returns {Promise<void>}
   */
  deleteTask: async (id) => {
    await apiClient.delete(`/tasks/${id}`);
  },

  /**
   * Update task status
   * @param {string} id - Task ID
   * @param {import('../types/api').UpdateTaskStatusDTO} data
   * @returns {Promise<import('../types/api').Task>}
   */
  updateTaskStatus: async (id, data) => {
    const response = await apiClient.patch(`/tasks/${id}/status`, data);
    return response.data;
  },
};
