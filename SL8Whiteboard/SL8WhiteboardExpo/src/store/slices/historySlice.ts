import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HistoryEntry } from '../../types';

export interface HistoryState {
  entries: HistoryEntry[];
  currentIndex: number;
  maxEntries: number;
}

const initialState: HistoryState = {
  entries: [],
  currentIndex: -1,
  maxEntries: 50,
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    addHistoryEntry: (state, action: PayloadAction<Omit<HistoryEntry, 'id' | 'timestamp'>>) => {
      const entry: HistoryEntry = {
        id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        ...action.payload,
      };
      
      // Remove any entries after current index (when user performs action after undo)
      if (state.currentIndex < state.entries.length - 1) {
        state.entries = state.entries.slice(0, state.currentIndex + 1);
      }
      
      // Add new entry
      state.entries.push(entry);
      state.currentIndex = state.entries.length - 1;
      
      // Maintain max entries limit
      if (state.entries.length > state.maxEntries) {
        const removeCount = state.entries.length - state.maxEntries;
        state.entries = state.entries.slice(removeCount);
        state.currentIndex -= removeCount;
      }
    },
    
    undo: (state) => {
      if (state.currentIndex > 0) {
        state.currentIndex--;
      }
    },
    
    redo: (state) => {
      if (state.currentIndex < state.entries.length - 1) {
        state.currentIndex++;
      }
    },
    
    clearHistory: (state) => {
      state.entries = [];
      state.currentIndex = -1;
    },
    
    setMaxEntries: (state, action: PayloadAction<number>) => {
      state.maxEntries = Math.max(1, action.payload);
      
      // Trim entries if necessary
      if (state.entries.length > state.maxEntries) {
        const removeCount = state.entries.length - state.maxEntries;
        state.entries = state.entries.slice(removeCount);
        state.currentIndex = Math.max(0, state.currentIndex - removeCount);
      }
    },
  },
});

export const {
  addHistoryEntry,
  undo,
  redo,
  clearHistory,
  setMaxEntries,
} = historySlice.actions;

export default historySlice.reducer;