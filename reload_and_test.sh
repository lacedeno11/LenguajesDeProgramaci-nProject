#!/bin/bash

echo "🔄 Reloading Expo application..."

# Attempt to trigger reload via different methods
echo "Method 1: Using Expo CLI interface..."
cd /Users/abrahamcedeno/Documents/LenguajesDeProgramaci-nProject/SL8Whiteboard/SL8WhiteboardExpo

# Method 2: Check if application is running and accessible
echo "Method 2: Checking if app is accessible..."
curl -s "http://localhost:8082" > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ App is running on http://localhost:8082"
else
    echo "❌ App is not accessible on http://localhost:8082"
fi

echo "🌐 Opening browser to http://localhost:8082"
if command -v open >/dev/null 2>&1; then
    open "http://localhost:8082"
elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "http://localhost:8082"
else
    echo "Please manually open http://localhost:8082 in your browser"
fi

echo "✅ Check complete. Look for 'TEST LOGOUT' button in the UI."
