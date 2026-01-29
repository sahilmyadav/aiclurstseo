import { google } from "googleapis";
import axios from "axios";

// 🔄 Get Media Items from Google Business Profile
// This function handles fetching media items for a specific location
export const getGoogleMedia = async (req, res) => {
  try {
    const tokens = {
      access_token: req.query.access_token,
      refresh_token: req.query.refresh_token,
      expiry_date: parseInt(req.query.expiry_date)
    };

    if (!tokens.access_token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { accountId, locationId } = req.params;
    const token = await getBearerToken(tokens);

    // Fetch media items
    const mediaRes = await axios.get(
      `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/media`,
      { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: {
          pageSize: req.query.pageSize || 50,
          pageToken: req.query.pageToken || ''
        }
      }
    );

    res.json({
      mediaItems: mediaRes.data.mediaItems || [],
      nextPageToken: mediaRes.data.nextPageToken || null,
      totalMediaItems: mediaRes.data.totalMediaItems || 0
    });
  } catch (error) {
    console.error('Error fetching Google media:', error);
    res.status(500).json({
      error: error.response?.data?.error?.message || error.message,
      details: error.response?.data?.error?.details
    });
  }
};

// 🔄 Get a specific media item by ID
// export const getMediaItem = async (req, res) => {
//   try {
//     const tokens = {
//       access_token: req.query.access_token,
//       refresh_token: req.query.refresh_token,
//       expiry_date: parseInt(req.query.expiry_date)
//     };

//     if (!tokens.access_token) {
//       return res.status(401).json({ error: "Not authenticated" });
//     }

//     const { accountId, locationId, mediaId } = req.params;
//     const token = await getBearerToken(tokens);

//     const mediaRes = await axios.get(
//       `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/media/${mediaId}`,
//       { 
//         headers: { 
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       }
//     );

//     res.json(mediaRes.data);
//   } catch (error) {
//     console.error('Error fetching media item:', error);
//     res.status(500).json({
//       error: error.response?.data?.error?.message || error.message,
//       details: error.response?.data?.error?.details
//     });
//   }
// };

// Helper function to get bearer token (duplicated from googleIntegrationController)
async function getBearerToken(tokens) {
  const { access_token, refresh_token, expiry_date } = tokens;
  const OAuth2Client = (await import('google-auth-library')).OAuth2Client;
  
  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || "http://localhost:8000/auth/google/google-callback"
  );

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
