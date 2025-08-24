import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import { loginAsync, clearError } from '../store/slices/authSlice';

interface LoginScreenProps {
  onNavigateToRegister?: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigateToRegister }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('test@example.com'); // Pre-filled for testing
  const [password, setPassword] = useState('password'); // Pre-filled for testing
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    // Clear previous errors
    setEmailError(null);
    setPasswordError(null);
    dispatch(clearError());

    // Validate inputs
    let hasErrors = false;

    if (!email.trim()) {
      setEmailError('El email es requerido');
      hasErrors = true;
    } else if (!validateEmail(email.trim())) {
      setEmailError('Por favor ingresa un email válido');
      hasErrors = true;
    }

    if (!password.trim()) {
      setPasswordError('La contraseña es requerida');
      hasErrors = true;
    } else if (password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      hasErrors = true;
    }

    if (hasErrors) return;

    try {
      await dispatch(loginAsync({ 
        email: email.trim(), 
        password: password.trim() 
      })).unwrap();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>SL8.ai</Text>
            <Text style={styles.subtitle}>Whiteboard Inteligente</Text>
            <Text style={styles.description}>
              Inicia sesión para acceder a tus pizarras y recibir ayuda de IA
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, emailError && styles.inputError]}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setEmailError(null);
                }}
                placeholder="tu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              {emailError && (
                <Text style={styles.errorText}>{emailError}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={[styles.input, passwordError && styles.inputError]}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError(null);
                }}
                placeholder="Tu contraseña"
                secureTextEntry
                editable={!isLoading}
              />
              {passwordError && (
                <Text style={styles.errorText}>{passwordError}</Text>
              )}
            </View>

            {error && (
              <View style={styles.serverErrorContainer}>
                <Text style={styles.serverErrorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿No tienes cuenta?</Text>
            <TouchableOpacity
              onPress={onNavigateToRegister}
              disabled={isLoading}
            >
              <Text style={styles.registerLink}>Regístrate aquí</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.testCredentials}>
            <Text style={styles.testTitle}>Credenciales de Prueba:</Text>
            <Text style={styles.testText}>Email: test@example.com</Text>
            <Text style={styles.testText}>Contraseña: password</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
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
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 4,
  },
  serverErrorContainer: {
    backgroundColor: '#ffe6e6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  serverErrorText: {
    color: '#cc0000',
    fontSize: 14,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#007AFF',
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
  disabledButton: {
    backgroundColor: '#cccccc',
    shadowColor: 'transparent',
    elevation: 0,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  registerLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  testCredentials: {
    marginTop: 40,
    padding: 16,
    backgroundColor: '#e8f4f8',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  testTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  testText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
});

export default LoginScreen;
