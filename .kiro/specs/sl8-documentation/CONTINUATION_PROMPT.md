# 🚀 PROMPT INICIAL - CONTINUACIÓN SL8.ai DEVELOPMENT

## 📋 **CONTEXTO DEL PROYECTO**

Estamos desarrollando **SL8.ai** - un whiteboard inteligente para pensamiento algorítmico con React Native/Expo + PHP backend + MySQL + Gemini AI.

**ESTADO ACTUAL:** El frontend está 100% completado y funcional. Necesitamos terminar el backend y la integración AI.

---

## ✅ **LO QUE YA FUNCIONA PERFECTAMENTE**

### **Frontend (React Native/Expo) - 100% COMPLETADO ✅**
- ✅ Canvas system completo con drawing tools
- ✅ Sistema de autenticación (login/register) funcionando
- ✅ Navigation flow completo (auth → whiteboard)
- ✅ Session management UI completo (save/load pizarras)
- ✅ Redux state management integrado
- ✅ Error handling robusto
- ✅ UI moderna y responsive

**Estructura Frontend:**
```
SL8Whiteboard/SL8WhiteboardExpo/src/
├── services/ (ApiService, AuthService, CanvasService)
├── store/slices/ (authSlice, sessionsSlice, canvasSlice)
├── components/ (SessionManager, SaveSessionModal, Toolbar)
├── screens/ (LoginScreen, RegisterScreen, WhiteboardScreen)
├── navigation/ (AuthNavigator, RootNavigator)
└── types/ (api.ts con todos los interfaces)
```

### **Backend (PHP/MySQL) - PARCIALMENTE FUNCIONANDO**
- ✅ Base de datos MySQL configurada
- ✅ Tablas `users` y `canvas_sessions` creadas
- ✅ Login GET funcionando: `http://localhost:8080/sl8-backend/get_auth.php`
- ✅ Usuario de prueba: `test@example.com` / `password`
- ❌ **PROBLEMA:** Endpoints POST no funcionan (XAMPP issue)

---

## 🔧 **LO QUE NECESITAMOS ARREGLAR**

### **PRIORIDAD 1: Backend API Endpoints**
Los endpoints POST no responden. El frontend está listo pero necesita estos endpoints:

```
❌ POST /api/auth.php (login/register)
❌ GET  /api/sessions.php (listar sesiones)
❌ POST /api/sessions.php (guardar sesión)  
❌ PUT  /api/sessions.php?id=X (actualizar sesión)
❌ DELETE /api/sessions.php?id=X (eliminar sesión)
```

**Archivos que necesitan arreglo:**
- `/Applications/XAMPP/xamppfiles/htdocs/sl8-backend/api/auth.php`
- `/Applications/XAMPP/xamppfiles/htdocs/sl8-backend/api/sessions.php`

### **PRIORIDAD 2: AI Integration (Opcional)**
- Gemini 2.5 integration para análisis de canvas
- 6 niveles de ayuda AI
- Canvas screenshot para enviar a IA

---

## 🎯 **OBJETIVO INMEDIATO**

1. **Arreglar endpoints POST** en el backend
2. **Implementar sessions CRUD** completo
3. **Testear integración** frontend ↔ backend
4. **(Opcional) Agregar AI integration**

---

## 🛠️ **SETUP NECESARIO**

### **Backend Environment:**
```bash
# XAMPP debe estar corriendo
http://localhost:8080/sl8-backend/

# Database: sl8_whiteboard
# User: test@example.com / password
```

### **Frontend Environment:**
```bash
cd /Users/abrahamcedeno/Documents/LenguajesDeProgramaci-nProject/SL8Whiteboard/SL8WhiteboardExpo
npm start
```

---

## 🔍 **DEBUGGING INFO**

### **Problema POST Requests:**
```bash
# Test actual que NO funciona:
curl -X POST http://localhost:8080/sl8-backend/api/auth.php \
  -H "Content-Type: application/json" \
  -d '{"action":"login","email":"test@example.com","password":"password"}'

# Respuesta: vacía o error 500
```

### **Login GET que SÍ funciona:**
```bash
# Test que funciona:
curl "http://localhost:8080/sl8-backend/get_auth.php?action=login&email=test@example.com&password=password"

# Respuesta exitosa con token
```

---

## 📁 **ARCHIVOS CLAVE PARA REVISAR**

### **Backend Files:**
```
sl8-backend/
├── get_auth.php              # ✅ FUNCIONA (GET temporal)
├── api/
│   ├── auth.php              # ❌ NO FUNCIONA (POST)
│   └── sessions.php          # ❌ NO FUNCIONA (CRUD)
├── config/
│   ├── database.php          # ✅ Configuración DB
│   └── cors.php              # ✅ Headers CORS
└── utils/
    ├── response.php          # ✅ Responses JSON
    └── validator.php         # ✅ Validaciones
```

### **Frontend Ready Services:**
```typescript
// Estos servicios están listos y esperando backend:
AuthService.login(email, password)      // → POST /api/auth.php
CanvasService.listSessions()            // → GET /api/sessions.php  
CanvasService.saveCanvas(title, data)   // → POST /api/sessions.php
CanvasService.loadCanvas(id)            // → GET /api/sessions.php?id=X
CanvasService.deleteSession(id)         // → DELETE /api/sessions.php?id=X
```

---

## 🎯 **TAREAS ESPECÍFICAS**

### **Tarea 1: Arreglar auth.php (30-45 min)**
```php
// Problema probable en api/auth.php:
// - php://input no se lee correctamente
// - Headers CORS missing
// - Output buffering issues
// - Error en JSON response format
```

### **Tarea 2: Implementar sessions.php (60-90 min)**
```php
// Necesita implementar:
// GET    /api/sessions.php        → listar sesiones del usuario
// POST   /api/sessions.php        → crear nueva sesión
// PUT    /api/sessions.php?id=X   → actualizar sesión existente  
// DELETE /api/sessions.php?id=X   → eliminar sesión
```

### **Tarea 3: Testing Integration (30 min)**
```bash
# Testear cada endpoint:
curl -X POST .../api/auth.php -d '{"action":"login",...}'
curl -X GET .../api/sessions.php -H "Authorization: Bearer TOKEN"
curl -X POST .../api/sessions.php -d '{"title":"Test","canvas_data":"..."}'
```

---

## 🔄 **WORKFLOW SUGERIDO**

1. **Revisar y arreglar** `api/auth.php` first
2. **Testear** auth endpoints con curl
3. **Implementar** sessions CRUD en `api/sessions.php`
4. **Testear** sessions endpoints
5. **Verificar** que frontend conecta correctamente
6. **Demo** completo: login → draw → save → load

---

## 📱 **TESTING CREDENTIALS**

```
Email: test@example.com
Password: password
Database: sl8_whiteboard
Server: localhost:8080
```

---

## 🆘 **SI NECESITAS AYUDA**

1. **Revisa logs XAMPP** para errores PHP
2. **Verifica permisos** de archivos en htdocs
3. **Checa configuración** php.ini para JSON/CORS
4. **Usa testing dashboard**: `http://localhost:8080/sl8-backend/api_test.html`

---

**🎯 OBJETIVO:** Al final tendremos SL8.ai completamente funcional - frontend hermoso + backend robusto + (opcional) AI integration.

**🚀 NEXT:** Empezar con arreglar los endpoints POST en `api/auth.php`
