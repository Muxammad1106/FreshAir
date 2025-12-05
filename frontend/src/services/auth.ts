import axiosInstance, { API_ENDPOINTS } from 'src/utils/axios';

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  full_name: string;
  role: 'CUSTOMER' | 'INVESTOR';
  phone?: string;
  budget_usd?: string;
}

export interface AuthResponse {
  token: string;
  refresh: string;
  role: 'CUSTOMER' | 'INVESTOR';
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    company?: number;
    role: 'CUSTOMER' | 'INVESTOR';
  };
  permissions: string[];
}

export interface ApiError {
  message?: string;
  email?: string[];
  password?: string[];
  full_name?: string[];
  role?: string[];
  phone?: string[];
  budget_usd?: string[];
  [key: string]: any;
}

// ----------------------------------------------------------------------
// Auth Service
// ----------------------------------------------------------------------

class AuthService {
  /**
   * Sign in user
   * @param credentials - Email and password
   * @returns Auth response with token and user data
   * @throws Error with API error message
   */
  async signIn(credentials: SignInRequest): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>(
        API_ENDPOINTS.users.login,
        credentials
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = this.extractErrorMessage(error);
      throw new Error(errorMessage);
    }
  }

  /**
   * Sign up new user
   * @param data - User registration data
   * @returns Auth response with token and user data
   * @throws Error with API error message
   */
  async signUp(data: SignUpRequest): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>(
        API_ENDPOINTS.users.register,
        data
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = this.extractErrorMessage(error);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get current user data
   * @returns User data
   * @throws Error with API error message
   */
  async getMe(): Promise<AuthResponse['user']> {
    try {
      const response = await axiosInstance.get<AuthResponse['user']>(
        API_ENDPOINTS.users.me
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = this.extractErrorMessage(error);
      throw new Error(errorMessage);
    }
  }

  /**
   * Sign out user
   * @returns void
   * @throws Error with API error message
   */
  async signOut(): Promise<void> {
    try {
      await axiosInstance.post(API_ENDPOINTS.users.signOut);
    } catch (error: any) {
      // Even if sign out fails on backend, we should clear local storage
      console.error('Sign out error:', error);
    }
  }

  /**
   * Extract error message from API error response
   * @param error - Error object from axios
   * @returns Formatted error message
   */
  private extractErrorMessage(error: any): string {
    if (!error) {
      return 'An unexpected error occurred';
    }

    // If error is already a string
    if (typeof error === 'string') {
      return error;
    }

    // If error has a message property
    if (error.message) {
      return error.message;
    }

    // If error has response data
    if (error.response?.data) {
      const data = error.response.data as ApiError;

      // If it's a single message
      if (data.message) {
        return data.message;
      }

      // If it's field errors, format them
      const fieldErrors: string[] = [];
      Object.keys(data).forEach((key) => {
        const fieldError = data[key];
        if (Array.isArray(fieldError) && fieldError.length > 0) {
          fieldErrors.push(`${key}: ${fieldError.join(', ')}`);
        }
      });

      if (fieldErrors.length > 0) {
        return fieldErrors.join('; ');
      }

      // If it's a non-standard error format
      return JSON.stringify(data);
    }

    return 'An unexpected error occurred';
  }
}

// Export singleton instance
export const authService = new AuthService();

