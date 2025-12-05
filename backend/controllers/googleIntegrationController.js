import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();


const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || "http://localhost:8000/auth/google/google-callback"
);

async function getBearerToken() {

  if (!global.googleTokens) {
    throw new Error("No tokens available");
  }

  const token = global.googleTokens.access_token;
  const expiryDate = global.googleTokens.expiry_date;
  if (expiryDate && Date.now() >= expiryDate) {

    if (global.googleTokens.refresh_token) {
      try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        global.googleTokens = credentials;
        return credentials.access_token;
      } catch (refreshError) {
        throw new Error("Token expired and refresh failed");
      }
    } else {
      throw new Error("Token expired and no refresh token available");
    }
  }

  return token;
}

// 🚀 Initiate Google OAuth Login
export const initiateGoogleLogin = async (req, res) => {
  const requestId = req.requestId || Date.now().toString(36);

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
  const requestId = req.requestId || Date.now().toString(36);

  try {
    const { code, error: oauthError, error_description } = req.query;

    if (oauthError) {
      throw new Error(`OAuth error: ${oauthError} - ${error_description}`);
    }

    if (!code) {
      console.error(` [${requestId}] No authorization code received`);
      throw new Error("No authorization code received");
    }


    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    console.log("userInfo",userInfo.data)
    global.googleTokens = tokens;
    global.googleUser = userInfo.data;
    const frontendUrl = process.env.FRONTEND_URL;
    const redirectUrl = `${frontendUrl}/dashboard/integrations?success=true&user=${encodeURIComponent(userInfo.data.email)}`;

    res.redirect(redirectUrl);
  } catch (error) {
    console.error(`💥 [${requestId}] OAuth callback error:`, {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });

    const frontendUrl = process.env.FRONTEND_URL;
    const errorRedirectUrl = `${frontendUrl}/integrations?error=true&message=${encodeURIComponent(error.message)}`;
    res.redirect(errorRedirectUrl);
  }
};

export const getGoogleBusinesses = async (req, res) => {
  const requestId = req.requestId || Date.now().toString(36);

  try {
    if (!global.googleTokens) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const token = await getBearerToken();
    const accountsRes = await axios.get("https://mybusinessaccountmanagement.googleapis.com/v1/accounts", {
      headers: { Authorization: `Bearer ${token}` },
    });
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
              readMask: `
                name,
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
                languageCode
                
              `.replace(/\s+/g, '')
            }
          }
        );
        const locations = locationsRes.data.locations || [];
        allLocations.push(...locations.map(loc => ({ ...loc, accountId })));
      } catch (locErr) {
        console.warn(`Failed to fetch locations for account ${accountId}:`, locErr.response?.data || locErr.message);
      }
    }
    console.log("allLocations",allLocations)
    res.json({
      user: global.googleUser,
      businesses: allLocations,
    });
  } catch (error) {
    res.status(500).json({
      user: global.googleUser || null,
      businesses: [],
      error: error.response?.data || error.message,
    });
  }
};

export const getGoogleReviews = async (req, res) => {
  const requestId = req.requestId || Date.now().toString(36);

  try {
    if (!global.googleTokens) {
      console.error(`❌ [${requestId}] Not authenticated with Google`);
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { accountId, locationId } = req.params;
    const token = await getBearerToken();

    console.log(">>>>>>>>>>>>>",token)
    const reviewsRes = await axios.get(
      `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const reviewCount = reviewsRes.data.reviews?.length || 0;
    console.log(`✅ [${requestId}] Successfully fetched ${reviewCount} reviews`);

    res.json(reviewsRes.data);
  } catch (error) {
    res.status(500).json({
      reviews: [],
      error: error.response?.data || error.message
    });
  }
};

// 📊 Check Google Integration Status
export const getGoogleStatus = async (req, res) => {
  const requestId = req.requestId || Date.now().toString(36);
  const isAuthenticated = !!global.googleTokens;
  const hasUser = !!global.googleUser;

  if (isAuthenticated && global.googleTokens.expiry_date) {
    const expiresAt = new Date(global.googleTokens.expiry_date);
    const isExpired = Date.now() >= global.googleTokens.expiry_date;
  }


  res.json({
    authenticated: isAuthenticated,
    user: global.googleUser || null,
    tokenDetails: isAuthenticated ? {
      access_token: global.googleTokens.access_token,
      refresh_token: global.googleTokens.refresh_token, // Added refresh token
      expiry_date: global.googleTokens.expiry_date,
      scope: global.googleTokens.scope
    } : null
  });
};

// 🔌 Disconnect Google Integration
export const disconnectGoogle = async (req, res) => {
  const requestId = req.requestId || Date.now().toString(36);
  const wasAuthenticated = !!global.googleTokens;
  const hadUser = !!global.googleUser;
  if (hadUser) {
    console.log(`   └─ Disconnecting user: ${global.googleUser.email}`);
  }

  global.googleTokens = null;
  global.googleUser = null;
  oauth2Client.setCredentials({});
  res.json({ message: "Disconnected successfully" });
};

// 📝 Create Google My Business Post
export const createGooglePost = async (req, res) => {
  const requestId = req.requestId || Date.now().toString(36);

  try {

    if (!global.googleTokens) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { accountId, locationId } = req.params;
    const { summary, languageCode = 'en-US', media } = req.body;
    const token = await getBearerToken();

    const postData = {
      languageCode,
      summary,
      topicType: 'STANDARD',
    };

    if (media && media.length > 0) {
      postData.media = media.map(item => ({
        mediaFormat: 'PHOTO',
        sourceUrl: item.sourceUrl,
        thumbnail: item.thumbnail || item.sourceUrl
      }));
    }
    const postRes = await axios.post(
      `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/localPosts`,
      postData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    res.json(postRes.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || error.message
    });
  }
};

// 📋 Get Google My Business Posts
export const getGooglePosts = async (req, res) => {
  const requestId = req.requestId || Date.now().toString(36);

  try {
    if (!global.googleTokens) {
      console.error(`Not authenticated with Google`);
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { accountId, locationId } = req.params;
    const { pageSize = 100, pageToken } = req.query; // Default pageSize to 100 (max allowed)
    const token = await getBearerToken();

    let url = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/localPosts`;
    const params = new URLSearchParams();

    if (pageSize) params.append('pageSize', pageSize);
    if (pageToken) params.append('pageToken', pageToken);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    console.log("token",token)

    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    res.json({
      ...response.data,
      // Include pagination info in the response
      pagination: {
        totalPosts: response.data.localPosts?.length || 0,
        nextPageToken: response.data.nextPageToken,
        hasMore: !!response.data.nextPageToken
      }
    });
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || error.message
    });
  }
};

// 📋 Get Google Posts (Alternative endpoint)
export const getGooglePostsAlt = async (req, res) => {
  const requestId = req.requestId || Date.now().toString(36);

  try {
    if (!global.googleTokens) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { accountId, locationId } = req.params;

    const token = await getBearerToken();

    const postsRes = await axios.get(
      `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/localPosts`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // const postCount = postsRes.data.localPosts?.length || 0;
    res.json(postsRes.data);
  } catch (error) {
    res.status(500).json({
      error: error.response?.data || error.message
    });
  }
};
