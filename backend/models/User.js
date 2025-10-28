import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, minlength: 6 }, // Optional for Firebase users
    phone: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    
    // Firebase fields
    firebaseUid: { type: String },
    avatar: { type: String },
    provider: { type: String, enum: ['local', 'google', 'firebase'], default: 'local' },
    isEmailVerified: { type: Boolean, default: false },
    
    // Login tracking
    lastLogin: { type: Date, default: Date.now },
    loginCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ phone: 1 }, { unique: true, sparse: true });
UserSchema.index({ firebaseUid: 1 }, { unique: true, sparse: true });

export default mongoose.model('User', UserSchema);
