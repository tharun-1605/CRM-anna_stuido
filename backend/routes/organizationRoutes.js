import express from 'express';
import Organization from '../models/Organization.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, admin, async (req, res) => {
  try {
    const orgs = await Organization.find({});
    res.json(orgs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, admin, async (req, res) => {
  try {
    const org = new Organization(req.body);
    const createdOrg = await org.save();
    res.status(201).json(createdOrg);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
