// MongoDB Initialization Script
// This script runs when the MongoDB container is first created

// Switch to the clurst database
db = db.getSiblingDB('clurst');

// Create application user with readWrite permissions
db.createUser({
  user: 'clurst_app',
  pwd: 'clurst_app_password',
  roles: [
    {
      role: 'readWrite',
      db: 'clurst',
    },
  ],
});

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ 'subscription.stripeCustomerId': 1 }, { sparse: true });
db.reviews.createIndex({ locationId: 1 });
db.reviews.createIndex({ createdAt: -1 });
db.scheduledposts.createIndex({ scheduledFor: 1 });
db.subscriptions.createIndex({ userId: 1 });
db.subscriptions.createIndex({ stripeSubscriptionId: 1 });

print('✅ MongoDB initialization complete!');
print('📊 Created indexes for users, reviews, scheduledposts, and subscriptions');
