import Screenshot from '../models/Screenshot.js';

export const getScreenshots = async (req, res) => {
  try {
    const { user, startDate, endDate } = req.query;
    let query = {};
    if (user) query.user = user;
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    const screenshots = await Screenshot.find(query).populate('user', 'name email');
    res.json(screenshots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
