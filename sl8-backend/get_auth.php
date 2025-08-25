<?php
/**
 * TEMPORAL - GET Auth endpoint para compatibilidad
 */

// Headers CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Solo permitir método GET por ahora
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido. Use GET.',
        'error' => 'METHOD_NOT_ALLOWED'
    ]);
    exit();
}

try {
    $action = $_GET['action'] ?? '';
    $email = $_GET['email'] ?? '';
    $password = $_GET['password'] ?? '';
    
    if (empty($action) || empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Faltan parámetros requeridos',
            'error' => 'MISSING_PARAMETERS'
        ]);
        exit();
    }
    
    if ($action === 'login') {
        // Para debugging: usar credenciales hardcoded
        if ($email === 'test@example.com' && $password === 'password') {
            echo json_encode([
                'success' => true,
                'message' => 'Login exitoso',
                'data' => [
                    'user' => [
                        'id' => 1,
                        'email' => 'test@example.com',
                        'name' => 'Usuario de Prueba'
                    ],
                    'token' => 'fake-jwt-token-for-debugging-' . time()
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Credenciales inválidas',
                'error' => 'INVALID_CREDENTIALS'
            ]);
        }
    } else {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Acción no soportada',
            'error' => 'UNSUPPORTED_ACTION'
        ]);
    }
    
} catch (Exception $e) {
    error_log("Error en get_auth.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error interno del servidor',
        'error' => 'INTERNAL_ERROR'
    ]);
}
?>
