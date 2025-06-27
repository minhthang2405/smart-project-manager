import express from 'express';
import { createTask, getTasksByEmail, getAssignedTasks, updateTaskStatus } from '../controllers/task.controller.js';
import nodemailer from 'nodemailer';
const router = express.Router();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
});

router.post('/projects/:id/tasks', (req, res) => createTask(req, res, transporter));
router.get('/tasks', getTasksByEmail);
router.get('/tasks/assigned', getAssignedTasks);
router.patch('/tasks/:id/status', updateTaskStatus);

export default router;
