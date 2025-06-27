import express from 'express';
import { createProject, addMember, getProjects, getProjectById } from '../controllers/project.controller.js';
const router = express.Router();

// Project routes
router.post('/', createProject);
router.post('/:id/members', addMember);
router.get('/', getProjects);
router.get('/:id', getProjectById);

export default router;
