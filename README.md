# SL8.ai - Intelligent Whiteboard Application

![SL8.ai Logo](docs/assets/logo.png)

**SL8.ai** es una aplicación de pizarra digital inteligente desarrollada con React Native/Expo (frontend) y PHP (backend). Permite a los usuarios crear, editar y guardar sesiones de pizarra con herramientas de dibujo avanzadas.

## 🚀 Estado Actual del Proyecto

### ✅ Funcionalidades Implementadas
- **Frontend React Native/Expo**: Aplicación multiplataforma funcionando
- **Sistema de Autenticación**: Login con credenciales de prueba
- **Pizarra Digital**: Canvas interactivo con herramientas de dibujo
- **Herramientas de Dibujo**: Pen, Pencil, Highlighter, Eraser, Text
- **Gestión de Imágenes**: Importar desde galería y cámara
- **🆕 Galería de Imágenes**: Sistema completo de captura y galería visual
- **Guardado de Sesiones**: Sistema básico de guardado funcionando
- **Backend API**: Endpoints PHP para auth y sesiones

### 🖼️ **NUEVA FUNCIONALIDAD: Galería de Imágenes**
- **📸 Captura del Canvas**: Guarda capturas automáticas de tu trabajo
- **🗂️ Galería Visual**: Interfaz moderna para ver todas las imágenes
- **📊 Metadata Completa**: Título, fecha y tamaño de cada imagen
- **🔄 Actualización Automática**: Refresco dinámico de la galería
- **💾 Almacenamiento Robusto**: Backend PHP con API REST

### 🔧 En Desarrollo
- Persistencia completa en base de datos
- Sistema de capas avanzado
- Funciones de exportación
- Optimizaciones de rendimiento

## 📋 Prerrequisitos

### Sistema Operativo
- **macOS** (recomendado)
- **Windows** o **Linux** (con ajustes menores)

### Software Requerido
```bash
# Node.js y npm
node --version  # v18.0.0 o superior
npm --version   # v8.0.0 o superior

# PHP
php --version   # v8.0 o superior

# Expo CLI
npm install -g @expo/cli

# Git
git --version
```

## 🛠️ Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/LenguajesDeProgramaci-nProject.git
cd LenguajesDeProgramaci-nProject
```

### 2. Configurar el Backend (PHP)

#### 2.1 Navegar a la carpeta del backend
```bash
cd sl8-backend
```

#### 2.2 Verificar archivos de configuración
```bash
# Verificar que existen estos archivos:
ls -la get_auth.php        # ✅ Endpoint de autenticación
ls -la api/sessions.php    # ✅ Endpoint de sesiones  
ls -la config.php          # ✅ Configuración general
```

#### 2.3 Iniciar el servidor PHP
```bash
# Iniciar en puerto 8081
php -S localhost:8081

# Deberías ver:
# [DATE] PHP 8.x.x Development Server (http://localhost:8081) started
```

#### 2.4 Verificar que el backend funciona
```bash
# En otra terminal, probar el endpoint de auth:
curl "http://localhost:8081/get_auth.php?action=login&email=test@example.com&password=password"

# Respuesta esperada:
# {"success":true,"message":"Login exitoso","data":{"user":{"id":1,"email":"test@example.com"},"token":"fake-jwt-token-..."}}
```

### 3. Configurar el Frontend (React Native/Expo)

#### 3.1 Navegar a la carpeta del frontend
```bash
cd ../SL8Whiteboard/SL8WhiteboardExpo
```

#### 3.2 Instalar dependencias
```bash
npm install
```

#### 3.3 Iniciar la aplicación
```bash
# Iniciar Expo en puerto específico para evitar conflictos
expo start --port 8082

# O simplemente:
expo start
```

#### 3.4 Abrir la aplicación
```bash
# Automáticamente abrirá en el navegador en:
# http://localhost:8082

# También puedes abrir manualmente:
open http://localhost:8082
```

## 🧪 Cómo Probar la Aplicación

### 1. Verificar Backend
```bash
# Terminal 1: Backend debe estar corriendo
cd sl8-backend
php -S localhost:8081
# ✅ Backend corriendo en http://localhost:8081
```

### 2. Verificar Frontend
```bash
# Terminal 2: Frontend debe estar corriendo  
cd SL8Whiteboard/SL8WhiteboardExpo
expo start --port 8082
# ✅ Frontend corriendo en http://localhost:8082
```

### 3. Flujo de Prueba Completo

#### 3.1 Iniciar Sesión
1. Abrir http://localhost:8082 en el navegador
2. La aplicación debería mostrar pantalla de login
3. Usar credenciales de prueba:
   - **Email**: `test@example.com`
   - **Password**: `password`
4. Hacer clic en "Iniciar Sesión"
5. ✅ Deberías ser redirigido a la pizarra principal

#### 3.2 Probar Herramientas de Dibujo
1. **Pen Tool**: Dibujar líneas precisas
2. **Pencil Tool**: Dibujar líneas más suaves
3. **Highlighter Tool**: Resaltar con transparencia
4. **Eraser Tool**: Borrar trazos existentes
5. **Text Tool**: Hacer clic para agregar texto

#### 3.3 Probar Funciones de Canvas
1. **Zoom**: Usar botones + y - para acercar/alejar
2. **Pan**: Arrastrar con dos dedos (o mouse) para mover vista
3. **Reset View**: Restaurar zoom y posición inicial
4. **Clear**: Borrar todo el contenido del canvas

#### 3.4 Probar Imágenes
1. **Galería**: Hacer clic en "📁 Gallery" para importar imagen
2. **Cámara**: Hacer clic en "📷 Camera" para tomar foto
3. **Manipulación**: Arrastrar imágenes en el canvas

#### 3.5 Probar Guardado de Sesiones
1. Crear algunos dibujos en el canvas
2. Hacer clic en el botón "💾 Guardar"
3. Escribir un título para la sesión
4. Hacer clic en "Guardar"
5. ✅ Deberías ver mensaje de éxito

## 🐛 Troubleshooting

### Problema: "Network Error" en Login
```bash
# Solución: Verificar que backend esté corriendo
curl http://localhost:8081/get_auth.php?action=login&email=test@example.com&password=password

# Si no responde, reiniciar backend:
cd sl8-backend
php -S localhost:8081
```

### Problema: Puerto Ocupado
```bash
# Ver qué está usando el puerto
lsof -i :8081
lsof -i :8082

# Matar proceso si es necesario
kill -9 <PID>
```

### Problema: Expo No Inicia
```bash
# Limpiar cache
expo start --clear

# Reinstalar dependencias
rm -rf node_modules
npm install
```

### Problema: "Module Not Found"
```bash
# Verificar dependencias
cd SL8Whiteboard/SL8WhiteboardExpo
npm install

# Verificar que tienes Expo CLI global
npm install -g @expo/cli
```

## 📱 Plataformas Soportadas

### Desarrollo y Testing
- ✅ **Web Browser** (Chrome, Firefox, Safari)
- ✅ **iOS Simulator** (con Xcode)
- ✅ **Android Emulator** (con Android Studio)

### Producción (Futuro)
- 📱 **iOS** (App Store)
- 🤖 **Android** (Google Play Store)
- 💻 **Web** (PWA)

## 📊 Estructura del Proyecto

```
├── sl8-backend/                # Backend PHP
│   ├── get_auth.php           # Auth endpoint (temporal)
│   ├── api/sessions.php       # Sessions endpoint
│   └── config.php            # Configuración DB
│
├── SL8Whiteboard/SL8WhiteboardExpo/  # Frontend React Native
│   ├── src/
│   │   ├── components/        # Componentes UI
│   │   ├── screens/          # Pantallas principales
│   │   ├── services/         # Servicios API
│   │   ├── store/           # Estado global (Redux)
│   │   └── tools/           # Herramientas de dibujo
│   └── App.tsx              # Componente principal
│
└── docs/                    # Documentación del proyecto
```

## 🔑 Credenciales de Prueba

```javascript
// Para testing y desarrollo
const TEST_CREDENTIALS = {
  email: "test@example.com",
  password: "password"
};
```

## 📝 Comandos Útiles

### Backend
```bash
# Iniciar servidor
cd sl8-backend && php -S localhost:8081

# Probar endpoints
curl "http://localhost:8081/get_auth.php?action=login&email=test@example.com&password=password"
curl -X POST "http://localhost:8081/api/sessions.php" -H "Content-Type: application/json" -d '{"title":"Test","canvas_data":"{}"}'
```

### Frontend
```bash
# Desarrollo
cd SL8Whiteboard/SL8WhiteboardExpo
npm install
expo start --port 8082

# Testing
npm test

# Build (futuro)
expo build:web
```

## 🎯 Roadmap

- [ ] **Base de Datos**: Implementar MySQL/PostgreSQL
- [ ] **Autenticación Real**: JWT + Hash passwords
- [ ] **Colaboración**: Multi-usuario en tiempo real
- [ ] **Exportación**: PDF, PNG, SVG
- [ ] **IA Integration**: Reconocimiento de formas
- [ ] **Cloud Storage**: AWS/Firebase integration

## 👥 Equipo de Desarrollo

- **Abraham Cedeño** - Full Stack Developer
- **Contribuidores** - Ver CONTRIBUTORS.md

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

**¿Necesitas ayuda?** 
- 📧 Email: support@sl8.ai
- 📖 Docs: [docs/README.md](docs/README.md)
- 🐛 Issues: [GitHub Issues](https://github.com/tu-usuario/repo/issues)
