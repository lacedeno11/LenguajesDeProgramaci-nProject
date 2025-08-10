import toolsReducer, {
  setCurrentTool,
  updateToolSettings,
  setToolColor,
  setToolWidth,
  setToolOpacity,
  addCustomColor,
  removeCustomColor,
  switchToPreviousTool,
  resetToolSettings,
  ToolsState,
} from '../toolsSlice';
import { ToolType, ToolSettings } from '../../../types';

describe('toolsSlice', () => {
  const initialState: ToolsState = {
    currentTool: {
      type: 'pen',
      settings: {
        color: '#000000',
        width: 2,
        opacity: 1.0,
      },
    },
    toolHistory: [],
    colorPalette: [
      '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
      '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#A52A2A',
    ],
    customColors: [],
  };

  describe('tool selection actions', () => {
    it('should set current tool and add previous to history', () => {
      const action = setCurrentTool('highlighter');
      const state = toolsReducer(initialState, action);
      
      expect(state.currentTool.type).toBe('highlighter');
      expect(state.toolHistory).toHaveLength(1);
      expect(state.toolHistory[0].type).toBe('pen');
    });

    it('should not add to history when setting same tool', () => {
      const action = setCurrentTool('pen');
      const state = toolsReducer(initialState, action);
      
      expect(state.currentTool.type).toBe('pen');
      expect(state.toolHistory).toHaveLength(0);
    });

    it('should maintain tool history limit of 5', () => {
      let state = initialState;
      const tools: ToolType[] = ['highlighter', 'pencil', 'marker', 'eraser', 'text', 'select-lasso'];
      
      // Add 6 different tools to exceed limit
      for (const tool of tools) {
        state = toolsReducer(state, setCurrentTool(tool));
      }
      
      expect(state.toolHistory).toHaveLength(5);
      expect(state.currentTool.type).toBe('select-lasso');
    });

    it('should preserve tool settings when switching tools', () => {
      const modifiedState = {
        ...initialState,
        currentTool: {
          type: 'pen' as ToolType,
          settings: {
            color: '#ff0000',
            width: 5,
            opacity: 0.8,
          },
        },
      };
      
      const action = setCurrentTool('highlighter');
      const state = toolsReducer(modifiedState, action);
      
      expect(state.currentTool.settings.color).toBe('#ff0000');
      expect(state.currentTool.settings.width).toBe(5);
      expect(state.currentTool.settings.opacity).toBe(0.8);
    });
  });

  describe('tool settings actions', () => {
    it('should update tool settings partially', () => {
      const partialSettings: Partial<ToolSettings> = {
        color: '#ff0000',
        width: 5,
      };
      
      const action = updateToolSettings(partialSettings);
      const state = toolsReducer(initialState, action);
      
      expect(state.currentTool.settings.color).toBe('#ff0000');
      expect(state.currentTool.settings.width).toBe(5);
      expect(state.currentTool.settings.opacity).toBe(1.0); // Should remain unchanged
    });

    it('should set tool color', () => {
      const action = setToolColor('#00ff00');
      const state = toolsReducer(initialState, action);
      
      expect(state.currentTool.settings.color).toBe('#00ff00');
    });

    it('should set tool width within bounds (1-20)', () => {
      let state = toolsReducer(initialState, setToolWidth(10));
      expect(state.currentTool.settings.width).toBe(10);
      
      // Test lower bound
      state = toolsReducer(initialState, setToolWidth(0));
      expect(state.currentTool.settings.width).toBe(1);
      
      // Test upper bound
      state = toolsReducer(initialState, setToolWidth(25));
      expect(state.currentTool.settings.width).toBe(20);
    });

    it('should set tool opacity within bounds (0-1)', () => {
      let state = toolsReducer(initialState, setToolOpacity(0.5));
      expect(state.currentTool.settings.opacity).toBe(0.5);
      
      // Test lower bound
      state = toolsReducer(initialState, setToolOpacity(-0.1));
      expect(state.currentTool.settings.opacity).toBe(0);
      
      // Test upper bound
      state = toolsReducer(initialState, setToolOpacity(1.5));
      expect(state.currentTool.settings.opacity).toBe(1);
    });

    it('should reset tool settings to defaults', () => {
      const modifiedState = {
        ...initialState,
        currentTool: {
          type: 'pen' as ToolType,
          settings: {
            color: '#ff0000',
            width: 10,
            opacity: 0.5,
          },
        },
      };
      
      const action = resetToolSettings();
      const state = toolsReducer(modifiedState, action);
      
      expect(state.currentTool.settings.color).toBe('#000000');
      expect(state.currentTool.settings.width).toBe(2);
      expect(state.currentTool.settings.opacity).toBe(1.0);
    });
  });

  describe('custom colors actions', () => {
    it('should add custom color', () => {
      const customColor = '#123456';
      const action = addCustomColor(customColor);
      const state = toolsReducer(initialState, action);
      
      expect(state.customColors).toContain(customColor);
      expect(state.customColors[0]).toBe(customColor); // Should be first
    });

    it('should not add duplicate custom color', () => {
      const customColor = '#123456';
      let state = toolsReducer(initialState, addCustomColor(customColor));
      state = toolsReducer(state, addCustomColor(customColor));
      
      expect(state.customColors.filter(color => color === customColor)).toHaveLength(1);
    });

    it('should maintain custom colors limit of 10', () => {
      let state = initialState;
      
      // Add 12 colors to exceed limit
      for (let i = 0; i < 12; i++) {
        const color = `#${i.toString().padStart(6, '0')}`;
        state = toolsReducer(state, addCustomColor(color));
      }
      
      expect(state.customColors).toHaveLength(10);
      expect(state.customColors[0]).toBe('#000011'); // Most recent should be first
    });

    it('should remove custom color', () => {
      const customColor = '#123456';
      let state = toolsReducer(initialState, addCustomColor(customColor));
      
      expect(state.customColors).toContain(customColor);
      
      state = toolsReducer(state, removeCustomColor(customColor));
      expect(state.customColors).not.toContain(customColor);
    });

    it('should handle removing non-existent custom color', () => {
      const action = removeCustomColor('#nonexistent');
      const state = toolsReducer(initialState, action);
      
      expect(state.customColors).toEqual(initialState.customColors);
    });
  });

  describe('tool history actions', () => {
    it('should switch to previous tool', () => {
      // Set up state with tool history
      let state = toolsReducer(initialState, setCurrentTool('highlighter'));
      state = toolsReducer(state, setCurrentTool('pencil'));
      
      expect(state.currentTool.type).toBe('pencil');
      expect(state.toolHistory[0].type).toBe('highlighter');
      expect(state.toolHistory[1].type).toBe('pen');
      
      // Switch to previous tool
      state = toolsReducer(state, switchToPreviousTool());
      
      expect(state.currentTool.type).toBe('highlighter');
      expect(state.toolHistory[0].type).toBe('pencil');
      expect(state.toolHistory[1].type).toBe('pen');
    });

    it('should handle switch to previous tool with empty history', () => {
      const action = switchToPreviousTool();
      const state = toolsReducer(initialState, action);
      
      // Should remain unchanged
      expect(state.currentTool.type).toBe('pen');
      expect(state.toolHistory).toHaveLength(0);
    });

    it('should maintain tool history order correctly', () => {
      let state = initialState;
      const tools: ToolType[] = ['highlighter', 'pencil', 'marker'];
      
      // Switch through tools
      for (const tool of tools) {
        state = toolsReducer(state, setCurrentTool(tool));
      }
      
      expect(state.currentTool.type).toBe('marker');
      expect(state.toolHistory[0].type).toBe('pencil');
      expect(state.toolHistory[1].type).toBe('highlighter');
      expect(state.toolHistory[2].type).toBe('pen');
      
      // Switch back
      state = toolsReducer(state, switchToPreviousTool());
      
      expect(state.currentTool.type).toBe('pencil');
      expect(state.toolHistory[0].type).toBe('marker');
      expect(state.toolHistory[1].type).toBe('highlighter');
      expect(state.toolHistory[2].type).toBe('pen');
    });
  });

  describe('edge cases and validation', () => {
    it('should handle undefined state gracefully', () => {
      const action = setCurrentTool('highlighter');
      const state = toolsReducer(undefined, action);
      
      expect(state).toBeDefined();
      expect(state.currentTool.type).toBe('highlighter');
      expect(state.colorPalette).toHaveLength(10);
    });

    it('should maintain immutability', () => {
      const action = setToolColor('#ff0000');
      const newState = toolsReducer(initialState, action);
      
      expect(newState).not.toBe(initialState);
      expect(initialState.currentTool.settings.color).toBe('#000000');
      expect(newState.currentTool.settings.color).toBe('#ff0000');
    });

    it('should handle rapid tool switching', () => {
      let state = initialState;
      const tools: ToolType[] = ['pen', 'highlighter', 'pencil', 'marker', 'eraser'];
      
      // Rapidly switch tools multiple times
      for (let i = 0; i < 20; i++) {
        const tool = tools[i % tools.length];
        state = toolsReducer(state, setCurrentTool(tool));
      }
      
      expect(state.currentTool.type).toBe('eraser');
      expect(state.toolHistory).toHaveLength(5); // Should maintain limit
    });

    it('should preserve settings across complex operations', () => {
      let state = initialState;
      
      // Set custom settings
      state = toolsReducer(state, updateToolSettings({
        color: '#ff0000',
        width: 8,
        opacity: 0.7,
      }));
      
      // Switch tools and back
      state = toolsReducer(state, setCurrentTool('highlighter'));
      state = toolsReducer(state, setCurrentTool('pencil'));
      state = toolsReducer(state, switchToPreviousTool());
      state = toolsReducer(state, switchToPreviousTool());
      
      // Settings should be preserved
      expect(state.currentTool.settings.color).toBe('#ff0000');
      expect(state.currentTool.settings.width).toBe(8);
      expect(state.currentTool.settings.opacity).toBe(0.7);
    });
  });

  describe('color palette', () => {
    it('should have default color palette', () => {
      expect(initialState.colorPalette).toHaveLength(10);
      expect(initialState.colorPalette).toContain('#000000'); // Black
      expect(initialState.colorPalette).toContain('#FF0000'); // Red
      expect(initialState.colorPalette).toContain('#00FF00'); // Green
      expect(initialState.colorPalette).toContain('#0000FF'); // Blue
    });

    it('should maintain color palette through state changes', () => {
      let state = toolsReducer(initialState, setCurrentTool('highlighter'));
      state = toolsReducer(state, setToolColor('#ff0000'));
      state = toolsReducer(state, addCustomColor('#123456'));
      
      expect(state.colorPalette).toEqual(initialState.colorPalette);
    });
  });
});