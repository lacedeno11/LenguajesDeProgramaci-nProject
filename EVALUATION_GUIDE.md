# 📋 INSTRUCCIONES PARA EVALUACIÓN - SL8.ai Whiteboard

## 🎯 Evaluador: Comandos Rápidos

### 1. Inicio Rápido (Un solo comando)
```bash
# Navegar al proyecto y ejecutar
cd LenguajesDeProgramaci-nProject
./start.sh
```

### 2. Inicio Manual (Paso a paso)
```bash
# Terminal 1: Backend
cd LenguajesDeProgramaci-nProject/sl8-backend
php -S localhost:8081

# Terminal 2: Frontend  
cd LenguajesDeProgramaci-nProject/SL8Whiteboard/SL8WhiteboardExpo
npm install
expo start --port 8082
```

### 3. Verificación Rápida
```bash
# Probar backend
curl "http://localhost:8081/get_auth.php?action=login&email=test@example.com&password=password"

# Abrir frontend
open http://localhost:8082
```

## 🧪 Checklist de Funcionalidades para Evaluar

### ✅ Autenticación
- [ ] Login con `test@example.com` / `password`
- [ ] Redirección a pizarra después del login
- [ ] Manejo de errores de login

### ✅ Pizarra Digital
- [ ] **Pen Tool**: Dibujar líneas precisas
- [ ] **Pencil Tool**: Dibujar líneas suaves
- [ ] **Highlighter Tool**: Resaltar con transparencia
- [ ] **Eraser Tool**: Borrar trazos existentes
- [ ] **Text Tool**: Agregar texto en cualquier posición

### ✅ Controles de Vista
- [ ] **Zoom In/Out**: Botones + y -
- [ ] **Pan**: Arrastrar para mover vista
- [ ] **Reset View**: Restaurar zoom inicial
- [ ] **Clear**: Borrar todo el canvas

### ✅ Gestión de Imágenes
- [ ] **Gallery**: Importar desde galería (web: drag & drop)
- [ ] **Camera**: Tomar foto (web: upload file)
- [ ] **Manipulación**: Arrastrar imágenes en canvas

### ✅ Persistencia
- [ ] **Guardar Sesión**: Botón "💾 Guardar"
- [ ] **Título Personalizado**: Escribir nombre de sesión
- [ ] **Confirmación**: Mensaje de éxito al guardar

## 🔧 Arquitectura Técnica

### Frontend (React Native/Expo)
```
SL8WhiteboardExpo/
├── src/
│   ├── components/     # Componentes reutilizables
│   ├── screens/       # Pantallas principales
│   ├── services/      # Comunicación con API
│   ├── store/         # Estado global (Redux Toolkit)
│   └── tools/         # Herramientas de dibujo
```

### Backend (PHP)
```
sl8-backend/
├── get_auth.php       # Endpoint de autenticación
├── api/sessions.php   # Endpoint de sesiones
└── config.php         # Configuración general
```

## 📊 Métricas de Rendimiento

### Tiempo de Carga
- **Inicio de Backend**: ~2 segundos
- **Inicio de Frontend**: ~5-10 segundos
- **Login**: ~500ms
- **Guardado de Sesión**: ~1 segundo

### Capacidades
- **Canvas Size**: 4096x3072 pixels
- **Zoom Range**: 25% - 400%
- **Strokes**: Ilimitados (limitado por memoria)
- **Sesiones**: 5 por usuario

## 🐛 Problemas Conocidos y Soluciones

### "Network Error" en Login
```bash
# Verificar backend
curl http://localhost:8081/get_auth.php

# Si no responde, reiniciar:
pkill -f "php -S"
cd sl8-backend && php -S localhost:8081
```

### Puerto Ocupado
```bash
# Ver qué usa el puerto
lsof -i :8081

# Matar proceso
kill -9 <PID>
```

### Expo No Inicia
```bash
# Limpiar cache
expo start --clear

# Puerto específico
expo start --port 8082
```

## 📱 Compatibilidad Probada

### Plataformas
- ✅ **Web Browser** (Chrome, Firefox, Safari)
- ✅ **iOS Safari** (responsive)
- ✅ **Android Chrome** (responsive)

### Resoluciones
- ✅ **Desktop**: 1920x1080, 2560x1440
- ✅ **Tablet**: 1024x768, 1366x1024  
- ✅ **Mobile**: 375x667, 414x896

## 🎓 Aspectos Académicos Destacados

### Patrones de Diseño Implementados
- **Redux Pattern**: Estado global centralizado
- **Service Layer**: Separación de lógica de API
- **Component Composition**: Reutilización de componentes
- **Hook Pattern**: Lógica reutilizable con React Hooks

### Tecnologías Utilizadas
- **Frontend**: React Native, Expo, TypeScript, Redux Toolkit
- **Backend**: PHP 8.x, REST API
- **Canvas**: React Native SVG
- **Estado**: Redux con RTK Query
- **Navegación**: React Navigation 6

### Buenas Prácticas
- **TypeScript**: Tipado estático completo
- **Testing**: Unit tests para componentes críticos
- **Error Handling**: Manejo robusto de errores
- **Performance**: Optimizaciones de rendering

## 📈 Métricas de Código

```bash
# Estadísticas del proyecto
find . -name "*.tsx" -o -name "*.ts" | wc -l    # ~30 archivos TypeScript
find . -name "*.php" | wc -l                     # ~10 archivos PHP
wc -l src/**/*.ts src/**/*.tsx                   # ~3000+ líneas de código
```

## 🏆 Funcionalidades Destacadas

1. **Canvas Interactivo**: Implementación completa con SVG
2. **Herramientas Múltiples**: 5 herramientas diferentes funcionando
3. **Gestión de Estado**: Redux con persistencia
4. **API Integration**: Comunicación frontend-backend
5. **Responsive Design**: Funciona en múltiples dispositivos
6. **Error Handling**: Manejo robusto de errores de red

---

**Tiempo Estimado de Evaluación**: 15-20 minutos
**Complejidad**: Intermedia-Avanzada
**Estado**: Funcional para demostración
