import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, Modal } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import { verifyTokenAsync } from '../store/slices/authSlice';
import { loadSessionsAsync, saveSessionAsync, loadSessionAsync } from '../store/slices/sessionsSlice';
import { loadCanvasState } from '../store/slices/canvasSlice';
import Canvas from '../components/Canvas';
import Toolbar from '../components/Toolbar';
import SessionManager from '../components/SessionManager';
import SaveSessionModal from '../components/SaveSessionModal';
import ImageGallery from '../components/ImageGallery';
import { SerializedCanvasState, CanvasSession } from '../types/api';
import { imageService } from '../services/ImageService';

const WhiteboardScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { sessions, canCreateNew, isSaving } = useAppSelector((state) => state.sessions);
  const canvasState = useAppSelector((state) => state.canvas);
  const toolsState = useAppSelector((state) => state.tools);
  const layersState = useAppSelector((state) => state.layers);
  
  const [showSessionManager, setShowSessionManager] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      // Load user's sessions when authenticated
      dispatch(loadSessionsAsync());
    }
  }, [isAuthenticated, dispatch]);

  const handleShowSessions = () => {
    setShowSessionManager(true);
  };

  const handleSaveSession = () => {
    if (!canCreateNew && sessions.length >= 5) {
      Alert.alert(
        'Límite de Sesiones',
        'Solo puedes tener un máximo de 5 sesiones guardadas. Elimina alguna sesión primero.',
        [{ text: 'OK' }]
      );
      return;
    }
    setShowSaveModal(true);
  };

  const handleSaveConfirm = async (title: string) => {
    try {
      console.log('🚀 WhiteboardScreen.handleSaveConfirm called with title:', title);
      console.log('🔐 Auth state check:', { 
        isAuthenticated, 
        user: user?.email,
        userId: user?.id 
      });

      // Check authentication state before proceeding
      if (!isAuthenticated || !user) {
        Alert.alert(
          'Error de Autenticación', 
          'Debes estar autenticado para guardar sesiones. Por favor inicia sesión nuevamente.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Prepare canvas state for serialization
      const serializedCanvasState: SerializedCanvasState = {
        strokes: Object.values(canvasState.strokes),
        layers: Object.values(layersState.layers),
        currentTool: toolsState.currentTool,
        toolSettings: toolsState.currentTool.settings,
        images: Object.values(canvasState.imageElements),
      };

      console.log('🎨 Serialized canvas state structure:', {
        strokesCount: serializedCanvasState.strokes.length,
        layersCount: serializedCanvasState.layers.length,
        imagesCount: serializedCanvasState.images.length,
        currentTool: serializedCanvasState.currentTool.type,
        dataSize: JSON.stringify(serializedCanvasState).length
      });

      // Dispatch save action
      console.log('📤 Dispatching saveSessionAsync...');
      const result = await dispatch(saveSessionAsync({ 
        title, 
        canvasState: serializedCanvasState 
      })).unwrap();

      console.log('✅ Save successful:', result);
      setShowSaveModal(false);
      Alert.alert('Éxito', `Sesión "${title}" guardada correctamente`);
      
      // Reload sessions to update the list
      dispatch(loadSessionsAsync());
    } catch (error: any) {
      console.error('❌ Failed to save session:', error);
      Alert.alert(
        'Error al Guardar', 
        error.message || 'No se pudo guardar la sesión. Inténtalo de nuevo.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleSaveImage = async () => {
    try {
      // Por ahora, usar la función placeholder de ImageService
      const imageDataUrl = await imageService.captureCanvasAsImage(null);
      
      if (imageDataUrl) {
        const title = `Canvas_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;
        const result = await imageService.saveCanvasImage(title, imageDataUrl);
        
        if (result.success) {
          Alert.alert('✅ Imagen Guardada', `La imagen "${title}" se guardó correctamente`);
        } else {
          Alert.alert('❌ Error', result.message || 'No se pudo guardar la imagen');
        }
      } else {
        Alert.alert('❌ Error', 'No se pudo capturar la imagen del canvas');
      }
    } catch (error: any) {
      console.error('Error saving canvas image:', error);
      Alert.alert('❌ Error', 'Error al guardar la imagen');
    }
  };

  const handleShowImageGallery = () => {
    setShowImageGallery(true);
  };

  const handleSessionLoad = async (session: CanvasSession) => {
    try {
      console.log('Loading session:', session);
      
      // Parse canvas data from the session
      if (session.canvas_data) {
        const canvasData = JSON.parse(session.canvas_data);
        console.log('Parsed canvas data:', canvasData);
        
        // Load the canvas state
        dispatch(loadCanvasState({
          strokes: canvasData.strokes || [],
          images: canvasData.images || [],
        }));
        
        Alert.alert('Cargado', `Sesión "${session.title}" cargada correctamente`);
      } else {
        Alert.alert('Error', 'La sesión no contiene datos de canvas');
      }
    } catch (error: any) {
      console.error('Failed to load session:', error);
      Alert.alert(
        'Error al Cargar', 
        'No se pudo cargar la sesión. El formato de datos puede estar corrupto.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Toolbar
        onShowSessions={handleShowSessions}
        onSaveSession={handleSaveSession}
        onSaveImage={handleSaveImage}
        onShowImageGallery={handleShowImageGallery}
        userEmail={user?.email}
        sessionsCount={sessions.length}
        maxSessions={5}
      />
      <Canvas />

      <Modal
        visible={showSessionManager}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SessionManager
          onSessionSelect={handleSessionLoad}
          onClose={() => setShowSessionManager(false)}
          onCreateNew={() => {
            setShowSessionManager(false);
            handleSaveSession();
          }}
        />
      </Modal>

      <Modal
        visible={showImageGallery}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <ImageGallery
          visible={showImageGallery}
          onClose={() => setShowImageGallery(false)}
        />
      </Modal>

      <SaveSessionModal
        visible={showSaveModal}
        onSave={handleSaveConfirm}
        onCancel={() => setShowSaveModal(false)}
        isLoading={isSaving}
        maxSessions={5}
        currentSessionsCount={sessions.length}
        mode="save"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default WhiteboardScreen;
