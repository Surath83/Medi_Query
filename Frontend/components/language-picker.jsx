import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  FlatList,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useTheme } from "@/constants/theme";

import {
  LANGUAGES,
  useTranslation,
  getLoggedUser,
  hasLanguageSetup,
  markLanguageSetup,
} from "@/constants/i18n";

// =========================================================
// COMPONENT
// =========================================================

export default function LanguagePicker({
  autoOpen = false,
  onComplete = () => {},
  iconOnly = false,
}) {
  const { colors, isDark } = useTheme();

  const {
    language,
    setLanguage,
  } = useTranslation();

  const [visible, setVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // -------------------------------------------------------
  // Load currently logged-in user
  // -------------------------------------------------------

  const loadCurrentUser = async () => {
    try {
      const user = await getLoggedUser();

      setCurrentUser(user || null);

      return user || null;
    } catch (error) {
      console.log(
        "LanguagePicker user load error:",
        error
      );

      setCurrentUser(null);

      return null;
    }
  };

  // -------------------------------------------------------
  // Initialize picker
  //
  // Important:
  // autoOpen should only open for a user who has not
  // completed language setup.
  // -------------------------------------------------------

  useEffect(() => {
    let mounted = true;

    const initializePicker = async () => {
      try {
        const user = await getLoggedUser();

        if (!mounted) return;

        setCurrentUser(user || null);

        if (!autoOpen) {
          return;
        }

        // No logged-in user.
        // Keep the original autoOpen behavior.
        if (!user) {
          setVisible(true);
          return;
        }

        // Check setup status for THIS user.
        const setupCompleted =
          await hasLanguageSetup(user);

        if (!mounted) return;

        setVisible(!setupCompleted);
      } catch (error) {
        console.log(
          "LanguagePicker initialization error:",
          error
        );

        if (mounted && autoOpen) {
          setVisible(true);
        }
      }
    };

    initializePicker();

    return () => {
      mounted = false;
    };
  }, [autoOpen]);

  // -------------------------------------------------------
  // Open picker manually
  // -------------------------------------------------------

  const openPicker = async () => {
    await loadCurrentUser();

    setVisible(true);
  };

  // -------------------------------------------------------
  // Close picker
  // -------------------------------------------------------

  const closePicker = async () => {
    try {
      const user =
        currentUser || (await getLoggedUser());

      if (user) {
        // Mark setup only for the current user.
        await markLanguageSetup(user);
      }
    } catch (error) {
      console.log(
        "Language setup save error:",
        error
      );
    }

    setVisible(false);

    onComplete();
  };

  // -------------------------------------------------------
  // Select language
  // -------------------------------------------------------

  const selectLanguage = async (code) => {
    try {
      // Always get the latest logged-in user.
      // This prevents accidentally using a stale user
      // after logout/login.
      const user =
        currentUser || (await getLoggedUser());

      // Change language.
      //
      // i18n.js is responsible for storing the language
      // under:
      //
      // MEDIQUERY_LANGUAGE_V1_<userId>
      //
      await setLanguage(code);

      // Mark setup for THIS user only.
      if (user) {
        await markLanguageSetup(user);
      }

      setCurrentUser(user || null);

      setVisible(false);

      onComplete();
    } catch (error) {
      console.log(
        "Language selection error:",
        error
      );
    }
  };

  // -------------------------------------------------------
  // Render language item
  // -------------------------------------------------------

  const renderLanguage = ({ item }) => {
    const selected =
      language === item.code;

    return (
      <Pressable
        onPress={() =>
          selectLanguage(item.code)
        }
        accessibilityRole="button"
        accessibilityState={{
          selected,
        }}
        style={({ pressed }) => [
          dynamicStyles.languageItem,

          selected &&
            dynamicStyles.selectedLanguageItem,

          pressed &&
            dynamicStyles.pressedLanguageItem,
        ]}
      >
        {/* Language information */}

        <View
          style={
            dynamicStyles.languageTextContainer
          }
        >
          <Text
            style={
              dynamicStyles.nativeName
            }
          >
            {item.nativeName}
          </Text>

          <Text
            style={
              dynamicStyles.englishName
            }
          >
            {item.name}
          </Text>
        </View>

        {/* Selected indicator */}

        {selected && (
          <View
            style={
              dynamicStyles.checkContainer
            }
          >
            <MaterialCommunityIcons
              name="check"
              size={21}
              color={colors.primary}
            />
          </View>
        )}
      </Pressable>
    );
  };

  const dynamicStyles = styles(
    colors,
    isDark
  );

  // =======================================================
  // UI
  // =======================================================

  return (
    <>
      {/* ===================================================
          LANGUAGE ICON BUTTON
      =================================================== */}

      {iconOnly && (
        <Pressable
          onPress={openPicker}
          accessibilityRole="button"
          accessibilityLabel="Change language"
          style={({ pressed }) => [
            dynamicStyles.iconButton,

            pressed &&
              dynamicStyles.iconButtonPressed,
          ]}
        >
          <MaterialCommunityIcons
            name="translate"
            size={23}
            color={colors.text}
          />
        </Pressable>
      )}

      {/* ===================================================
          LANGUAGE MODAL
      =================================================== */}

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={closePicker}
      >
        <SafeAreaView
          style={
            dynamicStyles.modalOverlay
          }
        >
          {/* Close when tapping outside */}

          <Pressable
            style={
              dynamicStyles.backdrop
            }
            onPress={closePicker}
          />

          {/* =================================================
              MODAL CONTENT
          ================================================= */}

          <View
            style={
              dynamicStyles.modalContainer
            }
          >
            {/* Header */}

            <View
              style={
                dynamicStyles.modalHeader
              }
            >
              <View
                style={
                  dynamicStyles.titleContainer
                }
              >
                <View
                  style={
                    dynamicStyles.titleIcon
                  }
                >
                  <MaterialCommunityIcons
                    name="translate"
                    size={24}
                    color={
                      colors.primary
                    }
                  />
                </View>

                <View>
                  <Text
                    style={
                      dynamicStyles.modalTitle
                    }
                  >
                    Select Language
                  </Text>

                  <Text
                    style={
                      dynamicStyles.modalSubtitle
                    }
                  >
                    Choose your preferred language
                  </Text>
                </View>
              </View>

              {/* Close button */}

              <Pressable
                onPress={closePicker}
                accessibilityRole="button"
                accessibilityLabel="Close language selector"
                style={({ pressed }) => [
                  dynamicStyles.closeButton,

                  pressed &&
                    dynamicStyles.closeButtonPressed,
                ]}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={22}
                  color={colors.text}
                />
              </Pressable>
            </View>

            {/* Divider */}

            <View
              style={
                dynamicStyles.divider
              }
            />

            {/* =================================================
                LANGUAGE LIST
            ================================================= */}

            <FlatList
              data={LANGUAGES}
              keyExtractor={(item) =>
                item.code
              }
              renderItem={
                renderLanguage
              }
              showsVerticalScrollIndicator={
                false
              }
              contentContainerStyle={
                dynamicStyles.listContent
              }
            />

            {/* Footer */}

            <View
              style={
                dynamicStyles.footer
              }
            >
              <MaterialCommunityIcons
                name="information-outline"
                size={17}
                color={
                  colors.textSecondary ||
                  colors.text
                }
              />

              <Text
                style={
                  dynamicStyles.footerText
                }
              >
                You can change the language anytime
                from the Home screen.
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles = (
  colors,
  isDark
) =>
  StyleSheet.create({
    // -------------------------------------------------------
    // LANGUAGE ICON BUTTON
    // -------------------------------------------------------

    iconButton: {
      width: 42,
      height: 42,

      borderRadius: 21,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        colors.surface,

      borderWidth: 1,

      borderColor:
        colors.border,

      elevation: 2,

      shadowOpacity: isDark
        ? 0
        : 0.08,

      shadowRadius: 4,

      shadowOffset: {
        width: 0,
        height: 2,
      },
    },

    iconButtonPressed: {
      opacity: 0.7,

      transform: [
        {
          scale: 0.95,
        },
      ],
    },

    // -------------------------------------------------------
    // MODAL OVERLAY
    // -------------------------------------------------------

    modalOverlay: {
      flex: 1,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "rgba(0, 0, 0, 0.55)",
    },

    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },

    // -------------------------------------------------------
    // MODAL
    // -------------------------------------------------------

    modalContainer: {
      width: "90%",

      maxWidth: 500,

      maxHeight: "82%",

      borderRadius: 22,

      backgroundColor:
        colors.background,

      borderWidth: 1,

      borderColor:
        colors.border,

      overflow: "hidden",

      elevation: 10,

      shadowColor: "#000",

      shadowOpacity: isDark
        ? 0.35
        : 0.18,

      shadowRadius: 15,

      shadowOffset: {
        width: 0,
        height: 8,
      },
    },

    // -------------------------------------------------------
    // HEADER
    // -------------------------------------------------------

    modalHeader: {
      minHeight: 76,

      paddingHorizontal: 18,

      paddingVertical: 14,

      flexDirection: "row",

      alignItems: "center",

      justifyContent: "space-between",
    },

    titleContainer: {
      flex: 1,

      flexDirection: "row",

      alignItems: "center",

      gap: 12,
    },

    titleIcon: {
      width: 44,
      height: 44,

      borderRadius: 22,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        colors.surface,

      borderWidth: 1,

      borderColor:
        colors.border,
    },

    modalTitle: {
      fontSize: 19,

      fontWeight: "800",

      color:
        colors.text,

      marginBottom: 3,
    },

    modalSubtitle: {
      fontSize: 12.5,

      color:
        colors.textSecondary ||
        colors.text,

      opacity: 0.75,
    },

    // -------------------------------------------------------
    // CLOSE BUTTON
    // -------------------------------------------------------

    closeButton: {
      width: 38,
      height: 38,

      borderRadius: 19,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        colors.surface,

      borderWidth: 1,

      borderColor:
        colors.border,

      marginLeft: 10,
    },

    closeButtonPressed: {
      opacity: 0.6,
    },

    // -------------------------------------------------------
    // DIVIDER
    // -------------------------------------------------------

    divider: {
      height: 1,

      backgroundColor:
        colors.border,

      marginHorizontal: 18,
    },

    // -------------------------------------------------------
    // LANGUAGE LIST
    // -------------------------------------------------------

    listContent: {
      paddingHorizontal: 14,

      paddingVertical: 12,

      gap: 8,
    },

    languageItem: {
      minHeight: 64,

      paddingHorizontal: 16,

      paddingVertical: 10,

      borderRadius: 14,

      flexDirection: "row",

      alignItems: "center",

      justifyContent: "space-between",

      backgroundColor:
        colors.surface,

      borderWidth: 1,

      borderColor:
        colors.border,
    },

    selectedLanguageItem: {
      borderColor:
        colors.primary,

      backgroundColor:
        isDark
          ? "rgba(14, 165, 164, 0.12)"
          : "rgba(14, 165, 164, 0.07)",
    },

    pressedLanguageItem: {
      opacity: 0.72,

      transform: [
        {
          scale: 0.99,
        },
      ],
    },

    languageTextContainer: {
      flex: 1,
    },

    nativeName: {
      fontSize: 17,

      fontWeight: "700",

      color:
        colors.text,

      marginBottom: 2,
    },

    englishName: {
      fontSize: 12.5,

      color:
        colors.textSecondary ||
        colors.text,

      opacity: 0.7,
    },

    // -------------------------------------------------------
    // CHECK ICON
    // -------------------------------------------------------

    checkContainer: {
      width: 34,
      height: 34,

      borderRadius: 17,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        isDark
          ? "rgba(14, 165, 164, 0.15)"
          : "rgba(14, 165, 164, 0.10)",
    },

    // -------------------------------------------------------
    // FOOTER
    // -------------------------------------------------------

    footer: {
      minHeight: 48,

      paddingHorizontal: 18,

      paddingVertical: 10,

      flexDirection: "row",

      alignItems: "center",

      gap: 8,

      borderTopWidth: 1,

      borderTopColor:
        colors.border,
    },

    footerText: {
      flex: 1,

      fontSize: 11.5,

      lineHeight: 17,

      color:
        colors.textSecondary ||
        colors.text,

      opacity: 0.7,
    },
  });
