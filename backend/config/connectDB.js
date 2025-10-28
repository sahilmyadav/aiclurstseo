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

   try {
     await mongoose.connect(uri, { dbName });
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

