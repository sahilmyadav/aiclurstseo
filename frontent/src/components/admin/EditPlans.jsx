import React, { useState, useEffect } from "react";
import axios from "axios";
import { Edit, Plus, Save, X, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_BASE 

const EditPlans = () => {
  const { token } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    pricePerProfile: 0,
    discountPercent: 0,
    isPopular: false,
    features: [""],
    buttonText: "Get Started",
    badgeText: "",
    isActive: true,
  });

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/admin/plans`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("okkkk",res)
      setPlans(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchPlans();
  }, [token]);

  const openModal = (plan) => {
    setCurrentPlan(plan);
    setFormData({ ...plan, features: [...plan.features] });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentPlan(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const addFeature = () => {
    setFormData((p) => ({ ...p, features: [...p.features, ""] }));
  };

  const removeFeature = (i) => {
    setFormData((p) => ({
      ...p,
      features: p.features.filter((_, idx) => idx !== i),
    }));
  };

  const updateFeature = (i, v) => {
    const arr = [...formData.features];
    arr[i] = v;
    setFormData({ ...formData, features: arr });
  };

  const savePlan = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `${API_URL}/api/admin/plans/${currentPlan._id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setPlans((p) =>
        p.map((pl) => (pl._id === currentPlan._id ? res.data : pl)),
      );
      closeModal();
    } catch (err) {
      console.error(err);
    }
  };

  const togglePlanStatus = async () => {
    try {
      const newStatus = !currentPlan.isActive;
      const response = await axios.patch(
        `${API_URL}/api/admin/plans/${currentPlan._id}/status`,
        { isActive: newStatus },
        { 
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          } 
        }
      );

      if (response.data) {
        // Update the plans list
        setPlans(plans.map(plan => 
          plan._id === currentPlan._id 
            ? { ...plan, isActive: newStatus } 
            : plan
        ));
        
        // Update the current plan in the modal
        setCurrentPlan({ ...currentPlan, isActive: newStatus });
        
        // Update the form data to reflect the new status
        setFormData(prev => ({ ...prev, isActive: newStatus }));
      }
    } catch (err) {
      console.error('Error toggling plan status:', err);
      // You might want to show an error toast/notification here
      alert('Failed to update plan status. Please try again.');
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-72 bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-3"></div>
          <span className="text-gray-400">Loading plans...</span>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-900 p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Subscription Plans</h1>
        <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          <Plus className="w-4 h-4 mr-2" /> Add Plan
        </button>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan._id}
            className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6 hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-white">{plan.name}</h2>
                {!plan.isActive && (
                  <span className="text-xs bg-red-900/30 text-red-400 border border-red-800 px-2 py-1 rounded-full mt-1 inline-block">
                    Inactive
                  </span>
                )}
              </div>

              <button 
                onClick={() => openModal(plan)}
                className="text-blue-400 hover:text-blue-300 transition-colors p-1 -mt-1 -mr-1"
                aria-label="Edit plan"
              >
                <Edit className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-300 mt-3">{plan.description}</p>

            <div className="mt-4">
              <div className="flex items-baseline">
                {plan.discountPercent > 0 && (
                  <span className="text-sm text-gray-400 line-through mr-2">
                    ${plan.pricePerProfile}
                  </span>
                )}
                <span className="text-2xl font-bold text-white">
                  ${(plan.pricePerProfile * (100 - (plan.discountPercent || 0)) / 100).toFixed(2)}
                </span>
                <span className="text-base font-normal text-gray-400 ml-1">/profile</span>
                {plan.discountPercent > 0 && (
                  <span className="ml-2 bg-blue-900/50 text-blue-300 text-xs font-medium px-2 py-0.5 rounded-full">
                    {plan.discountPercent}% OFF
                  </span>
                )}
              </div>
              {plan.discountPercent > 0 && (
                <p className="text-xs text-green-400 mt-1">
                  Save ${(plan.pricePerProfile * plan.discountPercent / 100).toFixed(2)} per profile
                </p>
              )}
            </div>

            {/* Features */}
            <ul className="mt-4 space-y-2">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span className="text-gray-300 text-sm">{f}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => openModal(plan)}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg transition-colors font-medium"
            >
              Edit Plan
            </button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-start p-2 z-50 overflow-y-auto">
          <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-4xl p-4 shadow-2xl my-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Edit Plan</h2>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-white transition-colors p-1 -mr-1"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form id="plan-form" onSubmit={savePlan} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Plan Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter plan name"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-1.5 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter plan description"
                  rows="2"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-1.5 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Price per Profile ($)</label>
                  <input
                    type="number"
                    name="pricePerProfile"
                    value={formData.pricePerProfile}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm h-9"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Discount (%)
                    {formData.discountPercent > 0 && (
                      <span className="ml-2 text-xs text-green-400">
                        Save: ${(formData.pricePerProfile * formData.discountPercent / 100).toFixed(2)} per profile
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="discountPercent"
                      value={formData.discountPercent}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8 text-sm h-9"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                  </div>
                </div>

                <div className="flex items-end">
                  <div className="flex items-center h-8 bg-gray-700 border border-gray-600 rounded-lg px-3 w-full">
                    <input
                      type="checkbox"
                      id="isPopular"
                      name="isPopular"
                      checked={formData.isPopular}
                      onChange={handleChange}
                      className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500 bg-gray-700 border-gray-500"
                    />
                    <label htmlFor="isPopular" className="ml-2 text-xs font-medium text-gray-300">
                      Mark as Popular
                    </label>
                  </div>
                </div>
              </div>

              {/* FEATURES */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-300">Features</label>
                  <button
                    type="button"
                    onClick={addFeature}
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Feature
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.features.map((f, i) => (
                    <div key={i} className="flex items-center space-x-3 group">
                      <div className="flex-1 relative">
                        <input
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8 text-sm"
                          value={f}
                          onChange={(e) => updateFeature(i, e.target.value)}
                          placeholder={`Feature ${i + 1}`}
                        />
                        {formData.features.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFeature(i)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                            aria-label="Remove feature"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <button
                  type="button"
                  onClick={togglePlanStatus}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    currentPlan?.isActive
                      ? "bg-red-900/30 hover:bg-red-900/40 text-red-400 border border-red-800/50"
                      : "bg-green-900/30 hover:bg-green-900/40 text-green-400 border border-green-800/50"
                  }`}
                >
                  {currentPlan?.isActive ? "Deactivate Plan" : "Activate Plan"}
                </button>

              </div>
            </form>
            <div className="p-4 border-t border-gray-700 bg-gray-800/80 mt-4">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  type="button"
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="plan-form"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium flex items-center transition-colors"
                >
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditPlans;
