import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // trial / daily / monthly / yearly
    planType: {
      type: String,
      enum: ["trial", "daily", "monthly", "yearly"],
      required: true,
    },
    profiles: { type: Number, default: 1 },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    stripeSessionId: { type: String },
    stripeSubscriptionId: { type: String },
    status: {
      type: String,
      enum: ["active", "expired", "pending", "pending_cancelation", "payment_failed"],
      default: "pending",
    },
    pricePerProfile: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    paymentRetryCount: { type: Number, default: 0 },
    notificationSent: {
      type: Map,
      of: Boolean,
      default: {}
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true, // This will add createdAt and updatedAt fields
  }
);

// Indexes for faster queries
subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ endDate: 1 });
subscriptionSchema.index({ stripeSessionId: 1 }, { unique: true, sparse: true });
subscriptionSchema.index({ stripeSubscriptionId: 1 }, { unique: true, sparse: true });

export default mongoose.model("Subscription", subscriptionSchema);
