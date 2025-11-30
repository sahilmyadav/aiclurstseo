import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { FaPaperPlane, FaSpinner, FaUser, FaUpload } from "react-icons/fa";
import { useAuth } from "./context/AuthContext";
import { useGoogleBusiness } from "./context/GoogleBusinessContext";
import BusinessProfileDropdown from "./common/BusinessProfileDropdown";

const EmailComponent = () => {
  const { token } = useAuth();
  const { 
    businesses = [], 
    selectedBusiness, 
    loading: businessesLoading, 
    selectBusiness 
  } = useGoogleBusiness();
  
  const [form, setForm] = useState({
    businessId: "",
    businessName: "",
    customerName: "",
    customerEmail: "",
    content: "We would love to hear your feedback about your recent experience with us. Your opinion is valuable to us and helps us improve our services."
  });
  
  const [isSending, setIsSending] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const BACKEND_URL = import.meta.env.VITE_API_BASE?.replace(/\/$/, "") || "http://localhost:8000";
  const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || import.meta.env.VITE_APP_URL || "http://localhost:5173";

  // Update form when selectedBusiness changes
  useEffect(() => {
    if (selectedBusiness) {
      const businessId = selectedBusiness?.id || 
                        selectedBusiness?.locationId || 
                        selectedBusiness?.placeId || 
                        selectedBusiness?.place_id || 
                        selectedBusiness?.name || '';
      
      const businessName = selectedBusiness?.title || 
                          selectedBusiness?.locationName || 
                          selectedBusiness?.name || '';
      
      setForm(f => ({
        ...f,
        businessId,
        businessName
      }));
    } else if (businesses?.length > 0) {
      // If no business is selected but businesses are available, select the first one
      selectBusiness(businesses[0]);
    }
  }, [selectedBusiness, businesses, selectBusiness]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedBusiness || !form.customerName.trim() || !form.customerEmail.trim()) {
      toast.error("Please select a business and enter customer name & email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.customerEmail.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSending(true);
    try {
      // Generate the same link format as in QRCodeComponent
      const locationId = selectedBusiness.name?.split('/').pop() || '';
      const businessName = selectedBusiness.metadata?.newReviewUri || selectedBusiness.title || '';
      const reviewLink = `${FRONTEND_URL}/review/${locationId}?name=${encodeURIComponent(businessName)}`;

      const res = await fetch(`${BACKEND_URL}/api/invitations/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          businessName: form.businessName,
          customerName: form.customerName.trim(),
          customerEmail: form.customerEmail.toLowerCase().trim(),
          content: form.content,
          reviewLink: reviewLink  // Send the generated review link
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(
          data?.error || data?.message || "Failed to send invitation"
        );

      toast.success("Invitation sent");
      setForm((f) => ({ ...f, customerName: "", customerEmail: "" }));
    } catch (err) {
      console.error("Send invitation error:", err);
      toast.error(err.message || "Failed to send invitation");
    } finally {
      setIsSending(false);
    }
  };

  if (businessesLoading)
    return (
      <div className="flex items-center justify-center h-40">
        <FaSpinner className="animate-spin text-2xl text-purple-500" />
      </div>
    );

  if (!businesses || businesses.length === 0)
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">
          No businesses available. Connect a Google Business account.
        </p>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 text-white rounded min-h-screen">
      <h2 className="text-lg font-semibold mb-3">Send Email Invitation</h2>
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">
            {showBulkUpload ? "Bulk Upload Email Contacts" : "Single Invitation"}
          </h3>
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
          <BulkUploadEmailComponent />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="w-full">
                <label className="block text-sm text-gray-300 mb-1">
                  Business
                </label>
                <BusinessProfileDropdown
                  onSelect={selectBusiness}
                  className="w-full"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-300 mb-1">
                  Customer Name
                </label>
                <input
                  name="customerName"
                  value={form.customerName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded bg-gray-800 text-white"
                  placeholder="John Doe"
                  required
                />

                <label className="block text-sm text-gray-300 mb-1 mt-4">
                  Customer Email
                </label>
                <input
                  name="customerEmail"
                  type="email"
                  value={form.customerEmail}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded bg-gray-800 text-white"
                  placeholder="customer@example.com"
                  required
                />

                <div className="mt-4">
                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md"
                  >
                    {isSending ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
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
              </div>
            </div>
          </form>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Email Content
        </label>
        <textarea
          name="content"
          value={form.content}
          onChange={handleChange}
          rows={6}
          className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Enter your email content here..."
        />
        <p className="mt-1 text-xs text-gray-400">
          You can use plain text or basic HTML for formatting
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">Email Preview</h3>
        <div className="bg-white p-6 rounded-lg">
          <div className="bg-indigo-600 text-white p-4 rounded-t-lg">
            <h2 className="text-xl font-bold text-center">Share Your Experience</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-800 mb-4">Hi {form.customerName || "there"},</p>
            <div className="text-gray-700 mb-6" style={{ whiteSpace: 'pre-line' }}>
              {form.content || "We'd love to hear your feedback about your recent experience with us."}
            </div>
            
            <div className="text-center my-8">
              <a
                href={`${FRONTEND_URL}/business/${encodeURIComponent(form.businessName || "")}`}
                className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Leave a Review
              </a>
            </div>
            
            <div className="mt-8 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Thank you for your time and support!
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Best regards,<br />
                <span className="font-medium">{form.businessName || "Our Team"}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailComponent;
