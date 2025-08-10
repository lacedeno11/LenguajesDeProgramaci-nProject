import canvasReducer, {
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
  CanvasState,
} from '../canvasSlice';
import { Stroke, TextElement, ImageElement, CanvasSize, ViewState } from '../../../types';

describe('canvasSlice', () => {
  const initialState: CanvasState = {
    size: { width: 4096, height: 3072 },
    zoom: 1.0,
    panOffset: { x: 0, y: 0 },
    strokes: {},
    textElements: {},
    imageElements: {},
  };

  describe('canvas size and view actions', () => {
    it('should set canvas size with 4x multiplier', () => {
      const newSize: CanvasSize = { width: 800, height: 600 };
      const action = setCanvasSize(newSize);
      const state = canvasReducer(initialState, action);
      
      expect(state.size).toEqual({ width: 3200, height: 2400 });
    });

    it('should set zoom within bounds (25% - 400%)', () => {
      let state = canvasReducer(initialState, setZoom(2.5));
      expect(state.zoom).toBe(2.5);
      
      // Test lower bound
      state = canvasReducer(initialState, setZoom(0.1));
      expect(state.zoom).toBe(0.25);
      
      // Test upper bound
      state = canvasReducer(initialState, setZoom(5.0));
      expect(state.zoom).toBe(4.0);
    });

    it('should set pan offset', () => {
      const offset = { x: 100, y: 200 };
      const action = setPanOffset(offset);
      const state = canvasReducer(initialState, action);
      
      expect(state.panOffset).toEqual(offset);
    });

    it('should update view state with zoom bounds', () => {
      const viewState: ViewState = { x: 50, y: 75, zoom: 3.5 };
      const action = updateViewState(viewState);
      const state = canvasReducer(initialState, action);
      
      expect(state.zoom).toBe(3.5);
      expect(state.panOffset).toEqual({ x: 50, y: 75 });
      
      // Test zoom bounds in view state
      const invalidViewState: ViewState = { x: 0, y: 0, zoom: 10.0 };
      const boundedState = canvasReducer(initialState, updateViewState(invalidViewState));
      expect(boundedState.zoom).toBe(4.0);
    });

    it('should reset view to defaults', () => {
      const modifiedState: CanvasState = {
        ...initialState,
        zoom: 2.5,
        panOffset: { x: 100, y: 200 },
      };
      
      const state = canvasReducer(modifiedState, resetView());
      
      expect(state.zoom).toBe(1.0);
      expect(state.panOffset).toEqual({ x: 0, y: 0 });
    });
  });

  describe('stroke actions', () => {
    const mockStroke: Stroke = {
      id: 'stroke-1',
      layerId: 'layer-1',
      tool: 'pen',
      points: [
        { x: 10, y: 10, timestamp: Date.now() },
        { x: 20, y: 20, timestamp: Date.now() + 10 },
      ],
      style: {
        color: '#000000',
        width: 2,
        opacity: 1.0,
        lineCap: 'round',
        lineJoin: 'round',
      },
      timestamp: Date.now(),
      bounds: { x: 10, y: 10, width: 10, height: 10 },
    };

    it('should add stroke', () => {
      const action = addStroke(mockStroke);
      const state = canvasReducer(initialState, action);
      
      expect(state.strokes[mockStroke.id]).toEqual(mockStroke);
    });

    it('should update existing stroke', () => {
      const stateWithStroke = canvasReducer(initialState, addStroke(mockStroke));
      
      const updatedStroke: Stroke = {
        ...mockStroke,
        style: { ...mockStroke.style, color: '#ff0000' },
      };
      
      const action = updateStroke(updatedStroke);
      const state = canvasReducer(stateWithStroke, action);
      
      expect(state.strokes[mockStroke.id].style.color).toBe('#ff0000');
    });

    it('should not update non-existent stroke', () => {
      const nonExistentStroke: Stroke = { ...mockStroke, id: 'non-existent' };
      const action = updateStroke(nonExistentStroke);
      const state = canvasReducer(initialState, action);
      
      expect(state.strokes['non-existent']).toBeUndefined();
    });

    it('should remove stroke', () => {
      const stateWithStroke = canvasReducer(initialState, addStroke(mockStroke));
      const action = removeStroke(mockStroke.id);
      const state = canvasReducer(stateWithStroke, action);
      
      expect(state.strokes[mockStroke.id]).toBeUndefined();
    });
  });

  describe('text element actions', () => {
    const mockTextElement: TextElement = {
      id: 'text-1',
      layerId: 'layer-1',
      content: 'Hello World',
      position: { x: 100, y: 100, timestamp: Date.now() },
      style: {
        fontSize: 16,
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#000000',
      },
      timestamp: Date.now(),
      bounds: { x: 100, y: 100, width: 80, height: 20 },
    };

    it('should add text element', () => {
      const action = addTextElement(mockTextElement);
      const state = canvasReducer(initialState, action);
      
      expect(state.textElements[mockTextElement.id]).toEqual(mockTextElement);
    });

    it('should update existing text element', () => {
      const stateWithText = canvasReducer(initialState, addTextElement(mockTextElement));
      
      const updatedTextElement: TextElement = {
        ...mockTextElement,
        content: 'Updated Text',
      };
      
      const action = updateTextElement(updatedTextElement);
      const state = canvasReducer(stateWithText, action);
      
      expect(state.textElements[mockTextElement.id].content).toBe('Updated Text');
    });

    it('should not update non-existent text element', () => {
      const nonExistentText: TextElement = { ...mockTextElement, id: 'non-existent' };
      const action = updateTextElement(nonExistentText);
      const state = canvasReducer(initialState, action);
      
      expect(state.textElements['non-existent']).toBeUndefined();
    });

    it('should remove text element', () => {
      const stateWithText = canvasReducer(initialState, addTextElement(mockTextElement));
      const action = removeTextElement(mockTextElement.id);
      const state = canvasReducer(stateWithText, action);
      
      expect(state.textElements[mockTextElement.id]).toBeUndefined();
    });
  });

  describe('image element actions', () => {
    const mockImageElement: ImageElement = {
      id: 'image-1',
      layerId: 'layer-1',
      uri: 'file://path/to/image.jpg',
      position: { x: 200, y: 200, timestamp: Date.now() },
      size: { width: 100, height: 100 },
      rotation: 0,
      timestamp: Date.now(),
      bounds: { x: 200, y: 200, width: 100, height: 100 },
    };

    it('should add image element', () => {
      const action = addImageElement(mockImageElement);
      const state = canvasReducer(initialState, action);
      
      expect(state.imageElements[mockImageElement.id]).toEqual(mockImageElement);
    });

    it('should update existing image element', () => {
      const stateWithImage = canvasReducer(initialState, addImageElement(mockImageElement));
      
      const updatedImageElement: ImageElement = {
        ...mockImageElement,
        rotation: 45,
      };
      
      const action = updateImageElement(updatedImageElement);
      const state = canvasReducer(stateWithImage, action);
      
      expect(state.imageElements[mockImageElement.id].rotation).toBe(45);
    });

    it('should not update non-existent image element', () => {
      const nonExistentImage: ImageElement = { ...mockImageElement, id: 'non-existent' };
      const action = updateImageElement(nonExistentImage);
      const state = canvasReducer(initialState, action);
      
      expect(state.imageElements['non-existent']).toBeUndefined();
    });

    it('should remove image element', () => {
      const stateWithImage = canvasReducer(initialState, addImageElement(mockImageElement));
      const action = removeImageElement(mockImageElement.id);
      const state = canvasReducer(stateWithImage, action);
      
      expect(state.imageElements[mockImageElement.id]).toBeUndefined();
    });
  });

  describe('clear canvas action', () => {
    it('should clear all canvas content', () => {
      const mockStroke: Stroke = {
        id: 'stroke-1',
        layerId: 'layer-1',
        tool: 'pen',
        points: [],
        style: { color: '#000000', width: 2, opacity: 1.0, lineCap: 'round', lineJoin: 'round' },
        timestamp: Date.now(),
        bounds: { x: 0, y: 0, width: 0, height: 0 },
      };

      const mockTextElement: TextElement = {
        id: 'text-1',
        layerId: 'layer-1',
        content: 'Test',
        position: { x: 0, y: 0, timestamp: Date.now() },
        style: { fontSize: 16, fontWeight: 'normal', fontStyle: 'normal', color: '#000000' },
        timestamp: Date.now(),
        bounds: { x: 0, y: 0, width: 0, height: 0 },
      };

      const mockImageElement: ImageElement = {
        id: 'image-1',
        layerId: 'layer-1',
        uri: 'test.jpg',
        position: { x: 0, y: 0, timestamp: Date.now() },
        size: { width: 100, height: 100 },
        rotation: 0,
        timestamp: Date.now(),
        bounds: { x: 0, y: 0, width: 100, height: 100 },
      };

      let state = canvasReducer(initialState, addStroke(mockStroke));
      state = canvasReducer(state, addTextElement(mockTextElement));
      state = canvasReducer(state, addImageElement(mockImageElement));

      // Verify content exists
      expect(Object.keys(state.strokes)).toHaveLength(1);
      expect(Object.keys(state.textElements)).toHaveLength(1);
      expect(Object.keys(state.imageElements)).toHaveLength(1);

      // Clear canvas
      state = canvasReducer(state, clearCanvas());

      // Verify content is cleared
      expect(Object.keys(state.strokes)).toHaveLength(0);
      expect(Object.keys(state.textElements)).toHaveLength(0);
      expect(Object.keys(state.imageElements)).toHaveLength(0);
    });
  });

  describe('edge cases and validation', () => {
    it('should handle undefined state gracefully', () => {
      const action = setZoom(1.5);
      const state = canvasReducer(undefined, action);
      
      expect(state).toBeDefined();
      expect(state.zoom).toBe(1.5);
    });

    it('should maintain immutability', () => {
      const action = setZoom(2.0);
      const newState = canvasReducer(initialState, action);
      
      expect(newState).not.toBe(initialState);
      expect(initialState.zoom).toBe(1.0);
      expect(newState.zoom).toBe(2.0);
    });

    it('should handle multiple rapid updates', () => {
      let state = initialState;
      
      for (let i = 0; i < 100; i++) {
        state = canvasReducer(state, setZoom(1 + i * 0.01));
      }
      
      expect(state.zoom).toBeCloseTo(1.99, 2);
    });
  });
});