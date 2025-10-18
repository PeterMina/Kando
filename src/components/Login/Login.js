import React, { useState } from 'react';
import './Login.css';
import kandoLogo from '../../assets/kando-logo.svg';

function Login({ onLogin, onSwitchToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Mock user data
  const mockUsers = [
    { username: 'admin', password: 'admin123' },
    { username: 'user', password: 'user123' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Check registered users from localStorage
    const registeredUsers = JSON.parse(localStorage.getItem('kando-users') || '[]');
    const registeredUser = registeredUsers.find(
      u => (u.username === username || u.email === username) && u.password === password
    );

    if (registeredUser) {
      onLogin({
        username: registeredUser.username,
        email: registeredUser.email,
        firstName: registeredUser.firstName,
        lastName: registeredUser.lastName,
        isGuest: false
      });
      return;
    }

    // Check mock users
    const mockUser = mockUsers.find(
      u => u.username === username && u.password === password
    );

    if (mockUser) {
      onLogin(mockUser);
    } else {
      setError('Invalid username or password');
    }
  };

  const handleGuestLogin = () => {
    onLogin({ username: 'Guest', isGuest: true });
  };

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
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
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
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-login">
            Login
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <button onClick={handleGuestLogin} className="btn-guest">
          Continue as Guest
        </button>

        <div className="register-link">
          Don't have an account?{' '}
          <button onClick={onSwitchToRegister} className="link-btn">
            Create one here
          </button>
        </div>
      </div>
    </div>
  );
}

export default React.memo(Login);
