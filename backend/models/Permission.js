import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema({
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
  resource: { type: String, required: true },
  actions: [{ type: String, enum: ['create', 'read', 'update', 'delete'] }],
}, { timestamps: true });

export default mongoose.model('Permission', permissionSchema);
