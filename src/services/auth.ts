import axios from 'axios';

interface Credentials {
  username: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export const authenticateUser = async (credentials: Credentials): Promise<AuthResponse> => {
  try {
    const response = await axios.post('/api/auth', credentials);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response?.data?.error_description) {
        throw new Error(error.response.data.error_description);
      }
      if (error.response?.statusText) {
        throw new Error(error.response.statusText);
      }
      if (error.message) {
        throw new Error(error.message);
      }
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred');
  }
}; 