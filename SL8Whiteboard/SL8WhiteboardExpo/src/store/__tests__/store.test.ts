import { store, rootReducer, RootState } from '../index';
import { setZoom, setPanOffset, resetView } from '../slices/canvasSlice';
import { setCurrentTool, updateToolSettings } from '../slices/toolsSlice';
import { createLayer, setActiveLayer } from '../slices/layersSlice';
import { addHistoryEntry, undo, redo } from '../slices/historySlice';
import { setLoading, setError } from '../slices/uiSlice';

describe('Redux Store Configuration', () => {
  describe('Store Setup', () => {
    it('should create store with all required slices', () => {
      const state = store.getState();
      
      expect(state).toHaveProperty('canvas');
      expect(state).toHaveProperty('tools');
      expect(state).toHaveProperty('layers');
      expect(state).toHaveProperty('history');
      expect(state).toHaveProperty('ui');
    });

    it('should have proper initial state structure', () => {
      const state = store.getState();
      
      // Canvas state
      expect(state.canvas).toHaveProperty('size');
      expect(state.canvas).toHaveProperty('zoom');
      expect(state.canvas).toHaveProperty('panOffset');
      expect(state.canvas).toHaveProperty('strokes');
      expect(state.canvas).toHaveProperty('textElements');
      expect(state.canvas).toHaveProperty('imageElements');
      
      // Tools state
      expect(state.tools).toHaveProperty('currentTool');
      expect(state.tools).toHaveProperty('toolHistory');
      expect(state.tools).toHaveProperty('colorPalette');
      expect(state.tools).toHaveProperty('customColors');
      
      // Layers state
      expect(state.layers).toHaveProperty('layers');
      expect(state.layers).toHaveProperty('activeLayerId');
      expect(state.layers).toHaveProperty('layerOrder');
      
      // History state
      expect(state.history).toHaveProperty('entries');
      expect(state.history).toHaveProperty('currentIndex');
      expect(state.history).toHaveProperty('maxEntries');
      
      // UI state
      expect(state.ui).toHaveProperty('showToolbar');
      expect(state.ui).toHaveProperty('showLayerPanel');
      expect(state.ui).toHaveProperty('isLoading');
      expect(state.ui).toHaveProperty('errorMessage');
    });

    it('should have correct initial values', () => {
      const state = store.getState();
      
      expect(state.canvas.zoom).toBe(1.0);
      expect(state.canvas.panOffset).toEqual({ x: 0, y: 0 });
      expect(state.tools.currentTool.type).toBe('pen');
      expect(state.layers.layerOrder).toHaveLength(1);
      expect(state.history.entries).toHaveLength(0);
      expect(state.history.currentIndex).toBe(-1);
      expect(state.ui.showToolbar).toBe(true);
      expect(state.ui.isLoading).toBe(false);
      expect(state.ui.errorMessage).toBeNull();
    });
  });

  describe('Action Dispatching', () => {
    beforeEach(() => {
      // Reset store to initial state before each test
      store.dispatch({ type: '@@INIT' });
    });

    it('should handle canvas actions', () => {
      store.dispatch(setZoom(2.0));
      expect(store.getState().canvas.zoom).toBe(2.0);
      
      store.dispatch(setPanOffset({ x: 100, y: 200 }));
      expect(store.getState().canvas.panOffset).toEqual({ x: 100, y: 200 });
      
      store.dispatch(resetView());
      expect(store.getState().canvas.zoom).toBe(1.0);
      expect(store.getState().canvas.panOffset).toEqual({ x: 0, y: 0 });
    });

    it('should handle tools actions', () => {
      store.dispatch(setCurrentTool('highlighter'));
      expect(store.getState().tools.currentTool.type).toBe('highlighter');
      
      store.dispatch(updateToolSettings({ color: '#ff0000', width: 5 }));
      expect(store.getState().tools.currentTool.settings.color).toBe('#ff0000');
      expect(store.getState().tools.currentTool.settings.width).toBe(5);
    });

    it('should handle layers actions', () => {
      const layerId = 'test-layer';
      store.dispatch(createLayer({ id: layerId, name: 'Test Layer' }));
      
      const state = store.getState();
      expect(state.layers.layers[layerId]).toBeDefined();
      expect(state.layers.layers[layerId].name).toBe('Test Layer');
      expect(state.layers.activeLayerId).toBe(layerId);
      expect(state.layers.layerOrder).toContain(layerId);
    });

    it('should handle history actions', () => {
      store.dispatch(addHistoryEntry({
        action: 'test-action',
        data: { test: 'data' }
      }));
      
      let state = store.getState();
      expect(state.history.entries).toHaveLength(1);
      expect(state.history.currentIndex).toBe(0);
      
      // Add another entry to have something to undo to
      store.dispatch(addHistoryEntry({
        action: 'test-action-2',
        data: { test: 'data2' }
      }));
      
      state = store.getState();
      expect(state.history.entries).toHaveLength(2);
      expect(state.history.currentIndex).toBe(1);
      
      store.dispatch(undo());
      state = store.getState();
      expect(state.history.currentIndex).toBe(0);
      
      store.dispatch(redo());
      state = store.getState();
      expect(state.history.currentIndex).toBe(1);
    });

    it('should handle UI actions', () => {
      store.dispatch(setLoading({ isLoading: true, message: 'Loading...' }));
      let state = store.getState();
      expect(state.ui.isLoading).toBe(true);
      expect(state.ui.loadingMessage).toBe('Loading...');
      
      store.dispatch(setError('Test error'));
      state = store.getState();
      expect(state.ui.errorMessage).toBe('Test error');
    });
  });

  describe('Root Reducer', () => {
    it('should combine all slice reducers', () => {
      const initialState = rootReducer(undefined, { type: '@@INIT' });
      
      expect(initialState).toHaveProperty('canvas');
      expect(initialState).toHaveProperty('tools');
      expect(initialState).toHaveProperty('layers');
      expect(initialState).toHaveProperty('history');
      expect(initialState).toHaveProperty('ui');
    });

    it('should handle unknown actions gracefully', () => {
      const initialState = rootReducer(undefined, { type: '@@INIT' });
      const newState = rootReducer(initialState, { type: 'UNKNOWN_ACTION' });
      
      expect(newState).toEqual(initialState);
    });
  });

  describe('Type Safety', () => {
    it('should have proper TypeScript types', () => {
      const state: RootState = store.getState();
      
      // These should compile without errors
      const canvasZoom: number = state.canvas.zoom;
      const currentTool: string = state.tools.currentTool.type;
      const layerCount: number = state.layers.layerOrder.length;
      const historyIndex: number = state.history.currentIndex;
      const isLoading: boolean = state.ui.isLoading;
      
      expect(typeof canvasZoom).toBe('number');
      expect(typeof currentTool).toBe('string');
      expect(typeof layerCount).toBe('number');
      expect(typeof historyIndex).toBe('number');
      expect(typeof isLoading).toBe('boolean');
    });
  });

  describe('Performance Considerations', () => {
    it('should handle multiple rapid actions without issues', () => {
      const startTime = performance.now();
      
      // Dispatch 100 actions rapidly
      for (let i = 0; i < 100; i++) {
        store.dispatch(setZoom(1 + i * 0.01));
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (less than 100ms)
      expect(duration).toBeLessThan(100);
      expect(store.getState().canvas.zoom).toBeCloseTo(1.99, 1);
    });

    it('should maintain history limit', () => {
      // Add more entries than the limit
      for (let i = 0; i < 60; i++) {
        store.dispatch(addHistoryEntry({
          action: `action-${i}`,
          data: { index: i }
        }));
      }
      
      const state = store.getState();
      expect(state.history.entries.length).toBeLessThanOrEqual(50);
    });
  });
});