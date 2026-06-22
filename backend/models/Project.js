import mongoose from 'mongoose';

const subServiceSchema = new mongoose.Schema({
  service: { type: String },
  cameraMan: { type: String },
  hdd: { type: String },
  copiedBy: { type: String }
});

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
  notes: { type: String },
  subServices: [subServiceSchema]
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
  status: { type: String, enum: ['Upcoming Shoot', 'Raw Data Backup', 'Culling/Sorting', 'Editing/Retouching', 'Client Review', 'Final Delivery', 'Completed', 'Pending', 'In Progress'], default: 'Upcoming Shoot' },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  events: [eventSchema]
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
