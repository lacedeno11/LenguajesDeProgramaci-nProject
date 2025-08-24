import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import {
  loadSessionsAsync,
  loadSessionAsync,
  deleteSessionAsync,
  clearError,
  setCurrentSession,
} from '../store/slices/sessionsSlice';
import { CanvasSession } from '../types/api';
import SessionCard from './SessionCard';

interface SessionManagerProps {
  onSessionSelect?: (session: CanvasSession) => void;
  onClose?: () => void;
  showCreateButton?: boolean;
  onCreateNew?: () => void;
}

const SessionManager: React.FC<SessionManagerProps> = ({
  onSessionSelect,
  onClose,
  showCreateButton = true,
  onCreateNew,
}) => {
  const dispatch = useAppDispatch();
  const {
    sessions,
    currentSession,
    isLoading,
    isDeleting,
    error,
    maxSessions,
    canCreateNew,
  } = useAppSelector((state) => state.sessions);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    currentSession?.id || null
  );

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        {
          text: 'OK',
          onPress: () => dispatch(clearError()),
        },
      ]);
    }
  }, [error, dispatch]);

  const loadSessions = async () => {
    try {
      await dispatch(loadSessionsAsync()).unwrap();
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  };

  const handleSessionLoad = async (session: CanvasSession) => {
    try {
      setSelectedSessionId(session.id);
      
      // Load the session data
      const loadedSession = await dispatch(loadSessionAsync(session.id)).unwrap();
      
      // Set as current session
      dispatch(setCurrentSession(loadedSession));
      
      // Notify parent component
      if (onSessionSelect) {
        onSessionSelect(loadedSession);
      }
      
      // Close the manager if callback provided
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      setSelectedSessionId(null);
    }
  };

  const handleSessionDelete = async (sessionId: number) => {
    try {
      await dispatch(deleteSessionAsync(sessionId)).unwrap();
      
      // If deleted session was selected, clear selection
      if (selectedSessionId === sessionId) {
        setSelectedSessionId(null);
        dispatch(setCurrentSession(null));
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const handleCreateNew = () => {
    if (!canCreateNew) {
      Alert.alert(
        'Límite de Sesiones',
        `Solo puedes tener un máximo de ${maxSessions} sesiones guardadas. Elimina alguna sesión primero.`,
        [{ text: 'OK' }]
      );
      return;
    }
    
    if (onCreateNew) {
      onCreateNew();
    }
    
    if (onClose) {
      onClose();
    }
  };

  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.updated_at || b.created_at).getTime() - 
    new Date(a.updated_at || a.created_at).getTime()
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Mis Sesiones</Text>
          <Text style={styles.subtitle}>
            {sessions.length}/{maxSessions} sesiones guardadas
          </Text>
        </View>
        
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {showCreateButton && (
        <TouchableOpacity
          style={[
            styles.createButton,
            !canCreateNew && styles.disabledCreateButton,
          ]}
          onPress={handleCreateNew}
          disabled={!canCreateNew}
        >
          <Text style={[
            styles.createButtonText,
            !canCreateNew && styles.disabledCreateButtonText,
          ]}>
            {canCreateNew ? '+ Nueva Sesión' : `Límite Alcanzado (${maxSessions})`}
          </Text>
        </TouchableOpacity>
      )}

      <ScrollView
        style={styles.sessionsList}
        contentContainerStyle={styles.sessionsListContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#007AFF"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {isLoading && sessions.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Cargando sesiones...</Text>
          </View>
        ) : sessions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No hay sesiones guardadas</Text>
            <Text style={styles.emptyText}>
              Crea tu primera sesión para comenzar a guardar tus pizarras
            </Text>
            {showCreateButton && canCreateNew && (
              <TouchableOpacity
                style={styles.emptyCreateButton}
                onPress={handleCreateNew}
              >
                <Text style={styles.emptyCreateButtonText}>
                  Crear Primera Sesión
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          sortedSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onLoad={() => handleSessionLoad(session)}
              onDelete={() => handleSessionDelete(session.id)}
              isSelected={selectedSessionId === session.id}
              isLoading={isDeleting}
            />
          ))
        )}
      </ScrollView>

      {sessions.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Desliza hacia abajo para actualizar
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 18,
    color: '#666',
  },
  createButton: {
    backgroundColor: '#007AFF',
    margin: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  disabledCreateButton: {
    backgroundColor: '#cccccc',
    shadowColor: 'transparent',
    elevation: 0,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledCreateButtonText: {
    color: '#999999',
  },
  sessionsList: {
    flex: 1,
  },
  sessionsListContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyCreateButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyCreateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default SessionManager;
