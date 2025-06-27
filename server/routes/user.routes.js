import express from 'express';
import { getUser, updateUser } from '../controllers/user.controller.js';
const router = express.Router();

// User routes
router.get('/:email', getUser);
router.patch('/:email', updateUser);

export default router;
