#!/bin/bash
# 🛑 Script para Detener SL8.ai
# Ejecuta: ./stop.sh

echo "🛑 Deteniendo SL8.ai..."

# Obtener directorio del script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Función para detener backend
stop_backend() {
    if [[ -f "$DIR/.backend_pid" ]]; then
        BACKEND_PID=$(cat "$DIR/.backend_pid")
        if kill -0 $BACKEND_PID > /dev/null 2>&1; then
            kill $BACKEND_PID
            echo "✅ Backend detenido (PID: $BACKEND_PID)"
        else
            echo "⚠️  Backend ya estaba detenido"
        fi
        rm "$DIR/.backend_pid"
    else
        echo "⚠️  No se encontró PID del backend"
    fi
    
    # Matar cualquier proceso PHP en puerto 8081
    pkill -f "php -S localhost:8081" > /dev/null 2>&1
}

# Función para detener frontend
stop_frontend() {
    if [[ -f "$DIR/.frontend_pid" ]]; then
        FRONTEND_PID=$(cat "$DIR/.frontend_pid")
        if kill -0 $FRONTEND_PID > /dev/null 2>&1; then
            kill $FRONTEND_PID
            echo "✅ Frontend detenido (PID: $FRONTEND_PID)"
        else
            echo "⚠️  Frontend ya estaba detenido"
        fi
        rm "$DIR/.frontend_pid"
    else
        echo "⚠️  No se encontró PID del frontend"
    fi
    
    # Matar cualquier proceso Expo en puerto 8082
    lsof -ti:8082 | xargs kill -9 > /dev/null 2>&1
}

# Detener servicios
stop_backend
stop_frontend

# Limpiar archivos temporales
rm -f "$DIR/.backend_pid" "$DIR/.frontend_pid"

echo "🎯 SL8.ai detenido completamente"
