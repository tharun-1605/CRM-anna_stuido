import mongoose from 'mongoose';

const leaveRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  type: { type: String, enum: ['Sick Leave', 'Casual Leave'], default: 'Casual Leave' },
  reason: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
}, { timestamps: true });

export default mongoose.model('LeaveRequest', leaveRequestSchema);
