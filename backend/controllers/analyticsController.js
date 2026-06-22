import mongoose from 'mongoose';
import TimeLog from '../models/TimeLog.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import LeaveRequest from '../models/LeaveRequest.js';

export const getAdminDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(today);
    const day = startOfWeek.getDay() || 7; // Get current day number, converting Sun(0) to 7
    if (day !== 1) startOfWeek.setHours(-24 * (day - 1)); // Adjust to previous Monday

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const lastWeekStart = new Date(startOfWeek);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(endOfWeek);
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);

    // 1. Total Members
    const totalMembers = await User.countDocuments({ role: { $ne: 'Admin' } });

    // 2. Weekly Hours Breakdown (Mon-Sun)
    const currentWeekLogs = await TimeLog.find({
      startTime: { $gte: startOfWeek, $lte: endOfWeek }
    });
    
    let totalHoursWeek = 0;
    const weeklyChart = [0, 0, 0, 0, 0, 0, 0]; // Mon-Sun
    
    currentWeekLogs.forEach(log => {
      totalHoursWeek += log.duration;
      let logDay = new Date(log.startTime).getDay(); // 0 is Sun
      let chartIndex = logDay === 0 ? 6 : logDay - 1; // map 1(Mon)->0, ..., 0(Sun)->6
      weeklyChart[chartIndex] += log.duration;
    });

    const lastWeekLogs = await TimeLog.find({
      startTime: { $gte: lastWeekStart, $lte: lastWeekEnd }
    });
    const totalHoursLastWeek = lastWeekLogs.reduce((acc, log) => acc + log.duration, 0);
    const hoursGrowth = totalHoursLastWeek === 0 ? 100 : Math.round(((totalHoursWeek - totalHoursLastWeek) / totalHoursLastWeek) * 100);

    // 3. Top Project
    const projectStats = await TimeLog.aggregate([
      { $match: { startTime: { $gte: startOfWeek, $lte: endOfWeek }, project: { $ne: null } } },
      { $group: { _id: "$project", totalDuration: { $sum: "$duration" } } },
      { $sort: { totalDuration: -1 } },
      { $limit: 1 }
    ]);
    
    let topProjectName = "-";
    let topProjectHours = 0;
    if (projectStats.length > 0) {
      const topProj = await Project.findById(projectStats[0]._id);
      if (topProj) {
        topProjectName = topProj.name;
        topProjectHours = projectStats[0].totalDuration;
      }
    }

    // 4. Attendance (Today)
    const todayLogs = await TimeLog.find({
      startTime: { $gte: today }
    }).distinct('user');
    const clockedInCount = todayLogs.length;

    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + 1);
    const todayLeaves = await LeaveRequest.find({
      status: 'APPROVED',
      date: { $gte: today, $lt: nextDay }
    });
    const onTimeOffCount = todayLeaves.length;

    // 5. Top 5 Users (Weekly)
    const topUsersStats = await TimeLog.aggregate([
      { $match: { startTime: { $gte: startOfWeek, $lte: endOfWeek } } },
      { $group: { _id: "$user", totalDuration: { $sum: "$duration" } } },
      { $sort: { totalDuration: -1 } },
      { $limit: 5 }
    ]);

    const topUsers = await User.populate(topUsersStats, { path: '_id', select: 'name email' });
    const formattedTopUsers = topUsers.map(u => ({
      name: u._id?.name || 'Unknown',
      hours: u.totalDuration
    }));

    res.json({
      totalMembers,
      totalHoursWeek,
      hoursGrowth,
      weeklyChart,
      topProjectName,
      topProjectHours,
      attendance: {
        clockedIn: clockedInCount,
        onTimeOff: onTimeOffCount,
        live: 0 // Simplification since Live is tracked via WebSockets/short polling
      },
      topUsers: formattedTopUsers,
      dateRange: {
        start: startOfWeek,
        end: endOfWeek
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
