import express from 'express';
import { getAdminDashboardStats } from '../controllers/analyticsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, admin, getAdminDashboardStats);

export default router;
