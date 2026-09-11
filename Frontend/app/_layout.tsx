<<<<<<< Updated upstream
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
=======
import React from "react";
>>>>>>> Stashed changes
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useTheme } from "@/constants/theme";
import { LanguageProvider } from "@/constants/i18n";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const { isDark } = useTheme();

  return (
    <LanguageProvider>
      <Stack>
<<<<<<< Updated upstream
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
=======
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="modal"
          options={{
            presentation: "modal",
            title: "Modal",
          }}
>>>>>>> Stashed changes
        />
      </Stack>

      <StatusBar
        style={isDark ? "light" : "dark"}
      />
    </LanguageProvider>
  );
}