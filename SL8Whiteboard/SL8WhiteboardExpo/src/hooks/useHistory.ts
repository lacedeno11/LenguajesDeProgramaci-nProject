import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { addStroke, removeStroke, addTextElement, removeTextElement, addImageElement, removeImageElement } from '../store/slices/canvasSlice';
import { addHistoryEntry, undo as undoAction, redo as redoAction } from '../store/slices/historySlice';
import { Stroke } from '../types';

export const useHistory = () => {
  const dispatch = useAppDispatch();
  const historyState = useAppSelector(state => state.history);
  const canvasState = useAppSelector(state => state.canvas);

  const addToHistory = useCallback((action: string, data: any) => {
    dispatch(addHistoryEntry({ action, data }));
  }, [dispatch]);

  const undo = useCallback(() => {
    if (historyState.currentIndex >= 0) {
      const currentEntry = historyState.entries[historyState.currentIndex];
      
      if (currentEntry) {
        // Reverse the action
        switch (currentEntry.action) {
          case 'ADD_STROKE':
            dispatch(removeStroke(currentEntry.data.stroke.id));
            break;
          case 'REMOVE_STROKE':
            dispatch(addStroke(currentEntry.data.stroke));
            break;
          case 'ADD_TEXT':
            dispatch(removeTextElement(currentEntry.data.textElement.id));
            break;
          case 'REMOVE_TEXT':
            dispatch(addTextElement(currentEntry.data.textElement));
            break;
          case 'ADD_IMAGE':
            dispatch(removeImageElement(currentEntry.data.imageElement.id));
            break;
          case 'REMOVE_IMAGE':
            dispatch(addImageElement(currentEntry.data.imageElement));
            break;
        }
      }
      
      dispatch(undoAction());
    }
  }, [dispatch, historyState.currentIndex, historyState.entries]);

  const redo = useCallback(() => {
    if (historyState.currentIndex < historyState.entries.length - 1) {
      dispatch(redoAction());
      
      const nextEntry = historyState.entries[historyState.currentIndex + 1];
      
      if (nextEntry) {
        // Re-apply the action
        switch (nextEntry.action) {
          case 'ADD_STROKE':
            dispatch(addStroke(nextEntry.data.stroke));
            break;
          case 'REMOVE_STROKE':
            dispatch(removeStroke(nextEntry.data.stroke.id));
            break;
          case 'ADD_TEXT':
            dispatch(addTextElement(nextEntry.data.textElement));
            break;
          case 'REMOVE_TEXT':
            dispatch(removeTextElement(nextEntry.data.textElement.id));
            break;
          case 'ADD_IMAGE':
            dispatch(addImageElement(nextEntry.data.imageElement));
            break;
          case 'REMOVE_IMAGE':
            dispatch(removeImageElement(nextEntry.data.imageElement.id));
            break;
        }
      }
    }
  }, [dispatch, historyState.currentIndex, historyState.entries]);

  const canUndo = historyState.currentIndex >= 0 && historyState.entries.length > 0;
  const canRedo = historyState.currentIndex < historyState.entries.length - 1;

  return {
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};