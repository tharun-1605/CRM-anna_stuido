import Client from '../models/Client.js';

export const getClients = async (req, res) => {
  try {
    const clients = await Client.find({});
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createClient = async (req, res) => {
  try {
    const { name, email, company, status } = req.body;
    const client = await Client.create({ name, email, company, status });
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
