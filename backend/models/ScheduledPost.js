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
  
  const now = new Date();
  let nextRun = new Date(this.scheduledFor);
  
  // If it's a one-time post that's in the past, don't schedule it
  if (!this.isRecurring && nextRun < now) return null;
  
  // For recurring posts, find the next occurrence
  if (this.isRecurring) {
    if (this.repeatType === 'daily') {
      // Add 1 day until we find a future date
      while (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
    } else if (this.repeatType === 'weekly' && this.repeatDays && this.repeatDays.length > 0) {
      // Find the next matching day of the week
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Get the days as numbers (0-6)
      const repeatDayNumbers = this.repeatDays.map(day => days.indexOf(day));
      
      // Sort the days in order
      repeatDayNumbers.sort((a, b) => a - b);
      
      // Find the next day to run
      let daysToAdd = 0;
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      
      for (const dayNum of repeatDayNumbers) {
        if (dayNum > currentDay) {
          daysToAdd = dayNum - currentDay;
          break;
        }
      }
      
      // If no day found this week, take the first day of next week
      if (daysToAdd === 0 && repeatDayNumbers.length > 0) {
        daysToAdd = 7 - currentDay + repeatDayNumbers[0];
      }
      
      nextRun = new Date(now);
      nextRun.setDate(nextRun.getDate() + daysToAdd);
      
      // Set the time to the scheduled time
      const scheduledTime = new Date(this.scheduledFor);
      nextRun.setHours(
        scheduledTime.getHours(),
        scheduledTime.getMinutes(),
        scheduledTime.getSeconds(),
        scheduledTime.getMilliseconds()
      );
    } else if (this.repeatType === 'monthly') {
      // Add 1 month until we find a future date
      while (nextRun <= now) {
        nextRun.setMonth(nextRun.getMonth() + 1);
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
