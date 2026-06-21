import React, { useState } from "react";
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
} from "react-native";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import config from "../config";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

 const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert("Missing Fields", "Please enter email and password");
    return;
  }

  try {
    setLoading(true);

    const response = await fetch(
      `${config.API_BASE}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Login failed"
      );
    }

    // Save JWT Token
    await SecureStore.setItemAsync(
      "token",
      data.token
    );

    // Save User Data
    await AsyncStorage.setItem(
      "loggedUser",
      JSON.stringify(data.user)
    );

    Alert.alert(
      "Success",
      `Welcome ${data.user.username}`
    );

    router.replace("/(tabs)");
  } catch (error) {
    Alert.alert(
      "Login Failed",
      error.message
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>💊</Text>
        <Text style={styles.title}>MediQuery</Text>
        <Text style={styles.subtitle}>
          Search Medicines & Find Nearby Pharmacies
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          placeholder="Password"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginText}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/register")}
          style={{ marginTop: 20 }}
        >
          <Text style={styles.registerText}>
            Don&apos;t have an account? Register
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );    
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    paddingHorizontal: 25,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },

  logo: {
    fontSize: 70,
  },

  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#0EA5A4",
    marginTop: 10,
  },

  subtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
  },

  form: {
    width: "100%",
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    padding: 16,
    marginBottom: 15,
    fontSize: 16,
  },

  loginButton: {
    backgroundColor: "#0EA5A4",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
  },

  loginText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },

  registerText: {
    textAlign: "center",
    color: "#0EA5A4",
    fontWeight: "600",
  },
});