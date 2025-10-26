import React, { useState, useCallback } from 'react';
import './Login.css';
import kandoLogo from '../../assets/kando-logo.svg';
import { authApi } from '../../services/api';

function Login({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }

    if (!password) {
      setError('Password is required');
      return false;
    }

    return true;
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.login({
        email,
        password,
      });

      // Store token if provided
      if (response.token) {
        localStorage.setItem('authToken', response.token);
      }

      // Call onLogin callback with user data
      onLogin({
        email: response.user.email,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
      }, response.token);
    } catch (err) {
      setError(err.message || 'Invalid email or password');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  }, [email, password, onLogin]);

  const handleGuestLogin = useCallback(async () => {
    setError('');
    setLoading(true);

    try {
      const response = await authApi.guestLogin();

      // Store guest token if provided
      if (response.token) {
        localStorage.setItem('authToken', response.token);
      }

      onLogin({
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        tier: response.tier,
      });
    } catch (err) {
      setError(err.message || 'Guest login failed. Please try again.');
      console.error('Guest login error:', err);
      setLoading(false);
    }
  }, [onLogin]);

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src={kandoLogo} alt="Kando Logo" className="login-logo" />
          <h2>Welcome to Kando</h2>
          <p className="login-subtitle">KANBAN. SIMPLIFIED</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-login" disabled={loading}>
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
        >
          {loading ? 'Continuing...' : 'Continue as Guest'}
        </button>

        <div className="register-link">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="link-btn"
            disabled={loading}
          >
            Create one here
          </button>
        </div>
      </div>
    </div>
  );
}

export default React.memo(Login);