import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

const AuthNavigator: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'login' | 'register'>('login');

  return (
    <View style={styles.container}>
      {currentScreen === 'login' ? (
        <LoginScreen 
          onNavigateToRegister={() => setCurrentScreen('register')}
        />
      ) : (
        <RegisterScreen 
          onNavigateToLogin={() => setCurrentScreen('login')}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AuthNavigator;
