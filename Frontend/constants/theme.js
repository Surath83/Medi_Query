import { useColorScheme } from "react-native";
import { COLORS } from "./colors";

export function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return {
    colors: isDark ? COLORS.dark : COLORS.light,
    isDark,
    colorScheme,
  };
}