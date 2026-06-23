import WorkPackage from '../models/WorkPackage.js';
import TimeLog from '../models/TimeLog.js';
import Team from '../models/Team.js';
import Project from '../models/Project.js';

// @desc    Assign work to user or team (Admin)
// @route   POST /api/work
export const assignWork = async (req, res) => {
  try {
    const { user, team, project, name, estimatedHours, priority, dueDate } = req.body;
    
    if (team) {
      const teamDoc = await Team.findById(team);
      if (!teamDoc) return res.status(404).json({ message: 'Team not found' });
      
      const workPackage = await WorkPackage.create({
        team,
        project,
        name,
        estimatedHours,
        priority,
        dueDate
      });
      return res.status(201).json(workPackage);
    } else if (user) {
      const workPackage = await WorkPackage.create({
        user,
        project,
        name,
        estimatedHours,
        priority,
        dueDate
      });
      return res.status(201).json(workPackage);
    } else {
      return res.status(400).json({ message: 'Please provide either user or team to assign work to.' });
    }
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
      .populate('team', 'name')
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
    const userTeams = await Team.find({ members: req.user._id });
    const teamIds = userTeams.map(t => t._id);
    
    const workPackages = await WorkPackage.find({
      $or: [
        { user: req.user._id },
        { team: { $in: teamIds } }
      ]
    })
      .populate('team', 'name')
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
    
    if (work) {
      const allWork = await WorkPackage.find({ project: work.project });
      const allCompleted = allWork.length > 0 && allWork.every(wp => wp.status === 'Completed');
      
      if (allCompleted) {
        await Project.findByIdAndUpdate(work.project, { status: 'Completed' });
      } else if (req.body.status && req.body.status !== 'Completed') {
        const project = await Project.findById(work.project);
        if (project && project.status === 'Completed') {
          await Project.findByIdAndUpdate(work.project, { status: 'In Progress' });
        }
      }
    }

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
