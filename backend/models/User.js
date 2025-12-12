import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, minlength: 6 }, // Optional for Firebase users
    phone: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    
    // Subscription information
    subscription: {
      currentSubscriptionId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Subscription' 
      },
      stripeCustomerId: { 
        type: String,
        index: true,
        sparse: true
      },
      hasUsedTrial: { 
        type: Boolean, 
        default: false 
      },
      trialUsedAt: { 
        type: Date 
      },
      previousSubscriptions: [{
        subscriptionId: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: 'Subscription' 
        },
        status: { 
          type: String,
          enum: ['expired', 'cancelled', 'failed']
        },
        changedAt: { 
          type: Date, 
          default: Date.now 
        }
      }]
    },
    loginCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ firebaseUid: 1 }, { unique: true, sparse: true });

export default mongoose.model('User', UserSchema);
