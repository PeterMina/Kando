import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle } from 'lucide-react';
import './TaskModal.css';

function TaskModal({ isOpen, onClose, onSubmit, editingTask, loading }) {
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    deadline: ''
  });

  // Initialize form when modal opens or editing task changes
  useEffect(() => {
    if (editingTask) {
      // Convert ISO date string to datetime-local format
      const deadline = editingTask.deadline
        ? new Date(editingTask.deadline).toISOString().slice(0, 16)
        : '';
      setTaskForm({
        title: editingTask.title,
        description: editingTask.description || '',
        priority: editingTask.priority || 'MEDIUM',
        deadline: deadline
      });
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setTaskForm({
        title: '',
        description: '',
        priority: 'MEDIUM',
        deadline: tomorrow.toISOString().slice(0, 16)
      });
    }
  }, [editingTask, isOpen]);

  const handleFormChange = useCallback((field, value) => {
    setTaskForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    onSubmit(taskForm);
  }, [taskForm, onSubmit]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-overlay"
      onClick={onClose}
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
          <button onClick={onClose} className="modal-close-btn">
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
              onClick={onClose}
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
  );
}

export default React.memo(TaskModal);
