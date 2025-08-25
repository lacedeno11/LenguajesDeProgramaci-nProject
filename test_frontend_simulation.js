#!/usr/bin/env node

/**
 * Script que simula exactamente lo que hace el frontend
 * para identificar dónde está fallando
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:8080/sl8-backend';

// Simular el ApiService del frontend
class FrontendApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.token = null;

    // Simular request interceptor
    this.api.interceptors.request.use(
      async (config) => {
        console.log('🔧 Request interceptor - URL:', config.url);
        console.log('🔧 Request interceptor - Token:', this.token ? this.token.substring(0, 20) + '...' : 'No token');
        
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Simular response interceptor
    this.api.interceptors.response.use(
      (response) => {
        console.log('✅ Response interceptor - Status:', response.status);
        console.log('✅ Response interceptor - Data:', response.data);
        return response;
      },
      (error) => {
        console.error('❌ Response interceptor - Error:', error.response?.data || error.message);
        return Promise.reject(this.handleApiError(error));
      }
    );
  }

  handleApiError(error) {
    if (error.response) {
      const data = error.response.data;
      return {
        success: false,
        message: data?.message || 'Server error occurred',
        error: data?.error || error.message,
        code: error.response.status,
      };
    } else if (error.request) {
      return {
        success: false,
        message: 'Network error - please check your connection',
        error: 'NETWORK_ERROR',
      };
    } else {
      return {
        success: false,
        message: 'An unexpected error occurred',
        error: error.message,
      };
    }
  }

  async post(url, data) {
    console.log('📤 POST Request to:', url);
    console.log('📤 POST Data:', JSON.stringify(data, null, 2));
    
    const response = await this.api.post(url, data);
    return response.data;
  }

  setAuthToken(token) {
    console.log('🔐 Setting auth token:', token.substring(0, 20) + '...');
    this.token = token;
  }
}

// Simular AuthService del frontend
class FrontendAuthService {
  constructor(apiService) {
    this.apiService = apiService;
  }

  async login(email, password) {
    console.log('🔐 AuthService.login() called with:', email);
    
    try {
      const response = await this.apiService.post('/api/auth.php', {
        action: 'login',
        email,
        password
      });

      console.log('🔐 AuthService.login() response:', response);

      if (response.success && response.data?.token) {
        await this.apiService.setAuthToken(response.data.token);
      }

      return {
        success: response.success,
        message: response.message,
        data: response.data,
        error: response.error
      };
    } catch (error) {
      console.error('❌ AuthService.login() error:', error);
      return {
        success: false,
        message: 'Login failed',
        error: error.error || error.message || 'Unknown error'
      };
    }
  }
}

// Simular CanvasService del frontend
class FrontendCanvasService {
  constructor(apiService) {
    this.apiService = apiService;
  }

  async saveCanvas(title, canvasState) {
    console.log('💾 CanvasService.saveCanvas() called');
    console.log('💾 Title:', title);
    console.log('💾 Canvas State:', JSON.stringify(canvasState, null, 2));

    try {
      const request = {
        title,
        canvas_data: JSON.stringify(canvasState)
      };

      console.log('💾 Sending request:', JSON.stringify(request, null, 2));

      const response = await this.apiService.post('/api/sessions.php', request);
      
      console.log('💾 CanvasService.saveCanvas() response:', response);
      
      return response;
    } catch (error) {
      console.error('❌ CanvasService.saveCanvas() error:', error);
      return {
        success: false,
        message: 'Failed to save canvas',
        error: error.error || error.message || 'Unknown error'
      };
    }
  }
}

async function simulateFrontendFlow() {
  console.log('🚀 Simulando el flujo completo del frontend...\n');

  // Inicializar servicios como en el frontend
  const apiService = new FrontendApiService();
  const authService = new FrontendAuthService(apiService);
  const canvasService = new FrontendCanvasService(apiService);

  // Paso 1: Login (simular lo que hace el usuario en la pantalla de login)
  console.log('PASO 1: Simular login del usuario');
  const loginResult = await authService.login('test@example.com', 'password');
  
  if (!loginResult.success) {
    console.error('❌ Login falló:', loginResult);
    return;
  }
  
  console.log('✅ Login exitoso\n');

  // Paso 2: Simular guardado de sesión (lo que hace el botón "Guardar")
  console.log('PASO 2: Simular click en botón "Guardar"');
  
  const sampleCanvasState = {
    strokes: [
      {
        id: 'stroke_frontend_test_1',
        points: [
          { x: 100, y: 100, timestamp: Date.now() },
          { x: 150, y: 150, timestamp: Date.now() + 10 }
        ],
        style: {
          color: '#000000',
          width: 2,
          opacity: 1.0
        }
      }
    ],
    layers: [],
    currentTool: { type: 'pen' },
    toolSettings: { color: '#000000', width: 2 },
    images: []
  };

  const saveResult = await canvasService.saveCanvas('Frontend Test Session', sampleCanvasState);
  
  if (!saveResult.success) {
    console.error('❌ Guardado falló:', saveResult);
    return;
  }
  
  console.log('✅ Sesión guardada exitosamente!');
  console.log('🎉 El flujo del frontend funciona correctamente');
}

simulateFrontendFlow().catch(error => {
  console.error('❌ Error inesperado:', error);
});
