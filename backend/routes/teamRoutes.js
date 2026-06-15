import express from 'express';
import { getTeams, createTeam } from '../controllers/teamController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getTeams).post(protect, admin, createTeam);

export default router;
