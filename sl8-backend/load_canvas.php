<?php
/**
 * COMPONENTE: Cargar Pizarra (Lectura)
 * RESPONSABLE: Luis Cedeño
 * DESCRIPCIÓN: Carga una sesión específica de canvas desde la base de datos
 * MÉTODO: GET
 * PARÁMETROS: id (session_id)
 */

require_once 'config.php';

// Solo permitir método GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Método no permitido. Use GET.', 405);
}

try {
    // Obtener parámetro id de la URL
    $session_id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    
    // Validar session_id
    if ($session_id <= 0) {
        sendError('Parámetro id requerido y debe ser un número positivo');
    }
    
    // Conectar a la base de datos
    $pdo = getDBConnection();
    if (!$pdo) {
        sendError('Error de conexión a la base de datos', 500);
    }
    
    // Consultar la sesión específica con información del usuario
    $stmt = $pdo->prepare("
        SELECT 
            cs.id,
            cs.user_id,
            cs.title,
            cs.canvas_data,
            cs.created_at,
            cs.updated_at,
            u.email as user_email
        FROM canvas_sessions cs
        INNER JOIN users u ON cs.user_id = u.id
        WHERE cs.id = ?
    ");
    
    $stmt->execute([$session_id]);
    $session = $stmt->fetch();
    
    if (!$session) {
        sendError('Sesión de pizarra no encontrada', 404);
    }
    
    // Decodificar canvas_data para validar que es JSON válido
    $canvas_data = json_decode($session['canvas_data'], true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log("JSON inválido en session_id $session_id: " . json_last_error_msg());
        // Aún así devolver los datos, pero marcar como inválido
        $canvas_data = $session['canvas_data'];
    }
    
    // Preparar respuesta
    $response_data = [
        'session_info' => [
            'id' => (int) $session['id'],
            'user_id' => (int) $session['user_id'],
            'user_email' => $session['user_email'],
            'title' => $session['title'],
            'created_at' => $session['created_at'],
            'updated_at' => $session['updated_at']
        ],
        'canvas_data' => $canvas_data,
        'metadata' => [
            'canvas_data_size' => strlen($session['canvas_data']),
            'elements_count' => is_array($canvas_data) && isset($canvas_data['elements']) 
                ? count($canvas_data['elements']) : 0,
            'canvas_version' => is_array($canvas_data) && isset($canvas_data['version']) 
                ? $canvas_data['version'] : 'unknown'
        ]
    ];
    
    // Respuesta exitosa
    sendJSONResponse([
        'success' => true,
        'message' => 'Pizarra cargada exitosamente',
        'data' => $response_data,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
} catch (PDOException $e) {
    error_log("Error en load_canvas.php: " . $e->getMessage());
    sendError('Error de base de datos', 500);
} catch (Exception $e) {
    error_log("Error general en load_canvas.php: " . $e->getMessage());
    sendError('Error interno del servidor', 500);
}
?>