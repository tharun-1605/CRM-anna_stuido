import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const adminExists = await User.findOne({ email: 'zaadmin@crm.com' });
    if (adminExists) {
      console.log('Admin already exists');
      process.exit(0);
    }

    const admin = new User({
      name: 'System Admin',
      email: 'zaadmin@crm.com',
      password: 'zalodin',
      role: 'Admin'
    });

    await admin.save();
    console.log('Admin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
