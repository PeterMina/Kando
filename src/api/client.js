// API Client using Axios
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      const errorData = {
        status: error.response.status,
        message: error.response.data?.message || 'An error occurred',
        data: error.response.data,
      };

      // Handle 401 Unauthorized - clear token and redirect to login
      if (error.response.status === 401) {
        localStorage.removeItem('authToken');
        // You can dispatch a logout action or redirect here if needed
      }

      return Promise.reject(errorData);
    } else if (error.request) {
      // Request was made but no response received
      return Promise.reject({
        status: 0,
        message: 'Network error. Please check your connection.',
        error,
      });
    } else {
      // Something else happened
      return Promise.reject({
        status: 0,
        message: error.message || 'An unexpected error occurred',
        error,
      });
    }
  }
);

export { apiClient };
