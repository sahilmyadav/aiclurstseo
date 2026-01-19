 import mongoose from 'mongoose';

let isConnected = false;

/**
 * Connect to MongoDB using mongoose
 * Reads MONGODB_URI from environment variables
 * The database name should be included in the MONGODB_URI
 */
async function connectDB() {
  if (isConnected) return mongoose.connection;

  const connectionString = process.env.MONGODB_URI;
  
  if (!connectionString) {
    throw new Error('MongoDB connection string is not defined in environment variables');
  }

  try {
    await mongoose.connect(connectionString);
    isConnected = true;

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('MongoDB disconnected');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB error:', err.message);
    });

    console.log('MongoDB connected');
    return mongoose.connection;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err;
  }
}

export { connectDB };
