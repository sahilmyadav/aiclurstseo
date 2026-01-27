import mongoose from 'mongoose';

let isConnected = false;

/**
 * Connect to MongoDB using mongoose
 * Reads MONGODB_URI and MONGODB_DB from environment variables
 */
async function connectDB() {
  if (isConnected) return mongoose.connection;

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/clurst';
  const dbName = process.env.MONGODB_DB || 'clurst';

  // Log connection attempt (mask password for security)
  const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
  console.log(`🔌 Attempting MongoDB connection to: ${maskedUri}`);
  console.log(`📦 Database name: ${dbName}`);

  try {
    await mongoose.connect(uri, {
      dbName,
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      socketTimeoutMS: 45000, // 45 second socket timeout
    });
    isConnected = true;

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB error:', err.message);
    });

    mongoose.connection.on('reconnected', () => {
      isConnected = true;
      console.log('🔄 MongoDB reconnected');
    });

    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
    return mongoose.connection;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('📋 Full error:', err);
    // Don't throw - let the app start but log the error
    // This allows health checks to work even if DB is temporarily down
    isConnected = false;
    return null;
  }
}
