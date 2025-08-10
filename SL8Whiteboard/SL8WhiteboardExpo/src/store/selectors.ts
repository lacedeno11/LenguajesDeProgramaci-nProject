import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './index';

// Canvas selectors
export const selectCanvasState = (state: RootState) => state.canvas;
export const selectCanvasSize = (state: RootState) => state.canvas.size;
export const selectCanvasZoom = (state: RootState) => state.canvas.zoom;
export const selectCanvasPanOffset = (state: RootState) => state.canvas.panOffset;
export const selectCanvasStrokes = (state: RootState) => state.canvas.strokes;
export const selectCanvasTextElements = (state: RootState) => state.canvas.textElements;
export const selectCanvasImageElements = (state: RootState) => state.canvas.imageElements;

// Canvas computed selectors
export const selectCanvasViewState = createSelector(
  [selectCanvasZoom, selectCanvasPanOffset],
  (zoom, panOffset) => ({
    zoom,
    x: panOffset.x,
    y: panOffset.y,
  })
);

export const selectCanvasStrokeCount = createSelector(
  [selectCanvasStrokes],
  (strokes) => Object.keys(strokes).length
);

// Tools selectors
export const selectToolsState = (state: RootState) => state.tools;
export const selectCurrentTool = (state: RootState) => state.tools.currentTool;
export const selectCurrentToolType = (state: RootState) => state.tools.currentTool.type;
export const selectCurrentToolSettings = (state: RootState) => state.tools.currentTool.settings;
export const selectToolHistory = (state: RootState) => state.tools.toolHistory;
export const selectColorPalette = (state: RootState) => state.tools.colorPalette;
export const selectCustomColors = (state: RootState) => state.tools.customColors;

// Tools computed selectors
export const selectCanUndo = createSelector(
  [(state: RootState) => state.history.currentIndex],
  (currentIndex) => currentIndex > 0
);

export const selectCanRedo = createSelector(
  [(state: RootState) => state.history.entries.length, (state: RootState) => state.history.currentIndex],
  (entriesLength, currentIndex) => currentIndex < entriesLength - 1
);

export const selectAllColors = createSelector(
  [selectColorPalette, selectCustomColors],
  (palette, custom) => [...palette, ...custom]
);

// Layers selectors
export const selectLayersState = (state: RootState) => state.layers;
export const selectAllLayers = (state: RootState) => state.layers.layers;
export const selectActiveLayerId = (state: RootState) => state.layers.activeLayerId;
export const selectLayerOrder = (state: RootState) => state.layers.layerOrder;

// Layers computed selectors
export const selectActiveLayer = createSelector(
  [selectAllLayers, selectActiveLayerId],
  (layers, activeLayerId) => layers[activeLayerId]
);

export const selectOrderedLayers = createSelector(
  [selectAllLayers, selectLayerOrder],
  (layers, order) => order.map(id => layers[id]).filter(Boolean)
);

export const selectVisibleLayers = createSelector(
  [selectOrderedLayers],
  (layers) => layers.filter(layer => layer.visible)
);

export const selectLayerById = (layerId: string) => createSelector(
  [selectAllLayers],
  (layers) => layers[layerId]
);

// History selectors
export const selectHistoryState = (state: RootState) => state.history;
export const selectHistoryEntries = (state: RootState) => state.history.entries;
export const selectHistoryCurrentIndex = (state: RootState) => state.history.currentIndex;
export const selectHistoryMaxEntries = (state: RootState) => state.history.maxEntries;

// History computed selectors
export const selectCurrentHistoryEntry = createSelector(
  [selectHistoryEntries, selectHistoryCurrentIndex],
  (entries, currentIndex) => currentIndex >= 0 ? entries[currentIndex] : null
);

export const selectHistoryCount = createSelector(
  [selectHistoryEntries],
  (entries) => entries.length
);

// UI selectors
export const selectUIState = (state: RootState) => state.ui;
export const selectShowToolbar = (state: RootState) => state.ui.showToolbar;
export const selectShowLayerPanel = (state: RootState) => state.ui.showLayerPanel;
export const selectShowMinimap = (state: RootState) => state.ui.showMinimap;
export const selectShowColorPicker = (state: RootState) => state.ui.showColorPicker;
export const selectShowTextInput = (state: RootState) => state.ui.showTextInput;
export const selectIsLoading = (state: RootState) => state.ui.isLoading;
export const selectLoadingMessage = (state: RootState) => state.ui.loadingMessage;
export const selectErrorMessage = (state: RootState) => state.ui.errorMessage;
export const selectSelectedElements = (state: RootState) => state.ui.selectedElements;
export const selectShowPerformanceWarning = (state: RootState) => state.ui.showPerformanceWarning;

// UI computed selectors
export const selectHasError = createSelector(
  [selectErrorMessage],
  (errorMessage) => errorMessage !== null
);

export const selectHasSelection = createSelector(
  [selectSelectedElements],
  (selectedElements) => selectedElements.length > 0
);

export const selectSelectionCount = createSelector(
  [selectSelectedElements],
  (selectedElements) => selectedElements.length
);

// Cross-slice selectors
export const selectStrokesByLayer = (layerId: string) => createSelector(
  [selectCanvasStrokes, (state: RootState) => selectLayerById(layerId)(state)],
  (strokes, layer) => {
    if (!layer) return [];
    return layer.strokes.map(strokeId => strokes[strokeId]).filter(Boolean);
  }
);

export const selectElementsInActiveLayer = createSelector(
  [selectActiveLayer, selectCanvasStrokes, selectCanvasTextElements, selectCanvasImageElements],
  (activeLayer, strokes, textElements, imageElements) => {
    if (!activeLayer) return { strokes: [], textElements: [], imageElements: [] };
    
    return {
      strokes: activeLayer.strokes.map(id => strokes[id]).filter(Boolean),
      textElements: activeLayer.textElements.map(id => textElements[id]).filter(Boolean),
      imageElements: activeLayer.imageElements.map(id => imageElements[id]).filter(Boolean),
    };
  }
);

export const selectCanvasContentBounds = createSelector(
  [selectCanvasStrokes, selectCanvasTextElements, selectCanvasImageElements],
  (strokes, textElements, imageElements) => {
    const allElements = [
      ...Object.values(strokes),
      ...Object.values(textElements),
      ...Object.values(imageElements),
    ];
    
    if (allElements.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    
    allElements.forEach(element => {
      if (element.bounds) {
        minX = Math.min(minX, element.bounds.x);
        minY = Math.min(minY, element.bounds.y);
        maxX = Math.max(maxX, element.bounds.x + element.bounds.width);
        maxY = Math.max(maxY, element.bounds.y + element.bounds.height);
      }
    });
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }
);