import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import canvasSlice from './slices/canvasSlice';
import toolsSlice from './slices/toolsSlice';
import layersSlice from './slices/layersSlice';
import historySlice from './slices/historySlice';
import uiSlice from './slices/uiSlice';

// Combine all reducers
const rootReducer = combineReducers({
  canvas: canvasSlice,
  tools: toolsSlice,
  layers: layersSlice,
  history: historySlice,
  ui: uiSlice,
});

// Configure store with proper middleware and DevTools
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serialization check
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'canvas/addStroke',
          'canvas/updateStroke',
        ],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['canvas.strokes', 'canvas.textElements', 'canvas.imageElements'],
      },
      // Enable immutability check in development
      immutableCheck: {
        warnAfter: 128,
      },
      // Enable thunk middleware for async actions
      thunk: {
        extraArgument: undefined,
      },
    }),
  // Enable Redux DevTools in development
  devTools: __DEV__ && {
    name: 'SL8 Whiteboard',
    trace: true,
    traceLimit: 25,
    actionSanitizer: (action) => ({
      ...action,
      // Sanitize large payloads for better DevTools performance
      payload: action.type.includes('Stroke') && action.payload?.points?.length > 10
        ? { ...action.payload, points: `[${action.payload.points.length} points]` }
        : action.payload,
    }),
    stateSanitizer: (state) => ({
      ...state,
      // Sanitize large state objects for better DevTools performance
      canvas: {
        ...state.canvas,
        strokes: `${Object.keys(state.canvas.strokes).length} strokes`,
      },
    }),
  },
  // Enhance store for better performance
  enhancers: (getDefaultEnhancers) =>
    getDefaultEnhancers({
      autoBatch: true,
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Create typed hooks for use throughout the app
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Export root reducer for testing purposes
export { rootReducer };