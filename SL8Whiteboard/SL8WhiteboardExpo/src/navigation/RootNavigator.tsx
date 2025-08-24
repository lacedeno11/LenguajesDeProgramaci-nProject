import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import { verifyTokenAsync } from '../store/slices/authSlice';
import AuthNavigator from './AuthNavigator';
import WhiteboardScreen from '../screens/WhiteboardScreen';

const RootNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, initialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Check if user has a valid token on app startup
    if (!initialized) {
      dispatch(verifyTokenAsync());
    }
  }, [dispatch, initialized]);

  // Show loading screen while verifying token
  if (isLoading || !initialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Show appropriate screen based on auth state
  return isAuthenticated ? <WhiteboardScreen /> : <AuthNavigator />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
});

export default RootNavigator;
