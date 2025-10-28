import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  if (!admin.apps.length) {
    try {
      // Clean and format the private key
      const privateKey = process.env.FIREBASE_PRIVATE_KEY
        ?.replace(/\\n/g, '\n')
        ?.replace(/"/g, '')
        ?.trim();

      if (!privateKey || !process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL) {
        throw new Error('Missing Firebase configuration. Please check your environment variables.');
      }

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: privateKey,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
      
      console.log('🔥 Firebase Admin initialized successfully');
      console.log('📋 Project ID:', process.env.FIREBASE_PROJECT_ID);
    } catch (error) {
      console.error('❌ Firebase Admin initialization error:', error.message);
      console.error('🔍 Check your Firebase environment variables in .env file');
    }
  }
  return admin;
};

export { initializeFirebase };
export default admin;
