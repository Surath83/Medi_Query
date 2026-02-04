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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View
        style={[
          styles.container,
          { backgroundColor: isDark ? "#000000" : "#F0FDF4" },
        ]}
      >
          <Text
            style={[styles.header, { color: isDark ? "#fff" : "#1E293B" }]}
          >
            Home Screen
          </Text>

          {/* Med Component wrapped to scroll if overflowing */}
          <View style={[styles.medContainer, { backgroundColor: isDark ? "#1E1E1E" : "#ECFEFF" }]}>
            <Med />
          </View>
      </View>
    </KeyboardAvoidingView>
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