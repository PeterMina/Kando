import React, { useState, useCallback } from 'react';
import './Register.css';
import kandoLogo from '../../assets/kando-logo.svg';

function Register({ onRegister, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleFormChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return;
    }

    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!formData.password) {
      setError('Password is required');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Save user to localStorage
    const users = JSON.parse(localStorage.getItem('kando-users') || '[]');

    // Check if email already exists
    if (users.some(user => user.email === formData.email)) {
      setError('Email already registered');
      return;
    }

    const newUser = {
      id: Date.now(),
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      username: formData.email.split('@')[0],
      password: formData.password
    };

    users.push(newUser);
    localStorage.setItem('kando-users', JSON.stringify(users));

    // Auto-login after registration
    onRegister({
      username: newUser.username,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      isGuest: false
    });
  }, [formData, onRegister]);

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <img src={kandoLogo} alt="Kando Logo" className="logo" />
          <h1>Create Account</h1>
          <p className="subtitle">Join Kando and start organizing your tasks</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="register-form">
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
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => handleFormChange('password', e.target.value)}
              placeholder="Create a password (min 6 characters)"
              autoComplete="new-password"
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
            />
          </div>

          <button type="submit" className="btn-register">
            Create Account
          </button>
        </form>

        <div className="login-link">
          Already have an account?{' '}
          <button onClick={onSwitchToLogin} className="link-btn">
            Sign in here
          </button>
        </div>
      </div>
    </div>
  );
}

export default React.memo(Register);
