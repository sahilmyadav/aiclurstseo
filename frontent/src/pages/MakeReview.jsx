import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

function MakeReview() {
  const { locationId } = useParams();
  const [searchParams] = useSearchParams();
  const businessName = searchParams.get('name') || 'Business';
  
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [showGoogleButton, setShowGoogleButton] = useState(false);
  
  // Feedback form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    feedback: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleStarClick = (rating) => {
    setSelectedRating(rating);
    
    if (rating >= 1 && rating <= 3) {
      // Low rating: show feedback form
      setShowForm(true);
      setShowGoogleButton(false);
    } else if (rating >= 4 && rating <= 5) {
      // High rating: show Google review button
      setShowForm(false);
      setShowGoogleButton(true);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    
    // Here you can send the feedback to your backend
    console.log('Feedback submitted:', {
      locationId,
      businessName,
      rating: selectedRating,
      ...formData
    });
    
    setSubmitted(true);
  };

  const handleGoogleReview = () => {
    // Multiple fallback methods for Google review
    // Method 1: Direct review URL (most reliable)
    const googleReviewUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(businessName)}&query_place_id=${locationId}`;
    
    // Open in new window
    const reviewWindow = window.open(googleReviewUrl, '_blank', 'noopener,noreferrer');
    
    // Fallback: If popup blocked, show alternative
    if (!reviewWindow || reviewWindow.closed || typeof reviewWindow.closed === 'undefined') {
      // Show a message or redirect in same window
      window.location.href = googleReviewUrl;
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0b1f] via-[#1a1433] to-[#0f0b1f] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#171624]/50 border border-white/5 rounded-lg p-8 backdrop-blur-sm text-center">
          <div className="mb-6">
            <svg className="w-16 h-16 text-green-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Thank You!</h2>
          <p className="text-gray-300 mb-6">
            We appreciate your feedback. It helps us improve our service.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-purple-400 hover:text-purple-300 font-medium"
          >
            Submit Another Review
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0b1f] via-[#1a1433] to-[#0f0b1f] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#171624]/50 border border-white/5 rounded-lg p-6 sm:p-8 backdrop-blur-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mb-4">
            <svg className="w-12 h-12 text-purple-400 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Rate Your Experience
          </h1>
          <p className="text-gray-300">
            at <span className="font-semibold text-purple-400">{businessName}</span>
          </p>
        </div>

        {/* Star Rating */}
        <div className="mb-8">
          <p className="text-center text-gray-300 mb-4">
            How would you rate your experience?
          </p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110 focus:outline-none"
              >
                <svg
                  className={`w-10 h-10 sm:w-12 sm:h-12 transition-colors ${
                    star <= (hoveredRating || selectedRating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-400'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </button>
            ))}
          </div>
          {selectedRating > 0 && (
            <p className="text-center text-gray-400 mt-3 text-sm">
              You selected {selectedRating} star{selectedRating > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Feedback Form (for 1-3 stars) */}
        {showForm && (
          <div className="animate-fadeIn">
            <h3 className="text-lg font-semibold text-white mb-4">
              We'd love to hear your feedback
            </h3>
            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  className="w-full px-4 py-3 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/10 text-white placeholder-gray-400"
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                  className="w-full px-4 py-3 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/10 text-white placeholder-gray-400"
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Feedback
                </label>
                <textarea
                  name="feedback"
                  value={formData.feedback}
                  onChange={handleFormChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/10 text-white placeholder-gray-400 resize-none"
                  placeholder="Tell us how we can improve..."
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Submit Feedback
              </button>
            </form>
          </div>
        )}

        {/* Google Review Button (for 4-5 stars) */}
        {showGoogleButton && (
          <div className="animate-fadeIn text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Awesome! Thank you!
              </h3>
              <p className="text-gray-300 mb-6">
                Would you mind sharing your experience on Google?
              </p>
            </div>
            
            <button
              onClick={handleGoogleReview}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
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
              className="mt-4 text-gray-400 hover:text-gray-300 text-sm"
            >
              Maybe later
            </button>
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
  );
}

export default MakeReview;
