import { getRecommendations } from '../services/api.recommendations';
import axios, { AxiosResponse, AxiosHeaders, InternalAxiosRequestConfig } from 'axios';

// Mock axios
jest.mock('axios');

describe('Spotify Recommendations API Tests', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should return recommendations when request successful', async () => {
    // Prepare mock response
    const mockRecommendations: AxiosResponse = {
      data: {
        tracks: [
          {
            id: '1234',
            name: 'Test Track',
            artists: [{ id: '5678', name: 'Test Artist' }],
            album: {
              id: '91011',
              name: 'Test Album',
              images: [{ url: 'test-image-url' }]
            }
          }
        ],
        seeds: [
          { id: 'genre-seed', type: 'GENRE' }
        ]
      },
      status: 200,
      statusText: 'OK',
      headers: new AxiosHeaders(),
      config: {
        headers: new AxiosHeaders()
      } as InternalAxiosRequestConfig
    };

    // Mock axios response
    (axios.get as jest.Mock).mockResolvedValue(mockRecommendations);

    // Test parameters
    const params = {
      seed_genres: 'rock,pop',
      limit: 20,
      market: 'US'
    };

    const result = await getRecommendations(params);

    // Verify results
    expect(result).toEqual(mockRecommendations.data);
    expect(axios.get).toHaveBeenCalledWith(
      'https://api.spotify.com/v1/recommendations',
      {
        params,
        headers: {
          'Authorization': expect.stringContaining('Bearer ')
        }
      }
    );
  });

  it('should handle empty recommendations', async () => {
    // Mock empty response
    const mockEmptyResponse: AxiosResponse = {
      data: {
        tracks: [],
        seeds: []
      },
      status: 200,
      statusText: 'OK',
      headers: new AxiosHeaders(),
      config: {
        headers: new AxiosHeaders()
      } as InternalAxiosRequestConfig
    };

    (axios.get as jest.Mock).mockResolvedValue(mockEmptyResponse);

    const result = await getRecommendations({ limit: 0 });

    expect(result.tracks).toHaveLength(0);
    expect(result.seeds).toHaveLength(0);
  });

  it('should throw error when request fails', async () => {
    // Mock API error - 创建一个更符合 Axios 错误结构的模拟对象
    const mockError = new Error('Invalid seed genres') as any;
    mockError.isAxiosError = true;
    mockError.response = {
      data: {
        error: {
          status: 400,
          message: 'Invalid seed genres'
        }
      },
      status: 400,
      statusText: 'Bad Request',
      headers: new AxiosHeaders(),
      config: {
        headers: new AxiosHeaders()
      } as InternalAxiosRequestConfig
    };

    (axios.get as jest.Mock).mockRejectedValue(mockError);

    await expect(getRecommendations({
      seed_genres: 'invalid_genre'
    })).rejects.toThrow('Invalid seed genres');
  });

  it('should throw error on network failure', async () => {
    const mockError = new Error('Network Error');
    Object.assign(mockError, { isAxiosError: true });
    (axios.get as jest.Mock).mockRejectedValue(mockError);

    await expect(getRecommendations({}))
      .rejects
      .toThrow('Network Error');
  });

  it('should handle pagination parameters', async () => {
    const mockResponse: AxiosResponse = {
      data: {
        tracks: [],
        seeds: []
      },
      status: 200,
      statusText: 'OK',
      headers: new AxiosHeaders(),
      config: {
        headers: new AxiosHeaders()
      } as InternalAxiosRequestConfig
    };

    (axios.get as jest.Mock).mockResolvedValue(mockResponse);

    const params = {
      limit: 50,
      offset: 10
    };

    await getRecommendations(params);

    expect(axios.get).toHaveBeenCalledWith(
      'https://api.spotify.com/v1/recommendations',
      {
        params,
        headers: expect.any(Object)
      }
    );
  });

  it('should handle authorization error', async () => {
    // Mock auth error
    const mockError = new Error('Invalid access token') as any;
    mockError.isAxiosError = true;
    mockError.response = {
      data: {
        error: {
          status: 401,
          message: 'Invalid access token'
        }
      },
      status: 401,
      statusText: 'Unauthorized',
      headers: new AxiosHeaders(),
      config: {
        headers: new AxiosHeaders()
      } as InternalAxiosRequestConfig
    };

    (axios.get as jest.Mock).mockRejectedValue(mockError);

    await expect(getRecommendations({
      seed_genres: 'rock'
    })).rejects.toThrow('Invalid access token');

    // 验证请求中包含了授权头
    expect(axios.get).toHaveBeenCalledWith(
      'https://api.spotify.com/v1/recommendations',
      expect.objectContaining({
        headers: {
          'Authorization': `Bearer ${process.env.SPOTIFY_ACCESS_TOKEN}`
        }
      })
    );
  });

  it('should handle missing access token', async () => {
    // 临时保存原始 token
    const originalToken = process.env.SPOTIFY_ACCESS_TOKEN;
    // 删除 token
    delete process.env.SPOTIFY_ACCESS_TOKEN;

    const mockError = new Error('No token provided') as any;
    mockError.isAxiosError = true;
    mockError.response = {
      data: {
        error: {
          status: 401,
          message: 'No token provided'
        }
      },
      status: 401,
      statusText: 'Unauthorized',
      headers: new AxiosHeaders(),
      config: {
        headers: new AxiosHeaders()
      } as InternalAxiosRequestConfig
    };

    (axios.get as jest.Mock).mockRejectedValue(mockError);

    await expect(getRecommendations({
      seed_genres: 'rock'
    })).rejects.toThrow('No token provided');

    // 恢复原始 token
    process.env.SPOTIFY_ACCESS_TOKEN = originalToken;
  });
}); 