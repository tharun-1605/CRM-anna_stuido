import mongoose from 'mongoose';

const screenshotSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  imageUrl: { type: String, required: true },
  timeCaptured: { type: String }, // e.g., "10:30 AM"
}, { timestamps: true });

export default mongoose.model('Screenshot', screenshotSchema);
