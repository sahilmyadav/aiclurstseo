// Backend AI generator utility for post content
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Generates AI-powered social media posts based on keywords and business data
 * @param {Object} businessData - Business data from GoogleBusinessContext
 * @param {Array} keywords - Array of keywords for the post
 * @param {string} postType - Type of post (e.g., 'promotional', 'informative', 'engagement')
 * @returns {Promise<string>} - Generated post content
 */
export const generateAIPost = async (businessData, keywords = [], postType = 'promotional') => {
  try {
    // Handle different business data structures
    const name = businessData?.title || businessData?.name || businessData?.businessName || 'a local business';
    const category = businessData?.primaryCategory || businessData?.category || 'various services';
    const location = businessData?.location || businessData?.address;
    const website = businessData?.websiteUri || businessData?.website || 'Not specified';
    const priceLevel = businessData?.priceInfo?.priceLevel || businessData?.priceLevel;
    
    // Extract location details
    const city = location?.address?.locality || location?.city || '';
    const state = location?.address?.regionCode || location?.state || '';
    const locationText = city && state ? `${city}, ${state}` : city || state || '';
    
    // Prepare the prompt for Gemini
    const prompt = `Generate a compelling social media post for a business with the following details:

Business Name: ${name}
Category: ${category}
Location: ${locationText}
Website: ${website}
Price Level: ${priceLevel ? '$'.repeat(parseInt(priceLevel)) : 'Not specified'}

Keywords to focus on: ${keywords.join(', ') || 'general business promotion'}
Post Type: ${postType}

Guidelines for generating the post:
1. Keep the post between 50-150 words for optimal social media engagement
2. Make it sound authentic and human-like, not overly promotional
3. Naturally incorporate the keywords provided
4. Include relevant emojis to increase engagement
5. Add a call-to-action at the end
6. For promotional posts: highlight special offers, unique features, or benefits
7. For informative posts: share useful tips, industry insights, or educational content
8. For engagement posts: ask questions, encourage comments, or create interactive content
9. Mention the business location if relevant
10. Make it engaging and shareable

Return ONLY the post content, no other text or formatting.`;

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
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error from Gemini API:', errorData);
      throw new Error('Failed to generate post');
    }

    const data = await response.json();
    
    // Handle different response structures
    let textResponse;
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      textResponse = data.candidates[0].content.parts[0].text;
    } else if (data.content && data.content.parts) {
      textResponse = data.content.parts[0].text;
    } else {
      console.error('Unexpected API response structure:', data);
      throw new Error('Unexpected API response structure');
    }
    
    // Clean up the response
    return textResponse.trim();
  } catch (error) {
    console.error('Error generating AI post:', error);
    return getFallbackPost(keywords, businessData?.title || businessData?.name || businessData?.businessName);
  }
};

// Fallback post in case the API call fails
const getFallbackPost = (keywords, businessName) => {
  const keywordText = keywords.length > 0 ? keywords.join(', ') : 'our services';
  const name = businessName || 'a local business';
  return `🌟 Exciting things happening at ${name}! 

We're passionate about ${keywordText} and committed to bringing you the best experience. 

Visit us today and discover what makes us special! ✨

#CustomerExperience #QualityService`;
};
