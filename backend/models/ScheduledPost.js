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

// Calculate next run date
scheduledPostSchema.methods.calculateNextRun = function() {
  if (!this.isRecurring || !this.scheduledFor) return null;
  
  // Get current time in UTC
  const now = new Date();
  
  // Use the last scheduled time as the base for calculation
  // If this is the first time, use scheduledFor, otherwise use the last run time
  const baseDate = this.lastRun || this.scheduledFor;
  
  let nextRun = new Date(baseDate);
  
  // For recurring posts, find the next occurrence
  if (this.isRecurring) {
    if (this.repeatType === 'daily') {
      // For daily, add 24 hours to the base date
      nextRun.setDate(nextRun.getDate() + 1);
      
    } else if (this.repeatType === 'weekly') {
      if (this.repeatDays && this.repeatDays.length > 0) {
        // For weekly with specific days, find the next occurrence
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const today = nextRun.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // Convert day names to numbers (0-6)
        const repeatDayNumbers = this.repeatDays.map(day => days.indexOf(day.toLowerCase()));
        
        // Find the next occurrence of any of the selected days
        let daysToAdd = 1;
        let nextDay = (today + daysToAdd) % 7;
        
        // Find the next scheduled day
        while (!repeatDayNumbers.includes(nextDay)) {
          daysToAdd++;
          nextDay = (today + daysToAdd) % 7;
          
          // Prevent infinite loop if no valid days are selected
          if (daysToAdd > 7) {
            console.error('No valid days selected for weekly recurrence');
            return null;
          }
        }
        
        // Set the next run date
        nextRun.setDate(nextRun.getDate() + daysToAdd);
      } else {
        // For weekly without specific days, add 7 days
        nextRun.setDate(nextRun.getDate() + 7);
      }
      
    } else if (this.repeatType === 'monthly') {
      // For monthly, add 1 month to the base date
      nextRun.setMonth(nextRun.getMonth() + 1);
      
      // Handle month overflow (e.g., Jan 31 -> Feb 28/29)
      const originalDate = new Date(baseDate).getDate();
      const lastDayOfTargetMonth = new Date(nextRun.getFullYear(), nextRun.getMonth() + 1, 0).getDate();
      nextRun.setDate(Math.min(originalDate, lastDayOfTargetMonth));
    }
    
    // Preserve the original time from the base date (lastRun or scheduledFor)
    const originalTime = new Date(baseDate);
    nextRun.setHours(
      originalTime.getHours(),
      originalTime.getMinutes(),
      originalTime.getSeconds(),
      originalTime.getMilliseconds()
    );
    
    // Ensure the next run is in the future
    // If the calculated nextRun is still in the past, add another interval
    while (nextRun <= now) {
      if (this.repeatType === 'daily') {
        nextRun.setDate(nextRun.getDate() + 1);
      } else if (this.repeatType === 'weekly') {
        if (this.repeatDays && this.repeatDays.length > 0) {
          // For weekly with specific days, find the next week's occurrence
          nextRun.setDate(nextRun.getDate() + 7);
        } else {
          nextRun.setDate(nextRun.getDate() + 7);
        }
      } else if (this.repeatType === 'monthly') {
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
