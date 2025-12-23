import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
      enum: ['Daily', 'Monthly', 'Yearly']
    },
    planType: {
      type: String,
      required: true,
      enum: ['daily', 'monthly', 'yearly'],
      unique: true
    },
    description: { 
      type: String,
      required: true
    },
    pricePerProfile: { 
      type: Number, 
      required: true,
      min: 0
    },
    discountPercent: { 
      type: Number, 
      default: 0,
      min: 0,
      max: 100
    },
    isPopular: {
      type: Boolean,
      default: false
    },
    features: [{
      type: String,
      required: true
    }],
    buttonText: {
      type: String,
      default: 'Get Started'
    },
    badgeText: {
      type: String,
      default: ''
    },
    isActive: { 
      type: Boolean, 
      default: true 
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Plan", planSchema);
