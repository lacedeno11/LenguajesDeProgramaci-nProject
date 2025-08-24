import { apiService } from './ApiService';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  User 
} from '../types/api';

class AuthService {
  
  /**
   * Login user with email and password
   * Currently uses GET for temporary compatibility, will switch to POST when PERSONA 1 fixes it
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Temporary GET method until POST is fixed by PERSONA 1
      const response = await apiService.getWithParams<AuthResponse>('/get_auth.php', {
        action: 'login',
        email,
        password
      });

      if (response.success && response.data?.token) {
        // Store the token securely
        await apiService.setAuthToken(response.data.token);
      }

      return response;
    } catch (error: any) {
      return {
        success: false,
        message: 'Login failed',
        error: error.error || error.message || 'Unknown error'
      };
    }
  }

  /**
   * Register new user
   * Will use POST when available
   */
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    try {
      // For now, use GET method similar to login
      // TODO: Switch to POST /api/auth.php when PERSONA 1 fixes POST requests
      const response = await apiService.getWithParams<AuthResponse>('/get_auth.php', {
        action: 'register',
        name,
        email,
        password
      });

      if (response.success && response.data?.token) {
        // Store the token securely
        await apiService.setAuthToken(response.data.token);
      }

      return response;
    } catch (error: any) {
      return {
        success: false,
        message: 'Registration failed',
        error: error.error || error.message || 'Unknown error'
      };
    }
  }

  /**
   * Logout user and clear stored token
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint if available
      // await apiService.post('/api/auth.php', { action: 'logout' });
      
      // Clear local token
      await apiService.clearAuthToken();
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear token even if server call fails
      await apiService.clearAuthToken();
    }
  }

  /**
   * Check if user is currently authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await apiService.getAuthToken();
    return !!token;
  }

  /**
   * Get current auth token
   */
  async getToken(): Promise<string | null> {
    return await apiService.getAuthToken();
  }

  /**
   * Verify token is still valid
   * TODO: Implement when backend has token verification endpoint
   */
  async verifyToken(): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) return false;

      // TODO: Call backend to verify token
      // const response = await apiService.get('/api/auth/verify');
      // return response.success;

      // For now, just check if token exists
      return true;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  }

  /**
   * Get current user info
   * TODO: Implement when backend provides user info endpoint
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const isAuth = await this.isAuthenticated();
      if (!isAuth) return null;

      // TODO: Call backend to get user info
      // const response = await apiService.get('/api/user/me');
      // return response.data;

      // Temporary: return mock user data
      return {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        created_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }
}

export const authService = new AuthService();
export default AuthService;
