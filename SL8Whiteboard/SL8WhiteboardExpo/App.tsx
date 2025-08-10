import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, SafeAreaView } from 'react-native';
import { Provider } from 'react-redux';
import { store } from './src/store';
import Canvas from './src/components/Canvas';
import Toolbar from './src/components/Toolbar';

function WhiteboardApp() {
  return (
    <SafeAreaView style={styles.container}>
      <Toolbar />
      <Canvas />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <WhiteboardApp />
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
