import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { generateReviewSuggestions } from '../utils/suggestion';
import { FiCopy, FiCheck, FiX } from 'react-icons/fi';

function MakeReview() {
  const { locationId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get business name from URL params
  const businessName = searchParams.get('businessName') 
    ? searchParams.get('businessName')
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : 'Our Business';
  
  const businessCategory = searchParams.get('category') 
    ? searchParams.get('category')
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : 'business';

  const reviewUri = searchParams.get('reviewUri');
  
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [showGoogleButton, setShowGoogleButton] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  
  // Feedback form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    feedback: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleClose = () => {
    // Navigate back or to home
    navigate(-1);
  };

  const handleStarClick = async (rating) => {
    setSelectedRating(rating);
    
    if (rating >= 1 && rating <= 3) {
      // Low rating: show feedback form
      setShowForm(true);
      setShowGoogleButton(false);
      setSuggestions([]);
    } else if (rating >= 4 && rating <= 5) {
      // High rating: show Google review button and generate suggestions
      setShowForm(false);
      setShowGoogleButton(true);
      setIsLoading(true);
      
      try {
        const businessData = {
          name: businessName,
          primaryCategory: businessCategory,
          categories: {
            primaryCategory: {
              name: businessCategory
            }
          },
          location: {
            address: {
              locality: searchParams.get('city') || '',
              regionCode: searchParams.get('state') || ''
            }
          },
          websiteUri: searchParams.get('website') || '',
          priceInfo: {
            priceLevel: searchParams.get('priceLevel') || ''
          }
        };
        
        const generatedSuggestions = await generateReviewSuggestions(businessData, rating);
        setSuggestions(generatedSuggestions);
      } catch (error) {
        console.error('Error generating suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    
    try {
      const reviewData = {
        locationId,
        businessName,
        rating: selectedRating,
        ...formData
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:8000'}/api/reviews/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      const result = await response.json();
      console.log('Feedback saved successfully:', result);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    }
  };

  // Get reviewUri from URL parameters
  // const reviewUri = searchParams.get('reviewUri');
  
  
  const handleGoogleReview = () => {
    if (!reviewUri) {
      console.error('No review URL provided');
      return;
    }

    try {
      console.log('Opening review URL:', reviewUri);
      
      // Open the review URL in a new tab
      const reviewWindow = window.open(reviewUri, '_blank', 'noopener,noreferrer');
      
      // Fallback if popup is blocked
      if (!reviewWindow || reviewWindow.closed || typeof reviewWindow.closed === 'undefined') {
        window.location.href = reviewUri;
      }
    } catch (error) {
      console.error('Error opening review URL:', error);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg p-8 text-center shadow-sm border border-gray-100 relative">
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <FiX className="w-5 h-5" />
          </button>
          <div className="mb-6">
            <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            We appreciate your feedback. It helps us improve our service.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Submit Another Review
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-sm border border-gray-100 relative overflow-hidden">
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <FiX className="w-5 h-5" />
        </button>
        
        <div className="md:flex">
          {/* Left Column - Header */}
          <div className="hidden md:flex flex-col justify-center items-center p-8 bg-gray-50 w-full md:w-1/3 lg:w-2/5">
            <div className="text-center">
              {/* Google Logo */}
              <div className="mb-6">
                <img 
                  src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png" 
                  alt="Google" 
                  className="h-8 mx-auto"
                />
              </div>
              
              <h1 className="text-2xl font-medium text-gray-900 mb-2">
                We Value Your Feedback
              </h1>
              <p className="text-gray-500 text-sm">
                How was your experience with us?
              </p>
              
              {/* Powered By */}
              <div className="mt-8">
                <div className="text-center">
                  <div className="text-xs font-medium text-gray-400 mb-2">POWERED BY</div>
                  <div className="flex justify-center">
                    <img 
                      src="/clurst transparent logo 2 for white baground.png" 
                      alt="Clurst Logo"
                      className="h-32 w-auto object-contain" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Form */}
          <div className="w-full md:w-2/3 lg:w-3/5 md:p-6">
            {/* Mobile Header - Only shown on small screens */}
            <div className="md:hidden text-center mb-6">
              <div className="mb-4">
                <img 
                  src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png" 
                  alt="Google" 
                  className="h-6 mx-auto"
                />
              </div>
              <h1 className="text-xl font-medium text-gray-900 mb-1">
                We Value Your Feedback
              </h1>
              <p className="text-gray-500 text-sm mb-4">
                How was your experience with us?
              </p>
            </div>

            {/* Star Rating */}
            <div className="flex justify-center my-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="focus:outline-none mx-1"
            >
              <svg
                className={`w-12 h-12 ${(hoveredRating || selectedRating) >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
        
        {/* Rating Labels */}
        {selectedRating > 0 && (
          <div className="text-center mb-6">
            <p className="text-gray-600">
              {selectedRating === 1 && 'Poor'}
              {selectedRating === 2 && 'Fair'}
              {selectedRating === 3 && 'Good'}
              {selectedRating === 4 && 'Very Good'}
              {selectedRating === 5 && 'Excellent'}
            </p>
          </div>
        )}
        
        {selectedRating > 0 && (
          <p className="text-center text-black mt-3 text-sm">
            You selected {selectedRating} star{selectedRating > 1 ? 's' : ''}
          </p>
        )}

        {/* Feedback Form (for 1-3 stars) */}
        {showForm && (
          <div className="animate-fadeIn">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              We'd love to hear your feedback
            </h3>
            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/90 text-gray-900 placeholder-gray-400"
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/90 text-gray-900 placeholder-gray-400"
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Feedback
                </label>
                <textarea
                  name="feedback"
                  value={formData.feedback}
                  onChange={handleFormChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/90 text-gray-900 placeholder-gray-400 resize-none"
                  placeholder="Tell us how we can improve..."
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-blue-100"
              >
                Submit Feedback
              </button>
            </form>
          </div>
        )}

        {/* Google Review Button (for 4-5 stars) */}
        {showGoogleButton && (
          <div className="animate-fadeIn space-y-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-3">
                <svg className="w-7 h-7 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                Awesome! {selectedRating}-star rating!
              </h3>
              <p className="text-gray-700">
                Would you like some suggestions for your review?
              </p>
            </div>

            {/* AI Suggestions */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-800 mb-2">
                {isLoading ? 'Generating suggestions...' : 'Review suggestions:'}
              </h4>
              
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-3 bg-gray-100 rounded-full animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {suggestions.slice(0, 3).map((suggestion, index) => (
                    <div 
                      key={index}
                      className="p-3 bg-white border border-gray-100 rounded-lg text-sm text-gray-800 transition-all hover:shadow-md cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => setFormData(prev => ({ ...prev, feedback: suggestion }))}
                        >
                          "{suggestion}"
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(suggestion);
                            setCopiedIndex(index);
                            setTimeout(() => setCopiedIndex(null), 2000);
                          }}
                          className="ml-2 p-1 text-blue-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                          title="Copy to clipboard"
                        >
                          {copiedIndex === index ? (
                            <FiCheck className="w-4 h-4 text-green-400" />
                          ) : (
                            <FiCopy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-center text-gray-700 mb-4">
                Ready to share your experience on Google?
              </p>
              
              <button
                onClick={handleGoogleReview}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
                <span>Review on Google Profile</span>
              </button>
              
              <button
                onClick={() => {
                  setSelectedRating(0);
                  setShowGoogleButton(false);
                }}
                className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Maybe later
              </button>
            </div>
          </div>
        )}

        {/* Initial state message */}
        {!showForm && !showGoogleButton && selectedRating === 0 && (
          <div className="text-center text-gray-400 text-sm">
            <p>Please select a rating to continue</p>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MakeReview;
