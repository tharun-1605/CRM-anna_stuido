import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  clockIn: { type: Date },
  clockOut: { type: Date },
  status: { type: String, enum: ['Present', 'Absent', 'Late', 'Half Day'], default: 'Present' },
  totalHours: { type: Number, default: 0 },
  breaks: [{
    type: { type: String, enum: ['Lunch', 'Break'] },
    startTime: { type: Date },
    endTime: { type: Date }
  }],
}, { timestamps: true });

export default mongoose.model('Attendance', attendanceSchema);
