import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  company: { type: String },
  status: { type: String, enum: ['Active', 'Archived'], default: 'Active' }
}, { timestamps: true });

export default mongoose.model('Client', clientSchema);
