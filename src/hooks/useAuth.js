// Custom hook for authentication
import { useState, useCallback } from 'react';
import { authService } from '../api/services';

/**
 * Custom hook for handling authentication
 * @returns {{
 *   user: import('../types/api').User | null,
 *   loading: boolean,
 *   error: string | null,
 *   register: (data: import('../types/api').CreateUserDTO) => Promise<import('../types/api').User>,
 *   login: (data: import('../types/api').LoginRequest) => Promise<import('../types/api').UserLoginResponse>,
 *   logout: () => void,
 *   clearError: () => void
 * }}
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const register = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const user = await authService.register(data);
      setUser(user);
      return user;
    } catch (err) {
      const errorMessage = err.message || 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(data);
      setUser(response.user);
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { user, loading, error, register, login, logout, clearError };
};
