import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Calendar as CalendarIcon, Clock } from 'lucide-react';
import './Dashboard.css';
import kandoLogo from '../../assets/kando-logo.svg';
import KanbanBoard from '../KanbanBoard/KanbanBoard';
import Calendar from '../Calendar/Calendar';

function Dashboard({ user, onLogout }) {
  const [activeView, setActiveView] = useState('kanban'); // 'kanban' or 'calendar'
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <img src={kandoLogo} alt="Kando Logo" className="header-logo" />
          <div className="header-nav">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveView('kanban')}
              className={`nav-tab ${activeView === 'kanban' ? 'active' : ''}`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Tasks</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveView('calendar')}
              className={`nav-tab ${activeView === 'calendar' ? 'active' : ''}`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Calendar</span>
            </motion.button>
          </div>
        </div>
        <div className="header-center">
          <div className="timer-display">
            <Clock className="timer-icon" />
            <div className="timer-content">
              <div className="timer-time">{formatTime(currentTime)}</div>
              <div className="timer-date">{formatDate(currentTime)}</div>
            </div>
          </div>
        </div>
        <div className="header-right">
          <span className="user-greeting">
            Welcome, <strong>{user.username}</strong>
            {user.isGuest && <span className="guest-badge">Guest</span>}
          </span>
          <button onClick={onLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {activeView === 'kanban' ? <KanbanBoard /> : <Calendar />}
      </main>
    </div>
  );
}

export default Dashboard;
