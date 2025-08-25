# AI\_INTEGRATION.md

> Documento: Integración de Gemini 2.5 con SL8.ai

---

## Objetivo

Este documento describe la integración técnica entre SL8.ai y **Gemini 2.5** para el análisis de capturas de canvas, generación de pistas en 6 niveles de ayuda y flujos de fallback. Incluye ejemplos completos de código (frontend React Native/Expo, backend PHP, y esquema de base de datos), especificaciones de API y diagramas Mermaid.

---

## Índice

* Arquitectura de integración
* Especificación API (endpoints /api/ai/analyze y /api/ai/hint)
* Formatos de request / response
* Sistema de 6 niveles de ayuda (tabla y reglas)
* Frontend: captura screenshot y envío (React Native / Expo)
* Backend: endpoints PHP que llaman a Gemini (cURL) + almacenamiento en MySQL
* Esquema de base de datos para logs y sesiones AI
* Manejo de errores y fallback
* Consideraciones de rendimiento, seguridad y privacidad
* Ejemplos de prompts y templates

---

## Arquitectura de integración

```mermaid
flowchart TD
  A[User on Mobile App (React Native/Expo)] -->|screenshot base64 + metadata| B[Backend API (PHP)]
  B --> C{Preprocess}
  C -->|compress/resize| C1[Image Optimizer]
  C -->|anonymize metadata| C2[Sanitizer]
  C --> D[Gemini 2.5 API (generateContent)]
  D --> E[AI response: hint / analysis]
  E --> F[Persist logs (MySQL)]
  F --> A[Return hint to mobile client]
```

---

## Especificación API (OpenAPI-style fragments)

### POST /api/ai/analyze

* **Propósito:** Enviar una captura del canvas para análisis general (clasificación, detección de errores, extracción de elementos).
* **Request body (application/json):**

  * `sessionId` (string)
  * `screenshot` (string, base64 PNG/JPEG)
  * `context` (string, opcional)
  * `actionHistory` (array, opcional) — lista de últimas acciones en el canvas
  * `meta` (object) — tamaño, device, language

### POST /api/ai/hint

* **Propósito:** Solicitar una pista en un nivel específico para la sesión.
* **Request body:**

  * `sessionId` (string)
  * `helpLevel` (integer 1..6)
  * `screenshot` (string, base64, opcional — recomendado si hay elementos visuales relevantes)
  * `context` (string)

---

## Formato ejemplo: request / response

**Request (hint):**

```json
{
  "sessionId": "abc123",
  "helpLevel": 4,
  "screenshot": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
  "context": "Implementación de QuickSort en pseudocódigo"
}
```

**Response:**

```json
{
  "hint": "Considera dividir el arreglo en subarreglos y ordenar cada uno recursivamente. ¿Qué condición de parada usarías?",
  "level": 4,
  "tokensUsed": 123,
  "confidence": 0.82,
  "sourceModel": "gemini-2.5-flash"
}
```

---

## Sistema de 6 niveles de ayuda

| Nivel |        Etiqueta | Qué devuelve el modelo                           | Restricciones                                                                           |
| ----- | --------------: | ------------------------------------------------ | --------------------------------------------------------------------------------------- |
| 1     |     `encourage` | Mensaje genérico de motivación                   | No dar información técnica                                                              |
| 2     |       `concept` | Explicación conceptual breve                     | Sin algoritmos ni código                                                                |
| 3     |       `analogy` | Analogía o ejemplo no técnico                    | No incluir pasos concretos                                                              |
| 4     |  `partial_hint` | Pista de subpaso o idea de enfoque               | No mostrar pseudocódigo completo                                                        |
| 5     |     `structure` | Estructura de la solución (pasos)                | No proporcionar solución final completa                                                 |
| 6     | `detailed_expl` | Explicación detallada y guía para implementación | Evitar entregar la solución exacta del ejercicio si la política del producto lo prohíbe |

**Reglas de negocio:**

* Si el usuario solicita `helpLevel = 6`, el sistema añade una comprobación por límites de exposición (e.g., evitar respuesta que sea copia literal de la solución esperada en exámenes).
* Si la respuesta es ambigua (confidence < 0.5) se sugiere `fallback` al nivel anterior.

---

## Frontend: React Native / Expo (captura screenshot y envío)

> Archivo: `src/services/aiService.ts`

```tsx
// React Native + Expo example (TypeScript)
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { captureRef } from 'react-native-view-shot';

type HintRequest = {
  sessionId: string;
  helpLevel: number;
  screenshot?: string; // data URL
  context?: string;
};

export async function captureCanvasAndSend(viewRef: any, body: HintRequest) {
  // capture view as PNG
  const uri = await captureRef(viewRef, { format: 'png', quality: 0.8 });

  // resize/compress for performance
  const manipulated = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 1200 } }], { compress: 0.7, format: ImageManipulator.SaveFormat.PNG });

  const b64 = await FileSystem.readAsStringAsync(manipulated.uri, { encoding: FileSystem.EncodingType.Base64 });
  const dataUrl = `data:image/png;base64,${b64}`;

  const payload = {
    ...body,
    screenshot: dataUrl,
  };

  const res = await fetch('https://api.sl8.ai/api/ai/hint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('AI request failed');
  return await res.json();
}
```

**Notas frontend**:

* `react-native-view-shot` para capturar el canvas.
* `expo-image-manipulator` para redimensionar/comprimir antes del envío.
* Enviar como `data:image/png;base64,...` para facilitar la decodificación en backend.

---

## Backend: PHP (Laravel-style plain PHP examples)

> Archivo: `api/ai/hint.php`

```php
<?php
// ai/hint.php
// Assumes you have composer autoload and dotenv for config

require __DIR__.'/../../vendor/autoload.php';
$payload = json_decode(file_get_contents('php://input'), true);
$sessionId = $payload['sessionId'] ?? null;
$helpLevel = intval($payload['helpLevel'] ?? 1);
$screenshot = $payload['screenshot'] ?? null; // data:image/png;base64,...
$context = $payload['context'] ?? '';

// Basic validation
if (!$sessionId) {
  http_response_code(400);
  echo json_encode(['error' => 'sessionId required']);
  exit;
}

// Preprocess screenshot: strip data url prefix
if ($screenshot && preg_match('/^data:\w+\/\w+;base64,/', $screenshot)) {
  $screenshot = preg_replace('/^data:\w+\/\w+;base64,/', '', $screenshot);
}

// Optional: store raw request to DB for auditing (see DB schema later)

// Prepare prompt/template for Gemini
$prompt = "You are an educational assistant. Provide a hint of level {$helpLevel} for the following context: {$context}.";

// Use Google Gemini REST API (generativelanguage)
$api_key = getenv('GEMINI_API_KEY');
$model = 'gemini-2.5-flash';
$url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$api_key}";

// Build request body
$requestBody = [
  'contents' => [
    [
      'parts' => [
        ['text' => $prompt]
      ]
    ]
  ]
];

// If screenshot present, include it as an inline image part (Gemini supports base64 inline images)
if ($screenshot) {
  $requestBody['contents'][0]['parts'][] = ['image' => ['mime_type' => 'image/png', 'data' => $screenshot]];
}

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestBody));
$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
if (curl_errno($ch)) {
  error_log('cURL error: '.curl_error($ch));
}
curl_close($ch);

if ($httpcode >= 400) {
  http_response_code(502);
  echo json_encode(['error' => 'AI provider error', 'details' => $response]);
  exit;
}

$result = json_decode($response, true);
// Extract text from Gemini response structure (example dependent on API version)
$hintText = '';
if (isset($result['candidates'][0]['content'][0]['text'])) {
  $hintText = $result['candidates'][0]['content'][0]['text'];
} else if (isset($result['text'])) {
  $hintText = $result['text'];
}

// Persist log into DB (pseudo)
// saveAIHintLog($sessionId, $helpLevel, $context, $hintText, $result);

// Response to client
header('Content-Type: application/json');
echo json_encode([
  'hint' => $hintText,
  'level' => $helpLevel,
  'sourceModel' => $model,
]);
```

**Notas backend**:

* El ejemplo usa la API REST `generateContent` de Gemini. Ajusta `model` y la estructura del body según versión de API.
* Autenticación: en muchos entornos se usa `x-goog-api-key` o autenticación con OAuth2/Google Cloud service accounts. Aquí usamos `?key=` para explicitar un API key (ajusta según tu entorno y política de seguridad).

---

## Esquema de base de datos (MySQL)

```sql
CREATE TABLE ai_hint_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(128) NOT NULL,
  help_level TINYINT NOT NULL,
  context TEXT,
  request_payload JSON,
  response_payload JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Manejo de errores y fallback

1. **Timeout con el proveedor**: timeout a 10s en backend, si se excede se responde con mensaje de fallback del tipo: "No puedo generar una pista ahora; intenta una pista de nivel menor o revisa tu conexión.".
2. **Respuesta ambigua / baja confianza**: si el `confidence` o heurística indica incertidumbre, intentar reintentar una vez con `helpLevel - 1`.
3. **Contenido inapropiado detectado**: si el modelo devuelve texto que contiene lenguaje ofensivo o violaciones, reemplazar por mensaje seguro y registrar incidente.
4. **Rate limits**: implementar colas y backoff exponencial. Registrar métricas.

---

## Consideraciones de rendimiento y seguridad

* **Compresión de imágenes**: re-dimensionar a un ancho máximo (ej. 1200px) y comprimir antes de enviar.
* **Anonymize**: eliminar metadatos (device id, user PII) antes del envio.
* **Autenticación**: todas las rutas AI deben requerir JWT firmado por el backend.
* **Cost control**: trackear tokens/requests por sesión y aplicar límites (ej. 10 hints por sesión sin autorización extra).
* **Escalado**: colocar un worker/queue (RabbitMQ/Resque) para llamadas a Gemini y ejecutar retrys.

---

## Templates de prompts (ejemplos)

**Prompt template (nivel 4 - partial\_hint):**

```
You are an educational assistant for algorithmic thinking. The user context: {{context}}. The user's canvas image is attached (if any).
Produce a concise hint at help level 4: a partial sub-step the student can attempt next. Avoid giving full code or final answer. Keep it under 50 words.
```

**Prompt template (nivel 6 - detailed\_expl):**

```
You are an expert tutor. The user context: {{context}}. Provide a detailed explanation with step-by-step guidance they can implement, but do NOT provide a verbatim solution if this is for graded exercise. Use numbered steps and mention edge cases.
```

---

## Checklist de implementación

* [ ] Añadir variables de entorno seguras para GEMINI\_API\_KEY o configurar Service Account
* [ ] Implementar límites por usuario/session
* [ ] Crear tabla `ai_hint_logs` y endpoints para auditoría
* [ ] Crear working queue para llamadas al proveedor de AI
* [ ] Tests E2E que simulen peticiones de hint y verifiquen comportamientos de fallback

---

## Anexos

* **Notas**: Ajusta los ejemplos de payload según la versión de la API Gemini que vayas a usar (podría cambiar la estructura `candidates` / `text`).
* **Contacto**: Persona responsable de IA: `ai_lead@sl8.ai`

---

*Fin de AI\_INTEGRATION.md*
