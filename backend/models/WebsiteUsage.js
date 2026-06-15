import mongoose from 'mongoose';

const websiteUsageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  url: { type: String, required: true },
  domain: { type: String, required: true },
  duration: { type: Number, required: true }, // in seconds
  category: { type: String },
}, { timestamps: true });

export default mongoose.model('WebsiteUsage', websiteUsageSchema);
