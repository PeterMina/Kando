// services/api.js
import {
  getGuestTasks,
  createGuestTask,
  updateGuestTask,
  updateGuestTaskStatus,
  deleteGuestTask,
  initGuestTasks
} from './mockData';
/**
 * API Service Module
 * Handles all HTTP requests to the backend API with proper error handling and authentication
 */

const API_BASE_URL = "https://kando-backend-production.up.railway.app/api/v1";

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

const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};

const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  DEFAULT_ERROR: 'An error occurred',
};

/**
 * Custom API Error class for better error handling
 */
class ApiError extends Error {
  constructor(status, message, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Token management utilities
 */
const tokenManager = {
  get: () => localStorage.getItem('authToken'),
  set: (token) => localStorage.setItem('authToken', token),
  remove: () => localStorage.removeItem('authToken'),
};

/**
 * Builds request configuration with headers and body
 */
const buildRequestConfig = (method, body, additionalHeaders = {}) => {
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...additionalHeaders,
    },
  };

  const token = tokenManager.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (body) {
    config.body = JSON.stringify(body);
  }

  return config;
};

/**
 * Handles API response and error parsing
 */
const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.message || ERROR_MESSAGES.DEFAULT_ERROR,
      data
    );
  }

  return data;
};

/**
 * Core API call function
 * @param {string} endpoint - API endpoint path
 * @param {Object} options - Request options
 * @param {string} options.method - HTTP method
 * @param {Object} options.body - Request body
 * @param {Object} options.headers - Additional headers
 */
const apiCall = async (endpoint, options = {}) => {
  const { 
    method = HTTP_METHODS.GET, 
    body = null, 
    headers = {} 
  } = options;

  try {
    const config = buildRequestConfig(method, body, headers);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    return await handleResponse(response);
  } catch (error) {
    console.error('API Call Error:', error);
  }
};

/**
 * Builds query string from parameters object
 */
const buildQueryString = (params) => {
  const filteredParams = Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`);

  return filteredParams.length ? `?${filteredParams.join('&')}` : '';
};

/**
 * Authentication API endpoints
 */
export const authApi = {
  register: (userData) =>
    apiCall('/auth/register', {
      method: HTTP_METHODS.POST,
      body: userData,
    }),

  login: async (credentials) => {
    const response = await apiCall('/auth/login', {
      method: HTTP_METHODS.POST,
      body: credentials,
    });
    
    // Store token if present in response
    if (response.token) {
      tokenManager.set(response.token);
    }
    if (response.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  },

  guestLogin: async () => {
    const response = await apiCall('/auth/guest', {
      method: HTTP_METHODS.POST,
    });
    
    // Store token if present in response
    if (response.token) {
      tokenManager.set(response.token);
    }
    
    return response;
  },

  logout: () => {
    tokenManager.remove();
  },

  verifyToken: () =>
    apiCall('/auth/verify-token', {
      method: HTTP_METHODS.GET,
    }),
};

/**
 * Tasks API endpoints
 */
export const tasksApi = {
  getAll: (month = null, year = null) => {
    if (isGuestMode()) {
      return getGuestTasks(month, year);
    }
    const queryString = buildQueryString({ month, year });
    return apiCall(`/tasks${queryString}`, { 
      method: HTTP_METHODS.GET 
    });
  },

  create: (taskData) => {
    return isGuestMode()
      ? createGuestTask(taskData)
      : apiCall('/tasks', {
      method: HTTP_METHODS.POST,
      body: taskData
    });
  },

  update: (taskId, taskData) => {
    return isGuestMode()
      ? updateGuestTask(taskId, taskData)
      : apiCall(`/tasks/${taskId}`, {
      method: HTTP_METHODS.PUT,
      body: taskData,
    });
  },

  updateStatus: (taskId, status) => {
    return isGuestMode()
      ? updateGuestTaskStatus(taskId, status)
      : apiCall(`/tasks/${taskId}/status`, {
      method: HTTP_METHODS.PATCH,
      body: { status },
    });
  },

  delete: (taskId) =>
    isGuestMode()
      ? deleteGuestTask(taskId)
      : apiCall(`/tasks/${taskId}`, {
      method: HTTP_METHODS.DELETE,
    }),
};

// Export utilities for testing or advanced usage
export { apiCall, tokenManager, ApiError };

export default apiCall;