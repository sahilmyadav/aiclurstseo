import { useEffect, useState } from "react";
import {
  FaPaperPlane,
  FaPhone,
  FaUpload,
  FaUser,
  FaSpinner,
} from "react-icons/fa";
import { toast } from "sonner";
import { useTheme } from "../context/ThemeContext";
import BulkUploadComponent from "./BulkUploadComponent";
import BusinessProfileDropdown from "./common/BusinessProfileDropdown";
import { useAuth } from "./context/AuthContext";
import { useGoogleBusiness } from "./context/GoogleBusinessContext";

const SMSComponent = () => {
  const { theme } = useTheme();
  const { user, token } = useAuth();
  const {
    businesses,
    loading: businessesLoading,
    selectedBusiness,
    fetchBusinesses,
  } = useGoogleBusiness();

  const [formData, setFormData] = useState({
    businessId: "",
    businessName: "",
    customerName: "",
    customerPhone: "",
  });
  const [isSending, setIsSending] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const BACKEND_URL =
    import.meta.env.VITE_API_BASE?.replace(/\/$/, "") ||
    "http://localhost:8000";

  // Set the selected business when businesses are loaded or changed
  useEffect(() => {
    if (businesses.length > 0) {
      // If there's a selectedBusiness, use that, otherwise use the first business
      const businessToSelect = selectedBusiness || businesses[0];
      if (businessToSelect) {
        setFormData((prev) => ({
          ...prev,
          businessId: businessToSelect.id || "",
          businessName:
            businessToSelect.title ||
            businessToSelect.locationName ||
            "Selected Business",
        }));
      }
    }
  }, [businesses, selectedBusiness]);

  // Format business name for display
  const getBusinessDisplayName = (business) => {
    return business?.title || business?.locationName || "Business Location";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSendSMS = async (e) => {
    console.log("handleSendSMS triggered");
    e.preventDefault();

    if (!formData.businessId) {
      toast.error("Please select a business");
      return;
    }

    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    const phoneNumber = formData.customerPhone.replace(/[^\d+]/g, "");

    if (!phoneRegex.test(phoneNumber)) {
      toast.error(
        "Please enter a valid phone number with country code (e.g., +1 for US)"
      );
      return;
    }

    if (!token) {
      toast.error("Authentication error. Please sign in again.");
      return;
    }

    setIsSending(true);
    try {
      console.log("Request payload:", {
        businessName: formData.businessName,
        customerName: formData.customerName.trim(),
        customerPhone: phoneNumber,
      });

      const response = await fetch(`${BACKEND_URL}/api/invitations/sms`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessName: formData.businessName,
          customerName: formData.customerName.trim(),
          customerPhone: phoneNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send SMS invitation");
      }

      toast.success(data.message || "SMS invitation sent successfully!");
      setFormData((prev) => ({
        ...prev,
        customerName: "",
        customerPhone: "",
      }));
    } catch (error) {
      console.error("Error sending SMS invitation:", error);
      toast.error(error.message);
    } finally {
      setIsSending(false);
    }
  };

  if (businessesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className={`animate-spin text-2xl ${
          theme === 'dark' ? 'text-purple-500' : 'text-purple-600'
        }`} />
      </div>
    );
  }

  if (!businesses || businesses.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600 mb-4">No Google Business accounts found.</p>
        <button
          onClick={() => window.open("/dashboard/integrations", "_blank")}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Connect Google Business
        </button>
      </div>
    );
  }

  // Theme classes
  const mainContainerClasses = `max-w-4xl mx-auto p-6 min-h-screen ${
    theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
  }`;

  const cardClasses = `rounded-lg shadow-lg p-6 mb-8 ${
    theme === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200'
  }`;

  const inputClasses = `w-full pl-10 px-4 py-2 rounded-md focus:ring-2 focus:border-transparent ${
    theme === 'dark' 
      ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500' 
      : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500 border'
  }`;

  const buttonClasses = `w-full flex items-center justify-center px-6 py-3 ${
    theme === 'dark' 
      ? 'bg-indigo-600 hover:bg-indigo-700' 
      : 'bg-purple-600 hover:bg-purple-700'
  } text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed`;

  return (
    <div className={mainContainerClasses}>
      <div className="mb-8">
        <h1 className={`text-2xl font-bold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Send SMS Invitations
        </h1>
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
          Invite your customers to leave a review via SMS
        </p>
      </div>

      <div className={cardClasses}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {showBulkUpload ? "Bulk Upload Contacts" : "Single Invitation"}
          </h2>
          <button
            onClick={() => setShowBulkUpload(!showBulkUpload)}
            className={`flex items-center px-4 py-2 ${
              theme === 'dark' 
                ? 'bg-indigo-600 hover:bg-indigo-700' 
                : 'bg-purple-600 hover:bg-purple-700'
            } text-white rounded-md text-sm font-medium transition-colors`}
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
              <div className="w-full mb-4">
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Select Business
                </label>
                <BusinessProfileDropdown
                  onSelect={(business) => {
                    const businessId = business?.id || business?.locationId || business?.placeId || business?.place_id || business?.name || '';
                    const businessName = business?.title || business?.locationName || business?.name || '';
                    
                    setFormData(prev => ({
                      ...prev,
                      businessId,
                      businessName
                    }));
                  }}
                  className={`w-full ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                />
              </div>
              <div>
                <label
                  htmlFor="customerName"
                  className={`block text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
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
                    className={inputClasses}
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label
                  htmlFor="customerPhone"
                  className={`block text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
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
                    className={inputClasses}
                    required
                  />
                </div>
                <p className={`text-xs mt-1 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Include country code (e.g., +1 for US)
                </p>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSending || businesses.length === 0}
                className={buttonClasses}
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

      <div className={cardClasses}>
        <h2 className={`text-xl font-semibold mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          SMS Preview
        </h2>
      </div>
    </div>
  );
};

export default SMSComponent;
