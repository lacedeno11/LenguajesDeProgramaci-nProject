import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Layer } from '../../types';

export interface LayersState {
  layers: Record<string, Layer>;
  activeLayerId: string;
  layerOrder: string[];
}

const defaultLayer: Layer = {
  id: 'default-layer',
  name: 'Layer 1',
  visible: true,
  locked: false,
  opacity: 1.0,
  order: 0,
  strokes: [],
  textElements: [],
  imageElements: [],
};

const initialState: LayersState = {
  layers: {
    [defaultLayer.id]: defaultLayer,
  },
  activeLayerId: defaultLayer.id,
  layerOrder: [defaultLayer.id],
};

const layersSlice = createSlice({
  name: 'layers',
  initialState,
  reducers: {
    createLayer: (state, action: PayloadAction<{ id: string; name: string }>) => {
      const newLayer: Layer = {
        id: action.payload.id,
        name: action.payload.name,
        visible: true,
        locked: false,
        opacity: 1.0,
        order: state.layerOrder.length,
        strokes: [],
        textElements: [],
        imageElements: [],
      };
      
      state.layers[action.payload.id] = newLayer;
      state.layerOrder.push(action.payload.id);
      state.activeLayerId = action.payload.id;
    },
    
    deleteLayer: (state, action: PayloadAction<string>) => {
      const layerId = action.payload;
      
      // Don't delete if it's the only layer
      if (state.layerOrder.length <= 1) {
        return;
      }
      
      // Remove from layers and order
      delete state.layers[layerId];
      state.layerOrder = state.layerOrder.filter(id => id !== layerId);
      
      // Set new active layer if deleted layer was active
      if (state.activeLayerId === layerId) {
        state.activeLayerId = state.layerOrder[0];
      }
      
      // Update order indices
      state.layerOrder.forEach((id, index) => {
        if (state.layers[id]) {
          state.layers[id].order = index;
        }
      });
    },
    
    setActiveLayer: (state, action: PayloadAction<string>) => {
      if (state.layers[action.payload]) {
        state.activeLayerId = action.payload;
      }
    },
    
    toggleLayerVisibility: (state, action: PayloadAction<string>) => {
      const layer = state.layers[action.payload];
      if (layer) {
        layer.visible = !layer.visible;
      }
    },
    
    setLayerOpacity: (state, action: PayloadAction<{ layerId: string; opacity: number }>) => {
      const layer = state.layers[action.payload.layerId];
      if (layer) {
        layer.opacity = Math.max(0, Math.min(1, action.payload.opacity));
      }
    },
    
    toggleLayerLock: (state, action: PayloadAction<string>) => {
      const layer = state.layers[action.payload];
      if (layer) {
        layer.locked = !layer.locked;
      }
    },
    
    renameLayer: (state, action: PayloadAction<{ layerId: string; name: string }>) => {
      const layer = state.layers[action.payload.layerId];
      if (layer) {
        layer.name = action.payload.name;
      }
    },
    
    reorderLayers: (state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) => {
      const { fromIndex, toIndex } = action.payload;
      
      if (fromIndex >= 0 && fromIndex < state.layerOrder.length &&
          toIndex >= 0 && toIndex < state.layerOrder.length) {
        
        const [movedLayerId] = state.layerOrder.splice(fromIndex, 1);
        state.layerOrder.splice(toIndex, 0, movedLayerId);
        
        // Update order indices
        state.layerOrder.forEach((id, index) => {
          if (state.layers[id]) {
            state.layers[id].order = index;
          }
        });
      }
    },
    
    addStrokeToLayer: (state, action: PayloadAction<{ layerId: string; strokeId: string }>) => {
      const layer = state.layers[action.payload.layerId];
      if (layer && !layer.strokes.includes(action.payload.strokeId)) {
        layer.strokes.push(action.payload.strokeId);
      }
    },
    
    removeStrokeFromLayer: (state, action: PayloadAction<{ layerId: string; strokeId: string }>) => {
      const layer = state.layers[action.payload.layerId];
      if (layer) {
        layer.strokes = layer.strokes.filter(id => id !== action.payload.strokeId);
      }
    },
    
    addTextElementToLayer: (state, action: PayloadAction<{ layerId: string; textElementId: string }>) => {
      const layer = state.layers[action.payload.layerId];
      if (layer && !layer.textElements.includes(action.payload.textElementId)) {
        layer.textElements.push(action.payload.textElementId);
      }
    },
    
    removeTextElementFromLayer: (state, action: PayloadAction<{ layerId: string; textElementId: string }>) => {
      const layer = state.layers[action.payload.layerId];
      if (layer) {
        layer.textElements = layer.textElements.filter(id => id !== action.payload.textElementId);
      }
    },
    
    addImageElementToLayer: (state, action: PayloadAction<{ layerId: string; imageElementId: string }>) => {
      const layer = state.layers[action.payload.layerId];
      if (layer && !layer.imageElements.includes(action.payload.imageElementId)) {
        layer.imageElements.push(action.payload.imageElementId);
      }
    },
    
    removeImageElementFromLayer: (state, action: PayloadAction<{ layerId: string; imageElementId: string }>) => {
      const layer = state.layers[action.payload.layerId];
      if (layer) {
        layer.imageElements = layer.imageElements.filter(id => id !== action.payload.imageElementId);
      }
    },
  },
});

export const {
  createLayer,
  deleteLayer,
  setActiveLayer,
  toggleLayerVisibility,
  setLayerOpacity,
  toggleLayerLock,
  renameLayer,
  reorderLayers,
  addStrokeToLayer,
  removeStrokeFromLayer,
  addTextElementToLayer,
  removeTextElementFromLayer,
  addImageElementToLayer,
  removeImageElementFromLayer,
} = layersSlice.actions;

export default layersSlice.reducer;