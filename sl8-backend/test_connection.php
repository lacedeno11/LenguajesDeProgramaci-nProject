<?php
/**
 * Script de prueba de conexión a la base de datos
 * Ejecutar este archivo primero para verificar que todo esté configurado
 */

require_once 'config.php';

echo "<h2>🧪 Test de Conexión - SL8.ai Backend</h2>";
echo "<hr>";

// Test 1: Conexión a la base de datos
echo "<h3>1. Probando conexión a la base de datos...</h3>";
$pdo = getDBConnection();

if ($pdo) {
    echo "✅ <strong>Conexión exitosa!</strong><br>";
    echo "📊 Base de datos: " . DB_NAME . "<br>";
    echo "🖥️ Host: " . DB_HOST . "<br><br>";
    
    // Test 2: Verificar tablas
    echo "<h3>2. Verificando tablas...</h3>";
    try {
        $stmt = $pdo->query("SHOW TABLES");
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        if (count($tables) > 0) {
            echo "✅ <strong>Tablas encontradas:</strong><br>";
            foreach ($tables as $table) {
                echo "📋 " . $table . "<br>";
            }
        } else {
            echo "⚠️ <strong>No se encontraron tablas. Ejecuta database.sql primero.</strong><br>";
        }
        
        echo "<br>";
        
        // Test 3: Verificar datos de prueba
        echo "<h3>3. Verificando datos de prueba...</h3>";
        
        // Contar usuarios
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
        $userCount = $stmt->fetch()['count'];
        echo "👥 Usuarios en BD: " . $userCount . "<br>";
        
        // Contar sesiones
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM canvas_sessions");
        $sessionCount = $stmt->fetch()['count'];
        echo "🎨 Sesiones de canvas: " . $sessionCount . "<br>";
        
        if ($userCount > 0 && $sessionCount > 0) {
            echo "<br>✅ <strong>Datos de prueba disponibles!</strong><br>";
            
            // Mostrar usuario de prueba
            $stmt = $pdo->query("SELECT id, email, created_at FROM users LIMIT 1");
            $user = $stmt->fetch();
            echo "🔑 Usuario de prueba: " . $user['email'] . " (ID: " . $user['id'] . ")<br>";
            
            // Mostrar sesión de prueba
            $stmt = $pdo->query("SELECT id, title, created_at FROM canvas_sessions LIMIT 1");
            $session = $stmt->fetch();
            echo "🎨 Sesión de prueba: " . $session['title'] . " (ID: " . $session['id'] . ")<br>";
        } else {
            echo "<br>⚠️ <strong>Faltan datos de prueba. Ejecuta database.sql completo.</strong><br>";
        }
        
    } catch (PDOException $e) {
        echo "❌ <strong>Error al verificar tablas:</strong> " . $e->getMessage() . "<br>";
    }
    
} else {
    echo "❌ <strong>Error de conexión!</strong><br>";
    echo "🔧 Verifica la configuración en config.php<br>";
    echo "🗄️ Asegúrate de que MySQL esté corriendo<br>";
    echo "📋 Ejecuta database.sql para crear la base de datos<br>";
}

echo "<hr>";
echo "<h3>4. URLs de prueba para Postman:</h3>";
echo "💾 <strong>Guardar Pizarra:</strong> POST http://localhost/sl8-backend/save_canvas.php<br>";
echo "📖 <strong>Cargar Pizarra:</strong> GET http://localhost/sl8-backend/load_canvas.php?id=1<br>";
echo "<br>";
echo "📚 <strong>Consulta README_LUIS.md para ejemplos completos de testing</strong>";
?>