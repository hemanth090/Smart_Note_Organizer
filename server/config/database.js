/**
 * MongoDB Database Connection Configuration
 * Handles connection to MongoDB using Mongoose
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-notes-organizer';
    
    const conn = await mongoose.connect(mongoURI);

    console.log(`📊 MongoDB Connected: ${conn.connection.host}`);
    console.log(`🗄️  Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📊 MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('📊 MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    // In development, continue without database
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  Continuing without database in development mode');
      return;
    }
    
    // In production, exit the process
    process.exit(1);
  }
};

module.exports = connectDB;
