// POST /api/reviews/reply

import axios from "axios";
export const replyToReview = async (req, res) => {
  try {
    const { accountId, locationId, reviewId, comment, accessToken } = req.body;

    console.log("Received request body:", req.body);

    const url = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews/${reviewId}/reply`;

    const payload = {
      comment, // ✅ No nested reply object
    };

    console.log("Sending request to Google Business API:", {
      url,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: payload,
    });

    const response = await axios.put(url, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log("Google Business API response:", response.data);

    return res.status(200).json({
      success: true,
      message: "Reply posted successfully",
      data: response.data,
    });
  } catch (error) {
    console.error("Error from Google Business API:", error.response?.data || error);
    return res.status(500).json({
      success: false,
      message: "Failed to post reply",
      error: error.response?.data || error.message,
    });
  }
};
