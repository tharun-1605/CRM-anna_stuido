import Screenshot from '../models/Screenshot.js';
import WorkPackage from '../models/WorkPackage.js';

export const getScreenshots = async (req, res) => {
  try {
    const { user, project, startDate, endDate } = req.query;
    let query = {};
    if (user) query.user = user;
    if (project) query.project = project;
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    const screenshots = await Screenshot.find(query)
      .populate('user', 'name email')
      .populate('project', 'name')
      .populate('workPackage', 'name')
      .sort({ date: -1 });
    res.json(screenshots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadScreenshot = async (req, res) => {
  try {
    const { imageUrl, activeTask } = req.body;
    let project = null;
    if (activeTask) {
      const task = await WorkPackage.findById(activeTask);
      if (task) project = task.project;
    }
    const screenshot = await Screenshot.create({
      user: req.user._id,
      date: new Date(),
      imageUrl,
      timeCaptured: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      workPackage: activeTask || null,
      project
    });
    res.status(201).json(screenshot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteScreenshots = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: 'No screenshot IDs provided' });
    }
    await Screenshot.deleteMany({ _id: { $in: ids } });
    res.json({ message: 'Screenshots deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
