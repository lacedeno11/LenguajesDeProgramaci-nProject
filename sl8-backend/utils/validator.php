<?php
/**
 * Validador de inputs para SL8.ai API
 */

class Validator {
    
    /**
     * Validar email
     */
    public static function email($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }
    
    /**
     * Validar contraseña (mínimo 6 caracteres)
     */
    public static function password($password) {
        return strlen($password) >= 6;
    }
    
    /**
     * Validar que un campo no esté vacío
     */
    public static function required($value) {
        return !empty(trim($value));
    }
    
    /**
     * Validar longitud de string
     */
    public static function length($value, $min = 0, $max = 255) {
        $len = strlen($value);
        return $len >= $min && $len <= $max;
    }
    
    /**
     * Validar JSON
     */
    public static function json($string) {
        json_decode($string);
        return json_last_error() === JSON_ERROR_NONE;
    }
    
    /**
     * Validar datos de registro
     */
    public static function validateRegistration($data) {
        $errors = [];
        
        if (!isset($data['email']) || !self::required($data['email'])) {
            $errors['email'] = 'Email is required';
        } elseif (!self::email($data['email'])) {
            $errors['email'] = 'Invalid email format';
        }
        
        if (!isset($data['password']) || !self::required($data['password'])) {
            $errors['password'] = 'Password is required';
        } elseif (!self::password($data['password'])) {
            $errors['password'] = 'Password must be at least 6 characters';
        }
        
        return $errors;
    }
    
    /**
     * Validar datos de login
     */
    public static function validateLogin($data) {
        $errors = [];
        
        if (!isset($data['email']) || !self::required($data['email'])) {
            $errors['email'] = 'Email is required';
        }
        
        if (!isset($data['password']) || !self::required($data['password'])) {
            $errors['password'] = 'Password is required';
        }
        
        return $errors;
    }
    
    /**
     * Validar datos de sesión de canvas
     */
    public static function validateCanvasSession($data) {
        $errors = [];
        
        if (!isset($data['canvas_data']) || !self::required($data['canvas_data'])) {
            $errors['canvas_data'] = 'Canvas data is required';
        } elseif (!self::json($data['canvas_data'])) {
            $errors['canvas_data'] = 'Canvas data must be valid JSON';
        }
        
        if (isset($data['title']) && !self::length($data['title'], 1, 255)) {
            $errors['title'] = 'Title must be between 1 and 255 characters';
        }
        
        return $errors;
    }
}
