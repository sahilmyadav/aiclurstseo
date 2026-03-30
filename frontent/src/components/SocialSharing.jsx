import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaRedo, FaPaperPlane, FaTimes, FaRobot, FaPhone, FaShoppingCart, FaBook, FaInfoCircle, FaUserPlus } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'sonner';
import { useGoogleBusiness } from './context/GoogleBusinessContext';
import { generateAIPost } from '../utils/suggestion';
import { useTheme } from '../context/ThemeContext';
import BusinessProfileDropdown from './common/BusinessProfileDropdown';
import MyScheduledPosts from './MyScheduledPosts';

const SocialSharing = () => {
  const { 
    selectedBusiness, 
    tokenDetails, 
    googleOAuth, 
    businesses, 
    selectBusiness, 
    selectMultipleBusinesses, 
    isConnected 
  } = useGoogleBusiness();
  const { theme } = useTheme();

  const handleBusinessSelect = (businessOrBusinesses) => {
    if (Array.isArray(businessOrBusinesses)) {
      selectMultipleBusinesses(businessOrBusinesses);
    } else {
      selectBusiness(businessOrBusinesses);
    }
  };

  // Function to get auto keywords from selected business
  const getAutoKeywords = () => {
    if (!selectedBusiness) return [];
    
    const autoKeywords = [];
    
    // Add business name as a keyword
    if (selectedBusiness.title) {
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
    if (selectedBusiness.categories?.primaryCategory) {
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
    
    // Add address from storefrontAddress or location using the same pattern as BusinessDetails.jsx
    const extractValue = (obj, ...keys) => {
      if (!obj) return '';
      if (typeof obj === 'string' || typeof obj === 'number') return String(obj);
      for (const key of keys) {
        if (obj[key] !== undefined && obj[key] !== null) {
          return String(obj[key]);
        }
      }
      return '';
    };

    // Try to get address from storefrontAddress first, then location, then address
    const addressSource = selectedBusiness.storefrontAddress || selectedBusiness.location || selectedBusiness.address;
    if (addressSource) {
      const addressComponents = [];
      
      // Get address lines (handle both array and single string)
      const addressLines = [];
      if (addressSource.addressLines) {
        if (Array.isArray(addressSource.addressLines)) {
          addressLines.push(...addressSource.addressLines);
        } else {
          addressLines.push(addressSource.addressLines);
        }
      }
      
      // Add street address (first line) if available
      if (addressLines.length > 0) {
        const streetAddress = addressLines[0].replace(/[^\w\s-.,#]/g, ' ').replace(/\s+/g, ' ').trim();
        if (streetAddress) {
          addressComponents.push(streetAddress);
        }
      }
      
      // Add locality (city), administrativeArea (state), and postalCode
      const locality = extractValue(addressSource, 'locality', 'city');
      const adminArea = extractValue(addressSource, 'administrativeArea', 'state', 'province');
      const postalCode = extractValue(addressSource, 'postalCode', 'zip');
      
      // Combine city, state, and zip
      const cityStateZip = [locality, adminArea, postalCode].filter(Boolean).join(', ');
      if (cityStateZip) {
        addressComponents.push(cityStateZip);
      }
      
      // Add the complete address as a keyword if we have any components
      if (addressComponents.length > 0) {
        const fullAddress = addressComponents.join(' '); // Changed from \n to space
        if (fullAddress && !autoKeywords.includes(fullAddress)) {
          autoKeywords.push(fullAddress);
        }
      }
    }
    
    // Only include string values in the keywords array and remove duplicates
    return [...new Set(autoKeywords.filter(keyword => 
      typeof keyword === 'string' && keyword.trim() !== ''
    ))];
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
    cta: {
      type: 'NONE',
      url: '',
      phone: ''
    }
  });

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [ctaDropdownOpen, setCtaDropdownOpen] = useState(false);
  
  // CTA Button State
  // CTA Handler Functions

  const handleCtaTypeChange = (e) => {
    const type = e.target.value;
    
    // Extract business data
    const extractValue = (obj, ...keys) => {
      if (!obj) return '';
      if (typeof obj === 'string' || typeof obj === 'number') return String(obj);
      for (const key of keys) {
        if (obj[key] !== undefined && obj[key] !== null) {
          return String(obj[key]);
        }
      }
      return '';
    };

    // Get website and phone from business data
    const websiteUri = extractValue(
      selectedBusiness?.websiteUri, 
      'url', 
      'websiteUrl',
      'website'
    );
    
    const phoneNumber = extractValue(
      selectedBusiness?.phoneNumbers?.primaryPhone, 
      'number', 
      'phoneNumber',
      'phone'
    );

    // Auto-fill based on CTA type
    setFormData(prev => {
      // Get current keywords that are not CTA related
      const nonCtaKeywords = Array.isArray(prev.keywordsArray) 
        ? prev.keywordsArray.filter(kw => {
            if (typeof kw === 'string') return true;
            return kw.type !== 'cta' && kw.type !== 'cta_value';
          })
        : [];
      
      // Create CTA keyword objects
      const ctaKeywords = [];
      if (type !== 'NONE') {
        // Add CTA type as a keyword
        ctaKeywords.push({
          type: 'cta',
          value: getCtaLabel(type),
          auto: true
        });
        
        // Add CTA value (URL or phone) as a keyword if available
        const ctaValue = type === 'CALL' 
          ? (prev.cta?.phone || phoneNumber || '')
          : (prev.cta?.url || websiteUri || '');
          
        if (ctaValue) {
          ctaKeywords.push({
            type: 'cta_value',
            value: ctaValue,
            auto: true
          });
        }
      }
      
      return {
        ...prev,
        cta: {
          type,
          url: type === 'CALL' ? '' : (prev.cta?.url || websiteUri || ''),
          phone: type === 'CALL' ? (prev.cta?.phone || phoneNumber || '') : ''
        },
        // Combine non-CTA keywords with new CTA keywords
        keywordsArray: [...nonCtaKeywords, ...ctaKeywords].filter(Boolean)
      };
    });
  };

  const handleCtaUrlChange = (e) => {
    const newUrl = e.target.value;
    setFormData(prev => {
      // Update CTA URL
      const updatedCta = {
        ...prev.cta,
        url: newUrl
      };
      
      // Get current keywords that are not CTA value
      const nonCtaValueKeywords = Array.isArray(prev.keywordsArray) 
        ? prev.keywordsArray.filter(kw => {
            if (typeof kw === 'string') return true;
            return kw.type !== 'cta_value' || kw.ctaType !== prev.cta.type;
          })
        : [];
      
      // Add new CTA value as a keyword if URL is not empty
      const ctaValueKeywords = newUrl ? [{
        type: 'cta_value',
        value: newUrl,
        ctaType: prev.cta.type,
        auto: true
      }] : [];
      
      return {
        ...prev,
        cta: updatedCta,
        keywordsArray: [...nonCtaValueKeywords, ...ctaValueKeywords].filter(Boolean)
      };
    });
  };

  const handleCtaPhoneChange = (e) => {
    const newPhone = e.target.value;
    setFormData(prev => {
      // Update CTA phone
      const updatedCta = {
        ...prev.cta,
        phone: newPhone
      };
      
      // Get current keywords that are not CTA value
      const nonCtaValueKeywords = Array.isArray(prev.keywordsArray) 
        ? prev.keywordsArray.filter(kw => {
            if (typeof kw === 'string') return true;
            return kw.type !== 'cta_value' || kw.ctaType !== 'CALL';
          })
        : [];
      
      // Add new CTA value as a keyword if phone is not empty
      const ctaValueKeywords = newPhone ? [{
        type: 'cta_value',
        value: newPhone,
        ctaType: 'CALL',
        auto: true
      }] : [];
      
      return {
        ...prev,
        cta: updatedCta,
        keywordsArray: [...nonCtaValueKeywords, ...ctaValueKeywords].filter(Boolean)
      };
    });
  };

  // Helper function to get CTA keywords
  const getCtaKeywords = (ctaType) => {
    if (!ctaType || ctaType === 'NONE') return [];
    
    const ctaLabels = {
      'BOOK': 'Book Now',
      'ORDER': 'Order Online',
      'SHOP': 'Shop Now',
      'LEARN': 'Learn More',
      'SIGNUP': 'Sign Up',
      'CALL': 'Call Now'
    };
    
    return [{
      type: 'cta',
      value: ctaLabels[ctaType] || ctaType
    }];
  };

  // Helper function to get display label for CTA type
  const getCtaLabel = (type) => {
    switch(type) {
      case 'BOOK': return 'Book Appointment';
      case 'ORDER': return 'Order Online';
      case 'SHOP': return 'Buy Now';
      case 'LEARN': return 'Learn More';
      case 'SIGNUP': return 'Sign Up';
      case 'CALL': return 'Call Now';
      default: return '';
    }
  };

  // Effect to automatically add business name and category as keywords when business changes
  useEffect(() => {
    if (selectedBusiness) {
      const autoKeywords = getAutoKeywords();
      setFormData(prev => ({
        ...prev,
        keywordsArray: [...autoKeywords]
      }));
    }
  }, [selectedBusiness]);

  const handleKeywordChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      keywords: value
    }));
  };

  const handleKeywordKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const keyword = formData.keywords.trim();
      if (keyword && !formData.keywordsArray.includes(keyword)) {
        setFormData(prev => ({
          ...prev,
          keywordsArray: [...prev.keywordsArray, keyword],
          keywords: ''
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
    
    setFormData(prev => ({
      ...prev,
      keywordsArray: prev.keywordsArray.filter(keyword => {
        // If both are strings, compare directly
        if (typeof keyword === 'string' && typeof keywordToRemove === 'string') {
          return keyword !== keywordToRemove;
        }
        // If both are objects, compare their values
        if (typeof keyword === 'object' && typeof keywordToRemove === 'object') {
          return JSON.stringify(keyword) !== JSON.stringify(keywordToRemove);
        }
        // If one is string and the other is object, keep both
        return true;
      })
    }));
  };

  const generateAIPostContent = async () => {
    if (!selectedBusiness) {
      toast.error('Please select a business location first');
      return;
    }

    // Get only the keywords that are explicitly selected (not auto-added)
    const selectedKeywords = formData.keywordsArray
      .filter(kw => {
        // Include if it's a direct string, a CTA value, or not marked as auto: true
        if (typeof kw === 'string') return true;
        // Include CTA values even if they're auto-generated
        if (kw.type === 'cta' || kw.type === 'cta_value') return true;
        // Exclude other auto-generated keywords
        return !kw.auto;
      })
      .map(kw => {
        // Convert objects to their string values
        if (typeof kw === 'string') return kw;
        return kw.value || '';
      })
      .filter(Boolean); // Remove any empty strings

    if (selectedKeywords.length === 0) {
      toast.error('Please add at least one keyword for AI generation');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const postType = formData.scheduleType === 'later' ? 'promotional' : 'engagement';
      
      // Create context with only the essential business info
      const enhancedContext = {
        name: selectedBusiness.title || selectedBusiness.name || '',
        category: selectedBusiness.categories?.primaryCategory || '',
        // No automatic address or contact info unless explicitly in keywords
      };

      // Only pass the explicitly selected keywords
      const aiContent = await generateAIPost(enhancedContext, selectedKeywords, postType);
      
      setFormData(prev => ({
        ...prev,
        postText: aiContent
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
  //  console.log(authData?.user)
    
      
      if (!token ) {
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
      const businessName = selectedBusiness?.title || 
                         selectedBusiness?.locationName || 
                         selectedBusiness?.name?.split('/').pop() || 
                         'Business';
      
      // Validate CTA data if a CTA is selected
      if (formData.cta.type !== 'NONE') {
        if (formData.cta.type === 'CALL' && !formData.cta.phone.trim()) {
          toast.error('Please enter a phone number for Call Now');
          return;
        } 
        if (formData.cta.type !== 'CALL' && !formData.cta.url.trim()) {
          toast.error(`Please enter a URL for ${getCtaLabel(formData.cta.type)}`);
          return;
        }
      }
      
      // Prepare the data for the API
      const postData = {
        content: formData.postText,
        // Filter keywords to only include string values or extract value from objects
        keywords: formData.keywordsArray
          .filter(item => typeof item === 'string' || (item && typeof item === 'object' && item.value))
          .map(item => typeof item === 'string' ? item : item.value),
        isScheduled: formData.scheduleType === 'later',
        scheduledFor: formData.scheduleType === 'later' ? `${formData.scheduleDate}T${formData.scheduleTime}:00` : null,
        isRecurring: formData.repeat,
        repeatType: formData.repeat ? formData.repeatType : null,
        cta: formData.cta.type !== 'NONE' ? {
          type: formData.cta.type,
          value: formData.cta.type === 'CALL' ? formData.cta.phone : formData.cta.url,
          label: getCtaLabel(formData.cta.type)
        } : null,
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
              : null
        },
        businessData: selectedBusiness 
      };
      // console.log("postData",postData)
      
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
      
      // Reset form but keep auto keywords and reset CTA
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
        cta: {
          type: 'NONE',
          url: '',
          phone: ''
        }
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
    { value: 'sunday', label: 'Sun' }
  ];

  return (
    <div className={`w-full px-4 py-6 min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-8xl mx-auto">
        {/* Business Profile Section */}
        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6 mb-2 transition-colors duration-200`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                Business Profile
              </h2>
              {selectedBusiness ? (
                <div className="flex items-center space-x-2">
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-black'}`}>
                    {selectedBusiness.title?.name || selectedBusiness.title || 'Business Name'}
                  </p>
                  {/* <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                    Active
                  </span> */}
                </div>
              ) : (
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-800'}`}>No business selected</p>
              )}
            </div>
            <div className="flex-shrink-0">
              <BusinessProfileDropdown
                businesses={businesses}
                selectedBusinesses={selectedBusiness ? [selectedBusiness] : []}
                onSelectBusiness={handleBusinessSelect}
                isConnected={isConnected}
                multiSelect={false}
                className="w-full sm:w-64"
                buttonClassName="w-full justify-between px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                dropdownClassName="origin-top-right right-0 mt-2 w-72 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
              >
                <div className="flex items-center">
                  <span className="block truncate">
                    {selectedBusiness 
                      ? (selectedBusiness.title?.name || selectedBusiness.title || 'Select Business')
                      : 'Select Business'}
                  </span>
                  <svg className="ml-2 -mr-1 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </BusinessProfileDropdown>
            </div>
          </div>
      </div>

      {/* <div className="mb-8">
        <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>Schedule Post</h1>
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Create and schedule your social media posts</p>
      </div> */}
      
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} p-6 transition-colors duration-200`}>
        <form onSubmit={handleSubmit}>
          {/* Post Content */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`} htmlFor="postText">
                Post Content
              </label>
              <button
                type="button"
                onClick={generateAIPostContent}
                disabled={isGeneratingAI || formData.keywordsArray.length === 0}
                className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ${
                  theme === 'dark'
                    ? 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-offset-gray-800'
                    : 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-offset-white'
                }`}
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
              className={`w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-black placeholder-gray-500'
              } border`}
              rows={5}
              placeholder="What's on your mind? (Optional - add keywords below and AI will generate content for you!)"
            />
          </div>

          {/* Keywords */}
          <div className={`mb-6 ${theme === 'dark' ? 'text-gray-200' : 'text-black'}`}>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-black'}`} htmlFor="keywords">
              Keywords
            </label>
            
            {/* Keywords Tags Display */}
            {formData.keywordsArray.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.keywordsArray.map((keyword, index) => {
                  // Check if this is a keyword object or a string
                  const isKeywordObject = typeof keyword === 'object' && keyword !== null;
                  const keywordValue = isKeywordObject ? keyword.value : keyword;
                  
                  // Check if this is an auto keyword (either from autoKeywords or marked as auto)
                  const autoKeywords = getAutoKeywords();
                  const isAutoKeyword = isKeywordObject 
                    ? keyword.auto === true 
                    : autoKeywords.includes(keyword);
                  
                  // Determine if this is a CTA keyword
                  const isCtaKeyword = isKeywordObject && keyword.type === 'cta';
                  const isCtaValue = isKeywordObject && keyword.type === 'cta_value';
                  
                  return (
                    <span
                      key={index}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                        isAutoKeyword 
                          ? isCtaKeyword 
                            ? 'bg-green-600 text-white' 
                            : 'bg-purple-600 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {isCtaKeyword ? `[${keywordValue}]` : keywordValue}
                      
                      {/* Show remove button only for non-auto keywords */}
                      {!isAutoKeyword && (
                        <button
                          type="button"
                          onClick={() => removeKeyword(keyword)}
                          className="ml-2 text-white hover:text-gray-200 focus:outline-none"
                        >
                          <FaTimes className="w-3 h-3" />
                        </button>
                      )}
                      
                      {/* Show auto indicator for auto-generated keywords */}
                      {isAutoKeyword && (
                        <span className="ml-2 text-xs opacity-75">
                          {isCtaKeyword ? '(CTA)' : isCtaValue ? '(CTA Value)' : '(auto)'}
                        </span>
                      )}
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
              className={`w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-black placeholder-gray-500'
              } border`}
              placeholder="Type keywords and press Enter or comma to add"
            />
            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-800'}`}>
              Press Enter or comma to add keywords. AI will generate content based on these keywords if post content is empty. 
              Purple tags are auto-generated from your business name and category. Click × to remove user-added keywords.
            </p>

            {/* CTA Button Section */}
            <div className="mt-4">
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-black'}`}>
                Call-to-Action Button Type
              </label>
              {/* Custom CTA Dropdown with icons */}
              {(() => {
                const ctaOptions = [
                  { value: 'NONE',   label: 'No Button',        icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg> },
                  { value: 'BOOK',   label: 'Book Appointment', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
                  { value: 'ORDER',  label: 'Order Online',     icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> },
                  { value: 'SHOP',   label: 'Buy Now',          icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> },
                  { value: 'LEARN',  label: 'Learn More',       icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
                  { value: 'SIGNUP', label: 'Sign Up',          icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg> },
                  { value: 'CALL',   label: 'Call Now',         icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg> },
                ];
                const selected = ctaOptions.find(o => o.value === formData.cta.type) || ctaOptions[0];
                return (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setCtaDropdownOpen(v => !v)}
                      className={`w-full flex items-center gap-2 rounded-lg px-4 py-2 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'
                      }`}
                    >
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}>{selected.icon}</span>
                      <span className="flex-1 text-left text-sm">{selected.label}</span>
                      <svg className={`w-4 h-4 transition-transform duration-200 ${ctaDropdownOpen ? 'rotate-180' : ''} ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 9l-7 7-7-7"/></svg>
                    </button>
                    {ctaDropdownOpen && (
                      <div className={`absolute z-50 w-full mt-1 rounded-lg border shadow-lg overflow-hidden ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                      }`}>
                        {ctaOptions.map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => { handleCtaTypeChange({ target: { value: opt.value } }); setCtaDropdownOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                              formData.cta.type === opt.value
                                ? theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'
                                : theme === 'dark' ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <span>{opt.icon}</span>
                            <span>{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* URL Input for web actions */}
              {(formData.cta.type === 'BOOK' || formData.cta.type === 'ORDER' || formData.cta.type === 'SHOP' || formData.cta.type === 'LEARN' || formData.cta.type === 'SIGNUP') && (
                <div className="mt-2">
                  <input
                    type="url"
                    value={formData.cta.url}
                    onChange={handleCtaUrlChange}
                    placeholder={`Enter URL for ${getCtaLabel(formData.cta.type)}`}
                    className={`w-full rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-black placeholder-gray-500'
                    } border`}
                    required
                  />
                </div>
              )}

              {/* Phone Input for call action */}
              {formData.cta.type === 'CALL' && (
                <div className="mt-2">
                  <input
                    type="tel"
                    value={formData.cta.phone}
                    onChange={handleCtaPhoneChange}
                    placeholder="Enter phone number (e.g., +1234567890)"
                    className={`w-full rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-black placeholder-gray-500'
                    } border`}
                    required
                    pattern="[0-9+\-() ]{10,}"
                    title="Please enter a valid phone number (e.g., +1234567890 or 123-456-7890)"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Schedule Options */}
          <div className="mb-6">
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
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
                  className={`form-radio ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}
                />
                <span className={`ml-2 ${theme === 'dark' ? 'text-gray-200' : 'text-black'}`}>Schedule for later</span>
              </label>
              
              {formData.scheduleType === 'later' && (
                <div className="flex flex-col sm:flex-row gap-4 mt-2">
                  <div className="flex-1">
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-black'}`}>Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        name="scheduleDate"
                        value={formData.scheduleDate}
                        onChange={handleChange}
                        className={`w-full rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-black'
                } border`}
                        required={formData.scheduleType === 'later'}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-black'}`}>Time</label>
                    <div className="relative">
                      <input
                        type="time"
                        name="scheduleTime"
                        value={formData.scheduleTime}
                        onChange={handleChange}
                        className={`w-full rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-black'
                } border`}
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
                className={`rounded ${
                  theme === 'dark' 
                    ? 'border-gray-400 text-blue-400' 
                    : 'border-gray-600 text-blue-600'
                }`}
              />
              <span className={`ml-2 font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-black'}`}>Repeat this post</span>
            </label>
            
            {formData.repeat && (
              <div className="ml-6 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-black'}`}>Repeat every</label>
                  <select
                    name="repeatType"
                    value={formData.repeatType}
                    onChange={handleChange}
                    className={`w-full sm:w-auto rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-black'
                } border`}
                  >
                    <option value="daily">Day</option>
                    <option value="weekly">Week</option>
                    <option value="monthly">Month</option>
                  </select>
                </div>
                
                {formData.repeatType === 'weekly' && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-black'}`}>On days</label>
                    <div className="flex flex-wrap gap-2">
                      {daysOfWeek.map(day => (
                        <label key={day.value} className="inline-flex items-center">
                          <input
                            type="checkbox"
                            name={`day-${day.value}`}
                            checked={formData.repeatDays.includes(day.value)}
                            onChange={handleChange}
                            className={`rounded ${
                  theme === 'dark' 
                    ? 'border-gray-400 text-blue-400' 
                    : 'border-gray-600 text-blue-600'
                }`}
                          />
                          <span className={`ml-1 ${theme === 'dark' ? 'text-gray-200' : 'text-black'}`}>{day.label}</span>
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
              className={`inline-flex items-center px-6 py-2.5 font-medium text-sm leading-tight rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out ${
                theme === 'dark'
                  ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-gray-800'
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-white'
              }`}
            >
              <FaPaperPlane className="mr-2" />
              {formData.scheduleType === 'now' ? 'Post Now' : 'Schedule Post'}
            </button>
          </div>
        </form>
        
        {/* Scheduled Posts Section */}
        <div className="mt-12">
          <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            My Scheduled Posts
          </h2>
          {selectedBusiness ? (
            <MyScheduledPosts businessId={selectedBusiness.name} />
          ) : (
            <div className={`text-center py-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Please select a business to view scheduled posts
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default SocialSharing;
