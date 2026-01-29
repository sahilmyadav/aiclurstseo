import axios from 'axios';
import { getBearerToken } from './googleIntegrationController.js';

// Fetch performance metrics from Google Business Profile API
export const fetchPerformanceMetrics = async (req, res) => {
  try {
    const { locationId, startDate, endDate, accessToken, refresh_token, expiry_date } = req.body;

    console.log("Fetching performance metrics with params:", {
      locationId,
      startDate,
      endDate
    });

    if (!locationId || !startDate || !endDate || !accessToken) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: locationId, startDate, endDate, and accessToken are required'
      });
    }

    // Get a fresh access token if needed
    const token = await getBearerToken({
      access_token: accessToken,
      refresh_token,
      expiry_date: expiry_date ? parseInt(expiry_date) : null
    });

    // Construct the API URL
    const apiUrl = `https://businessprofileperformance.googleapis.com/v1/locations/${locationId}:fetchMultiDailyMetricsTimeSeries`;
    
    // Prepare query parameters with ALL available metrics
    const params = new URLSearchParams();
    // Add all available metrics
    params.append('dailyMetrics', 'BUSINESS_IMPRESSIONS_DESKTOP_MAPS');
    params.append('dailyMetrics', 'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH');
    params.append('dailyMetrics', 'BUSINESS_IMPRESSIONS_MOBILE_MAPS');
    params.append('dailyMetrics', 'BUSINESS_IMPRESSIONS_MOBILE_SEARCH');
    params.append('dailyMetrics', 'BUSINESS_CONVERSATIONS');
    params.append('dailyMetrics', 'BUSINESS_DIRECTION_REQUESTS');
    params.append('dailyMetrics', 'CALL_CLICKS');
    params.append('dailyMetrics', 'WEBSITE_CLICKS');
    
    // Add start date
    params.append('dailyRange.start_date.year', startDate.year);
    params.append('dailyRange.start_date.month', startDate.month);
    params.append('dailyRange.start_date.day', startDate.day);
    
    // Add end date
    params.append('dailyRange.end_date.year', endDate.year);
    params.append('dailyRange.end_date.month', endDate.month);
    params.append('dailyRange.end_date.day', endDate.day);
    
    const url = `${apiUrl}?${params.toString()}`;
    
    // Make the API request with the token
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Process the response data to extract all metrics
    const processedData = processPerformanceMetrics(response.data);
    
    console.log("Performance Metrics Fetched Successfully");
    return res.status(200).json({
      success: true,
      data: response.data,
      processedData: processedData,
      totals: processedData.totals,
      dailyMetrics: processedData.dailyMetrics,
      metricsByType: processedData.metricsByType
    });
  } catch (error) {
    console.error('Error fetching performance metrics:', error.response?.data || error.message);
    
    return res.status(500).json({
      success: false,
      error: error.response?.data?.error?.message || 'Failed to fetch performance metrics',
      details: error.response?.data || error.message
    });
  }
};

// Process performance metrics data to extract all metrics
const processPerformanceMetrics = (responseData) => {
  const result = {
    totals: {
      views: 0,
      impressions: 0,
      calls: 0,
      websiteClicks: 0,
      directionRequests: 0,
      conversations: 0,
      desktopMapsImpressions: 0,
      desktopSearchImpressions: 0,
      mobileMapsImpressions: 0,
      mobileSearchImpressions: 0
    },
    dailyMetrics: [],
    metricsByType: {}
  };

  if (!responseData || !responseData.multiDailyMetricTimeSeries) {
    return result;
  }

  // Create a map to store daily metrics by date
  const dailyMetricsMap = new Map();

  // Process the nested structure
  responseData.multiDailyMetricTimeSeries.forEach(metricItem => {
    if (metricItem.dailyMetricTimeSeries) {
      metricItem.dailyMetricTimeSeries.forEach(dailyMetric => {
        const metricType = dailyMetric.dailyMetric;
        
        if (dailyMetric.timeSeries && dailyMetric.timeSeries.datedValues && Array.isArray(dailyMetric.timeSeries.datedValues)) {
          dailyMetric.timeSeries.datedValues.forEach(timeData => {
            const dateStr = `${timeData.date.year}-${String(timeData.date.month).padStart(2, '0')}-${String(timeData.date.day).padStart(2, '0')}`;
            const value = timeData.value ? parseInt(timeData.value, 10) : 0;

            // Initialize the date entry if it doesn't exist
            if (!dailyMetricsMap.has(dateStr)) {
              dailyMetricsMap.set(dateStr, {
                date: dateStr,
                views: 0,
                impressions: 0,
                calls: 0,
                websiteClicks: 0,
                directionRequests: 0,
                conversations: 0,
                desktopMapsImpressions: 0,
                desktopSearchImpressions: 0,
                mobileMapsImpressions: 0,
                mobileSearchImpressions: 0
              });
            }

            const dayData = dailyMetricsMap.get(dateStr);

            // Map metrics to our structure
            switch (metricType) {
              case 'BUSINESS_IMPRESSIONS_DESKTOP_MAPS':
                dayData.views += value;
                dayData.impressions += value;
                dayData.desktopMapsImpressions += value;
                result.totals.views += value;
                result.totals.impressions += value;
                result.totals.desktopMapsImpressions += value;
                break;
              case 'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH':
                dayData.impressions += value;
                dayData.desktopSearchImpressions += value;
                result.totals.impressions += value;
                result.totals.desktopSearchImpressions += value;
                break;
              case 'BUSINESS_IMPRESSIONS_MOBILE_MAPS':
                dayData.views += value;
                dayData.impressions += value;
                dayData.mobileMapsImpressions += value;
                result.totals.views += value;
                result.totals.impressions += value;
                result.totals.mobileMapsImpressions += value;
                break;
              case 'BUSINESS_IMPRESSIONS_MOBILE_SEARCH':
                dayData.impressions += value;
                dayData.mobileSearchImpressions += value;
                result.totals.impressions += value;
                result.totals.mobileSearchImpressions += value;
                break;
              case 'BUSINESS_CONVERSATIONS':
                dayData.conversations += value;
                result.totals.conversations += value;
                break;
              case 'BUSINESS_DIRECTION_REQUESTS':
                dayData.directionRequests += value;
                result.totals.directionRequests += value;
                break;
              case 'CALL_CLICKS':
                dayData.calls += value;
                result.totals.calls += value;
                break;
              case 'WEBSITE_CLICKS':
                dayData.websiteClicks += value;
                result.totals.websiteClicks += value;
                break;
            }

            // Also store metrics by type
            if (!result.metricsByType[metricType]) {
              result.metricsByType[metricType] = [];
            }
            result.metricsByType[metricType].push({
              date: dateStr,
              value: value
            });
          });
        }
      });
    }
  });

  // Convert the map to an array and sort by date
  result.dailyMetrics = Array.from(dailyMetricsMap.values())
    .sort((a, b) => new Date(a.date) - new Date(b.date));
 console.log("resut",result)
  return result;
};

// Calculate totals for the last 30 days
export const calculateLast30DaysTotals = (timeSeries) => {
  if (!timeSeries || !timeSeries.multiDailyMetricTimeSeries) {
    return { websiteClicks: 0, callClicks: 0 };
  }
  
  let websiteClicks = 0;
  let callClicks = 0;
  
  // Navigate through the nested structure
  timeSeries.multiDailyMetricTimeSeries.forEach(metricItem => {
    if (metricItem.dailyMetricTimeSeries) {
      metricItem.dailyMetricTimeSeries.forEach(dailyMetric => {
        // Handle the case where timeSeries has datedValues array
        if (dailyMetric.timeSeries && dailyMetric.timeSeries.datedValues && Array.isArray(dailyMetric.timeSeries.datedValues)) {
          dailyMetric.timeSeries.datedValues.forEach(timeData => {
            // Parse value, defaulting to 0 if not present
            const value = timeData.value ? parseInt(timeData.value, 10) : 0;
            if (dailyMetric.dailyMetric === 'WEBSITE_CLICKS') {
              websiteClicks += value;
            } else if (dailyMetric.dailyMetric === 'CALL_CLICKS') {
              callClicks += value;
            }
          });
        }
        // Handle the case where timeSeries is directly an array
        else if (Array.isArray(dailyMetric.timeSeries)) {
          dailyMetric.timeSeries.forEach(timeData => {
            // Parse value, defaulting to 0 if not present
            const value = timeData.value ? parseInt(timeData.value, 10) : 0;
            if (dailyMetric.dailyMetric === 'WEBSITE_CLICKS') {
              websiteClicks += value;
            } else if (dailyMetric.dailyMetric === 'CALL_CLICKS') {
              callClicks += value;
            }
          });
        }
        // Handle the case where timeSeries.timeSeries is the array
        else if (dailyMetric.timeSeries && dailyMetric.timeSeries.timeSeries && Array.isArray(dailyMetric.timeSeries.timeSeries)) {
          dailyMetric.timeSeries.timeSeries.forEach(timeData => {
            // Parse value, defaulting to 0 if not present
            const value = timeData.value ? parseInt(timeData.value, 10) : 0;
            if (dailyMetric.dailyMetric === 'WEBSITE_CLICKS') {
              websiteClicks += value;
            } else if (dailyMetric.dailyMetric === 'CALL_CLICKS') {
              callClicks += value;
            }
          });
        }
      });
    }
  });
  
  console.log('Calculated totals - Website:', websiteClicks, 'Calls:', callClicks);
  
  return { websiteClicks, callClicks };
};



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
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096  // Increased to handle larger responses
      }
    };

    console.log('Sending request to Gemini API with max tokens:', requestBody.generationConfig.maxOutputTokens);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error details:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log('Gemini API response received, checking for content...');
    
    let analysisText = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!analysisText) {
      console.error('No analysis content in response. Full response:', JSON.stringify(responseData, null, 2));
      throw new Error('No analysis content in response from Gemini API');
    }
    
    // Log first 500 chars of response for debugging
    console.log('Raw AI response preview:', analysisText.substring(0, 500) + (analysisText.length > 500 ? '...' : ''));

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