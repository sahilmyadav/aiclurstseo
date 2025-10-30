import axios from 'axios';

const GEMINI_MODEL = 'gemini-2.5-flash'; 
const API_BASE_URL = 'https://generativelanguage.googleapis.com/v1';


export const generateAuditAnalysis = async (reviews, businessName) => {
  console.log(' [AUDIT] Starting AI-powered review analysis...');
  
  
  try {
    if (!reviews || !reviews.length) {
      throw new Error('No reviews available for analysis');
    }

    const reviewData = reviews.map(review => ({
      rating: review.starRating,
      comment: review.comment || '',
      date: review.createTime || new Date().toISOString(),
      reviewer: review.reviewer?.displayName || 'Anonymous'
    }));

    const prompt = `Analyze these business reviews for ${businessName} and provide a comprehensive audit analysis. 
    The analysis should include:
    1. Overall sentiment and key themes
    2. Strengths and areas for improvement
    3. Actionable recommendations
    4. Sentiment distribution (positive/neutral/negative)
    5. Key topics mentioned in reviews
    
    Reviews to analyze (${reviewData.length} total):
    ${reviewData.map((r, i) => 
      `Review ${i + 1} (${r.rating} stars): ${r.comment.substring(0, 200)}${r.comment.length > 200 ? '...' : ''}`
    ).join('\n\n')}
    
    Please respond **ONLY** with a valid JSON object, and do not include any explanatory text or markdown formatting (e.g., no \`\`\`json\`). The JSON format must be strictly:
    {
      "overallScore": 0-100,
      "summary": "Brief summary of the analysis",
      "ratingDistribution": {"1": 0, "2": 0, "3": 0, "4": 0, "5": 0},
      "sentimentAnalysis": {"positive": "0%", "neutral": "0%", "negative": "0%"},
      "strengths": ["strength1", "strength2", ...],
      "weaknesses": ["weakness1", "weakness2", ...],
      "keyTopics": ["topic1", "topic2", ...],
      "trendAnalysis": "Analysis of trends over time",
      "priorityActions": ["action1", "action2", ...],
      "recommendations": ["recommendation1", "recommendation2", ...]
    }`;

    console.log(' [AUDIT] Sending request to Gemini API...');
    
    const apiUrl = `${API_BASE_URL}/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    const requestBody = {
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.2, // Lower temperature to encourage stricter JSON format
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048
      }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    let analysisText = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!analysisText) {
      throw new Error('No analysis content in response');
    }

    let analysis;
    try {
      let jsonString = analysisText.trim();
      
      jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();


      jsonString = jsonString.replace(/,(\s*])|,(?=\s*})/g, '$1').trim();

      
      analysis = JSON.parse(jsonString);
      
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Raw response text:', analysisText);
      // Re-throw the error with better context
      throw new Error(`Failed to parse AI analysis response: ${parseError.message}`);
    }

    const requiredFields = [
      'overallScore', 'summary', 'ratingDistribution', 
      'sentimentAnalysis', 'strengths', 'weaknesses',
      'keyTopics', 'trendAnalysis', 'priorityActions', 'recommendations'
    ];
    
    for (const field of requiredFields) {
      if (analysis[field] === undefined) {
        console.warn(`[AUDIT] Missing field in AI response: ${field}`);
        // ... (existing field default logic)
        if (field === 'ratingDistribution') analysis[field] = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
        else if (field === 'sentimentAnalysis') analysis[field] = {positive: '0%', neutral: '0%', negative: '0%'};
        else if (Array.isArray(analysis[field])) continue; 
        else analysis[field] = `No ${field} provided`;
      }
    }
    
    analysis.reviewCount = reviewData.length;
    analysis.analyzedAt = new Date().toISOString();
    analysis.businessName = businessName;
    
    console.log(' [AUDIT] Successfully generated AI analysis');
    
    return {
      success: true,
      analysis,
      reviewCount: reviewData.length,
      generatedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(' [AUDIT] Error in generateAuditAnalysis:', error.message);
    console.error('Error stack:', error.stack);
    return {
      success: false,
      error: error.message,
      analysis: null
    };
  }
};


export const getAuditAnalysis = async (req, res) => {
  console.log('🔍 [AUDIT] Received audit request:', {
    businessId: req.body.businessId,
    businessName: req.body.businessName,
    reviewCount: req.body.reviews?.length || 0
  });

  try {
    const { businessId, businessName, reviews } = req.body;

    if (!businessId || !businessName) {
      console.error(' [AUDIT] Missing required fields:', { businessId, businessName });
      return res.status(400).json({
        success: false,
        error: 'Business ID and name are required'
      });
    }

    if (!reviews || !reviews.length) {
      console.error(' [AUDIT] No reviews provided');
      return res.status(400).json({
        success: false,
        error: 'No reviews provided for analysis'
      });
    }

    console.log(' [AUDIT] Starting analysis...');
    const result = await generateAuditAnalysis(reviews, businessName);

    if (!result.success) {
      console.error(' [AUDIT] Analysis failed:', result.error);
      return res.status(503).json({ 
        success: false,
        error: result.error
      });
    }

    console.log(' [AUDIT] Analysis completed successfully',result.analysis);
    res.json({
      success: true,
      audit: result.analysis,
      reviewCount: result.reviewCount,
      generatedAt: result.generatedAt
    });

  } catch (error) {
    console.error(' [AUDIT] getAuditAnalysis error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to generate audit analysis'
    });
  }
};