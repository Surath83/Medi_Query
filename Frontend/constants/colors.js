// constants/colors.js

const coffeeTheme = {
  primary: "#8B5E3C",
  primaryDark: "#6F472D",
  accent: "#8B5E3C",
  accentDark: "#6F472D",

  background: "#F8F5F2",
  surface: "#FFFFFF",
  card: "#FFFFFF",

  text: "#111827",
  textSecondary: "#4B5563",
  textLight: "#9CA3AF",

  border: "#E5E7EB",
  inputBackground: "#F9FAFB",

  white: "#FFFFFF",
  black: "#000000",

  success: "#2E7D32",
  warning: "#F59E0B",
  danger: "#DC2626",

  overlay: "rgba(0, 0, 0, 0.45)",
  shadow: "#000000",
};

const forestTheme = {
  primary: "#2E7D32",
  primaryDark: "#1B5E20",
  accent: "#2E7D32",
  accentDark: "#1B5E20",

  background: "#F1F8F2",
  surface: "#FFFFFF",
  card: "#FFFFFF",

  text: "#111827",
  textSecondary: "#475569",
  textLight: "#94A3B8",

  border: "#C8E6C9",
  inputBackground: "#F7FCF7",

  white: "#FFFFFF",
  black: "#000000",

  success: "#2E7D32",
  warning: "#F59E0B",
  danger: "#DC2626",

  overlay: "rgba(0, 0, 0, 0.45)",
  shadow: "#000000",
};

const purpleTheme = {
  primary: "#7C3AED",
  primaryDark: "#5B21B6",
  accent: "#7C3AED",
  accentDark: "#5B21B6",

  background: "#F7F3FF",
  surface: "#FFFFFF",
  card: "#FFFFFF",

  text: "#111827",
  textSecondary: "#475569",
  textLight: "#94A3B8",

  border: "#DDD6FE",
  inputBackground: "#FAF8FF",

  white: "#FFFFFF",
  black: "#000000",

  success: "#2E7D32",
  warning: "#F59E0B",
  danger: "#DC2626",

  overlay: "rgba(0, 0, 0, 0.45)",
  shadow: "#000000",
};

const oceanTheme = {
  primary: "#0284C7",
  primaryDark: "#0369A1",
  accent: "#0284C7",
  accentDark: "#0369A1",

  background: "#F0F9FF",
  surface: "#FFFFFF",
  card: "#FFFFFF",

  text: "#111827",
  textSecondary: "#475569",
  textLight: "#94A3B8",

  border: "#BAE6FD",
  inputBackground: "#F7FCFF",

  white: "#FFFFFF",
  black: "#000000",

  success: "#2E7D32",
  warning: "#F59E0B",
  danger: "#DC2626",

  overlay: "rgba(0, 0, 0, 0.45)",
  shadow: "#000000",
};

const sunsetTheme = {
  primary: "#EA580C",
  primaryDark: "#C2410C",
  accent: "#EA580C",
  accentDark: "#C2410C",

  background: "#FFF7ED",
  surface: "#FFFFFF",
  card: "#FFFFFF",

  text: "#111827",
  textSecondary: "#475569",
  textLight: "#94A3B8",

  border: "#FED7AA",
  inputBackground: "#FFFBF7",

  white: "#FFFFFF",
  black: "#000000",

  success: "#2E7D32",
  warning: "#F59E0B",
  danger: "#DC2626",

  overlay: "rgba(0, 0, 0, 0.45)",
  shadow: "#000000",
};

const mintTheme = {
  // Mint is ONLY for primary/accent UI elements
  primary: "#00B5B5",
  primaryDark: "#008F8F",
  accent: "#00B5B5",
  accentDark: "#008F8F",

  background: "#E8F6F6",
  surface: "#FFFFFF",
  card: "#FFFFFF",

  // Normal text is black
  text: "#000000",
  textSecondary: "#334155",
  textLight: "#64748B",

  border: "#B2E8E8",
  inputBackground: "#F7FFFF",

  white: "#FFFFFF",
  black: "#000000",

  success: "#2E7D32",
  warning: "#F59E0B",
  danger: "#DC2626",

  overlay: "rgba(0, 0, 0, 0.45)",
  shadow: "#000000",
};

const midnightTheme = {
  primary: "#00B5B5",
  primaryDark: "#008F8F",
  accent: "#00B5B5",
  accentDark: "#008F8F",

  background: "#09090B",
  surface: "#18181B",
  card: "#18181B",

  text: "#FFFFFF",
  textSecondary: "#A1A1AA",
  textLight: "#71717A",

  border: "#3F3F46",
  inputBackground: "#27272A",

  white: "#FFFFFF",
  black: "#000000",

  success: "#4CAF50",
  warning: "#F59E0B",
  danger: "#EF5350",

  overlay: "rgba(0, 0, 0, 0.65)",
  shadow: "#000000",
};

const roseGoldTheme = {
  primary: "#B76E79",
  primaryDark: "#944E59",
  accent: "#B76E79",
  accentDark: "#944E59",

  background: "#FFF7F8",
  surface: "#FFFFFF",
  card: "#FFFFFF",

  text: "#111827",
  textSecondary: "#475569",
  textLight: "#94A3B8",

  border: "#F1D1D5",
  inputBackground: "#FFF9FA",

  white: "#FFFFFF",
  black: "#000000",

  success: "#2E7D32",
  warning: "#F59E0B",
  danger: "#DC2626",

  overlay: "rgba(0, 0, 0, 0.45)",
  shadow: "#000000",
};

export const THEMES = {
  coffee: coffeeTheme,
  forest: forestTheme,
  purple: purpleTheme,
  ocean: oceanTheme,
  sunset: sunsetTheme,
  mint: mintTheme,
  midnight: midnightTheme,
  roseGold: roseGoldTheme,
};

// Active theme for MediQuery
export const ACTIVE_THEME = "mint";

// Dark-mode values common across themes.
// Theme primary/accent colors are intentionally preserved.
const darkOverrides = {
  background: "#09090B",
  surface: "#18181B",
  card: "#18181B",

  // Normal text = white
  text: "#FFFFFF",
  textSecondary: "#CBD5E1",
  textLight: "#94A3B8",

  border: "#3F3F46",
  inputBackground: "#27272A",

  white: "#FFFFFF",
  black: "#000000",

  success: "#4CAF50",
  warning: "#F59E0B",
  danger: "#EF5350",

  overlay: "rgba(0, 0, 0, 0.65)",
  shadow: "#000000",
};

export const COLORS = {
  light: THEMES[ACTIVE_THEME],

  dark: {
    ...THEMES[ACTIVE_THEME],
    ...darkOverrides,

    // Preserve the selected theme accent
    primary: THEMES[ACTIVE_THEME].primary,
    primaryDark: THEMES[ACTIVE_THEME].primaryDark,
    accent: THEMES[ACTIVE_THEME].accent,
    accentDark: THEMES[ACTIVE_THEME].accentDark,
  },
};