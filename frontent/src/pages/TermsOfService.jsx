import React from 'react';
import { useTheme } from '../context/ThemeContext';

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: 'By accessing or using Clurst ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service. These terms apply to all users, including visitors, registered users, and business customers.'
  },
  {
    title: '2. Description of Service',
    content: 'Clurst provides AI-powered local SEO tools including Google Business Profile management, automated posting, review management, competitor analysis, and analytics. We reserve the right to modify, suspend, or discontinue any part of the Service at any time.'
  },
  {
    title: '3. Account Registration',
    subsections: [
      { title: '3.1', content: 'You must provide accurate, complete, and current information when creating an account.' },
      { title: '3.2', content: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.' },
      { title: '3.3', content: 'You must be at least 18 years old to use this Service. By using the Service, you represent that you meet this requirement.' },
      { title: '3.4', content: 'You must notify us immediately of any unauthorized use of your account.' }
    ]
  },
  {
    title: '4. Subscription and Payments',
    subsections: [
      { title: '4.1 Billing', content: 'Subscription fees are billed in advance on a monthly or annual basis. All fees are non-refundable except as required by law.' },
      { title: '4.2 Automatic Renewal', content: 'Subscriptions automatically renew unless cancelled before the renewal date. You can cancel at any time through your account settings.' },
      { title: '4.3 Price Changes', content: 'We reserve the right to change pricing with 30 days notice. Continued use after the notice period constitutes acceptance of the new pricing.' },
      { title: '4.4 Free Trial', content: 'Free trials are available for new users only. We reserve the right to limit or terminate free trials at our discretion.' }
    ]
  },
  {
    title: '5. Acceptable Use',
    content: 'You agree not to:',
    list: [
      'Use the Service for any unlawful purpose or in violation of any regulations',
      'Attempt to gain unauthorized access to any part of the Service',
      'Transmit any harmful, offensive, or disruptive content',
      'Use automated tools to scrape or extract data from the Service',
      'Resell or sublicense the Service without our written consent',
      'Interfere with or disrupt the integrity or performance of the Service',
      'Impersonate any person or entity or misrepresent your affiliation'
    ]
  },
  {
    title: '6. Google API Usage',
    content: 'Our Service integrates with Google APIs. By using features that connect to your Google Business Profile, you also agree to Google\'s Terms of Service. We access only the data necessary to provide our services and handle it in accordance with our Privacy Policy and Google API Services User Data Policy.'
  },
  {
    title: '7. Intellectual Property',
    subsections: [
      { title: '7.1', content: 'All content, features, and functionality of the Service are owned by Clurst and are protected by intellectual property laws.' },
      { title: '7.2', content: 'You retain ownership of all content you submit through the Service. By submitting content, you grant us a license to use it solely to provide the Service.' },
      { title: '7.3', content: 'You may not copy, modify, distribute, or create derivative works based on our Service without explicit written permission.' }
    ]
  },
  {
    title: '8. Disclaimer of Warranties',
    content: 'The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, error-free, or free of viruses or other harmful components. We do not guarantee specific results from use of the Service, including search ranking improvements.'
  },
  {
    title: '9. Limitation of Liability',
    content: 'To the maximum extent permitted by law, Clurst shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising from your use of or inability to use the Service. Our total liability shall not exceed the amount paid by you in the 12 months preceding the claim.'
  },
  {
    title: '10. Indemnification',
    content: 'You agree to indemnify and hold harmless Clurst, its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including legal fees) arising from your use of the Service, violation of these Terms, or infringement of any third-party rights.'
  },
  {
    title: '11. Termination',
    subsections: [
      { title: '11.1', content: 'We may suspend or terminate your account at any time for violation of these Terms or for any other reason at our sole discretion.' },
      { title: '11.2', content: 'You may terminate your account at any time through your account settings or by contacting support.' },
      { title: '11.3', content: 'Upon termination, your right to use the Service ceases immediately. We may delete your data after a reasonable retention period.' }
    ]
  },
  {
    title: '12. Governing Law',
    content: 'These Terms shall be governed by and construed in accordance with applicable laws. Any disputes arising from these Terms shall be resolved through binding arbitration, except where prohibited by law.'
  },
  {
    title: '13. Changes to Terms',
    content: 'We reserve the right to update these Terms at any time. We will notify you of material changes via email or a prominent notice on the Service. Continued use of the Service after changes constitutes acceptance of the new Terms.'
  },
  {
    title: '14. Contact Us',
    content: 'For questions about these Terms of Service, please contact us:\n\nEmail: hello@clurst.io\nAddress: Clurst, Legal Department\nResponse Time: We aim to respond within 48 business hours.'
  }
];

const TermsOfService = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen py-12 px-4 ${isDark ? 'bg-[#0f1020] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className={`rounded-2xl p-8 mb-8 ${isDark ? 'bg-[#1a1b2e] border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
          <p className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
            Last Updated: March 19, 2026
          </p>
          <p className={`mt-4 text-sm leading-relaxed ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
            Please read these Terms of Service carefully before using Clurst. These terms govern your access to and use of our platform and services.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, i) => (
            <div key={i} className={`rounded-2xl p-6 ${isDark ? 'bg-[#1a1b2e] border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
              <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>
                {section.title}
              </h2>

              {section.content && (
                <p className={`text-sm leading-relaxed whitespace-pre-line mb-3 ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                  {section.content}
                </p>
              )}

              {section.list && (
                <ul className="space-y-2 mt-2">
                  {section.list.map((item, j) => (
                    <li key={j} className={`flex items-start text-sm ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                      <span className={`mr-2 mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${isDark ? 'bg-purple-400' : 'bg-purple-600'}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              {section.subsections && (
                <div className="space-y-3">
                  {section.subsections.map((sub, j) => (
                    <div key={j}>
                      {sub.title && (
                        <span className={`text-sm font-semibold mr-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          {sub.title}
                        </span>
                      )}
                      <span className={`text-sm leading-relaxed ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                        {sub.content}
                      </span>
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

export default TermsOfService;
