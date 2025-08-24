<?php
/**
 * Router Principal API REST - SL8.ai
 * Punto de entrada unificado para toda la API
 */

// Configuración de desarrollo
define('DEVELOPMENT_MODE', true);

// Cargar configuración CORS
require_once '../config/cors.php';

// Cargar todas las dependencias
require_once '../config/database.php';
require_once '../utils/response.php';
require_once '../utils/validator.php';
require_once '../middleware/auth.php';

// Obtener la ruta solicitada
$request_uri = $_SERVER['REQUEST_URI'];
$request_method = $_SERVER['REQUEST_METHOD'];

// Remover query string si existe
$path = parse_url($request_uri, PHP_URL_PATH);

// Remover prefijo /api si existe
$path = preg_replace('#^/api#', '', $path);

// Enrutamiento
try {
    switch (true) {
        // Rutas de autenticación
        case preg_match('#^/auth/register$#', $path) && $request_method === 'POST':
            require_once 'auth.php';
            handleRegister();
            break;
            
        case preg_match('#^/auth/login$#', $path) && $request_method === 'POST':
            require_once 'auth.php';
            handleLogin();
            break;
            
        case preg_match('#^/auth/logout$#', $path) && $request_method === 'POST':
            require_once 'auth.php';
            handleLogout();
            break;
            
        // Rutas de sesiones (pizarras)
        case preg_match('#^/sessions$#', $path) && $request_method === 'GET':
            require_once 'sessions.php';
            handleListSessions();
            break;
            
        case preg_match('#^/sessions$#', $path) && $request_method === 'POST':
            require_once 'sessions.php';
            handleCreateSession();
            break;
            
        case preg_match('#^/sessions/(\d+)$#', $path, $matches) && $request_method === 'GET':
            require_once 'sessions.php';
            handleGetSession($matches[1]);
            break;
            
        case preg_match('#^/sessions/(\d+)$#', $path, $matches) && $request_method === 'PUT':
            require_once 'sessions.php';
            handleUpdateSession($matches[1]);
            break;
            
        case preg_match('#^/sessions/(\d+)$#', $path, $matches) && $request_method === 'DELETE':
            require_once 'sessions.php';
            handleDeleteSession($matches[1]);
            break;
            
        // Ruta de health check
        case preg_match('#^/health$#', $path) && $request_method === 'GET':
            ApiResponse::success([
                'status' => 'healthy',
                'version' => '1.0.0',
                'timestamp' => date('c')
            ], 'SL8.ai API is running');
            break;
            
        // Ruta no encontrada
        default:
            ApiResponse::notFound("Endpoint not found: {$request_method} {$path}");
            break;
    }
    
} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    ApiResponse::serverError("An unexpected error occurred");
}
