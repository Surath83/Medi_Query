import React, {
  useEffect,
  useRef,
} from "react";

import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  Text,
  ScrollView,
} from "react-native";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import Med from "../../components/med";
import LanguagePicker from "../../components/language-picker";

import { useTheme } from "@/constants/theme";
import { SPACING } from "@/constants/spacing";
import { useTranslation } from "@/constants/i18n";

export default function HomeScreen() {
  // =======================================================
  // THEME
  // =======================================================


  const { colors, isDark } = useTheme();

  // =======================================================
  // TRANSLATION
  // =======================================================

  const { t } = useTranslation();

  // =======================================================
  // SAFE AREA
  // =======================================================

  const insets = useSafeAreaInsets();

  // =======================================================
  // SCROLL REF
  // =======================================================

  const scrollRef = useRef<ScrollView | null>(null);

  // =======================================================
  // RESET SCROLL POSITION WHEN THEME CHANGES
  // =======================================================

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        y: 0,
        animated: false,
      });
    });
  }, [isDark]);

  // =======================================================
  // DYNAMIC STYLES
  // =======================================================

  const dynamicStyles = styles(
    colors,
    insets
  );

  // =======================================================
  // UI
  // =======================================================

  return (
    <KeyboardAvoidingView
      style={
        dynamicStyles.keyboardContainer
      }
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
      keyboardVerticalOffset={
        Platform.OS === "ios"
          ? 0
          : 20
      }
    >
      <ScrollView
        ref={scrollRef}
        style={dynamicStyles.container}
        contentContainerStyle={
          dynamicStyles.contentContainer
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <View
          style={dynamicStyles.headerRow}
        >
          {/* ------------------------------------------------
              HEADER TEXT
          ------------------------------------------------ */}

          <View
            style={
              dynamicStyles.headerTextContainer
            }
          >
            <Text
              style={dynamicStyles.header}
            >
              {t("home.title")}
            </Text>

            <Text
              style={
                dynamicStyles.headerSubtitle
              }
            >
              {t("home.subtitle")}
            </Text>
          </View>

          {/* ------------------------------------------------
              LANGUAGE PICKER
          ------------------------------------------------ */}

          <LanguagePicker
            iconOnly={true}
          />
        </View>

        {/* ==================================================
            MEDICINE SEARCH
        ================================================== */}

        <View
          style={dynamicStyles.medContainer}
        >
          <Med />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles = (
  colors: ReturnType<typeof useTheme>["colors"],
  insets: ReturnType<typeof useSafeAreaInsets>
) =>
  StyleSheet.create({
    // -------------------------------------------------------
    // KEYBOARD CONTAINER
    // -------------------------------------------------------

    keyboardContainer: {
      flex: 1,

      backgroundColor:
        colors.background,
    },

    // -------------------------------------------------------
    // MAIN CONTAINER
    // -------------------------------------------------------

    container: {
      flex: 1,

      backgroundColor:
        colors.background,
    },

    // -------------------------------------------------------
    // SCROLL CONTENT
    // -------------------------------------------------------

    contentContainer: {
      paddingHorizontal:
        SPACING.screenHorizontal,

      paddingTop: Math.max(
        insets.top,
        SPACING.sm
      ),

      paddingBottom:
        insets.bottom +
        SPACING.xxxl,
    },

    // -------------------------------------------------------
    // HEADER ROW
    // -------------------------------------------------------

    headerRow: {
      width: "100%",

      flexDirection: "row",

      alignItems: "center",

      justifyContent: "space-between",

      marginBottom:
        SPACING.lg,
    },

    // -------------------------------------------------------
    // HEADER TEXT CONTAINER
    // -------------------------------------------------------

    headerTextContainer: {
      flex: 1,

      paddingRight:
        SPACING.md,
    },

    // -------------------------------------------------------
    // HEADER TITLE
    // -------------------------------------------------------

    header: {
      fontSize: 28,

      fontWeight: "800",

      textAlign: "left",

      color: colors.text,

      marginBottom: 4,
    },

    // -------------------------------------------------------
    // HEADER SUBTITLE
    // -------------------------------------------------------

    headerSubtitle: {
      fontSize: 12.5,

      lineHeight: 18,

      color:
        colors.textSecondary ||
        colors.text,

      opacity: 0.7,
    },

    // -------------------------------------------------------
    // MEDICINE CONTAINER
    // -------------------------------------------------------

    medContainer: {
      minHeight: "80%",

      marginTop:
        SPACING.xs,

      borderRadius: 16,

      padding:
        SPACING.lg,

      backgroundColor:
        colors.surface,

      borderWidth: 1,

      borderColor:
        colors.border,
    },
  });