// services/api.js
const API_BASE_URL =
  "https://kando-backend-production.up.railway.app/api/v1";

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
  getAll: (month, year) => {
    const query = [];
    if (month) query.push(`month=${month}`);
    if (year) query.push(`year=${year}`);
    const queryString = query.length ? `?${query.join('&')}` : '';
    return apiCall(`/tasks${queryString}`, { method: 'GET' });
  },

  // Create a new task
  create: (taskData) =>
    apiCall('/tasks', {
      method: 'POST',
      body: taskData,
    }),

  // Update an existing task (full update)
  update: (taskId, taskData) =>
    apiCall(`/tasks/${taskId}`, {
      method: 'PUT',
      body: taskData,
    }),

  // Update only the status of a task
  updateStatus: (taskId, status) =>
    apiCall(`/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: { status },
    }),

  // Delete a task by ID
  delete: (taskId) =>
    apiCall(`/tasks/${taskId}`, {
      method: 'DELETE',
    }),
};


export default apiCall;