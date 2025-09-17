import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  ScrollView,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import Med from "../../components/med";

export default function HomeScreen() {
  const colorScheme = useColorScheme(); // light or dark

  const name = "abc";
  const age = 25;
  const height = 165.2; // cm
  const weight = 68.5;  // kg
  const gender = "male";

  const [visible, setVisible] = useState(true);

  // BMI calculation
  const bmi = (weight / ((height / 100) ** 2)).toFixed(2);

  // BMR calculation
  const calculateBMR = () => {
    if (gender === "male") {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  };

  const isDark = colorScheme === "dark";

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#1E293B" : "#deebf8ff" },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText
          style={[styles.title, { color: isDark ? "#fff" : "#1E293B" }]}
        >
          Home Screen
        </ThemedText>

        <ThemedText
          style={[styles.name, { color: isDark ? "#E0E7FF" : "#334155" }]}
        >
          {name}
        </ThemedText>

        <Pressable
          style={styles.eyeButton}
          onPress={() => setVisible(!visible)}
        >
          <Ionicons
            name={visible ? "eye" : "eye-off"}
            size={28}
            color={isDark ? "#fff" : "#1E293B"}
          />
        </Pressable>

        <ThemedText style={[styles.text, { color: isDark ? "#CBD5E1" : "#475569" }]}>
          {visible
            ? `Age: ${age}     Ht: ${height} cm    Wt: ${weight} kg`
            : "Age: ...      Ht: .... cm     Wt: .... kg"}
        </ThemedText>

        <ThemedText style={[styles.text, { color: isDark ? "#CBD5E1" : "#475569" }]}>
          BMI: {bmi}
        </ThemedText>
        <ThemedText style={[styles.text, { color: isDark ? "#CBD5E1" : "#475569" }]}>
          BMR: {calculateBMR().toFixed(2)} cal/day
        </ThemedText>

        {/* Med Component wrapped to scroll if overflowing */}
        <ThemedView style={styles.medContainer}>
          <Med />
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    marginVertical: 4,
  },
  eyeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    padding: 8,
    zIndex: 100,
  },
  medContainer: {
    marginTop: 20,
    flex: 1,
  },
});
