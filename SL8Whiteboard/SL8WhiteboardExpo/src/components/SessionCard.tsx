import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { CanvasSession } from '../types/api';

interface SessionCardProps {
  session: CanvasSession;
  onLoad: () => void;
  onDelete: () => void;
  isSelected?: boolean;
  isLoading?: boolean;
}

const SessionCard: React.FC<SessionCardProps> = ({
  session,
  onLoad,
  onDelete,
  isSelected = false,
  isLoading = false,
}) => {
  const handleDelete = () => {
    Alert.alert(
      'Eliminar Sesión',
      `¿Estás seguro de que quieres eliminar "${session.title}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: onDelete,
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.selectedContainer,
        isLoading && styles.loadingContainer,
      ]}
      onPress={onLoad}
      disabled={isLoading}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, isSelected && styles.selectedTitle]} numberOfLines={1}>
            {session.title}
          </Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={isLoading}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.deleteText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.metadata}>
          <Text style={styles.dateText}>
            Modificado: {formatDate(session.updated_at || session.created_at)}
          </Text>
          <Text style={styles.dateText}>
            Creado: {formatDate(session.created_at)}
          </Text>
        </View>
        
        {session.canvas_data && (
          <View style={styles.preview}>
            <Text style={styles.previewText}>
              {JSON.parse(session.canvas_data).strokes?.length || 0} trazos
            </Text>
          </View>
        )}
      </View>
      
      {isSelected && (
        <View style={styles.selectedIndicator} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  selectedContainer: {
    borderColor: '#007AFF',
    borderWidth: 2,
    backgroundColor: '#f0f8ff',
  },
  loadingContainer: {
    opacity: 0.6,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  selectedTitle: {
    color: '#007AFF',
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  metadata: {
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  preview: {
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
  },
  previewText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  selectedIndicator: {
    position: 'absolute',
    right: -1,
    top: -1,
    bottom: -1,
    width: 4,
    backgroundColor: '#007AFF',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
});

export default SessionCard;
