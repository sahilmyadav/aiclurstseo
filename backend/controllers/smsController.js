import { sendSmsNotification } from "../utilities/smsService.js";

export const sendSmsInvitation = async (req, res) => {
  try {
    const { businessName, customerName, customerPhone } = req.body;

    if (!businessName || !customerPhone) {
      return res.status(400).json({ success: false, error: "Missing required fields: businessName, customerPhone" });
    }

    // Validate phone number format
    const phoneRegex = /^\+\d{10,15}$/;
    if (!phoneRegex.test(customerPhone)) {
      return res.status(400).json({ success: false, error: "Invalid phone number format. Include country code (e.g., +1 for US)." });
    }

    const reviewLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/business/${encodeURIComponent(businessName)}`;

    const result = await sendSmsNotification(customerPhone, customerName, reviewLink);

    if (!result.success) {
      throw new Error(result.error);
    }

    return res.status(200).json({ success: true, message: "SMS invitation sent successfully", sid: result.sid });
  } catch (error) {
    console.error("sendSmsInvitation error:", error);
    return res.status(500).json({ success: false, error: error.message || "Failed to send SMS invitation" });
  }
};