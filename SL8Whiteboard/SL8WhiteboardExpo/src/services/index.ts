// Services barrel file for easy imports
export { apiService, default as ApiService } from './ApiService';
export { authService, default as AuthService } from './AuthService';
export { canvasService, default as CanvasService } from './CanvasService';

// Re-export types for convenience
export type {
  User,
  AuthResponse,
  CanvasSession,
  SessionsResponse,
  SessionResponse,
  SerializedCanvasState,
  ApiResponse,
  ApiError
} from '../types/api';
