import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import Dashboard from './components/Dashboard/Dashboard';
import { setGuestMode } from './services/api';
import { clearGuestTasks } from './services/mockData';

function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in when app loads
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      // Optional: Verify token is still valid with your backend
      // verifyToken(token).then(isValid => {
      //   if (isValid) {
      //     setUser(JSON.parse(savedUser));
      //   } else {
      //     localStorage.removeItem('authToken');
      //     localStorage.removeItem('user');
      //   }
      //   setLoading(false);
      // });
      
      // For now, just restore the user
      setUser(JSON.parse(savedUser));
    }
    
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    // Set guest mode flag immediately if guest user
    if (userData.isGuest) {
      setGuestMode(true);
    }

    // Store both user data and token
    setUser(userData);

    // Don't persist guest sessions to localStorage
    if (!userData.isGuest) {
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userData));
    }
  };

  const handleRegister = (userData, token) => {
    // Same as login - store credentials
    setUser(userData);
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    // Clear guest data from memory if it was a guest session
    if (user && user.isGuest) {
      setGuestMode(false);
      clearGuestTasks();
    }

    // Clear everything
    setUser(null);
    setShowRegister(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  const switchToRegister = () => {
    setShowRegister(true);
  };

  const switchToLogin = () => {
    setShowRegister(false);
  };

  // Show loading state while checking auth
  if (loading) {
    return <div className="App">Loading...</div>;
  }

  return (
    <div className="App">
      {!user ? (
        showRegister ? (
          <Register onRegister={handleRegister} onSwitchToLogin={switchToLogin} />
        ) : (
          <Login onLogin={handleLogin} onSwitchToRegister={switchToRegister} />
        )
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;