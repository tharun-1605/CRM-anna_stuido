import express from 'express';
import { createLeaveRequest, getLeaveRequests, updateLeaveStatus, getMyLeaves } from '../controllers/leaveController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createLeaveRequest);
router.get('/', protect, getLeaveRequests);
router.get('/me', protect, getMyLeaves);
router.put('/:id', protect, admin, updateLeaveStatus);

export default router;
