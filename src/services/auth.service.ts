import axios from 'axios';

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

export const loginWithSpotify = async (authCode) => {
  try {
    // Input validation
    if (!authCode) {
      throw new Error('Authorization code is required');
    }

    // Create request parameters
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', authCode);
    params.append('redirect_uri', REDIRECT_URI);

    // Create Basic Auth header
    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

    // Make request to Spotify
    const response = await axios.post(SPOTIFY_TOKEN_URL, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`
      },
      timeout: 5000 // 5 seconds timeout
    });

    // Store tokens in localStorage
    localStorage.setItem('spotify_access_token', response.data.access_token);
    localStorage.setItem('spotify_refresh_token', response.data.refresh_token);

    return response.data;
  } catch (error) {
    // Handle specific error cases
    if (error.response) {
      const { data, status } = error.response;
      
      // Handle rate limiting
      if (status === 429) {
        throw new Error('Rate limit exceeded');
      }

      // Handle server errors
      if (status >= 500) {
        throw new Error(data.error_description || 'Server error occurred');
      }

      // Handle authentication errors
      if (data.error_description) {
        throw new Error(data.error_description);
      }
    }

    // Handle network errors
    if (error.code === 'ECONNABORTED') {
      throw new Error('Network timeout');
    }

    // Handle other errors
    throw error;
  }
};

export const refreshSpotifyToken = async (refreshToken) => {
  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refreshToken);

    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

    const response = await axios.post(SPOTIFY_TOKEN_URL, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`
      }
    });

    localStorage.setItem('spotify_access_token', response.data.access_token);
    if (response.data.refresh_token) {
      localStorage.setItem('spotify_refresh_token', response.data.refresh_token);
    }

    return response.data;
  } catch (error) {
    if (error.response?.data?.error_description) {
      throw new Error(error.response.data.error_description);
    }
    throw error;
  }
}; 