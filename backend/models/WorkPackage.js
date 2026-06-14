import mongoose from 'mongoose';

const workPackageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  name: { type: String, required: true },
  estimatedHours: { type: Number, required: true },
  status: { type: String, enum: ['Assigned', 'In Progress', 'Completed'], default: 'Assigned' },
}, { timestamps: true });

export default mongoose.model('WorkPackage', workPackageSchema);
