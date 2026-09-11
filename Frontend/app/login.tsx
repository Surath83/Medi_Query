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
import AsyncStorage from "@react-native-async-storage/async-storage";

import config from "../config";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const clearPreviousSession = async () => {
    try {
      // Clear previous JWT
      if (Platform.OS === "web") {
        window.localStorage.removeItem("token");
        window.localStorage.removeItem("loggedUser");
      } else {
        await SecureStore.deleteItemAsync("token");
        await AsyncStorage.removeItem("loggedUser");
      }

      console.log("Previous session cleared");
    } catch (error) {
      console.error(
        "Error clearing previous session:",
        error
      );
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert(
        "Missing Fields",
        "Please enter email and password"
      );
      return;
    }

    try {
      setLoading(true);

      /*
       * IMPORTANT:
       * Clear any previous user's local authentication
       * state before attempting a new login.
       */
      await clearPreviousSession();

      const normalizedEmail = email.trim().toLowerCase();

      console.log(
        "Attempting login for:",
        normalizedEmail
      );

      const response = await fetch(
        `${config.API_BASE}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
            password: password,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "Login response status:",
        response.status
      );

      console.log(
        "Login response:",
        {
          success: response.ok,
          message: data?.message,
          hasToken: !!data?.token,
          hasUser: !!data?.user,
        }
      );

      if (!response.ok) {
        throw new Error(
          data?.message || "Invalid email or password"
        );
      }

      /*
       * Make sure the backend actually returned a token.
       */
      if (!data?.token) {
        throw new Error(
          "Login succeeded but no authentication token was received."
        );
      }

      /*
       * Make sure user data exists.
       */
      if (!data?.user) {
        throw new Error(
          "Login succeeded but user information was not received."
        );
      }

      /*
       * Save NEW user's JWT
       */
      if (Platform.OS === "web") {
        window.localStorage.setItem(
          "token",
          data.token
        );
      } else {
        await SecureStore.setItemAsync(
          "token",
          data.token
        );
      }

      /*
       * Save NEW user's data
       */
      const userData = JSON.stringify(data.user);

      if (Platform.OS === "web") {
        window.localStorage.setItem(
          "loggedUser",
          userData
        );
      } else {
        await AsyncStorage.setItem(
          "loggedUser",
          userData
        );
      }

      /*
       * Verify that the new session was actually stored.
       */
      if (Platform.OS === "web") {
        const savedToken =
          window.localStorage.getItem("token");

        console.log(
          "New token saved:",
          savedToken ? "Yes" : "No"
        );
      } else {
        const savedToken =
          await SecureStore.getItemAsync("token");

        console.log(
          "New token saved:",
          savedToken ? "Yes" : "No"
        );
      }

      console.log(
        "Login successful for:",
        data.user.username ||
          data.user.email ||
          normalizedEmail
      );

      Alert.alert(
        "Success",
        `Welcome ${
          data.user.username ||
          data.user.email ||
          "User"
        }`
      );

      /*
       * Navigate to protected tabs
       */
      router.replace("/(tabs)" as any);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong";

      console.error(
        "Login error:",
        error
      );

      Alert.alert(
        "Login Failed",
        message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>💊</Text>

        <Text style={styles.title}>
          MediQuery
        </Text>

        <Text style={styles.subtitle}>
          Search Medicines & Find Nearby Pharmacies
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          editable={!loading}
        />

        <TextInput
          placeholder="Password"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />

        <TouchableOpacity
          style={[
            styles.loginButton,
            loading && styles.loginButtonDisabled,
          ]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginText}>
              Login
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            router.push("/register" as any)
          }
          style={styles.registerButton}
          disabled={loading}
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

  loginButtonDisabled: {
    opacity: 0.7,
  },

  loginText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },

  registerButton: {
    marginTop: 20,
  },

  registerText: {
    textAlign: "center",
    color: "#0EA5A4",
    fontWeight: "600",
  },
});