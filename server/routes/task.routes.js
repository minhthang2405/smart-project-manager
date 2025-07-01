import express from 'express';
import { 
  createTask, 
  getTasksByEmail, 
  getAssignedTasks, 
  updateTaskStatus,
  getTasksByProjectAndUser,
  getTaskStatsByUser 
} from '../controllers/task.controller.js';

const router = express.Router();

// Không cần transporter nữa vì đã sử dụng mail service
router.post('/projects/:id/tasks', createTask);
router.get('/tasks', getTasksByEmail);
router.get('/tasks/assigned', getAssignedTasks);
router.patch('/tasks/:id/status', updateTaskStatus);

// New routes for project-specific tasks
router.get('/projects/:projectId/tasks/:email', getTasksByProjectAndUser);
router.get('/tasks/stats/:email', getTaskStatsByUser);

export default router;
