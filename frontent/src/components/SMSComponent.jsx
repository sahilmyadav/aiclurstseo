import { useEffect, useState } from 'react';
import { FaPaperPlane, FaPhone, FaUpload, FaUser, FaSpinner } from 'react-icons/fa';
import { toast } from 'sonner';
import { useAuth } from './context/AuthContext';
import { useGoogleBusiness } from './context/GoogleBusinessContext';
import BulkUploadComponent from './BulkUploadComponent';

const SMSComponent = () => {
  const { user, token } = useAuth();
  const { businesses, loading: businessesLoading, selectedBusiness, fetchBusinesses } = useGoogleBusiness();
  
  const [formData, setFormData] = useState({
    businessId: '',
    customerName: '',
    customerPhone: ''
  });
  const [isSending, setIsSending] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
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

  const handleSendSMS = async (e) => {
    e.preventDefault();
    
    if (!formData.businessId) {
      toast.error("Please select a business");
      return;
    }
    
    if (!formData.customerName?.trim()) {
      toast.error("Please enter customer name");
      return;
    }

    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    const phoneNumber = formData.customerPhone.replace(/[^\d+]/g, '');
    
    if (!phoneRegex.test(phoneNumber)) {
      toast.error("Please enter a valid phone number with country code (e.g., +1 for US)");
      return;
    }

    if (!token) {
      toast.error("Authentication error. Please sign in again.");
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/sms/invite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: formData.businessId,
          customerName: formData.customerName.trim(),
          customerPhone: phoneNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send SMS invitation');
      }

      toast.success(data.message || "SMS invitation sent successfully!");
      setFormData(prev => ({
        ...prev,
        customerName: '',
        customerPhone: ''
      }));
    } catch (error) {
      console.error('Error sending SMS invitation:', error);
      toast.error(error.message);
    } finally {
      setIsSending(false);
    }
  };

  if (businessesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-2xl text-purple-500" />
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
        <h1 className="text-2xl font-bold mb-2">Send SMS Invitations</h1>
        <p className="text-gray-400">Invite your customers to leave a review via SMS</p>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {showBulkUpload ? 'Bulk Upload Contacts' : 'Single Invitation'}
          </h2>
          <button
            onClick={() => setShowBulkUpload(!showBulkUpload)}
            className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-sm font-medium transition-colors"
          >
            {showBulkUpload ? (
              <>
                <FaUser className="mr-2" />
                Single Invitation
              </>
            ) : (
              <>
                <FaUpload className="mr-2" />
                Bulk Upload
              </>
            )}
          </button>
        </div>

        {showBulkUpload ? (
          <BulkUploadComponent type="sms" />
        ) : (
          <form onSubmit={handleSendSMS} className="space-y-4">
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
                  className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 [&_option]:bg-gray-800 [&_option]:text-white"
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
                  Customer Name (Optional)
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
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-300 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="customerPhone"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    placeholder="+1234567890"
                    className="w-full pl-10 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Include country code (e.g., +1 for US)</p>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSending || businesses.length === 0}
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
                    Send SMS Invitation
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">SMS Preview</h2>
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <p className="text-gray-300 mb-4">
            Hi {formData.customerName || 'there'}, we'd love your feedback! Please take a moment to leave us a review: [Review Link]
          </p>
          <p className="text-sm text-gray-400">
            Sent from: {businesses.find(b => b.id === formData.businessId)?.name || 'Our Business'}
          </p>
          <p className="mt-2 text-sm text-gray-400">
            Best regards,<br />
            {businesses.find(b => b.id === formData.businessId)?.name || 'Our Team'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SMSComponent;