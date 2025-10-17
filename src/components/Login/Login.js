import React, { useState } from 'react';
import './Login.css';
import kandoLogo from '../../assets/kando-logo.svg';

function Login({ onLogin }) {
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

    const user = mockUsers.find(
      u => u.username === username && u.password === password
    );

    if (user) {
      onLogin(user);
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

        <div className="demo-credentials">
          <p><strong>Demo Credentials:</strong></p>
          <p>Username: <code>admin</code> | Password: <code>admin123</code></p>
          <p>Username: <code>user</code> | Password: <code>user123</code></p>
        </div>
      </div>
    </div>
  );
}

export default Login;
