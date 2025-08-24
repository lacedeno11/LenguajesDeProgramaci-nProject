import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

interface SaveSessionModalProps {
  visible: boolean;
  onSave: (title: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
  maxSessions?: number;
  currentSessionsCount?: number;
  initialTitle?: string;
  mode?: 'save' | 'update';
}

const SaveSessionModal: React.FC<SaveSessionModalProps> = ({
  visible,
  onSave,
  onCancel,
  isLoading = false,
  maxSessions = 5,
  currentSessionsCount = 0,
  initialTitle = '',
  mode = 'save',
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setTitle(initialTitle);
      setError(null);
    }
  }, [visible, initialTitle]);

  const handleSave = () => {
    const trimmedTitle = title.trim();
    
    if (!trimmedTitle) {
      setError('El título es requerido');
      return;
    }
    
    if (trimmedTitle.length < 3) {
      setError('El título debe tener al menos 3 caracteres');
      return;
    }
    
    if (trimmedTitle.length > 50) {
      setError('El título no puede tener más de 50 caracteres');
      return;
    }

    if (mode === 'save' && currentSessionsCount >= maxSessions) {
      Alert.alert(
        'Límite de Sesiones',
        `Solo puedes tener un máximo de ${maxSessions} sesiones guardadas. Elimina alguna sesión primero.`,
        [{ text: 'OK' }]
      );
      return;
    }

    onSave(trimmedTitle);
  };

  const isAtLimit = mode === 'save' && currentSessionsCount >= maxSessions;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.modal}>
            <View style={styles.header}>
              <Text style={styles.title}>
                {mode === 'save' ? 'Guardar Sesión' : 'Actualizar Sesión'}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onCancel}
                disabled={isLoading}
              >
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <Text style={styles.label}>Título de la sesión:</Text>
              <TextInput
                style={[styles.input, error && styles.inputError]}
                value={title}
                onChangeText={(text) => {
                  setTitle(text);
                  setError(null);
                }}
                placeholder="Ej: Algoritmo de ordenamiento"
                maxLength={50}
                editable={!isLoading}
                autoFocus
                selectTextOnFocus
              />
              
              {error && (
                <Text style={styles.errorText}>{error}</Text>
              )}

              <Text style={styles.characterCount}>
                {title.length}/50 caracteres
              </Text>

              {mode === 'save' && (
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionInfoText}>
                    Sesiones: {currentSessionsCount}/{maxSessions}
                  </Text>
                  {isAtLimit && (
                    <Text style={styles.limitWarning}>
                      ⚠️ Has alcanzado el límite máximo de sesiones
                    </Text>
                  )}
                </View>
              )}
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onCancel}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.saveButton,
                  (isLoading || isAtLimit) && styles.disabledButton,
                ]}
                onPress={handleSave}
                disabled={isLoading || isAtLimit}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {mode === 'save' ? 'Guardar' : 'Actualizar'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 4,
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  sessionInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  sessionInfoText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  limitWarning: {
    fontSize: 12,
    color: '#ff6600',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    opacity: 0.6,
  },
});

export default SaveSessionModal;
