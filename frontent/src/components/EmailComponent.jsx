import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { FaPaperPlane, FaSpinner, FaUser, FaUpload } from "react-icons/fa";
import { useAuth } from "./context/AuthContext";
import { useGoogleBusiness } from "./context/GoogleBusinessContext";
import BulkUploadEmailComponent from "./BulkUploadEmailComponent";

const EmailComponent = () => {
  const { token } = useAuth();
  const { businesses = [], loading: businessesLoading } = useGoogleBusiness();

  const [form, setForm] = useState({
    businessId: "",
    businessName: "",
    customerName: "",
    customerEmail: "",
  });
  const [isSending, setIsSending] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const BACKEND_URL =
    import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
    "http://localhost:8000";

  const FRONTEND_URL =
    import.meta.env.VITE_FRONTEND_URL ||
    import.meta.env.VITE_APP_URL ||
    "http://localhost:5173";

  useEffect(() => {
    if (businesses && businesses.length > 0) {
      const b = businesses[0];
      const bid =
        b?.id ?? b?.locationId ?? b?.placeId ?? b?.place_id ?? b?.name ?? "";
      setForm((f) => ({
        ...f,
        businessId: bid,
        businessName: b.title || b.locationName || b.name || "",
      }));
    }
  }, [businesses]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(form);

    if (
      !form.businessId ||
      !form.customerName.trim() ||
      !form.customerEmail.trim()
    ) {
      toast.error("Please select a business and enter customer name & email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.customerEmail.trim())) {
      toast.error("Enter a valid email");
      return;
    }

    setIsSending(true);
    try {
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
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Business
                </label>
                <select
                  name="businessId"
                  value={form.businessId}
                  onChange={(e) => {
                    const id = e.target.value;
                    const sel =
                      businesses.find((b) => {
                        const bid =
                          b?.id ??
                          b?.locationId ??
                          b?.placeId ??
                          b?.place_id ??
                          b?.name;
                        return String(bid) === String(id);
                      }) || businesses[0];
                    const selId = sel
                      ? sel?.id ??
                        sel?.locationId ??
                        sel?.placeId ??
                        sel?.place_id ??
                        sel?.name
                      : id;
                    setForm((f) => ({
                      ...f,
                      businessId: selId,
                      businessName: sel
                        ? sel.title || sel.locationName || sel.name
                        : "",
                    }));
                  }}
                  className="w-full px-3 py-2 rounded bg-gray-800 text-white"
                  required
                >
                  {businesses.map((b, idx) => {
                    const bid =
                      b?.id ??
                      b?.locationId ??
                      b?.placeId ??
                      b?.place_id ??
                      b?.name ??
                      String(idx);
                    const label = b.title || b.locationName || b.name || bid;
                    return (
                      <option key={bid} value={bid}>
                        {label}
                      </option>
                    );
                  })}
                </select>
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

      {/* Email Preview */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 mt-6">
        <h3 className="text-md font-semibold mb-3">Email Preview</h3>
        <div className="bg-gray-900 p-4 rounded border border-gray-700">
          <p className="text-gray-300 mb-3">
            Hi {form.customerName || "there"}, we'd love your feedback! Please
            take a moment to leave us a review for{" "}
            <strong>{form.businessName || "our business"}</strong>.
          </p>
          <p className="mb-4">
            <a
              href={`${FRONTEND_URL}/business/${encodeURIComponent(
                form.businessName || ""
              )}`}
              className="inline-block px-4 py-2 bg-indigo-600 text-white rounded"
            >
              Leave a review
            </a>
          </p>
          <p className="text-sm text-gray-400">
            Sent from: {form.businessName || "Our Business"}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Best regards,
            <br />
            Our Team
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailComponent;
