import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  date: { type: Date },
  startTime: { type: String },
  endTime: { type: String },
  eventType: { type: String },
  service: { type: String },
  location: { type: String },
  cameraMan: { type: String },
  hdd: { type: String },
  copiedBy: { type: String },
  notes: { type: String }
});

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  projectType: { type: String },
  customer: { type: String },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  location: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  eventDuration: { type: String },
  notes: { type: String },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  events: [eventSchema]
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
