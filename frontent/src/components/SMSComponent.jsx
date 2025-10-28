import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { FaPaperPlane, FaPhone, FaUpload, FaUser } from 'react-icons/fa';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import BulkUploadComponent from './BulkUploadComponent';

const SMSComponent = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    businessId: '',
    customerName: '',
    customerPhone: ''
  });
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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

  const handleSendSMS = async (e) => {
    e.preventDefault();
    
    if (!formData.businessId || !formData.customerPhone || !formData.customerName) {
      toast.error("Please fill in all fields");
      return;
    }

    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    if (!phoneRegex.test(formData.customerPhone)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsSending(true);
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user found');
      
      const token = await currentUser.getIdToken();
      
      const response = await axios.post(
        '/api/invitations/sms',
        {
          businessId: formData.businessId,
          customerPhone: formData.customerPhone,
          customerName: formData.customerName
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      
      if (response.status === 200 || response.status === 201) {
        toast.success("SMS invitation sent successfully!");
        setFormData(prev => ({
          ...prev,
          customerName: "",
          customerPhone: ""
        }));
      } else {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
    } catch (error) {
      console.error("Error sending SMS:", error);
      const errorMessage = error.response?.data?.error || 
                         error.message || 
                         "Failed to send SMS invitation";
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
                  {businesses.map((business) => (
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
              <div>
                <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-300 mb-1">
                  Customer Phone Number
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
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSending || businesses.length === 0}
                className={`flex items-center justify-center w-full md:w-auto px-6 py-2.5 rounded-md text-white font-medium ${
                  isSending || businesses.length === 0
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                } transition-colors`}
              >
                {isSending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
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
            <span className="font-medium">To:</span> {formData.customerPhone || '[Customer Phone]'}
          </p>
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-white">
              Hi {formData.customerName || 'there'},<br /><br />
              We'd love to hear your feedback about your recent experience with us. Could you take a moment to leave us a review?
              <br /><br />
              <a href="#" className="text-indigo-400 hover:underline">
                Click here to leave your review
              </a>
              <br /><br />
              Thank you for being a valued customer!
              <br /><br />
              Best regards,<br />
              {businesses.find(b => b.name === formData.businessId)?.title || 'Our Team'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SMSComponent;