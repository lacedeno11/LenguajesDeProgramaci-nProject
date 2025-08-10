# Data Flow Diagram - Drawing Operations & State Management

```mermaid
flowchart TD
    A[User Touch Input] --> B[Touch Event Handler]
    B --> C{Touch Type?}
    
    C -->|Touch Start| D[Initialize Drawing]
    C -->|Touch Move| E[Continue Drawing]
    C -->|Touch End| F[Finalize Drawing]
    
    D --> G[Get Active Tool]
    E --> G
    F --> G
    
    G --> H[Tool Processing]
    H --> I[Generate Drawing Data]
    
    I --> J[Dispatch Canvas Action]
    J --> K[Canvas Slice Reducer]
    
    K --> L[Update Canvas State]
    L --> M[Create History Snapshot]
    M --> N[History Slice Update]
    
    L --> O[Trigger Re-render]
    O --> P[Canvas Component Update]
    P --> Q[Render Drawing]
    
    subgraph "State Management Flow"
        R[Redux Store] --> S[Canvas Slice]
        R --> T[Tools Slice]
        R --> U[History Slice]
        R --> V[Layers Slice]
        R --> W[UI Slice]
        
        S --> X[Drawing Data]
        S --> Y[Canvas Properties]
        
        T --> Z[Active Tool]
        T --> AA[Tool Settings]
        
        U --> BB[Undo Stack]
        U --> CC[Redo Stack]
        
        V --> DD[Layer Data]
        V --> EE[Layer Visibility]
        
        W --> FF[UI State]
        W --> GG[Help System State]
    end
    
    subgraph "Tool System Data Flow"
        HH[BaseTool Interface] --> II[Tool-Specific Logic]
        II --> JJ[Drawing Calculations]
        JJ --> KK[Path Generation]
        KK --> LL[Style Application]
    end
    
    subgraph "Persistence Flow"
        MM[Canvas State] --> NN[Serialize Data]
        NN --> OO[Local Storage]
        NN --> PP[Backend API]
        PP --> QQ[Database Storage]
    end
    
    subgraph "AI Integration Flow"
        RR[Canvas Analysis Trigger] --> SS[Extract Canvas Data]
        SS --> TT[Send to AI Service]
        TT --> UU[AI Processing]
        UU --> VV[Generate Response]
        VV --> WW[Update UI State]
        WW --> XX[Display AI Feedback]
    end
    
    %% Connections between subgraphs
    L --> MM
    L --> RR
    G --> HH
    K --> R
    
    classDef input fill:#ffebee
    classDef processing fill:#e3f2fd
    classDef state fill:#f3e5f5
    classDef render fill:#e8f5e8
    classDef persistence fill:#fff3e0
    classDef ai fill:#fce4ec
    
    class A,B,C input
    class D,E,F,G,H,I,J processing
    class K,L,M,N,R,S,T,U,V,W,X,Y,Z,AA,BB,CC,DD,EE,FF,GG state
    class O,P,Q render
    class MM,NN,OO,PP,QQ persistence
    class RR,SS,TT,UU,VV,WW,XX ai
```

## Data Flow Overview

### Drawing Operation Flow
1. **User Input**: Touch events captured from the drawing surface
2. **Event Processing**: Touch type determination (start, move, end)
3. **Tool Processing**: Active tool processes the input with specific logic
4. **State Update**: Canvas state updated through Redux actions
5. **History Management**: Automatic snapshot creation for undo/redo
6. **Re-rendering**: Canvas component updates to reflect new state

### State Management Architecture
- **Centralized Store**: Redux store manages all application state
- **Slice-based Organization**: Separate slices for different concerns
- **Immutable Updates**: State changes through reducers ensure predictability
- **Selector Pattern**: Efficient state access through selectors

### Tool System Data Processing
- **Unified Interface**: All tools implement BaseTool interface
- **Tool-Specific Logic**: Each tool handles input differently
- **Path Generation**: Mathematical calculations for drawing paths
- **Style Application**: Color, size, opacity applied to drawing data

### Persistence Strategy
- **Local Storage**: Immediate local persistence for offline capability
- **Backend Sync**: Periodic synchronization with server
- **Database Storage**: Permanent storage in MySQL database

### AI Integration Data Flow
- **Analysis Trigger**: User requests AI help or automatic analysis
- **Data Extraction**: Current canvas state serialized for AI processing
- **AI Processing**: Gemini 2.5 analyzes drawing and context
- **Response Integration**: AI feedback integrated into UI state
- **User Feedback**: Hints and suggestions displayed to user