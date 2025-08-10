# System Architecture Diagram

```mermaid
graph TB
    subgraph "Frontend - React Native/Expo"
        A[Mobile App] --> B[Redux Store]
        B --> C[Canvas Component]
        B --> D[Toolbar Component]
        B --> E[Drawing Tools]
        C --> F[Drawing Engine]
        E --> G[PenTool]
        E --> H[PencilTool]
        E --> I[EraserTool]
        E --> J[HighlighterTool]
        E --> K[TextTool]
    end
    
    subgraph "Backend - PHP/MySQL"
        L[API Gateway] --> M[Authentication Service]
        L --> N[Session Management]
        L --> O[Canvas Storage]
        M --> P[(User Database)]
        N --> Q[(Session Database)]
        O --> R[(Canvas Data)]
    end
    
    subgraph "AI Integration - Gemini 2.5"
        S[AI Analysis Service]
        T[Hint Generation]
        U[Context Understanding]
        S --> T
        S --> U
    end
    
    subgraph "External Services"
        V[Google Gemini API]
        W[Cloud Storage]
    end
    
    %% Frontend to Backend connections
    A -->|HTTP/REST| L
    F -->|Canvas Data| L
    
    %% Backend to AI connections
    L -->|Canvas Analysis| S
    S -->|AI Response| L
    
    %% External connections
    S -->|API Calls| V
    O -->|File Storage| W
    
    %% Data flow
    F -->|Drawing Events| B
    B -->|State Updates| C
    B -->|Tool Selection| E
    
    classDef frontend fill:#e1f5fe
    classDef backend fill:#f3e5f5
    classDef ai fill:#e8f5e8
    classDef external fill:#fff3e0
    
    class A,B,C,D,E,F,G,H,I,J,K frontend
    class L,M,N,O,P,Q,R backend
    class S,T,U ai
    class V,W external
```

## Architecture Overview

This diagram illustrates the complete system architecture of SL8.ai, showing the three main layers:

### Frontend Layer (React Native/Expo)
- **Mobile App**: Main application entry point
- **Redux Store**: Centralized state management
- **Canvas Component**: Main drawing surface
- **Drawing Tools**: Modular tool system (Pen, Pencil, Eraser, Highlighter, Text)
- **Drawing Engine**: Core drawing functionality

### Backend Layer (PHP/MySQL)
- **API Gateway**: RESTful API endpoints
- **Authentication Service**: User management and security
- **Session Management**: Canvas session persistence
- **Canvas Storage**: Drawing data storage and retrieval
- **Databases**: User, Session, and Canvas data storage

### AI Integration Layer (Gemini 2.5)
- **AI Analysis Service**: Canvas content analysis
- **Hint Generation**: Contextual help generation
- **Context Understanding**: Problem comprehension and guidance

### External Services
- **Google Gemini API**: AI processing capabilities
- **Cloud Storage**: File and media storage