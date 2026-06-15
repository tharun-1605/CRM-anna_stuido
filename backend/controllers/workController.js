import WorkPackage from '../models/WorkPackage.js';
import TimeLog from '../models/TimeLog.js';

// @desc    Assign work to user (Admin)
// @route   POST /api/work
export const assignWork = async (req, res) => {
  try {
    const { user, project, name, estimatedHours } = req.body;
    const workPackage = await WorkPackage.create({
      user,
      project,
      name,
      estimatedHours
    });
    res.status(201).json(workPackage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all work packages (Admin view)
// @route   GET /api/work
export const getAllWork = async (req, res) => {
  try {
    const workPackages = await WorkPackage.find({})
      .populate('user', 'name')
      .populate('project', 'name');
    
    // We also need to get the time logs for each work package
    const packagesWithLogs = await Promise.all(workPackages.map(async (wp) => {
      const logs = await TimeLog.find({ workPackage: wp._id });
      const timeSpent = logs.reduce((acc, log) => acc + log.duration, 0);
      return { ...wp._doc, timeLogs: logs, timeSpent };
    }));

    res.json(packagesWithLogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my work packages (Employee view)
// @route   GET /api/work/me
export const getMyWork = async (req, res) => {
  try {
    const workPackages = await WorkPackage.find({ user: req.user._id })
      .populate('project', 'name');
    
    const packagesWithLogs = await Promise.all(workPackages.map(async (wp) => {
      const logs = await TimeLog.find({ workPackage: wp._id });
      const timeSpent = logs.reduce((acc, log) => acc + log.duration, 0);
      return { ...wp._doc, timeLogs: logs, timeSpent };
    }));

    res.json(packagesWithLogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a manual time log to a work package
// @route   POST /api/work/:id/log
export const addTimeLog = async (req, res) => {
  try {
    const { startTime, endTime, duration, notes, status } = req.body;
    const workPackage = await WorkPackage.findById(req.params.id);
    if (!workPackage) return res.status(404).json({ message: 'Work package not found' });

    const timeLog = await TimeLog.create({
      user: req.user._id,
      project: workPackage.project,
      workPackage: workPackage._id,
      startTime,
      endTime,
      duration,
      notes,
      status
    });

    res.status(201).json(timeLog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const updateWorkPackage = async (req, res) => {
  try {
    const work = await WorkPackage.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(work);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
export const deleteWorkPackage = async (req, res) => {
  try {
    const work = await WorkPackage.findById(req.params.id);
    if (!work) return res.status(404).json({ message: 'Not found' });
    await work.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};
