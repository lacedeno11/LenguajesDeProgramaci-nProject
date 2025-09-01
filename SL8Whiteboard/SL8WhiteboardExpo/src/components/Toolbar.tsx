import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions, Alert, Animated, ScrollView } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import { setZoom, resetView, clearCanvas } from '../store/slices/canvasSlice';
import { setCurrentTool, setToolColor, setToolWidth } from '../store/slices/toolsSlice';
import { logoutAsync, clearAuth } from '../store/slices/authSlice';
import { toggleToolbar } from '../store/slices/uiSlice';
import { authService } from '../services/AuthService';
import { useHistory } from '../hooks/useHistory';
import ImagePickerButton from './ImagePickerButton';
import CameraButton from './CameraButton';

interface ToolbarProps {
  onShowSessions?: () => void;
  onSaveSession?: () => void;
  onSaveImage?: () => void;
  onShowImageGallery?: () => void;
  userEmail?: string;
  sessionsCount?: number;
  maxSessions?: number;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onShowSessions,
  onSaveSession,
  onSaveImage,
  onShowImageGallery,
  userEmail,
  sessionsCount = 0,
  maxSessions = 5,
}) => {
  const dispatch = useAppDispatch();
  const canvasState = useAppSelector(state => state.canvas);
  const toolsState = useAppSelector(state => state.tools);
  const { showToolbar } = useAppSelector(state => state.ui);
  const { undo, redo, canUndo, canRedo } = useHistory();
  
  const [slideAnim] = useState(new Animated.Value(showToolbar ? 0 : -220));

  // Animate toolbar when showToolbar changes
  React.useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: showToolbar ? 0 : -220,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [showToolbar, slideAnim]);

  const toggleToolbarPanel = () => {
    dispatch(toggleToolbar());
  };

  const handleLogout = async () => {
    console.log('🚪 Logout button clicked');
    
    // Use browser confirm instead of React Native Alert.alert for web compatibility
    const confirmed = confirm('¿Estás seguro de que quieres cerrar sesión?');
    
    if (!confirmed) {
      console.log('❌ Logout cancelled by user');
      return;
    }
    
    console.log('✅ Logout confirmed by user');
    
    try {
      // Clear the token from storage first
      console.log('🗑️ Clearing token from storage...');
      await authService.logout();
      console.log('✅ Token cleared from storage');
      
      // Clear the auth state in Redux
      console.log('🔄 Clearing auth state from Redux...');
      dispatch(clearAuth());
      console.log('✅ Auth state cleared from Redux');
      
      // Show success message
      alert('✅ Sesión cerrada exitosamente');
      
    } catch (error: any) {
      console.error('❌ Error during logout:', error);
      // Even if there's an error, clear the auth state
      dispatch(clearAuth());
      alert('⚠️ Sesión cerrada (con advertencias)');
    }
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
    <>
      {/* Toggle Button - Always visible in top-left corner */}
      <TouchableOpacity 
        style={styles.toggleButton} 
        onPress={toggleToolbarPanel}
        activeOpacity={0.7}
      >
        <Text style={styles.toggleButtonText}>
          {showToolbar ? '◀' : '▶'}
        </Text>
      </TouchableOpacity>

      {/* Sidebar Toolbar */}
      <Animated.View style={[styles.sidebar, { left: slideAnim }]}>
        {/* Fixed Header */}
        <View style={styles.sidebarHeader}>
          <Text style={styles.sidebarTitle}>CANVAS</Text>
          <TouchableOpacity 
            style={styles.sidebarCloseButton} 
            onPress={toggleToolbarPanel}
          >
            <Text style={styles.sidebarCloseText}>×</Text>
          </TouchableOpacity>
        </View>

        {/* Scrollable Content */}
        <ScrollView 
          style={styles.sidebarContent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sidebarScrollContent}
        >

          {/* Zoom Controls */}
          <View style={styles.toolSection}>
            <Text style={styles.sectionLabel}>Zoom</Text>
            <View style={styles.zoomContainer}>
              <TouchableOpacity 
                style={[styles.zoomButton, canvasState.zoom <= 0.25 && styles.disabledButton]} 
                onPress={handleZoomOut}
                disabled={canvasState.zoom <= 0.25}
              >
                <Text style={[styles.zoomButtonText, canvasState.zoom <= 0.25 && styles.disabledText]}>−</Text>
              </TouchableOpacity>
              
              <Text style={styles.zoomDisplay}>{Math.round(canvasState.zoom * 100)}%</Text>
              
              <TouchableOpacity 
                style={[styles.zoomButton, canvasState.zoom >= 4.0 && styles.disabledButton]} 
                onPress={handleZoomIn}
                disabled={canvasState.zoom >= 4.0}
              >
                <Text style={[styles.zoomButtonText, canvasState.zoom >= 4.0 && styles.disabledText]}>+</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.resetButton} 
              onPress={handleResetView}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>

          {/* Tools Section */}
          <View style={styles.toolSection}>
            <Text style={styles.sectionLabel}>TOOLS</Text>
            
            {/* Tool Selection */}
            <TouchableOpacity 
              style={[
                styles.toolButton,
                toolsState.currentTool.type === 'eraser' && styles.eraserToolButton
              ]} 
              onPress={handleToolChange}
            >
              <Text style={styles.toolIcon}>
                {toolsState.currentTool.type === 'pen' ? '✏️' : 
                 toolsState.currentTool.type === 'pencil' ? '✎' : 
                 toolsState.currentTool.type === 'highlighter' ? '🖍️' : 
                 toolsState.currentTool.type === 'eraser' ? '🧽' : 
                 toolsState.currentTool.type === 'text' ? '📝' : '✏️'}
              </Text>
              <Text style={[
                styles.toolButtonText,
                toolsState.currentTool.type === 'eraser' && styles.eraserToolText
              ]}>
                {toolsState.currentTool.type === 'eraser' ? 'Eraser' : 
                 toolsState.currentTool.type === 'text' ? 'Text' : 
                 toolsState.currentTool.type.charAt(0).toUpperCase() + toolsState.currentTool.type.slice(1)}
              </Text>
            </TouchableOpacity>
            
            {/* Color Picker - Only show for non-eraser tools */}
            {toolsState.currentTool.type !== 'eraser' && (
              <View style={styles.colorSection}>
                <TouchableOpacity 
                  style={[
                    styles.colorButton, 
                    { backgroundColor: toolsState.currentTool.settings.color }
                  ]} 
                  onPress={handleColorChange}
                >
                  <Text style={styles.colorButtonText}>Color</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {/* Width Control */}
            <View style={styles.widthSection}>
              <TouchableOpacity style={styles.widthButton} onPress={handleWidthChange}>
                <Text style={styles.widthButtonText}>{toolsState.currentTool.settings.width}px</Text>
                <Text style={styles.widthLabel}>
                  {toolsState.currentTool.type === 'eraser' ? '2px' : '5px'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* History Controls */}
          <View style={styles.toolSection}>
            <Text style={styles.sectionLabel}>HISTORY</Text>
            <View style={styles.historyButtons}>
              <TouchableOpacity 
                style={[styles.historyButton, !canUndo && styles.disabledButton]} 
                onPress={undo}
                disabled={!canUndo}
              >
                <Text style={styles.historyIcon}>↶</Text>
                <Text style={[styles.historyButtonText, !canUndo && styles.disabledText]}>Undo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.historyButton, !canRedo && styles.disabledButton]} 
                onPress={redo}
                disabled={!canRedo}
              >
                <Text style={styles.historyIcon}>↷</Text>
                <Text style={[styles.historyButtonText, !canRedo && styles.disabledText]}>Redo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.clearButton} 
                onPress={() => dispatch(clearCanvas())}
              >
                <Text style={styles.clearIcon}>🗑️</Text>
                <Text style={styles.clearButtonText}>Clear Drawing</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sessions */}
          <View style={styles.toolSection}>
            <Text style={styles.sectionLabel}>SESIONES</Text>
            <TouchableOpacity 
              style={styles.sessionButton} 
              onPress={onSaveImage}
              disabled={!onSaveImage}
            >
              <Text style={styles.sessionIcon}>💾</Text>
              <Text style={styles.sessionButtonText}>Guardar Imagen</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.sessionButton} 
              onPress={onShowSessions}
              disabled={!onShowSessions}
            >
              <Text style={styles.sessionIcon}>📂</Text>
              <Text style={styles.sessionButtonText}>Cargar ({sessionsCount}/{maxSessions})</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.sessionButton} 
              onPress={onShowImageGallery}
              disabled={!onShowImageGallery}
            >
              <Text style={styles.sessionIcon}>🖼️</Text>
              <Text style={styles.sessionButtonText}>Ver Galería</Text>
            </TouchableOpacity>
          </View>

          {/* User Section */}
          <View style={styles.toolSection}>
            <Text style={styles.sectionLabel}>USER</Text>
            <View style={styles.userSection}>
              <Text style={styles.userEmail} numberOfLines={1}>
                📧 {userEmail || 'Usuario'}
              </Text>
              <TouchableOpacity 
                style={styles.logoutButton} 
                onPress={handleLogout}
              >
                <Text style={styles.logoutIcon}>🚪</Text>
                <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Images Section */}
          <View style={styles.toolSection}>
            <Text style={styles.sectionLabel}>GALERÍA</Text>
            <TouchableOpacity 
              style={styles.imageActionButton} 
              onPress={async () => {
                console.log('Paste button clicked');
                if (typeof window !== 'undefined') {
                  try {
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
                  
                  const event = new KeyboardEvent('keydown', {
                    key: 'v',
                    ctrlKey: true,
                    bubbles: true
                  });
                  document.dispatchEvent(event);
                }
              }}
            >
              <Text style={styles.imageActionIcon}>📋</Text>
              <Text style={styles.imageActionText}>Paste</Text>
            </TouchableOpacity>
            
            <View style={styles.imagePickerRow}>
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
        </ScrollView>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  // Toggle Button (always visible)
  toggleButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1000,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  toggleButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Sidebar
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 220,
    height: '100%',
    backgroundColor: '#ffffff',
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  sidebarContent: {
    flex: 1,
  },
  sidebarScrollContent: {
    paddingBottom: 20,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#ffffff',
  },
  sidebarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    letterSpacing: 0.5,
  },
  sidebarCloseButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebarCloseText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },

  // Tool Sections
  toolSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#888',
    marginBottom: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Zoom Controls
  zoomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  zoomButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 3,
  },
  zoomButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  zoomDisplay: {
    minWidth: 50,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 6,
  },
  resetButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 6,
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },

  // Tool Selection
  toolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  eraserToolButton: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffc107',
  },
  toolIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  toolButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  eraserToolText: {
    color: '#856404',
  },

  // Color & Width Controls
  colorSection: {
    marginBottom: 6,
  },
  colorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  colorButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  widthSection: {
    marginBottom: 6,
  },
  widthButton: {
    backgroundColor: '#e9ecef',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  widthButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
  },
  widthLabel: {
    fontSize: 9,
    color: '#6c757d',
    marginTop: 1,
  },

  // History Controls
  historyButtons: {
    gap: 6,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 6,
    marginBottom: 4,
  },
  historyIcon: {
    fontSize: 14,
    marginRight: 6,
    color: '#007AFF',
  },
  historyButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffe6e6',
    padding: 10,
    borderRadius: 6,
    marginTop: 2,
  },
  clearIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc3545',
  },

  // Session Controls
  sessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e7f3ff',
    padding: 10,
    borderRadius: 6,
    marginBottom: 6,
  },
  sessionIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  sessionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0066cc',
  },

  // User Section
  userSection: {
    gap: 6,
  },
  userEmail: {
    fontSize: 11,
    color: '#666',
    backgroundColor: '#f8f9fa',
    padding: 6,
    borderRadius: 4,
    marginBottom: 6,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffe6e6',
    padding: 10,
    borderRadius: 6,
  },
  logoutIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  logoutButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc3545',
  },

  // Image Actions
  imageActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    padding: 10,
    borderRadius: 6,
    marginBottom: 6,
  },
  imageActionIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  imageActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#28a745',
  },
  imagePickerRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },

  // Disabled State
  disabledButton: {
    backgroundColor: '#f5f5f5',
    opacity: 0.5,
  },
  disabledText: {
    color: '#aaa',
  },

  // Legacy styles (keeping for compatibility)
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
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  zoomText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    minWidth: 50,
    textAlign: 'center',
  },
  eraserButton: {
    backgroundColor: '#ffc107',
  },
  eraserText: {
    color: '#000',
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
  saveImageButton: {
    backgroundColor: '#20c997',
  },
  galleryButton: {
    backgroundColor: '#fd7e14',
  },
  userInfo: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
  },
});

export default Toolbar;