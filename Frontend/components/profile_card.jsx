import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function ProfileCard({name, age, height, weight, gender}) {
  const colorScheme = useColorScheme(); // light or dark
  const isDark = colorScheme === "dark";

  const [visible, setVisible] = useState(true);

  // BMI calculation
  const bmi = (weight / (height / 100) ** 2).toFixed(2);

  // BMR calculation
  const calculateBMR = () => {
    if (gender === "male" || gender === "prefer not to say") {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  };

  return (
    <LinearGradient
      colors={isDark ? ["#0F172A", "#1E293B"] : ["#D6E4FF", "#F0F9FF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.name, { color: isDark ? "#E0E7FF" : "#1E293B" }]}>
          {name}
        </Text>

        <Pressable
          style={styles.eyeButton}
          onPress={() => setVisible(!visible)}
        >
          <Ionicons
            name={visible ? "eye" : "eye-off"}
            size={24}
            color={isDark ? "#fff" : "#1E293B"}
          />
        </Pressable>
      </View>

      <Text style={[styles.text, { color: isDark ? "#CBD5E1" : "#334155" }]}>
        {visible
          ? `Age: ${age} yr     Ht: ${height} cm      Wt: ${weight} kg`
          : "Age: .. yr       Ht: .... cm         Wt: .. kg"}
      </Text>

      <Text style={[styles.text, { color: isDark ? "#CBD5E1" : "#334155" }]}>
        BMI: {bmi}
      </Text>

      <Text style={[styles.text, { color: isDark ? "#CBD5E1" : "#334155" }]}>
        BMR: {calculateBMR().toFixed(2)} cal/day
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
    padding: 20,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 6,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
  },
  text: {
    fontSize: 16,
    marginVertical: 6,
  },
  eyeButton: {
    padding: 6,
    borderRadius: 50,
  },
});
