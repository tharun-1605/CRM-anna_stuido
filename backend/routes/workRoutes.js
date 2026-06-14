import express from 'express';
import { assignWork, getAllWork, getMyWork, addTimeLog } from '../controllers/workController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, admin, assignWork)
  .get(protect, admin, getAllWork);

router.get('/me', protect, getMyWork);
router.post('/:id/log', protect, addTimeLog);

export default router;
