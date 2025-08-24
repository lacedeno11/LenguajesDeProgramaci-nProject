<?php
/**
 * Controlador de Autenticación - SL8.ai API
 * Maneja registro, login y logout de usuarios
 */

/**
 * Manejar registro de usuario
 */
function handleRegister() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        ApiResponse::error("Invalid JSON input", 400);
    }
    
    // Validar datos de entrada
    $errors = Validator::validateRegistration($input);
    if (!empty($errors)) {
        ApiResponse::validationError($errors);
    }
    
    $db = Database::getInstance();
    
    try {
        // Verificar si el email ya existe
        $stmt = $db->query("SELECT id FROM users WHERE email = ?", [$input['email']]);
        if ($stmt->fetch()) {
            ApiResponse::error("Email already registered", 409);
        }
        
        // Hashear contraseña
        $password_hash = password_hash($input['password'], PASSWORD_DEFAULT);
        
        // Insertar usuario
        $stmt = $db->query(
            "INSERT INTO users (email, password_hash) VALUES (?, ?)",
            [$input['email'], $password_hash]
        );
        
        $user_id = $db->lastInsertId();
        
        // Generar token JWT
        $token = AuthMiddleware::generateToken($user_id, $input['email']);
        
        ApiResponse::success([
            'user' => [
                'id' => $user_id,
                'email' => $input['email']
            ],
            'token' => $token
        ], "User registered successfully", 201);
        
    } catch (Exception $e) {
        error_log("Registration error: " . $e->getMessage());
        ApiResponse::serverError("Registration failed");
    }
}

/**
 * Manejar login de usuario
 */
function handleLogin() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        ApiResponse::error("Invalid JSON input", 400);
    }
    
    // Validar datos de entrada
    $errors = Validator::validateLogin($input);
    if (!empty($errors)) {
        ApiResponse::validationError($errors);
    }
    
    $db = Database::getInstance();
    
    try {
        // Buscar usuario
        $stmt = $db->query("SELECT id, email, password_hash FROM users WHERE email = ?", [$input['email']]);
        $user = $stmt->fetch();
        
        if (!$user || !password_verify($input['password'], $user['password_hash'])) {
            ApiResponse::error("Invalid email or password", 401);
        }
        
        // Generar token JWT
        $token = AuthMiddleware::generateToken($user['id'], $user['email']);
        
        ApiResponse::success([
            'user' => [
                'id' => $user['id'],
                'email' => $user['email']
            ],
            'token' => $token
        ], "Login successful");
        
    } catch (Exception $e) {
        error_log("Login error: " . $e->getMessage());
        ApiResponse::serverError("Login failed");
    }
}

/**
 * Manejar logout (invalidar token del lado cliente)
 */
function handleLogout() {
    // Para JWT stateless, el logout se maneja del lado cliente
    // Aquí podríamos implementar blacklist de tokens si fuera necesario
    
    ApiResponse::success(null, "Logged out successfully");
}
