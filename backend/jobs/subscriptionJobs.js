import cron from 'node-cron';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import Plan from '../models/Plan.js';
import Stripe from 'stripe';
import { sendSubscriptionReminder } from '../utilities/sendMail.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Run every 6 hours for general checks
const checkExpiredSubscriptions = cron.schedule('0 */6 * * *', async () => {
  try {
    console.log('Running subscription expiration check...');
    const now = new Date();
    
    // 1. Check for expired subscriptions
    const expiredSubscriptions = await Subscription.find({
      status: { $in: ['active', 'pending'] },
      endDate: { $lt: now }
    });

    for (const subscription of expiredSubscriptions) {
      try {
        // Update subscription status to expired
        subscription.status = 'expired';
        await subscription.save();
        
        // Find the user with this subscription
        const user = await User.findOne({ 'subscription.currentSubscriptionId': subscription._id });
        
        if (user) {
          // Just update the status, keep the subscription in currentSubscriptionId
          // No need to move to previousSubscriptions
          console.log(`Marked subscription ${subscription._id} as expired for user ${user._id}`);
          
          // Send notification (you can implement email/notification service here)
          console.log(`Notified user ${user._id} about expired subscription`);
        }
      } catch (error) {
        console.error(`Error processing subscription ${subscription._id}:`, error);
      }
    }

    // 2. Check for subscriptions expiring in 3 days
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(now.getDate() + 3);
    
    const expiringSoonSubscriptions = await Subscription.find({
      status: 'active',
      endDate: { 
        $gt: now,
        $lt: threeDaysFromNow
      },
      'notificationSent.expiring_soon': { $ne: true }
    });

    for (const subscription of expiringSoonSubscriptions) {
      try {
        const user = await User.findById(subscription.userId);
        if (user) {
          // Send reminder email
          try {
            const plan = await Plan.findOne({ planType: subscription.planType });
            const planName = plan ? plan.name : subscription.planType;
            const expiryDate = subscription.endDate.toLocaleDateString();
            
            await sendSubscriptionReminder(
              user.email,
              user.name || user.email.split('@')[0],
              planName,
              expiryDate
            );
            
            console.log(`Reminder email sent to ${user.email} for subscription ${subscription._id}`);
          } catch (emailError) {
            console.error('Error sending reminder email:', emailError);
          }
          
          // Mark notification as sent
          subscription.notificationSent = subscription.notificationSent || {};
          subscription.notificationSent.expiring_soon = true;
          await subscription.save();
        }
      } catch (error) {
        console.error(`Error sending expiration notification for subscription ${subscription._id}:`, error);
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

// Run daily at 10 AM for payment retries
const retryFailedPayments = cron.schedule('0 10 * * *', async () => {
  try {
    console.log('Running payment retry job...');
    
    // Find subscriptions with failed payments
    const failedSubscriptions = await Subscription.find({
      status: 'payment_failed',
      'paymentRetryCount': { $lt: 3 } // Max 3 retries
    });

    for (const subscription of failedSubscriptions) {
      try {
        console.log(`Retrying payment for subscription ${subscription._id}`);
        
        // Find the user
        const user = await User.findById(subscription.userId);
        if (!user) {
          console.error(`User not found for subscription ${subscription._id}`);
          continue;
        }
        
        // Check if we have a Stripe subscription ID
        if (!subscription.stripeSubscriptionId) {
          console.error(`No Stripe subscription ID found for subscription ${subscription._id}`);
          continue;
        }
        
        // Try to update the payment method or retry the payment
        try {
          // Get the latest invoice for the subscription
          const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
          const latestInvoiceId = stripeSubscription.latest_invoice;
          
          if (latestInvoiceId) {
            const invoice = await stripe.invoices.retrieve(latestInvoiceId);
            
            // If there's a payment intent, try to confirm it
            if (invoice.payment_intent) {
              await stripe.paymentIntents.confirm(invoice.payment_intent);
              console.log(`Payment retry successful for subscription ${subscription._id}`);
              
              // Update subscription status
              subscription.status = 'active';
              subscription.paymentRetryCount = 0;
              await subscription.save();
              
              // Update user's subscription
              user.subscription.currentSubscriptionId = subscription._id;
              await user.save();
              
              continue; // Move to next subscription
            }
          }
          
          // If we get here, we couldn't automatically retry the payment
          console.log(`Could not automatically retry payment for subscription ${subscription._id}`);
          
          // Increment retry count
          subscription.paymentRetryCount = (subscription.paymentRetryCount || 0) + 1;
          
          // If we've reached max retries, mark as expired
          if (subscription.paymentRetryCount >= 3) {
            subscription.status = 'expired';
            console.log(`Subscription ${subscription._id} marked as expired after max retries`);
            
            // No need to move to previousSubscriptions or clear currentSubscriptionId
            // Just save the subscription with updated status
            await subscription.save();
          }
          
          await subscription.save();
          
        } catch (stripeError) {
          console.error(`Stripe error retrying payment for subscription ${subscription._id}:`, stripeError);
          
          // Increment retry count on error
          subscription.paymentRetryCount = (subscription.paymentRetryCount || 0) + 1;
          await subscription.save();
        }
        
      } catch (error) {
        console.error(`Error retrying payment for subscription ${subscription._id}:`, error);
      }
    }

    console.log('Payment retry job completed.');
  } catch (error) {
    console.error('Error in payment retry job:', error);
  }
}, {
  scheduled: true,
  timezone: 'Asia/Kolkata'
});

// Log expired subscriptions without deleting them
// const logExpiredSubscriptions = cron.schedule('0 1 * * *', async () => {
//   try {
//     console.log('Checking for expired subscriptions...');
//     const thirtyDaysAgo = new Date();
//     thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
//     // Just count expired subscriptions without deleting
//     const expiredCount = await Subscription.countDocuments({
//       status: 'expired',
//       updatedAt: { $lt: thirtyDaysAgo }
//     });
    
//     console.log(`Found ${expiredCount} expired subscriptions (older than 30 days). All records are being kept.`);
//     console.log('Subscription check completed.');
//   } catch (error) {
//     console.error('Error checking expired subscriptions:', error);
//   }
// }, {
//   scheduled: true,
//   timezone: 'Asia/Kolkata'
// });

// Initialize all jobs
export const startSubscriptionJobs = () => {
  checkExpiredSubscriptions.start();
  retryFailedPayments.start();
  console.log('All subscription jobs started');
};

// Stop all jobs
export const stopSubscriptionJobs = () => {
  checkExpiredSubscriptions.stop();
  retryFailedPayments.stop();
  console.log('All subscription jobs stopped');
};
