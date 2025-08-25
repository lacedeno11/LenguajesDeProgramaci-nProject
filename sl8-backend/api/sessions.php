<?php
/**
 * TEMPORAL - Sessions endpoint para compatibilidad
 */

// Headers CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $method = $_SERVER['REQUEST_METHOD'];
    
    if ($method === 'GET') {
        // Listar sesiones (mock)
        echo json_encode([
            'success' => true,
            'message' => 'Sessions retrieved successfully',
            'data' => [
                [
                    'id' => 1,
                    'title' => 'Sesión de Prueba',
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s')
                ]
            ]
        ]);
        
    } elseif ($method === 'POST') {
        // Crear nueva sesión
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid JSON input',
                'error' => 'INVALID_JSON'
            ]);
            exit();
        }
        
        // Verificar que tenemos los datos requeridos
        if (empty($input['canvas_data'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'canvas_data is required',
                'error' => 'MISSING_CANVAS_DATA'
            ]);
            exit();
        }
        
        // Simular guardado exitoso
        $title = $input['title'] ?? 'Mi Pizarra';
        $sessionId = rand(1000, 9999);
        
        echo json_encode([
            'success' => true,
            'message' => 'Session created successfully',
            'data' => [
                'id' => $sessionId,
                'title' => $title,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ]
        ]);
        
    } else {
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Method not allowed',
            'error' => 'METHOD_NOT_ALLOWED'
        ]);
    }
    
} catch (Exception $e) {
    error_log("Error en sessions.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error',
        'error' => 'INTERNAL_ERROR'
    ]);
}
?>
