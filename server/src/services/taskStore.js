import crypto from 'crypto';

const tasks = new Map();

export function createTask(type) {
  const taskId = crypto.randomUUID();
  const task = {
    id: taskId,
    type,
    status: 'pending',
    progress: 0,
    createdAt: new Date().toISOString(),
    result: null,
    error: null
  };
  tasks.set(taskId, task);
  return task;
}

export function getTask(taskId) {
  return tasks.get(taskId) || null;
}

export function updateTask(taskId, updates) {
  const task = tasks.get(taskId);
  if (!task) return null;
  
  Object.assign(task, updates);
  tasks.set(taskId, task);
  return task;
}

export function startTask(taskId) {
  return updateTask(taskId, { status: 'processing', progress: 10 });
}

export function completeTask(taskId, result) {
  return updateTask(taskId, { 
    status: 'completed', 
    progress: 100, 
    result,
    completedAt: new Date().toISOString()
  });
}

export function failTask(taskId, error) {
  return updateTask(taskId, { 
    status: 'failed', 
    error: error instanceof Error ? error.message : String(error)
  });
}

export function deleteOldTasks() {
  const now = Date.now();
  const cutoff = 24 * 60 * 60 * 1000; // 24 hours
  
  for (const [taskId, task] of tasks) {
    const created = new Date(task.createdAt).getTime();
    if (now - created > cutoff) {
      tasks.delete(taskId);
    }
  }
}

// Clean up old tasks every hour
setInterval(deleteOldTasks, 60 * 60 * 1000);

export default {
  createTask,
  getTask,
  updateTask,
  startTask,
  completeTask,
  failTask
};
