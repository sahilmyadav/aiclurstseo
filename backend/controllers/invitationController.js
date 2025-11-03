import { sendReviewInvitation } from '../utilities/sendMail.js';

export const sendInvitationEmail = async (req, res) => {
  console.log(req.body)
  try {
    const { businessName, customerName, customerEmail } = req.body || {};

    if (!businessName || !customerName || !customerEmail) {
      return res.status(400).json({ success: false, error: 'Missing required fields: businessName, customerName, customerEmail' });
    }
    const frontUrl = process.env.FRONTEND_URL || process.env.APP_URL || 'http://localhost:5173';
    const inviteLink = `${frontUrl}/business/${encodeURIComponent(businessName)}`;

  // Send a review invitation email to the customer.
  // sendReviewInvitation(to, customerName, businessName, inviteLink)
  await sendReviewInvitation(customerEmail, customerName, businessName, inviteLink);

    return res.status(200).json({ success: true, message: 'Invitation email sent' });
  } catch (error) {
    console.error('sendInvitationEmail error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to send invitation' });
  }
};

