#!/usr/bin/env node

/**
 * Script de prueba para verificar la comunicación frontend-backend
 * Simula el flujo completo: Login -> Guardar Sesión -> Listar Sesiones
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:8080/sl8-backend';

// Configurar axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

async function testLogin() {
  console.log('🔐 Probando login...');
  
  try {
    const response = await api.post('/api/auth.php', {
      action: 'login',
      email: 'test@example.com',
      password: 'password'
    });
    
    console.log('✅ Login exitoso:', response.data);
    
    if (response.data.success && response.data.data?.token) {
      return response.data.data.token;
    } else {
      console.error('❌ No se recibió token en la respuesta');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data || error.message);
    return null;
  }
}

async function testSaveSession(token) {
  console.log('💾 Probando guardar sesión...');
  
  const sampleCanvasData = {
    strokes: [
      {
        id: 'stroke_test_1',
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
  
  try {
    const response = await api.post('/api/sessions.php', {
      title: 'Test Session from Script',
      canvas_data: JSON.stringify(sampleCanvasData)
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Sesión guardada exitosamente:', response.data);
    
    if (response.data.success && response.data.data?.id) {
      return response.data.data.id;
    } else {
      console.error('❌ No se recibió ID de sesión en la respuesta');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Error al guardar sesión:', error.response?.data || error.message);
    return null;
  }
}

async function testListSessions(token) {
  console.log('📋 Probando listar sesiones...');
  
  try {
    const response = await api.get('/api/sessions.php', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Sesiones listadas exitosamente:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('❌ Error al listar sesiones:', error.response?.data || error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Iniciando pruebas de comunicación frontend-backend...\n');
  
  // Paso 1: Login
  const token = await testLogin();
  if (!token) {
    console.error('❌ Pruebas fallidas: No se pudo obtener token de autenticación');
    return;
  }
  
  console.log('🔑 Token obtenido:', token.substring(0, 20) + '...\n');
  
  // Paso 2: Guardar sesión
  const sessionId = await testSaveSession(token);
  if (!sessionId) {
    console.error('❌ Pruebas fallidas: No se pudo guardar la sesión');
    return;
  }
  
  console.log('💾 Sesión guardada con ID:', sessionId, '\n');
  
  // Paso 3: Listar sesiones
  const sessions = await testListSessions(token);
  if (!sessions) {
    console.error('❌ Pruebas fallidas: No se pudieron listar las sesiones');
    return;
  }
  
  console.log('🎉 Todas las pruebas pasaron exitosamente!');
  console.log('✅ Backend está funcionando correctamente');
  console.log('✅ El problema debe estar en el frontend');
}

// Verificar que axios esté disponible
if (!axios) {
  console.error('❌ axios no está disponible. Instala con: npm install axios');
  process.exit(1);
}

runTests().catch(error => {
  console.error('❌ Error inesperado:', error);
  process.exit(1);
});
