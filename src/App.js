import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import Dashboard from './components/Dashboard/Dashboard';
import { setGuestMode, authApi } from './services/api';
import { clearGuestTasks } from './services/mockData';

function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  /**
   * Check if user is already logged in when app loads
   */
  useEffect(() => {
    const verifyExistingSession = async () => {
      const token = localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          const isValid = await authApi.verifyToken();
          
          if (isValid) {
            const userData = JSON.parse(savedUser);
            setUser(userData);
            
            // Restore guest mode if it was a guest session
            if (userData.isGuest) {
              setGuestMode(true);
            }
          } else {
            // Token is invalid, clear storage
            clearAuthData();
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          clearAuthData();
        }
      }
      
      setLoading(false);
    };

    verifyExistingSession();
  }, []);

  /**
   * Clear authentication data from localStorage
   */
  const clearAuthData = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  /**
   * Handle successful login
   */
  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  /**
   * Handle successful registration
   */
  const handleRegisterSuccess = () => {
    // Show success message
    setSuccessMessage('Registration successful! Please sign in with your credentials.');
    
    // Switch to login view
    setShowRegister(false);
    
    // Auto-clear message after 5 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 5000);
  };

  /**
   * Handle user logout
   */
  const handleLogout = () => {
    // Clear guest data from memory if it was a guest session
    if (user?.isGuest) {
      setGuestMode(false);
      clearGuestTasks();
    }

    // Clear user state and storage
    setUser(null);
    setShowRegister(false);
    setSuccessMessage('');
    clearAuthData();
    
    // Call API logout
    authApi.logout();
  };

  /**
   * Switch between login and register views
   */
  const toggleAuthView = () => {
    setShowRegister(prev => !prev);
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="App">
        <div className="loading-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {!user ? (
        showRegister ? (
          <Register 
            onSuccess={handleRegisterSuccess} 
            onSwitchToLogin={toggleAuthView} 
          />
        ) : (
          <Login 
            onSuccess={handleLoginSuccess} 
            onSwitchToRegister={toggleAuthView}
            successMessage={successMessage}
          />
        )
      ) : (
        <Dashboard 
          user={user} 
          onLogout={handleLogout} 
        />
      )}
    </div>
  );
}

export default App;