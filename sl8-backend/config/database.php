<?php
/**
 * Configuración Unificada de Base de Datos - SL8.ai API
 */

class Database {
    private static $instance = null;
    private $connection;
    
    // Configuración de la base de datos
    private const DB_HOST = 'localhost';
    private const DB_NAME = 'sl8_whiteboard';
    private const DB_USER = 'root';
    private const DB_PASS = 'Lookatm-e5';
    
    private function __construct() {
        try {
            $dsn = "mysql:host=" . self::DB_HOST . ";dbname=" . self::DB_NAME . ";charset=utf8mb4";
            $this->connection = new PDO($dsn, self::DB_USER, self::DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]);
        } catch (PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            throw new Exception("Database connection failed" . $e->getMessage());
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->connection;
    }
    
    public function query($sql, $params = []) {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            error_log("Query failed: " . $e->getMessage());
            throw new Exception("Database query failed");
        }
    }
    
    public function lastInsertId() {
        return $this->connection->lastInsertId();
    }
}
