import axios from 'axios';
import dotenv from 'dotenv';
import Competitor from '../models/Competitor.js';
dotenv.config();

const toTitleCase = (str) => str.replace(/\b\w/g, c => c.toUpperCase());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Generate AI action plan by comparing business with competitors
 */
export const generateCompetitorActionPlan = async (req, res) => {
  try {
    const { businessName, businessCategory, businessRating, businessReviews, competitors } = req.body;

    if (!competitors || competitors.length === 0) {
      return res.status(400).json({ success: false, message: 'Competitors data required' });
    }

    const avgRating = (competitors.reduce((s, c) => s + (c.rating || 0), 0) / competitors.filter(c => c.rating).length).toFixed(1);
    const avgReviews = Math.round(competitors.reduce((s, c) => s + (c.totalRatings || 0), 0) / competitors.length);
    const topCompetitor = [...competitors].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
    const mostReviewed = [...competitors].sort((a, b) => (b.totalRatings || 0) - (a.totalRatings || 0))[0];

    const prompt = `You are a local business growth expert. Analyze this business vs its competitors and write a clear action plan in plain text (no JSON, no markdown, no bullet symbols).

MY BUSINESS:
- Name: ${businessName}
- Category: ${businessCategory}
- Rating: ${businessRating || 'Unknown'}
- Total Reviews: ${businessReviews || 'Unknown'}

COMPETITOR MARKET DATA:
- Total Competitors: ${competitors.length}
- Average Competitor Rating: ${avgRating}
- Average Competitor Reviews: ${avgReviews}
- Top Rated: ${topCompetitor?.name} (${topCompetitor?.rating}⭐, ${topCompetitor?.totalRatings} reviews)
- Most Reviewed: ${mostReviewed?.name} (${mostReviewed?.totalRatings} reviews)

Write 4 sections: Competitive Position, Your Strengths, Key Threats, and Top 3 Actions to grow. Keep it concise and practical.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
        })
      }
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!text) throw new Error('Empty AI response');

    res.json({ success: true, data: { text } });
  } catch (error) {
    console.error('Action plan error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get competitors near a location using Google Places API with caching
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getCompetitors = async (req, res) => {
  try {
    const { lat, lng, keyword, radius = 5000, type = 'establishment', accountId, locationId, searchType = 'business' } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    if (!accountId || !locationId) {
      return res.status(400).json({
        success: false,
        message: 'Account ID and Location ID are required for caching'
      });
    }

    const searchLat = parseFloat(lat);
    const searchLng = parseFloat(lng);

    // Check for cached competitors first
    console.log('Checking cache for competitors:', { accountId, locationId, searchType, lat: searchLat, lng: searchLng });

    const cachedCompetitors = await Competitor.findCachedCompetitors(
      accountId,
      locationId,
      searchType,
      searchLat,
      searchLng,
      parseInt(radius)
    );

    if (cachedCompetitors) {
      console.log('Returning cached competitors, expires:', cachedCompetitors.expiresAt);
      return res.json({
        success: true,
        data: {
          competitors: cachedCompetitors.competitors,
          totalResults: cachedCompetitors.competitors.length,
          searchLocation: cachedCompetitors.searchLocation,
          cached: true,
          cachedAt: cachedCompetitors.lastFetched,
          expiresAt: cachedCompetitors.expiresAt
        }
      });
    }

    console.log('No cache found, fetching from API...');

    const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'Google Places API key not configured'
      });
    }

    // Construct the Google Places API URL
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`;

    const params = {
      location: `${searchLat},${searchLng}`,
      radius: radius || 20000, // Default to 20km if not specified
      type: type,
      key: apiKey
    };

    // If keyword is provided, use it for more specific search
    if (keyword) {
      params.keyword = keyword;
    }

    console.log('Making Google Places API request with params:', {
      ...params,
      key: '[REDACTED]'
    });

    const response = await axios.get(url, { params });

    if (response.data.status !== 'OK') {
      console.error('Google Places API error:', response.data);
      return res.status(400).json({
        success: false,
        message: `Google Places API error: ${response.data.status}`,
        error: response.data.error_message
      });
    }

    // Fetch detailed info for each competitor using Place Details API
    console.log(`Fetching details for ${response.data.results.length} competitors...`);
    
    const detailsPromises = response.data.results.map(async (place) => {
      try {
        // Fetch place details using legacy API
        const detailsResponse = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
          params: {
            place_id: place.place_id,
            fields: 'name,rating,formatted_address,formatted_phone_number,website,opening_hours,types,photos,business_status,price_level,user_ratings_total,geometry,reviews',
            key: apiKey
          }
        });

        const details = detailsResponse.data.result || {};
        
        // Try to get total photo count from New Places API
        let totalPhotosCount = (details.photos || place.photos || []).length;
        try {
          const newApiResponse = await axios.get(`https://places.googleapis.com/v1/places/${place.place_id}`, {
            headers: {
              'X-Goog-Api-Key': apiKey,
              'X-Goog-FieldMask': 'photos'
            }
          });
          if (newApiResponse.data.photos) {
            totalPhotosCount = newApiResponse.data.photos.length;
          }
        } catch (newApiError) {
          console.log(`New API failed for ${place.name}, using legacy count`);
        }
        
        // Extract primary category from types (filter out generic ones)
        const genericTypes = ['point_of_interest', 'establishment', 'food', 'store', 'health', 'finance', 'place_of_worship', 'premise'];
        const types = details.types || place.types || [];
        const primaryCategory = types.find(t => !genericTypes.includes(t)) || types[0] || null;

        return {
          name: details.name || place.name,
          rating: details.rating || place.rating || null,
          address: details.formatted_address || place.vicinity || 'Address not available',
          placeId: place.place_id,
          types,
          primaryCategory,
          categories: {
            primaryCategory: primaryCategory ? {
              displayName: primaryCategory.replace(/_/g, ' '),
              name: primaryCategory
            } : null,
            additionalCategories: types
              .filter(t => !genericTypes.includes(t) && t !== primaryCategory)
              .map(t => ({ displayName: t.replace(/_/g, ' '), name: t }))
          },
          phoneNumbers: {
            primaryPhone: details.formatted_phone_number || null
          },
          websiteUri: details.website || null,
          regularHours: details.opening_hours?.periods ? {
            periods: details.opening_hours.periods.map(p => ({
              openDay: ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'][p.open?.day ?? 0],
              openTime: { 
                hours: parseInt((p.open?.time || '0000').slice(0, 2)), 
                minutes: parseInt((p.open?.time || '0000').slice(2)) 
              },
              closeDay: ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'][p.close?.day ?? p.open?.day ?? 0],
              closeTime: { 
                hours: parseInt((p.close?.time || '0000').slice(0, 2)), 
                minutes: parseInt((p.close?.time || '0000').slice(2)) 
              }
            })),
            weekdayText: details.opening_hours.weekday_text || []
          } : null,
          businessStatus: details.business_status || null,
          priceLevel: details.price_level ?? place.price_level,
          totalRatings: details.user_ratings_total || place.user_ratings_total,
          location: {
            lat: details.geometry?.location?.lat ?? place.geometry?.location?.lat,
            lng: details.geometry?.location?.lng ?? place.geometry?.location?.lng
          },
          photos: (details.photos || place.photos || []).slice(0, 10).map(photo => ({
            photoReference: photo.photo_reference,
            width: photo.width,
            height: photo.height
          })),
          totalPhotos: totalPhotosCount,
          reviews: (details.reviews || []).slice(0, 5).map(review => ({
            authorName: review.author_name,
            rating: review.rating,
            text: review.text,
            time: review.time,
            relativeTimeDescription: review.relative_time_description,
            profilePhotoUrl: review.profile_photo_url
          })),
          totalReviews: details.user_ratings_total || place.user_ratings_total || 0
        };
      } catch (detailError) {
        console.error(`Error fetching details for ${place.name}:`, detailError.message);
        // Fallback to basic data if details fetch fails
        const types = place.types || [];
        const genericTypes = ['point_of_interest', 'establishment', 'food', 'store', 'health', 'finance', 'place_of_worship', 'premise'];
        const primaryCategory = types.find(t => !genericTypes.includes(t)) || types[0] || null;
        
        return {
          name: place.name,
          rating: place.rating || null,
          address: place.vicinity || 'Address not available',
          placeId: place.place_id,
          types,
          primaryCategory,
          categories: {
            primaryCategory: primaryCategory ? {
              displayName: primaryCategory.replace(/_/g, ' '),
              name: primaryCategory
            } : null,
            additionalCategories: []
          },
          phoneNumbers: { primaryPhone: null },
          websiteUri: null,
          regularHours: null,
          businessStatus: null,
          priceLevel: place.price_level,
          totalRatings: place.user_ratings_total,
          location: {
            lat: place.geometry?.location?.lat,
            lng: place.geometry?.location?.lng
          },
          photos: (place.photos || []).map(photo => ({
            photoReference: photo.photo_reference,
            width: photo.width,
            height: photo.height
          })),
          totalPhotos: (place.photos || []).length,
          reviews: [], // No reviews in fallback
          totalReviews: place.user_ratings_total || 0
        };
      }
    });

    const competitors = await Promise.all(detailsPromises);
    console.log(`Successfully fetched details for ${competitors.length} competitors`);

    // Save to cache
    const competitorCache = new Competitor({
      accountId,
      locationId,
      searchType,
      keyword: keyword || '',
      competitors,
      searchLocation: { lat: searchLat, lng: searchLng },
      lastFetched: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    try {
      await competitorCache.save();
      console.log('Competitors saved to cache successfully');
    } catch (cacheError) {
      console.error('Error saving to cache:', cacheError);
      // Don't fail the request if caching fails
    }

    res.json({
      success: true,
      data: {
        competitors,
        totalResults: competitors.length,
        searchLocation: { lat: searchLat, lng: searchLng },
        cached: false
      }
    });

  } catch (error) {
    console.error('Error fetching competitors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch competitors',
      error: error.message
    });
  }
};

/**
 * Get detailed information about a specific place
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getPlaceDetails = async (req, res) => {
  try {
    const { placeId } = req.params;

    if (!placeId) {
      return res.status(400).json({
        success: false,
        message: 'Place ID is required'
      });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'Google Places API key not configured'
      });
    }

    const url = `https://maps.googleapis.com/maps/api/place/details/json`;

    const response = await axios.get(url, {
      params: {
        place_id: placeId,
        key: apiKey,
        fields: 'name,rating,formatted_address,formatted_phone_number,website,opening_hours,reviews,price_level,user_ratings_total'
      }
    });

    if (response.data.status !== 'OK') {
      return res.status(400).json({
        success: false,
        message: `Google Places API error: ${response.data.status}`,
        error: response.data.error_message
      });
    }

    res.json({
      success: true,
      data: response.data.result
    });

  } catch (error) {
    console.error('Error fetching place details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch place details',
      error: error.message
    });
  }
};
