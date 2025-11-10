import mongoose from 'mongoose';

const scheduledPostSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  accountId: {
    type: String,
    required: true
  },
  locationId: {
    type: String,
    required: true
  },
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  isScheduled: {
    type: Boolean,
    default: false
  },
  scheduledFor: {
    type: Date,
    default: null
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  repeatType: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', null],
    default: null
  },
  repeatDays: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  }],
  status: {
    type: String,
    enum: ['pending', 'processing', 'posted', 'failed', 'cancelled', 'pending_oauth'],
    default: 'pending'
  },
  lastRun: {
    type: Date,
    default: null
  },
  nextRun: {
    type: Date,
    default: null
  },
  tokenDetails: {
    accessToken: {
      type: String,
      required: false
    },
    refreshToken: {
      type: String,
      required: false
    },
    expiryDate: {
      type: Date,
      required: false
    },
    scopes: [{
      type: String
    }]
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
    
  },
  postedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes
scheduledPostSchema.index({ accountId: 1, locationId: 1 });
scheduledPostSchema.index({ status: 1, nextRun: 1 });

// Calculate next run date
scheduledPostSchema.methods.calculateNextRun = function() {
  if (!this.isRecurring || !this.scheduledFor) return null;
  
  // Get current time in UTC
  const now = new Date();
  
  // Create a date object for the scheduled time (stored in UTC)
  let nextRun = new Date(this.scheduledFor);
  
  // For recurring posts, find the next occurrence
  if (this.isRecurring) {
    if (this.repeatType === 'daily') {
      // For daily, add 1 day from now
      nextRun = new Date(now);
      nextRun.setDate(nextRun.getDate() + 1);
      
    } else if (this.repeatType === 'weekly' && this.repeatDays && this.repeatDays.length > 0) {
      // For weekly, find the next occurrence of the selected day(s)
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const today = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Convert day names to numbers (0-6)
      const repeatDayNumbers = this.repeatDays.map(day => days.indexOf(day));
      
      // Find the next occurrence of any of the selected days
      let daysToAdd = 1;
      let nextDay = (today + daysToAdd) % 7;
      
      // Find the next scheduled day
      while (!repeatDayNumbers.includes(nextDay)) {
        daysToAdd++;
        nextDay = (today + daysToAdd) % 7;
        
        // Prevent infinite loop if no valid days are selected (shouldn't happen due to validation)
        if (daysToAdd > 7) {
          console.error('No valid days selected for weekly recurrence');
          return null;
        }
      }
      
      // Set the next run date
      nextRun = new Date(now);
      nextRun.setDate(now.getDate() + daysToAdd);
      
    } else if (this.repeatType === 'monthly') {
      // For monthly, add 1 month from now
      nextRun = new Date(now);
      nextRun.setMonth(nextRun.getMonth() + 1);
      
      // Handle month overflow (e.g., Jan 31 -> Feb 28/29)
      const originalDate = new Date(this.scheduledFor).getDate();
      const lastDayOfNextMonth = new Date(nextRun.getFullYear(), nextRun.getMonth() + 1, 0).getDate();
      nextRun.setDate(Math.min(originalDate, lastDayOfNextMonth));
    }
    
    // Set the time to the original scheduled time for all recurrence types
    if (nextRun) {
      const originalTime = new Date(this.scheduledFor);
      nextRun.setHours(
        originalTime.getHours(),
        originalTime.getMinutes(),
        originalTime.getSeconds(),
        originalTime.getMilliseconds()
      );
      
      // Ensure the next run is in the future
      if (nextRun <= now) {
        if (this.repeatType === 'daily') {
          nextRun.setDate(nextRun.getDate() + 1);
        } else if (this.repeatType === 'weekly') {
          nextRun.setDate(nextRun.getDate() + 7);
        } else if (this.repeatType === 'monthly') {
          nextRun.setMonth(nextRun.getMonth() + 1);
        }
      }
    }
  }
  
  return nextRun;
};

// Pre-save hook to set nextRun
scheduledPostSchema.pre('save', function(next) {
  if (this.isModified('isRecurring') || this.isModified('scheduledFor') || this.isModified('repeatType') || this.isModified('repeatDays')) {
    this.nextRun = this.calculateNextRun();
  }
  next();
});

const ScheduledPost = mongoose.model('ScheduledPost', scheduledPostSchema);

export default ScheduledPost;
