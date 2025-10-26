import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/use-color-scheme";
// import { ClerkProvider } from '@clerk/clerk-expo'
// import { tokenCache } from '@clerk/clerk-expo/token-cache'

export const unstable_settings = { anchor: "(tabs)" };
export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    //  <ClerkProvider tokenCache={tokenCache}>
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* <Stack.Screen name="(auth)" options={{ headerShown: false }} /> */}
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
    // </ClerkProvider>
  );
}

// add this named export — Expo Router will use it for the navigation slot
// export function RootLayoutNav() {
//   return (
//     <ClerkProvider>
//       <Slot />
//     </ClerkProvider>
//   )
// }
