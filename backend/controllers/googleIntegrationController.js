import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

// OAuth2 Client Configuration
// console.log('🔧 Google OAuth Configuration:');
// console.log('   └─ Client ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing');
// console.log('   └─ Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing');
// console.log('   └─ Redirect URI:', process.env.GOOGLE_REDIRECT_URI || 'http://localhost:8000/auth/google/google-callback');

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || "http://localhost:8000/auth/google/google-callback"
);

// Helper function to get valid bearer token
async function getBearerToken() {
  // console.log('🔑 Retrieving Google access token...');
  
  if (!global.googleTokens) {
    // console.error('❌ No Google tokens available');
    throw new Error("No tokens available");
  }
  
  const token = global.googleTokens.access_token;
  const expiryDate = global.googleTokens.expiry_date;
  
  if (expiryDate && Date.now() >= expiryDate) {
    // console.warn('⚠️  Access token has expired');
    // console.log('   └─ Expired at:', new Date(expiryDate).toISOString());
    
    if (global.googleTokens.refresh_token) {
      // console.log('🔄 Attempting to refresh token...');
      try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        global.googleTokens = credentials;
        // console.log('✅ Token refreshed successfully');
        return credentials.access_token;
      } catch (refreshError) {
        console.error('❌ Failed to refresh token:', refreshError.message);
        throw new Error("Token expired and refresh failed");
      }
    } else {
      console.error('❌ No refresh token available');
      throw new Error("Token expired and no refresh token available");
    }
  }
  
  console.log('✅ Valid access token retrieved');
  return token;
}

// 🚀 Initiate Google OAuth Login
export const initiateGoogleLogin = async (req, res) => {
  const requestId = req.requestId || Date.now().toString(36);
  // console.log(`🚀 [${requestId}] Google OAuth Login initiated`);
  // console.log(`   └─ IP: ${req.ip}`);
  // console.log(`   └─ User-Agent: ${req.get('User-Agent')?.substring(0, 100) || 'Unknown'}`);
  
  const scopes = [
    "https://www.googleapis.com/auth/business.manage",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "openid",
  ];
  
  console.log(`   └─ Requested scopes: ${scopes.join(', ')}`);
  
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
  });
  
  // console.log(`🔗 [${requestId}] Generated auth URL (length: ${authUrl.length})`);
  // console.log(`   └─ Redirecting to Google OAuth...`);
  
  res.redirect(authUrl);
};

// 🔄 Handle Google OAuth Callback
export const handleGoogleCallback = async (req, res) => {
  const requestId = req.requestId || Date.now().toString(36);
  console.log(`🔄 [${requestId}] Google OAuth callback received`);
  console.log(`   └─ IP: ${req.ip}`);
  console.log(`   └─ Query params: ${Object.keys(req.query).join(', ')}`);
  
  try {
    const { code, error: oauthError, error_description } = req.query;
    
    if (oauthError) {
      // console.error(`❌ [${requestId}] OAuth error from Google:`);
      // console.error(`   └─ Error: ${oauthError}`);
      // console.error(`   └─ Description: ${error_description || 'No description'}`);
      throw new Error(`OAuth error: ${oauthError} - ${error_description}`);
    }
    
    if (!code) {
      console.error(`❌ [${requestId}] No authorization code received`);
      throw new Error("No authorization code received");
    }
    
    // console.log(`✅ [${requestId}] Authorization code received (length: ${code.length})`);
    // console.log(`🔄 [${requestId}] Exchanging code for tokens...`);

    const { tokens } = await oauth2Client.getToken(code);
    // console.log(`✅ [${requestId}] Tokens received:`);
    // console.log(`   └─ Access token: ${tokens.access_token ? 'Present' : 'Missing'}`);
    // console.log(`   └─ Refresh token: ${tokens.refresh_token ? 'Present' : 'Missing'}`);
    // console.log(`   └─ Expires in: ${tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : 'Unknown'}`);
    
    oauth2Client.setCredentials(tokens);

    console.log(`🔄 [${requestId}] Fetching user information...`);
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    
    // console.log(`👤 [${requestId}] User information retrieved:`);
    // console.log(`   └─ Email: ${userInfo.data.email}`);
    // console.log(`   └─ Name: ${userInfo.data.name}`);
    // console.log(`   └─ ID: ${userInfo.data.id}`);
    // console.log(`   └─ Verified email: ${userInfo.data.verified_email}`);

    global.googleTokens = tokens;
    global.googleUser = userInfo.data;
    
    console.log(`💾 [${requestId}] User data stored globally`);

    const frontendUrl = process.env.FRONTEND_URL;
    const redirectUrl = `${frontendUrl}/dashboard/integrations?success=true&user=${encodeURIComponent(userInfo.data.email)}`;
    
    // console.log(`🔗 [${requestId}] Redirecting to frontend:`);
    // console.log(`   └─ URL: ${redirectUrl}`);
    
    res.redirect(redirectUrl);
  } catch (error) {
    console.error(`💥 [${requestId}] OAuth callback error:`, {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    
    const frontendUrl = process.env.FRONTEND_URL;
    const errorRedirectUrl = `${frontendUrl}/integrations?error=true&message=${encodeURIComponent(error.message)}`;
    
    // console.log(`🔗 [${requestId}] Redirecting to frontend with error:`);
    // console.log(`   └─ URL: ${errorRedirectUrl}`);
    
    res.redirect(errorRedirectUrl);
  }
};

// 🏢 Get Google My Business Locations
export const getGoogleBusinesses = async (req, res) => {
  const requestId = req.requestId || Date.now().toString(36);
  
  try {
    console.log(`🏢 [${requestId}] Fetching Google businesses...`);
    
    if (!global.googleTokens) {
      console.error(`❌ [${requestId}] Not authenticated with Google`);
      return res.status(401).json({ error: "Not authenticated" });
    }

    const token = await getBearerToken();
    // console.log(`🔑 [${requestId}] Token retrieved successfully`);

    // console.log(`📡 [${requestId}] Fetching Google My Business accounts...`);
    const accountsRes = await axios.get("https://mybusinessaccountmanagement.googleapis.com/v1/accounts", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const accounts = accountsRes.data.accounts || [];
    // console.log(`✅ [${requestId}] Found ${accounts.length} accounts`);

    let allLocations = [];
    for (const account of accounts) {
      const accountId = account.name.split("/")[1]; 
      console.log(`📍 [${requestId}] Fetching locations for account: ${accountId}`);
      
      try {
        const locationsRes = await axios.get(
          `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${accountId}/locations`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              readMask: "name,title,storeCode,metadata,latlng,phoneNumbers,regularHours",
            },
          }
        );
        const locations = locationsRes.data.locations || [];
        // console.log(`✅ [${requestId}] Found ${locations.length} locations for account ${accountId}`);
        allLocations.push(...locations.map(loc => ({ ...loc, accountId })));
      } catch (locErr) {
        console.warn(`⚠️ [${requestId}] Failed to fetch locations for account ${accountId}:`, locErr.response?.data || locErr.message);
      }
    }

    console.log(`🎉 [${requestId}] Total locations found: ${allLocations.length}`);
    res.json({
      user: global.googleUser,
      businesses: allLocations,
    });
  } catch (error) {
    console.error(`💥 [${requestId}] Error fetching businesses:`, error.response?.data || error.message);
    res.status(500).json({
      user: global.googleUser || null,
      businesses: [],
      error: error.response?.data || error.message,
    });
  }
};

// ⭐ Get Google Reviews for a Location
export const getGoogleReviews = async (req, res) => {
  const requestId = req.requestId || Date.now().toString(36);
  
  try {
    // console.log(`⭐ [${requestId}] Fetching Google reviews...`);
    
    if (!global.googleTokens) {
      console.error(`❌ [${requestId}] Not authenticated with Google`);
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { accountId, locationId } = req.params;
    console.log(`📍 [${requestId}] Account: ${accountId}, Location: ${locationId}`);
    
    const token = await getBearerToken();

    console.log(`📡 [${requestId}] Fetching reviews from Google My Business API...`);
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
    console.error(`💥 [${requestId}] Error fetching reviews:`, error.response?.data || error.message);
    res.status(500).json({ 
      reviews: [], 
      error: error.response?.data || error.message 
    });
  }
};

// 📊 Check Google Integration Status
export const getGoogleStatus = async (req, res) => {
  const requestId = req.requestId || Date.now().toString(36);
  // console.log(`📊 [${requestId}] Google auth status check`);
  
  const isAuthenticated = !!global.googleTokens;
  const hasUser = !!global.googleUser;
  
  // console.log(`   └─ Authenticated: ${isAuthenticated}`);
  // console.log(`   └─ User data: ${hasUser ? 'Present' : 'Missing'}`);
  
  if (isAuthenticated && global.googleTokens.expiry_date) {
    const expiresAt = new Date(global.googleTokens.expiry_date);
    const isExpired = Date.now() >= global.googleTokens.expiry_date;
    // console.log(`   └─ Token expires: ${expiresAt.toISOString()}`);
    // console.log(`   └─ Token expired: ${isExpired}`);
  }
  
  // if (hasUser) {
  //   console.log(`   └─ User email: ${global.googleUser.email}`);
  // }
  
  res.json({
    authenticated: isAuthenticated,
    user: global.googleUser || null,
  });
};

// 🔌 Disconnect Google Integration
export const disconnectGoogle = async (req, res) => {
  const requestId = req.requestId || Date.now().toString(36);
  console.log(`🔌 [${requestId}] Google OAuth disconnect requested`);
  console.log(`   └─ IP: ${req.ip}`);
  
  const wasAuthenticated = !!global.googleTokens;
  const hadUser = !!global.googleUser;
  
  console.log(`   └─ Was authenticated: ${wasAuthenticated}`);
  console.log(`   └─ Had user data: ${hadUser}`);
  
  if (hadUser) {
    console.log(`   └─ Disconnecting user: ${global.googleUser.email}`);
  }
  
  global.googleTokens = null;
  global.googleUser = null;
  oauth2Client.setCredentials({});
  
  console.log(`✅ [${requestId}] Google OAuth disconnected successfully`);
  
  res.json({ message: "Disconnected successfully" });
};

// 📝 Create Google My Business Post
export const createGooglePost = async (req, res) => {
  const requestId = req.requestId || Date.now().toString(36);
  
  try {
    console.log(`📝 [${requestId}] Creating Google My Business post...`);
    
    if (!global.googleTokens) {
      console.error(`❌ [${requestId}] Not authenticated with Google`);
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { accountId, locationId } = req.params;
    const { summary, languageCode = 'en-US', media } = req.body;
    console.log(`📍 [${requestId}] Account: ${accountId}, Location: ${locationId}`);
    console.log(`📄 [${requestId}] Post summary length: ${summary?.length || 0} characters`);
    
    const token = await getBearerToken();

    const postData = {
      languageCode,
      summary,
      topicType: 'STANDARD',
    };

    if (media && media.length > 0) {
      console.log(`🖼️ [${requestId}] Adding ${media.length} media items to post`);
      postData.media = media.map(item => ({
        mediaFormat: 'PHOTO',
        sourceUrl: item.sourceUrl,
        thumbnail: item.thumbnail || item.sourceUrl
      }));
    }

    console.log(`📝 [${requestId}] Post data prepared:`, JSON.stringify(postData, null, 2));
    
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

    console.log(`✅ [${requestId}] Post created successfully:`, postRes.data);
    res.json(postRes.data);
  } catch (error) {
    console.error(`💥 [${requestId}] Error creating post:`, error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      error: error.response?.data?.error || error.message 
    });
  }
};

// 📋 Get Google My Business Posts
export const getGooglePosts = async (req, res) => {
  const requestId = req.requestId || Date.now().toString(36);
  
  try {
    console.log(`📋 [${requestId}] Fetching Google My Business posts...`);
    
    if (!global.googleTokens) {
      console.error(`❌ [${requestId}] Not authenticated with Google`);
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { accountId, locationId } = req.params;
    console.log(`📍 [${requestId}] Account: ${accountId}, Location: ${locationId}`);
    
    const token = await getBearerToken();
    
    const response = await axios.get(
      `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/localPosts`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const postCount = response.data.localPosts?.length || 0;
    console.log(`✅ [${requestId}] Successfully fetched ${postCount} posts`);
    res.json(response.data);
  } catch (error) {
    console.error(`💥 [${requestId}] Error fetching posts:`, error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      error: error.response?.data?.error || error.message 
    });
  }
};

// 📋 Get Google Posts (Alternative endpoint)
export const getGooglePostsAlt = async (req, res) => {
  const requestId = req.requestId || Date.now().toString(36);
  
  try {
    console.log(`📋 [${requestId}] Fetching Google posts (alternative endpoint)...`);
    
    if (!global.googleTokens) {
      console.error(`❌ [${requestId}] Not authenticated with Google`);
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { accountId, locationId } = req.params;
    console.log(`📍 [${requestId}] Account: ${accountId}, Location: ${locationId}`);
    
    const token = await getBearerToken();

    const postsRes = await axios.get(
      `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/localPosts`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const postCount = postsRes.data.localPosts?.length || 0;
    console.log(`✅ [${requestId}] Successfully fetched ${postCount} posts`);
    res.json(postsRes.data);
  } catch (error) {
    console.error(`💥 [${requestId}] Error fetching posts:`, error.response?.data || error.message);
    res.status(500).json({ 
      error: error.response?.data || error.message 
    });
  }
};
