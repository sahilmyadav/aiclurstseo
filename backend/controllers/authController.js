import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import nodemailer from 'nodemailer';

// Create a nodemailer transporter (configure with your email service)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || '10', 10);

const genToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const register = async (req, res) => {
  console.log("🚀 Registering user...",req.body);
  try {
    let { name, email, password, phone } = req.body; // ignore role from client for signup
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    // Normalize inputs to reduce duplicate variations
    email = String(email).trim().toLowerCase();
    if (phone) phone = String(phone).trim();
    name = String(name).trim();

    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);

    // Rely on unique indexes to prevent race conditions for high concurrency
    const user = await User.create({ 
      name, 
      email, 
      password: hash, 
      phone,
      lastLogin: new Date(),
      loginCount: 1
    });

    const token = genToken(user);
    return res.status(201).json({
      message: 'Registered successfully',
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        phone: user.phone, 
        role: user.role, 
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        loginCount: user.loginCount
      },
      token,
    });
  } catch (err) {
    // Handle duplicate key errors atomically
    if (err && err.code === 11000) {
      if (err.keyPattern?.email) return res.status(409).json({ message: 'Email already in use' });
      if (err.keyPattern?.phone) return res.status(409).json({ message: 'Phone already in use' });
      return res.status(409).json({ message: 'Duplicate value' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
};

// Forgot Password - Generate and send reset token
const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Password Reset Request</h2>
        <p>You requested a password reset. Please click the button below to reset your password:</p>
        <div style="margin: 25px 0;">
          <a href="${resetUrl}" 
             style="background-color: #7C3AED; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; font-weight: bold;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all;">${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      // Don't reveal if user doesn't exist for security
      return res.json({ 
        message: 'If an account exists with this email, you will receive a password reset link shortly.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    // Save token and expiry to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Send email with reset link
    const emailSent = await sendPasswordResetEmail(user.email, resetToken);
    
    if (!emailSent) {
      return res.status(500).json({ message: 'Error sending reset email' });
    }

    return res.json({ 
      message: 'If an account exists with this email, you will receive a password reset link shortly.' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Find user by reset token and check if it's not expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token. Please request a new password reset.' 
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);

    // Update user's password and clear reset token
    user.password = hash;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.json({ 
      message: 'Password has been reset successfully. You can now log in with your new password.' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const validateResetToken = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ valid: false, message: 'Token is required' });
    }

    // Find user by reset token and check if it's not expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        valid: false,
        message: 'Invalid or expired reset token. Please request a new password reset.' 
      });
    }

    return res.json({ 
      valid: true,
      message: 'Valid reset token' 
    });
  } catch (error) {
    console.error('Validate token error:', error);
    return res.status(500).json({ 
      valid: false,
      message: 'Server error' 
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Check if requesting user is admin or requesting their own data
    const requestingUserId = req.user._id.toString();
    
    // If not admin and not requesting own data, deny access
    if (requestingUserId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const user = await User.findById(userId).select('-password -__v');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      loginCount: user.loginCount,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (err) {
    console.error('Error fetching user:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -__v');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      loginCount: user.loginCount,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (err) {
    console.error('Error fetching user:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, phone, password, identifier } = req.body;
    if (!password) return res.status(400).json({ message: 'Password is required' });

    // Support login via email or phone
    const query = {};
    const id = identifier || email || phone;
    if (!id) return res.status(400).json({ message: 'Email or phone is required' });

    if (typeof id === 'string' && id.includes('@')) {
      query.email = id.toLowerCase();
    } else {
      query.phone = id;
    }

    const user = await User.findOne(query);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    // Check if user has a password (might be using OAuth)
    if (!user.password) {
      return res.status(401).json({ 
        message: 'No password set for this account. Please use the same method you used to sign up (e.g., Google).' 
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials' });

    // Update login tracking
    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();

    const token = genToken(user);

    return res.json({
      message: 'Logged in successfully',
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        phone: user.phone, 
        role: user.role, 
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        loginCount: user.loginCount
      },
      token,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
