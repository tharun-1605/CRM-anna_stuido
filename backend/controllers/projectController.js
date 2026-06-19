import Project from '../models/Project.js';
import Task from '../models/Task.js';
import WorkPackage from '../models/WorkPackage.js';

export const getProjects = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role !== 'Admin' && req.query.all !== 'true') {
      const userTasks = await Task.find({ assignees: req.user._id });
      const userWorkPackages = await WorkPackage.find({ user: req.user._id });
      
      const projectIdsFromTasks = userTasks.map(t => t.project);
      const projectIdsFromWorkPackages = userWorkPackages.map(wp => wp.project);
      
      const allProjectIds = [...projectIdsFromTasks, ...projectIdsFromWorkPackages];
      
      filter = {
        $or: [
          { users: req.user._id },
          { _id: { $in: allProjectIds } }
        ]
      };
    }
    const projects = await Project.find(filter).populate('users', 'name email').populate('client');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(project);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Not found' });
    await project.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};
