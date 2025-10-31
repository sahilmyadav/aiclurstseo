import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { FaUser, FaEnvelope, FaPaperPlane, FaSpinner } from 'react-icons/fa';
import { useAuth } from './context/AuthContext';
import { useGoogleBusiness } from './context/GoogleBusinessContext';

const EmailComponent = () => {
  const { user, token } = useAuth();
  const { businesses, loading: businessesLoading, selectedBusiness, fetchBusinesses } = useGoogleBusiness();
  
  const [formData, setFormData] = useState({
    businessId: '',
    customerName: '',
    customerEmail: ''
  });
  const [isSending, setIsSending] = useState(false);
  const BACKEND_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || "http://localhost:8000";
  
  // Set the selected business when businesses are loaded or changed
  useEffect(() => {
    if (businesses.length > 0) {
      // If there's a selectedBusiness, use that, otherwise use the first business
      const businessToSelect = selectedBusiness || businesses[0];
      if (businessToSelect) {
        setFormData(prev => ({
          ...prev,
          businessId: businessToSelect.id || '',
          businessName: businessToSelect.title || businessToSelect.locationName || 'Selected Business'
        }));
      }
    }
  }, [businesses, selectedBusiness]);
  
  // Format business name for display
  const getBusinessDisplayName = (business) => {
    return business?.title || business?.locationName || 'Business Location';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendInvitation = async (e) => {
    e.preventDefault();
    
    // Show coming soon message in toast
    toast.info('Email invitation feature is coming soon!', {
      description: 'We are working hard to bring you this feature.',
      duration: 5000,
    });
    
    // Reset form
    setFormData(prev => ({
      ...prev,
      customerName: '',
      customerEmail: ''
    }));
    
    return;
    
    // The following code is kept for future implementation
    if (!formData.businessId) {
      toast.error("Please select a business");
      return;
    }
    
    if (!formData.customerName.trim()) {
      toast.error("Please enter customer name");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.customerEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSending(true);
    try {
      console.log('Sending invitation with data:', formData);
      if (!user || !token) {
        throw new Error('User not authenticated');
      }
      
      const response = await fetch(`${BACKEND_URL}/api/invitations/email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: formData.businessId,
          customerName: formData.customerName.trim(),
          customerEmail: formData.customerEmail.toLowerCase().trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = 'Failed to send invitation';
        if (data?.error) {
          errorMessage = data.error;
        } else if (data?.message) {
          errorMessage = data.message;
        }
        throw new Error(errorMessage);
      }
      
      // Clear form on success
      setFormData(prev => ({
        ...prev,
        customerName: '',
        customerEmail: ''
      }));
      
      toast.success('Invitation sent successfully!');
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error(error.message || 'Failed to send invitation');
    } finally {
      setIsSending(false);
    }
  };

  if (businessesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!businesses || businesses.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600 mb-4">No Google Business accounts found.</p>
        <button
          onClick={() => window.open('/dashboard/integrations', '_blank')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Connect Google Business
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 text-white min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Send Email Invitations</h1>
        <p className="text-gray-400">Invite your customers to leave a review via email</p>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            Email Invitation
          </h2>
        </div>

        {businessesLoading ? (
          <div className="flex items-center justify-center h-64">
            <FaSpinner className="animate-spin text-2xl text-purple-500" />
          </div>
        ) : businesses.length === 0 ? (
          <div className="text-center p-8 bg-gray-900 rounded-lg border border-gray-700">
            <p className="text-gray-300 mb-4">No businesses found. Please add a business first.</p>
            <button
              onClick={() => window.location.href = '/businesses'}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
            >
              Add Business
            </button>
          </div>
        ) : (
          <form onSubmit={handleSendInvitation} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label htmlFor="businessId" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Business
                </label>
                <select
                  id="businessId"
                  name="businessId"
                  value={formData.businessId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 [&_option]:text-gray-900"
                  disabled={businessesLoading}
                  required
                >
                  <option value="">Select a business</option>
                  {businesses.map((business) => (
                    <option key={business.id} value={business.id}>
                      {getBusinessDisplayName(business)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-300 mb-1">
                  Customer Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="w-full pl-10 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-300 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="customerEmail"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                    placeholder="customer@example.com"
                    className="w-full pl-10 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSending}
                className="w-full flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <>
                    <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Sending...
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="mr-2" />
                    Send Email Invitation
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Email Preview</h2>
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <p className="text-gray-300 mb-4">
            Hi {formData.customerName || 'there'}, we'd love your feedback! Please take a moment to leave us a review: [Review Link]
          </p>
          <p className="text-sm text-gray-400">
            Sent from: {businesses.find(b => b.id === formData.businessId)?.name || 'Our Business'}
 - {businesses.find(b => b.id === formData.businessId)?.name || 'Our Business'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailComponent;