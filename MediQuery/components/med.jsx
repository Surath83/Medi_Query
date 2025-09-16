import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { ThemedText } from "./themed-text";

export default function Med() {
  const [medicineName, setMedicineName] = React.useState("");

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Medical Enquiry</ThemedText>

      <ThemedText style={styles.label}>Medicine Name:</ThemedText>

      <TextInput
        style={styles.input}
        value={medicineName}
        placeholder="Enter medicine name"
        placeholderTextColor="#94A3B8"
        onChangeText={(text) => setMedicineName(text)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    margin: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3, // for Android shadow
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    color: "#1E293B",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#334155",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#1E293B",
    backgroundColor: "white",
  },
});
