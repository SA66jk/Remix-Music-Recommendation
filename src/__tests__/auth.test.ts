import axios from 'axios';
import { authenticateUser } from '../services/auth';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Authentication Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should authenticate successfully', async () => {
    const mockResponse = {
      data: {
        access_token: 'test_token',
        token_type: 'Bearer',
        expires_in: 3600
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    };

    mockedAxios.post.mockResolvedValue(mockResponse);

    const credentials = {
      username: 'testuser',
      password: 'testpass'
    };

    const result = await authenticateUser(credentials);
    expect(result).toEqual(mockResponse.data);
  });

  it('should handle invalid credentials', async () => {
    const mockError = new Error('Invalid credentials') as any;
    mockError.isAxiosError = true;
    mockError.response = {
      data: {
        error: 'invalid_grant',
        error_description: 'Invalid credentials'
      },
      status: 401,
      statusText: 'Unauthorized',
      headers: {},
      config: {}
    };

    mockedAxios.post.mockRejectedValue(mockError);

    const credentials = {
      username: 'wrong',
      password: 'wrong'
    };

    await expect(authenticateUser(credentials))
      .rejects
      .toThrow('Invalid credentials');
  });

  it('should handle network errors', async () => {
    const mockError = new Error('Network Error');
    Object.assign(mockError, { isAxiosError: true });
    mockedAxios.post.mockRejectedValue(mockError);

    const credentials = {
      username: 'testuser',
      password: 'testpass'
    };

    await expect(authenticateUser(credentials))
      .rejects
      .toThrow('Network Error');
  });

  it('should handle server errors', async () => {
    const mockError = new Error('Internal Server Error') as any;
    mockError.isAxiosError = true;
    mockError.response = {
      data: {
        error: 'server_error',
        error_description: 'Internal Server Error'
      },
      status: 500,
      statusText: 'Internal Server Error',
      headers: {},
      config: {}
    };

    mockedAxios.post.mockRejectedValue(mockError);

    const credentials = {
      username: 'testuser',
      password: 'testpass'
    };

    await expect(authenticateUser(credentials))
      .rejects
      .toThrow('Internal Server Error');
  });
}); 