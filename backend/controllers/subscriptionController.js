import Stripe from "stripe";
import Subscription from "../models/Subscription.js";
import Plan from "../models/Plan.js";
import User from "../models/User.js";
import TrialUsage from "../models/TrialUsage.js";
import Payment from "../models/Payment.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 🟩 Start 14-Day Trial (No Payment)
export const startTrial = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "User ID required" });

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has already used trial (in user model)
    if (user.subscription?.hasUsedTrial) {
      return res.status(400).json({ 
        message: "Free trial already used. Each user can only use the free trial once." 
      });
    }

    // Check if email has been used for trial before (permanent tracking)
    const existingTrialUsage = await TrialUsage.findOne({ email: user.email });
    if (existingTrialUsage) {
      return res.status(400).json({ 
        message: "Free trial already used with this email address. Each email can only be used once for free trial." 
      });
    }

    // Check if user has any active trial subscription
    const existingTrialSub = await Subscription.findOne({ 
      userId, 
      planType: "trial",
      status: "active",
      endDate: { $gt: new Date() }
    });
    
    if (existingTrialSub) {
      return res.status(400).json({ message: "Trial already active." });
    }

    // Create trial start and end dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 14); // Add 14 days to start date

    console.log('Trial dates being calculated:', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      daysFromNow: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
    });

    // Create new trial subscription
    const trialSubscription = await Subscription.create({
      userId,
      planType: "trial",
      profiles: 1, // Default 1 profile for trial
      startDate: startDate,
      endDate: endDate,
      status: "active",
    });

    console.log('Trial subscription saved with endDate:', {
      id: trialSubscription._id,
      startDate: trialSubscription.startDate,
      endDate: trialSubscription.endDate,
      status: trialSubscription.status
    });

    // Update user's subscription info
    if (!user.subscription) {
      user.subscription = {};
    }
    user.subscription.activeSubscriptionId = trialSubscription._id;
    user.subscription.hasUsedTrial = true;
    user.subscription.trialUsedAt = new Date();
    await user.save();

    // Record trial usage permanently (even if user is deleted later)
    await TrialUsage.create({
      email: user.email,
      userId: user._id,
      usedAt: new Date(),
      endDate: endDate,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });

    res.json({ 
      message: "🎉 14-day free trial activated successfully!",
      endDate: endDate,
      profiles: 1
    });
  } catch (err) {
    console.error('Error activating trial:', err);
    res.status(500).json({ message: "Failed to activate trial" });
  }
};

// 🟨 Check Trial Eligibility
export const checkTrialEligibility = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has already used trial
    if (user.subscription?.hasUsedTrial) {
      return res.json({ 
        eligible: false, 
        reason: "User has already used free trial",
        usedAt: user.subscription.trialUsedAt
      });
    }

    // Check if email has been used for trial before
    const existingTrialUsage = await TrialUsage.findOne({ email: user.email });
    if (existingTrialUsage) {
      return res.json({ 
        eligible: false, 
        reason: "Email address has already been used for free trial",
        usedAt: existingTrialUsage.usedAt
      });
    }

    // Check if user has any active trial subscription
    const existingTrialSub = await Subscription.findOne({ 
      userId, 
      planType: "trial",
      status: "active",
      endDate: { $gt: new Date() }
    });
    
    if (existingTrialSub) {
      return res.json({ 
        eligible: false, 
        reason: "User already has an active trial",
        activeTrialEndDate: existingTrialSub.endDate
      });
    }

    return res.json({ 
      eligible: true, 
      message: "User is eligible for free trial" 
    });
  } catch (err) {
    console.error('Error checking trial eligibility:', err);
    res.status(500).json({ message: "Failed to check trial eligibility" });
  }
};

// 🔍 Test function to verify trial endDate is saved
export const testTrialEndDate = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find the most recent trial for this user
    const trialSub = await Subscription.findOne({ 
      userId, 
      planType: "trial" 
    }).sort({ createdAt: -1 });
    
    if (!trialSub) {
      return res.json({ 
        message: "No trial found for this user",
        userId 
      });
    }
    
    const now = new Date();
    const daysRemaining = Math.ceil((trialSub.endDate - now) / (1000 * 60 * 60 * 24));
    
    res.json({
      message: "Trial found in database",
      trial: {
        id: trialSub._id,
        startDate: trialSub.startDate,
        endDate: trialSub.endDate,
        status: trialSub.status,
        daysRemaining: Math.max(0, daysRemaining),
        isExpired: daysRemaining <= 0
      }
    });
  } catch (err) {
    console.error('Error checking trial endDate:', err);
    res.status(500).json({ message: "Failed to check trial" });
  }
};

// 🟦 Create Stripe Checkout Session
export const createCheckoutSession = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const { planType, profiles } = req.body;
    const userId = req.user?._id || req.body.userId;

    // Validate required fields
    if (!userId) {
      console.error('User not authenticated');
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!planType || !['daily', 'monthly', 'yearly'].includes(planType)) {
      console.error('Invalid planType:', planType);
      return res.status(400).json({ error: "Valid plan type (daily/monthly/yearly) is required" });
    }
    if (!profiles || isNaN(profiles) || profiles < 1) {
      console.error('Invalid profiles count:', profiles);
      return res.status(400).json({ error: "Valid number of profiles is required" });
    }

    // Fetch plan details from database
    const plan = await Plan.findOne({ planType, isActive: true });
    if (!plan) {
      console.error('Plan not found for type:', planType);
      return res.status(404).json({ error: "Plan configuration not found" });
    }

    // Calculate prices
    const originalPricePerProfile = plan.pricePerProfile; // This is the base price from the plan
    const discountAmount = (originalPricePerProfile * plan.discountPercent) / 100;
    const discountedPricePerProfile = originalPricePerProfile - discountAmount;
    const totalAmount = Math.round(discountedPricePerProfile * profiles * 100); // Convert to cents

    console.log('Price calculation:', {
      planType,
      profiles,
      originalPricePerProfile,
      discountPercent: plan.discountPercent,
      discountedPricePerProfile,
      totalAmountCents: totalAmount
    });

    // Get user data from database
    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found:', userId);
      return res.status(404).json({ error: "User not found" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${plan.name} Subscription (${profiles} Profile${profiles > 1 ? "s" : ""})`,
              description: plan.description || `Access to ${profiles} profile${profiles > 1 ? 's' : ''} on the ${plan.name} plan`
            },
            unit_amount: Math.round(discountedPricePerProfile * 100), // Convert to cents
            recurring: {
              interval: planType === "daily" ? "day" : 
                       planType === "monthly" ? "month" : "year",
            },
          },
          quantity: profiles,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/dashboard/subscription/success?session_id={CHECKOUT_SESSION_ID}&verify=true`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription?canceled=true`,
      metadata: { 
        userId: userId.toString(),
        planType,
        profiles: profiles.toString(),
        originalPricePerProfile: originalPricePerProfile.toString(),
        discountedPricePerProfile: discountedPricePerProfile.toString(),
        discountPercent: plan.discountPercent.toString(),
        totalAmount: (discountedPricePerProfile * profiles).toString()
      },
      customer_email: user.email,
      client_reference_id: userId.toString(),
    });

    res.json({ 
      url: session.url,
      sessionId: session.id 
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: error.message });
  }
};

// Stripe Webhook (Verify Payment)
export const verifyStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    
    try {
      const { userId, planType, profiles } = session.metadata || {};

      if (!userId || !planType) {
        console.error("Missing metadata in session:", session.id);
        return res.status(400).json({ error: "Invalid session data" });
      }

      // Check if user already has an active subscription
      const existingSubscription = await Subscription.findOne({
        userId,
        status: "active",
        endDate: { $gt: new Date() }
      });

      if (existingSubscription) {
        // Find the last pending subscription to get the correct start date
        const lastPendingSubscription = await Subscription.findOne({
          userId,
          status: "pending"
        }).sort({ endDate: -1 }); // Get the latest endDate (last to activate)
        
        let startDate;
        if (lastPendingSubscription) {
          // Start after the last pending subscription ends
          startDate = new Date(lastPendingSubscription.endDate);
        } else {
          // No pending subscriptions, start after current active one ends
          startDate = new Date(existingSubscription.endDate);
        }
        
        const endDate = new Date(startDate);
        if (planType === "daily") endDate.setDate(endDate.getDate() + 1);
        if (planType === "monthly") endDate.setMonth(endDate.getMonth() + 1);
        if (planType === "yearly") endDate.setFullYear(endDate.getFullYear() + 1);

        // Create new subscription with queued status
        const newSubscription = await Subscription.create({
          userId,
          planType,
          profiles: parseInt(profiles) || 1,
          stripeSessionId: session.id,
          startDate,
          endDate,
          status: "pending",
        });

        // Create payment record
        let amountInINR = session.amount_total;
        let subtotalInINR = session.amount_subtotal;
        
        if (session.currency === 'usd') {
          amountInINR = Math.round(session.amount_total / 100 * 83);
          subtotalInINR = Math.round(session.amount_subtotal / 100 * 83);
        }
        
        await Payment.create({
          userId,
          subscriptionId: newSubscription._id,
          sessionId: session.id,
          paymentStatus: session.payment_status,
          amountInINR: amountInINR,
          amountInUSD: session.currency === 'usd' ? session.amount_total / 100 : 0,
          amountInCents: session.amount_total,
          currency: session.currency,
          customerEmail: session.customer_email,
          created: new Date(session.created * 1000).toISOString(),
          metadata: session.metadata,
          paymentMethodTypes: session.payment_method_types,
          subtotalInINR: subtotalInINR,
          subtotalInCents: session.amount_subtotal,
          totalDetails: session.total_details,
          paymentIntent: session.payment_intent,
          customer: session.customer
        });

        console.log(` Subscription PENDING for user ${userId}, will start on ${startDate.toISOString()}`);
        
        // Also save pending subscription ID in user model
        const user = await User.findById(userId);
        if (user) {
          if (!user.subscription) {
            user.subscription = {};
          }
          
          // Get the first pending subscription (earliest startDate) to set as nextPendingSubscriptionId
          const firstPendingSubscription = await Subscription.findOne({
            userId,
            status: "pending"
          }).sort({ startDate: 1 }); // Get the earliest pending subscription
          
          user.subscription.nextPendingSubscriptionId = firstPendingSubscription._id;
          user.subscription.pendingSubscriptions.push({
            subscriptionId: newSubscription._id,
            status: "pending",
            addedAt: new Date()
          });
          await user.save();
        }
      } else {
        // No active subscription, create new one immediately
        const startDate = new Date();
        const endDate = new Date(startDate);
        if (planType === "daily") endDate.setDate(endDate.getDate() + 1);
        if (planType === "monthly") endDate.setMonth(endDate.getMonth() + 1);
        if (planType === "yearly") endDate.setFullYear(endDate.getFullYear() + 1);

        // Create new subscription
        const newSubscription = await Subscription.create({
          userId,
          planType,
          profiles: parseInt(profiles) || 1,
          stripeSessionId: session.id,
          startDate,
          endDate,
          status: "active",
        });

        // Create payment record with currency conversion
        let amountInINR = session.amount_total;
        let subtotalInINR = session.amount_subtotal;
        
        // Convert USD to INR if currency is USD (1 USD = 83 INR)
        if (session.currency === 'usd') {
          amountInINR = Math.round(session.amount_total / 100 * 83); // Convert from cents to rupees
          subtotalInINR = Math.round(session.amount_subtotal / 100 * 83);
        }
        
        await Payment.create({
          userId,
          subscriptionId: newSubscription._id,
          sessionId: session.id,
          paymentStatus: session.payment_status,
          amountInINR: amountInINR, // Amount in Indian Rupees
          amountInUSD: session.currency === 'usd' ? session.amount_total / 100 : 0, // Amount in USD
          amountInCents: session.amount_total, // Original amount in cents from Stripe
          currency: session.currency, // Original currency from Stripe (usd, inr, etc.)
          customerEmail: session.customer_email,
          created: new Date(session.created * 1000).toISOString(),
          metadata: session.metadata,
          paymentMethodTypes: session.payment_method_types,
          subtotalInINR: subtotalInINR,
          subtotalInCents: session.amount_subtotal,
          totalDetails: session.total_details,
          paymentIntent: session.payment_intent,
          customer: session.customer
        });

        // Update user's subscription reference
        const user = await User.findById(userId);
        if (user) {
          if (!user.subscription) {
            user.subscription = {};
          }
          user.subscription.activeSubscriptionId = newSubscription._id;
          await user.save();
        }

        console.log(` Subscription ACTIVATED for user ${userId}`);
      }
    } catch (error) {
      console.error("Error processing webhook:", error);
      return res.status(500).json({ error: "Error processing subscription" });
    }
  }

  res.status(200).json({ received: true });
};

// Verify User Subscription
export const verifySubscription = async (req, res) => {
  try {
    const { userId, sessionId } = req.query;
    
    // If sessionId is provided, verify using session
    if (sessionId) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        if (session.payment_status === 'paid') {
          // Check if subscription already exists
          let subscription = await Subscription.findOne({ stripeSessionId: sessionId });
          
          // If subscription doesn't exist, create it
          if (!subscription && session.metadata) {
            const { userId, planType, profiles } = session.metadata;
            console.log('Creating subscription for user:', userId, planType, profiles); 
            
            // Get user to check for existing subscription
            const user = await User.findById(userId);
            if (!user) {
              return res.status(404).json({ error: 'User not found' });
            }
            
            // Check if user already has an active subscription
            const existingSubscription = await Subscription.findOne({
              userId,
              status: "active",
              endDate: { $gt: new Date() }
            });

            let startDate, endDate;
            
            if (existingSubscription) {
              // Find the last pending subscription to get the correct start date
              const lastPendingSubscription = await Subscription.findOne({
                userId,
                status: "pending"
              }).sort({ endDate: -1 }); // Get the latest endDate (last to activate)
              
              let startDate;
              if (lastPendingSubscription) {
                // Start after the last pending subscription ends
                startDate = new Date(lastPendingSubscription.endDate);
              } else {
                // No pending subscriptions, start after current active one ends
                startDate = new Date(existingSubscription.endDate);
              }
              
              endDate = new Date(startDate);
              if (planType === "daily") endDate.setDate(endDate.getDate() + 1);
              if (planType === "monthly") endDate.setMonth(endDate.getMonth() + 1);
              if (planType === "yearly") endDate.setFullYear(endDate.getFullYear() + 1);
              
              // Create new subscription with pending status
              subscription = await Subscription.create({
                userId,
                planType,
                profiles: parseInt(profiles) || 1,
                stripeSessionId: sessionId,
                startDate,
                endDate,
                status: "pending",
              });
              
              console.log(` Subscription PENDING for user ${userId}, will start on ${startDate.toISOString()}`);
              
              // Also save pending subscription ID in user model
              if (!user.subscription) {
                user.subscription = {};
              }
              
              // Get the first pending subscription (earliest startDate) to set as nextPendingSubscriptionId
              const firstPendingSubscription = await Subscription.findOne({
                userId,
                status: "pending"
              }).sort({ startDate: 1 }); // Get the earliest pending subscription
              
              user.subscription.nextPendingSubscriptionId = firstPendingSubscription._id;
              user.subscription.pendingSubscriptions.push({
                subscriptionId: subscription._id,
                status: "pending",
                addedAt: new Date()
              });
              await user.save();
            } else {
              // No active subscription, create new one immediately
              startDate = new Date();
              endDate = new Date(startDate);
              if (planType === "daily") endDate.setDate(endDate.getDate() + 1);
              if (planType === "monthly") endDate.setMonth(endDate.getMonth() + 1);
              if (planType === "yearly") endDate.setFullYear(endDate.getFullYear() + 1);
              
              // Create new subscription
              subscription = await Subscription.create({
                userId,
                planType,
                profiles: parseInt(profiles) || 1,
                stripeSessionId: sessionId,
                startDate,
                endDate,
                status: "active",
              });
              
              console.log(` Subscription ACTIVATED for user ${userId}`);
            }

            // Create payment record with currency conversion
            let amountInINR = session.amount_total;
            let subtotalInINR = session.amount_subtotal;
            
            // Convert USD to INR if currency is USD (1 USD = 83 INR)
            if (session.currency === 'usd') {
              amountInINR = Math.round(session.amount_total / 100 * 83); // Convert from cents to rupees
              subtotalInINR = Math.round(session.amount_subtotal / 100 * 83);
            }
            
            await Payment.create({
              userId,
              subscriptionId: subscription._id,
              sessionId: session.id,
              paymentStatus: session.payment_status,
              amountInINR: amountInINR, // Amount in Indian Rupees
              amountInUSD: session.currency === 'usd' ? session.amount_total / 100 : 0, // Amount in USD
              amountInCents: session.amount_total, // Original amount in cents from Stripe
              currency: session.currency, // Original currency from Stripe (usd, inr, etc.)
              customerEmail: session.customer_email,
              created: new Date(session.created * 1000).toISOString(),
              metadata: session.metadata,
              paymentMethodTypes: session.payment_method_types,
              subtotalInINR: subtotalInINR,
              subtotalInCents: session.amount_subtotal,
              totalDetails: session.total_details,
              paymentIntent: session.payment_intent,
              customer: session.customer
            });

            // Update user's subscription reference only if subscription is active
            if (subscription.status === "active") {
              if (!user.subscription) {
                user.subscription = {};
              }
              user.subscription.activeSubscriptionId = subscription._id;
              await user.save();
            }
            
            // Return the subscription data with ID, amount, and currency
            return res.status(200).json({
              active: true,
              id: subscription._id, // Explicitly include the ID
              amount: session.amount_total, // Include amount in cents
              currency: session.currency || 'usd', // Include currency
              ...subscription._doc
            });
          }
          
          return res.json({
            active: true,
            planType: subscription?.planType,
            endDate: subscription?.endDate,
            profiles: subscription?.profiles || 1
          });
        }
        return res.status(400).json({ active: false, error: "Payment not completed" });
      } catch (error) {
        console.error('Error retrieving Stripe session:', error);
        return res.status(400).json({ error: 'Invalid session ID' });
      }
    }
    
    // Fallback to user ID based verification
    if (userId) {
      const subscription = await Subscription.findOne({ 
        userId,
        status: "active",
        endDate: { $gt: new Date() }
      }).sort({ endDate: -1 });

      if (!subscription) {
        return res.status(404).json({ active: false });
      }

      return res.json({
        active: true,
        planType: subscription.planType,
        endDate: subscription.endDate,
        profiles: subscription.profiles
      });
    }
    
    return res.status(400).json({ error: "Either userId or sessionId is required" });
  } catch (error) {
    console.error("Error verifying subscription:", error);
    res.status(500).json({ error: error.message || "Error verifying subscription" });
  }
};

// Get user subscription data
export const getUserSubscription = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }
    
    // Check if requesting user is admin or requesting their own data
    const requestingUserId = req.user._id.toString();
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // If not admin and not requesting own data, deny access
    if (requestingUserId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    // Fetch active subscription for this user
    const subscription = await Subscription.findOne({ 
      userId,
      status: { $in: ['active', 'cancelled'] }
    }).sort({ createdAt: -1 });
    
    if (!subscription) {
      return res.json(null);
    }
    
    res.json({
      id: subscription._id,
      userId: subscription.userId,
      planType: subscription.planType,
      profiles: subscription.profiles,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      status: subscription.status,
      cancelledAt: subscription.cancelledAt,
      isTrial: subscription.planType === 'trial'
    });
  } catch (err) {
    console.error('Error fetching user subscription:', err);
    res.status(500).json({ message: "Failed to fetch subscription data" });
  }
};

// Get user transaction history
export const getUserTransactions = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }
    
    // Check if requesting user is admin or requesting their own data
    const requestingUserId = req.user._id.toString();
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // If not admin and not requesting own data, deny access
    if (requestingUserId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    // Fetch payment transactions for this user
    const transactions = await Payment.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to 50 most recent transactions
    
    res.json(transactions);
  } catch (err) {
    console.error('Error fetching user transactions:', err);
    res.status(500).json({ message: "Failed to fetch transaction data" });
  }
};

// Get active subscription plans (for frontend pricing page)
export const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({
      pricePerProfile: 1,
    });
    res.json(plans);
  } catch (err) {
    console.error("Error fetching plans:", err);
    res.status(500).json({ message: "Failed to fetch subscription plans" });
  }
};

// Create or update a subscription plan (for seeding via Postman / admin panel)
export const createPlan = async (req, res) => {
  try {
    const { name, planType, description, pricePerProfile, discountPercent, features, isActive } =
      req.body;

    if (!name || !planType || pricePerProfile == null) {
      return res
        .status(400)
        .json({ message: "name, planType and pricePerProfile are required" });
    }

    const allowedTypes = ["daily", "monthly", "yearly"];
    if (!allowedTypes.includes(planType)) {
      return res
        .status(400)
        .json({ message: "planType must be one of: daily, monthly, yearly" });
    }

    // Upsert by planType so you can safely hit this multiple times from Postman
    const plan = await Plan.findOneAndUpdate(
      { planType },
      {
        name,
        planType,
        description,
        pricePerProfile,
        discountPercent: discountPercent ?? 0,
        features: Array.isArray(features) ? features : [],
        isActive: isActive !== undefined ? isActive : true,
      },
      { new: true, upsert: true }
    );

    res.json(plan);
  } catch (err) {
    console.error("Error creating/updating plan:", err);
    res
      .status(500)
      .json({ message: err.message || "Failed to create/update plan" });
  }
};
