import express from 'express';
import { getTeams, createTeam, updateTeam, deleteTeam } from '../controllers/teamController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getTeams).post(protect, admin, createTeam);

router.route('/:id').put(protect, admin, updateTeam).delete(protect, admin, deleteTeam);
export default router;
