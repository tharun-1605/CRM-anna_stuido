import Attendance from '../models/Attendance.js';

export const getTodayAttendance = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    // Find the most recent record
    let attendance = await Attendance.findOne({ user: req.user._id }).sort({ date: -1 });
    
    // Only return if it's from today
    if (attendance && new Date(attendance.date) < startOfDay) {
      attendance = null;
    }

    res.json(attendance || null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const clockIn = async (req, res) => {
  try {
    let attendance = await Attendance.findOne({ user: req.user._id }).sort({ date: -1 });
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const isToday = attendance && new Date(attendance.date) >= startOfDay;

    if (isToday) {
      return res.status(400).json({ message: 'Already clocked in today' });
    }

    attendance = await Attendance.create({
      user: req.user._id,
      date: new Date(),
      clockIn: new Date()
    });

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const clockOut = async (req, res) => {
  try {
    const attendance = await Attendance.findOne({ user: req.user._id }).sort({ date: -1 });
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const isToday = attendance && new Date(attendance.date) >= startOfDay;

    if (!isToday || !attendance) {
      return res.status(404).json({ message: 'No active attendance record found for today' });
    }

    if (attendance.clockOut) {
      return res.status(400).json({ message: 'Already clocked out' });
    }

    attendance.clockOut = new Date();
    
    let totalMs = attendance.clockOut.getTime() - attendance.clockIn.getTime();
    
    attendance.breaks.forEach(b => {
      if (b.startTime && b.endTime) {
        totalMs -= (b.endTime.getTime() - b.startTime.getTime());
      } else if (b.startTime && !b.endTime) {
        b.endTime = new Date();
        totalMs -= (b.endTime.getTime() - b.startTime.getTime());
      }
    });

    attendance.totalHours = totalMs / (1000 * 60 * 60); 
    attendance.markModified('breaks');
    await attendance.save();

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const startBreak = async (req, res) => {
  try {
    const { type } = req.body; 
    const attendance = await Attendance.findOne({ user: req.user._id }).sort({ date: -1 });
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const isToday = attendance && new Date(attendance.date) >= startOfDay;

    if (!isToday || !attendance || attendance.clockOut) {
      return res.status(400).json({ message: 'Not currently clocked in' });
    }

    const activeBreak = attendance.breaks.find(b => !b.endTime);
    if (activeBreak) {
      return res.status(400).json({ message: 'Already on a break' });
    }

    attendance.breaks.push({ type, startTime: new Date() });
    attendance.markModified('breaks');
    await attendance.save();

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const endBreak = async (req, res) => {
  try {
    const attendance = await Attendance.findOne({ user: req.user._id }).sort({ date: -1 });
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const isToday = attendance && new Date(attendance.date) >= startOfDay;

    if (!isToday || !attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    const activeBreak = attendance.breaks.find(b => !b.endTime);
    if (!activeBreak) {
      return res.status(400).json({ message: 'Not currently on a break' });
    }

    activeBreak.endTime = new Date();
    attendance.markModified('breaks');
    await attendance.save();

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllAttendance = async (req, res) => {
  try {
    const { date } = req.query;
    let query = {};
    
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      query.date = { $gte: start, $lt: end };
    }

    const records = await Attendance.find(query).populate('user', 'name email').sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
