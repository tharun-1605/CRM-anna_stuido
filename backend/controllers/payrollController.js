import Payroll from '../models/Payroll.js';
import User from '../models/User.js';
import TimeLog from '../models/TimeLog.js';

// @desc    Get all payrolls
// @route   GET /api/payrolls
export const getPayrolls = async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = {};
    if (month) filter.month = parseInt(month);
    if (year) filter.year = parseInt(year);

    const payrolls = await Payroll.find(filter).populate('user', 'name email hourlyRate');
    res.json(payrolls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Run payroll for a specific month and year
// @route   POST /api/payrolls/run
export const runPayroll = async (req, res) => {
  try {
    const { month, year } = req.body;
    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required' });
    }

    // Define the date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Get all non-admin users
    const users = await User.find({ role: { $ne: 'Admin' } });

    const processedPayrolls = [];

    for (const user of users) {
      // Find time logs for this user in the specified month
      const logs = await TimeLog.find({
        user: user._id,
        startTime: { $gte: startDate, $lte: endDate }
      });

      const totalHours = logs.reduce((acc, log) => acc + (log.duration || 0), 0);
      
      // Assume default hourly rate of 20 if not set
      const hourlyRate = user.hourlyRate || 20;
      const basicSalary = totalHours * hourlyRate;
      const netPay = basicSalary; // Ignoring overtime/deductions for simplicity

      // Check if payroll already exists for this user/month/year
      let payroll = await Payroll.findOne({ user: user._id, month, year });

      if (payroll) {
        // Update existing
        payroll.basicSalary = basicSalary;
        payroll.netPay = netPay;
        await payroll.save();
      } else {
        // Create new
        payroll = await Payroll.create({
          user: user._id,
          month,
          year,
          basicSalary,
          netPay,
          status: 'Pending'
        });
      }
      
      // Populate user info for the response
      await payroll.populate('user', 'name email');
      processedPayrolls.push(payroll);
    }

    res.status(200).json({ message: 'Payroll run successful', payrolls: processedPayrolls });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update payroll status
// @route   PUT /api/payrolls/:id/status
export const updatePayrollStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const payroll = await Payroll.findById(req.params.id);
    
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll not found' });
    }

    payroll.status = status;
    await payroll.save();
    
    await payroll.populate('user', 'name email');
    res.json(payroll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update payroll basic salary and net pay
// @route   PUT /api/payrolls/:id
export const updatePayroll = async (req, res) => {
  try {
    const { basicSalary } = req.body;
    const payroll = await Payroll.findById(req.params.id);
    
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll not found' });
    }

    payroll.basicSalary = basicSalary;
    payroll.netPay = basicSalary; // Assuming basic salary is net pay for now
    await payroll.save();
    
    await payroll.populate('user', 'name email');
    res.json(payroll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
