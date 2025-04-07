const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/user');

dotenv.config();
connectDB();

const seedUsers = async () => {
  await User.deleteMany();

  const hashedPassword = await bcrypt.hash('admin123', 10);

  await User.insertMany([
    {
      email: 'admin@example.com',
      password: hashedPassword,
      roles: ['admin'],
    },
    {
      email: 'vendor@example.com',
      password: hashedPassword,
      roles: ['vendor'],
    },
  ]);

  console.log('Users Seeded');
  process.exit();
};

seedUsers();
