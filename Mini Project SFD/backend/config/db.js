const mongoose = require('mongoose');
const User = require('../models/User');

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-food-redistribution';
    
    // Use local MongoDB if placeholder is set
    if (uri.includes('your_mongodb_connection_string')) {
      uri = 'mongodb://localhost:27017/smart-food-redistribution';
    }
    
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Auto-seed admin if new connection
    try {
      const adminExists = await User.findOne({ email: 'admin@sfd.com' });
      if (!adminExists) {
        await User.create({
          name: 'System Admin',
          email: 'admin@sfd.com',
          password: 'password123',
          role: 'admin',
          isActive: true,
          isApproved: true
        });
        console.log('✅ Admin account seeded! (admin@sfd.com / password123)');
      }
    } catch (seedError) {
      console.log('ℹ️  Admin seed skipped');
    }
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('⚠️  Make sure MongoDB is running on localhost:27017');
    console.error('    Or set MONGO_URI environment variable');
    console.log('🔄 Falling back to in-memory MongoDB...');
    
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoServer.getUri();
      
      const conn = await mongoose.connect(inMemoryUri);
      console.log(`✅ In-Memory MongoDB Connected: ${conn.connection.host}`);
      
      // Auto-seed admin if new connection
      try {
        const adminExists = await User.findOne({ email: 'admin@sfd.com' });
        if (!adminExists) {
          await User.create({
            name: 'System Admin',
            email: 'admin@sfd.com',
            password: 'password123',
            role: 'admin',
            isActive: true,
            isApproved: true
          });
          console.log('✅ Admin account seeded! (admin@sfd.com / password123)');
        }
      } catch (seedError) {
        console.log('ℹ️  Admin seed skipped');
      }
    } catch (memError) {
      console.error(`❌ In-Memory MongoDB Error: ${memError.message}`);
    }
  }
};

module.exports = connectDB;
