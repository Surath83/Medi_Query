import React from "react";
import {
  StyleSheet,
  View,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  Text,
} from "react-native";
import Med from "../../components/med";

export default function HomeScreen() {
  
  const colorScheme = useColorScheme(); // light or dark
  const isDark = colorScheme === "dark";

  return React.createElement(
    KeyboardAvoidingView,
    {
      style: { flex: 1 },
      behavior: Platform.OS === "ios" ? "padding" : undefined,
      keyboardVerticalOffset: Platform.OS === "ios" ? 0 : 20,
    },
    React.createElement(
      View,
      { style: [styles.container, { backgroundColor: isDark ? "#000000" : "#F0FDF4" }] },
      React.createElement(Text, { style: [styles.header, { color: isDark ? "#fff" : "#1E293B" }] }, "Home Screen"),
      React.createElement(
        View,
        { style: [styles.medContainer, { backgroundColor: isDark ? "#1E1E1E" : "#ECFEFF" }] },
        React.createElement(Med, null)
      )
    )
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, paddingBottom: 8 },
  header: { fontSize: 20, fontWeight: "700", textAlign: "left", marginTop: 20 },
  medContainer: {
    marginTop: 20,
    flex: 1,
    borderRadius: 20,
    padding: 16,
  },
});