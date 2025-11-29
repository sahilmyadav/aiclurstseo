// Using Vite environment variables
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Array of different response templates to add variety
const RESPONSE_TEMPLATES = [
  "We're {grateful/sorry} to hear about your experience at {businessName}. {positive/negative} We {appreciate/value} your feedback and {look forward to serving you again/hope to have another chance to serve you}.",
  "Thank you for your {rating}-star review! Your feedback {is incredibly valuable/helps us improve}. We're {thrilled/sorry} to hear about your experience and {appreciate you taking the time to share it/will use it to improve}.",
  "{Hello/Greetings} from {businessName}! We {are delighted/truly appreciate} your {rating}-star review. {Positive/Negative} feedback like yours {helps us grow/helps us improve our services}.",
  "We {sincerely appreciate/are grateful for} your {rating}-star review of {businessName}. Your {positive/constructive} feedback {means a lot to our team/will help us serve you better} in the future.",
  "Thank you for choosing {businessName} and for taking the time to leave us a {rating}-star review. We {are thrilled/truly value} your {kind/constructive} words and {look forward to/hope to have another chance at} serving you again!"
];

// Helper function to get a random template
const getRandomTemplate = () => {
  return RESPONSE_TEMPLATES[Math.floor(Math.random() * RESPONSE_TEMPLATES.length)];
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
    
    // Get a random template for more variety
    const template = getRandomTemplate();
    
    // Create a specific prompt for review responses with more variety
    const prompt = `You are a helpful assistant that generates professional and friendly responses to customer reviews.

Business Details:
- Name: ${businessName}
- Category: ${businessType}

Review Details:
- Rating: ${rating} out of 5
- Review: "${reviewText}"

Instructions for the response:
1. Use this template as inspiration but make it sound natural: "${template}"
2. Be ${tone} and ${rating <= 2 ? 'apologetic' : 'appreciative'}
3. Keep it between 2-4 sentences
4. Make it sound human and authentic
5. Vary your responses - don't use the same phrases every time
6. ${rating <= 2 ? 'Offer to make things right' : 'Express gratitude'}
7. Use natural language variations

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
    console.log('Gemini API Response:', data);
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResponse) {
      throw new Error('Received empty response from the AI model');
    }
    
    // Clean up the response
    const reply = textResponse.replace(/^[\"']|[\"']$/g, '').trim();
    console.log('Generated Response:', reply);
    
    if (!reply) {
      throw new Error('Generated response is empty after cleanup');
    }
    
    return reply;
  } catch (error) {
    console.error('Error generating AI reply:', error);
    // Return a fallback response if the API call fails
    return getFallbackResponse(reviewText, rating, businessName);
  }
};

// Fallback responses in case the API call fails
const getFallbackResponse = (reviewText, rating, businessName = 'our business') => {
  const business = businessName || 'our business';
  const ratingText = `${rating}-star`;
  
  // Different response templates for different rating ranges
  const positiveResponses = [
    `Thank you for your ${ratingText} review! We're absolutely delighted to hear about your wonderful experience at ${business}. Your satisfaction means everything to us, and we can't wait to welcome you back soon!`,
    `We're over the moon about your ${ratingText} rating! Thank you for choosing ${business} and for taking the time to share your positive experience. We truly appreciate your support and look forward to serving you again!`,
    `Your ${ratingText} review made our day! At ${business}, we strive to provide excellent service, and we're thrilled to know we hit the mark. Thank you for your kind words - we can't wait to see you again soon!`,
    `Thank you for the amazing ${ratingText} review! We're so happy to hear you enjoyed your time at ${business}. Your feedback inspires us to keep delivering great experiences. See you again soon!`
  ];

  const neutralResponses = [
    `Thank you for your ${ratingText} review of ${business}. We appreciate you taking the time to share your thoughts. We're always looking for ways to improve, and your feedback helps us do better.`,
    `We appreciate your ${ratingText} rating of ${business}. Your feedback is valuable to us as we work to enhance our services. We hope to have the opportunity to serve you again soon.`,
    `Thank you for your ${ratingText} review. We're glad you chose ${business} and appreciate your honest feedback. We're committed to continuous improvement and hope to exceed your expectations next time.`
  ];

  const negativeResponses = [
    `Thank you for your feedback and your ${ratingText} rating. We're truly sorry to hear about your experience at ${business}. Please know that we take all feedback seriously and would appreciate the opportunity to make things right.`,
    `We're genuinely sorry to hear about your experience at ${business}. Your ${ratingText} rating is important feedback for us. We'd love to understand how we can improve - please reach out to us directly.`,
    `Thank you for taking the time to share your feedback. We're disappointed to hear about your ${ratingText} experience at ${business} and would welcome the chance to address your concerns personally.`
  ];

  // Select a random response based on rating
  let responses;
  if (rating >= 4) {
    responses = positiveResponses;
  } else if (rating <= 2) {
    responses = negativeResponses;
  } else {
    responses = neutralResponses;
  }

  // Return a random response from the selected category
  return responses[Math.floor(Math.random() * responses.length)];
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
