import Stripe from "stripe";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 🟩 Start 14-Day Trial (No Payment)
export const startTrial = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "User ID required" });

    const existing = await Subscription.findOne({ userId, planType: "trial" });
    if (existing) {
      return res.status(400).json({ message: "Trial already activated." });
    }

    const trialEnds = new Date();
    trialEnds.setDate(trialEnds.getDate() + 14);

    await Subscription.create({
      userId,
      planType: "trial",
      startDate: new Date(),
      endDate: trialEnds,
      status: "active",
    });

    res.json({ message: "🎉 14-day free trial activated successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to activate trial" });
  }
};

// 🟦 Create Stripe Checkout Session
export const createCheckoutSession = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const { userId, planType, profiles } = req.body;
    
    // Validate required fields
    if (!userId) {
      console.error('Missing userId in request');
      return res.status(400).json({ error: "User ID is required" });
    }
    if (!planType || !['monthly', 'yearly'].includes(planType)) {
      console.error('Invalid planType:', planType);
      return res.status(400).json({ error: "Valid plan type (monthly/yearly) is required" });
    }
    if (!profiles || isNaN(profiles) || profiles < 1) {
      console.error('Invalid profiles count:', profiles);
      return res.status(400).json({ error: "Valid number of profiles is required" });
    }

    const price = planType === "monthly" ? 99 * profiles * 100 : 599 * profiles * 100; // cents
    console.log('Creating checkout session with:', { userId, planType, profiles, price });

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
              name: `${planType.toUpperCase()} Subscription (${profiles} Profile${profiles > 1 ? "s" : ""})`,
              description: `Access to ${profiles} profile${profiles > 1 ? 's' : ''} on the ${planType} plan`
            },
            unit_amount: price,
            recurring: {
              interval: planType === "monthly" ? "month" : "year",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription?canceled=true`,
      metadata: { 
        userId, 
        planType, 
        profiles: profiles.toString() 
      },
      customer_email: user.email,
      client_reference_id: userId,
    });

    // Return the checkout URL for redirection
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

      // Check if subscription already exists
      const existingSub = await Subscription.findOne({ stripeSessionId: session.id });
      if (existingSub) {
        console.log("Subscription already processed:", session.id);
        return res.json({ received: true });
      }

      const startDate = new Date();
      const endDate = new Date(startDate);
      if (planType === "monthly") endDate.setMonth(endDate.getMonth() + 1);
      if (planType === "yearly") endDate.setFullYear(endDate.getFullYear() + 1);

      // Create new subscription
      await Subscription.create({
        userId,
        planType,
        profiles: parseInt(profiles) || 1,
        stripeSessionId: session.id,
        startDate,
        endDate,
        status: "active",
      });

      console.log(` Subscription activated for user ${userId}`);
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
    const { userId } = req.params;
    const subscription = await Subscription.findOne({ 
      userId,
      status: "active",
      endDate: { $gt: new Date() }
    }).sort({ endDate: -1 });

    if (!subscription) {
      return res.status(404).json({ active: false });
    }

    res.json({
      active: true,
      planType: subscription.planType,
      endDate: subscription.endDate,
      profiles: subscription.profiles
    });
  } catch (error) {
    console.error("Error verifying subscription:", error);
    res.status(500).json({ error: "Error verifying subscription" });
  }
};
