import express from 'express';
import Payroll from '../models/Payroll.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, admin, async (req, res) => {
  try {
    const payrolls = await Payroll.find({}).populate('user', 'name email');
    res.json(payrolls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, admin, async (req, res) => {
  try {
    const payroll = new Payroll(req.body);
    const createdPayroll = await payroll.save();
    res.status(201).json(createdPayroll);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
