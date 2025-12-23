import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, Users, MessageSquare, Shield, Zap, CheckCircle } from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: <BarChart2 className="w-8 h-8 text-blue-500" />,
      title: 'Advanced Analytics',
      description: 'Get detailed insights into your business performance with our powerful analytics dashboard.'
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-blue-500" />,
      title: 'Review Management',
      description: 'Easily manage and respond to customer reviews from multiple platforms in one place.'
    },
    {
      icon: <Users className="w-8 h-8 text-blue-500" />,
      title: 'Customer Engagement',
      description: 'Build stronger relationships with your customers through timely and meaningful interactions.'
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-500" />,
      title: 'Secure & Reliable',
      description: 'Your data security is our top priority with enterprise-grade encryption and compliance.'
    },
    {
      icon: <Zap className="w-8 h-8 text-blue-500" />,
      title: 'Fast & Efficient',
      description: 'Streamline your workflow with our intuitive interface and lightning-fast performance.'
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-blue-500" />,
      title: 'Easy Integration',
      description: 'Seamlessly connect with your favorite tools and platforms for a unified experience.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-900 dark:to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              About Our Platform
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-xl text-blue-100">
              Empowering businesses to thrive in the digital world through innovative solutions and exceptional service.
            </p>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      {/* Our Story */}
      <div className="py-16 bg-white dark:bg-gray-800 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 dark:text-blue-400 font-semibold tracking-wide uppercase">Our Story</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Building the Future of Business Management
            </p>
            <div className="mt-8 max-w-3xl mx-auto text-lg text-gray-500 dark:text-gray-300">
              <p className="mb-4">
                Founded with a vision to simplify business operations, our platform has grown from a simple idea into a comprehensive solution trusted by businesses worldwide. We believe in creating tools that empower businesses to focus on what they do best - delivering exceptional products and services.
              </p>
              <p>
                Our team of passionate professionals is dedicated to continuous innovation, ensuring our platform evolves with the changing needs of modern businesses. We're committed to providing intuitive, powerful tools that drive growth and success.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 dark:text-blue-400 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Everything You Need to Succeed
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 lg:mx-auto">
              Our platform is packed with powerful features designed to help your business grow.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div key={index} className="pt-6">
                  <div className="flow-root bg-white dark:bg-gray-800 rounded-lg px-6 pb-8 shadow-lg h-full transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <div className="-mt-6">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                        {feature.icon}
                      </div>
                      <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white text-center">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-base text-gray-500 dark:text-gray-300 text-center">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-700 dark:bg-blue-800">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to transform your business?</span>
            <span className="block text-blue-100">Start your free trial today.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-blue-200">
            Join thousands of businesses that trust our platform to help them grow.
          </p>
          <Link
            to="/signup"
            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 sm:w-auto transition-colors duration-200"
          >
            Get started for free
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
