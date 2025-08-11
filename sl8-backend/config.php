<?php
/**
 * Configuración de Base de Datos - SL8.ai Backend
 * Archivo compartido para conexión a MySQL
 */

// Configuración de la base de datos
define('DB_HOST', 'localhost');
define('DB_NAME', 'sl8_whiteboard');
define('DB_USER', 'root');
define('DB_PASS', '');

// Configuración de headers CORS para desarrollo
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/**
 * Función para conectar a la base de datos
 * @return PDO|null Conexión PDO o null si falla
 */
function getDBConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
    } catch (PDOException $e) {
        error_log("Error de conexión a BD: " . $e->getMessage());
        return null;
    }
}

/**
 * Función para enviar respuesta JSON
 * @param array $data Datos a enviar
 * @param int $status Código de estado HTTP
 */
function sendJSONResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit();
}

/**
 * Función para enviar error JSON
 * @param string $message Mensaje de error
 * @param int $status Código de estado HTTP
 */
function sendError($message, $status = 400) {
    sendJSONResponse([
        'success' => false,
        'error' => $message,
        'timestamp' => date('Y-m-d H:i:s')
    ], $status);
}

/**
 * Función para validar datos requeridos
 * @param array $data Datos a validar
 * @param array $required Campos requeridos
 * @return bool True si todos los campos están presentes
 */
function validateRequired($data, $required) {
    foreach ($required as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            sendError("Campo requerido faltante: $field");
            return false;
        }
    }
    return true;
}
?>