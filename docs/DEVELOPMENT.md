# Development Guide

## Navigation

📋 **Documentation Hub**: [Main Documentation](README.md)  
🏗️ **Architecture**: [System Architecture](ARCHITECTURE.md)  
⚙️ **Installation**: [Installation Guide](INSTALLATION.md)  
🔌 **API Reference**: [API Documentation](API.md)  
🗺️ **Roadmap**: [Feature Roadmap](ROADMAP.md)

---

Welcome to the SL8.ai development guide! This document provides comprehensive information for contributors who want to understand the codebase, follow our conventions, and contribute effectively to the project.

## Table of Contents

- [Project Structure](#project-structure)
- [Code Organization](#code-organization)
- [Coding Conventions](#coding-conventions)
- [TypeScript Usage](#typescript-usage)
- [Adding New Drawing Tools](#adding-new-drawing-tools)
- [Redux State Management](#redux-state-management)
- [Testing Strategies](#testing-strategies)
- [Debugging Techniques](#debugging-techniques)
- [Git Workflow](#git-workflow)
- [Contribution Process](#contribution-process)

## Project Structure

The SL8.ai project follows a modular React Native/Expo architecture with clear separation of concerns:

```
SL8Whiteboard/SL8WhiteboardExpo/
├── App.tsx                     # Main application component
├── index.ts                    # Application entry point
├── package.json                # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── metro.config.js            # Metro bundler configuration
├── app.json                   # Expo configuration
└── src/
    ├── components/            # React Native components
    │   ├── Canvas.tsx         # Main drawing canvas
    │   ├── Toolbar.tsx        # Drawing tools toolbar
    │   ├── CameraButton.tsx   # Camera integration
    │   └── ImagePickerButton.tsx # Image picker functionality
    ├── hooks/                 # Custom React hooks
    │   └── useHistory.ts      # Undo/redo functionality
    ├── store/                 # Redux store configuration
    │   ├── index.ts           # Store setup and typed hooks
    │   ├── selectors.ts       # Reusable state selectors
    │   └── slices/            # Redux Toolkit slices
    │       ├── canvasSlice.ts # Canvas state management
    │       ├── toolsSlice.ts  # Drawing tools state
    │       ├── layersSlice.ts # Layer management
    │       ├── historySlice.ts # Undo/redo state
    │       └── uiSlice.ts     # UI state management
    ├── tools/                 # Drawing tool implementations
    │   ├── BaseTool.ts        # Abstract base class
    │   ├── PenTool.ts         # Pen drawing tool
    │   ├── PencilTool.ts      # Pencil drawing tool
    │   ├── HighlighterTool.ts # Highlighter tool
    │   ├── EraserTool.ts      # Eraser tool
    │   └── TextTool.ts        # Text input tool
    ├── types/                 # TypeScript type definitions
    │   └── index.ts           # Core application types
    └── utils/                 # Utility functions
        ├── index.ts           # Utility exports
        └── imageUtils.ts      # Image processing utilities
```

## Code Organization

### Architectural Principles

1. **Separation of Concerns**: Each module has a single, well-defined responsibility
2. **Component Composition**: Build complex UI from simple, reusable components
3. **State Management**: Centralized state with Redux Toolkit for predictable updates
4. **Type Safety**: Comprehensive TypeScript usage for better developer experience
5. **Testability**: Code structured to enable easy unit and integration testing

### Directory Guidelines

- **`components/`**: Pure React Native components focused on UI rendering
- **`hooks/`**: Custom hooks for reusable stateful logic
- **`store/`**: Redux store configuration, slices, and selectors
- **`tools/`**: Drawing tool implementations following the Strategy pattern
- **`types/`**: TypeScript interfaces and type definitions
- **`utils/`**: Pure functions for data transformation and utilities

[↑ Back to top](#table-of-contents)

### File Naming Conventions

- **Components**: PascalCase (e.g., `Canvas.tsx`, `Toolbar.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useHistory.ts`)
- **Types**: PascalCase for interfaces (e.g., `Point`, `Stroke`)
- **Utilities**: camelCase (e.g., `imageUtils.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_HISTORY_ENTRIES`)

## Coding Conventions

### General Guidelines

1. **Consistency**: Follow existing patterns in the codebase
2. **Readability**: Write self-documenting code with clear variable names
3. **Performance**: Consider React Native performance implications
4. **Accessibility**: Ensure components are accessible to all users

### Code Style

```typescript
// ✅ Good: Clear, descriptive naming
const calculateStrokeBounds = (points: Point[]): BoundingBox => {
  if (points.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  
  const minX = Math.min(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y));
  const maxX = Math.max(...points.map(p => p.x));
  const maxY = Math.max(...points.map(p => p.y));
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

// ❌ Avoid: Unclear naming and logic
const calc = (pts: any[]) => {
  let x1 = pts[0].x, y1 = pts[0].y, x2 = x1, y2 = y1;
  for (let i = 1; i < pts.length; i++) {
    if (pts[i].x < x1) x1 = pts[i].x;
    if (pts[i].y < y1) y1 = pts[i].y;
    if (pts[i].x > x2) x2 = pts[i].x;
    if (pts[i].y > y2) y2 = pts[i].y;
  }
  return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
};
```

### Component Structure

```typescript
// ✅ Recommended component structure
interface ToolbarProps {
  currentTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  toolSettings: ToolSettings;
  onSettingsChange: (settings: Partial<ToolSettings>) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  onToolChange,
  toolSettings,
  onSettingsChange,
}) => {
  // Hooks at the top
  const dispatch = useAppDispatch();
  const { colorPalette } = useAppSelector(state => state.tools);
  
  // Event handlers
  const handleToolSelect = useCallback((tool: ToolType) => {
    onToolChange(tool);
    dispatch(setCurrentTool(tool));
  }, [onToolChange, dispatch]);
  
  // Render
  return (
    <View style={styles.container}>
      {/* Component JSX */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
});
```

## TypeScript Usage

### Type Definitions

All core types are defined in `src/types/index.ts`. Follow these patterns:

```typescript
// ✅ Interface for object shapes
interface Point {
  x: number;
  y: number;
  pressure?: number;
  timestamp: number;
}

// ✅ Union types for enums
type ToolType = 
  | 'pen' 
  | 'pencil' 
  | 'highlighter' 
  | 'eraser' 
  | 'text';

// ✅ Generic interfaces for reusability
interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ✅ Extending interfaces
interface Stroke extends BoundingBox {
  id: string;
  layerId: string;
  tool: ToolType;
  points: Point[];
  style: StrokeStyle;
  timestamp: number;
}
```

### Redux Type Safety

Use the typed hooks provided in the store:

```typescript
// ✅ Use typed hooks
import { useAppDispatch, useAppSelector } from '../store';

const MyComponent: React.FC = () => {
  const dispatch = useAppDispatch(); // Typed dispatch
  const currentTool = useAppSelector(state => state.tools.currentTool); // Typed selector
  
  const handleAction = () => {
    dispatch(setCurrentTool('pen')); // Type-safe action
  };
  
  return <View>{/* Component JSX */}</View>;
};

// ❌ Avoid untyped hooks
import { useDispatch, useSelector } from 'react-redux';
```

### Component Props

Always define explicit prop interfaces:

```typescript
// ✅ Explicit prop interface
interface CanvasProps {
  width: number;
  height: number;
  onStrokeComplete?: (stroke: Stroke) => void;
  disabled?: boolean;
}

export const Canvas: React.FC<CanvasProps> = ({ 
  width, 
  height, 
  onStrokeComplete,
  disabled = false 
}) => {
  // Component implementation
};

// ❌ Avoid any or implicit types
export const Canvas = (props: any) => {
  // Implementation
};
```

## Adding New Drawing Tools

All drawing tools inherit from the `BaseTool` abstract class. Follow this pattern to add new tools:

### 1. Create Tool Class

```typescript
// src/tools/MyNewTool.ts
import { BaseTool } from './BaseTool';
import { Point, Stroke, ToolSettings } from '../types';

export class MyNewTool extends BaseTool {
  private points: Point[] = [];
  private customProperty: string = '';

  constructor(settings: ToolSettings) {
    super(settings);
  }

  onStart(point: Point, layerId: string): void {
    this.isActive = true;
    this.points = [point];
    
    this.currentStroke = {
      id: this.generateId(),
      layerId,
      tool: 'my-new-tool', // Add to ToolType union
      points: [...this.points],
      style: {
        color: this.settings.color,
        width: this.settings.width,
        opacity: this.settings.opacity,
        lineCap: 'round',
        lineJoin: 'round',
      },
      timestamp: Date.now(),
      bounds: this.calculateBounds(this.points),
    };
  }

  onMove(point: Point): void {
    if (!this.isActive || !this.currentStroke) return;

    this.points.push(point);
    this.currentStroke.points = [...this.points];
    this.currentStroke.bounds = this.calculateBounds(this.points);
  }

  onEnd(point: Point): Stroke | null {
    if (!this.isActive || !this.currentStroke) return null;

    this.points.push(point);
    this.currentStroke.points = [...this.points];
    this.currentStroke.bounds = this.calculateBounds(this.points);
    
    const finalStroke = { ...this.currentStroke };
    
    // Reset state
    this.isActive = false;
    this.currentStroke = null;
    this.points = [];
    
    return finalStroke;
  }

  // Add custom methods specific to your tool
  customMethod(): void {
    // Tool-specific functionality
  }
}
```

### 2. Update Type Definitions

```typescript
// src/types/index.ts
export type ToolType = 
  | 'pen' 
  | 'pencil' 
  | 'highlighter' 
  | 'eraser' 
  | 'text'
  | 'my-new-tool'; // Add your tool type
```

### 3. Update Tools Slice

```typescript
// src/store/slices/toolsSlice.ts
const toolsSlice = createSlice({
  name: 'tools',
  initialState,
  reducers: {
    setCurrentTool: (state, action: PayloadAction<ToolType>) => {
      // Handle tool-specific settings
      let newSettings = { ...state.currentTool.settings };
      
      if (action.payload === 'my-new-tool') {
        // Apply tool-specific default settings
        newSettings.width = Math.max(newSettings.width, 5);
      }
      
      state.currentTool = {
        type: action.payload,
        settings: newSettings,
      };
    },
    // ... other reducers
  },
});
```

### 4. Add Tool to UI

Update the toolbar component to include your new tool:

```typescript
// src/components/Toolbar.tsx
const tools: ToolType[] = [
  'pen', 
  'pencil', 
  'highlighter', 
  'eraser', 
  'text',
  'my-new-tool'
];
```

### 5. Write Tests

```typescript
// src/tools/__tests__/MyNewTool.test.ts
import { MyNewTool } from '../MyNewTool';
import { Point } from '../../types';

describe('MyNewTool', () => {
  let tool: MyNewTool;
  
  beforeEach(() => {
    tool = new MyNewTool({
      color: '#000000',
      width: 2,
      opacity: 1.0,
    });
  });

  it('should create stroke on start', () => {
    const point: Point = { x: 10, y: 10, timestamp: Date.now() };
    tool.onStart(point, 'layer-1');
    
    expect(tool.getIsActive()).toBe(true);
    expect(tool.getCurrentStroke()).toBeDefined();
  });

  // Add more tests...
});
```

## Redux State Management

### Slice Structure

Follow Redux Toolkit patterns for state management:

```typescript
// Example slice structure
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MySliceState {
  data: MyData[];
  loading: boolean;
  error: string | null;
}

const initialState: MySliceState = {
  data: [],
  loading: false,
  error: null,
};

const mySlice = createSlice({
  name: 'mySlice',
  initialState,
  reducers: {
    // Synchronous actions
    setData: (state, action: PayloadAction<MyData[]>) => {
      state.data = action.payload;
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    // Complex state updates
    updateItem: (state, action: PayloadAction<{ id: string; updates: Partial<MyData> }>) => {
      const { id, updates } = action.payload;
      const item = state.data.find(item => item.id === id);
      if (item) {
        Object.assign(item, updates);
      }
    },
  },
});

export const { setData, setLoading, setError, updateItem } = mySlice.actions;
export default mySlice.reducer;
```

### Async Actions

Use createAsyncThunk for async operations:

```typescript
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchData = createAsyncThunk(
  'mySlice/fetchData',
  async (params: FetchParams, { rejectWithValue }) => {
    try {
      const response = await api.fetchData(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Handle in slice
const mySlice = createSlice({
  name: 'mySlice',
  initialState,
  reducers: {
    // ... synchronous reducers
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});
```

### Selectors

Create reusable selectors for complex state queries:

```typescript
// src/store/selectors.ts
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './index';

// Simple selectors
export const selectCurrentTool = (state: RootState) => state.tools.currentTool;
export const selectCanvasStrokes = (state: RootState) => state.canvas.strokes;

// Memoized selectors
export const selectVisibleStrokes = createSelector(
  [selectCanvasStrokes, (state: RootState) => state.layers.layers],
  (strokes, layers) => {
    const visibleLayerIds = Object.values(layers)
      .filter(layer => layer.visible)
      .map(layer => layer.id);
    
    return Object.values(strokes).filter(stroke => 
      visibleLayerIds.includes(stroke.layerId)
    );
  }
);

// Parameterized selectors
export const selectStrokesByLayer = createSelector(
  [selectCanvasStrokes, (state: RootState, layerId: string) => layerId],
  (strokes, layerId) => 
    Object.values(strokes).filter(stroke => stroke.layerId === layerId)
);
```

## Testing Strategies

### Unit Testing

Test individual functions and components:

```typescript
// Component testing
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { store } from '../store';
import { Toolbar } from '../components/Toolbar';

describe('Toolbar', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <Provider store={store}>
        {component}
      </Provider>
    );
  };

  it('should render all tool buttons', () => {
    const { getByTestId } = renderWithProvider(
      <Toolbar onToolChange={jest.fn()} />
    );
    
    expect(getByTestId('pen-tool')).toBeTruthy();
    expect(getByTestId('pencil-tool')).toBeTruthy();
    expect(getByTestId('eraser-tool')).toBeTruthy();
  });

  it('should call onToolChange when tool is selected', () => {
    const mockOnToolChange = jest.fn();
    const { getByTestId } = renderWithProvider(
      <Toolbar onToolChange={mockOnToolChange} />
    );
    
    fireEvent.press(getByTestId('pen-tool'));
    expect(mockOnToolChange).toHaveBeenCalledWith('pen');
  });
});
```

### Redux Testing

Test reducers and actions:

```typescript
// Reducer testing
import canvasReducer, { addStroke, removeStroke } from '../slices/canvasSlice';
import { Stroke } from '../../types';

describe('canvasSlice', () => {
  const initialState = {
    strokes: {},
    // ... other initial state
  };

  it('should add stroke', () => {
    const stroke: Stroke = {
      id: 'test-stroke',
      // ... stroke properties
    };
    
    const action = addStroke(stroke);
    const newState = canvasReducer(initialState, action);
    
    expect(newState.strokes['test-stroke']).toEqual(stroke);
  });

  it('should remove stroke', () => {
    const stateWithStroke = {
      ...initialState,
      strokes: { 'test-stroke': mockStroke },
    };
    
    const action = removeStroke('test-stroke');
    const newState = canvasReducer(stateWithStroke, action);
    
    expect(newState.strokes['test-stroke']).toBeUndefined();
  });
});
```

### Integration Testing

Test component integration with Redux:

```typescript
import { renderWithProviders } from '../test-utils';
import { Canvas } from '../components/Canvas';
import { setCurrentTool } from '../store/slices/toolsSlice';

describe('Canvas Integration', () => {
  it('should use current tool from Redux state', () => {
    const { store, getByTestId } = renderWithProviders(<Canvas />);
    
    store.dispatch(setCurrentTool('highlighter'));
    
    // Test that canvas uses highlighter tool
    // ... test implementation
  });
});
```

### Test Utilities

Create helper utilities for testing:

```typescript
// src/test-utils.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from './store';

export const renderWithProviders = (
  ui: React.ReactElement,
  preloadedState = {}
) => {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState,
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  return {
    store,
    ...render(ui, { wrapper: Wrapper }),
  };
};
```

## Debugging Techniques

### React Native Debugging

1. **Metro Bundler**: Use the Metro bundler's debugging features
2. **React Native Debugger**: Install and use React Native Debugger
3. **Flipper**: Use Flipper for advanced debugging and profiling

### Redux Debugging

```typescript
// Enable Redux DevTools in development
export const store = configureStore({
  reducer: rootReducer,
  devTools: __DEV__ && {
    name: 'SL8 Whiteboard',
    trace: true,
    traceLimit: 25,
  },
});
```

### Performance Debugging

```typescript
// Use React.memo for expensive components
export const ExpensiveComponent = React.memo<Props>(({ data }) => {
  return <View>{/* Expensive rendering */}</View>;
});

// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);

// Use useCallback for stable function references
const handlePress = useCallback(() => {
  onPress(id);
}, [onPress, id]);
```

### Logging

```typescript
// Structured logging
const logger = {
  debug: (message: string, data?: any) => {
    if (__DEV__) {
      console.log(`[DEBUG] ${message}`, data);
    }
  },
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${message}`, error);
  },
};

// Usage
logger.debug('Tool changed', { from: oldTool, to: newTool });
logger.error('Failed to save stroke', error);
```

## Git Workflow

### Branch Naming

- **Feature branches**: `feature/tool-system-refactor`
- **Bug fixes**: `fix/canvas-rendering-issue`
- **Documentation**: `docs/api-documentation`
- **Refactoring**: `refactor/redux-store-structure`

### Commit Messages

Follow conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Examples:
```
feat(tools): add highlighter tool with opacity support

- Implement HighlighterTool class extending BaseTool
- Add opacity controls to toolbar
- Update tool type definitions

Closes #123
```

```
fix(canvas): resolve stroke rendering performance issue

The canvas was re-rendering all strokes on every update.
Now only renders changed strokes using React.memo.

Performance improved by ~60% for large canvases.
```

### Pull Request Process

1. **Create Feature Branch**: `git checkout -b feature/my-feature`
2. **Make Changes**: Implement your feature with tests
3. **Run Tests**: `npm test` - ensure all tests pass
4. **Update Documentation**: Update relevant docs
5. **Create PR**: Use the PR template
6. **Code Review**: Address reviewer feedback
7. **Merge**: Squash and merge after approval

### Pre-commit Hooks

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "git add"
    ]
  }
}
```

## Contribution Process

### Getting Started

1. **Fork the Repository**
2. **Clone Your Fork**: `git clone https://github.com/yourusername/sl8-whiteboard.git`
3. **Install Dependencies**: `npm install`
4. **Run Development Server**: `npm start`
5. **Run Tests**: `npm test`

### Development Workflow

1. **Pick an Issue**: Choose from GitHub issues or create a new one
2. **Create Branch**: `git checkout -b feature/issue-description`
3. **Develop**: Write code following our conventions
4. **Test**: Add tests for new functionality
5. **Document**: Update documentation as needed
6. **Submit PR**: Create pull request with clear description

### Code Review Guidelines

#### For Authors
- Write clear PR descriptions
- Include screenshots for UI changes
- Ensure tests pass
- Keep PRs focused and small
- Respond to feedback promptly

#### For Reviewers
- Review for correctness, performance, and maintainability
- Check test coverage
- Verify documentation updates
- Test the changes locally
- Provide constructive feedback

### Issue Reporting

When reporting bugs, include:
- **Environment**: Device, OS version, app version
- **Steps to Reproduce**: Clear, numbered steps
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Screenshots**: If applicable
- **Logs**: Any error messages or console output

### Feature Requests

For new features, provide:
- **Use Case**: Why is this feature needed?
- **Proposed Solution**: How should it work?
- **Alternatives**: Other approaches considered
- **Implementation Notes**: Technical considerations

---

## Quick Reference

### Common Commands

```bash
# Development
npm start                 # Start Expo development server
npm run android          # Run on Android device/emulator
npm run ios             # Run on iOS device/simulator
npm run web             # Run in web browser

# Testing
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage report

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run type-check      # Run TypeScript compiler check
```

### Useful Selectors

```typescript
// Get current tool
const currentTool = useAppSelector(state => state.tools.currentTool);

// Get visible strokes
const visibleStrokes = useAppSelector(selectVisibleStrokes);

// Get canvas view state
const { zoom, panOffset } = useAppSelector(state => state.canvas);
```

### Common Actions

```typescript
// Tool actions
dispatch(setCurrentTool('pen'));
dispatch(updateToolSettings({ color: '#ff0000', width: 5 }));

// Canvas actions
dispatch(addStroke(newStroke));
dispatch(setZoom(2.0));
dispatch(resetView());

// Layer actions
dispatch(createLayer({ name: 'New Layer' }));
dispatch(setActiveLayer(layerId));
```

---

## Related Documentation

📋 **Documentation Hub**: [Main Documentation](README.md)  
🏗️ **Architecture**: [System Architecture](ARCHITECTURE.md)  
⚙️ **Installation**: [Installation Guide](INSTALLATION.md)  
🔌 **API Reference**: [API Documentation](API.md)  
🗺️ **Roadmap**: [Feature Roadmap](ROADMAP.md)  
📖 **Use Cases**: [Use Cases & Workflows](USE_CASES.md)  
🤔 **Technical Decisions**: [Technical Decisions](TECHNICAL_DECISIONS.md)

[↑ Back to top](#table-of-contents)