import axios, { AxiosError } from 'axios';

interface RecommendationParams {
  seed_genres?: string;
  seed_artists?: string;
  seed_tracks?: string;
  limit?: number;
  market?: string;
  offset?: number;
  [key: string]: any;
}

interface Track {
  id: string;
  name: string;
  artists: Array<{
    id: string;
    name: string;
  }>;
  album: {
    id: string;
    name: string;
    images: Array<{
      url: string;
    }>;
  };
}

interface RecommendationsResponse {
  tracks: Track[];
  seeds: Array<{
    id: string;
    type: string;
  }>;
}

export const getRecommendations = async (params: RecommendationParams): Promise<RecommendationsResponse> => {
  try {
    const response = await axios.get('https://api.spotify.com/v1/recommendations', {
      params,
      headers: {
        'Authorization': `Bearer ${process.env.SPOTIFY_ACCESS_TOKEN}`
      }
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.data?.error?.message) {
          throw new Error(error.response.data.error.message);
        }
      }
      throw error;
    }
    throw new Error('Unknown error occurred');
  }
}; 