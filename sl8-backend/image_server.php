<?php
/**
 * SERVIDOR DE IMÁGENES
 * Sirve las imágenes guardadas
 */

$requestedPath = $_SERVER['REQUEST_URI'];
$path = parse_url($requestedPath, PHP_URL_PATH);

// Verificar si es una request de imagen
if (strpos($path, '/images/') === 0) {
    $filename = basename($path);
    $filepath = __DIR__ . '/images/' . $filename;
    
    if (file_exists($filepath) && is_file($filepath)) {
        // Determinar content type
        $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        $contentType = 'image/png'; // Default
        
        switch ($extension) {
            case 'jpg':
            case 'jpeg':
                $contentType = 'image/jpeg';
                break;
            case 'png':
                $contentType = 'image/png';
                break;
            case 'gif':
                $contentType = 'image/gif';
                break;
            case 'webp':
                $contentType = 'image/webp';
                break;
        }
        
        // Headers para servir imagen
        header('Content-Type: ' . $contentType);
        header('Content-Length: ' . filesize($filepath));
        header('Cache-Control: public, max-age=3600'); // Cache por 1 hora
        
        // Servir archivo
        readfile($filepath);
        exit();
    } else {
        // Imagen no encontrada
        header('HTTP/1.0 404 Not Found');
        echo '404 - Imagen no encontrada';
        exit();
    }
}

// Si no es una imagen, mostrar info
header('Content-Type: text/html; charset=utf-8');
echo '<h2>🖼️ Servidor de Imágenes SL8.ai</h2>';
echo '<p>Para ver imágenes: <code>/images/filename.png</code></p>';
echo '<p>Para API: <code>/images_api.php</code></p>';
?>
