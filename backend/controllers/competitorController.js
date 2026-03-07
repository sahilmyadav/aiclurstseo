import axios from 'axios';
import dotenv from 'dotenv';
import Competitor from '../models/Competitor.js';
dotenv.config();

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

    // Transform the response to a cleaner format
    const competitors = response.data.results.map(place => ({
      name: place.name,
      rating: place.rating || null,
      address: place.vicinity || place.formatted_address || 'Address not available',
      placeId: place.place_id,
      types: place.types || [],
      priceLevel: place.price_level,
      totalRatings: place.user_ratings_total,
      location: {
        lat: place.geometry?.location?.lat,
        lng: place.geometry?.location?.lng
      },
      photos: place.photos?.map(photo => ({
        photoReference: photo.photo_reference,
        width: photo.width,
        height: photo.height
      })) || []
    }));

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
