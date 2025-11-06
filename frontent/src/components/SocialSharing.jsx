import React, { useState } from 'react';
import { FaCalendarAlt, FaClock, FaRedo, FaPaperPlane } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'sonner';
import { useGoogleBusiness } from './context/GoogleBusinessContext';

const SocialSharing = () => {
  const { selectedBusiness, tokenDetails } = useGoogleBusiness();

 

  const [formData, setFormData] = useState({
    postText: '',
    scheduleType: 'now', // 'now' or 'later'
    scheduleDate: '',
    scheduleTime: '',
    repeat: false,
    repeatType: 'daily', // 'daily', 'weekly', 'monthly'
    repeatDays: []
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'repeat') {
        setFormData(prev => ({
          ...prev,
          [name]: checked
        }));
      } else if (name.startsWith('day-')) {
        const day = name.split('-')[1];
        setFormData(prev => {
          const newDays = prev.repeatDays.includes(day)
            ? prev.repeatDays.filter(d => d !== day)
            : [...prev.repeatDays, day];
          return {
            ...prev,
            repeatDays: newDays
          };
        });
      }
    } else {
      setFormData(prev => {
        // If repeatType is being changed and it's not 'weekly', clear repeatDays
        if (name === 'repeatType' && value !== 'weekly') {
          return {
            ...prev,
            [name]: value,
            repeatDays: []
          };
        }
        return {
          ...prev,
          [name]: value
        };
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Get the authentication token and user data from localStorage
      const authData = JSON.parse(localStorage.getItem('auth')) || {};
      const token = authData.token || localStorage.getItem('token');
   console.log(authData?.user)
    
      
      if (!token ) {
        toast.error('Please log in to schedule posts');
        return;
      }
      
      if (!selectedBusiness) {
        toast.error('Please select a business location first');
        return;
      }
      
      // Extract account ID and location ID from selectedBusiness
      const accountId = selectedBusiness.accountId;
      const locationId = selectedBusiness.name.split('/')[1];
      
      // Prepare the data for the API
      const postData = {
        content: formData.postText,
        isScheduled: formData.scheduleType === 'later',
        scheduledFor: formData.scheduleType === 'later' && formData.scheduleDate && formData.scheduleTime
          ? `${formData.scheduleDate}T${formData.scheduleTime}:00.000Z`
          : null,
        isRecurring: formData.repeat,
        repeatType: formData.repeat ? formData.repeatType : null,
        repeatDays: formData.repeat && formData.repeatDays.length ? formData.repeatDays : null,
        accountId,
        locationId,
        createdBy: authData?.user?.id,  // Include the user ID in the request
        tokenDetails: tokenDetails ? {
          accessToken: tokenDetails.accessToken,
          refreshToken: tokenDetails.refreshToken,
          expiryDate: tokenDetails.expiryDate,
          scopes: tokenDetails.scopes
        } : null
      };
      console.log("postData",postData)
      
      // Make the API call
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE}/api/post/schedule`,
        postData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Show success message
      toast.success('Post scheduled successfully!');
      
      // Reset form
      setFormData({
        postText: '',
        scheduleType: 'now',
        scheduleDate: '',
        scheduleTime: '',
        repeat: false,
        repeatType: 'daily',
        repeatDays: []
      });
      
    } catch (error) {
      console.error('Error scheduling post:', error);
      const errorMessage = error.response?.data?.message || 'Failed to schedule post';
      toast.error(errorMessage);
    }
  };

 

  const daysOfWeek = [
    { value: 'monday', label: 'Mon' },
    { value: 'tuesday', label: 'Tue' },
    { value: 'wednesday', label: 'Wed' },
    { value: 'thursday', label: 'Thu' },
    { value: 'friday', label: 'Fri' },
    { value: 'saturday', label: 'Sat' },
    { value: 'sunday', label: 'Sun' }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Schedule Post</h1>
        <p className="text-gray-400">Create and schedule your social media posts</p>
      </div>
      
      <div className="bg-[#1a1b2e] rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          {/* Post Content */}
          <div className="mb-6">
            <label className="block text-white text-sm font-medium mb-2" htmlFor="postText">
              Post Content
            </label>
            <textarea
              id="postText"
              name="postText"
              value={formData.postText}
              onChange={handleChange}
              className="w-full bg-[#242538] border border-[#3a3b5a] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={5}
              placeholder="What's on your mind?"
              required
            />
          </div>

          {/* Schedule Options */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FaCalendarAlt className="mr-2" /> Schedule
            </h3>
            
            <div className="flex flex-col space-y-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="scheduleType"
                  value="now"
                  checked={formData.scheduleType === 'now'}
                  onChange={handleChange}
                  className="form-radio text-blue-500"
                />
                <span className="ml-2 text-white">Post Now</span>
              </label>
              
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="scheduleType"
                  value="later"
                  checked={formData.scheduleType === 'later'}
                  onChange={handleChange}
                  className="form-radio text-blue-500"
                />
                <span className="ml-2 text-white">Schedule for later</span>
              </label>
              
              {formData.scheduleType === 'later' && (
                <div className="flex flex-col sm:flex-row gap-4 mt-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        name="scheduleDate"
                        value={formData.scheduleDate}
                        onChange={handleChange}
                        className="w-full bg-[#242538] border border-[#3a3b5a] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required={formData.scheduleType === 'later'}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Time</label>
                    <div className="relative">
                      <input
                        type="time"
                        name="scheduleTime"
                        value={formData.scheduleTime}
                        onChange={handleChange}
                        className="w-full bg-[#242538] border border-[#3a3b5a] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required={formData.scheduleType === 'later'}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Repeat Options */}
          <div className="mb-6">
            <label className="flex items-center mb-4">
              <input
                type="checkbox"
                name="repeat"
                checked={formData.repeat}
                onChange={handleChange}
                className="rounded border-white/20"
              />
              <span className="ml-2 text-white font-medium">Repeat this post</span>
            </label>
            
            {formData.repeat && (
              <div className="ml-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Repeat every</label>
                  <select
                    name="repeatType"
                    value={formData.repeatType}
                    onChange={handleChange}
                    className="w-full sm:w-auto bg-[#242538] border border-[#3a3b5a] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Day</option>
                    <option value="weekly">Week</option>
                    <option value="monthly">Month</option>
                  </select>
                </div>
                
                {formData.repeatType === 'weekly' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">On days</label>
                    <div className="flex flex-wrap gap-2">
                      {daysOfWeek.map(day => (
                        <label key={day.value} className="inline-flex items-center">
                          <input
                            type="checkbox"
                            name={`day-${day.value}`}
                            checked={formData.repeatDays.includes(day.value)}
                            onChange={handleChange}
                            className="rounded border-white/20"
                          />
                          <span className="ml-1 text-white">{day.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

{/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-6 py-2.5 bg-blue-600 text-white font-medium text-sm leading-tight rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
            >
              <FaPaperPlane className="mr-2" />
              {formData.scheduleType === 'now' ? 'Post Now' : 'Schedule Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SocialSharing;
