import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect('mongodb://127.0.0.1:27017/crm').then(async () => {
  const user = await User.findOne({ email: 'user@example.com' });
  if (!user) {
    await User.create({ name: 'Test User', email: 'user@example.com', password: 'password123', role: 'Employee' });
    console.log('User created');
  } else {
    console.log('User exists');
  }
  process.exit();
}).catch(console.error);
