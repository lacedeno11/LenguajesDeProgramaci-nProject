#!/bin/bash
echo "🎨 Iniciando SL8.ai Whiteboard"
echo "=============================="

# Detener procesos previos
echo "🧹 Limpiando procesos previos..."
pkill -f "php -S localhost:8081" > /dev/null 2>&1
lsof -ti:8082 | xargs kill -9 > /dev/null 2>&1

# Iniciar backend
echo "🔧 Iniciando Backend PHP..."
cd sl8-backend
php -S localhost:8081 &
BACKEND_PID=$!
echo "✅ Backend iniciado (PID: $BACKEND_PID)"

# Esperar un momento
sleep 2

# Verificar backend
if curl -s "http://localhost:8081/get_auth.php" > /dev/null; then
    echo "✅ Backend funcionando correctamente"
else
    echo "❌ Backend no responde"
fi

# Iniciar frontend
echo "⚛️  Iniciando Frontend..."
cd ../SL8Whiteboard/SL8WhiteboardExpo
npx expo start --port 8082 &
FRONTEND_PID=$!
echo "✅ Frontend iniciado (PID: $FRONTEND_PID)"

echo ""
echo "🌟 SL8.ai está ejecutándose!"
echo "=========================="
echo "🔧 Backend:  http://localhost:8081"  
echo "⚛️  Frontend: http://localhost:8082"
echo ""
echo "📱 Credenciales de prueba:"
echo "   Email: test@example.com"
echo "   Password: password"
echo ""
echo "🛑 Para detener: ./stop.sh"

# Abrir navegador
sleep 3
open http://localhost:8082 2>/dev/null || echo "Abre manualmente: http://localhost:8082"

echo ""
echo "✨ ¡Presiona Ctrl+C cuando termines!"
wait
