import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export const sendSmsNotification = async (recipientNumber, customerName, reviewLink) => {
  try {
    const messageBody = `Hi ${customerName || 'there'}, we'd love your feedback! Please take a moment to leave us a review: ${reviewLink}`;

    const info = await client.messages.create({
      body: messageBody,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: recipientNumber,
    });

    console.log('SMS sent successfully. SID:', info.sid);
    return { success: true, sid: info.sid };
  } catch (error) {
    console.error('Failed to send SMS:', error);
    return { success: false, error: error.message };
  }
};