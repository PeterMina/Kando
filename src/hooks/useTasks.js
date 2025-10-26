// Custom hook for task management
import { useState, useEffect, useCallback } from 'react';
import { taskService } from '../api/services';

/**
 * Custom hook for handling tasks
 * @param {number} [month] - Optional month filter
 * @param {number} [year] - Optional year filter
 * @returns {{
 *   tasks: import('../types/api').Task[],
 *   loading: boolean,
 *   error: string | null,
 *   fetchTasks: () => Promise<void>,
 *   createTask: (data: import('../types/api').CreateTaskDTO) => Promise<import('../types/api').Task>,
 *   updateTask: (id: string, data: import('../types/api').UpdateTaskDTO) => Promise<import('../types/api').Task>,
 *   deleteTask: (id: string) => Promise<void>,
 *   updateTaskStatus: (id: string, data: import('../types/api').UpdateTaskStatusDTO) => Promise<import('../types/api').Task>,
 *   clearError: () => void
 * }}
 */
export const useTasks = (month, year) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskService.getTasks(month, year);
      setTasks(data);
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch tasks';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  const createTask = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const task = await taskService.createTask(data);
      setTasks((prev) => [...prev, task]);
      return task;
    } catch (err) {
      const errorMessage = err.message || 'Failed to create task';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTask = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const task = await taskService.updateTask(id, data);
      setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
      return task;
    } catch (err) {
      const errorMessage = err.message || 'Failed to update task';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTask = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await taskService.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete task';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTaskStatus = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const task = await taskService.updateTaskStatus(id, data);
      setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
      return task;
    } catch (err) {
      const errorMessage = err.message || 'Failed to update task status';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    clearError,
  };
};
