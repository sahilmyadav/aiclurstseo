import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "./context/AuthContext";

const Modal = ({ isOpen, onClose, title, children, onSave }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-[#181828] p-8 rounded-xl w-[400px] shadow-[0_0_25px_rgba(168,85,247,0.8)] border border-purple-500 relative transition-all duration-300">
        <h3 className="text-2xl font-semibold mb-6 text-center text-purple-400 drop-shadow-lg">
          {title}
        </h3>
        {children}
        <div className="flex justify-center mt-6 gap-3">
          <button
            onClick={onSave}
            className="bg-purple-600 hover:bg-purple-700 transition duration-200 px-6 py-2 rounded shadow-[0_0_15px_rgba(168,85,247,0.7)]"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-800 transition duration-200 px-6 py-2 rounded"
          >
            Cancel
          </button>
        </div>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

const SettingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    country: "",
    city: "",
    postal: "",
    taxId: "",
    role: "",
    avatar: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentField, setCurrentField] = useState(null);

  // Check authentication
  useEffect(() => {
    if (!user) {
      // Silently redirect without error toast
      navigate('/login');
    }
  }, [user, navigate]);

  // Load user data from AuthContext
  useEffect(() => {
    if (!user) return;

    // Directly use AuthContext data
    setFormData({
      name: user.displayName || user.name || '',
      email: user.email || '',
      phone: user.phoneNumber || '',
      bio: '',
      country: '',
      city: '',
      postal: '',
      taxId: '',
      role: 'user',
      avatar: user.photoURL || '',
    });
    
    setIsLoading(false);
  }, [user]);

  const handleEdit = (field) => {
    setCurrentField(field);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!currentField) return;
    
    // Update local state only
    toast.success(`${currentField} updated successfully`);
    setIsModalOpen(false);
    
    // Note: Changes are only stored locally
    // To persist changes, integrate with backend API
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#2a2440] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2a2440] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto mt-12">
        <h2 className="text-3xl font-bold mb-8">Account Settings</h2>

        <section className="bg-[#181828] p-6 rounded-lg mb-10 hover:shadow-xl hover:shadow-purple-900 transition duration-300 relative">
          <h3 className="text-xl font-semibold mb-4">My Profile</h3>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg overflow-hidden">
              {formData.avatar ? (
                <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold">
                  {formData.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div>
              <p className="text-lg font-medium">{formData.name || 'User'}</p>
              <span className="text-sm text-gray-400 capitalize">{formData.role || 'Member'}</span>
              <p className="text-xs text-gray-500 mt-1">{formData.email}</p>
            </div>
          </div>
          <button
            onClick={() => handleEdit("name")}
            className="absolute top-6 right-6 text-xs bg-[#3b3b5c] px-3 py-1 rounded hover:bg-[#50507a] transition duration-200"
          >
            Edit ✎
          </button>
        </section>

        <h3 className="text-xl font-semibold mb-6">Personal Information</h3>
        <section className="bg-[#181828] p-6 rounded-lg mb-10 hover:shadow-xl hover:shadow-purple-900 transition duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {["name", "email", "phone", "bio"].map((field) => (
              <div key={field} className="flex flex-col">
                <label className="text-sm text-gray-300 mb-1 capitalize">
                  {field.replace(/([A-Z])/g, " $1")}
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-100">{formData[field] || `No ${field}`}</span>
                  {field !== 'email' && (
                    <button
                      onClick={() => handleEdit(field)}
                      className="text-xs text-gray-400 hover:text-white"
                    >
                      ✎
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <h3 className="text-xl font-semibold mb-6">Address</h3>
        <section className="bg-[#181828] p-6 rounded-lg hover:shadow-xl hover:shadow-purple-900 transition duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {["country", "city", "postal", "taxId"].map((field) => (
              <div key={field} className="flex flex-col">
                <label className="text-sm text-gray-300 mb-1 capitalize">
                  {field.replace(/([A-Z])/g, " $1")}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData[field]}
                    readOnly
                    className="bg-[#2a2a40] text-white rounded px-4 py-2 w-full pr-16"
                  />
                  <button
                    onClick={() => handleEdit(field)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-[#3b3b5c] px-3 py-1 rounded hover:bg-[#50507a] transition duration-200"
                  >
                    Edit ✎
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Update ${currentField?.replace(/([A-Z])/g, " $1")}`}
        onSave={handleSave}
      >
        {currentField && (
          <input
            type="text"
            value={formData[currentField]}
            onChange={(e) =>
              setFormData({ ...formData, [currentField]: e.target.value })
            }
            className="bg-[#2a2a40] text-white rounded px-4 py-2 outline-none w-full"
            placeholder={`Enter ${currentField}`}
          />
        )}
      </Modal>
    </div>
  );
};

export default SettingsPage;
