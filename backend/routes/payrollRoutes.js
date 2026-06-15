import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { getPayrolls, runPayroll, updatePayrollStatus } from '../controllers/payrollController.js';

const router = express.Router();

router.get('/', protect, admin, getPayrolls);
router.post('/run', protect, admin, runPayroll);
router.put('/:id/status', protect, admin, updatePayrollStatus);

export default router;
