import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Stroke, TextElement, ImageElement, CanvasSize, ViewState } from '../../types';

export interface CanvasState {
  size: CanvasSize;
  zoom: number;
  panOffset: { x: number; y: number };
  strokes: Record<string, Stroke>;
  textElements: Record<string, TextElement>;
  imageElements: Record<string, ImageElement>;
  selectedImageId: string | null;
}

const CANVAS_MULTIPLIER = 4; // Canvas is 4x screen size
const DEFAULT_SCREEN_SIZE = { width: 1024, height: 768 }; // Default tablet size

const initialState: CanvasState = {
  size: {
    width: DEFAULT_SCREEN_SIZE.width * CANVAS_MULTIPLIER,
    height: DEFAULT_SCREEN_SIZE.height * CANVAS_MULTIPLIER,
  },
  zoom: 1.0,
  panOffset: { x: 0, y: 0 },
  strokes: {},
  textElements: {},
  imageElements: {},
  selectedImageId: null,
};

const canvasSlice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
    setCanvasSize: (state, action: PayloadAction<CanvasSize>) => {
      state.size = {
        width: action.payload.width * CANVAS_MULTIPLIER,
        height: action.payload.height * CANVAS_MULTIPLIER,
      };
    },
    
    setZoom: (state, action: PayloadAction<number>) => {
      // Clamp zoom between 25% and 400%
      state.zoom = Math.max(0.25, Math.min(4.0, action.payload));
    },
    
    setPanOffset: (state, action: PayloadAction<{ x: number; y: number }>) => {
      state.panOffset = action.payload;
    },
    
    updateViewState: (state, action: PayloadAction<ViewState>) => {
      state.zoom = Math.max(0.25, Math.min(4.0, action.payload.zoom));
      state.panOffset = { x: action.payload.x, y: action.payload.y };
    },
    
    resetView: (state) => {
      state.zoom = 1.0;
      state.panOffset = { x: 0, y: 0 };
    },
    
    addStroke: (state, action: PayloadAction<Stroke>) => {
      state.strokes[action.payload.id] = action.payload;
    },
    
    updateStroke: (state, action: PayloadAction<Stroke>) => {
      if (state.strokes[action.payload.id]) {
        state.strokes[action.payload.id] = action.payload;
      }
    },
    
    removeStroke: (state, action: PayloadAction<string>) => {
      delete state.strokes[action.payload];
    },
    
    addTextElement: (state, action: PayloadAction<TextElement>) => {
      state.textElements[action.payload.id] = action.payload;
    },
    
    updateTextElement: (state, action: PayloadAction<TextElement>) => {
      if (state.textElements[action.payload.id]) {
        state.textElements[action.payload.id] = action.payload;
      }
    },
    
    removeTextElement: (state, action: PayloadAction<string>) => {
      delete state.textElements[action.payload];
    },
    
    addImageElement: (state, action: PayloadAction<ImageElement>) => {
      state.imageElements[action.payload.id] = action.payload;
    },
    
    updateImageElement: (state, action: PayloadAction<ImageElement>) => {
      if (state.imageElements[action.payload.id]) {
        state.imageElements[action.payload.id] = action.payload;
      }
    },
    
    removeImageElement: (state, action: PayloadAction<string>) => {
      delete state.imageElements[action.payload];
    },
    
    clearCanvas: (state) => {
      state.strokes = {};
      state.textElements = {};
      state.imageElements = {};
      state.selectedImageId = null;
    },
    
    selectImageElement: (state, action: PayloadAction<string>) => {
      state.selectedImageId = action.payload;
    },
    
    deselectAllImages: (state) => {
      state.selectedImageId = null;
    },
  },
});

export const {
  setCanvasSize,
  setZoom,
  setPanOffset,
  updateViewState,
  resetView,
  addStroke,
  updateStroke,
  removeStroke,
  addTextElement,
  updateTextElement,
  removeTextElement,
  addImageElement,
  updateImageElement,
  removeImageElement,
  clearCanvas,
  selectImageElement,
  deselectAllImages,
} = canvasSlice.actions;

export default canvasSlice.reducer;