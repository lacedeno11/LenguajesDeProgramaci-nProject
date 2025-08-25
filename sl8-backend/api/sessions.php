<?php
/**
 * Controlador de Sesiones de Canvas - SL8.ai API
 * Maneja CRUD de pizarras con límite de 5 por usuario
 */
require_once '../config/database.php';
require_once '../middleware/auth.php';
require_once '../utils/validator.php';
require_once '../utils/response.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = $_GET['action']||null;

switch ($method) {
    case 'GET':
        if(isset($_GET['id'])){
            try {
                handleGetSession($_GET['id']);
            } catch (Exception $e) {
                ApiResponse::error("Invalid GET request", 400);
            }
            break;
        }else{
            try {
                handleListSessions();
            } catch (Exception $e) {
                ApiResponse::error("Invalid GET request", 400);
            }
            break;
        }
    case 'POST':
        try {
            handleCreateSession();
        } catch (Exception $e) {
            ApiResponse::error("Invalid POST request", 400);
        }
        break;

    case 'PUT':
        if (isset($_GET['id'])) {
            handleUpdateSession($_GET['id']);
        } else {
            ApiResponse::error("Invalid PUT request. ID must be provided", 402);
        }
        break;

    case 'DELETE':
        if (isset($_GET['id'])) {
            handleDeleteSession($_GET['id']);
        } else {
            ApiResponse::error("Invalid DELETE request", 400);
        }
        break;

}
/**
 * Listar sesiones del usuario autenticado (máximo 5)
 */
function handleListSessions() {
    $user = AuthMiddleware::requireAuth();
    $db = Database::getInstance();
    
    try {
        $stmt = $db->query(
            "SELECT id, title, created_at, updated_at FROM canvas_sessions 
             WHERE user_id = ? 
             ORDER BY updated_at DESC 
             LIMIT 5",
            [$user['user_id']]
        );
        
        $sessions = $stmt->fetchAll();
        
        ApiResponse::success([
            'sessions' => $sessions,
            'count' => count($sessions),
            'max_sessions' => 5
        ], "Sessions retrieved successfully");
        
    } catch (Exception $e) {
        error_log("List sessions error: " . $e->getMessage());
        ApiResponse::serverError("Failed to retrieve sessions");
    }
}

/**
 * Crear nueva sesión de canvas
 */
function handleCreateSession() {
    $user = AuthMiddleware::requireAuth();
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        ApiResponse::error("Invalid JSON input", 400);
    }
    
    // Validar datos de entrada
    $errors = Validator::validateCanvasSession($input);
    if (!empty($errors)) {
        ApiResponse::validationError($errors);
    }
    
    $db = Database::getInstance();
    
    try {
        // Verificar límite de 5 sesiones por usuario
        $stmt = $db->query("SELECT COUNT(*) as count FROM canvas_sessions WHERE user_id = ?", [$user['user_id']]);
        $count = $stmt->fetch()['count'];
        
        if ($count >= 5) {
            ApiResponse::error("Maximum number of sessions reached (5). Please delete a session before creating a new one.", 409);
        }
        
        $title = $input['title'] ?? 'Mi Pizarra';
        
        // Crear nueva sesión
        $stmt = $db->query(
            "INSERT INTO canvas_sessions (user_id, title, canvas_data) VALUES (?, ?, ?)",
            [$user['user_id'], $title, $input['canvas_data']]
        );
        
        $session_id = $db->lastInsertId();
        
        // Obtener la sesión creada
        $stmt = $db->query(
            "SELECT id, title, created_at, updated_at FROM canvas_sessions WHERE id = ?",
            [$session_id]
        );
        $session = $stmt->fetch();
        
        ApiResponse::success($session, "Session created successfully", 201);
        
    } catch (Exception $e) {
        error_log("Create session error: " . $e->getMessage());
        ApiResponse::serverError("Failed to create session");
    }
}

/**
 * Obtener sesión específica con datos del canvas
 */
function handleGetSession($session_id) {
    $user = AuthMiddleware::requireAuth();
    $db = Database::getInstance();
    
    try {
        $stmt = $db->query(
            "SELECT id, title, canvas_data, created_at, updated_at 
             FROM canvas_sessions 
             WHERE id = ? AND user_id = ?",
            [$session_id, $user['user_id']]
        );
        
        $session = $stmt->fetch();
        
        if (!$session) {
            ApiResponse::notFound("Session not found");
        }
        
        // Decodificar canvas_data para verificar que es JSON válido
        $canvas_data = json_decode($session['canvas_data'], true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            $session['canvas_data'] = null;
        } else {
            $session['canvas_data'] = $canvas_data;
        }
        
        ApiResponse::success($session, "Session retrieved successfully");
        
    } catch (Exception $e) {
        error_log("Get session error: " . $e->getMessage());
        ApiResponse::serverError("Failed to retrieve session");
    }
}

/**
 * Actualizar sesión existente
 */
function handleUpdateSession($session_id) {
    $user = AuthMiddleware::requireAuth();
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        ApiResponse::error("Invalid JSON input", 400);
    }
    
    // Validar datos de entrada
    $errors = Validator::validateCanvasSession($input);
    if (!empty($errors)) {
        ApiResponse::validationError($errors);
    }
    
    $db = Database::getInstance();
    
    try {
        // Verificar que la sesión existe y pertenece al usuario
        $stmt = $db->query(
            "SELECT id FROM canvas_sessions WHERE id = ? AND user_id = ?",
            [$session_id, $user['user_id']]
        );
        
        if (!$stmt->fetch()) {
            ApiResponse::notFound("Session not found");
        }
        
        $title = $input['title'] ?? 'Mi Pizarra';
        
        // Actualizar sesión
        $stmt = $db->query(
            "UPDATE canvas_sessions SET title = ?, canvas_data = ?, updated_at = CURRENT_TIMESTAMP 
             WHERE id = ? AND user_id = ?",
            [$title, $input['canvas_data'], $session_id, $user['user_id']]
        );
        
        // Obtener la sesión actualizada
        $stmt = $db->query(
            "SELECT id, title, created_at, updated_at FROM canvas_sessions WHERE id = ?",
            [$session_id]
        );
        $session = $stmt->fetch();
        
        ApiResponse::success($session, "Session updated successfully");
        
    } catch (Exception $e) {
        error_log("Update session error: " . $e->getMessage());
        ApiResponse::serverError("Failed to update session");
    }
}

/**
 * Eliminar sesión
 */
function handleDeleteSession($session_id) {
    $user = AuthMiddleware::requireAuth();
    $db = Database::getInstance();
    
    try {
        // Verificar que la sesión existe y pertenece al usuario
        $stmt = $db->query(
            "SELECT id FROM canvas_sessions WHERE id = ? AND user_id = ?",
            [$session_id, $user['user_id']]
        );
        
        if (!$stmt->fetch()) {
            ApiResponse::notFound("Session not found");
        }
        
        // Eliminar sesión
        $stmt = $db->query(
            "DELETE FROM canvas_sessions WHERE id = ? AND user_id = ?",
            [$session_id, $user['user_id']]
        );
        
        ApiResponse::success(null, "Session deleted successfully");
        
    } catch (Exception $e) {
        error_log("Delete session error: " . $e->getMessage());
        ApiResponse::serverError("Failed to delete session");
    }
}
