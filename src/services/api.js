// services/api.js
import {
  getGuestTasks,
  createGuestTask,
  updateGuestTask,
  updateGuestTaskStatus,
  deleteGuestTask,
  initGuestTasks
} from './mockData';

const API_BASE_URL =
  "https://kando-backend-production.up.railway.app/api/v1";

// Helper to check if current user is a guest
const isGuestMode = () => {
  // Always check the global flag first (most reliable)
  if (window.__KANDO_GUEST_MODE__) {
    return true;
  }

  // Fallback: check localStorage for guest user
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.isGuest === true;
    }
  } catch {
    // Silent fail
  }

  return false;
};

// Set guest mode flag
export const setGuestMode = (isGuest) => {
  window.__KANDO_GUEST_MODE__ = isGuest;
  if (isGuest) {
    initGuestTasks();
  }
};

// Helper function to handle API requests
const apiCall = async (endpoint, options = {}) => {
  const { method = 'GET', body = null, headers = {} } = options;

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  // Add token to headers if available
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        message: data.message || 'An error occurred',
        data,
      };
    }

    return data;
  } catch (error) {
    if (error.status) {
      throw error;
    }
    throw {
      status: 0,
      message: 'Network error. Please check your connection.',
      error,
    };
  }
};

// Auth API endpoints
export const authApi = {
  register: (userData) =>
    apiCall('/auth/register', {
      method: 'POST',
      body: userData,
    }),

  login: (credentials) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: credentials,
    }),

  guestLogin: () =>
    apiCall('/auth/guest', {
      method: 'POST',
    }),

  logout: () => {
    localStorage.removeItem('authToken');
  },
};

// Tasks API endpoints
export const tasksApi = {
  // Get all user tasks
  getAll: async (month, year) => {
    if (isGuestMode()) {
      // Return mock data for guest users
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(getGuestTasks());
        }, 300); // Simulate network delay
      });
    }

    const query = [];
    if (month) query.push(`month=${month}`);
    if (year) query.push(`year=${year}`);
    const queryString = query.length ? `?${query.join('&')}` : '';
    return apiCall(`/tasks${queryString}`, { method: 'GET' });
  },

  // Create a new task
  create: async (taskData) => {
    if (isGuestMode()) {
      // Create task in memory for guest users
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(createGuestTask(taskData));
        }, 300);
      });
    }

    return apiCall('/tasks', {
      method: 'POST',
      body: taskData,
    });
  },

  // Update an existing task (full update)
  update: async (taskId, taskData) => {
    if (isGuestMode()) {
      // Update task in memory for guest users
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(updateGuestTask(taskId, taskData));
        }, 300);
      });
    }

    return apiCall(`/tasks/${taskId}`, {
      method: 'PUT',
      body: taskData,
    });
  },

  // Update only the status of a task
  updateStatus: async (taskId, status) => {
    if (isGuestMode()) {
      // Update status in memory for guest users
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(updateGuestTaskStatus(taskId, status));
        }, 300);
      });
    }

    return apiCall(`/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: { status },
    });
  },

  // Delete a task by ID
  delete: async (taskId) => {
    if (isGuestMode()) {
      // Delete task from memory for guest users
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(deleteGuestTask(taskId));
        }, 300);
      });
    }

    return apiCall(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },
};


export default apiCall;