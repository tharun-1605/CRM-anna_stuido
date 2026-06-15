import express from 'express';
import { updateLiveFrame, getLiveFeed } from '../controllers/liveController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/frame', protect, updateLiveFrame);
router.get('/', protect, admin, getLiveFeed);

export default router;
