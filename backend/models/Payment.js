import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription", required: true },
  sessionId: { type: String, required: true },
  paymentStatus: { type: String, required: true },
  amountInINR: { type: Number }, // Amount in Indian Rupees
  amountInUSD: { type: Number }, // Amount in USD
  amountInCents: { type: Number }, // Original amount in cents from Stripe
  currency: { type: String, required: true }, // Original currency from Stripe (usd, inr, etc.)
  customerEmail: { type: String },
  created: { type: String },
  metadata: { type: Object },
  paymentMethodTypes: { type: [String] },
  subtotalInINR: { type: Number }, // Subtotal in Indian Rupees
  subtotalInCents: { type: Number }, // Subtotal in cents from Stripe
  totalDetails: { type: Object },
  paymentIntent: { type: String },
  customer: { type: String }
}, {
  timestamps: true
});

export default mongoose.model("Payment", paymentSchema);
