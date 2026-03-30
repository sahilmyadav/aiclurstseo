import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || "http://localhost:8000/api/auth/google/google-callback"
);

// ⚡️ Refresh token helper
export async function getBearerToken(tokens) {
  const { access_token, refresh_token, expiry_date } = tokens;

  if (expiry_date && Date.now() >= expiry_date) {
    if (!refresh_token) {
      throw new Error("Token expired and no refresh token available");
    }

    oauth2Client.setCredentials({ refresh_token });
    const { credentials } = await oauth2Client.refreshAccessToken();
    return credentials.access_token;
  }

  return access_token;
}

// 🚀 Initiate Google OAuth Login
export const initiateGoogleLogin = (req, res) => {
  const scopes = [
    "https://www.googleapis.com/auth/business.manage",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "openid",
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
  });

  res.redirect(authUrl);
};

// 🔄 Handle Google OAuth Callback
export const handleGoogleCallback = async (req, res) => {
  try {
    const { code, error: oauthError, error_description } = req.query;

    if (oauthError) throw new Error(`OAuth error: ${oauthError} - ${error_description}`);
    if (!code) throw new Error("No authorization code received");

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    const frontendUrl = process.env.FRONTEND_URL;
    const redirectUrl =
      `${frontendUrl}/dashboard/integrations?success=true` +
      `&email=${encodeURIComponent(userInfo.data.email)}` +
      `&access_token=${encodeURIComponent(tokens.access_token || "")}` +
      `&refresh_token=${encodeURIComponent(tokens.refresh_token || "")}` +
      `&expiry_date=${encodeURIComponent(tokens.expiry_date || "")}`;

    res.redirect(redirectUrl);
  } catch (error) {
    const redirectUrl =
      `${process.env.FRONTEND_URL}/integrations?error=true&message=${encodeURIComponent(error.message)}`;
    res.redirect(redirectUrl);
  }
};

// 📍 Get Google Business Locations
export const getGoogleBusinesses = async (req, res) => {
  try {
    const tokens = {
      access_token: req.query.access_token,
      refresh_token: req.query.refresh_token,
      expiry_date: parseInt(req.query.expiry_date)
    };

    if (!tokens.access_token) return res.status(401).json({ error: "Not authenticated" });

    const token = await getBearerToken(tokens);
    //  console.log("TOKEN HAI",token)
    const accountsRes = await axios.get(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const accounts = accountsRes.data.accounts || [];
    let allLocations = [];

    for (const account of accounts) {
      const accountId = account.name.split("/")[1];
      try {
        const locationsRes = await axios.get(
          `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${accountId}/locations`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              readMask: ` name,
                title,
                storeCode,
                metadata,
                latlng,
                phoneNumbers,
                regularHours,
                moreHours,
                specialHours,
                categories,
                websiteUri,
                storefrontAddress,
                metadata,
                languageCode`.replace(/\s+/g, "")
            }
          }
        );
        // console.log("locations >>>>>>>>>>>>",locationsRes)
        const locations = locationsRes.data.locations || [];
        // console.log("locations >>>>>>>>>>>>",locations)
        allLocations.push(...locations.map(loc => ({ ...loc, accountId })));
      } catch (locErr) { }
    }
    res.json({ businesses: allLocations });
  } catch (error) {
    res.status(500).json({
      businesses: [],
      error: error.response?.data || error.message,
    });
  }
};

// ⭐️ Get Google Reviews
export const getGoogleReviews = async (req, res) => {
  try {
    const tokens = {
      access_token: req.query.access_token,
      refresh_token: req.query.refresh_token,
      expiry_date: parseInt(req.query.expiry_date)
    };

    if (!tokens.access_token) return res.status(401).json({ error: "Not authenticated" });

    const { accountId, locationId } = req.params;
    const token = await getBearerToken(tokens);

    const reviewsRes = await axios.get(
      `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    res.json(reviewsRes.data);
  } catch (error) {
    res.status(500).json({
      reviews: [],
      error: error.response?.data || error.message,
    });
  }
};

// 📝 Create Google My Business Post
export const createGooglePost = async (req, res) => {
  try {
    const tokens = {
      access_token: req.query.access_token,
      refresh_token: req.query.refresh_token,
      expiry_date: parseInt(req.query.expiry_date)
    };

    if (!tokens.access_token) return res.status(401).json({ error: "Not authenticated" });

    const { accountId, locationId } = req.params;
    const { summary, languageCode = "en-US", media } = req.body;
    const token = await getBearerToken(tokens);

    const postData = {
      languageCode,
      summary,
      topicType: "STANDARD",
    };

    if (media?.length > 0) {
      postData.media = media.map(item => ({
        mediaFormat: "PHOTO",
        sourceUrl: item.sourceUrl,
        thumbnail: item.thumbnail || item.sourceUrl,
      }));
    }

    const postRes = await axios.post(
      `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/localPosts`,
      postData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    res.json(postRes.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || error.message,
    });
  }
};

// 📋 Get Google Posts (Paginated) with total count
export const getGooglePosts = async (req, res) => {
  try {
    const tokens = {
      access_token: req.query.access_token,
      refresh_token: req.query.refresh_token,
      expiry_date: parseInt(req.query.expiry_date)
    };

    if (!tokens.access_token) return res.status(401).json({ error: "Not authenticated" });

    const { accountId, locationId } = req.params;
    const { pageSize = 20, pageToken, countAll } = req.query;
    const token = await getBearerToken(tokens);

    const baseUrl = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/localPosts`;

    // Fetch the requested page
    const params = new URLSearchParams({ pageSize });
    if (pageToken) params.append("pageToken", pageToken);

    const response = await axios.get(`${baseUrl}?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    let totalCount = response.data.localPosts?.length || 0;

    // If countAll=true or first page (no pageToken), traverse all pages to get total count
    if (countAll === 'true' || !pageToken) {
      let nextToken = response.data.nextPageToken;
      let runningCount = totalCount;

      while (nextToken) {
        const countParams = new URLSearchParams({ pageSize: 100, pageToken: nextToken });
        const countRes = await axios.get(`${baseUrl}?${countParams}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        runningCount += countRes.data.localPosts?.length || 0;
        nextToken = countRes.data.nextPageToken;
      }

      totalCount = runningCount;
    }

    res.json({
      ...response.data,
      totalItems: totalCount,
      pagination: {
        totalPosts: totalCount,
        nextPageToken: response.data.nextPageToken,
        hasMore: !!response.data.nextPageToken,
      },
    });
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || error.message,
    });
  }
};

// 🔌 Disconnect
export const disconnectGoogle = async (req, res) => {
  res.json({ message: "Disconnected. Tokens are managed in frontend now." });
};

