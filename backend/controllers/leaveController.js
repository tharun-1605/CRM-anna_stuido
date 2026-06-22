import LeaveRequest from '../models/LeaveRequest.js';

export const createLeaveRequest = async (req, res) => {
  try {
    const { date, reason, type } = req.body;
    const leave = await LeaveRequest.create({
      user: req.user._id,
      date,
      reason,
      type: type || 'Casual Leave'
    });
    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyLeaves = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getLeaveRequests = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({}).populate('user', 'name email');
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateLeaveStatus = async (req, res) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (leave) {
      leave.status = req.body.status;
      const updatedLeave = await leave.save();
      res.json(updatedLeave);
    } else {
      res.status(404).json({ message: 'Leave request not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
