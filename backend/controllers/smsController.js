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

export const sendBulkSmsInvitations = async (req, res) => {
  try {
    const { businessName, invitations } = req.body;

    if (!businessName || !invitations || !Array.isArray(invitations) || invitations.length === 0) {
      return res.status(400).json({ success: false, error: "Missing required fields: businessName or invitations array" });
    }

    const results = await processBulkSmsInvitations(businessName, invitations);

    return res.status(200).json({
      success: true,
      successCount: results.successCount,
      failedCount: results.failedCount,
      totalCount: invitations.length,
      results: results.results.slice(0, 100),
    });
  } catch (error) {
    console.error("sendBulkSmsInvitations error:", error);
    return res.status(500).json({ success: false, error: error.message || "Failed to send bulk SMS invitations" });
  }
};

export const handleBulkSmsUpload = async (req, res) => {
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

      if (rowData.phone) {
        invitations.push({
          customerName: rowData.name || '',
          customerPhone: rowData.phone,
        });
      }
    }

    if (invitations.length === 0) {
      return res.status(400).json({ success: false, error: "No valid phone numbers found in CSV" });
    }

    // Reuse the bulk processing logic
    const results = await processBulkSmsInvitations(businessName, invitations);

    console.log(`Bulk SMS Upload: ${results.successCount} successful, ${results.failedCount} failed out of ${invitations.length}`);

    return res.status(200).json({
      success: true,
      successCount: results.successCount,
      failedCount: results.failedCount,
      totalCount: invitations.length,
      results: results.results.slice(0, 100),
    });
  } catch (error) {
    console.error("handleBulkSmsUpload error:", error);
    return res.status(500).json({ success: false, error: error.message || "Failed to process bulk SMS upload" });
  }
};

// Helper function to process bulk SMS invitations
const processBulkSmsInvitations = async (businessName, invitations) => {
  const results = [];
  let successCount = 0;
  let failedCount = 0;

  const reviewLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/business/${encodeURIComponent(businessName)}`;

  for (const invitation of invitations) {
    try {
      const { customerName, customerPhone } = invitation;

      if (!customerPhone) {
        results.push({
          customerPhone: customerPhone || "unknown",
          success: false,
          error: "Missing phone number",
        });
        failedCount++;
        continue;
      }

      // Validate phone number format
      const phoneRegex = /^\+\d{10,15}$/;
      if (!phoneRegex.test(customerPhone)) {
        results.push({
          customerPhone,
          success: false,
          error: "Invalid phone number format",
        });
        failedCount++;
        continue;
      }

      // Send SMS
      const result = await sendSmsNotification(customerPhone, customerName || "there", reviewLink);

      if (result.success) {
        results.push({
          customerPhone,
          success: true,
          sid: result.sid,
        });
        successCount++;
      } else {
        results.push({
          customerPhone,
          success: false,
          error: result.error,
        });
        failedCount++;
      }
    } catch (error) {
      console.error(`Error processing SMS invitation for ${invitation.customerPhone}:`, error);
      results.push({
        customerPhone: invitation.customerPhone || "unknown",
        success: false,
        error: error.message || "Failed to send SMS",
      });
      failedCount++;
    }
  }

  return { successCount, failedCount, results };
};