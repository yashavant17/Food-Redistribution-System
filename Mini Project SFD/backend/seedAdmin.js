const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-food-redistribution', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@sfd.com' });
    
    if (!adminExists) {
      await User.create({
        name: 'System Admin',
        email: 'admin@sfd.com',
        password: 'password123', // Model hook will hash this!
        role: 'admin',
        isActive: true,
        isApproved: true
      });
      console.log('✅ Default Admin account created!');
    } else {
      console.log('⚡ Admin already exists!');
    }
    process.exit();
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

seedAdmin();
