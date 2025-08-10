# User Journey Flowchart - Help System Levels

```mermaid
flowchart TD
    A[Student Opens SL8.ai] --> B[Select Problem Type]
    B --> C[Start Drawing Solution]
    
    C --> D{Student Progress}
    D -->|Progressing Well| E[Continue Drawing]
    D -->|Feeling Stuck| F[Help System Activation]
    
    E --> G{Solution Complete?}
    G -->|No| D
    G -->|Yes| H[Submit Solution]
    
    F --> I[Help Level Selection]
    
    subgraph "Six-Level Help System"
        I --> J["Level 1: I am stuck"]
        I --> K["Level 2: I need a hint"]
        I --> L["Level 3: Show me the approach"]
        I --> M["Level 4: Guide me step by step"]
        I --> N["Level 5: Show me similar examples"]
        I --> O["Level 6: I need the complete solution"]
    end
    
    J --> P[AI Analyzes Current Drawing]
    K --> P
    L --> P
    M --> P
    N --> P
    O --> P
    
    P --> Q[Generate Contextual Response]
    
    Q --> R{Help Level Response}
    
    R -->|Level 1| S[General Encouragement<br/>+ Problem Restatement]
    R -->|Level 2| T[Subtle Hint About<br/>Next Step]
    R -->|Level 3| U[High-Level Approach<br/>Overview]
    R -->|Level 4| V[Detailed Step-by-Step<br/>Guidance]
    R -->|Level 5| W[Similar Problem<br/>Examples]
    R -->|Level 6| X[Complete Solution<br/>with Explanation]
    
    S --> Y[Display Help Content]
    T --> Y
    U --> Y
    V --> Y
    W --> Y
    X --> Y
    
    Y --> Z{Student Understanding}
    Z -->|Understood| AA[Continue Drawing]
    Z -->|Still Confused| BB[Request Higher Level Help]
    Z -->|Need Clarification| CC[Ask Follow-up Question]
    
    AA --> D
    BB --> I
    CC --> DD[AI Clarification]
    DD --> Y
    
    H --> EE[AI Final Review]
    EE --> FF{Solution Correct?}
    FF -->|Correct| GG[Congratulations + Learning Summary]
    FF -->|Incorrect| HH[Gentle Correction + Guidance]
    
    HH --> II[Highlight Error Areas]
    II --> JJ[Suggest Corrections]
    JJ --> D
    
    GG --> KK[Save Session]
    KK --> LL[End Session]

    subgraph "AI Processing Flow"
        MM[Canvas Analysis] --> NN[Context Understanding]
        NN --> OO[Problem Recognition]
        OO --> PP[Progress Assessment]
        PP --> QQ[Response Generation]
        QQ --> RR[Personalization]
    end
    
    P --> MM
    RR --> Q
    
    subgraph "Learning Analytics"
        SS[Track Help Usage] --> TT[Identify Struggle Points]
        TT --> UU[Adapt Future Responses]
        UU --> VV[Improve AI Model]
    end
    
    Y --> SS
    
    classDef start fill:#e8f5e8
    classDef process fill:#e3f2fd
    classDef decision fill:#fff3e0
    classDef help fill:#f3e5f5
    classDef ai fill:#fce4ec
    classDef end fill:#e0f2f1
    
    class A,B,C start
    class P,Q,MM,NN,OO,PP,QQ,RR ai
    class D,G,Z,FF decision
    class I,J,K,L,M,N,O,S,T,U,V,W,X,Y help
    class E,AA,BB,CC,DD,HH,II,JJ process
    class H,GG,KK,LL,EE end
```

## User Journey Overview

### Initial Problem Solving Flow
1. **Problem Selection**: Student chooses algorithmic problem to solve
2. **Drawing Phase**: Student begins sketching solution approach
3. **Progress Monitoring**: System tracks student progress and engagement
4. **Help Activation**: Student can request help when stuck

### Six-Level Help System

#### Level 1: "I am stuck"
- **Purpose**: Gentle encouragement without giving away solution
- **Response**: Problem restatement, motivation, general guidance
- **Example**: "Take a step back and think about what the problem is asking. You're on the right track!"

#### Level 2: "I need a hint"
- **Purpose**: Subtle nudge in the right direction
- **Response**: Minimal hint about next logical step
- **Example**: "Consider what happens when you reach the end of your current approach. What would be the next logical step?"

#### Level 3: "Show me the approach"
- **Purpose**: High-level strategy without implementation details
- **Response**: General approach or algorithm category
- **Example**: "This looks like a problem that could benefit from a divide-and-conquer approach. Think about how you might break it into smaller parts."

#### Level 4: "Guide me step by step"
- **Purpose**: Detailed guidance while maintaining student engagement
- **Response**: Step-by-step breakdown with checkpoints
- **Example**: "Let's break this down: 1) First, identify the base case, 2) Then think about the recursive relationship, 3) Finally, consider the termination condition."

#### Level 5: "Show me similar examples"
- **Purpose**: Learning through analogous problems
- **Response**: Similar solved problems with explanations
- **Example**: "Here's a similar problem we solved before: [shows related example]. Notice how the approach applies to your current problem."

#### Level 6: "I need the complete solution"
- **Purpose**: Full solution with educational explanation
- **Response**: Complete solution with detailed reasoning
- **Example**: "Here's the complete solution with explanation of each step and why it works."

### AI Processing Intelligence
- **Canvas Analysis**: AI examines current drawing and progress
- **Context Understanding**: Recognizes problem type and student approach
- **Progress Assessment**: Evaluates how far student has progressed
- **Personalized Response**: Tailors help to student's specific situation
- **Learning Adaptation**: Improves responses based on student interaction patterns

### Learning Analytics Integration
- **Help Pattern Tracking**: Monitors which help levels students use most
- **Struggle Point Identification**: Identifies common areas where students get stuck
- **Response Effectiveness**: Measures how well different help approaches work
- **Continuous Improvement**: Uses data to enhance AI responses and help system

### Error Handling and Recovery
- **Incorrect Solutions**: Gentle correction with guidance back to correct path
- **Confusion Management**: Follow-up questions and clarifications available
- **Session Persistence**: Students can save progress and return later
- **Multiple Attempts**: Students can try different approaches with continued support