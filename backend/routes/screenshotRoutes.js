import express from 'express';
import { getScreenshots } from '../controllers/screenshotController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, admin, getScreenshots);

export default router;
