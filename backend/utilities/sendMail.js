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

export async function sendReviewInvitation(to, customerName = '', businessName = '', inviteLink = '', content = '') {
  if (!to) throw new Error('Recipient email required');
  
  const name = customerName || 'Customer';
  const subject = `Share Your Experience with ${businessName || 'Us'}`;
  
  const defaultContent = `We'd love your feedback for ${businessName || 'our business'}.`;
  const emailContent = content || defaultContent;
  
  const text = `Hi ${name},\n\n${emailContent}\n\nPlease click the link below to leave a review:\n\n${inviteLink || ''}\n\nThanks,\n${businessName || 'Our Team'}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.6; 
          color: #333333; 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 0;
        }
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }
        .header { 
          background-color: #4f46e5; 
          padding: 20px; 
          text-align: center; 
          color: white; 
        }
        .content { 
          padding: 25px; 
          background-color: #ffffff; 
        }
        .button { 
          display: inline-block; 
          padding: 12px 24px; 
          background-color: #4f46e5; 
          color: white; 
          text-decoration: none; 
          border-radius: 6px; 
          margin: 20px 0;
          font-weight: 500;
        }
        .footer { 
          margin-top: 25px; 
          padding-top: 20px; 
          border-top: 1px solid #e5e7eb; 
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h2>Share Your Experience</h2>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>${emailContent}</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteLink || '#'}" class="button">Leave a Review</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <a href="${inviteLink || '#'}" style="color: #4f46e5; word-break: break-all; margin: 15px 0; display: inline-block;">
            ${inviteLink || ''}
          </a>
          
          <div class="footer">
            <p>Thank you for your time and support!</p>
            <p>Best regards,<br><strong>${businessName || 'Our Team'}</strong></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendMail({
    from: `"${businessName || 'Review System'}" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html
  });
}