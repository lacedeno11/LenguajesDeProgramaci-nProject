import React, { useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { Provider } from "react-redux";
import { store } from "./src/store";
import Canvas from "./src/components/Canvas";
import Toolbar from "./src/components/Toolbar";
import LoginScreen from "./src/components/LoginScreen";
import RegisterScreen from "./src/components/RegisterScreen";
import { StatusBar } from "expo-status-bar";

function WhiteboardApp() {
  return (
    <SafeAreaView style={styles.container}>
      <Toolbar />
      <Canvas />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

type Screen = "login" | "register" | "whiteboard";

function RootApp() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("login");

  const handleLoginSuccess = () => setCurrentScreen("whiteboard");
  const goToRegister = () => setCurrentScreen("register");
  const goToLogin = () => setCurrentScreen("login");

  switch (currentScreen) {
    case "login":
      return <LoginScreen onLoginSuccess={handleLoginSuccess} onGoToRegister={goToRegister} />;
    case "register":
      return <RegisterScreen onRegisterSuccess={goToLogin} />;
    case "whiteboard":
      return <WhiteboardApp />;
  }
}

export default function App() {
  return (
    <Provider store={store}>
      <RootApp />
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
});
