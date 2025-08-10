# API Documentation

## Navigation

📋 **Documentation Hub**: [Main Documentation](README.md)  
🏗️ **Architecture**: [System Architecture](ARCHITECTURE.md)  
⚙️ **Installation**: [Installation Guide](INSTALLATION.md)  
👨‍💻 **Development**: [Development Guide](DEVELOPMENT.md)

---

## Table of Contents

- [Overview](#overview)
- [Authentication Endpoints](#authentication-endpoints)
- [Canvas Session Management](#canvas-session-management)
- [AI Integration Endpoints](#ai-integration-endpoints)
- [Data Structures](#data-structures)
- [Error Handling](#error-handling)
- [Authentication Flow](#authentication-flow)

---

## Overview

The SL8.ai API provides RESTful endpoints for managing user authentication, canvas sessions, and AI-powered algorithmic thinking assistance. The API is designed to support the intelligent whiteboard functionality with secure user management and seamless AI integration.

**Base URL**: `https://api.sl8.ai/v1`  
**Content-Type**: `application/json`  
**Authentication**: Bearer Token (JWT)

## Authentication Endpoints

### Register User

Creates a new user account in the system.

**Endpoint**: `POST /auth/register`

**Request Body**:
```json
{
  "email": "student@university.edu",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "institution": "University Name",
  "role": "student"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "usr_1234567890",
      "email": "student@university.edu",
      "firstName": "John",
      "lastName": "Doe",
      "institution": "University Name",
      "role": "student",
      "createdAt": "2025-01-08T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "rt_abcdef123456",
    "expiresIn": 3600
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid input data
- `409 Conflict`: Email already exists

[↑ Back to top](#table-of-contents)

### Login User

Authenticates a user and returns access tokens.

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "student@university.edu",
  "password": "securePassword123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "usr_1234567890",
      "email": "student@university.edu",
      "firstName": "John",
      "lastName": "Doe",
      "institution": "University Name",
      "role": "student"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "rt_abcdef123456",
    "expiresIn": 3600
  }
}
```

**Error Responses**:
- `400 Bad Request`: Missing email or password
- `401 Unauthorized`: Invalid credentials
- `429 Too Many Requests`: Rate limit exceeded

### Logout User

Invalidates the user's current session and tokens.

**Endpoint**: `POST /auth/logout`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body**:
```json
{
  "refreshToken": "rt_abcdef123456"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### Refresh Token

Generates a new access token using a valid refresh token.

**Endpoint**: `POST /auth/refresh`

**Request Body**:
```json
{
  "refreshToken": "rt_abcdef123456"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

## Canvas Session Management

### Get All Sessions

Retrieves all canvas sessions for the authenticated user.

**Endpoint**: `GET /sessions`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `sortBy` (optional): Sort field (createdAt, updatedAt, title)
- `sortOrder` (optional): Sort order (asc, desc)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "sess_1234567890",
        "title": "Binary Search Algorithm",
        "description": "Working through binary search implementation",
        "userId": "usr_1234567890",
        "createdAt": "2025-01-08T10:30:00Z",
        "updatedAt": "2025-01-08T11:45:00Z",
        "isActive": true,
        "metadata": {
          "problemType": "algorithm",
          "difficulty": "medium",
          "tags": ["binary-search", "arrays", "divide-conquer"]
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1
    }
  }
}
```

### Get Session by ID

Retrieves a specific canvas session with full canvas data.

**Endpoint**: `GET /sessions/{sessionId}`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "sess_1234567890",
      "title": "Binary Search Algorithm",
      "description": "Working through binary search implementation",
      "userId": "usr_1234567890",
      "createdAt": "2025-01-08T10:30:00Z",
      "updatedAt": "2025-01-08T11:45:00Z",
      "isActive": true,
      "canvasData": {
        "size": {
          "width": 4096,
          "height": 3072
        },
        "zoom": 1.0,
        "panOffset": { "x": 0, "y": 0 },
        "strokes": {
          "stroke_001": {
            "id": "stroke_001",
            "layerId": "layer_default",
            "tool": "pen",
            "points": [
              { "x": 100, "y": 150, "pressure": 0.8, "timestamp": 1704708600000 },
              { "x": 102, "y": 152, "pressure": 0.9, "timestamp": 1704708600016 }
            ],
            "style": {
              "color": "#000000",
              "width": 2,
              "opacity": 1.0,
              "lineCap": "round",
              "lineJoin": "round"
            },
            "timestamp": 1704708600000,
            "bounds": { "x": 100, "y": 150, "width": 2, "height": 2 }
          }
        },
        "textElements": {},
        "imageElements": {},
        "layers": [
          {
            "id": "layer_default",
            "name": "Default Layer",
            "visible": true,
            "locked": false,
            "opacity": 1.0,
            "order": 0,
            "strokes": ["stroke_001"],
            "textElements": [],
            "imageElements": []
          }
        ]
      },
      "metadata": {
        "problemType": "algorithm",
        "difficulty": "medium",
        "tags": ["binary-search", "arrays", "divide-conquer"],
        "aiInteractions": 3,
        "lastAiHint": "2025-01-08T11:30:00Z"
      }
    }
  }
}
```

### Create New Session

Creates a new canvas session.

**Endpoint**: `POST /sessions`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body**:
```json
{
  "title": "Sorting Algorithm Practice",
  "description": "Exploring different sorting algorithms",
  "metadata": {
    "problemType": "algorithm",
    "difficulty": "easy",
    "tags": ["sorting", "algorithms"]
  }
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Session created successfully",
  "data": {
    "session": {
      "id": "sess_9876543210",
      "title": "Sorting Algorithm Practice",
      "description": "Exploring different sorting algorithms",
      "userId": "usr_1234567890",
      "createdAt": "2025-01-08T12:00:00Z",
      "updatedAt": "2025-01-08T12:00:00Z",
      "isActive": true,
      "canvasData": {
        "size": { "width": 4096, "height": 3072 },
        "zoom": 1.0,
        "panOffset": { "x": 0, "y": 0 },
        "strokes": {},
        "textElements": {},
        "imageElements": {},
        "layers": [
          {
            "id": "layer_default",
            "name": "Default Layer",
            "visible": true,
            "locked": false,
            "opacity": 1.0,
            "order": 0,
            "strokes": [],
            "textElements": [],
            "imageElements": []
          }
        ]
      },
      "metadata": {
        "problemType": "algorithm",
        "difficulty": "easy",
        "tags": ["sorting", "algorithms"],
        "aiInteractions": 0
      }
    }
  }
}
```

### Update Session

Updates an existing canvas session with new canvas data or metadata.

**Endpoint**: `PUT /sessions/{sessionId}`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body**:
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "canvasData": {
    "size": { "width": 4096, "height": 3072 },
    "zoom": 1.2,
    "panOffset": { "x": 50, "y": 30 },
    "strokes": {
      "stroke_001": {
        "id": "stroke_001",
        "layerId": "layer_default",
        "tool": "pen",
        "points": [
          { "x": 100, "y": 150, "pressure": 0.8, "timestamp": 1704708600000 }
        ],
        "style": {
          "color": "#000000",
          "width": 2,
          "opacity": 1.0,
          "lineCap": "round",
          "lineJoin": "round"
        },
        "timestamp": 1704708600000,
        "bounds": { "x": 100, "y": 150, "width": 2, "height": 2 }
      }
    },
    "textElements": {},
    "imageElements": {}
  },
  "metadata": {
    "tags": ["binary-search", "arrays", "divide-conquer", "completed"]
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Session updated successfully",
  "data": {
    "session": {
      "id": "sess_1234567890",
      "title": "Updated Title",
      "description": "Updated description",
      "userId": "usr_1234567890",
      "updatedAt": "2025-01-08T12:30:00Z",
      "isActive": true
    }
  }
}
```

### Delete Session

Deletes a canvas session permanently.

**Endpoint**: `DELETE /sessions/{sessionId}`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Session deleted successfully"
}
```

**Error Responses**:
- `404 Not Found`: Session not found
- `403 Forbidden`: Not authorized to delete this session

## AI Integration Endpoints

### Analyze Canvas Content

Sends canvas content to Gemini 2.5 AI for analysis and algorithmic thinking guidance.

**Endpoint**: `POST /ai/analyze`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body**:
```json
{
  "sessionId": "sess_1234567890",
  "canvasData": {
    "strokes": { /* stroke data */ },
    "textElements": { /* text elements */ },
    "imageElements": { /* image elements */ }
  },
  "context": {
    "problemType": "algorithm",
    "difficulty": "medium",
    "userQuestion": "I'm trying to implement binary search but I'm stuck on the termination condition"
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "analysis": {
      "id": "analysis_1234567890",
      "sessionId": "sess_1234567890",
      "timestamp": "2025-01-08T12:45:00Z",
      "insights": [
        {
          "type": "pattern_recognition",
          "confidence": 0.85,
          "description": "I can see you're working on a binary search implementation. You've correctly identified the need for left and right pointers."
        },
        {
          "type": "gap_identification",
          "confidence": 0.92,
          "description": "The termination condition appears to be incomplete. Consider what happens when left > right."
        }
      ],
      "suggestions": [
        {
          "type": "next_step",
          "priority": "high",
          "content": "Focus on defining when the search should stop. What condition indicates the element is not found?"
        },
        {
          "type": "conceptual_hint",
          "priority": "medium",
          "content": "Think about the relationship between left and right pointers throughout the search process."
        }
      ],
      "encouragement": "You're on the right track! The core logic of binary search is there, just need to refine the edge cases."
    }
  }
}
```

### Generate Contextual Hint

Provides progressive hints based on the user's current progress and help level.

**Endpoint**: `POST /ai/hint`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body**:
```json
{
  "sessionId": "sess_1234567890",
  "helpLevel": 3,
  "context": {
    "currentStep": "implementing_termination_condition",
    "previousHints": ["hint_001", "hint_002"],
    "timeStuck": 300,
    "userMessage": "I need a hint about when to stop the binary search loop"
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "hint": {
      "id": "hint_003",
      "sessionId": "sess_1234567890",
      "level": 3,
      "timestamp": "2025-01-08T13:00:00Z",
      "content": {
        "message": "Consider this: in binary search, what happens to the search space with each iteration? When would you know for certain that the element isn't in the array?",
        "type": "guiding_question",
        "followUp": "Think about the relationship between your left and right pointers. What does it mean when left becomes greater than right?"
      },
      "metadata": {
        "helpLevel": 3,
        "category": "termination_condition",
        "estimatedDifficulty": "medium",
        "nextHelpLevel": 4
      }
    }
  }
}
```

### Get AI Interaction History

Retrieves the history of AI interactions for a specific session.

**Endpoint**: `GET /ai/history/{sessionId}`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "interactions": [
      {
        "id": "interaction_001",
        "type": "analysis",
        "timestamp": "2025-01-08T12:45:00Z",
        "request": { /* analysis request data */ },
        "response": { /* analysis response data */ }
      },
      {
        "id": "interaction_002",
        "type": "hint",
        "timestamp": "2025-01-08T13:00:00Z",
        "helpLevel": 3,
        "request": { /* hint request data */ },
        "response": { /* hint response data */ }
      }
    ],
    "summary": {
      "totalInteractions": 2,
      "averageHelpLevel": 2.5,
      "lastInteraction": "2025-01-08T13:00:00Z"
    }
  }
}
```

## Data Structures

### Canvas Data Format

The complete canvas data structure used throughout the API:

```json
{
  "size": {
    "width": 4096,
    "height": 3072
  },
  "zoom": 1.0,
  "panOffset": {
    "x": 0,
    "y": 0
  },
  "strokes": {
    "stroke_id": {
      "id": "string",
      "layerId": "string",
      "tool": "pen|pencil|highlighter|marker|eraser",
      "points": [
        {
          "x": "number",
          "y": "number",
          "pressure": "number (0-1, optional)",
          "timestamp": "number (unix timestamp)"
        }
      ],
      "style": {
        "color": "string (hex color)",
        "width": "number",
        "opacity": "number (0-1)",
        "lineCap": "round|square|butt",
        "lineJoin": "round|miter|bevel"
      },
      "timestamp": "number (unix timestamp)",
      "bounds": {
        "x": "number",
        "y": "number",
        "width": "number",
        "height": "number"
      }
    }
  },
  "textElements": {
    "text_id": {
      "id": "string",
      "layerId": "string",
      "content": "string",
      "position": {
        "x": "number",
        "y": "number"
      },
      "style": {
        "fontSize": "number",
        "fontWeight": "normal|bold",
        "fontStyle": "normal|italic",
        "color": "string (hex color)"
      },
      "timestamp": "number (unix timestamp)",
      "bounds": {
        "x": "number",
        "y": "number",
        "width": "number",
        "height": "number"
      }
    }
  },
  "imageElements": {
    "image_id": {
      "id": "string",
      "layerId": "string",
      "uri": "string (image URL or base64)",
      "position": {
        "x": "number",
        "y": "number"
      },
      "size": {
        "width": "number",
        "height": "number"
      },
      "rotation": "number (degrees)",
      "timestamp": "number (unix timestamp)",
      "bounds": {
        "x": "number",
        "y": "number",
        "width": "number",
        "height": "number"
      }
    }
  },
  "layers": [
    {
      "id": "string",
      "name": "string",
      "visible": "boolean",
      "locked": "boolean",
      "opacity": "number (0-1)",
      "order": "number",
      "strokes": ["array of stroke IDs"],
      "textElements": ["array of text element IDs"],
      "imageElements": ["array of image element IDs"]
    }
  ]
}
```

### User Data Structure

```json
{
  "id": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "institution": "string",
  "role": "student|instructor|admin",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)",
  "preferences": {
    "theme": "light|dark",
    "defaultCanvasSize": {
      "width": "number",
      "height": "number"
    },
    "aiHelpLevel": "number (1-6)"
  }
}
```

### Session Metadata Structure

```json
{
  "problemType": "algorithm|data-structure|math|general",
  "difficulty": "easy|medium|hard",
  "tags": ["array of strings"],
  "aiInteractions": "number",
  "lastAiHint": "string (ISO 8601)",
  "timeSpent": "number (seconds)",
  "completionStatus": "in-progress|completed|abandoned"
}
```

## Error Handling

### HTTP Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data or parameters
- **401 Unauthorized**: Authentication required or invalid token
- **403 Forbidden**: Access denied for the requested resource
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists (e.g., duplicate email)
- **422 Unprocessable Entity**: Valid request format but semantic errors
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error
- **503 Service Unavailable**: Service temporarily unavailable

### Error Response Format

All error responses follow this consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "specific field that caused the error (if applicable)",
      "value": "invalid value (if applicable)",
      "constraint": "validation constraint that was violated"
    },
    "timestamp": "2025-01-08T13:15:00Z",
    "requestId": "req_1234567890"
  }
}
```

### Common Error Codes

- `INVALID_CREDENTIALS`: Login credentials are incorrect
- `TOKEN_EXPIRED`: JWT token has expired
- `TOKEN_INVALID`: JWT token is malformed or invalid
- `USER_NOT_FOUND`: User account does not exist
- `SESSION_NOT_FOUND`: Canvas session does not exist
- `UNAUTHORIZED_ACCESS`: User lacks permission for the resource
- `VALIDATION_ERROR`: Request data validation failed
- `RATE_LIMIT_EXCEEDED`: Too many requests in time window
- `AI_SERVICE_UNAVAILABLE`: Gemini AI service is temporarily unavailable
- `CANVAS_DATA_INVALID`: Canvas data format is incorrect

## Authentication Flow

### JWT Token Authentication

1. **Registration/Login**: User provides credentials and receives JWT access token and refresh token
2. **API Requests**: Include `Authorization: Bearer <access_token>` header
3. **Token Expiration**: Access tokens expire after 1 hour
4. **Token Refresh**: Use refresh token to get new access token
5. **Logout**: Invalidate both access and refresh tokens

### Security Considerations

- **HTTPS Only**: All API endpoints require HTTPS in production
- **Token Storage**: Store tokens securely (encrypted storage, not localStorage)
- **Rate Limiting**: API requests are rate-limited per user/IP
- **Input Validation**: All inputs are validated and sanitized
- **CORS**: Proper CORS headers configured for web clients
- **Data Encryption**: Sensitive data encrypted at rest and in transit

### Authentication Headers

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfMTIzNDU2Nzg5MCIsImVtYWlsIjoic3R1ZGVudEB1bml2ZXJzaXR5LmVkdSIsInJvbGUiOiJzdHVkZW50IiwiaWF0IjoxNzA0NzA4NjAwLCJleHAiOjE3MDQ3MTIyMDB9.signature
Content-Type: application/json
X-API-Version: v1
```

### Rate Limiting

- **Authentication endpoints**: 5 requests per minute per IP
- **Canvas operations**: 100 requests per minute per user
- **AI endpoints**: 10 requests per minute per user
- **General endpoints**: 60 requests per minute per user

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1704708660
```

---

## Related Documentation

📋 **Documentation Hub**: [Main Documentation](README.md)  
🏗️ **Architecture**: [System Architecture](ARCHITECTURE.md)  
⚙️ **Installation**: [Installation Guide](INSTALLATION.md)  
👨‍💻 **Development**: [Development Guide](DEVELOPMENT.md)  
🗺️ **Roadmap**: [Feature Roadmap](ROADMAP.md)  
📖 **Use Cases**: [Use Cases & Workflows](USE_CASES.md)  
🤔 **Technical Decisions**: [Technical Decisions](TECHNICAL_DECISIONS.md)

[↑ Back to top](#table-of-contents)