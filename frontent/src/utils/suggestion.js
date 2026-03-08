// Using Vite environment variables
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/**
 * Generates AI-powered review suggestions for a business
 * @param {Object} businessData - Business data from GoogleBusinessContext
 * @param {number} rating - The rating (1-5) for which to generate suggestions
 * @param {Array} existingReviews - Array of existing reviews for context
 * @returns {Promise<Array<string>>} - Array of generated review suggestions
 */
/**
 * Generates AI-powered social media posts based on keywords and business data
 * @param {Object} businessData - Business data from GoogleBusinessContext
 * @param {Array} keywords - Array of keywords for the post
 * @param {string} postType - Type of post (e.g., 'promotional', 'informative', 'engagement')
 * @returns {Promise<string>} - Generated post content
 */
export const generateAIPost = async (businessData, keywords = [], postType = 'promotional') => {
  try {
    const { name, primaryCategory, location, websiteUri, regularHours, priceInfo } = businessData;
    
    // Prepare the prompt for Gemini
    const prompt = `Generate a compelling social media post for a business with the following details:

Business Name: ${name || 'a local business'}
Category: ${primaryCategory || 'various services'}
Location: ${location?.address?.locality || ''}, ${location?.address?.regionCode || ''}
Website: ${websiteUri || 'Not specified'}
Price Level: ${priceInfo?.priceLevel ? '$'.repeat(parseInt(priceInfo.priceLevel)) : 'Not specified'}

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
    const textResponse = data.candidates[0].content.parts[0].text;
    
    // Clean up the response
    return textResponse.trim();
  } catch (error) {
    console.error('Error generating AI post:', error);
    return getFallbackPost(keywords, name);
  }
};

// Fallback post in case the API call fails
const getFallbackPost = (keywords, businessName) => {
  const keywordText = keywords.length > 0 ? keywords.join(', ') : 'our services';
  return `🌟 Exciting things happening at ${businessName || 'our business'}! 

We're passionate about ${keywordText} and committed to bringing you the best experience. 

Visit us today and discover what makes us special! ✨

#CustomerExperience #QualityService`;
};

export const generateReviewSuggestions = async (businessData, rating, existingReviews = []) => {
  try {
    const { name, primaryCategory, location, websiteUri, regularHours, priceInfo } = businessData;
    
    // Prepare the prompt for Gemini
    const isHighRating = rating >= 4;
    const prompt = `Generate 3 unique and natural-sounding ${rating}-star review suggestions from a CUSTOMER'S PERSPECTIVE for ${name || 'a local business'} (${primaryCategory || 'various services'}).

IMPORTANT RULES:
1. Write from a first-person perspective ("I", "my", "me") as if you're a real customer
2. Be specific about your experience - mention what you liked
3. For ${rating}-star reviews, explain why you're giving this rating
4. Keep it conversational and natural, like a real person wrote it
5. Each review should be 15-30 words
6. Vary the focus between service, quality, atmosphere, etc.
7. Include small details that make it sound authentic
8. Don't use generic phrases like "highly recommend" without saying why
9. Make it sound like a genuine customer review, not a business owner
10. Return ONLY a valid JSON array of 3 strings, no other text

Example format (from customer perspective):
["I was really impressed with the friendly service and the delicious food. The staff went above and beyond to make our anniversary special!", "The atmosphere was cozy and inviting, and my steak was cooked to perfection. Definitely coming back for the chocolate lava cake!", "As someone who's tried many similar places, this one stands out for their attention to detail. The server remembered my name and drink order from my last visit!"]`;

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
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error from Gemini API:', errorData);
      throw new Error('Failed to generate suggestions');
    }

    const data = await response.json();
    const textResponse = data.candidates[0].content.parts[0].text;
    
    // Extract JSON array from the response
    try {
      const jsonMatch = textResponse.match(/\[.*\]/s);
      let suggestions = [];
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      }
      // Fallback to splitting by lines if JSON parsing fails
      if (!suggestions || suggestions.length === 0) {
        suggestions = textResponse
          .split('\n')
          .map(line => line.replace(/^[0-9]+\.\s*["']?|["']?$/g, '').trim())
          .filter(line => line.length > 10 && line.length < 150)
          .slice(0, 3);
      }
      // If still empty, use fallback suggestions
      if (!suggestions || suggestions.length === 0) {
        const { name, primaryCategory, categories } = businessData || {};
        const category = primaryCategory || categories?.primaryCategory?.name || 'business';
        return getFallbackSuggestions(rating, name, category);
      }
      return suggestions;
    } catch (e) {
      console.error('Error parsing AI response:', e);
      const { name, primaryCategory, categories } = businessData || {};
      const category = primaryCategory || categories?.primaryCategory?.name || 'business';
      return getFallbackSuggestions(rating, name, category);
    }
  } catch (error) {
    console.error('Error generating suggestions:', error);
    const { name, primaryCategory, categories } = businessData || {};
    const category = primaryCategory || categories?.primaryCategory?.name || 'business';
    return getFallbackSuggestions(rating, name, category);
  }
};

// Fallback suggestions in case the API call fails
const getFallbackSuggestions = (rating, businessName = 'this place', businessType = 'business') => {
  const suggestions = {
    5: [
      `I was blown away by my experience at ${businessName}! The ${businessType} was exceptional and the staff made me feel like a valued customer. Can't wait to come back!`,
      `Five stars isn't enough for ${businessName}! As someone who's tried many ${businessType}s, this one stands out for its amazing quality and friendly service.`,
      `I can't recommend ${businessName} enough! The attention to detail in their ${businessType} is impressive, and the staff goes above and beyond. A true gem!`
    ],
    4: [
      `I had a great experience at ${businessName}. The ${businessType} was really good and the service was friendly. Just a couple of small things could make it perfect!`,
      `${businessName} is a solid choice for ${businessType}. The quality is there and the staff is nice. I'd definitely recommend giving it a try!`,
      `I was really impressed with the ${businessType} at ${businessName}. The atmosphere was nice and the staff was attentive. Would definitely come back!`
    ],
    default: [
      `I had a decent experience at ${businessName}. The ${businessType} was okay, but nothing special. Maybe I'll try it again sometime.`,
      `The service was friendly at ${businessName}, though the ${businessType} could use some improvement. It's an okay place overall.`,
      `It was an okay experience. The ${businessType} was fine but I've had better. Might give it another try sometime.`
    ]
  };

  return suggestions[rating] || suggestions.default;
};

/**
 * Copies text to clipboard
 * @param {string} text - Text to copy
 * @param {Function} setCopied - State setter function to show copied status
 */
export const copyToClipboard = (text, setCopied) => {
  navigator.clipboard.writeText(text).then(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }).catch(err => {
    console.error('Failed to copy text: ', err);
  });
};
