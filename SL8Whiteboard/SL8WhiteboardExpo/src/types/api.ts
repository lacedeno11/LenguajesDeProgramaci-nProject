// API Types for SL8.ai Backend Integration

export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

export interface LoginRequest {
  action: 'login';
  email: string;
  password: string;
}

export interface RegisterRequest {
  action: 'register';
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
  error?: string;
}

export interface CanvasSession {
  id: number;
  user_id: number;
  title: string;
  canvas_data: string; // JSON stringified canvas state
  created_at: string;
  updated_at: string;
}

export interface SaveCanvasRequest {
  title: string;
  canvas_data: string;
}

export interface UpdateCanvasRequest {
  title?: string;
  canvas_data?: string;
}

export interface SessionsResponse {
  success: boolean;
  message: string;
  data?: CanvasSession[];
  error?: string;
}

export interface SessionResponse {
  success: boolean;
  message: string;
  data?: CanvasSession;
  error?: string;
}

export interface ApiError {
  success: false;
  message: string;
  error: string;
  code?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Canvas State Type (from existing types)
export interface SerializedCanvasState {
  strokes: any[];
  layers: any[];
  currentTool: any;
  toolSettings: any;
  images: any[];
}
