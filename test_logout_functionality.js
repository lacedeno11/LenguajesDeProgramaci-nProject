#!/usr/bin/env node

/**
 * Test Script para verificar funcionalidad de Logout
 * Simula el flujo completo de autenticación y logout
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:8081';

// Simular SecureStore para el test
class MockSecureStore {
  constructor() {
    this.storage = new Map();
  }

  async setItemAsync(key, value) {
    console.log(`📱 MockSecureStore: Setting ${key} = ${value.substring(0, 20)}...`);
    this.storage.set(key, value);
  }

  async getItemAsync(key) {
    const value = this.storage.get(key);
    console.log(`📱 MockSecureStore: Getting ${key} = ${value ? value.substring(0, 20) + '...' : 'null'}`);
    return value || null;
  }

  async deleteItemAsync(key) {
    console.log(`📱 MockSecureStore: Deleting ${key}`);
    this.storage.delete(key);
  }
}

// Simular ApiService
class MockApiService {
  constructor() {
    this.secureStore = new MockSecureStore();
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getWithParams(url, params) {
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = `${url}?${queryString}`;
    
    try {
      const response = await this.api.get(fullUrl);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
        error: response.data.error
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Request failed',
        error: error.response?.data?.error || error.message
      };
    }
  }

  async setAuthToken(token) {
    await this.secureStore.setItemAsync('authToken', token);
  }

  async getAuthToken() {
    return await this.secureStore.getItemAsync('authToken');
  }

  async clearAuthToken() {
    await this.secureStore.deleteItemAsync('authToken');
  }
}

// Simular AuthService
class MockAuthService {
  constructor() {
    this.apiService = new MockApiService();
  }

  async login(email, password) {
    console.log('🔐 MockAuthService.login() called');
    
    const response = await this.apiService.getWithParams('/get_auth.php', {
      action: 'login',
      email,
      password
    });

    if (response.success && response.data?.token) {
      await this.apiService.setAuthToken(response.data.token);
    }

    return response;
  }

  async logout() {
    console.log('🚪 MockAuthService.logout() called');
    await this.apiService.clearAuthToken();
    console.log('✅ Token cleared from MockSecureStore');
  }

  async isAuthenticated() {
    const token = await this.apiService.getAuthToken();
    return !!token;
  }
}

// Simular estado de Redux
class MockAuthState {
  constructor() {
    this.state = {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      initialized: false
    };
  }

  clearAuth() {
    console.log('🗑️ MockAuthState.clearAuth() called');
    this.state.user = null;
    this.state.token = null;
    this.state.isAuthenticated = false;
    this.state.error = null;
    this.state.initialized = true;
    this.state.isLoading = false;
    console.log('📊 Auth state after clearAuth:', this.state);
  }

  setAuthenticatedState(user, token) {
    this.state.user = user;
    this.state.token = token;
    this.state.isAuthenticated = true;
    this.state.initialized = true;
    this.state.isLoading = false;
    console.log('📊 Auth state after login:', this.state);
  }
}

// Test principal
async function testLogoutFunctionality() {
  console.log('🧪 === Testing Logout Functionality ===\n');

  const authService = new MockAuthService();
  const authState = new MockAuthState();

  try {
    // 1. Test login first
    console.log('1️⃣ Testing login...');
    const loginResponse = await authService.login('test@example.com', 'password');
    
    if (!loginResponse.success) {
      console.error('❌ Login failed:', loginResponse.message);
      return;
    }
    
    console.log('✅ Login successful');
    authState.setAuthenticatedState(loginResponse.data.user, loginResponse.data.token);

    // 2. Verify we're authenticated
    console.log('\n2️⃣ Verifying authentication state...');
    const isAuth = await authService.isAuthenticated();
    console.log('🔍 Is authenticated:', isAuth);
    
    if (!isAuth) {
      console.error('❌ Should be authenticated after login');
      return;
    }

    // 3. Test logout process (simulating our new implementation)
    console.log('\n3️⃣ Testing logout process...');
    
    // Simulate the logout flow from Toolbar.tsx
    console.log('🚪 Simulating logout button click...');
    console.log('✅ User confirmed logout...');
    
    // Call AuthService.logout()
    await authService.logout();
    
    // Call clearAuth action
    authState.clearAuth();

    // 4. Verify we're logged out
    console.log('\n4️⃣ Verifying logout state...');
    const isAuthAfterLogout = await authService.isAuthenticated();
    console.log('🔍 Is authenticated after logout:', isAuthAfterLogout);
    
    if (isAuthAfterLogout) {
      console.error('❌ Should NOT be authenticated after logout');
      return;
    }

    // 5. Check final state
    console.log('\n5️⃣ Final state check...');
    console.log('📊 Final isAuthenticated:', authState.state.isAuthenticated);
    console.log('📊 Final initialized:', authState.state.initialized);
    
    if (authState.state.isAuthenticated) {
      console.error('❌ Redux state should show isAuthenticated: false');
      return;
    }
    
    if (!authState.state.initialized) {
      console.error('❌ Redux state should show initialized: true');
      return;
    }

    console.log('\n🎉 === All logout tests PASSED! ===');
    console.log('✅ The logout functionality should work correctly');

  } catch (error) {
    console.error('\n❌ === Test FAILED ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Ejecutar el test
testLogoutFunctionality();
