import mongoose from 'mongoose';
import User from './models/User.js';

await mongoose.connect('mongodb://localhost:27017/crm');

const admin = await User.create({
  name: 'Admin',
  email: 'admin@crm.com',
  password: 'Admin@123',
  role: 'Admin'
});

console.log('Admin created');
process.exit();