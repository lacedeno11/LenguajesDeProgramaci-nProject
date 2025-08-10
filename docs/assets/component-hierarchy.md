# Component Hierarchy Diagram

```mermaid
graph TD
    A[App.tsx] --> B[Redux Provider]
    B --> C[Main Screen]
    
    C --> D[Canvas Component]
    C --> E[Toolbar Component]
    C --> F[UI Components]
    
    D --> G[Drawing Surface]
    D --> H[Layer Manager]
    D --> I[History Manager]
    
    E --> J[Tool Selector]
    E --> K[Color Picker]
    E --> L[Brush Settings]
    E --> M[Action Buttons]
    
    F --> N[Camera Button]
    F --> O[Image Picker Button]
    F --> P[Help System UI]
    
    G --> Q[Touch Handler]
    G --> R[Gesture Recognition]
    G --> S[Rendering Engine]
    
    H --> T[Layer Controls]
    H --> U[Layer Visibility]
    
    I --> V[Undo/Redo]
    I --> W[State Snapshots]
    
    J --> X[PenTool]
    J --> Y[PencilTool]
    J --> Z[EraserTool]
    J --> AA[HighlighterTool]
    J --> BB[TextTool]
    
    M --> CC[Save Button]
    M --> DD[Clear Button]
    M --> EE[AI Help Button]
    
    P --> FF[Help Levels UI]
    P --> GG[Hint Display]
    P --> HH[Progress Indicator]
    
    subgraph "Redux Store Structure"
        II[Canvas Slice]
        JJ[Tools Slice]
        KK[UI Slice]
        LL[History Slice]
        MM[Layers Slice]
    end
    
    subgraph "Tool System"
        NN[BaseTool]
        X --> NN
        Y --> NN
        Z --> NN
        AA --> NN
        BB --> NN
    end
    
    classDef app fill:#ff9999
    classDef main fill:#99ccff
    classDef canvas fill:#99ff99
    classDef toolbar fill:#ffcc99
    classDef ui fill:#cc99ff
    classDef store fill:#ffff99
    classDef tools fill:#ff99cc
    
    class A,B app
    class C main
    class D,G,H,I,Q,R,S,T,U,V,W canvas
    class E,J,K,L,M,CC,DD,EE toolbar
    class F,N,O,P,FF,GG,HH ui
    class II,JJ,KK,LL,MM store
    class NN,X,Y,Z,AA,BB tools
```

## Component Structure Overview

### Application Root
- **App.tsx**: Main application entry point with Redux Provider setup
- **Redux Provider**: State management wrapper for the entire application

### Main Screen Components
- **Canvas Component**: Core drawing functionality with touch handling and rendering
- **Toolbar Component**: Tool selection, settings, and action controls
- **UI Components**: Additional interface elements and help system

### Canvas System
- **Drawing Surface**: Main drawing area with touch and gesture recognition
- **Layer Manager**: Handles multiple drawing layers and visibility
- **History Manager**: Undo/redo functionality with state snapshots

### Toolbar System
- **Tool Selector**: Interface for choosing drawing tools
- **Color Picker**: Color selection for drawing tools
- **Brush Settings**: Size, opacity, and other tool properties
- **Action Buttons**: Save, clear, and AI help functionality

### Tool Architecture
- **BaseTool**: Abstract base class for all drawing tools
- **Specific Tools**: PenTool, PencilTool, EraserTool, HighlighterTool, TextTool
- Each tool inherits from BaseTool and implements specific drawing behavior

### State Management
- **Canvas Slice**: Drawing data, current canvas state
- **Tools Slice**: Active tool, tool settings, properties
- **UI Slice**: Interface state, modals, help system visibility
- **History Slice**: Undo/redo stack, state snapshots
- **Layers Slice**: Layer management, visibility, ordering