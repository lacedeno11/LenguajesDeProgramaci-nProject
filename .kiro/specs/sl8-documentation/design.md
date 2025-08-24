# Plan de Implementación SL8.ai

## Análisis del Sistema Actual

### Frontend React Native/Expo - COMPLETO ✅
**Ubicación:** `SL8Whiteboard/SL8WhiteboardExpo/`

**Canvas System:**
- **Component**: `src/components/Canvas.tsx` - Sistema de dibujo completo con React Native SVG
- **Touch Handling**: Gestos multi-touch (pan, zoom, dibujo) implementados
- **Rendering**: SVG rendering de strokes, texto e imágenes

**Redux Store - 5 Slices Implementados:**
```typescript
// src/store/slices/
canvasSlice.ts    // Canvas state: strokes, textElements, imageElements, zoom, pan
toolsSlice.ts     // Tools: currentTool, settings, colorPalette, toolHistory  
layersSlice.ts    // Layer management: layers, visibility, ordering
historySlice.ts   // Undo/redo: entries, currentIndex con history stack
uiSlice.ts        // UI state: loading, error, modals
```

**Drawing Tools - Patrón Strategy:**
```typescript
// src/tools/
BaseTool.ts       // Abstract base class
PenTool.ts        // Smooth vector drawing 
PencilTool.ts     // Textured drawing with natural feel
HighlighterTool.ts // Semi-transparent highlighting
EraserTool.ts     // Smart stroke splitting eraser
TextTool.ts       // Direct text annotation
```

**State Structure (Real):**
```typescript
interface CanvasState {
  size: CanvasSize;                          // Canvas dimensions (4x screen)
  zoom: number;                              // 0.25x - 4.0x zoom
  panOffset: { x: number; y: number };       // Pan position
  strokes: Record<string, Stroke>;           // All drawing strokes by ID
  textElements: Record<string, TextElement>; // Text annotations by ID
  imageElements: Record<string, ImageElement>; // Images by ID
  selectedImageId: string | null;            // Currently selected image
}
```

### Backend PHP + MySQL - PARCIALMENTE IMPLEMENTADO ⚠️
**Ubicación:** `sl8-backend/`

**Implementado por Luis:**
- ✅ `config.php` - DB connection, CORS, helper functions
- ✅ `save_canvas.php` - POST endpoint para guardar pizarra
- ✅ `load_canvas.php` - GET endpoint para cargar pizarra  
- ✅ `database.sql` - Schema: users, canvas_sessions tables
- ⚠️ `Backend/login.php`, `Backend/register.php` - Auth básico pero diferente DB

**Estructura DB Actual:**
```sql
users: id, email, password_hash, created_at
canvas_sessions: id, user_id, title, canvas_data(LONGTEXT), created_at, updated_at
```

**PROBLEMA IDENTIFICADO:** Dos sistemas de auth con diferentes DBs:
- `sl8-backend/` usa DB `sl8_whiteboard` 
- `Backend/` usa DB `user_auth`

## Plan de Implementación - 1 Día (3-4 Personas)

### **DIVISIÓN DE TAREAS**

#### **👨‍💻 Persona 1: Backend Integration Lead (3-4 horas)**

**🔧 Tarea 1A: Unificar y Completar API REST (2 horas)**
- **Objetivo**: Unificar autenticación y completar CRUD de pizarras
- **Archivos a Crear/Modificar**:
  ```
  sl8-backend/
  ├── api/
  │   ├── auth.php          # Unificar login/register 
  │   ├── sessions.php      # CRUD pizarras (GET, PUT, DELETE)
  │   └── index.php         # Router principal
  ├── config.php            # Mejorar configuración
  └── database.sql          # Actualizar schema
  ```

**🔗 Tarea 1B: Service Layer Frontend (1-2 horas)**
- **Objetivo**: Conectar frontend con backend
- **Archivos a Crear**:
  ```
  SL8WhiteboardExpo/src/
  ├── services/
  │   ├── ApiService.ts     # HTTP client base
  │   ├── AuthService.ts    # Login/register/logout
  │   ├── CanvasService.ts  # Save/load pizarras
  │   └── types.ts          # API response types
  ├── store/slices/
  │   └── authSlice.ts      # Authentication state
  ```

#### **👩‍💻 Persona 2: AI Integration Specialist (4 horas)**

**🤖 Tarea 2A: Gemini 2.5 Integration Core (2 horas)**
- **Objetivo**: Implementar captura de canvas y envío a Gemini AI
- **Archivos a Crear**:
  ```
  SL8WhiteboardExpo/src/
  ├── services/
  │   ├── AIService.ts      # Gemini API integration
  │   ├── ScreenshotService.ts # Canvas to image conversion
  │   └── HelpService.ts    # 6-level help system
  ├── store/slices/
  │   └── aiSlice.ts        # AI state (loading, responses, help level)
  ├── components/
  │   ├── AIHelpPanel.tsx   # UI para sistema de ayuda
  │   └── HelpButton.tsx    # Botón de ayuda
  ```

**📱 Tarea 2B: Help System UI Implementation (2 horas)**
- **Objetivo**: Implementar los 6 niveles de ayuda en la interfaz
- **Niveles de Ayuda**:
  1. "I am stuck" - Análisis general del problema
  2. "I need a hint" - Pista específica sobre el siguiente paso
  3. "Show me direction" - Indicación de dirección/enfoque
  4. "Give me an example" - Ejemplo similar resuelto
  5. "Break it down" - Descomposición paso a paso
  6. "Show solution" - Solución completa

#### **🎨 Persona 3: UI/UX Integration Lead (3 horas)**

**🖥️ Tarea 3A: Session Management UI (1.5 horas)**
- **Objetivo**: Interfaz para guardar/cargar pizarras (máximo 5 por usuario)
- **Archivos a Crear**:
  ```
  SL8WhiteboardExpo/src/
  ├── components/
  │   ├── SessionManager.tsx    # Lista de pizarras guardadas
  │   ├── SaveSessionModal.tsx  # Modal para guardar con título
  │   ├── LoadSessionModal.tsx  # Modal para cargar pizarra
  │   └── SessionCard.tsx       # Card component para cada sesión
  ├── screens/
  │   └── SessionsScreen.tsx    # Pantalla de gestión de sesiones
  ```

**🔐 Tarea 3B: Authentication UI (1.5 horas)**
- **Objetivo**: Pantallas de login/registro
- **Archivos a Crear**:
  ```
  SL8WhiteboardExpo/src/
  ├── screens/
  │   ├── LoginScreen.tsx       # Pantalla de login
  │   ├── RegisterScreen.tsx    # Pantalla de registro
  │   └── ProfileScreen.tsx     # Perfil de usuario
  ├── components/
  │   ├── AuthForm.tsx          # Formulario reutilizable
  │   └── UserAvatar.tsx        # Avatar del usuario
  ├── navigation/
  │   └── AuthNavigator.tsx     # Navegación de autenticación
  ```

#### **⚙️ Persona 4: Integration & Testing Coordinator (3 horas)**

**🔧 Tarea 4A: App Architecture Updates (1.5 horas)**
- **Objetivo**: Integrar todas las nuevas funcionalidades en App.tsx
- **Archivos a Modificar**:
  ```
  SL8WhiteboardExpo/
  ├── App.tsx               # Main app con navegación
  ├── src/navigation/
  │   ├── AppNavigator.tsx  # Navegación principal
  │   └── MainTabs.tsx      # Tabs principales
  ├── src/components/
  │   └── Toolbar.tsx       # Agregar botones AI y Save/Load
  ```

**🧪 Tarea 4B: End-to-End Testing & Integration (1.5 horas)**
- **Objetivo**: Probar que todo funcione integrado
- **Puntos de Prueba**:
  - Login/registro funciona
  - Save/load de pizarras (máximo 5)
  - AI help system responde correctamente
  - Canvas funciona con persistencia
  - Estados de error manejados

