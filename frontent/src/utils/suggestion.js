// Using Vite environment variables
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/**
 * Generates AI-powered review suggestions for a business
 * @param {Object} businessData - Business data from GoogleBusinessContext
 * @param {number} rating - The rating (1-5) for which to generate suggestions
 * @param {Array} existingReviews - Array of existing reviews for context
 * @returns {Promise<Array<string>>} - Array of generated review suggestions
 */
export const generateReviewSuggestions = async (businessData, rating, existingReviews = []) => {
  try {
    const { name, primaryCategory, location, websiteUri, regularHours, priceInfo } = businessData;
    
    // Prepare the prompt for Gemini
    const isHighRating = rating >= 4;
    const prompt = `Generate 3 unique and natural-sounding ${rating}-star review suggestions for a business with the following details:
    
Business Name: ${name || 'a local business'}
Category: ${primaryCategory || 'various services'}
Location: ${location?.address?.locality || ''}, ${location?.address?.regionCode || ''}
Website: ${websiteUri || 'Not specified'}
Price Level: ${priceInfo?.priceLevel ? '$'.repeat(parseInt(priceInfo.priceLevel)) : 'Not specified'}

Existing reviews to learn from (but don't copy directly):
${existingReviews.slice(0, 3).map((r, i) => `${i + 1}. "${r.comment}"`).join('\n')}

Guidelines for generating reviews:
1. Keep each suggestion between 10-20 words
2. Make them sound natural and human-like
3. Vary the tone and focus (e.g., service, quality, atmosphere, specific menu items/features)
4. For ${rating}-star reviews, focus on highlighting what makes this business stand out
5. Include specific, positive details that would be relevant to this type of business
6. For 4-star reviews: mention any minor areas for improvement while maintaining an overall positive tone
7. For 5-star reviews: emphasize exceptional experiences and what makes this business worth the perfect score
8. Return ONLY a valid JSON array of 3 strings, no other text

Example format:
["Great service and friendly staff!", "The quality of the products exceeded my expectations.", "Lovely atmosphere and excellent customer service."]`;

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
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      // Fallback to splitting by lines if JSON parsing fails
      return textResponse
        .split('\n')
        .map(line => line.replace(/^[0-9]+\.\s*["']?|["']?$/g, '').trim())
        .filter(line => line.length > 10 && line.length < 150)
        .slice(0, 3);
    } catch (e) {
      console.error('Error parsing AI response:', e);
      return getFallbackSuggestions(rating);
    }
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return getFallbackSuggestions(rating);
  }
};

// Fallback suggestions in case the API call fails
const getFallbackSuggestions = (rating) => {
  const suggestions = {
    5: [
      "Absolutely outstanding in every way! The attention to detail and exceptional service made this a memorable experience. Will be telling all my friends!",
      "Perfection from start to finish! The quality exceeded my expectations and the staff made us feel truly valued. Can't wait to return!",
      "This place sets the gold standard! Every aspect was flawless - the service, atmosphere, and quality were all 10/10. A must-visit!"
    ],
    4: [
      "Really impressed with the overall experience! The food was delicious and the service was excellent. Only minor suggestion would be more vegetarian options.",
      "Great place with a wonderful atmosphere! The staff was attentive and friendly. The only thing keeping it from 5 stars was the slightly long wait time.",
      "Had a fantastic time! The quality was top-notch and the service was great. Would love to see more variety in the menu next time."
    ],
    default: [
      "Good experience overall with friendly service.",
      "Pleasant atmosphere and decent quality.",
      "Worth a try if you're in the area."
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
