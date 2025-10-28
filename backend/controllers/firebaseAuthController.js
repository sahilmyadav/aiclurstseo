import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import admin from '../config/firebase.js';

const genToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Firebase Google Signup
export const firebaseGoogleSignup = async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ message: 'Firebase ID token is required' });
    }

    console.log('🔥 Firebase Google signup attempt');

    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    const {
      uid: firebaseUid,
      email,
      name,
      picture,
      email_verified,
      firebase
    } = decodedToken;

    console.log('📊 Firebase user data:', {
      firebaseUid,
      email,
      name,
      picture,
      email_verified,
      provider: firebase?.identities?.['google.com'] ? 'google' : 'firebase'
    });

    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // User exists - update login info
      user.lastLogin = new Date();
      user.loginCount = (user.loginCount || 0) + 1;
      
      // Update Firebase info if not already set
      if (!user.firebaseUid) {
        user.firebaseUid = firebaseUid;
        user.avatar = picture;
        user.isEmailVerified = email_verified;
        user.provider = 'google';
      }
      
      await user.save();
      
      console.log('🔄 Existing user logged in via Firebase:', {
        id: user._id,
        email: user.email,
        loginCount: user.loginCount
      });

      const token = genToken(user);
      
      return res.json({
        success: true,
        message: 'Welcome back!',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          provider: user.provider,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin
        },
        token
      });
    } else {
      // Create new user
      user = await User.create({
        name: name || email.split('@')[0], // Use email prefix if no name
        email: email.toLowerCase(),
        firebaseUid,
        avatar: picture,
        provider: 'google',
        isEmailVerified: email_verified || false,
        lastLogin: new Date(),
        loginCount: 1
      });

      console.log('✅ New user created via Firebase:', {
        id: user._id,
        email: user.email,
        provider: user.provider
      });

      const token = genToken(user);
      
      return res.status(201).json({
        success: true,
        message: 'Account created successfully!',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          provider: user.provider,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin
        },
        token
      });
    }

  } catch (error) {
    console.error('❌ Firebase Google signup error:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ message: 'Token expired. Please sign in again.' });
    }
    
    if (error.code === 'auth/invalid-id-token') {
      return res.status(401).json({ message: 'Invalid token. Please sign in again.' });
    }

    return res.status(500).json({ message: 'Authentication failed. Please try again.' });
  }
};
