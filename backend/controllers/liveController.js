export const liveFrames = {};

export const updateLiveFrame = (req, res) => {
  const { frame, activeTask } = req.body;
  liveFrames[req.user._id] = {
    user: { _id: req.user._id, name: req.user.name, email: req.user.email },
    frame,
    activeTask,
    lastUpdated: new Date()
  };
  res.status(200).send('OK');
};

export const getLiveFeed = (req, res) => {
  const now = new Date();
  const activeUsers = Object.values(liveFrames).filter(data => 
    (now - data.lastUpdated) < 30000 // Only show users updated in the last 30s
  );
  res.json(activeUsers);
};
