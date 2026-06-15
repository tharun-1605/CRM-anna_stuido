import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  basicSalary: { type: Number, required: true },
  overtimePay: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  netPay: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Processed', 'Paid'], default: 'Pending' },
}, { timestamps: true });

export default mongoose.model('Payroll', payrollSchema);
