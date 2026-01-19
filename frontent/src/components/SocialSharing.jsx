import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaCalendarAlt, FaPaperPlane, FaRobot, FaTimes } from 'react-icons/fa';
import { toast } from 'sonner';
import { getApiBaseUrl } from '../config/api';
import { useTheme } from '../context/ThemeContext';
import { generateAIPost } from '../utils/suggestion';
import { useGoogleBusiness } from './context/GoogleBusinessContext';

const SocialSharing = () => {
  const { selectedBusiness, tokenDetails, googleOAuth } = useGoogleBusiness();
  const { theme } = useTheme();

  // Function to get auto keywords from selected business
  const getAutoKeywords = () => {
    const autoKeywords = [];

    // Add business name as a keyword
    if (selectedBusiness && selectedBusiness.title) {
      let businessName = '';
      if (typeof selectedBusiness.title === 'string') {
        businessName = selectedBusiness.title;
      } else if (typeof selectedBusiness.title === 'object') {
        businessName = selectedBusiness.title.name || selectedBusiness.title.displayName || '';
      }
      if (businessName) {
        autoKeywords.push(businessName);
      }
    }

    // Add category as a keyword
    if (
      selectedBusiness &&
      selectedBusiness.categories &&
      selectedBusiness.categories.primaryCategory
    ) {
      const category = selectedBusiness.categories.primaryCategory;
      let categoryName = '';
      if (typeof category === 'string') {
        categoryName = category;
      } else if (typeof category === 'object') {
        categoryName = category.displayName || category.name || '';
        // Handle nested objects
        if (typeof categoryName === 'object' && categoryName !== null) {
          categoryName = categoryName.name || categoryName.displayName || '';
        }
      }
      if (categoryName) {
        autoKeywords.push(categoryName);
      }
    }

    return autoKeywords;
  };

  const [formData, setFormData] = useState({
    postText: '',
    keywords: '',
    keywordsArray: [],
    scheduleType: 'later', // 'now' or 'later'
    scheduleDate: '',
    scheduleTime: '',
    repeat: false,
    repeatType: 'daily', // 'daily', 'weekly', 'monthly'
    repeatDays: [],
  });

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Effect to automatically add business name and category as keywords when business changes
  useEffect(() => {
    if (selectedBusiness) {
      const autoKeywords = getAutoKeywords();
      setFormData((prev) => ({
        ...prev,
        keywordsArray: [...autoKeywords],
      }));
    }
  }, [selectedBusiness]);

  const handleKeywordChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      keywords: value,
    }));
  };

  const handleKeywordKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const keyword = formData.keywords.trim();
      if (keyword && !formData.keywordsArray.includes(keyword)) {
        setFormData((prev) => ({
          ...prev,
          keywordsArray: [...prev.keywordsArray, keyword],
          keywords: '',
        }));
      }
    }
  };

  const removeKeyword = (keywordToRemove) => {
    // Prevent removal of auto keywords (business name and category)
    const autoKeywords = getAutoKeywords();
    if (autoKeywords.includes(keywordToRemove)) {
      toast.error('Cannot remove auto-generated keywords');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      keywordsArray: prev.keywordsArray.filter((keyword) => keyword !== keywordToRemove),
    }));
  };

  const generateAIPostContent = async () => {
    if (!selectedBusiness) {
      toast.error('Please select a business location first');
      return;
    }

    if (formData.keywordsArray.length === 0) {
      toast.error('At least one keyword is required for AI generation');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const postType = formData.scheduleType === 'later' ? 'promotional' : 'engagement';
      const aiContent = await generateAIPost(selectedBusiness, formData.keywordsArray, postType);

      setFormData((prev) => ({
        ...prev,
        postText: aiContent,
      }));

      toast.success('AI post generated successfully!');
    } catch (error) {
      console.error('Error generating AI post:', error);
      toast.error('Failed to generate AI post. Please try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      if (name === 'repeat') {
        setFormData((prev) => ({
          ...prev,
          [name]: checked,
        }));
      } else if (name.startsWith('day-')) {
        const day = name.split('-')[1];
        setFormData((prev) => {
          const newDays = prev.repeatDays.includes(day)
            ? prev.repeatDays.filter((d) => d !== day)
            : [...prev.repeatDays, day];
          return {
            ...prev,
            repeatDays: newDays,
          };
        });
      }
    } else {
      setFormData((prev) => {
        // If repeatType is being changed and it's not 'weekly', clear repeatDays
        if (name === 'repeatType' && value !== 'weekly') {
          return {
            ...prev,
            [name]: value,
            repeatDays: [],
          };
        }
        return {
          ...prev,
          [name]: value,
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
      console.log(authData?.user);

      if (!token) {
        toast.error('Please log in to schedule posts');
        return;
      }

      if (!selectedBusiness) {
        toast.error('Please select a business location first');
        return;
      }

      // Check if we have at least one keyword (either user-added or auto-generated)
      if (formData.keywordsArray.length === 0) {
        toast.error('At least one keyword is required for scheduling a post');
        return;
      }

      // Allow empty content if keywords are provided (AI will generate)
      if (!formData.postText.trim() && formData.keywordsArray.length === 0) {
        toast.error('Please either enter post content or add keywords for AI generation');
        return;
      }

      // Extract account ID and location ID from selectedBusiness
      const accountId = selectedBusiness.accountId;
      const locationId = selectedBusiness.name.split('/')[1];

      // Get business name from selectedBusiness
      const businessName =
        selectedBusiness?.title ||
        selectedBusiness?.locationName ||
        selectedBusiness?.name?.split('/').pop() ||
        'Business';

      // Prepare the data for the API
      const postData = {
        content: formData.postText,
        keywords: formData.keywordsArray,
        isScheduled: formData.scheduleType === 'later',
        scheduledFor:
          formData.scheduleType === 'later'
            ? `${formData.scheduleDate}T${formData.scheduleTime}:00`
            : null,
        isRecurring: formData.repeat,
        repeatType: formData.repeat ? formData.repeatType : null,
        repeatDays: formData.repeatType === 'weekly' ? formData.repeatDays : [],
        accountId,
        locationId,
        businessName,
        createdBy: '673a8778588c0847f3a6d3c4',
        tokenDetails: {
          // Use googleOAuth values first, fall back to tokenDetails
          accessToken: googleOAuth?.access_token || tokenDetails?.accessToken,
          refreshToken: googleOAuth?.refresh_token || tokenDetails?.refreshToken,
          expiryDate: googleOAuth?.expiry_date
            ? new Date(googleOAuth.expiry_date)
            : tokenDetails?.expiryDate
              ? new Date(tokenDetails.expiryDate)
              : null,
        },
        businessData: selectedBusiness,
      };
      console.log('postData', postData);

      // Make the API call
      const response = await axios.post(`${getApiBaseUrl()}/api/post/schedule`, postData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      // Show success message
      toast.success('Post scheduled successfully!');

      // Reset form but keep auto keywords
      const autoKeywords = getAutoKeywords();
      setFormData({
        postText: '',
        keywords: '',
        keywordsArray: [...autoKeywords],
        scheduleType: 'now',
        scheduleDate: '',
        scheduleTime: '',
        repeat: false,
        repeatType: 'daily',
        repeatDays: [],
      });
      setIsGeneratingAI(false);
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
    { value: 'sunday', label: 'Sun' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1
          className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}
        >
          Schedule Post
        </h1>
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
          Create and schedule your social media posts
        </p>
      </div>

      <div className="bg-[#1a1b2e] rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          {/* Post Content */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-white text-sm font-medium" htmlFor="postText">
                Post Content
              </label>
              <button
                type="button"
                onClick={generateAIPostContent}
                disabled={isGeneratingAI || formData.keywordsArray.length === 0}
                className="inline-flex items-center px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
              >
                <FaRobot className="mr-2" />
                {isGeneratingAI ? 'Generating...' : 'Generate with AI'}
              </button>
            </div>
            <textarea
              id="postText"
              name="postText"
              value={formData.postText}
              onChange={handleChange}
              className="w-full bg-[#242538] border border-[#3a3b5a] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={5}
              placeholder="What's on your mind? (Optional - add keywords below and AI will generate content for you!)"
            />
          </div>

          {/* Keywords */}
          <div className="mb-6">
            <label className="block text-white text-sm font-medium mb-2" htmlFor="keywords">
              Keywords
            </label>

            {/* Keywords Tags Display */}
            {formData.keywordsArray.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.keywordsArray.map((keyword, index) => {
                  // Check if this is an auto keyword
                  const autoKeywords = getAutoKeywords();
                  const isAutoKeyword = autoKeywords.includes(keyword);

                  return (
                    <span
                      key={index}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                        isAutoKeyword ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'
                      }`}
                    >
                      {keyword}
                      {!isAutoKeyword && (
                        <button
                          type="button"
                          onClick={() => removeKeyword(keyword)}
                          className="ml-2 text-white hover:text-gray-200 focus:outline-none"
                        >
                          <FaTimes className="w-3 h-3" />
                        </button>
                      )}
                      {isAutoKeyword && <span className="ml-2 text-xs opacity-75">(auto)</span>}
                    </span>
                  );
                })}
              </div>
            )}

            <input
              type="text"
              id="keywords"
              name="keywords"
              value={formData.keywords}
              onChange={handleKeywordChange}
              onKeyPress={handleKeywordKeyPress}
              className="w-full bg-[#242538] border border-[#3a3b5a] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type keywords and press Enter or comma to add"
            />
            <p className="text-gray-400 text-sm mt-1">
              Press Enter or comma to add keywords. AI will generate content based on these keywords
              if post content is empty. Purple tags are auto-generated from your business name and
              category. Click × to remove user-added keywords.
            </p>
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Repeat every
                  </label>
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
                      {daysOfWeek.map((day) => (
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
