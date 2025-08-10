# API Interaction Flow Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant A as Mobile App
    participant API as API Gateway
    participant Auth as Auth Service
    participant Session as Session Service
    participant DB as Database
    participant AI as AI Service
    participant Gemini as Gemini API

    %% Authentication Flow
    Note over U,Gemini: Authentication Flow
    U->>A: Open App
    A->>API: GET /api/auth/check
    API->>Auth: Validate Token
    Auth->>DB: Query User
    DB-->>Auth: User Data
    Auth-->>API: Auth Status
    API-->>A: Authentication Result
    
    alt Not Authenticated
        A->>U: Show Login Screen
        U->>A: Enter Credentials
        A->>API: POST /api/auth/login
        API->>Auth: Validate Credentials
        Auth->>DB: Check User
        DB-->>Auth: User Found
        Auth-->>API: JWT Token
        API-->>A: Login Success + Token
        A->>A: Store Token
    end

    %% Session Management Flow
    Note over U,Gemini: Session Management Flow
    U->>A: Start Drawing
    A->>API: POST /api/sessions
    API->>Session: Create Session
    Session->>DB: Insert Session
    DB-->>Session: Session ID
    Session-->>API: Session Created
    API-->>A: Session Data
    
    loop Drawing Operations
        U->>A: Draw on Canvas
        A->>A: Update Local State
        A->>API: PUT /api/sessions/:id
        API->>Session: Update Session
        Session->>DB: Save Canvas Data
        DB-->>Session: Success
        Session-->>API: Update Confirmed
        API-->>A: Sync Success
    end

    %% AI Integration Flow
    Note over U,Gemini: AI Help System Flow
    U->>A: Request AI Help
    A->>API: POST /api/ai/analyze
    API->>AI: Analyze Canvas
    AI->>Gemini: Send Canvas Data
    Gemini-->>AI: Analysis Result
    AI-->>API: AI Response
    API-->>A: Help Content
    A->>U: Display AI Hints

    %% Session Persistence
    Note over U,Gemini: Session Persistence
    U->>A: Close App
    A->>API: PUT /api/sessions/:id/close
    API->>Session: Mark Session Closed
    Session->>DB: Update Status
    DB-->>Session: Success
    Session-->>API: Session Closed
    API-->>A: Confirmation

    U->>A: Reopen App Later
    A->>API: GET /api/sessions
    API->>Session: Get User Sessions
    Session->>DB: Query Sessions
    DB-->>Session: Session List
    Session-->>API: Sessions Data
    API-->>A: Available Sessions
    A->>U: Show Session List
    U->>A: Select Session
    A->>API: GET /api/sessions/:id
    API->>Session: Load Session
    Session->>DB: Get Canvas Data
    DB-->>Session: Canvas Data
    Session-->>API: Session Details
    API-->>A: Canvas Restored
    A->>U: Resume Drawing
```

## API Interaction Patterns

### Authentication System
- **Token-based Authentication**: JWT tokens for secure API access
- **Session Validation**: Automatic token validation on app startup
- **Credential Management**: Secure storage of authentication tokens
- **Auto-refresh**: Token refresh mechanism for extended sessions

### Session Management
- **Session Creation**: New drawing sessions created on demand
- **Real-time Sync**: Canvas changes synchronized with backend
- **Session Persistence**: Automatic saving of drawing progress
- **Session Recovery**: Ability to restore previous sessions

### AI Integration
- **Context Analysis**: Canvas content sent to AI for analysis
- **Hint Generation**: AI provides contextual help and suggestions
- **Progressive Help**: Different levels of assistance based on user needs
- **Response Integration**: AI feedback seamlessly integrated into UI

### Error Handling & Retry Logic

```mermaid
flowchart TD
    A[API Request] --> B{Network Available?}
    B -->|No| C[Queue Request]
    B -->|Yes| D[Send Request]
    
    D --> E{Response OK?}
    E -->|Yes| F[Process Response]
    E -->|No| G{Retry Count < 3?}
    
    G -->|Yes| H[Wait & Retry]
    G -->|No| I[Show Error]
    
    H --> D
    C --> J[Network Restored]
    J --> K[Process Queue]
    K --> D
    
    F --> L[Update UI]
    I --> M[Offline Mode]
    
    classDef success fill:#e8f5e8
    classDef error fill:#ffebee
    classDef retry fill:#fff3e0
    classDef offline fill:#f3e5f5
    
    class F,L success
    class I,M error
    class H,K retry
    class C,J offline
```

### API Endpoints Summary

| Endpoint | Method | Purpose | Authentication |
|----------|--------|---------|----------------|
| `/api/auth/login` | POST | User authentication | No |
| `/api/auth/logout` | POST | End user session | Yes |
| `/api/auth/check` | GET | Validate token | Yes |
| `/api/sessions` | GET | List user sessions | Yes |
| `/api/sessions` | POST | Create new session | Yes |
| `/api/sessions/:id` | GET | Get session details | Yes |
| `/api/sessions/:id` | PUT | Update session | Yes |
| `/api/sessions/:id` | DELETE | Delete session | Yes |
| `/api/ai/analyze` | POST | AI canvas analysis | Yes |
| `/api/ai/hint` | POST | Generate AI hints | Yes |