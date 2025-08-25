#!/bin/bash
# 🚀 Script de Inicio Rápido para SL8.ai
# Ejecuta: chmod +x start.sh && ./start.sh

echo "🎨 Iniciando SL8.ai - Intelligent Whiteboard"
echo "============================================="

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar prerrequisitos
echo "📋 Verificando prerrequisitos..."

if ! command_exists php; then
    echo "❌ PHP no está instalado. Instálalo desde https://php.net"
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js no está instalado. Instálalo desde https://nodejs.org"
    exit 1
fi

if ! command_exists npx; then
    echo "❌ NPX no está disponible. Actualiza Node.js"
    exit 1
fi

echo "✅ Prerrequisitos OK"

# Obtener directorio del script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Función para iniciar backend
start_backend() {
    echo "🔧 Iniciando Backend (PHP)..."
    cd "$DIR/sl8-backend"
    
    # Verificar archivos necesarios
    if [[ ! -f "get_auth.php" ]]; then
        echo "❌ Archivo get_auth.php no encontrado"
        return 1
    fi
    
    # Iniciar servidor PHP en background
    php -S localhost:8081 > /dev/null 2>&1 &
    BACKEND_PID=$!
    
    # Esperar a que inicie
    sleep 2
    
    # Verificar que está corriendo
    if curl -s "http://localhost:8081/get_auth.php" > /dev/null; then
        echo "✅ Backend corriendo en http://localhost:8081 (PID: $BACKEND_PID)"
        echo $BACKEND_PID > "$DIR/.backend_pid"
        return 0
    else
        echo "❌ Backend falló al iniciar"
        return 1
    fi
}

# Función para iniciar frontend
start_frontend() {
    echo "⚛️  Iniciando Frontend (React Native/Expo)..."
    cd "$DIR/SL8Whiteboard/SL8WhiteboardExpo"
    
    # Verificar package.json
    if [[ ! -f "package.json" ]]; then
        echo "❌ package.json no encontrado"
        return 1
    fi
    
    # Instalar dependencias si es necesario
    if [[ ! -d "node_modules" ]]; then
        echo "📦 Instalando dependencias..."
        npm install
    fi
    
    # Iniciar Expo
    echo "🎯 Iniciando Expo en puerto 8082..."
    npx expo start --port 8082 > /dev/null 2>&1 &
    FRONTEND_PID=$!
    
    echo $FRONTEND_PID > "$DIR/.frontend_pid"
    echo "✅ Frontend iniciando en http://localhost:8082 (PID: $FRONTEND_PID)"
    
    return 0
}

# Función para mostrar estado
show_status() {
    echo ""
    echo "🌟 SL8.ai está ejecutándose!"
    echo "=========================="
    echo "🔧 Backend:  http://localhost:8081"
    echo "⚛️  Frontend: http://localhost:8082"
    echo ""
    echo "📱 Para probar:"
    echo "   1. Abre http://localhost:8082 en tu navegador"
    echo "   2. Usa credenciales: test@example.com / password"
    echo "   3. ¡Empieza a dibujar en la pizarra!"
    echo ""
    echo "🛑 Para detener:"
    echo "   ./stop.sh"
}

# Función para limpiar procesos anteriores
cleanup() {
    if [[ -f "$DIR/.backend_pid" ]]; then
        BACKEND_PID=$(cat "$DIR/.backend_pid")
        if kill -0 $BACKEND_PID > /dev/null 2>&1; then
            kill $BACKEND_PID
        fi
        rm "$DIR/.backend_pid"
    fi
    
    if [[ -f "$DIR/.frontend_pid" ]]; then
        FRONTEND_PID=$(cat "$DIR/.frontend_pid")
        if kill -0 $FRONTEND_PID > /dev/null 2>&1; then
            kill $FRONTEND_PID
        fi
        rm "$DIR/.frontend_pid"
    fi
}

# Limpiar procesos anteriores
cleanup

# Iniciar servicios
if start_backend && start_frontend; then
    show_status
    
    # Esperar para abrir navegador
    sleep 3
    
    # Intentar abrir navegador automáticamente
    if command_exists open; then
        echo "🌐 Abriendo navegador..."
        open http://localhost:8082
    elif command_exists xdg-open; then
        echo "🌐 Abriendo navegador..."
        xdg-open http://localhost:8082
    fi
    
    echo ""
    echo "✨ ¡SL8.ai está listo! Presiona Ctrl+C para detener."
    
    # Mantener script corriendo
    wait
else
    echo "❌ Error al iniciar SL8.ai"
    cleanup
    exit 1
fi
