const fs = require('fs');

function addExports(file, code) {
  let content = fs.readFileSync(file, 'utf8');
  content += '\n' + code;
  fs.writeFileSync(file, content);
}

function addRoutes(file, code) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/export default router;/, code + '\nexport default router;');
  fs.writeFileSync(file, content);
}

function modifyAuthRoutes() {
  const file = 'backend/routes/authRoutes.js';
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace("import { registerUser, loginUser, getUsers, modifyUser, resetPassword }", "import { registerUser, loginUser, getUsers, modifyUser, resetPassword, deleteUser }");
  content = content.replace(/export default router;/, "router.delete('/users/:id', protect, admin, deleteUser);\nexport default router;");
  fs.writeFileSync(file, content);
  
  addExports('backend/controllers/authController.js', `
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.deleteOne();
    res.json({ message: 'User deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};
`);
}

function modifyClients() {
  addExports('backend/controllers/clientController.js', `
export const updateClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(client);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Not found' });
    await client.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};
`);
  let content = fs.readFileSync('backend/routes/clientRoutes.js', 'utf8');
  content = content.replace("import { getClients, createClient }", "import { getClients, createClient, updateClient, deleteClient }");
  content = content.replace(/export default router;/, "router.route('/:id').put(protect, updateClient).delete(protect, deleteClient);\nexport default router;");
  fs.writeFileSync('backend/routes/clientRoutes.js', content);
}

function modifyProjects() {
  addExports('backend/controllers/projectController.js', `
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
`);
  let content = fs.readFileSync('backend/routes/projectRoutes.js', 'utf8');
  content = content.replace("import { getProjects, createProject }", "import { getProjects, createProject, updateProject, deleteProject }");
  content = content.replace(/export default router;/, "router.route('/:id').put(protect, admin, updateProject).delete(protect, admin, deleteProject);\nexport default router;");
  fs.writeFileSync('backend/routes/projectRoutes.js', content);
}

function modifyTeams() {
  addExports('backend/controllers/teamController.js', `
export const updateTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(team);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
export const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Not found' });
    await team.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};
`);
  let content = fs.readFileSync('backend/routes/teamRoutes.js', 'utf8');
  content = content.replace("import { getTeams, createTeam }", "import { getTeams, createTeam, updateTeam, deleteTeam }");
  content = content.replace(/export default router;/, "router.route('/:id').put(protect, admin, updateTeam).delete(protect, admin, deleteTeam);\nexport default router;");
  fs.writeFileSync('backend/routes/teamRoutes.js', content);
}

function modifyWork() {
  addExports('backend/controllers/workController.js', `
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
`);
  let content = fs.readFileSync('backend/routes/workRoutes.js', 'utf8');
  content = content.replace("import { assignWork, getAllWork, getMyWork, addTimeLog }", "import { assignWork, getAllWork, getMyWork, addTimeLog, updateWorkPackage, deleteWorkPackage }");
  content = content.replace(/export default router;/, "router.route('/:id').put(protect, updateWorkPackage).delete(protect, admin, deleteWorkPackage);\nexport default router;");
  fs.writeFileSync('backend/routes/workRoutes.js', content);
}

modifyAuthRoutes();
modifyClients();
modifyProjects();
modifyTeams();
modifyWork();

console.log('Backend routes and controllers updated successfully');
