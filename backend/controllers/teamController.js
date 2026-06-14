import Team from '../models/Team.js';

export const getTeams = async (req, res) => {
  try {
    const teams = await Team.find({}).populate('members', 'name email');
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createTeam = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const team = await Team.create({ name, description, members });
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
