import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getTodayAttendance,
  clockIn,
  clockOut,
  startBreak,
  endBreak,
  getAllAttendance
} from '../controllers/attendanceController.js';

const router = express.Router();

router.get('/today', protect, getTodayAttendance);
router.post('/clock-in', protect, clockIn);
router.post('/clock-out', protect, clockOut);
router.post('/break/start', protect, startBreak);
router.post('/break/end', protect, endBreak);

router.get('/', protect, admin, getAllAttendance);

export default router;
