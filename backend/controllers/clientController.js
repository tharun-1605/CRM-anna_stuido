import Client from '../models/Client.js';
import Project from '../models/Project.js';

export const getClients = async (req, res) => {
  try {
    const clients = await Client.find({});
    const projects = await Project.find({ client: { $in: clients.map(c => c._id) } });
    
    const clientsWithProjects = clients.map(c => {
      const clientProjects = projects.filter(p => p.client && p.client.toString() === c._id.toString());
      return {
        ...c._doc,
        projects: clientProjects
      };
    });
    
    res.json(clientsWithProjects);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createClient = async (req, res) => {
  try {
    const { name, email, phone, company, status } = req.body;
    const client = await Client.create({ name, email, phone, company, status });
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


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
