import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  startOfDay,
  isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock } from 'lucide-react';
import './Calendar.css';

// Helper to generate color from string
const stringToColor = (str) => {
  if (!str) return '#CED4DA';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 65%, 60%)`;
};

const eventTypeColors = {
  task: '#2A6FBC',        // Deep Blue
  meeting: '#2EB086',     // Teal Green
  deadline: '#F9A100',    // Vibrant Orange
  event: '#7BC043',       // Green
  other: '#CED4DA'        // Light Gray
};

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // 'month' or 'week'
  const [events, setEvents] = useState([
    { id: 1, title: 'Design Review', date: new Date(), type: 'meeting', time: '10:00 AM' },
    { id: 2, title: 'Project Deadline', date: new Date(Date.now() + 86400000), type: 'deadline', time: '5:00 PM' },
    { id: 3, title: 'Team Meeting', date: new Date(Date.now() + 172800000), type: 'meeting', time: '2:00 PM' },
  ]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'task',
    time: '09:00'
  });

  // Load events from localStorage
  useEffect(() => {
    const savedEvents = localStorage.getItem('calendar-events');
    if (savedEvents) {
      const parsed = JSON.parse(savedEvents);
      const eventsWithDates = parsed.map(e => ({
        ...e,
        date: new Date(e.date)
      }));
      setEvents(eventsWithDates);
    }
  }, []);

  // Save events to localStorage
  useEffect(() => {
    localStorage.setItem('calendar-events', JSON.stringify(events));
  }, [events]);

  const goToPreviousPeriod = () => {
    if (view === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };

  const goToNextPeriod = () => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (day) => {
    setSelectedDate(day);
    setShowEventForm(true);
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (newEvent.title && selectedDate) {
      const event = {
        id: Date.now(),
        title: newEvent.title,
        type: newEvent.type,
        time: newEvent.time,
        date: selectedDate
      };
      setEvents([...events, event]);
      setNewEvent({ title: '', type: 'task', time: '09:00' });
      setShowEventForm(false);
      setSelectedDate(null);
    }
  };

  const handleDeleteEvent = (eventId) => {
    setEvents(events.filter(e => e.id !== eventId));
  };

  const getEventsForDate = (date) => {
    return events.filter(event =>
      isSameDay(new Date(event.date), date)
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="calendar-grid">
        <div className="calendar-header-row">
          {dayNames.map((day) => (
            <div key={day} className="calendar-day-name">
              {day}
            </div>
          ))}
        </div>
        <div className="calendar-days-grid">
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isDayToday = isToday(day);

            return (
              <motion.div
                key={day.toString()}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                className={`calendar-day-cell ${!isCurrentMonth ? 'other-month' : ''} ${isDayToday ? 'today' : ''}`}
                onClick={() => handleDateClick(day)}
              >
                <div className="day-number">{format(day, 'd')}</div>
                <div className="day-events">
                  <AnimatePresence>
                    {dayEvents.slice(0, 3).map(event => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="event-pill"
                        style={{ backgroundColor: eventTypeColors[event.type] }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEvent(event.id);
                        }}
                        title={`${event.title} - ${event.time} (Click to delete)`}
                      >
                        <span className="event-title">{event.title}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {dayEvents.length > 3 && (
                    <div className="more-events">+{dayEvents.length - 3} more</div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="week-view">
        <div className="week-header">
          {days.map((day) => {
            const isDayToday = isToday(day);
            return (
              <div
                key={day.toString()}
                className={`week-day-header ${isDayToday ? 'today' : ''}`}
              >
                <div className="week-day-name">{format(day, 'EEE')}</div>
                <div className="week-day-date">{format(day, 'd')}</div>
              </div>
            );
          })}
        </div>
        <div className="week-body">
          <div className="time-column">
            {hours.map((hour) => (
              <div key={hour} className="time-slot">
                {format(new Date().setHours(hour, 0, 0, 0), 'ha')}
              </div>
            ))}
          </div>
          {days.map((day) => {
            const dayEvents = getEventsForDate(day);
            return (
              <div
                key={day.toString()}
                className="week-day-column"
                onClick={() => handleDateClick(day)}
              >
                {hours.map((hour) => (
                  <div key={hour} className="hour-slot" />
                ))}
                {dayEvents.map((event) => {
                  const [eventHour] = event.time.split(':');
                  const topPosition = parseInt(eventHour) * 60;
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="week-event"
                      style={{
                        top: `${topPosition}px`,
                        backgroundColor: eventTypeColors[event.type]
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEvent(event.id);
                      }}
                      title={`${event.title} - ${event.time} (Click to delete)`}
                    >
                      <div className="week-event-time">{event.time}</div>
                      <div className="week-event-title">{event.title}</div>
                    </motion.div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-container">
      <div className="calendar-toolbar">
        <div className="calendar-nav">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={goToPreviousPeriod}
            className="nav-btn"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={goToToday}
            className="today-btn"
          >
            Today
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={goToNextPeriod}
            className="nav-btn"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>

          <h2 className="calendar-title">
            {view === 'month'
              ? format(currentDate, 'MMMM yyyy')
              : `Week of ${format(startOfWeek(currentDate), 'MMM d, yyyy')}`}
          </h2>
        </div>

        <div className="view-switcher">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setView('month')}
            className={`view-btn ${view === 'month' ? 'active' : ''}`}
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            Month
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setView('week')}
            className={`view-btn ${view === 'week' ? 'active' : ''}`}
          >
            <Clock className="w-4 h-4 mr-2" />
            Week
          </motion.button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {view === 'month' ? renderMonthView() : renderWeekView()}
        </motion.div>
      </AnimatePresence>

      {/* Event Form Modal */}
      <AnimatePresence>
        {showEventForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => {
              setShowEventForm(false);
              setSelectedDate(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="modal-content calendar-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3 className="modal-title">
                  Add Event - {selectedDate && format(selectedDate, 'MMMM d, yyyy')}
                </h3>
                <button
                  onClick={() => {
                    setShowEventForm(false);
                    setSelectedDate(null);
                  }}
                  className="modal-close-btn"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleAddEvent} className="event-form">
                <div className="form-group">
                  <label htmlFor="event-title">Event Title *</label>
                  <input
                    type="text"
                    id="event-title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Enter event title"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="event-type">Type</label>
                    <select
                      id="event-type"
                      value={newEvent.type}
                      onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                    >
                      <option value="task">Task</option>
                      <option value="meeting">Meeting</option>
                      <option value="deadline">Deadline</option>
                      <option value="event">Event</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="event-time">Time</label>
                    <input
                      type="time"
                      id="event-time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="event-type-legend">
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: eventTypeColors.task }}></span>
                    <span>Task</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: eventTypeColors.meeting }}></span>
                    <span>Meeting</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: eventTypeColors.deadline }}></span>
                    <span>Deadline</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: eventTypeColors.event }}></span>
                    <span>Event</span>
                  </div>
                </div>

                <div className="modal-footer">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      setShowEventForm(false);
                      setSelectedDate(null);
                    }}
                    className="btn-cancel"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="btn-submit"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Event
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Calendar;
