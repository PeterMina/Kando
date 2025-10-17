import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Trash2, Edit2, Clock, CheckSquare } from 'lucide-react';
import './KanbanBoard.css';

function KanbanBoard() {
  const [draggedTask, setDraggedTask] = useState(null);
  const [tasks, setTasks] = useState(() => {
    // Load tasks from localStorage on initial render
    const savedTasks = localStorage.getItem('kando-tasks');
    if (savedTasks) {
      return JSON.parse(savedTasks);
    }
    return [
      { id: 1, title: 'Design landing page', description: 'Create mockups for the new landing page', priority: 'high', status: 'todo', project: 'Website Redesign' },
      { id: 2, title: 'Setup database', description: 'Configure MongoDB connection', priority: 'medium', status: 'in-progress', project: 'Backend' },
      { id: 3, title: 'Write documentation', description: 'Document API endpoints', priority: 'low', status: 'done', project: 'Documentation' },
    ];
  });

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    project: ''
  });

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('kando-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const priorityColors = {
    low: { bg: '#2A6FBC', text: '#ffffff' },
    medium: { bg: '#F9A100', text: '#ffffff' },
    high: { bg: '#dc3545', text: '#ffffff' }
  };

  const openTaskModal = useCallback((task = null) => {
    if (task) {
      setEditingTask(task);
      setTaskForm({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        status: task.status,
        project: task.project || ''
      });
    } else {
      setEditingTask(null);
      setTaskForm({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        project: ''
      });
    }
    setShowTaskModal(true);
  }, []);

  const closeTaskModal = useCallback(() => {
    setShowTaskModal(false);
    setEditingTask(null);
    setTaskForm({
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      project: ''
    });
  }, []);

  const handleFormChange = useCallback((field, value) => {
    setTaskForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    if (editingTask) {
      // Update existing task
      setTasks(prevTasks => prevTasks.map(task =>
        task.id === editingTask.id
          ? { ...task, ...taskForm }
          : task
      ));
    } else {
      // Create new task
      const newTask = {
        id: Date.now(),
        ...taskForm
      };
      setTasks(prevTasks => [...prevTasks, newTask]);
    }

    closeTaskModal();
  }, [editingTask, taskForm, closeTaskModal]);

  const deleteTask = useCallback((taskId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
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

  const handleDrop = useCallback((e, status) => {
    e.preventDefault();
    e.stopPropagation();

    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId && draggedTask && draggedTask.status !== status) {
      setTasks(prevTasks => prevTasks.map(t =>
        t.id === parseInt(taskId) ? { ...t, status: status } : t
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

    const handleDeleteClick = useCallback(() => {
      if (!isDragging) {
        if (window.confirm('Are you sure you want to delete this task?')) {
          setTasks(prevTasks => prevTasks.filter(t => t.id !== task.id));
        }
      }
    }, [task.id, isDragging]);

    const handleStatusChange = useCallback((newStatus) => {
      if (!isDragging) {
        setTasks(prevTasks => prevTasks.map(t =>
          t.id === task.id ? { ...t, status: newStatus } : t
        ));
      }
    }, [task.id, isDragging]);

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
      // Reset isDragging after a short delay to prevent click from firing
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
              backgroundColor: priorityColors[task.priority].bg,
              color: priorityColors[task.priority].text
            }}
          >
            {task.priority.toUpperCase()}
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

        {task.project && (
          <div className="task-project">{task.project}</div>
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
      <div className="kanban-header">
        <h2 className="kanban-title">Kanban Board</h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => openTaskModal()}
          className="btn-add-task"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Add Task
        </motion.button>
      </div>

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
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    value={taskForm.status}
                    onChange={(e) => handleFormChange('status', e.target.value)}
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="project">Project</label>
                <input
                  type="text"
                  id="project"
                  value={taskForm.project}
                  onChange={(e) => handleFormChange('project', e.target.value)}
                  placeholder="Enter project name"
                />
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
