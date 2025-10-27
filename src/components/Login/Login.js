import React, { useState, useCallback, useMemo, use } from 'react';
import './Login.css';
import kandoLogo from '../../assets/kando-logo.svg';
import { authApi, setGuestMode } from '../../services/api';

/**
 * Form validation configuration
 */
const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

const ERROR_MESSAGES = {
  EMAIL_REQUIRED: 'Email is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_REQUIRED: 'Password is required',
  LOGIN_FAILED: 'Invalid email or password',
  GUEST_LOGIN_FAILED: 'Guest login failed. Please try again.',
};

function Login({ onSuccess, onSwitchToRegister, successMessage }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Handle form field changes
   */
  const handleFormChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  }, [error]);

  /**
   * Validate form data
   */
  const validateForm = useCallback(() => {
    const { email, password } = formData;

    if (!email.trim()) {
      setError(ERROR_MESSAGES.EMAIL_REQUIRED);
      return false;
    }

    if (!VALIDATION_RULES.EMAIL_REGEX.test(email)) {
      setError(ERROR_MESSAGES.EMAIL_INVALID);
      return false;
    }

    if (!password) {
      setError(ERROR_MESSAGES.PASSWORD_REQUIRED);
      return false;
    }

    return true;
  }, [formData]);

  /**
   * Handle regular login submission
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.login({
        email: formData.email.trim(),
        password: formData.password,
      });

      // Extract token and user data from response
      const { token, user } = response;

      // Notify parent component of successful login
      onSuccess({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        tier: user.tier,
      });
    } catch (err) {
      const errorMessage = err?.message || ERROR_MESSAGES.LOGIN_FAILED;
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, onSuccess]);

  /**
   * Handle guest login
   */
  const handleGuestLogin = useCallback(async () => {
    setError('');
    setLoading(true);

    try {
      // Create a local guest session
      const guestUser = {
        email: 'guest@kando.app',
        firstName: 'Guest',
        lastName: 'User',
        tier: 'Free',
        isGuest: true,
      };

      // Set guest mode flag
      setGuestMode(true);

      // Notify parent component of successful guest login
      // Note: Guest sessions are not persisted to localStorage
      onSuccess(guestUser);
    } catch (err) {
      const errorMessage = err?.message || ERROR_MESSAGES.GUEST_LOGIN_FAILED;
      setError(errorMessage);
      console.error('Guest login error:', err);
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  /**
   * Check if form has any input
   */
  const hasFormInput = useMemo(() => {
    return formData.email.trim() !== '' || formData.password !== '';
  }, [formData]);

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src={kandoLogo} alt="Kando Logo" className="login-logo" />
          <h2>Welcome to Kando</h2>
          <p className="login-subtitle">KANBAN. SIMPLIFIED</p>
        </div>

        {/* Success message from registration */}
        {successMessage && (
          <div className="success-message" role="alert">
            {successMessage}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleFormChange('email', e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
              autoComplete="email"
              required
              aria-required="true"
              aria-invalid={error && !formData.email.trim()}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => handleFormChange('password', e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
              autoComplete="current-password"
              required
              aria-required="true"
              aria-invalid={error && !formData.password}
            />
          </div>

          <button 
            type="submit" 
            className="btn-login" 
            disabled={loading || !hasFormInput}
            aria-busy={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <button
          onClick={handleGuestLogin}
          className="btn-guest"
          disabled={loading}
          type="button"
          aria-busy={loading}
        >
          {loading ? 'Continuing...' : 'Continue as Guest'}
        </button>

        <div className="register-link">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="link-btn"
            disabled={loading}
            type="button"
          >
            Create one here
          </button>
        </div>
      </div>
    </div>
  );
}

export default React.memo(Login);