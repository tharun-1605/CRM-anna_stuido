import express from 'express';
import { getClients, createClient } from '../controllers/clientController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getClients).post(protect, createClient);

export default router;
