import React, { useState } from 'react';
import { CheckCircle, HelpCircle } from 'lucide-react';

export default function SubscriptionPage() {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = {
    starter: {
      name: 'Starter',
      price: { monthly: 99, yearly: 948 }, // 12 months for the price of 11 (99 * 12 = 1188 → 948)
      description: 'Perfect for small businesses getting started',
      features: [
        'Basic SEO tools',
        '10 monthly site audits',
        'Keyword research (500 queries/month)',
        'Basic analytics dashboard',
        'Email support (48h response)',
        '1 user account',
        'Basic reporting'
      ],
      popular: false
    },
    growth: {
      name: 'Growth',
      price: { monthly: 199, yearly: 1990 }, // 12 months for the price of 10 (199 * 12 = 2388 → 1990)
      description: 'For growing businesses with multiple projects',
      features: [
        'Everything in Starter',
        'Unlimited site audits',
        'Keyword research (2000 queries/month)',
        'Advanced analytics',
        'Priority email support (24h response)',
        'Up to 5 user accounts',
        'Competitor analysis',
        'Custom reporting',
        'API access (limited)'
      ],
      popular: true
    },
    pro: {
      name: 'Pro',
      price: { monthly: 299, yearly: 2990 }, // 12 months for the price of 10 (299 * 12 = 3588 → 2990)
      description: 'For agencies and marketing teams',
      features: [
        'Everything in Growth',
        'Unlimited keyword research',
        'White-label reports',
        'Full API access',
        '24/7 priority support',
        'Unlimited user accounts',
        'Team collaboration tools',
        'AI-powered recommendations',
        'Dedicated account manager',
        'Onboarding session'
      ],
      popular: false
    }
  };

  const handlePlanSelect = (planKey) => {
    setSelectedPlan(planKey);
    // Handle plan selection logic here
    console.log('Selected plan:', planKey);
  };

  const toggleBillingCycle = () => {
    setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly');
  };

  const getPriceSuffix = (price) => {
    if (price === 0) return 'Free';
    if (price === 'Custom') return 'Contact Us';
    return `$${price}${billingCycle === 'monthly' ? '/mo' : '/yr'}`;
  };

  const calculateSavings = (monthlyPrice, yearlyPrice) => {
    if (yearlyPrice === 'Custom' || monthlyPrice === 'Custom') return '';
    const savings = ((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100;
    return `Save ${Math.round(savings)}%`;
  };

  return (
    <div className="min-h-screen w-full bg-[#121324] py-8 px-4 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-3">Choose Your Plan</h1>
          <p className="text-gray-300 max-w-2xl mx-auto">Select the plan that works best for your business needs. All plans include a 14-day free trial.</p>
          
          <div className="mt-8 flex items-center justify-center">
            <div className="inline-flex items-center bg-[#1a1b2e] p-1 rounded-lg border border-white/10">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  billingCycle === 'monthly' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
                  billingCycle === 'yearly' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                Yearly Billing
                <span className="ml-2 px-2 py-0.5 bg-blue-900/50 text-blue-300 text-xs rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(plans).map(([key, plan]) => (
            <div 
              key={key}
              className={`bg-[#1a1b2e]/90 rounded-xl overflow-hidden border ${
                plan.popular ? 'border-blue-500' : 'border-white/10 hover:border-white/20'
              } transition-all duration-200`}
            >
              {plan.popular && (
                <div className="bg-blue-600 text-white text-center py-2 text-sm font-medium">
                  Most Popular
                </div>
              )}
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="text-gray-400 text-sm mt-1">{plan.description}</p>
                </div>

                <div className="mb-6 bg-[#121324] p-4 rounded-lg border border-white/5">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-white">
                      ${billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly}
                    </span>
                    <span className="ml-1.5 text-gray-400">
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <p className="text-sm text-green-400 mt-1 font-medium">
                      {calculateSavings(plan.price.monthly, plan.price.yearly)} • 1 month free
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2.5 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanSelect(key)}
                  className={`w-full py-2.5 px-4 rounded-lg font-medium transition-colors ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {plan.popular ? 'Get Started' : 'Choose Plan'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-white mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                question: 'Can I change plans later?',
                answer: 'Yes, you can upgrade or downgrade your plan at any time. Your subscription will be prorated accordingly.'
              },
              {
                question: 'Is there a free trial?',
                answer: 'Yes, all paid plans come with a 14-day free trial. No credit card is required to start your trial.'
              },
              {
                question: 'What payment methods do you accept?',
                answer: 'We accept all major credit cards including Visa, Mastercard, American Express, and Discover.'
              },
              {
                question: 'Can I cancel anytime?',
                answer: 'Yes, you can cancel your subscription at any time. Your account will remain active until the end of your billing period.'
              }
            ].map((faq, index) => (
              <div key={index} className="bg-[#1a1b2e]/90 p-4 rounded-lg border border-white/10">
                <h3 className="font-medium text-white">{faq.question}</h3>
                <p className="mt-1.5 text-gray-300 text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
