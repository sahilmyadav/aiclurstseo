import cron from 'node-cron';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';

// Run every day at midnight
const checkExpiredSubscriptions = cron.schedule('0 0 * * *', async () => {
  try {
    console.log('Running subscription expiration check...');
    const now = new Date();
    
    // Find all active subscriptions that have passed their end date
    const expiredSubscriptions = await Subscription.find({
      status: 'active',
      endDate: { $lt: now }
    });

    for (const subscription of expiredSubscriptions) {
      try {
        // Update subscription status to expired
        subscription.status = 'expired';
        await subscription.save();
        
        // Update user's subscription status
        const user = await User.findOne({ 'subscription.activeSubscriptionId': subscription._id });
        
        if (user) {
          // Move to previous subscriptions
          user.subscription.previousSubscriptions.push({
            subscriptionId: subscription._id,
            status: 'expired',
            changedAt: new Date()
          });
          
          // Clear active subscription
          user.subscription.activeSubscriptionId = null;
          await user.save();
          
          console.log(`Expired subscription ${subscription._id} for user ${user._id}`);
        }
      } catch (error) {
        console.error(`Error processing subscription ${subscription._id}:`, error);
      }
    }
    
    console.log('Subscription expiration check completed.');
  } catch (error) {
    console.error('Error in subscription expiration job:', error);
  }
}, {
  scheduled: true,
  timezone: 'Asia/Kolkata'
});

export const startSubscriptionJobs = () => {
  checkExpiredSubscriptions.start();
  console.log('Subscription jobs started');
};

export const stopSubscriptionJobs = () => {
  checkExpiredSubscriptions.stop();
  console.log('Subscription jobs stopped');
};
