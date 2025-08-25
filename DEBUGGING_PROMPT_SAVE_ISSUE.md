# 🔧 PROMPT PARA DEBUGGING: Problema con Botón "Guardar" en SL8.ai Whiteboard

## 📋 CONTEXTO DEL PROBLEMA

El usuario reporta que **el botón "Guardar" no funciona** en la aplicación React Native/Expo del whiteboard. El modal de guardado aparece, pero la operación de guardar falla silenciosamente con "network error".

## ✅ ESTADO ACTUAL CONFIRMADO

### **Backend (100% funcional):**
- ✅ API `/api/auth.php` funciona perfectamente (POST login)
- ✅ API `/api/sessions.php` funciona perfectamente (CRUD completo)
- ✅ Base de datos MySQL conectada correctamente
- ✅ Usuario de prueba: `test@example.com` / `password` existe
- ✅ CORS configurado correctamente
- ✅ JWT authentication funciona
- ✅ Probado con curl - todas las operaciones funcionan

### **Verificación del Backend:**
```bash
# Login funciona:
curl -X POST "http://localhost:8080/sl8-backend/api/auth.php" \
  -H "Content-Type: application/json" \
  -d '{"action":"login","email":"test@example.com","password":"password"}'

# Crear sesión funciona (con token):
curl -X POST "http://localhost:8080/sl8-backend/api/sessions.php" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -d '{"title":"Test Session","canvas_data":"{\"strokes\":[]}"}'
```

## 🎯 ÁREAS A INVESTIGAR EN EL FRONTEND

### **1. Problema de Autenticación**
**Archivo:** `src/services/AuthService.ts`
- **REVISAR:** ¿Está usando los endpoints correctos (`/api/auth.php` en lugar de `/get_auth.php`)?
- **REVISAR:** ¿Se está guardando el token correctamente con `expo-secure-store`?
- **REVISAR:** ¿El token se está enviando en las requests posteriores?

### **2. Configuración de API Base URL**
**Archivo:** `src/services/ApiService.ts`
- **REVISAR:** Que `API_BASE_URL = 'http://localhost:8080/sl8-backend'`
- **REVISAR:** Que el interceptor de request esté agregando el header `Authorization: Bearer ${token}`
- **REVISAR:** Manejo de errores en los interceptors

### **3. Flow de Guardado de Sesión**
**Archivos clave:**
- `src/screens/WhiteboardScreen.tsx` - función `handleSaveConfirm`
- `src/store/slices/sessionsSlice.ts` - acción `saveSessionAsync`
- `src/services/CanvasService.ts` - método `saveCanvas`

**REVISAR:**
- ¿El `SerializedCanvasState` se está serializando correctamente?
- ¿La estructura de datos coincide con lo que espera el backend?
- ¿El usuario está autenticado cuando intenta guardar?

### **4. Estado de Autenticación Global**
**Archivos:**
- `src/store/slices/authSlice.ts`
- `src/navigation/RootNavigator.tsx`

**REVISAR:**
- ¿El estado `isAuthenticated` es `true` cuando el usuario intenta guardar?
- ¿El token se está perdiendo entre navegaciones?
- ¿`verifyTokenAsync` está funcionando correctamente?

## 🔍 PASOS DE DEBUGGING SUGERIDOS

### **Paso 1: Verificar Autenticación**
```typescript
// En cualquier componente, agregar:
const testAuth = async () => {
  const token = await apiService.getAuthToken();
  console.log('Token actual:', token);
  
  if (!token) {
    console.log('❌ Usuario no autenticado');
    return;
  }
  
  // Probar request directa
  try {
    const response = await apiService.get('/api/sessions.php');
    console.log('✅ Request exitosa:', response);
  } catch (error) {
    console.error('❌ Request falló:', error);
  }
};
```

### **Paso 2: Verificar Flow de Guardado**
Agregar logs en:
- `WhiteboardScreen.handleSaveConfirm` - antes de dispatch
- `sessionsSlice.saveSessionAsync` - entrada y salida
- `CanvasService.saveCanvas` - request y response

### **Paso 3: Verificar Estructura de Datos**
```typescript
// En handleSaveConfirm, antes del dispatch:
console.log('Canvas state a guardar:', JSON.stringify(serializedCanvasState, null, 2));
```

## 🚨 PROBLEMAS COMUNES ESPERADOS

1. **Token no se guarda:** `expo-secure-store` falla silenciosamente
2. **URL incorrecta:** Frontend apunta a endpoint inexistente
3. **Estructura de datos:** Frontend envía datos en formato incorrecto
4. **Estado de auth:** Usuario aparece autenticado pero token es inválido
5. **CORS web:** Problema específico del navegador web (vs mobile)

## 📁 ARCHIVOS CRÍTICOS A REVISAR

```
SL8Whiteboard/SL8WhiteboardExpo/src/
├── services/
│   ├── AuthService.ts          ⭐ CRÍTICO - endpoints y token
│   ├── ApiService.ts           ⭐ CRÍTICO - configuración base
│   └── CanvasService.ts        ⭐ CRÍTICO - método saveCanvas
├── store/slices/
│   ├── authSlice.ts           🔍 IMPORTANTE - estado auth
│   └── sessionsSlice.ts       🔍 IMPORTANTE - saveSessionAsync
├── screens/
│   └── WhiteboardScreen.tsx   🔍 IMPORTANTE - handleSaveConfirm
└── navigation/
    └── RootNavigator.tsx      📋 REVISAR - verifyTokenAsync
```

## 🎯 OBJETIVO

Identificar exactamente dónde está fallando el flow:
1. **¿Usuario está autenticado?** (token válido guardado)
2. **¿Request llega al backend?** (network connectivity)
3. **¿Datos están en formato correcto?** (serialization)
4. **¿Error está siendo manejado correctamente?** (error handling)

## 💡 COMANDO PARA TESTING RÁPIDO

```bash
# Verificar que backend funciona:
cd /Users/abrahamcedeno/Documents/LenguajesDeProgramaci-nProject
node -e "
const axios = require('axios');
axios.post('http://localhost:8080/sl8-backend/api/auth.php', {
  action: 'login', email: 'test@example.com', password: 'password'
}).then(r => console.log('✅ Backend OK:', r.data.success))
.catch(e => console.log('❌ Backend FAIL:', e.message));
"
```

---

**NOTA:** El backend está 100% funcional. El problema está definitivamente en el frontend, específicamente en la comunicación entre el frontend y backend o en el manejo del estado de autenticación.
