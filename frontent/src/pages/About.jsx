import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Rocket, MessageSquare, Bot, QrCode, Brain, BarChart3, Building2, Check, Zap } from 'lucide-react';

export default function About() {
  const features = [
    {
      icon: Rocket,
      title: 'Automated Google SEO',
      description: 'AI posts keyword-optimized updates on your Google Business Profile to keep it active and ranking higher.',
      benefits: [
        'Higher search rankings',
        'Increased local visibility',
        'More customer engagement'
      ]
    },
    {
      icon: MessageSquare,
      title: 'Smart Review Management',
      description: 'Automate review requests and responses to maintain a strong online reputation.',
      benefits: [
        'More 5-star reviews',
        'Faster response times',
        'Improved customer trust'
      ]
    },
    {
      icon: QrCode,
      title: 'QR Code Reviews',
      description: 'Generate branded QR codes that make leaving reviews quick and easy for customers.',
      benefits: [
        'Simplify review process',
        'Increase review volume',
        'Enhance customer experience'
      ]
    },
    {
      icon: Brain,
      title: 'AI-Powered Insights',
      description: 'Get actionable insights and recommendations to improve your online presence.',
      benefits: [
        'Data-driven decisions',
        'Performance tracking',
        'Competitive analysis'
      ]
    }
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Connect Your Business',
      description: 'Securely link your Google Business Profile in just a few clicks.',
      icon: <Zap className="w-6 h-6 text-white" />
    },
    {
      step: '2',
      title: 'Set Your Preferences',
      description: 'Customize settings to match your brand voice and goals.',
      icon: <Check className="w-6 h-6 text-white" />
    },
    {
      step: '3',
      title: 'Let AI Work',
      description: 'Our system handles the rest, optimizing your online presence 24/7.',
      icon: <BarChart3 className="w-6 h-6 text-white" />
    },
    {
      step: '4',
      title: 'Grow Your Business',
      description: 'Watch your online visibility and customer engagement increase.',
      icon: <Rocket className="w-6 h-6 text-white" />
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-indigo-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-2 mb-6 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-full"
            >
              About Clurst
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
            >
              The Future of <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Business Growth</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto"
            >
              Clurst is an AI-powered platform designed to help businesses enhance their online presence, automate customer engagement, and drive sustainable growth through intelligent automation.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Powerful Features for <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Business Growth</span>
            </motion.h2>
            <p className="text-lg text-gray-600">
              Everything you need to automate and optimize your online presence
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-lg mb-6">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-gray-600">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              How It <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Works</span>
            </motion.h2>
            <p className="text-lg text-gray-600">
              Get started in minutes and see results immediately
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Timeline */}
            <div className="hidden md:block absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-200 via-purple-200 to-indigo-200"></div>
            
            <div className="space-y-12">
              {howItWorks.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative md:pl-20"
                >
                  <div className="hidden md:flex absolute left-0 w-16 h-16 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 items-center justify-center text-white font-bold text-xl">
                    {step.step}
                  </div>
                  <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="md:hidden w-12 h-12 flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full text-white font-bold text-lg mb-4">
                      {step.step}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-white mb-6"
            >
              Ready to Transform Your Business?
            </motion.h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses that trust Clurst to automate their online presence and drive growth.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-indigo-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Start Free 14-Day Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
             
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
