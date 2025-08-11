-- Script de Base de Datos para SL8.ai Backend
-- Crear base de datos y tablas necesarias

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS sl8_whiteboard 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE sl8_whiteboard;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB;

-- Tabla de sesiones de canvas (pizarras)
CREATE TABLE IF NOT EXISTS canvas_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) DEFAULT 'Mi Pizarra',
    canvas_data LONGTEXT NOT NULL,  -- JSON con datos del canvas
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- Insertar usuario de prueba
INSERT INTO users (email, password_hash) VALUES 
('test@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'); -- password: password

-- Insertar sesión de canvas de prueba
INSERT INTO canvas_sessions (user_id, title, canvas_data) VALUES 
(1, 'Pizarra de Prueba', '{"version":"1.0","timestamp":"2025-01-08T10:30:00Z","canvas":{"width":800,"height":600,"background":"#ffffff"},"elements":[{"type":"stroke","id":"stroke_1","tool":"pen","color":"#000000","width":2,"points":[{"x":100,"y":150,"pressure":0.5},{"x":102,"y":152,"pressure":0.6}],"timestamp":"2025-01-08T10:30:01Z"}]}');

-- Mostrar estructura creada
SHOW TABLES;
SELECT 'Base de datos creada exitosamente' as status;