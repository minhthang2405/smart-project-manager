import express from 'express';
import { 
  createProject, 
  addMember, 
  getProjects, 
  getProjectById,
  getJoinedProjects,
  getUserProjectStats,
  debugProjectMembers
} from '../controllers/project.controller.js';
const router = express.Router();

// Project routes
router.post('/', createProject);
router.post('/:id/members', addMember);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.get('/debug/members', debugProjectMembers);

// Member routes
router.get('/joined/:email', getJoinedProjects);
router.get('/stats/:email', getUserProjectStats);

export default router;
