import express from 'express';
import { getScreenshots, uploadScreenshot, deleteScreenshots } from '../controllers/screenshotController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, admin, getScreenshots);
router.post('/', protect, uploadScreenshot);
router.post('/bulk-delete', protect, admin, deleteScreenshots);

export default router;
