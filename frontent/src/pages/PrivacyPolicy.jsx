import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';

const sections = [
  {
    title: '1. About Clurst',
    content: 'Clurst ("we", "our", "us") is an AI-powered local SEO platform that helps businesses manage their Google Business Profile, automate posts, manage reviews, analyze competitors, and track performance analytics. This Privacy Policy explains how we collect, use, and protect your data when you use our services at clurst.io.'
  },
  {
    title: '2. Information We Collect',
    subsections: [
      {
        title: '2.1 Account Information',
        content: 'When you register, we collect your name, email address, phone number, and password (hashed and salted — never stored in plain text).'
      },
      {
        title: '2.2 Google Business Profile Data',
        content: 'When you connect your Google account, we access your Google Business Profile data including business name, address, phone number, website, categories, business hours, photos, posts, and reviews. We also store your Google OAuth tokens (access token, refresh token) securely to perform actions on your behalf such as posting, replying to reviews, and fetching analytics.'
      },
      {
        title: '2.3 Business Performance Data',
        content: 'We fetch and store performance metrics from Google Business Profile Performance API including impressions, website clicks, call clicks, direction requests, and conversations to provide you with analytics and audit insights.'
      },
      {
        title: '2.4 Review & Invitation Data',
        content: 'We collect customer names, email addresses, phone numbers, feedback, and ratings when you use our review invitation features (email or SMS). This data is used solely to send review requests on your behalf.'
      },
      {
        title: '2.5 Competitor Data',
        content: 'We use Google Places API to fetch nearby competitor business information (name, address, rating, categories, photos, hours) based on your business location. This data is cached temporarily (24 hours) in our database.'
      },
      {
        title: '2.6 Scheduled Posts',
        content: 'We store post content, scheduling details, and recurrence settings you create through our platform to publish them to your Google Business Profile at the scheduled time.'
      },
      {
        title: '2.7 Payment Information',
        content: 'Payments are processed by Stripe. We store transaction metadata (session ID, amount, currency, status) but never store your full card details. Stripe handles all sensitive payment data under their own PCI-DSS compliance.'
      },
      {
        title: '2.8 Usage & Device Data',
        content: 'We automatically collect IP address, browser type, operating system, and usage patterns through standard server logs and rate limiting middleware to ensure security and service quality.'
      }
    ]
  },
  {
    title: '3. How We Use Your Information',
    subsections: [
      { title: '3.1 Service Delivery', content: 'To provide core features: Google Business Profile management, automated post scheduling, review management, competitor analysis, performance analytics, and AI-powered audit insights.' },
      { title: '3.2 Auto-Reply', content: 'If you enable auto-reply, we use your stored Google OAuth tokens to automatically respond to new reviews on your behalf using AI-generated responses.' },
      { title: '3.3 Review Invitations', content: 'We use customer contact details you provide to send review invitation emails and SMS messages via our email service and Twilio SMS service.' },
      { title: '3.4 AI Analysis', content: 'We use Google Gemini AI to analyze your reviews and performance data to generate audit reports and insights. Your data is sent to Gemini API for processing but is not used to train shared AI models.' },
      { title: '3.5 Subscription Management', content: 'We use your account and payment data to manage your subscription, send renewal reminders, and handle billing through Stripe.' },
      { title: '3.6 Security & Fraud Prevention', content: 'We use rate limiting and authentication middleware to protect your account and our platform from unauthorized access.' }
    ]
  },
  {
    title: '4. Third-Party Services We Use',
    subsections: [
      { title: 'Google APIs', content: 'Google Business Profile API, Google Places API, Google Business Profile Performance API, and Google OAuth 2.0. Our use of Google API data adheres to the Google API Services User Data Policy, including Limited Use requirements.' },
      { title: 'Stripe', content: 'Payment processing. Stripe stores and processes your payment card data under their own privacy policy and PCI-DSS compliance.' },
      { title: 'Firebase', content: 'Firebase Authentication for social login and user authentication.' },
      { title: 'Twilio', content: 'SMS delivery for review invitation messages sent to your customers.' },
      { title: 'Google Gemini AI', content: 'AI-powered analysis of reviews and business performance data to generate audit insights.' },
      { title: 'MongoDB Atlas', content: 'Cloud database hosting for storing your account, business, and analytics data securely.' }
    ]
  },
  {
    title: '5. Data Storage & Security',
    subsections: [
      { title: '5.1 Encryption', content: 'All data in transit is encrypted using TLS/SSL. Passwords are hashed using bcrypt with salt rounds. OAuth tokens are stored in our database and used only to perform actions you have authorized.' },
      { title: '5.2 Access Controls', content: 'We use JWT-based authentication and role-based access control (user/admin roles) to ensure only authorized users can access their data.' },
      { title: '5.3 Rate Limiting', content: 'Authentication endpoints are rate-limited to prevent brute force attacks.' },
      { title: '5.4 Data Retention', content: 'Competitor cache data is automatically deleted after 24 hours. Account data is retained as long as your account is active. After account deletion, we may retain certain data for legal compliance for up to 90 days.' }
    ]
  },
  {
    title: '6. Your Privacy Rights',
    subsections: [
      { title: '6.1 Access & Export', content: 'You can access your account data at any time through your account settings.' },
      { title: '6.2 Correction', content: 'You can update your profile information through your account settings.' },
      { title: '6.3 Deletion', content: 'You may request deletion of your account and associated data by contacting us at hello@clurst.io.' },
      { title: '6.4 Disconnect Google', content: 'You can disconnect your Google Business Profile at any time through the Integrations section. This will revoke our access to your Google data.' },
      { title: '6.5 Opt-out of Marketing', content: 'You can opt out of marketing emails at any time by clicking the unsubscribe link in any email we send.' },
      { title: '6.6 GDPR (EU Users)', content: 'EU users have the right to object to processing, restrict processing, data portability, and to lodge complaints with their local supervisory authority.' },
      { title: '6.7 CCPA (California Users)', content: 'California residents have the right to know what personal information is collected, request deletion, and opt-out of sale of personal information. We do not sell personal information.' }
    ]
  },
  {
    title: '7. Cookies',
    content: 'We use essential cookies and local storage for authentication (JWT tokens) and user preferences. We do not use third-party advertising cookies. You can control cookie settings through your browser.'
  },
  {
    title: "8. Children's Privacy",
    content: 'Clurst is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If you believe a child has provided us with their information, please contact us immediately at hello@clurst.io.'
  },
  {
    title: '9. Changes to This Policy',
    content: 'We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a notice on our platform. The "Last Updated" date at the top of this page reflects the most recent revision. Continued use of Clurst after changes constitutes acceptance of the updated policy.'
  },
  {
    title: '10. Contact Us',
    content: 'For any privacy-related questions, data requests, or concerns:\n\nEmail: hello@clurst.io\nWebsite: clurst.io\n\nWe aim to respond to all privacy inquiries within 48 hours.'
  }
];

const PrivacyPolicy = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen py-12 px-4 ${isDark ? 'bg-[#0f1020] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className={`rounded-2xl p-8 mb-8 ${isDark ? 'bg-[#1a1b2e] border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
            Last Updated: March 19, 2026
          </p>
          <p className={`mt-4 text-sm leading-relaxed ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
            At Clurst, we take your privacy seriously. This policy explains exactly what data we collect, why we collect it, and how we protect it when you use our AI-powered local SEO platform.
          </p>
          <div className={`mt-4 flex gap-4 text-sm ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>
            <Link to="/terms-of-service" className="hover:underline">Terms of Service →</Link>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, i) => (
            <div key={i} className={`rounded-2xl p-6 ${isDark ? 'bg-[#1a1b2e] border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
              <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>
                {section.title}
              </h2>

              {section.content && (
                <p className={`text-sm leading-relaxed whitespace-pre-line ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                  {section.content}
                </p>
              )}

              {section.subsections && (
                <div className="space-y-4">
                  {section.subsections.map((sub, j) => (
                    <div key={j}>
                      <h3 className={`text-sm font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {sub.title}
                      </h3>
                      <p className={`text-sm leading-relaxed ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                        {sub.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
