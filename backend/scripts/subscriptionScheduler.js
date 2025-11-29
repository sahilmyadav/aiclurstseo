import cron from 'node-cron';
import { activatePendingSubscriptions } from '../controllers/subscriptionQueueController.js';

// Schedule to run every hour at minute 0
cron.schedule('0 * * * *', async () => {
  console.log('🔄 Running scheduled subscription activation check...');
  await activatePendingSubscriptions();
});

console.log('✅ Subscription scheduler started - will check every hour');
