import Subscription from "../models/Subscription.js";
import User from "../models/User.js";

// Function to activate pending subscriptions
export const activatePendingSubscriptions = async () => {
  try {
    console.log('Checking for pending subscriptions to activate...');
    
    // Find all pending subscriptions that should start now
    const pendingSubscriptions = await Subscription.find({
      status: "pending",
      startDate: { $lte: new Date() }
    }).populate('userId');

    if (pendingSubscriptions.length === 0) {
      console.log('No pending subscriptions to activate');
      return;
    }

    console.log(`Found ${pendingSubscriptions.length} pending subscriptions to activate`);

    for (const pendingSub of pendingSubscriptions) {
      try {
        // Find and expire any currently active subscription for this user
        const activeSubscription = await Subscription.findOne({
          userId: pendingSub.userId,
          status: "active",
          endDate: { $gt: new Date() }
        });

        if (activeSubscription) {
          // Expire the current active subscription
          activeSubscription.status = "expired";
          await activeSubscription.save();
          console.log(`Expired previous subscription ${activeSubscription._id} for user ${pendingSub.userId._id}`);
        }

        // Activate the pending subscription
        pendingSub.status = "active";
        await pendingSub.save();

        // Update user's subscription reference
        const user = await User.findById(pendingSub.userId);
        if (user) {
          if (!user.subscription) {
            user.subscription = {};
          }
          user.subscription.activeSubscriptionId = pendingSub._id;
          user.subscription.nextPendingSubscriptionId = null; // Clear pending reference
          
          // Remove from pendingSubscriptions array
          user.subscription.pendingSubscriptions = user.subscription.pendingSubscriptions.filter(
            pending => pending.subscriptionId.toString() !== pendingSub._id.toString()
          );
          
          await user.save();
        }

        console.log(`✅ Activated pending subscription ${pendingSub._id} for user ${pendingSub.userId._id}`);
      } catch (error) {
        console.error(`Error activating pending subscription ${pendingSub._id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in activatePendingSubscriptions:', error);
  }
};

// Manual endpoint to trigger activation (for testing)
export const triggerActivation = async (req, res) => {
  try {
    await activatePendingSubscriptions();
    res.json({ message: 'Pending subscriptions activation completed' });
  } catch (error) {
    console.error('Error in triggerActivation:', error);
    res.status(500).json({ error: 'Failed to activate pending subscriptions' });
  }
};
