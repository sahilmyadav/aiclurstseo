import mongoose from "mongoose";

const trialUsageSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    lowercase: true, 
    trim: true,
    unique: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  usedAt: { 
    type: Date, 
    default: Date.now 
  },
  endDate: {
    type: Date,
    required: true
  },
  ipAddress: { 
    type: String 
  },
  userAgent: { 
    type: String 
  }
}, {
  timestamps: true
});

// Index for faster lookups
trialUsageSchema.index({ email: 1 });
trialUsageSchema.index({ userId: 1 });

export default mongoose.model("TrialUsage", trialUsageSchema);
