import express from 'express';
import { registerUser, loginUser, getUsers, modifyUser, resetPassword, deleteUser } from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', protect, admin, registerUser);
router.get('/users', protect, admin, getUsers);
router.put('/users/:id', protect, admin, modifyUser);
router.put('/users/:id/reset-password', protect, admin, resetPassword);

router.delete('/users/:id', protect, admin, deleteUser);
export default router;
