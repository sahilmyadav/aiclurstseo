// Using Vite environment variables
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Array of human-like response starters to avoid generic phrases
const HUMAN_STARTERS = [
  "Thanks for taking the time to share your experience",
  "We really appreciate you letting us know how things went",
  "Your feedback means a lot to our team",
  "Thank you for your honest review",
  "We're grateful you shared your thoughts with us",
  "Thanks for being a customer and for your feedback"
];

// Array of human-like closings
const HUMAN_CLOSINGS = [
  "We hope to see you again soon",
  "Looking forward to serving you again",
  "We'd love to have you back",
  "Hope to make your next visit even better",
  "Can't wait to welcome you back",
  "We're here whenever you need us"
];

// Helper function to get a random human-like starter
const getRandomStarter = () => {
  return HUMAN_STARTERS[Math.floor(Math.random() * HUMAN_STARTERS.length)];
};

// Helper function to get a random human-like closing
const getRandomClosing = () => {
  return HUMAN_CLOSINGS[Math.floor(Math.random() * HUMAN_CLOSINGS.length)];
};

/**
 * Generates an AI-powered response for a review
 * @param {string} reviewText - The review text to respond to
 * @param {string} businessType - The type/category of the business
 * @param {string} [tone='professional'] - Desired tone of the response
 * @param {boolean} [isEdit=false] - Whether this is an edit of an existing reply
 * @param {number} [rating=5] - The rating given in the review (1-5)
 * @param {string} [businessName='our business'] - The name of the business
 * @returns {Promise<string>} Generated AI response
 */
export const generateAIReviewReply = async (
  reviewText, 
  businessType = 'business', 
  tone = 'professional', 
  isEdit = false, 
  rating = 5, 
  businessName = 'our business'
) => {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
    }

    // Randomize temperature for more varied responses (between 0.7 and 1.0)
    const temperature = 0.7 + (Math.random() * 0.3);
    
    // Get random human-like starter and closing
    const starter = getRandomStarter();
    const closing = getRandomClosing();
    
    // Create a specific prompt for human-like responses
    const prompt = `You are a genuine human writing a response to a customer review. 
You are the manager/owner of ${businessName}, a ${businessType}.

Review Details:
- Rating: ${rating} out of 5
- Review: "${reviewText}"

Important Rules:
1. Start your response with one of these human-like phrases: ${HUMAN_STARTERS.join('", "')}
2. NEVER start with: "We are so grateful for your fantastic 5-star review", "Thank you for your [rating]-star review", "We're thrilled to hear from you", or any other generic business greeting
3. Be authentic and sound like a real person
4. For 5-star reviews: Mention specific aspects mentioned in the review if possible, express genuine happiness
5. For 4-star reviews: Show appreciation and address any minor concerns
6. For 3-star or lower reviews: Be empathetic and offer specific help
7. Keep responses conversational (2-4 sentences)
8. End naturally with a warm closing like: ${HUMAN_CLOSINGS.join('", "')}
9. Don't overthink it - write naturally as you would in person

Example Good Response for a 5-star review about food:
"${HUMAN_STARTERS[0]}. It's amazing to hear you enjoyed our food! The chef will definitely love to know about that. We work hard to make everything fresh, and it's wonderful to hear it showed. ${HUMAN_CLOSINGS[0]}!"

${isEdit ? 'This is an edit of an existing response. Maintain the same tone and intent but make it fresh.' : ''}

Generated Response:`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: temperature, // Use randomized temperature
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error from Gemini API:', errorData);
      throw new Error('Failed to generate review response');
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResponse) {
      throw new Error('Received empty response from the AI model');
    }
    
    // Clean up the response
    let reply = textResponse.replace(/^[\"']|[\"']$/g, '').trim();
    
    // If response still starts with banned phrases, replace it with a fallback approach
    const bannedStarts = [
      "we are so grateful",
      "thank you for your",
      "we're thrilled",
      "we truly appreciate",
      "we appreciate your feedback"
    ];
    
    const startsWithBanned = bannedStarts.some(banned => 
      reply.toLowerCase().startsWith(banned)
    );
    
    if (startsWithBanned || reply.length < 10) {
      // Use the fallback approach
      return getFallbackResponse(reviewText, rating, businessName, businessType);
    }
    
    if (!reply) {
      throw new Error('Generated response is empty after cleanup');
    }
    
    return reply;
  } catch (error) {
    console.error('Error generating AI reply:', error);
    // Return a fallback response if the API call fails
    return getFallbackResponse(reviewText, rating, businessName, businessType);
  }
};

// Human-like fallback responses - avoid generic business language
const getFallbackResponse = (reviewText, rating, businessName, businessType) => {
  // Clean and natural response for positive reviews
  if (rating >= 4) {
    // Analyze review for key words
    const text = reviewText.toLowerCase();
    
    if (text.includes('food') || text.includes('delicious') || text.includes('tasty')) {
      return `${HUMAN_STARTERS[0]} - so glad to hear you loved our food! ${getRandomClosing()} and thank you again!`;
    } else if (text.includes('service') || text.includes('staff') || text.includes('helpful')) {
      return `Hearing good things about our service always makes my day! Thanks for being part of the ${businessName} family. ${getRandomClosing()}!`;
    } else if (text.includes('clean') || text.includes('place')) {
      return `Thank you for your kind words! Keeping our space great is our top priority, and your feedback proves it matters. We can't wait to have you back soon!`;
    } else {
      return `What a nice review, thank you so much! Every word you've written has been put in a note we send to the team - things like yours inspire us daily. Looking forward to your next visit!`;
    }
  } 
  // Human-like response for average ratings
  else if (rating >= 3) {
    return `${HUMAN_STARTERS[2]}. We're working to improve each day and we take reviews like this very seriously. Can you message us about any specific issues you'd like addressed? Thanks!`;
  }
  // Genuine response for low ratings
  else {
    return `Thank you for the feedback and being straight with us. We want to make sure all customers walk out the door completely happy. I will call/email to sort it out.`;
  }
};

import { useState } from 'react';

/**
 * Hook for using AI reply generation in components
 * @returns {Object} AI generation functions and state
 */
export const useAIReviewReply = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Generate a reply for a review
   * @param {Object} reviewData - Review data
   * @param {string} reviewData.comment - The review text
   * @param {string} [reviewData.businessType='business'] - Type/category of the business
   * @param {string} [reviewData.tone='professional'] - Desired tone of the response
   * @param {boolean} [reviewData.isEdit=false] - Whether this is an edit of an existing reply
   * @param {number} [reviewData.rating=5] - The review rating (1-5)
   * @param {string} [reviewData.businessName=''] - Name of the business
   * @returns {Promise<string>} Generated AI response
   */
  const generateReply = async (reviewData = {}) => {
    if (!reviewData || !reviewData.comment) {
      const errorMsg = 'No review text provided';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    setIsGenerating(true);
    setError(null);

    try {
      const reply = await generateAIReviewReply(
        reviewData.comment,
        reviewData.businessType,
        reviewData.tone,
        reviewData.isEdit,
        reviewData.rating,
        reviewData.businessName
      );
      return reply;
    } catch (err) {
      console.error('Error in generateReply:', err);
      const errorMsg = err.message || 'Failed to generate response';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  // Clear any error state
  const clearError = () => setError(null);

  return { 
    generateReply, 
    isGenerating, 
    error,
    clearError
  };
};

// For backward compatibility
export default generateAIReviewReply;
