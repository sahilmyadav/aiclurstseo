import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { FaUpload, FaFileCsv, FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useAuth } from "./context/AuthContext";
import PropTypes from 'prop-types';

const BulkUploadComponent = ({ type = 'email', onUploadComplete }) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [uploadResult, setUploadResult] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const BACKEND_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || "http://localhost:8000";

  useEffect(() => {
    const fetchBusinesses = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const token = await user.getIdToken();
        const response = await fetch(`${BACKEND_URL}/api/businesses/my-businesses`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch businesses');
        
        const data = await response.json();
        setBusinesses(data);
        if (data.length > 0) {
          setSelectedBusinessId(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching businesses:', error);
        toast.error(error.message || 'Failed to load business information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinesses();
  }, [user, BACKEND_URL]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset previous state
    setSelectedFile(null);
    setUploadResult(null);
    setValidationErrors([]);

    // Validate file type
    const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!validTypes.some(type => file.type.includes(type.split('/')[1]))) {
      toast.error('Please upload a valid CSV or Excel file');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('File size should be less than 5MB');
      return;
    }

    setSelectedFile(file);
  };

  const validateFileContent = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const lines = content.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const requiredFields = type === 'email' 
          ? ['email'] 
          : ['phone'];
        
        const missingFields = requiredFields.filter(field => 
          !headers.includes(field)
        );

        if (missingFields.length > 0) {
          resolve({
            isValid: false,
            error: `Missing required fields: ${missingFields.join(', ')}`
          });
          return;
        }

        // Check first 5 rows for data validation
        const errors = [];
        const dataRows = lines.slice(1, 6); // Check first 5 rows
        
        dataRows.forEach((row, index) => {
          if (!row.trim()) return;
          
          const values = row.split(',').map(v => v.trim());
          const rowData = {};
          headers.forEach((header, i) => {
            rowData[header] = values[i] || '';
          });

          if (type === 'email' && rowData.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(rowData.email)) {
              errors.push(`Row ${index + 2}: Invalid email format (${rowData.email})`);
            }
          } else if (type === 'sms' && rowData.phone) {
            const phoneRegex = /^\+?[1-9]\d{9,14}$/;
            const phoneNumber = rowData.phone.replace(/[^\d+]/g, '');
            if (!phoneRegex.test(phoneNumber)) {
              errors.push(`Row ${index + 2}: Invalid phone number (${rowData.phone})`);
            }
          }
        });

        resolve({
          isValid: errors.length === 0,
          errors: errors.length > 0 ? errors : null
        });
      };
      reader.readAsText(file);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    if (!selectedBusinessId) {
      toast.error('Please select a business');
      return;
    }

    // Validate file content
    const validation = await validateFileContent(selectedFile);
    if (!validation.isValid) {
      if (validation.errors) {
        setValidationErrors(validation.errors);
      }
      toast.error(validation.error || 'Invalid file content');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('businessId', selectedBusinessId);
    formData.append('type', type);

    setIsUploading(true);
    setValidationErrors([]);

    try {
      const token = await user.getIdToken();
      
      const response = await fetch(`${BACKEND_URL}/api/invitations/bulk-upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to process bulk upload');
      }

      setUploadResult(result);
      toast.success(`Successfully processed ${result.successful} out of ${result.total} invitations`);
      
      if (onUploadComplete) {
        onUploadComplete(result);
      }
      
      if (result.failed > 0) {
        toast.warning(`${result.failed} invitations failed to send`);
      }

      if (typeof onUploadComplete === 'function') {
        onUploadComplete(result);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(error.message || 'Failed to upload file');
      
      if (error.errors) {
        setValidationErrors(error.errors);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = type === 'email' 
      ? ['name,email'] 
      : ['name,phone'];
    
    const exampleData = type === 'email'
      ? ['John Doe,john@example.com', 'Jane Smith,jane@example.com']
      : ['John Doe,+1234567890', 'Jane Smith,+1987654321'];
    
    const csvContent = [
      headers.join(','),
      ...exampleData
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${type}-template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Bulk Upload Contacts</h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="business-select" className="block text-sm font-medium text-gray-700 mb-1">
            Select Business
          </label>
          <select
            id="business-select"
            value={selectedBusinessId}
            onChange={(e) => setSelectedBusinessId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isUploading}
          >
            {businesses.map((business) => (
              <option key={business.id} value={business.id}>
                {business.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <FaFileCsv className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600 justify-center">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
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
                : "CSV up to 10MB with columns: customerName,customerEmail"}
            </p>
          </div>
        </div>

        {uploadResult && (
          <div className="mt-4 p-4 bg-green-50 rounded-md">
            <div className="flex items-center">
              <FaCheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-sm text-green-700">
                Processed {uploadResult.successful} out of {uploadResult.total} invitations successfully.
                {uploadResult.failed > 0 && ` ${uploadResult.failed} failed.`}
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              !selectedFile || isUploading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
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
                Upload & Send Invitations
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

BulkUploadComponent.propTypes = {
  type: PropTypes.oneOf(['email', 'sms']),
  onUploadComplete: PropTypes.func
};

export default BulkUploadComponent;