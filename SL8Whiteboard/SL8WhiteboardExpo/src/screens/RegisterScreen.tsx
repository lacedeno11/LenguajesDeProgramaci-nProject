import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import { registerAsync, clearError } from '../store/slices/authSlice';

interface RegisterScreenProps {
  onNavigateToLogin?: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNavigateToLogin }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    // Clear previous errors
    setNameError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);
    dispatch(clearError());

    // Validate inputs
    let hasErrors = false;

    if (!name.trim()) {
      setNameError('El nombre es requerido');
      hasErrors = true;
    } else if (name.trim().length < 2) {
      setNameError('El nombre debe tener al menos 2 caracteres');
      hasErrors = true;
    }

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

    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Confirma tu contraseña');
      hasErrors = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Las contraseñas no coinciden');
      hasErrors = true;
    }

    if (hasErrors) return;

    try {
      await dispatch(registerAsync({ 
        name: name.trim(),
        email: email.trim(), 
        password: password.trim() 
      })).unwrap();
    } catch (error) {
      console.error('Register failed:', error);
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
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>
              Únete a SL8.ai y comienza a crear pizarras inteligentes
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre completo</Text>
              <TextInput
                style={[styles.input, nameError && styles.inputError]}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setNameError(null);
                }}
                placeholder="Tu nombre completo"
                autoCapitalize="words"
                editable={!isLoading}
              />
              {nameError && (
                <Text style={styles.errorText}>{nameError}</Text>
              )}
            </View>

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
                placeholder="Mínimo 6 caracteres"
                secureTextEntry
                editable={!isLoading}
              />
              {passwordError && (
                <Text style={styles.errorText}>{passwordError}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirmar contraseña</Text>
              <TextInput
                style={[styles.input, confirmPasswordError && styles.inputError]}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setConfirmPasswordError(null);
                }}
                placeholder="Repite tu contraseña"
                secureTextEntry
                editable={!isLoading}
              />
              {confirmPasswordError && (
                <Text style={styles.errorText}>{confirmPasswordError}</Text>
              )}
            </View>

            {error && (
              <View style={styles.serverErrorContainer}>
                <Text style={styles.serverErrorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.registerButton, isLoading && styles.disabledButton]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.registerButtonText}>Crear Cuenta</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes cuenta?</Text>
            <TouchableOpacity
              onPress={onNavigateToLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginLink}>Inicia sesión aquí</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.terms}>
            <Text style={styles.termsText}>
              Al crear una cuenta, aceptas nuestros términos de servicio
              y política de privacidad
            </Text>
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
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
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
  registerButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
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
  registerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  loginLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  terms: {
    alignItems: 'center',
  },
  termsText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default RegisterScreen;
