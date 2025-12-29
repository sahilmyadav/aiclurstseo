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


export async function sendMail({ to, subject, text, html }) {
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

export async function sendSubscriptionConfirmation(to, customerName = '', planName = '', amount = 0, expiryDate = '') {
  if (!to) throw new Error('Recipient email required');
  const name = customerName || 'Valued Customer';
  const subject = `Subscription Confirmation - ${planName}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; color:#111; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #4CAF50; padding: 20px; color: white; text-align: center;">
        <h1>Subscription Confirmed!</h1>
      </div>
      <div style="padding: 20px;">
        <p>Hello ${name},</p>
        <p>Thank you for subscribing to our <strong>${planName}</strong> plan.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0;">
          <p><strong>Subscription Details:</strong></p>
          <p>Plan: ${planName}</p>
          <p>Amount: $${amount}</p>
          <p>Expiry Date: ${expiryDate}</p>
        </div>
        <p>You now have access to all the premium features. If you have any questions, feel free to contact our support team.</p>
        <p>Best regards,<br>${APP_NAME} Team</p>
      </div>
      <div style="background-color: #f0f0f0; padding: 10px; text-align: center; font-size: 12px; color: #666;">
        <p>This is an automated message, please do not reply directly to this email.</p>
      </div>
    </div>`;

  return sendMail({
    to,
    subject,
    html,
    text: `Hello ${name},\n\nThank you for subscribing to our ${planName} plan.\n\nSubscription Details:\nPlan: ${planName}\nAmount: $${amount}\nExpiry Date: ${expiryDate}\n\nYou now have access to all the premium features. If you have any questions, feel free to contact our support team.\n\nBest regards,\n${APP_NAME} Team`
  });
}

export async function sendSubscriptionReminder(to, customerName = '', planName = '', expiryDate = '') {
  if (!to) throw new Error('Recipient email required');
  const name = customerName || 'Valued Customer';
  const subject = `🔔 Subscription Expiring Soon - ${planName}`;
  
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 700px;
        margin: 0 auto;
        padding: 0;
        background-color: #f5f7fa;
      }
      .email-container {
        background: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .header {
        background: linear-gradient(135deg, #FFA000, #FF8F00);
        color: white;
        padding: 25px 30px;
        text-align: center;
      }
      .content {
        padding: 30px;
      }
      h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
      }
      .expiry-alert {
        background: #FFF3E0;
        border-left: 4px solid #FFA000;
        padding: 15px;
        margin: 20px 0;
        border-radius: 0 4px 4px 0;
      }
      .button {
        display: inline-block;
        background: #4CAF50;
        color: white;
        padding: 12px 30px;
        text-decoration: none;
        border-radius: 4px;
        font-weight: 600;
        margin: 15px 0;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .button:hover {
        background: #43A047;
      }
      .footer {
        text-align: center;
        padding: 20px;
        font-size: 12px;
        color: #6b7280;
        border-top: 1px solid #e5e7eb;
        background: #f9fafb;
      }
      .highlight {
        color: #D32F2F;
        font-weight: 600;
      }
      .plan-name {
        color: #1a73e8;
        font-weight: 600;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <h1>🔔 Subscription Expiring Soon</h1>
      </div>
      <div class="content">
        <p>Hello ${name},</p>
        <p>We noticed that your <span class="plan-name">${planName}</span> subscription is about to expire on <span class="highlight">${expiryDate}</span>.</p>
        
        <div class="expiry-alert">
          <p>To ensure uninterrupted access to all features, please renew your subscription before the expiration date.</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'https://yourapp.com'}/subscription" 
             class="button">
            Renew Your Subscription
          </a>
        </div>

        <p>If you have any questions or need assistance with your subscription, our support team is here to help.</p>
        
        <p>Thank you for choosing ${APP_NAME}!</p>
        <p>Best regards,<br><strong>The ${APP_NAME} Team</strong></p>
      </div>
      <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
        <p>© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `;

  return sendMail({
    to,
    subject,
    html,
    text: `Hello ${name},\n\nThis is a friendly reminder that your ${planName} subscription will expire on ${expiryDate}.\n\nTo continue enjoying uninterrupted service, please renew your subscription before the expiration date.\n\nRenew now: ${process.env.FRONTEND_URL || 'https://yourapp.com'}/subscription\n\nIf you have any questions or need assistance, please contact our support team.\n\nBest regards,\nThe ${APP_NAME} Team`
  });
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
            <a href="${inviteLink || '#'}" class="button" style="color: white !important;">Leave a Review</a>
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