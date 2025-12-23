import mongoose from 'mongoose';

const scheduledPostSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  keywords: [{
    type: String,
    trim: true
  }],
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

// Calculate next run date based on recurrence type
scheduledPostSchema.methods.calculateNextRun = function() {
  if (!this.isRecurring || !this.scheduledFor) return null;
  
  const now = new Date();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  
  // Start with the scheduled time or last run time
  let nextRun = this.lastRun ? new Date(this.lastRun) : new Date(this.scheduledFor);
  
  // Calculate next occurrence based on repeat type
  switch (this.repeatType) {
    case 'daily':
      // For daily, add 1 day to the last run time
      nextRun.setDate(nextRun.getDate() + 1);
      break;
      
    case 'weekly':
      if (this.repeatDays && this.repeatDays.length > 0) {
        const currentDay = nextRun.getDay(); // 0 = Sunday
        const repeatDayNumbers = this.repeatDays.map(day => days.indexOf(day.toLowerCase()));
        
        // Find the next occurrence of any selected day after today
        let daysToAdd = 1; // Start checking from tomorrow
        let nextDay = (currentDay + daysToAdd) % 7;
        
        // Find the next valid day
        let found = false;
        for (let i = 1; i <= 7; i++) {
          const checkDay = (currentDay + i) % 7;
          if (repeatDayNumbers.includes(checkDay)) {
            daysToAdd = i;
            found = true;
            break;
          }
        }
        
        if (!found) {
          // If no days found in the next 7 days (shouldn't happen if repeatDays is valid)
          console.error('No valid days selected for weekly recurrence');
          return null;
        }
        
        // If we've wrapped around to next week, add the days
        nextRun.setDate(nextRun.getDate() + daysToAdd);
        
        // Preserve the original time
        const originalTime = this.lastRun ? new Date(this.lastRun) : new Date(this.scheduledFor);
        nextRun.setHours(
          originalTime.getHours(),
          originalTime.getMinutes(),
          originalTime.getSeconds(),
          originalTime.getMilliseconds()
        );
        
        console.log(`📅 Next run calculated for ${this._id}:`, {
          currentDay: days[currentDay],
          repeatDays: this.repeatDays,
          daysToAdd: daysToAdd,
          nextRunDay: days[nextRun.getDay()],
          nextRun: nextRun.toISOString()
        });
        
      } else {
        // If no specific days, add 7 days
        nextRun.setDate(nextRun.getDate() + 7);
      }
      break;
      
    case 'monthly':
      // For monthly, add 1 month while preserving the day of month
      const originalDay = nextRun.getDate();
      nextRun.setMonth(nextRun.getMonth() + 1);
      
      // Handle month overflow (e.g., Jan 31 -> Feb 28/29)
      const lastDayOfMonth = new Date(nextRun.getFullYear(), nextRun.getMonth() + 1, 0).getDate();
      nextRun.setDate(Math.min(originalDay, lastDayOfMonth));
      break;
      
    default:
      return null;
  }
  
  // Preserve the original time
  const originalTime = this.lastRun ? new Date(this.lastRun) : new Date(this.scheduledFor);
  nextRun.setHours(
    originalTime.getHours(),
    originalTime.getMinutes(),
    originalTime.getSeconds(),
    originalTime.getMilliseconds()
  );
  
  // If the calculated time is in the past, move to the next occurrence
  while (nextRun <= now) {
    switch (this.repeatType) {
      case 'daily':
        nextRun.setDate(nextRun.getDate() + 1);
        break;
        
      case 'weekly':
        if (this.repeatDays && this.repeatDays.length > 0) {
          // Find the next valid day in the next week
          nextRun.setDate(nextRun.getDate() + 7);
        } else {
          nextRun.setDate(nextRun.getDate() + 7);
        }
        break;
        
      case 'monthly':
        const day = nextRun.getDate();
        nextRun.setMonth(nextRun.getMonth() + 1);
        
        // Handle month overflow again after incrementing
        const lastDay = new Date(nextRun.getFullYear(), nextRun.getMonth() + 1, 0).getDate();
        nextRun.setDate(Math.min(day, lastDay));
        break;
    }
  }
  
  console.log(`🔄 Calculated next run for ${this._id}:`, {
    type: this.repeatType,
    scheduledFor: this.scheduledFor,
    lastRun: this.lastRun,
    nextRun: nextRun,
    now: now,
    days: this.repeatDays
  });
  
  return nextRun;
};

// Pre-save hook to set nextRun
// Check if the post should run now
scheduledPostSchema.methods.shouldRun = function() {
  if (!this.scheduledFor) return false;
  
  // Get current time in UTC
  const now = new Date();
  
  // Check if scheduled time has passed
  return new Date(this.scheduledFor) <= now;
};

// Pre-save hook to set nextRun
scheduledPostSchema.pre('save', function(next) {
  if (this.isModified('isRecurring') || this.isModified('scheduledFor') || 
      this.isModified('repeatType') || this.isModified('repeatDays')) {
    this.nextRun = this.calculateNextRun();
  }
  next();
});

const ScheduledPost = mongoose.model('ScheduledPost', scheduledPostSchema);

export default ScheduledPost;
