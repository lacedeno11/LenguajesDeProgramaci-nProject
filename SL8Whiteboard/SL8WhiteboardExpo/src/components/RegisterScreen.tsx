import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import axios from "axios";

interface RegisterScreenProps {
  onRegisterSuccess: () => void; // Called to go back to login
}

const API_URL = "http://localhost:8080/sl8-backend/api/auth.php";

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onRegisterSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
  setLoading(true);
  try {
    const response = await axios.post(
      `${API_URL}?action=register`,
      { email, password },
      { headers: { "Content-Type": "application/json" } }
    );

    // Check HTTP status code
    if (response.status === 201) {
      Alert.alert("Success", "Registration successful! You are being redirected to login.");
      onRegisterSuccess(); // automatically redirect to login
    } else {
      // fallback in case PHP returns 200 but status is success
      const data = response.data;
      Alert.alert("Error", data.message || "Registration failed.");
    }
  } catch (error: any) {
    console.log(error.response?.data); // Debug PHP response
    Alert.alert(
      "Server Error",
      error.response?.data?.message || error.message || "Unable to connect to server"
    );
  } finally {
    setLoading(false);
  }
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: "#28A745" }]}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
      </TouchableOpacity>
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    fontSize: 16,
    color: "#000",
  },
  button: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  linkText: {
    color: "#007BFF",
    marginTop: 10,
    textDecorationLine: "underline",
  },
});
