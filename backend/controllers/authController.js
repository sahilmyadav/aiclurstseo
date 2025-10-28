import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
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

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

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
