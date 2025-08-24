<?php
/**
 * Utilidades para respuestas API estandarizadas - SL8.ai
 */

class ApiResponse {
    
    /**
     * Enviar respuesta de éxito
     */
    public static function success($data = null, $message = "Success", $code = 200) {
        http_response_code($code);
        echo json_encode([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'timestamp' => date('c')
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }
    
    /**
     * Enviar respuesta de error
     */
    public static function error($message = "Error", $code = 400, $details = null) {
        http_response_code($code);
        echo json_encode([
            'success' => false,
            'message' => $message,
            'error' => $details,
            'timestamp' => date('c')
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }
    
    /**
     * Enviar respuesta de error de validación
     */
    public static function validationError($errors, $message = "Validation failed") {
        self::error($message, 422, $errors);
    }
    
    /**
     * Enviar respuesta de no autorizado
     */
    public static function unauthorized($message = "Unauthorized") {
        self::error($message, 401);
    }
    
    /**
     * Enviar respuesta de no encontrado
     */
    public static function notFound($message = "Resource not found") {
        self::error($message, 404);
    }
    
    /**
     * Enviar respuesta de error del servidor
     */
    public static function serverError($message = "Internal server error") {
        self::error($message, 500);
    }
}
