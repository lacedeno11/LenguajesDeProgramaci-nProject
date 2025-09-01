<?php
/**
 * ENDPOINT SIMPLE - Gestión de Imágenes
 * Guardar y listar imágenes del canvas
 */

require_once 'config.php';

// Crear directorio de imágenes si no existe
$imagesDir = __DIR__ . '/images';
if (!file_exists($imagesDir)) {
    mkdir($imagesDir, 0755, true);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // GUARDAR IMAGEN
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['image_data']) || !isset($input['title'])) {
            sendJSONResponse([
                'success' => false,
                'message' => 'Faltan datos: image_data y title son requeridos',
                'error' => 'MISSING_DATA'
            ], 400);
            exit();
        }
        
        $imageData = $input['image_data']; // Base64 string
        $title = $input['title'];
        $timestamp = time();
        
        // Limpiar el título para nombre de archivo
        $safeTitle = preg_replace('/[^a-zA-Z0-9_-]/', '_', $title);
        $filename = $timestamp . '_' . $safeTitle . '.png';
        $filepath = $imagesDir . '/' . $filename;
        
        // Remover el prefijo data:image/png;base64, si existe
        if (strpos($imageData, 'data:image') === 0) {
            $imageData = explode(',', $imageData)[1];
        }
        
        // Decodificar y guardar
        $decodedImage = base64_decode($imageData);
        
        if ($decodedImage === false) {
            sendJSONResponse([
                'success' => false,
                'message' => 'Datos de imagen inválidos',
                'error' => 'INVALID_IMAGE_DATA'
            ], 400);
            exit();
        }
        
        if (file_put_contents($filepath, $decodedImage)) {
            // Guardar metadata en JSON
            $metadata = [
                'id' => $timestamp,
                'title' => $title,
                'filename' => $filename,
                'created_at' => date('Y-m-d H:i:s', $timestamp),
                'size' => filesize($filepath)
            ];
            
            $metadataFile = $imagesDir . '/' . $timestamp . '_metadata.json';
            file_put_contents($metadataFile, json_encode($metadata, JSON_PRETTY_PRINT));
            
            sendJSONResponse([
                'success' => true,
                'message' => 'Imagen guardada exitosamente',
                'data' => $metadata
            ]);
        } else {
            sendJSONResponse([
                'success' => false,
                'message' => 'Error al guardar la imagen',
                'error' => 'SAVE_FAILED'
            ], 500);
        }
        
    } catch (Exception $e) {
        error_log("Error guardando imagen: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Error interno del servidor',
            'error' => 'INTERNAL_ERROR'
        ], 500);
    }
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // LISTAR IMÁGENES
    try {
        $images = [];
        
        // Buscar archivos de metadata
        $metadataFiles = glob($imagesDir . '/*_metadata.json');
        
        foreach ($metadataFiles as $metadataFile) {
            $metadata = json_decode(file_get_contents($metadataFile), true);
            if ($metadata) {
                // Verificar que el archivo de imagen existe
                $imagePath = $imagesDir . '/' . $metadata['filename'];
                if (file_exists($imagePath)) {
                    // Agregar URL para acceder a la imagen
                    $metadata['image_url'] = '/images/' . $metadata['filename'];
                    $images[] = $metadata;
                }
            }
        }
        
        // Ordenar por fecha (más reciente primero)
        usort($images, function($a, $b) {
            return $b['id'] - $a['id'];
        });
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Imágenes listadas exitosamente',
            'data' => [
                'images' => $images,
                'total' => count($images)
            ]
        ]);
        
    } catch (Exception $e) {
        error_log("Error listando imágenes: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Error al listar imágenes',
            'error' => 'LIST_FAILED'
        ], 500);
    }
    
} else {
    // Método no permitido
    sendJSONResponse([
        'success' => false,
        'message' => 'Método no permitido. Use GET para listar o POST para guardar.',
        'error' => 'METHOD_NOT_ALLOWED'
    ], 405);
}
?>
