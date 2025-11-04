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

export const sendBulkEmailInvitations = async (req, res) => {
  try {
    const { businessName, invitations } = req.body;

    if (!businessName || !invitations || !Array.isArray(invitations) || invitations.length === 0) {
      return res.status(400).json({ success: false, error: "Missing required fields: businessName or invitations array" });
    }

    const results = await processBulkEmailInvitations(businessName, invitations);

    return res.status(200).json({
      success: true,
      successCount: results.successCount,
      failedCount: results.failedCount,
      totalCount: invitations.length,
      results: results.results.slice(0, 100),
    });
  } catch (error) {
    console.error("sendBulkEmailInvitations error:", error);
    return res.status(500).json({ success: false, error: error.message || "Failed to send bulk email invitations" });
  }
};

export const handleBulkEmailUpload = async (req, res) => {
  try {
    const file = req.file;
    const { businessName } = req.body;

    if (!file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    if (!businessName) {
      return res.status(400).json({ success: false, error: "Missing businessName" });
    }

    // Parse CSV file
    const fileContent = file.buffer.toString('utf-8');
    const lines = fileContent.split('\n').filter(line => line.trim());

    if (lines.length < 2) {
      return res.status(400).json({ success: false, error: "CSV file is empty or has no data rows" });
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const invitations = [];

    // Process each row (skip header)
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const rowData = {};

      headers.forEach((header, idx) => {
        rowData[header] = values[idx] || '';
      });

      if (rowData.email) {
        invitations.push({
          customerName: rowData.name || '',
          customerEmail: rowData.email,
        });
      }
    }

    if (invitations.length === 0) {
      return res.status(400).json({ success: false, error: "No valid email addresses found in CSV" });
    }

    // Reuse the bulk processing logic
    const results = await processBulkEmailInvitations(businessName, invitations);

    console.log(`Bulk Email Upload: ${results.successCount} successful, ${results.failedCount} failed out of ${invitations.length}`);

    return res.status(200).json({
      success: true,
      successCount: results.successCount,
      failedCount: results.failedCount,
      totalCount: invitations.length,
      results: results.results.slice(0, 100),
    });
  } catch (error) {
    console.error("handleBulkEmailUpload error:", error);
    return res.status(500).json({ success: false, error: error.message || "Failed to process bulk email upload" });
  }
};

// Helper function to process bulk email invitations
const processBulkEmailInvitations = async (businessName, invitations) => {
  const results = [];
  let successCount = 0;
  let failedCount = 0;

  const frontUrl = process.env.FRONTEND_URL || process.env.APP_URL || 'http://localhost:5173';
  const inviteLink = `${frontUrl}/business/${encodeURIComponent(businessName)}`;

  for (const invitation of invitations) {
    try {
      const { customerName, customerEmail } = invitation;

      if (!customerEmail) {
        results.push({
          customerEmail: customerEmail || "unknown",
          success: false,
          error: "Missing email address",
        });
        failedCount++;
        continue;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerEmail)) {
        results.push({
          customerEmail,
          success: false,
          error: "Invalid email format",
        });
        failedCount++;
        continue;
      }

      // Send email
      await sendReviewInvitation(customerEmail, customerName || "Customer", businessName, inviteLink);

      results.push({
        customerEmail,
        success: true,
      });
      successCount++;
    } catch (error) {
      console.error(`Error processing email invitation for ${invitation.customerEmail}:`, error);
      results.push({
        customerEmail: invitation.customerEmail || "unknown",
        success: false,
        error: error.message || "Failed to send email",
      });
      failedCount++;
    }
  }

  return { successCount, failedCount, results };
};

