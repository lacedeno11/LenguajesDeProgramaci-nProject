<?php
/**
 * COMPONENTE: Guardar Pizarra (Escritura)
 * RESPONSABLE: Luis Cedeño
 * DESCRIPCIÓN: Guarda una nueva sesión de canvas en la base de datos
 * MÉTODO: POST
 * PARÁMETROS: user_id, title, canvas_data
 */

require_once 'config.php';

// Solo permitir método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Método no permitido. Use POST.', 405);
}

try {
    // Obtener datos del POST
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validar que se recibieron datos JSON válidos
    if (json_last_error() !== JSON_ERROR_NONE) {
        sendError('JSON inválido: ' . json_last_error_msg());
    }
    
    // Validar campos requeridos
    $required = ['user_id', 'canvas_data'];
    validateRequired($input, $required);
    
    // Extraer y validar datos
    $user_id = (int) $input['user_id'];
    $title = isset($input['title']) ? trim($input['title']) : 'Mi Pizarra';
    $canvas_data = $input['canvas_data'];
    
    // Validar user_id
    if ($user_id <= 0) {
        sendError('user_id debe ser un número positivo');
    }
    
    // Validar que canvas_data sea un JSON válido
    if (is_string($canvas_data)) {
        $decoded = json_decode($canvas_data, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            sendError('canvas_data debe ser un JSON válido');
        }
    } else if (is_array($canvas_data)) {
        // Si ya es un array, convertir a JSON string
        $canvas_data = json_encode($canvas_data, JSON_UNESCAPED_UNICODE);
    } else {
        sendError('canvas_data debe ser un JSON válido');
    }
    
    // Conectar a la base de datos
    $pdo = getDBConnection();
    if (!$pdo) {
        sendError('Error de conexión a la base de datos', 500);
    }
    
    // Verificar que el usuario existe
    $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    if (!$stmt->fetch()) {
        sendError('Usuario no encontrado', 404);
    }
    
    // Insertar nueva sesión de canvas
    $stmt = $pdo->prepare("
        INSERT INTO canvas_sessions (user_id, title, canvas_data) 
        VALUES (?, ?, ?)
    ");
    
    $result = $stmt->execute([$user_id, $title, $canvas_data]);
    
    if ($result) {
        $session_id = $pdo->lastInsertId();
        
        // Respuesta exitosa
        sendJSONResponse([
            'success' => true,
            'message' => 'Pizarra guardada exitosamente',
            'data' => [
                'session_id' => $session_id,
                'user_id' => $user_id,
                'title' => $title,
                'created_at' => date('Y-m-d H:i:s')
            ],
            'timestamp' => date('Y-m-d H:i:s')
        ], 201);
    } else {
        sendError('Error al guardar la pizarra', 500);
    }
    
} catch (PDOException $e) {
    error_log("Error en save_canvas.php: " . $e->getMessage());
    sendError('Error de base de datos', 500);
} catch (Exception $e) {
    error_log("Error general en save_canvas.php: " . $e->getMessage());
    sendError('Error interno del servidor', 500);
}
?>