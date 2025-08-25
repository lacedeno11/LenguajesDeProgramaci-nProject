<?php
/**
 * Test simple para debugging del endpoint de autenticación
 */

// Headers CORS básicos
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Función de respuesta simple
function respond($success, $message, $data = null, $code = 200) {
    http_response_code($code);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data,
        'method' => $_SERVER['REQUEST_METHOD']
    ]);
    exit();
}

try {
    $method = $_SERVER['REQUEST_METHOD'];
    
    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            respond(false, "Invalid JSON input", null, 400);
        }
        
        $action = $input['action'] ?? '';
        $email = $input['email'] ?? '';
        $password = $input['password'] ?? '';
        
        respond(true, "POST received successfully", [
            'action' => $action,
            'email' => $email,
            'password_length' => strlen($password)
        ]);
        
    } else {
        respond(false, "Only POST method supported", null, 405);
    }
    
} catch (Exception $e) {
    respond(false, "Server error: " . $e->getMessage(), null, 500);
}
?>
