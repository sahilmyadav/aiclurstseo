import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { FaUser, FaEnvelope, FaPaperPlane, FaUpload } from 'react-icons/fa';
import { getAuth } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import BulkUploadComponent from './BulkUploadComponent';

const EmailComponent = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    businessId: '',
    customerName: '',
    customerEmail: ''
  });
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSendForm, setShowSendForm] = useState(true);
  const BACKEND_URL = (import.meta.env.VITE_API_BASE || 'http://localhost:8000').replace(/\/$/, '');

  useEffect(() => {
    const fetchGoogleBusinesses = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
          throw new Error('No authenticated user found. Please log in again.');
        }
        
        // Get fresh token
        const token = await currentUser.getIdToken(true);
        
        // Fetch Google businesses
        const response = await fetch(`${BACKEND_URL}/auth/google/businesses`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (response.status === 401) {
          throw new Error('Authentication failed. Please reconnect your Google account.');
        }
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch Google businesses: ${response.status}`);
        }
        
        const data = await response.json();
        const googleBusinesses = data.businesses || [];
        setBusinesses(googleBusinesses);
        
        // Auto-select first business if available
        if (googleBusinesses.length > 0) {
          setFormData(prev => ({
            ...prev,
            businessId: googleBusinesses[0].name // Using Google business name as ID
          }));
        } else {
          toast.info('No Google businesses found. Please connect your Google My Business account.');
        }
      } catch (error) {
        console.error('Error fetching Google businesses:', error);
        toast.error(error.message || 'Failed to load Google business information. Please ensure you have connected your Google account.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchGoogleBusinesses();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendInvitation = async (e) => {
    e.preventDefault();
    if (!formData.businessId || !formData.customerEmail || !formData.customerName) {
      toast.error("Please fill in all fields");
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
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error('No authenticated user found. Please log in again.');
      }
      
      // Get fresh token
      const token = await currentUser.getIdToken(true);
      
      console.log('Auth token:', token ? 'Token received' : 'No token');
      
      const requestData = {
        businessId: formData.businessId,
        customerEmail: formData.customerEmail,
        customerName: formData.customerName,
        message: formData.message || 'Please leave us a review!'
      };
      
      console.log('Sending request to server:', requestData);
      
      const response = await axios.post(
        '/api/invitations/email',
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: true
        }
      );
      
      console.log('API Response:', response);
      
      if (response.status === 200 || response.status === 201) {
        toast.success("Invitation sent successfully!");
        setFormData(prev => ({
          ...prev,
          customerName: "",
          customerEmail: ""
        }));
        setShowSendForm(false);
      } else {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
    } catch (error) {
      console.error("Error sending invitation:", {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      let errorMessage = "Failed to send invitation";
      
      if (error.response) {
        errorMessage = error.response.data?.error || 
                      error.response.data?.message || 
                      `Server responded with status ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = error.message;   
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 text-white min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Send Review Invitations</h1>
        <p className="text-gray-400">Invite your customers to leave a review</p>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {showBulkUpload ? 'Bulk Upload Contacts' : 'Single Invitation'}
          </h2>
          <button
            onClick={() => setShowBulkUpload(!showBulkUpload)}
            className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
          >
            <FaUpload className="mr-2" />
            {showBulkUpload ? 'Switch to Single' : 'Switch to Bulk'}
          </button>
        </div>

        {showBulkUpload ? (
          <div className="mt-4">
            <BulkUploadComponent 
              businessId={formData.businessId}
              onUploadComplete={() => {
                setShowBulkUpload(false);
                toast.success('Bulk upload completed successfully!');
              }}
            />
          </div>
        ) : (
          <form onSubmit={handleSendInvitation} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="businessId" className="block text-sm font-medium text-gray-300 mb-1">
                  Select Google Business
                </label>
                <select
                  id="businessId"
                  name="businessId"
                  value={formData.businessId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  {businesses.map(business => (
                    <option key={business.name} value={business.name}>
                      {business.title}
                    </option>
                  ))}
                </select>
                {businesses.length === 0 && (
                  <p className="text-xs text-yellow-400 mt-1">
                    No Google businesses found. Please connect your Google My Business account in Integrations.
                  </p>
                )}
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
                <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-300 mb-1">
                  Customer Email <span className="text-red-500">*</span>
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
                disabled={isSending || businesses.length === 0}
                className="w-full flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="mr-2" />
                    Send Invitation
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Invitation Preview</h2>
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <p className="text-gray-300 mb-2">Subject: Share your experience with us!</p>
          <p className="text-gray-400 mb-4">
            Dear {formData.customerName || 'Valued Customer'},<br /><br />
            We would love to hear about your experience with us. Please take a moment to leave us a review.
            <br /><br />
            <a href="#" className="text-indigo-400 hover:underline">Click here to leave your review</a>
            <br /><br />
            Thank you for your time and support!
            <br /><br />
            Best regards,<br />
            {businesses.find(b => b.name === formData.businessId)?.title || 'Our Team'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailComponent;