import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Tool, ToolType, ToolSettings } from '../../types';

export interface ToolsState {
  currentTool: Tool;
  toolHistory: Tool[];
  colorPalette: string[];
  customColors: string[];
}

const defaultToolSettings: ToolSettings = {
  color: '#000000',
  width: 2,
  opacity: 1.0,
};

const initialState: ToolsState = {
  currentTool: {
    type: 'pen',
    settings: defaultToolSettings,
  },
  toolHistory: [],
  colorPalette: [
    '#000000', // Black
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#FFA500', // Orange
    '#800080', // Purple
    '#A52A2A', // Brown
  ],
  customColors: [],
};

const toolsSlice = createSlice({
  name: 'tools',
  initialState,
  reducers: {
    setCurrentTool: (state, action: PayloadAction<ToolType>) => {
      // Save current tool to history
      if (state.currentTool.type !== action.payload) {
        state.toolHistory.unshift(state.currentTool);
        // Keep only last 5 tools in history
        if (state.toolHistory.length > 5) {
          state.toolHistory = state.toolHistory.slice(0, 5);
        }
      }
      
      // Adjust settings for eraser
      let newSettings = { ...state.currentTool.settings };
      if (action.payload === 'eraser' && newSettings.width < 8) {
        newSettings.width = 12; // Default smaller eraser size
      }
      
      state.currentTool = {
        type: action.payload,
        settings: newSettings,
      };
    },
    
    updateToolSettings: (state, action: PayloadAction<Partial<ToolSettings>>) => {
      state.currentTool.settings = {
        ...state.currentTool.settings,
        ...action.payload,
      };
    },
    
    setToolColor: (state, action: PayloadAction<string>) => {
      state.currentTool.settings.color = action.payload;
    },
    
    setToolWidth: (state, action: PayloadAction<number>) => {
      // Different limits for different tools
      const maxWidth = state.currentTool.type === 'eraser' ? 100 : 20;
      state.currentTool.settings.width = Math.max(1, Math.min(maxWidth, action.payload));
    },
    
    setToolOpacity: (state, action: PayloadAction<number>) => {
      // Clamp opacity between 0 and 1
      state.currentTool.settings.opacity = Math.max(0, Math.min(1, action.payload));
    },
    
    addCustomColor: (state, action: PayloadAction<string>) => {
      if (!state.customColors.includes(action.payload)) {
        state.customColors.unshift(action.payload);
        // Keep only last 10 custom colors
        if (state.customColors.length > 10) {
          state.customColors = state.customColors.slice(0, 10);
        }
      }
    },
    
    removeCustomColor: (state, action: PayloadAction<string>) => {
      state.customColors = state.customColors.filter(color => color !== action.payload);
    },
    
    switchToPreviousTool: (state) => {
      if (state.toolHistory.length > 0) {
        const previousTool = state.toolHistory[0];
        state.toolHistory = state.toolHistory.slice(1);
        state.toolHistory.unshift(state.currentTool);
        state.currentTool = previousTool;
      }
    },
    
    resetToolSettings: (state) => {
      state.currentTool.settings = { ...defaultToolSettings };
    },
  },
});

export const {
  setCurrentTool,
  updateToolSettings,
  setToolColor,
  setToolWidth,
  setToolOpacity,
  addCustomColor,
  removeCustomColor,
  switchToPreviousTool,
  resetToolSettings,
} = toolsSlice.actions;

export default toolsSlice.reducer;