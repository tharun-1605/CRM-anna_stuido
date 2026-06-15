import Project from '../models/Project.js';

export const getProjects = async (req, res) => {
  try {
    const filter = req.user.role === 'Admin' ? {} : { users: req.user._id };
    const projects = await Project.find(filter).populate('users', 'name email');
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
