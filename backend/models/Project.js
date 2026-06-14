import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  projectType: { type: String },
  customer: { type: String },
  client: { type: String },
  location: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  eventDuration: { type: String },
  notes: { type: String },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
