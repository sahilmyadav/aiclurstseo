// POST /api/reviews/reply

import axios from "axios";
import { getBearerToken } from "./googleIntegrationController.js";

export const replyToReview = async (req, res) => {
  try {
    const { accountId, locationId, reviewId, comment } = req.body;
    const { access_token, refresh_token, expiry_date } = req.query;

    console.log("Received request body:", req.body);
    console.log("Query params:", { access_token, refresh_token, expiry_date });

    if (!accountId || !locationId || !reviewId || !comment) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: accountId, locationId, reviewId, and comment are required"
      });
    }

    // Get Google OAuth tokens from query parameters
    const tokens = {
      access_token,
      refresh_token,
      expiry_date: expiry_date ? parseInt(expiry_date) : null
    };

    if (!tokens.access_token) {
      return res.status(401).json({
        success: false,
        message: "Google OAuth tokens missing or invalid"
      });
    }

    // Get a fresh access token using the refresh token if needed
    const googleAccessToken = await getBearerToken(tokens);

    const url = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews/${reviewId}/reply`;
    const payload = { comment };

    console.log("Sending request to Google Business API:", {
      url,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${googleAccessToken}`
      },
      body: payload,
    });

    const response = await axios.put(url, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${googleAccessToken}`
      }
    });

    console.log("Google Business API response:", response.data);

    return res.status(200).json({
      success: true,
      message: "Reply posted successfully",
      data: response.data,
    });
  } catch (error) {
    console.error("Error from Google Business API:", error.response?.data || error);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Google API token expired or invalid",
        error: error.response?.data || error.message
      });
    }

    return res.status(error.response?.status || 500).json({
      success: false,
      message: "Failed to post reply",
      error: error.response?.data || error.message,
    });
  }
};
