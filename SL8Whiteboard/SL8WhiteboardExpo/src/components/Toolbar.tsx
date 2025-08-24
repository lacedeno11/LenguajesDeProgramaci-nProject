import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions, Alert } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import { setZoom, resetView, clearCanvas } from '../store/slices/canvasSlice';
import { setCurrentTool, setToolColor, setToolWidth } from '../store/slices/toolsSlice';
import { logoutAsync } from '../store/slices/authSlice';
import { useHistory } from '../hooks/useHistory';
import ImagePickerButton from './ImagePickerButton';
import CameraButton from './CameraButton';

interface ToolbarProps {
  onShowSessions?: () => void;
  onSaveSession?: () => void;
  userEmail?: string;
  sessionsCount?: number;
  maxSessions?: number;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onShowSessions,
  onSaveSession,
  userEmail,
  sessionsCount = 0,
  maxSessions = 5,
}) => {
  const dispatch = useAppDispatch();
  const canvasState = useAppSelector(state => state.canvas);
  const toolsState = useAppSelector(state => state.tools);
  const { undo, redo, canUndo, canRedo } = useHistory();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: () => dispatch(logoutAsync()),
        },
      ]
    );
  };

  const handleZoomIn = () => {
    dispatch(setZoom(Math.min(4.0, canvasState.zoom + 0.25)));
  };

  const handleZoomOut = () => {
    dispatch(setZoom(Math.max(0.25, canvasState.zoom - 0.25)));
  };

  const handleResetView = () => {
    dispatch(resetView());
  };

  const handleToolChange = () => {
    const tools = ['pen', 'pencil', 'highlighter', 'eraser', 'text'] as const;
    const currentIndex = tools.indexOf(toolsState.currentTool.type as any);
    const nextTool = tools[(currentIndex + 1) % tools.length];
    dispatch(setCurrentTool(nextTool));
  };

  const handleColorChange = () => {
    const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];
    const currentIndex = colors.indexOf(toolsState.currentTool.settings.color);
    const nextColor = colors[(currentIndex + 1) % colors.length];
    dispatch(setToolColor(nextColor));
  };

  const handleWidthChange = () => {
    // Different sizes for eraser vs drawing tools
    const widths = toolsState.currentTool.type === 'eraser' 
      ? [8, 12, 16, 20, 24] // Smaller sizes for eraser
      : [1, 2, 4, 8, 12];   // Normal sizes for drawing tools
    
    const currentIndex = widths.indexOf(toolsState.currentTool.settings.width);
    const nextWidth = widths[(currentIndex + 1) % widths.length];
    dispatch(setToolWidth(nextWidth));
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Zoom</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, styles.smallButton]} 
            onPress={handleZoomOut}
            disabled={canvasState.zoom <= 0.25}
          >
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>
          
          <Text style={styles.zoomText}>{Math.round(canvasState.zoom * 100)}%</Text>
          
          <TouchableOpacity 
            style={[styles.button, styles.smallButton]} 
            onPress={handleZoomIn}
            disabled={canvasState.zoom >= 4.0}
          >
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.resetButton]} 
            onPress={handleResetView}
          >
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tool</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[
              styles.button, 
              toolsState.currentTool.type === 'eraser' && styles.eraserButton
            ]} 
            onPress={handleToolChange}
          >
            <Text style={[
              styles.buttonText,
              toolsState.currentTool.type === 'eraser' && styles.eraserText
            ]}>
              {toolsState.currentTool.type === 'eraser' ? '🧽 Eraser' : 
               toolsState.currentTool.type === 'text' ? '📝 Text' : 
               toolsState.currentTool.type}
            </Text>
          </TouchableOpacity>
          
          {toolsState.currentTool.type !== 'eraser' && (
            <TouchableOpacity 
              style={[styles.button, styles.colorButton, { backgroundColor: toolsState.currentTool.settings.color }]} 
              onPress={handleColorChange}
            >
              <Text style={[styles.buttonText, { color: '#fff' }]}>Color</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.button} onPress={handleWidthChange}>
            <Text style={styles.buttonText}>{toolsState.currentTool.settings.width}px</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>History</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, !canUndo && styles.disabledButton]} 
            onPress={undo}
            disabled={!canUndo}
          >
            <Text style={[styles.buttonText, !canUndo && styles.disabledText]}>Undo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, !canRedo && styles.disabledButton]} 
            onPress={redo}
            disabled={!canRedo}
          >
            <Text style={[styles.buttonText, !canRedo && styles.disabledText]}>Redo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.clearButton]} 
            onPress={() => dispatch(clearCanvas())}
          >
            <Text style={styles.buttonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sesiones</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, styles.saveButton]} 
            onPress={onSaveSession}
            disabled={!onSaveSession}
          >
            <Text style={styles.buttonText}>💾 Guardar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.loadButton]} 
            onPress={onShowSessions}
            disabled={!onShowSessions}
          >
            <Text style={styles.buttonText}>📂 Cargar ({sessionsCount}/{maxSessions})</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Usuario</Text>
        <View style={styles.buttonRow}>
          <View style={styles.userInfo}>
            <Text style={styles.userEmail} numberOfLines={1}>
              {userEmail || 'Usuario'}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.button, styles.logoutButton]} 
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>🚪 Salir</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Images</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, styles.imageButton]} 
            onPress={async () => {
              console.log('Paste button clicked');
              // Trigger paste functionality directly
              if (typeof window !== 'undefined') {
                try {
                  // Try to access clipboard directly
                  if (navigator?.clipboard) {
                    console.log('Clipboard API available');
                    const clipboardItems = await navigator.clipboard.read();
                    console.log('Clipboard items from button:', clipboardItems);
                  } else {
                    console.log('Clipboard API not available');
                  }
                } catch (error) {
                  console.error('Error accessing clipboard from button:', error);
                }
                
                // Also trigger the keyboard event as fallback
                const event = new KeyboardEvent('keydown', {
                  key: 'v',
                  ctrlKey: true,
                  bubbles: true
                });
                document.dispatchEvent(event);
              }
            }}
          >
            <Text style={styles.buttonText}>📋 Paste</Text>
          </TouchableOpacity>
          
          <ImagePickerButton 
            pastePosition={{
              x: (Dimensions.get('window').width / 2 - canvasState.panOffset.x) / canvasState.zoom,
              y: (Dimensions.get('window').height / 2 - canvasState.panOffset.y) / canvasState.zoom,
              timestamp: Date.now(),
            }}
          />
          
          <CameraButton 
            pastePosition={{
              x: (Dimensions.get('window').width / 2 - canvasState.panOffset.x) / canvasState.zoom,
              y: (Dimensions.get('window').height / 2 - canvasState.panOffset.y) / canvasState.zoom,
              timestamp: Date.now(),
            }}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  smallButton: {
    minWidth: 36,
    paddingHorizontal: 8,
  },
  resetButton: {
    backgroundColor: '#6c757d',
  },
  clearButton: {
    backgroundColor: '#dc3545',
  },
  eraserButton: {
    backgroundColor: '#ffc107',
  },
  eraserText: {
    color: '#000',
  },
  colorButton: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  disabledButton: {
    backgroundColor: '#e9ecef',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledText: {
    color: '#6c757d',
  },
  zoomText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    minWidth: 50,
    textAlign: 'center',
  },
  imageButton: {
    backgroundColor: '#28a745',
  },
  saveButton: {
    backgroundColor: '#17a2b8',
  },
  loadButton: {
    backgroundColor: '#6f42c1',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
  },
  userInfo: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
  },
  userEmail: {
    fontSize: 12,
    color: '#495057',
    fontWeight: '500',
  },
});

export default Toolbar;