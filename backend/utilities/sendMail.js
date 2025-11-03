import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_FROM = EMAIL_USER,
  APP_NAME = 'Clurst',
} = process.env;
console.log("Email Config:", { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_FROM });

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT == 465, // true for 465, false for other ports
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  timeout: 60000, // 60 seconds
  tls: {
    rejectUnauthorized: false
  }
});


async function sendMail({ to, subject, text, html }) {
  if (!to || !subject) throw new Error("sendMail requires 'to' and 'subject'");
  const mail = {
    from: `"${APP_NAME}" <${EMAIL_FROM}>`,
    to,
    subject,
    text,
    html,
  };
  return transporter.sendMail(mail);
}

export async function sendThanksEmail(to, reviewerName = '', businessName = '', reviewLink = '') {
  if (!to) throw new Error('Recipient email required');
  const name = reviewerName || 'Valued Customer';
  const subject = `Thank you${businessName ? ` for reviewing ${businessName}` : ''}!`;
  const text = `Hello ${name},\n\nThank you for your review${businessName ? ` of ${businessName}` : ''}.\n\nWe appreciate your feedback.\n\n${reviewLink ? `View it: ${reviewLink}\n\n` : ''}Best,\n${APP_NAME}`;
  const html = `
    <div style="font-family: Arial, sans-serif; color:#111">
      <p>Hello ${name},</p>
      <p>Thank you for your review${businessName ? ` of <strong>${businessName}</strong>` : ''}.</p>
      <p>We appreciate your feedback — it helps us improve.</p>
      ${reviewLink ? `<p><a href="${reviewLink}">View your review</a></p>` : ''}
      <p>Best,<br/>${APP_NAME}</p>
    </div>
  `;
  return sendMail({ to, subject, text, html });
}

export async function sendReviewInvitation(to, customerName = '', businessName = '', inviteLink = '') {
  if (!to) throw new Error('Recipient email required');
  const name = customerName || 'Customer';
  const subject = `Please leave a review for ${businessName || 'our business'}`;
  const text = `Hi ${name},\n\nWe'd love your feedback for ${businessName || 'our business'}. Please click the link below to leave a review:\n\n${inviteLink || ''}\n\nThanks,\n${APP_NAME}`;
  const html = `
    <div style="font-family: Arial, sans-serif; color:#111">
      <p>Hi ${name},</p>
      <p>We'd love your feedback for <strong>${businessName || 'our business'}</strong>.</p>
      <p><a href="${inviteLink || '#'}" style="display:inline-block;padding:10px 16px;background:#4f46e5;color:#fff;border-radius:6px;text-decoration:none;">Leave a review</a></p>
      <p>If the button above doesn't work, use this link: <a href="${inviteLink || '#'}">${inviteLink || ''}</a></p>
      <p>Thanks,<br/>${APP_NAME}</p>
    </div>
  `;
  return sendMail({ to, subject, text, html });
}