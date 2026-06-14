import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';

dotenv.config();

connectDB();

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'zaadmin' });
    
    if (adminExists) {
      console.log('zaadmin user already exists');
      process.exit();
    }

    await User.create({
      name: 'Super Admin',
      email: 'zaadmin',
      password: 'zalogin',
      role: 'Admin'
    });

    console.log('zaadmin user seeded successfully');
    process.exit();
  } catch (error) {
    console.error(`Error with seeding data: ${error}`);
    process.exit(1);
  }
};

seedAdmin();
