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
import { SerializedCanvasState, CanvasSession } from '../types/api';

const WhiteboardScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { sessions, canCreateNew, isSaving } = useAppSelector((state) => state.sessions);
  const canvasState = useAppSelector((state) => state.canvas);
  const toolsState = useAppSelector((state) => state.tools);
  const layersState = useAppSelector((state) => state.layers);
  
  const [showSessionManager, setShowSessionManager] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

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
      // Prepare canvas state for serialization
      const serializedCanvasState: SerializedCanvasState = {
        strokes: Object.values(canvasState.strokes),
        layers: Object.values(layersState.layers),
        currentTool: toolsState.currentTool,
        toolSettings: toolsState.currentTool.settings,
        images: Object.values(canvasState.imageElements),
      };

      console.log('Saving session with title:', title);
      console.log('Canvas state:', serializedCanvasState);

      // Dispatch save action
      await dispatch(saveSessionAsync({ 
        title, 
        canvasState: serializedCanvasState 
      })).unwrap();

      setShowSaveModal(false);
      Alert.alert('Éxito', `Sesión "${title}" guardada correctamente`);
      
      // Reload sessions to update the list
      dispatch(loadSessionsAsync());
    } catch (error: any) {
      console.error('Failed to save session:', error);
      Alert.alert(
        'Error al Guardar', 
        error.message || 'No se pudo guardar la sesión. Inténtalo de nuevo.',
        [{ text: 'OK' }]
      );
    }
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
