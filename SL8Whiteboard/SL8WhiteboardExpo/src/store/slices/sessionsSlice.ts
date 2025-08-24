import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { canvasService } from '../../services/CanvasService';
import { CanvasSession, SerializedCanvasState } from '../../types/api';

// Async thunks for session actions
export const loadSessionsAsync = createAsyncThunk(
  'sessions/loadSessions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await canvasService.listSessions();
      if (!response.success) {
        return rejectWithValue(response.error || response.message);
      }
      return response.data || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load sessions');
    }
  }
);

export const saveSessionAsync = createAsyncThunk(
  'sessions/saveSession',
  async ({ title, canvasState }: { title: string; canvasState: SerializedCanvasState }, { rejectWithValue }) => {
    try {
      const response = await canvasService.saveCanvas(title, canvasState);
      if (!response.success) {
        return rejectWithValue(response.error || response.message);
      }
      return response.data!;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to save session');
    }
  }
);

export const updateSessionAsync = createAsyncThunk(
  'sessions/updateSession',
  async ({ 
    sessionId, 
    title, 
    canvasState 
  }: { 
    sessionId: number; 
    title?: string; 
    canvasState?: SerializedCanvasState;
  }, { rejectWithValue }) => {
    try {
      const response = await canvasService.updateCanvas(sessionId, title, canvasState);
      if (!response.success) {
        return rejectWithValue(response.error || response.message);
      }
      return response.data!;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update session');
    }
  }
);

export const loadSessionAsync = createAsyncThunk(
  'sessions/loadSession',
  async (sessionId: number, { rejectWithValue }) => {
    try {
      const response = await canvasService.loadCanvas(sessionId);
      if (!response.success) {
        return rejectWithValue(response.error || response.message);
      }
      return response.data!;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load session');
    }
  }
);

export const deleteSessionAsync = createAsyncThunk(
  'sessions/deleteSession',
  async (sessionId: number, { rejectWithValue }) => {
    try {
      const response = await canvasService.deleteSession(sessionId);
      if (!response.success) {
        return rejectWithValue(response.error || response.message);
      }
      return sessionId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete session');
    }
  }
);

export const checkSessionLimitAsync = createAsyncThunk(
  'sessions/checkLimit',
  async (_, { rejectWithValue }) => {
    try {
      const result = await canvasService.canCreateNewSession();
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to check session limit');
    }
  }
);

// Sessions state interface
export interface SessionsState {
  sessions: CanvasSession[];
  currentSession: CanvasSession | null;
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  error: string | null;
  maxSessions: number;
  canCreateNew: boolean;
  lastSavedAt: string | null;
}

// Initial state
const initialState: SessionsState = {
  sessions: [],
  currentSession: null,
  isLoading: false,
  isSaving: false,
  isDeleting: false,
  error: null,
  maxSessions: 5,
  canCreateNew: true,
  lastSavedAt: null,
};

// Sessions slice
const sessionsSlice = createSlice({
  name: 'sessions',
  initialState,
  reducers: {
    // Clear sessions error
    clearError: (state) => {
      state.error = null;
    },
    
    // Set current session
    setCurrentSession: (state, action: PayloadAction<CanvasSession | null>) => {
      state.currentSession = action.payload;
    },
    
    // Clear current session
    clearCurrentSession: (state) => {
      state.currentSession = null;
    },
    
    // Update current session title
    updateCurrentSessionTitle: (state, action: PayloadAction<string>) => {
      if (state.currentSession) {
        state.currentSession.title = action.payload;
      }
    },
    
    // Set last saved timestamp
    setLastSavedAt: (state, action: PayloadAction<string>) => {
      state.lastSavedAt = action.payload;
    },
    
    // Clear all sessions (for logout)
    clearSessions: (state) => {
      state.sessions = [];
      state.currentSession = null;
      state.error = null;
      state.lastSavedAt = null;
    },
  },
  extraReducers: (builder) => {
    // Load sessions cases
    builder
      .addCase(loadSessionsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadSessionsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sessions = action.payload;
        state.canCreateNew = action.payload.length < state.maxSessions;
        state.error = null;
      })
      .addCase(loadSessionsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Save session cases
    builder
      .addCase(saveSessionAsync.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(saveSessionAsync.fulfilled, (state, action) => {
        state.isSaving = false;
        state.sessions.push(action.payload);
        state.currentSession = action.payload;
        state.canCreateNew = state.sessions.length < state.maxSessions;
        state.lastSavedAt = new Date().toISOString();
        state.error = null;
      })
      .addCase(saveSessionAsync.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });

    // Update session cases
    builder
      .addCase(updateSessionAsync.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateSessionAsync.fulfilled, (state, action) => {
        state.isSaving = false;
        const updatedSession = action.payload;
        const index = state.sessions.findIndex(s => s.id === updatedSession.id);
        
        if (index !== -1) {
          state.sessions[index] = updatedSession;
        }
        
        if (state.currentSession?.id === updatedSession.id) {
          state.currentSession = updatedSession;
        }
        
        state.lastSavedAt = new Date().toISOString();
        state.error = null;
      })
      .addCase(updateSessionAsync.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });

    // Load single session cases
    builder
      .addCase(loadSessionAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadSessionAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSession = action.payload;
        state.error = null;
      })
      .addCase(loadSessionAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete session cases
    builder
      .addCase(deleteSessionAsync.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteSessionAsync.fulfilled, (state, action) => {
        state.isDeleting = false;
        const deletedId = action.payload;
        state.sessions = state.sessions.filter(s => s.id !== deletedId);
        
        if (state.currentSession?.id === deletedId) {
          state.currentSession = null;
        }
        
        state.canCreateNew = state.sessions.length < state.maxSessions;
        state.error = null;
      })
      .addCase(deleteSessionAsync.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });

    // Check session limit cases
    builder
      .addCase(checkSessionLimitAsync.fulfilled, (state, action) => {
        state.canCreateNew = action.payload.canCreate;
      });
  },
});

export const {
  clearError,
  setCurrentSession,
  clearCurrentSession,
  updateCurrentSessionTitle,
  setLastSavedAt,
  clearSessions,
} = sessionsSlice.actions;

export default sessionsSlice.reducer;
