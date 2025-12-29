import Stripe from "stripe";
import Subscription from "../models/Subscription.js";
import Plan from "../models/Plan.js";
import User from "../models/User.js";
import TrialUsage from "../models/TrialUsage.js";
import Payment from "../models/Payment.js";
import { sendSubscriptionConfirmation,sendMail } from '../utilities/sendMail.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


const startTrial = async (req, res) => {
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
      pricePerProfile: 0, // Free trial
      totalPrice: 0,      // Free trial
      metadata: {
        isTrial: true,
        trialStart: startDate,
        trialEnd: endDate
      }
    });

    console.log('Trial subscription saved with endDate:', {
      id: trialSubscription._id,
      startDate: trialSubscription.startDate,
      endDate: trialSubscription.endDate,
      status: trialSubscription.status
    });

    // Update user's subscription info
    if (!user.subscription) {
      user.subscription = {
        currentSubscriptionId: null,
        stripeCustomerId: null,
        hasUsedTrial: false,
        trialUsedAt: null,
        previousSubscriptions: []
      };
    }
    user.subscription.currentSubscriptionId = trialSubscription._id;
    user.subscription.hasUsedTrial = true;
    user.subscription.trialUsedAt = new Date();
    
    try {
      await user.save();
      console.log('User subscription updated successfully');
    } catch (saveError) {
      console.error('Error saving user subscription:', saveError);
      // If saving fails, clean up the trial subscription we just created
      await Subscription.findByIdAndDelete(trialSubscription._id);
      throw new Error('Failed to update user subscription');
    }

    // Record trial usage permanently (even if user is deleted later)
    const trialUsage = await TrialUsage.create({
      email: user.email,
      userId: user._id,
      usedAt: new Date(),
      endDate: endDate,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });

    // Send response to user immediately
    res.json({ 
      message: "🎉 14-day free trial activated successfully!",
      endDate: endDate,
      profiles: 1
    });

    // Send email notifications asynchronously after sending response
    const sendTrialNotification = async (toEmail, isAdmin = false) => {
      try {
        const trialEndDate = endDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        if (isAdmin) {
          // For admin, use custom email format
          const subject = `New Trial Started - ${user.email}`;
          const text = `A new trial has been activated:
            
User: ${user.name || 'N/A'} (${user.email})
Trial Start: ${new Date().toLocaleString()}
Trial End: ${trialEndDate}
Plan: ${trialSubscription.planType}
Profiles: ${trialSubscription.profiles}

IP Address: ${req.ip || 'N/A'}
User Agent: ${req.get('User-Agent') || 'N/A'}`;

          await sendMail({
            to: toEmail,
            subject,
            text,
            html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 700px;
                  margin: 0 auto;
                  padding: 0;
                  background-color: #f5f7fa;
                }
                .email-container {
                  background: #ffffff;
                  border-radius: 8px;
                  overflow: hidden;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .header {
                  background: linear-gradient(135deg, #4f46e5, #7c3aed);
                  color: white;
                  padding: 25px 30px;
                  text-align: center;
                }
                .content {
                  padding: 30px;
                }
                h1 {
                  margin: 0;
                  font-size: 24px;
                  font-weight: 600;
                }
                h2 {
                  color: #1f2937;
                  margin-top: 0;
                  font-size: 20px;
                  border-bottom: 2px solid #e5e7eb;
                  padding-bottom: 10px;
                }
                .info-card {
                  background: #f9fafb;
                  border-radius: 6px;
                  padding: 20px;
                  margin: 20px 0;
                  border-left: 4px solid #4f46e5;
                }
                .info-item {
                  margin-bottom: 12px;
                  display: flex;
                }
                .info-label {
                  font-weight: 600;
                  color: #4b5563;
                  min-width: 140px;
                }
                .info-value {
                  color: #111827;
                  flex: 1;
                }
                .footer {
                  text-align: center;
                  padding: 20px;
                  font-size: 12px;
                  color: #6b7280;
                  border-top: 1px solid #e5e7eb;
                  background: #f9fafb;
                }
                .badge {
                  display: inline-block;
                  padding: 4px 10px;
                  border-radius: 12px;
                  font-size: 12px;
                  font-weight: 600;
                  background: #e0e7ff;
                  color: #4f46e5;
                }
              </style>
            </head>
            <body>
              <div class="email-container">
                <div class="header">
                  <h1>🎉 New Trial Activation</h1>
                </div>
                <div class="content">
                  <h2>Account Details</h2>
                  <div class="info-card">
                    <div class="info-item">
                      <span class="info-label">User:</span>
                      <span class="info-value">${user.name || 'N/A'} <${user.email}></span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Plan:</span>
                      <span class="info-value">${trialSubscription.planType} <span class="badge">Trial</span></span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Trial Period:</span>
                      <span class="info-value">${new Date().toLocaleString()} - ${trialEndDate}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Profiles Allowed:</span>
                      <span class="info-value">${trialSubscription.profiles}</span>
                    </div>
                  </div>
                  
                 
                </div>
                <div class="footer">
                  <p>This is an automated notification. Please do not reply to this email.</p>
                  <p>© ${new Date().getFullYear()} ${process.env.APP_NAME || 'Clurst'}. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
            `
          });
        } else {
          // For user, use the standard subscription confirmation
          await sendSubscriptionConfirmation(
            toEmail,
            user.name || 'Customer',
            'Free Trial',
            0,
            trialEndDate
          );
        }
        console.log(`Trial notification sent to ${toEmail}`);
      } catch (emailError) {
        console.error(`Failed to send trial notification to ${toEmail}:`, emailError);
      }
    };

    // Send notifications asynchronously
    const adminEmail = 'naveen21kumawat@gmail.com';
    
    // Don't await these, let them run in the background
    sendTrialNotification(adminEmail, true).catch(console.error);
    
    if (user.email && user.email !== adminEmail) {
      sendTrialNotification(user.email, false).catch(console.error);
    }
  } catch (err) {
    console.error('Error activating trial:', err);
    res.status(500).json({ message: "Failed to activate trial" });
  }
};

// Check Trial Eligibility
const checkTrialEligibility = async (req, res) => {
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

// Create Stripe Checkout Session with profile-based pricing
const createCheckoutSession = async (req, res) => {
  try {
    const { planType, profiles = 1 } = req.body;
    const userId = req.user?._id || req.body.userId;

    // Check for active or pending subscription
    const existingSub = await Subscription.findOne({
      user: userId,
      $or: [
        { status: 'active', endDate: { $gt: new Date() } },
        { status: 'pending' }
      ]
    });

    console.log("Existing Sub",existingSub)

    if (existingSub) {
      const message = existingSub.status === 'active' 
        ? `You already have an active subscription until ${new Date(existingSub.endDate).toLocaleDateString()}.`
        : 'You already have a pending subscription waiting to be activated.';
      
      return res.status(400).json({
        success: false,
        hasActiveSubscription: true,
        subscription: {
          status: existingSub.status,
          planType: existingSub.planType,
          endDate: existingSub.endDate,
          profiles: existingSub.profiles
        },
        message: message
      });
    }

    // Validate required fields
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!planType || !['daily', 'monthly', 'yearly'].includes(planType)) {
      return res.status(400).json({ error: "Valid plan type (daily/monthly/yearly) is required" });
    }

    // Validate profiles is a positive number
    const numProfiles = parseInt(profiles, 10);
    if (isNaN(numProfiles) || numProfiles < 1) {
      return res.status(400).json({ error: "Number of profiles must be at least 1" });
    }

    // Get plan details
    const plan = await Plan.findOne({ planType, isActive: true });
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate price after applying discount
    const discountMultiplier = (100 - (plan.discountPercent || 0)) / 100;
    const pricePerProfileAfterDiscount = plan.pricePerProfile * discountMultiplier;
    const totalPrice = pricePerProfileAfterDiscount * numProfiles;

    // Set success and cancel URLs
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const successUrl = `${baseUrl}/subscription/success?sessionId={CHECKOUT_SESSION_ID}&verify=true`;
    const cancelUrl = `${baseUrl}/subscription`;

    // Convert userId to string to ensure compatibility with Stripe
    const userIdStr = userId.toString();
    
    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { 
            name: `${plan.name} (${numProfiles} Profile${numProfiles > 1 ? 's' : ''})`,
            description: `Access for ${numProfiles} profile${numProfiles > 1 ? 's' : ''}`
          },
          unit_amount: Math.round(pricePerProfileAfterDiscount * 100), // Price per profile after discount in cents
          recurring: { 
            interval: plan.planType === 'monthly' ? 'month' : 'year' 
          }
        },
        quantity: numProfiles, // This will multiply the unit_amount by number of profiles
      }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userIdStr,
      metadata: { 
        userId: userIdStr, 
        planType, 
        profiles: numProfiles.toString(),
        totalPrice: totalPrice.toFixed(2),
        originalPrice: (plan.pricePerProfile * numProfiles).toFixed(2),
        discountPercent: plan.discountPercent || 0,
        discountAmount: ((plan.pricePerProfile * numProfiles) - totalPrice).toFixed(2)
      },
      customer_email: user.email
    });

    // We'll create the subscription record in the webhook handler after payment is confirmed
    // This prevents duplicate subscription records

    res.json({ 
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ 
      message: 'Failed to create checkout session',
      error: error.message
    });
  }
};

// Stripe Webhook Handler
const verifyStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  console.log("WebHook run", sig, "EVENT ", event);
  console.log("SECRET KEY", process.env.STRIPE_WEBHOOK_SECRET ? "Exist" : "Not Exist");

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Send email notification about webhook event
    const sendNotification = async (email) => {
      try {
        await sendSubscriptionConfirmation({
          to: email,
          subject: `Stripe Webhook Received - ${event.type}`,
          text: `A new webhook event was received:\n\n` +
                `Type: ${event.type}\n` +
                `Event ID: ${event.id}\n` +
                `Received at: ${new Date().toISOString()}\n\n` +
                `Event Data: ${JSON.stringify(event.data?.object, null, 2)}`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
              <h2>Stripe Webhook Notification</h2>
              <p>A new webhook event was received:</p>
              <ul>
                <li><strong>Type:</strong> ${event.type}</li>
                <li><strong>Event ID:</strong> ${event.id}</li>
                <li><strong>Received at:</strong> ${new Date().toLocaleString()}</li>
              </ul>
              <h3>Event Data:</h3>
              <pre style="background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto;">
${JSON.stringify(event.data?.object, null, 2)}
              </pre>
            </div>
          `
        });
        console.log(`Notification email sent to ${email}`);
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
      }
    };

    // Send to both user email (if available) and naveen21kumawat@gmail.com
    const adminEmail = 'naveen21kumawat@gmail.com';
    const userEmail = event.data?.object?.customer_email || event.data?.object?.billing_details?.email;
    
    // Send to admin
    await sendNotification(adminEmail);
    
    // Send to user if email is available and different from admin
    if (userEmail && userEmail !== adminEmail) {
      await sendNotification(userEmail);
    }

  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object);
      break;
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await handleSubscriptionUpdate(event.data.object);
      break;
    case 'invoice.payment_succeeded':
      await handleInvoicePaid(event.data.object);
      break;
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
};

// Handle successful checkout session
const handleCheckoutSessionCompleted = async (session) => {
  const { userId, planType, profiles, totalPrice } = session.metadata || {};
  
  if (!userId) {
    console.error('No userId in session metadata');
    return;
  }

  // Get plan details for duration
  const plan = await Plan.findOne({ planType });
  if (!plan) {
    throw new Error(`Plan not found for type: ${planType}`);
  }

  // Calculate subscription dates
  const startDate = new Date();
  const endDate = new Date(startDate);
  
  if (plan.planType === 'monthly') {
    endDate.setMonth(endDate.getMonth() + 1);
  } else if (plan.planType === 'yearly') {
    endDate.setFullYear(endDate.getFullYear() + 1);
  } else {
    endDate.setDate(endDate.getDate() + 1); // daily
  }

  // Create or update subscription
  const subscription = await Subscription.findOneAndUpdate(
    { stripeSessionId: session.id },
    {
      userId,
      planType,
      profiles: profiles,
      startDate,
      endDate,
      status: 'active',
      pricePerProfile: plan.pricePerProfile,
      totalPrice: plan.pricePerProfile * profiles,
      stripeSubscriptionId: session.subscription || null
    },
    { 
      upsert: true,
      new: true,
      setDefaultsOnInsert: true 
    }
  );

  // Update user's current subscription
  await User.findByIdAndUpdate(
    userId,
    { 
      'subscription.currentSubscriptionId': subscription._id,
      'subscription.hasUsedTrial': planType === 'trial' ? true : undefined,
      'subscription.trialUsedAt': planType === 'trial' ? new Date() : undefined,
      'subscription.stripeCustomerId': session.customer || null
    }
  );

  // Payment recording is handled in verifySubscription function

  console.log(`Subscription ${subscription._id} activated for user ${userId}`);
}

// Handle subscription updates from Stripe
const handleSubscriptionUpdate = async (subscription) => {
  const { id: subscriptionId, status, cancel_at_period_end, current_period_end } = subscription;
  
  // Find the subscription in our database
  const sub = await Subscription.findOne({ stripeSubscriptionId: subscriptionId });
  if (!sub) return;

  let newStatus = status;
  
  // Map Stripe status to our status
  if (cancel_at_period_end) {
    newStatus = 'pending_cancelation';
  } else if (['active', 'trialing'].includes(status)) {
    newStatus = 'active';
  } else if (status === 'canceled' || status === 'unpaid') {
    newStatus = 'expired';
  }

  // Update subscription status
  await Subscription.findByIdAndUpdate(sub._id, {
    status: newStatus,
    endDate: new Date(current_period_end * 1000) // Convert from seconds to milliseconds
  });

  console.log(`Updated subscription ${subscriptionId} status to ${newStatus}`);
}

// Handle successful payment
const handleInvoicePaid = async (invoice) => {
  const { subscription: subscriptionId, paid, amount_paid } = invoice;
  
  if (!paid) return;

  // Find the subscription
  const subscription = await Subscription.findOne({ stripeSubscriptionId: subscriptionId });
  if (!subscription) return;

  // Record the payment
  await Payment.create({
    userId: subscription.userId,
    subscriptionId: subscription._id,
    invoiceId: invoice.id,
    paymentStatus: 'succeeded',
    amount: amount_paid / 100, // Convert to dollars/cents
    currency: invoice.currency || 'usd',
    paymentMethod: invoice.payment_intent ? 'card' : 'unknown',
    customerEmail: invoice.customer_email
  });

  console.log(`Recorded payment for subscription ${subscriptionId}`);
}

// Handle failed payment
const handlePaymentFailed = async (invoice) => {
  const { subscription: subscriptionId, attempt_count } = invoice;
  
  // Find the subscription
  const subscription = await Subscription.findOne({ stripeSubscriptionId: subscriptionId });
  if (!subscription) return;

  // Update subscription status if this is the final attempt
  if (attempt_count >= 3) {
    await Subscription.findByIdAndUpdate(subscription._id, {
      status: 'payment_failed'
    });
    
    // Notify user (you can implement email notification here)
    console.log(`Payment failed for subscription ${subscriptionId} after ${attempt_count} attempts`);
  }
}

// Verify User Subscription
const verifySubscription = async (req, res) => {
  try {
    console.log('Verifying subscription with query params:', req.query);
    const { userId, sessionId } = req.query;
    
    if (!userId && !sessionId) {
      const error = new Error("Either userId or sessionId is required");
      console.error('Verification failed:', error.message);
      return res.status(400).json({ 
        success: false,
        message: error.message 
      });
    }

    // If sessionId is provided, verify using Stripe session
    if (sessionId) {
      console.log('Verifying session ID:', sessionId);
      try {
        // Expand the payment intent and include all necessary details
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
          expand: [
            'payment_intent',
            'total_details.breakdown',
            'line_items.data.discounts',
            'discounts'
          ]
        });
        
        console.log('Retrieved session with details:', {
          id: session.id,
          payment_status: session.payment_status,
          amount_total: session.amount_total,
          amount_subtotal: session.amount_subtotal,
          total_details: session.total_details,
          line_items: session.line_items?.data?.map(item => ({
            amount_subtotal: item.amount_subtotal,
            amount_total: item.amount_total,
            description: item.description,
            discounts: item.discounts
          })),
          discounts: session.discounts
        });
        
        console.log('Retrieved session:', {
          id: session.id,
          payment_status: session.payment_status,
          status: session.status,
          payment_intent: session.payment_intent ? {
            id: session.payment_intent.id,
            status: session.payment_intent.status,
            amount: session.payment_intent.amount,
            currency: session.payment_intent.currency
          } : 'No payment intent',
          metadata: session.metadata
        });
        
        if (session.payment_status === 'paid') {
          // Get or create subscription
          let subscription = await Subscription.findOne({ 
            stripeSessionId: sessionId 
          }).populate('userId', 'email');

          // If subscription doesn't exist and we have metadata, create it
          if (!subscription) {
            console.log('No existing subscription found, checking for metadata in session:', session.metadata);
            
            if (!session.metadata) {
              console.error('No metadata found in session, cannot create subscription');
              return res.status(400).json({ 
                success: false,
                error: 'Missing metadata in session' 
              });
            }
            
            const { userId, planType, profiles = 1 } = session.metadata;
            const numProfiles = parseInt(profiles, 10) || 1;
            
            console.log('Creating new subscription with metadata:', {
              userId,
              planType,
              profiles: numProfiles,
              sessionId: session.id
            });
            
            // Get plan details for duration
            const plan = await Plan.findOne({ planType });
            if (!plan) {
              console.error('Plan not found for type:', planType);
              return res.status(400).json({ 
                success: false,
                error: `Plan not found: ${planType}` 
              });
            }

            // Calculate dates
            const startDate = new Date();
            const endDate = new Date(startDate);
            
            if (plan.planType === 'monthly') {
              endDate.setMonth(endDate.getMonth() + 1);
            } else if (plan.planType === 'yearly') {
              endDate.setFullYear(endDate.getFullYear() + 1);
            } else {
              endDate.setDate(endDate.getDate() + 1); // daily
            }

            // Create new subscription
            subscription = await Subscription.create({
              userId,
              planType,
              profiles: numProfiles,
              stripeSessionId: sessionId,
              startDate,
              endDate,
              status: 'active',
              pricePerProfile: plan.pricePerProfile,
              totalPrice: plan.pricePerProfile * numProfiles
            });

            // Update user's current subscription
            await User.findByIdAndUpdate(
              userId,
              { 
                'subscription.currentSubscriptionId': subscription._id,
                'subscription.hasUsedTrial': planType === 'trial' ? true : undefined,
                'subscription.trialUsedAt': planType === 'trial' ? new Date() : undefined
              }
            );

            // Check if payment already exists
            const existingPayment = await Payment.findOne({ sessionId: session.id });
            
            if (!existingPayment) {
              // Calculate amounts
              const currency = session.currency || 'usd';
              // Get plan details including discount percentage
              const planDetails = await Plan.findOne({ planType });
              if (!planDetails) {
                throw new Error(`Plan details not found for type: ${planType}`);
              }
              
              const pricePerProfile = planDetails.pricePerProfile || 0;
              const discountPercent = planDetails.discountPercent || 0;
              
              // Calculate expected prices based on plan
              const expectedSubtotal = pricePerProfile * numProfiles;
              const expectedDiscount = expectedSubtotal * (discountPercent / 100);
              const expectedTotal = expectedSubtotal - expectedDiscount;
              
              // Get actual amounts from session (in cents)
              const subtotalInCents = session.amount_subtotal || 0;
              const totalInCents = session.amount_total || 0;
              const discountInCents = subtotalInCents - totalInCents;
              
              // Convert to proper currency units
              const subtotal = subtotalInCents / 100;
              const total = totalInCents / 100;
              const discount = discountInCents / 100;
              
              // Log for debugging
              console.log('Plan Details:', {
                pricePerProfile,
                numProfiles,
                discountPercent,
                expectedSubtotal,
                expectedDiscount,
                expectedTotal,
                actualSubtotal: subtotal,
                actualDiscount: discount,
                actualTotal: total
              });
              
              // Create payment record with all details
              const paymentData = {
                userId,
                subscriptionId: subscription._id,
                sessionId: session.id,
                paymentStatus: session.payment_status || 'paid',
                amountInCents: totalInCents,
                amountInUSD: currency.toLowerCase() === 'usd' ? total : 0,
                amountInINR: currency.toLowerCase() === 'inr' ? total : Math.round(total * 83),
                currency: currency,
                paymentMethod: session.payment_method_types?.[0] || 'card',
                customerEmail: session.customer_email || user?.email,
                created: new Date().toISOString(),
                paymentMethodTypes: session.payment_method_types || [],
                subtotalInCents: subtotalInCents,
                subtotalInINR: currency.toLowerCase() === 'inr' ? subtotal : Math.round(subtotal * 83),
                totalDetails: session.total_details || {},
                paymentIntent: session.payment_intent?.id || '',
                customer: session.customer || '',
                metadata: {
                  planType,
                  profiles: numProfiles,
                  originalPricePerProfile: pricePerProfile,
                  discountedPricePerProfile: (pricePerProfile * (1 - (discountPercent / 100))).toFixed(2),
                  discountAmount: expectedDiscount.toFixed(2),
                  discountPercent: parseFloat(discountPercent),
                  subtotal: expectedSubtotal.toFixed(2),
                  total: expectedTotal.toFixed(2),
                  currency: currency,
                  originalTotal: (pricePerProfile * numProfiles).toFixed(2),
                  discountedTotal: (expectedTotal).toFixed(2),
                  discountApplied: discountPercent > 0 ? 'Yes' : 'No',
                  calculation: {
                    basePrice: pricePerProfile,
                    profiles: numProfiles,
                    subtotal: expectedSubtotal,
                    discountPercent: discountPercent,
                    discountAmount: expectedDiscount,
                    finalAmount: expectedTotal
                  }
                }
              };
              
              // Add any coupon or promotion code if available
              if (session.discounts && session.discounts.length > 0) {
                paymentData.metadata.coupon = session.discounts[0].coupon?.id || '';
                paymentData.metadata.promotionCode = session.discounts[0].promotion_code || '';
              }
              
              // Save the payment
              await Payment.create(paymentData);
              
              console.log(`Payment recorded for session ${session.id} - `, {
                subtotal: subtotal,
                discount: discount,
                total: total,
                currency: currency,
                discountPercent: discountPercent + '%'
              });
            }

            console.log(`Subscription ACTIVATED for user ${userId}`);
          }

          return res.json({
            success: true,
            active: true,
            subscription: {
              id: subscription._id,
              planType: subscription.planType,
              status: subscription.status,
              startDate: subscription.startDate,
              endDate: subscription.endDate,
              profiles: subscription.profiles,
              pricePerProfile: subscription.pricePerProfile,
              totalPrice: subscription.totalPrice
            }
          });
        }
        return res.status(400).json({ 
          success: false,
          error: "Payment not completed" 
        });
      } catch (error) {
        console.error('Error retrieving Stripe session:', error);
        return res.status(400).json({ 
          success: false,
          error: 'Invalid session ID' 
        });
      }
    }
    
    // If only userId is provided, check for active subscription
    if (userId) {
      const user = await User.findById(userId)
        .populate('subscription.currentSubscriptionId')
        .lean();

      if (!user) {
        return res.status(404).json({ 
          success: false,
          error: "User not found" 
        });
      }

      const subscription = user.subscription?.currentSubscriptionId;
      
      // If no subscription exists
      if (!subscription) {
        return res.json({ 
          success: true,
          active: false,
          message: "No active subscription found"
        });
      }

      const now = new Date();
      const endDate = new Date(subscription.endDate);
      const isActive = subscription.status === 'active' && endDate > now;

      // Calculate days remaining
      const timeDiff = endDate - now;
      const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

      return res.json({
        success: true,
        active: isActive,
        subscription: {
          id: subscription._id,
          planType: subscription.planType,
          status: subscription.status,
          profiles: subscription.profiles,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          daysRemaining: Math.max(0, daysRemaining),
          isTrial: subscription.planType === 'trial',
          pricePerProfile: subscription.pricePerProfile,
          totalPrice: subscription.totalPrice
        }
      });
    }

  } catch (error) {
    console.error("Error verifying subscription:", error);
    res.status(500).json({ 
      success: false,
      error: error.message || "Internal server error" 
    });
  }
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
const getUserSubscription = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find the most recent subscription (active or expired)
    const subscription = await Subscription.findOne({ userId })
      .sort({ createdAt: -1 })  // Get the most recent one
      .lean();

    if (!subscription) {
      return res.status(404).json({ 
        success: false,
        message: 'No subscription found for this user'
      });
    }

    // Check if the subscription is active
    const isActive = subscription.status === 'active' && new Date(subscription.endDate) > new Date();
    
    res.json({
      success: true,
      subscription: {
        ...subscription,
        isActive
      }
    });

  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching subscription data',
      error: error.message 
    });
  }
};

// Export all controller functions
export {
  startTrial,
  checkTrialEligibility,
  createCheckoutSession,
  verifyStripeWebhook,
  verifySubscription,
  getPlans,
  createPlan,
  getUserSubscription,
  getUserTransactions,
  handleCheckoutSessionCompleted,
  handleSubscriptionUpdate,
  handleInvoicePaid,
  handlePaymentFailed
};

const getUserTransactions = async (req, res) => {
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
    // console.log("User transactions:",transactions);
    res.json(transactions);
  } catch (err) {
    console.error('Error fetching user transactions:', err);
    res.status(500).json({ message: "Failed to fetch transaction data" });
  }
};

// Get active subscription plans (for frontend pricing page)
const getPlans = async (req, res) => {
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
const createPlan = async (req, res) => {
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
