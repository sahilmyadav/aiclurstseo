import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  FaUpload,
  FaFileCsv,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { useAuth } from "./context/AuthContext";
import { useGoogleBusiness } from "./context/GoogleBusinessContext";
import PropTypes from "prop-types";

const BulkUploadEmailComponent = ({ onUploadComplete }) => {
  const { token } = useAuth();
  const { businesses, loading: businessesLoading } = useGoogleBusiness();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [uploadResult, setUploadResult] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const BACKEND_URL =
    import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
    "http://localhost:8000";

  useEffect(() => {
    if (businesses && businesses.length > 0 && !selectedBusinessId) {
      setSelectedBusinessId(businesses[0].id);
    }
  }, [businesses, selectedBusinessId]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset previous state
    setSelectedFile(null);
    setUploadResult(null);
    setValidationErrors([]);

    // Validate file type
    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (!validTypes.some((type) => file.type.includes(type.split("/")[1]))) {
      toast.error("Please upload a valid CSV or Excel file");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("File size should be less than 5MB");
      return;
    }

    setSelectedFile(file);
  };

  const validateFileContent = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const lines = content.split("\n");
        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

        const requiredFields = ["email"];

        const missingFields = requiredFields.filter(
          (field) => !headers.includes(field)
        );

        if (missingFields.length > 0) {
          resolve({
            isValid: false,
            error: `Missing required fields: ${missingFields.join(", ")}`,
          });
          return;
        }

        // Check first 5 rows for data validation
        const errors = [];
        const dataRows = lines.slice(1, 6);

        dataRows.forEach((row, index) => {
          if (!row.trim()) return;

          const values = row.split(",").map((v) => v.trim());
          const rowData = {};
          headers.forEach((header, i) => {
            rowData[header] = values[i] || "";
          });

          if (rowData.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(rowData.email)) {
              errors.push(
                `Row ${index + 2}: Invalid email format (${rowData.email})`
              );
            }
          }
        });

        resolve({
          isValid: errors.length === 0,
          errors: errors.length > 0 ? errors : null,
        });
      };
      reader.readAsText(file);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    if (!selectedBusinessId) {
      toast.error("Please select a business");
      return;
    }

    // Validate file content
    const validation = await validateFileContent(selectedFile);
    if (!validation.isValid) {
      if (validation.errors) {
        setValidationErrors(validation.errors);
      }
      toast.error(validation.error || "Invalid file content");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append(
      "businessName",
      businesses.find((b) => b.id === selectedBusinessId)?.title ||
        "Selected Business"
    );

    setIsUploading(true);
    setValidationErrors([]);

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/invitations/email/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to process bulk upload");
      }

      setUploadResult(result);
      toast.success(
        `Successfully sent ${result.successCount} email invitation(s)`
      );

      if (onUploadComplete) {
        onUploadComplete(result);
      }

      if (result.failedCount > 0) {
        toast.warning(`${result.failedCount} invitations failed to send`);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error(error.message || "Failed to upload file");

      if (error.errors) {
        setValidationErrors(error.errors);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = [
      "name,email",
      "John Doe,john@example.com",
      "Jane Smith,jane@example.com",
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "email-template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (businessesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!businesses || businesses.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-800 rounded-lg border border-gray-700">
        <p className="text-gray-300 mb-4">No Google Business accounts found.</p>
        <button
          onClick={() => window.open("/dashboard/integrations", "_blank")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
        >
          Connect Google Business
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow mb-4 border border-gray-700">
      <h3 className="text-lg font-medium text-white mb-4">
        Bulk Upload Email Contacts
      </h3>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="business-select"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Select Business
          </label>
          <select
            id="business-select"
            value={selectedBusinessId}
            onChange={(e) => setSelectedBusinessId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isUploading || businesses.length === 0}
          >
            <option value="">Select a business</option>
            {businesses.map((business) => (
              <option key={business.id} value={business.id}>
                {business.title || business.locationName || "Business"}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md bg-gray-900">
          <div className="space-y-1 text-center">
            <FaFileCsv className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-400 justify-center">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-gray-900 rounded-md font-medium text-indigo-400 hover:text-indigo-300 focus-within:outline-none"
              >
                <span>Upload a file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">
              {selectedFile
                ? `Selected: ${selectedFile.name}`
                : "CSV up to 5MB with columns: name,email"}
            </p>
            <p
              className="text-xs text-indigo-400 cursor-pointer hover:text-indigo-300 mt-2"
              onClick={handleDownloadTemplate}
            >
              Download template
            </p>
          </div>
        </div>

        {validationErrors.length > 0 && (
          <div className="mt-4 p-4 bg-red-900/20 border border-red-700 rounded-md">
            <p className="text-sm font-semibold text-red-400 mb-2">
              Validation Errors:
            </p>
            <ul className="text-xs text-red-300 space-y-1">
              {validationErrors.map((error, idx) => (
                <li key={idx}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {uploadResult && (
          <div className="mt-4 p-4 bg-green-900/20 border border-green-700 rounded-md">
            <div className="flex items-center">
              <FaCheckCircle className="h-5 w-5 text-green-400 mr-2" />
              <p className="text-sm text-green-300">
                Successfully sent {uploadResult.successCount} out of{" "}
                {uploadResult.totalCount} email invitations.
                {uploadResult.failedCount > 0 &&
                  ` ${uploadResult.failedCount} failed.`}
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={isUploading}
          >
            Download Template
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || !selectedBusinessId || isUploading}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              !selectedFile || !selectedBusinessId || isUploading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            {isUploading ? (
              <>
                <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Processing...
              </>
            ) : (
              <>
                <FaUpload className="-ml-1 mr-2 h-4 w-4" />
                Upload & Send Emails
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

BulkUploadEmailComponent.propTypes = {
  onUploadComplete: PropTypes.func,
};

export default BulkUploadEmailComponent;
