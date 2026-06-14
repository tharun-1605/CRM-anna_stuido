import mongoose from 'mongoose';

const timeLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  workPackage: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkPackage' },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  duration: { type: Number, default: 0 }, // Duration in hours to match UI
  status: { type: String, enum: ['In Progress', 'Completed', 'Assigned'], default: 'In Progress' },
  notes: { type: String },
}, { timestamps: true });

export default mongoose.model('TimeLog', timeLogSchema);
