// Mock data for guest users
// This data will be loaded when a user logs in as guest

export const MOCK_TASKS = [
  {
    id: 'mock-1',
    title: 'Welcome to Kando!',
    description: 'Try dragging this task to different columns or editing it. All changes are local and won\'t be saved.',
    priority: 'HIGH',
    status: 'PENDING',
    deadline: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mock-2',
    title: 'Explore the Kanban Board',
    description: 'This is a demo task. Move it between columns to see how task management works.',
    priority: 'MEDIUM',
    status: 'PENDING',
    deadline: new Date(Date.now() + 172800000).toISOString(), // 2 days from now
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mock-3',
    title: 'Create Your First Task',
    description: 'Click the "Add Task" button to create a new task. Try setting different priorities and deadlines.',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    deadline: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mock-4',
    title: 'Test Drag and Drop',
    description: 'Drag tasks between To Do, In Progress, and Done columns to organize your workflow.',
    priority: 'LOW',
    status: 'IN_PROGRESS',
    deadline: new Date(Date.now() + 345600000).toISOString(), // 4 days from now
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mock-5',
    title: 'Sample Completed Task',
    description: 'This is what a completed task looks like. Great job on finishing your work!',
    priority: 'HIGH',
    status: 'DONE',
    deadline: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mock-6',
    title: 'Try Editing Tasks',
    description: 'Click the edit button on any task to modify its details, priority, or deadline.',
    priority: 'LOW',
    status: 'DONE',
    deadline: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// In-memory storage for guest mode tasks
let guestTasks = [];

export const initGuestTasks = () => {
  guestTasks = JSON.parse(JSON.stringify(MOCK_TASKS)); // Deep copy
  return guestTasks;
};

export const getGuestTasks = () => {
  return [...guestTasks]; // Return a copy
};

export const createGuestTask = (taskData) => {
  const newTask = {
    ...taskData,
    id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: taskData.status || 'PENDING'
  };
  guestTasks.push(newTask);
  return newTask;
};

export const updateGuestTask = (taskId, taskData) => {
  const index = guestTasks.findIndex(t => t.id === taskId);
  if (index === -1) {
    throw new Error('Task not found');
  }
  guestTasks[index] = {
    ...guestTasks[index],
    ...taskData,
    id: taskId, // Preserve ID
    updatedAt: new Date().toISOString()
  };
  return guestTasks[index];
};

export const updateGuestTaskStatus = (taskId, status) => {
  const index = guestTasks.findIndex(t => t.id === taskId);
  if (index === -1) {
    throw new Error('Task not found');
  }
  guestTasks[index] = {
    ...guestTasks[index],
    status,
    updatedAt: new Date().toISOString()
  };
  return guestTasks[index];
};

export const deleteGuestTask = (taskId) => {
  const index = guestTasks.findIndex(t => t.id === taskId);
  if (index === -1) {
    throw new Error('Task not found');
  }
  guestTasks.splice(index, 1);
  return { success: true };
};

export const clearGuestTasks = () => {
  guestTasks = [];
};
