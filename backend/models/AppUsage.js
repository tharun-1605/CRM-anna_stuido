import mongoose from 'mongoose';

const appUsageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appName: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  duration: { type: Number, required: true }, // in seconds
}, { timestamps: true });

export default mongoose.model('AppUsage', appUsageSchema);
