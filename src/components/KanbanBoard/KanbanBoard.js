import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Trash2, Edit2, Clock, CheckSquare, AlertCircle, Info } from 'lucide-react';
import './KanbanBoard.css';
import { tasksApi } from '../../services/api';
import TaskModal from '../TaskModal/TaskModal';

function KanbanBoard() {
  const [draggedTask, setDraggedTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is in guest mode
  const isGuest = window.__KANDO_GUEST_MODE__ || false;

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Helper function to convert backend status to frontend status
  const toFrontendStatus = (backendStatus) => {
    const statusMap = {
      'PENDING': 'todo',
      'IN_PROGRESS': 'in-progress',
      'DONE': 'done'
    };
    return statusMap[backendStatus] || 'todo';
  };

  // Helper function to convert frontend status to backend status
  const toBackendStatus = (frontendStatus) => {
    const statusMap = {
      'todo': 'PENDING',
      'in-progress': 'IN_PROGRESS',
      'done': 'DONE'
    };
    return statusMap[frontendStatus] || 'PENDING';
  };

  // Fetch tasks on component mount
  React.useEffect(() => {
    const fetchTasks = async () => {

      setLoading(true);
      setError(null);
      try {
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1; 
        const year = currentDate.getFullYear();
        
        const fetchedTasks = await tasksApi.getAll(month, year);
        
        // Convert backend status to frontend status for each task
        const tasksWithFrontendStatus = fetchedTasks.map(task => ({
          ...task,
          status: toFrontendStatus(task.status)
        }));
        
        setTasks(tasksWithFrontendStatus);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
        setError(err.message || 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const priorityColors = {
    LOW: { bg: '#28a745', text: '#ffffff' },      // Green for low priority
    MEDIUM: { bg: '#ffc107', text: '#000000' },    // Yellow/Orange for medium priority
    HIGH: { bg: '#dc3545', text: '#ffffff' },      // Red for high priority
    // Fallback for old lowercase format
    Low: { bg: '#28a745', text: '#ffffff' },
    Medium: { bg: '#ffc107', text: '#000000' },
    High: { bg: '#dc3545', text: '#ffffff' }
  };

  const openTaskModal = useCallback((task = null) => {
    setEditingTask(task);
    setShowTaskModal(true);
  }, []);

  const closeTaskModal = useCallback(() => {
    setShowTaskModal(false);
    setEditingTask(null);
  }, []);

  const handleSubmit = useCallback(async (taskFormData) => {
    setLoading(true);
    setError(null);

    try {
      if (editingTask) {
        // Update existing task
        const updateData = {
          title: taskFormData.title,
          description: taskFormData.description,
          priority: taskFormData.priority,
          deadline: new Date(taskFormData.deadline).toISOString()
        };
        const updatedTask = await tasksApi.update(editingTask.id, updateData);

        // Convert status and update in state
        setTasks(prevTasks => prevTasks.map(task =>
          task.id === editingTask.id
            ? { ...updatedTask, status: toFrontendStatus(updatedTask.status) }
            : task
        ));
      } else {
        // Create new task
        const createData = {
          title: taskFormData.title,
          description: taskFormData.description,
          priority: taskFormData.priority,
          deadline: new Date(taskFormData.deadline).toISOString()
        };
        const newTask = await tasksApi.create(createData);

        // Add new task with converted status
        setTasks(prevTasks => [...prevTasks, {
          ...newTask,
          status: toFrontendStatus(newTask.status)
        }]);
      }
      closeTaskModal();
    } catch (err) {
      setError(err.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  }, [editingTask, closeTaskModal, toFrontendStatus]);

  const deleteTask = useCallback(async (taskId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await tasksApi.delete(taskId);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    } catch (err) {
      console.error('Failed to delete task:', err);
      setError(err.message || 'Failed to delete task');
    } finally {
      setLoading(false);
    }
  }, []);

  const getTasksByStatus = useCallback((status) => {
    return tasks.filter(task => task.status === status);
  }, [tasks]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(async (e, newFrontendStatus) => {
    e.preventDefault();
    e.stopPropagation();

    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId || !draggedTask || draggedTask.status === newFrontendStatus) {
      setDraggedTask(null);
      return;
    }

    // Convert frontend status to backend status
    const newBackendStatus = toBackendStatus(newFrontendStatus);

    // Optimistically update UI
    setTasks(prevTasks => prevTasks.map(t =>
      t.id === draggedTask.id ? { ...t, status: newFrontendStatus } : t
    ));

    // Call API to update status
    try {
      await tasksApi.updateStatus(draggedTask.id, newBackendStatus);
    } catch (err) {
      console.error('Failed to update task status:', err);
      setError(err.message || 'Failed to update task status');
      
      // Revert on error
      setTasks(prevTasks => prevTasks.map(t =>
        t.id === draggedTask.id ? { ...t, status: draggedTask.status } : t
      ));
    }

    setDraggedTask(null);
  }, [draggedTask]);

  const TaskCard = React.memo(({ task }) => {
    const handleEditClick = useCallback(() => {
      openTaskModal(task);
    }, [task]);

    const handleDeleteClick = useCallback((e) => {
      deleteTask(task.id, e);
    }, [task.id]);

    const handleStatusChange = useCallback(async (newFrontendStatus) => {
      if (task.status === newFrontendStatus) return;

      const newBackendStatus = toBackendStatus(newFrontendStatus);

      // Optimistically update UI
      setTasks(prevTasks => prevTasks.map(t =>
        t.id === task.id ? { ...t, status: newFrontendStatus } : t
      ));

      // Call API
      try {
        await tasksApi.updateStatus(task.id, newBackendStatus);
      } catch (err) {
        setError(err.message || 'Failed to update task status');

        // Revert on error
        setTasks(prevTasks => prevTasks.map(t =>
          t.id === task.id ? { ...t, status: task.status } : t
        ));
      }
    }, [task.id, task.status]);

    const onDragStart = useCallback((e) => {
      setDraggedTask(task);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', task.id.toString());
      // Add a slight delay to avoid ghost image flicker
      requestAnimationFrame(() => {
        if (e.target) {
          e.target.style.opacity = '0.5';
        }
      });
    }, [task]);

    const onDragEnd = useCallback((e) => {
      if (e.target) {
        e.target.style.opacity = '1';
      }
      setDraggedTask(null);
    }, []);

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={`task-card ${draggedTask?.id === task.id ? 'dragging' : ''}`}
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="task-card-header">
          <span
            className="priority-badge"
            style={{
              backgroundColor: priorityColors[task.priority]?.bg || '#6c757d',
              color: priorityColors[task.priority]?.text || '#ffffff'
            }}
          >
            {task.priority?.toUpperCase() || 'MEDIUM'}
          </span>
          <div className="task-actions">
            <button
              onClick={handleEditClick}
              className="task-action-btn edit-btn"
              title="Edit task"
              type="button"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDeleteClick}
              className="task-action-btn delete-btn"
              title="Delete task"
              type="button"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <h3 className="task-title">{task.title}</h3>
        {task.description && (
          <p className="task-description">{task.description}</p>
        )}

        {task.deadline && (
          <div className="task-deadline">
            <Clock className="w-4 h-4" />
            <span>{new Date(task.deadline).toLocaleDateString()}</span>
          </div>
        )}

        {/* Quick status change buttons */}
        <div className="task-status-actions">
          {task.status !== 'todo' && (
            <button
              onClick={() => handleStatusChange('todo')}
              className="status-move-btn"
              title="Move to To Do"
              type="button"
            >
              ← To Do
            </button>
          )}
          {task.status !== 'in-progress' && task.status !== 'done' && (
            <button
              onClick={() => handleStatusChange('in-progress')}
              className="status-move-btn progress-btn"
              title="Move to In Progress"
              type="button"
            >
              In Progress
            </button>
          )}
          {task.status !== 'done' && (
            <button
              onClick={() => handleStatusChange('done')}
              className="status-move-btn done-btn"
              title="Move to Done"
              type="button"
            >
              Done →
            </button>
          )}
        </div>
      </motion.div>
    );
  });

  TaskCard.displayName = 'TaskCard';

  return (
    <div className="kanban-board">
      {error && (
        <div className="error-banner">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {isGuest && (
        <div className="guest-mode-banner" style={{
          backgroundColor: '#FFF3CD',
          border: '1px solid #FFE69C',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#856404'
        }}>
          <Info className="w-5 h-5" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '14px', lineHeight: '1.5' }}>
            <strong>Guest Mode:</strong> You're exploring Kando with demo data. Create, edit, and move tasks to try all features.
            All changes are temporary and won't be saved after you log out.
          </span>
        </div>
      )}

      <div className="kanban-header">
        <h2 className="kanban-title">Kanban Board</h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => openTaskModal()}
          className="btn-add-task"
          disabled={loading}
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Add Task
        </motion.button>
      </div>

      {loading && tasks.length === 0 ? (
        <div className="loading-state">Loading tasks...</div>
      ) : (
        <div className="kanban-columns">
          {/* To Do Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="kanban-column todo-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'todo')}
          >
            <div className="column-header">
              <div className="column-title-wrapper">
                <CheckSquare className="w-5 h-5 text-deep-blue" />
                <h3 className="column-title">To Do</h3>
              </div>
              <span className="task-count">{getTasksByStatus('todo').length}</span>
            </div>
            <div className="column-content">
              <AnimatePresence>
                {getTasksByStatus('todo').map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </AnimatePresence>
              {getTasksByStatus('todo').length === 0 && (
                <p className="empty-column-message">Drop tasks here or click "Add Task"</p>
              )}
            </div>
          </motion.div>

          {/* In Progress Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="kanban-column in-progress-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'in-progress')}
          >
            <div className="column-header">
              <div className="column-title-wrapper">
                <Clock className="w-5 h-5 text-vibrant-orange" />
                <h3 className="column-title">In Progress</h3>
              </div>
              <span className="task-count">{getTasksByStatus('in-progress').length}</span>
            </div>
            <div className="column-content">
              <AnimatePresence>
                {getTasksByStatus('in-progress').map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </AnimatePresence>
              {getTasksByStatus('in-progress').length === 0 && (
                <p className="empty-column-message">Drop tasks here to start working</p>
              )}
            </div>
          </motion.div>

          {/* Done Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="kanban-column done-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'done')}
          >
            <div className="column-header">
              <div className="column-title-wrapper">
                <CheckSquare className="w-5 h-5 text-teal-green" />
                <h3 className="column-title">Done</h3>
              </div>
              <span className="task-count">{getTasksByStatus('done').length}</span>
            </div>
            <div className="column-content">
              <AnimatePresence>
                {getTasksByStatus('done').map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </AnimatePresence>
              {getTasksByStatus('done').length === 0 && (
                <p className="empty-column-message">Drop completed tasks here</p>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Task Modal */}
      <AnimatePresence>
        <TaskModal
          isOpen={showTaskModal}
          onClose={closeTaskModal}
          onSubmit={handleSubmit}
          editingTask={editingTask}
          loading={loading}
        />
      </AnimatePresence>
    </div>
  );
}

export default React.memo(KanbanBoard);