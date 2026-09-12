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
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

import config from "../config";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // -----------------------------
    // Client-side validation
    // -----------------------------

    if (
      !normalizedUsername ||
      !normalizedEmail ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert(
        "Missing Fields",
        "Please fill in all fields."
      );
      return;
    }

    if (normalizedUsername.length < 2) {
      Alert.alert(
        "Invalid Username",
        "Username must be at least 2 characters long."
      );
      return;
    }

    if (password.length < 8) {
      Alert.alert(
        "Invalid Password",
        "Password must be at least 8 characters long."
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Password Mismatch",
        "Passwords do not match."
      );
      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      Alert.alert(
        "Invalid Email",
        "Please enter a valid email address."
      );
      return;
    }

    try {
      setLoading(true);

      console.log(
        "Attempting registration for:",
        normalizedEmail
      );

      const response = await fetch(
        `${config.API_BASE}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: normalizedUsername,
            email: normalizedEmail,
            password,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "Registration response status:",
        response.status
      );

      console.log(
        "Registration response:",
        {
          success: response.ok,
          message: data?.message,
          hasToken: !!data?.token,
          hasUser: !!data?.user,
        }
      );

      // -----------------------------
      // Registration failed
      // -----------------------------

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Registration failed"
        );
      }

      // -----------------------------
      // Validate backend response
      // -----------------------------

      if (!data?.token) {
        throw new Error(
          "Registration succeeded but no authentication token was received."
        );
      }

      if (!data?.user) {
        throw new Error(
          "Registration succeeded but user information was not received."
        );
      }

      // -----------------------------
      // Save JWT
      // -----------------------------

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

      // -----------------------------
      // Save user information
      // -----------------------------

      const userData = JSON.stringify(
        data.user
      );

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

      // -----------------------------
      // Verify token was stored
      // -----------------------------

      let savedToken: string | null = null;

      if (Platform.OS === "web") {
        savedToken =
          window.localStorage.getItem(
            "token"
          );
      } else {
        savedToken =
          await SecureStore.getItemAsync(
            "token"
          );
      }

      console.log(
        "New registration token saved:",
        savedToken ? "Yes" : "No"
      );

      if (!savedToken) {
        throw new Error(
          "Registration succeeded, but the authentication session could not be saved."
        );
      }

      console.log(
        "Registration and automatic login successful for:",
        data.user.username ||
          data.user.email ||
          normalizedEmail
      );

      // -----------------------------
      // Go directly to protected tabs
      // -----------------------------

      router.replace("/(tabs)" as any);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong";

      console.error(
        "Registration error:",
        error
      );

      Alert.alert(
        "Registration Failed",
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
      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* LOGO */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>💊</Text>

          <Text style={styles.title}>
            Create Account
          </Text>

          <Text style={styles.subtitle}>
            Join MediQuery to search medicines
            and find nearby pharmacies
          </Text>
        </View>

        {/* FORM */}
        <View style={styles.form}>
          <Text style={styles.label}>
            Username
          </Text>

          <TextInput
            placeholder="Enter username"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            editable={!loading}
          />

          <Text style={styles.label}>
            Email
          </Text>

          <TextInput
            placeholder="Enter email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            editable={!loading}
          />

          <Text style={styles.label}>
            Password
          </Text>

          <TextInput
            placeholder="Enter password"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />

          <Text style={styles.passwordHint}>
            Password must contain at least 8
            characters.
          </Text>

          <Text style={styles.label}>
            Confirm Password
          </Text>

          <TextInput
            placeholder="Confirm password"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            value={confirmPassword}
            onChangeText={
              setConfirmPassword
            }
            editable={!loading}
          />

          {/* REGISTER BUTTON */}
          <TouchableOpacity
            style={[
              styles.registerButton,
              loading &&
                styles.registerButtonDisabled,
            ]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator
                color="#FFFFFF"
              />
            ) : (
              <Text style={styles.registerText}>
                Create Account
              </Text>
            )}
          </TouchableOpacity>

          {/* LOGIN LINK */}
          <TouchableOpacity
            onPress={() =>
              router.replace("/login")
            }
            style={styles.loginButton}
            disabled={loading}
          >
            <Text style={styles.loginText}>
              Already have an account?{" "}
              <Text style={styles.loginTextBold}>
                Login
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 25,
    paddingVertical: 40,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },

  logo: {
    fontSize: 65,
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#0EA5A4",
    marginTop: 10,
  },

  subtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginTop: 7,
    lineHeight: 21,
    maxWidth: 330,
  },

  form: {
    width: "100%",
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 7,
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginBottom: 15,
    fontSize: 16,
    color: "#0F172A",
  },

  passwordHint: {
    fontSize: 12,
    color: "#64748B",
    marginTop: -8,
    marginBottom: 15,
  },

  registerButton: {
    backgroundColor: "#0EA5A4",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },

  registerButtonDisabled: {
    opacity: 0.7,
  },

  registerText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },

  loginButton: {
    marginTop: 20,
    alignItems: "center",
  },

  loginText: {
    color: "#64748B",
    fontSize: 14,
  },

  loginTextBold: {
    color: "#0EA5A4",
    fontWeight: "700",
  },
});
