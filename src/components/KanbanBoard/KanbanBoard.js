import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Trash2, Edit2, Clock, CheckSquare, AlertCircle } from 'lucide-react';
import './KanbanBoard.css';
import { tasksApi } from '../../services/api';

function KanbanBoard() {
  const [draggedTask, setDraggedTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    deadline: ''
  });

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
    Low: { bg: '#2A6FBC', text: '#ffffff' },
    Medium: { bg: '#F9A100', text: '#ffffff' },
    High: { bg: '#dc3545', text: '#ffffff' }
  };

  const openTaskModal = useCallback((task = null) => {
    if (task) {
      setEditingTask(task);
      // Convert ISO date string to datetime-local format
      const deadline = task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '';
      setTaskForm({
        title: task.title,
        description: task.description || '',
        priority: task.priority || '  MEDIUM',
        deadline: deadline
      });
    } else {
      setEditingTask(null);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setTaskForm({
        title: '',
        description: '',
        priority: 'MEDIUM',
        deadline: tomorrow.toISOString().slice(0, 16)
      });
    }
    setShowTaskModal(true);
  }, []);

  const closeTaskModal = useCallback(() => {
    setShowTaskModal(false);
    setEditingTask(null);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setTaskForm({
      title: '',
      description: '',
      priority: 'MEDIUM',
      deadline: tomorrow.toISOString().slice(0, 16)
    });
  }, []);

  const handleFormChange = useCallback((field, value) => {
    setTaskForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      if (editingTask) {
        // Update existing task
        const updateData = {
          title: taskForm.title,
          description: taskForm.description,
          priority: taskForm.priority,
          deadline: new Date(taskForm.deadline).toISOString()
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
          title: taskForm.title,
          description: taskForm.description,
          priority: taskForm.priority,
          deadline: new Date(taskForm.deadline).toISOString()
        };
        console.log("Creating task with data:", createData);
        const newTask = await tasksApi.create(createData);
        
        // Add new task with converted status
        setTasks(prevTasks => [...prevTasks, {
          ...newTask,
          status: toFrontendStatus(newTask.status)
        }]);
      }
      closeTaskModal();
    } catch (err) {
      console.error('Failed to save task:', err);
      setError(err.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  }, [editingTask, taskForm, closeTaskModal]);

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
    const [isDragging, setIsDragging] = React.useState(false);
    const dragStartPos = React.useRef({ x: 0, y: 0 });

    const handleEditClick = useCallback(() => {
      if (!isDragging) {
        openTaskModal(task);
      }
    }, [task, isDragging]);

    const handleDeleteClick = useCallback((e) => {
      if (!isDragging) {
        deleteTask(task.id, e);
      }
    }, [task.id, isDragging]);

    const handleStatusChange = useCallback(async (newFrontendStatus) => {
      if (isDragging || task.status === newFrontendStatus) return;

      const newBackendStatus = toBackendStatus(newFrontendStatus);

      // Optimistically update UI
      setTasks(prevTasks => prevTasks.map(t =>
        t.id === task.id ? { ...t, status: newFrontendStatus } : t
      ));

      // Call API
      try {
        await tasksApi.updateStatus(task.id, newBackendStatus);
      } catch (err) {
        console.error('Failed to update task status:', err);
        setError(err.message || 'Failed to update task status');
        
        // Revert on error
        setTasks(prevTasks => prevTasks.map(t =>
          t.id === task.id ? { ...t, status: task.status } : t
        ));
      }
    }, [task.id, task.status, isDragging]);

    const onDragStart = useCallback((e) => {
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      setIsDragging(false);
      setDraggedTask(task);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', task.id.toString());
      if (e.currentTarget) {
        e.currentTarget.style.opacity = '0.5';
      }
    }, [task]);

    const onDrag = useCallback((e) => {
      if (e.clientX !== 0 && e.clientY !== 0) {
        const deltaX = Math.abs(e.clientX - dragStartPos.current.x);
        const deltaY = Math.abs(e.clientY - dragStartPos.current.y);
        if (deltaX > 5 || deltaY > 5) {
          setIsDragging(true);
        }
      }
    }, []);

    const onDragEnd = useCallback((e) => {
      if (e.currentTarget) {
        e.currentTarget.style.opacity = '1';
      }
      setDraggedTask(null);
      setTimeout(() => setIsDragging(false), 100);
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
        onDrag={onDrag}
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
        {showTaskModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={closeTaskModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3 className="modal-title">
                  {editingTask ? 'Edit Task' : 'Create New Task'}
                </h3>
                <button onClick={closeTaskModal} className="modal-close-btn">
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="task-form">
                <div className="form-group">
                  <label htmlFor="title">Task Title *</label>
                  <input
                    type="text"
                    id="title"
                    value={taskForm.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    placeholder="Enter task title"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    value={taskForm.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    placeholder="Enter task description"
                    rows="4"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="priority">Priority</label>
                    <select
                      id="priority"
                      value={taskForm.priority}
                      onChange={(e) => handleFormChange('priority', e.target.value)}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="deadline">Deadline *</label>
                    <input
                      type="datetime-local"
                      id="deadline"
                      value={taskForm.deadline}
                      onChange={(e) => handleFormChange('deadline', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={closeTaskModal}
                    className="btn-cancel"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="btn-submit"
                    disabled={loading}
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    {editingTask ? 'Update Task' : 'Create Task'}
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

export default React.memo(KanbanBoard);