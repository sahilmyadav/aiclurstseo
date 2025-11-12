import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  planType: { type: String, enum: ["trial", "monthly", "yearly"], required: true },
  profiles: { type: Number, default: 1 },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  stripeSessionId: { type: String },
  status: { type: String, enum: ["active", "expired"], default: "active" },
});

export default mongoose.model("Subscription", subscriptionSchema);
