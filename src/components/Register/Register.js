import React, { useState, useCallback, useMemo } from 'react';
import './Register.css';
import kandoLogo from '../../assets/kando-logo.svg';
import { authApi } from '../../services/api';

/**
 * Form validation configuration
 */
const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MIN_PASSWORD_LENGTH: 6,
};

const ERROR_MESSAGES = {
  FIRST_NAME_REQUIRED: 'First name is required',
  LAST_NAME_REQUIRED: 'Last name is required',
  EMAIL_REQUIRED: 'Email is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_TOO_SHORT: `Password must be at least ${VALIDATION_RULES.MIN_PASSWORD_LENGTH} characters long`,
  PASSWORDS_MISMATCH: 'Passwords do not match',
  REGISTRATION_FAILED: 'Registration failed. Please try again.',
};

function Register({ onSuccess, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
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
    const { firstName, lastName, email, password, confirmPassword } = formData;

    if (!firstName.trim()) {
      setError(ERROR_MESSAGES.FIRST_NAME_REQUIRED);
      return false;
    }

    if (!lastName.trim()) {
      setError(ERROR_MESSAGES.LAST_NAME_REQUIRED);
      return false;
    }

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

    if (password.length < VALIDATION_RULES.MIN_PASSWORD_LENGTH) {
      setError(ERROR_MESSAGES.PASSWORD_TOO_SHORT);
      return false;
    }

    if (password !== confirmPassword) {
      setError(ERROR_MESSAGES.PASSWORDS_MISMATCH);
      return false;
    }

    return true;
  }, [formData]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await authApi.register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      // Notify parent of successful registration
      onSuccess();
      
    } catch (err) {
      const errorMessage = err?.message || ERROR_MESSAGES.REGISTRATION_FAILED;
      setError(errorMessage);
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, onSuccess]);

  /**
   * Check if form has any input
   */
  const hasFormInput = useMemo(() => {
    return Object.values(formData).some(value => value.trim() !== '');
  }, [formData]);

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <img src={kandoLogo} alt="Kando Logo" className="logo" />
          <h1>Create Account</h1>
          <p className="subtitle">Join Kando and start organizing your tasks</p>
        </div>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form" noValidate>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleFormChange('firstName', e.target.value)}
                placeholder="Enter your first name"
                autoComplete="given-name"
                disabled={loading}
                required
                aria-required="true"
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleFormChange('lastName', e.target.value)}
                placeholder="Enter your last name"
                autoComplete="family-name"
                disabled={loading}
                required
                aria-required="true"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleFormChange('email', e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              disabled={loading}
              required
              aria-required="true"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => handleFormChange('password', e.target.value)}
              placeholder={`Create a password (min ${VALIDATION_RULES.MIN_PASSWORD_LENGTH} characters)`}
              autoComplete="new-password"
              disabled={loading}
              required
              aria-required="true"
              minLength={VALIDATION_RULES.MIN_PASSWORD_LENGTH}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => handleFormChange('confirmPassword', e.target.value)}
              placeholder="Confirm your password"
              autoComplete="new-password"
              disabled={loading}
              required
              aria-required="true"
            />
          </div>

          <button 
            type="submit" 
            className="btn-register" 
            disabled={loading || !hasFormInput}
            aria-busy={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="login-link">
          Already have an account?{' '}
          <button 
            onClick={onSwitchToLogin} 
            className="link-btn" 
            disabled={loading}
            type="button"
          >
            Sign in here
          </button>
        </div>
      </div>
    </div>
  );
}

export default React.memo(Register);