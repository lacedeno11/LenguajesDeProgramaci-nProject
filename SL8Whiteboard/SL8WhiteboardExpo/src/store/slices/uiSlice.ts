import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UIState {
  showToolbar: boolean;
  showLayerPanel: boolean;
  showMinimap: boolean;
  showColorPicker: boolean;
  showTextInput: boolean;
  isLoading: boolean;
  loadingMessage: string;
  errorMessage: string | null;
  selectedElements: string[];
  showPerformanceWarning: boolean;
  imagePickerVisible: boolean;
  cameraVisible: boolean;
  selectedImageId: string | null;
}

const initialState: UIState = {
  showToolbar: true,
  showLayerPanel: false,
  showMinimap: false,
  showColorPicker: false,
  showTextInput: false,
  isLoading: false,
  loadingMessage: '',
  errorMessage: null,
  selectedElements: [],
  showPerformanceWarning: false,
  imagePickerVisible: false,
  cameraVisible: false,
  selectedImageId: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleToolbar: (state) => {
      state.showToolbar = !state.showToolbar;
    },
    
    setShowToolbar: (state, action: PayloadAction<boolean>) => {
      state.showToolbar = action.payload;
    },
    
    toggleLayerPanel: (state) => {
      state.showLayerPanel = !state.showLayerPanel;
    },
    
    setShowLayerPanel: (state, action: PayloadAction<boolean>) => {
      state.showLayerPanel = action.payload;
    },
    
    toggleMinimap: (state) => {
      state.showMinimap = !state.showMinimap;
    },
    
    setShowMinimap: (state, action: PayloadAction<boolean>) => {
      state.showMinimap = action.payload;
    },
    
    toggleColorPicker: (state) => {
      state.showColorPicker = !state.showColorPicker;
    },
    
    setShowColorPicker: (state, action: PayloadAction<boolean>) => {
      state.showColorPicker = action.payload;
    },
    
    setShowTextInput: (state, action: PayloadAction<boolean>) => {
      state.showTextInput = action.payload;
    },
    
    setLoading: (state, action: PayloadAction<{ isLoading: boolean; message?: string }>) => {
      state.isLoading = action.payload.isLoading;
      state.loadingMessage = action.payload.message || '';
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.errorMessage = action.payload;
    },
    
    clearError: (state) => {
      state.errorMessage = null;
    },
    
    setSelectedElements: (state, action: PayloadAction<string[]>) => {
      state.selectedElements = action.payload;
    },
    
    addSelectedElement: (state, action: PayloadAction<string>) => {
      if (!state.selectedElements.includes(action.payload)) {
        state.selectedElements.push(action.payload);
      }
    },
    
    removeSelectedElement: (state, action: PayloadAction<string>) => {
      state.selectedElements = state.selectedElements.filter(id => id !== action.payload);
    },
    
    clearSelection: (state) => {
      state.selectedElements = [];
    },
    
    setShowPerformanceWarning: (state, action: PayloadAction<boolean>) => {
      state.showPerformanceWarning = action.payload;
    },
    
    setImagePickerVisible: (state, action: PayloadAction<boolean>) => {
      state.imagePickerVisible = action.payload;
    },
    
    setCameraVisible: (state, action: PayloadAction<boolean>) => {
      state.cameraVisible = action.payload;
    },
    
    setSelectedImageId: (state, action: PayloadAction<string | null>) => {
      state.selectedImageId = action.payload;
    },
  },
});

export const {
  toggleToolbar,
  setShowToolbar,
  toggleLayerPanel,
  setShowLayerPanel,
  toggleMinimap,
  setShowMinimap,
  toggleColorPicker,
  setShowColorPicker,
  setShowTextInput,
  setLoading,
  setError,
  clearError,
  setSelectedElements,
  addSelectedElement,
  removeSelectedElement,
  clearSelection,
  setShowPerformanceWarning,
  setImagePickerVisible,
  setCameraVisible,
  setSelectedImageId,
} = uiSlice.actions;

export default uiSlice.reducer;