import React, { useState, useRef, useEffect, useCallback } from "react";

import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  ScrollView,
} from "react-native";

import { SvgXml } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";

import config from "../config";

import { useTheme } from "@/constants/theme";
import { SPACING } from "@/constants/spacing";
import { useTranslation } from "@/constants/i18n";

const API_BASE = config.API_BASE;

// ======================================================
// USER-SCOPED STORAGE
// ======================================================

const HISTORY_STORAGE_PREFIX = "MED_SEARCH_HISTORY_";

const getUserStorageId = (user) => {
  if (!user) return null;

  return user.id || user._id || user.email || user.username || null;
};

const getHistoryStorageKey = (userId) => {
  if (!userId) return null;

  return `${HISTORY_STORAGE_PREFIX}${String(userId)}`;
};

// ======================================================
// REFRESH ICON
// ======================================================

const refreshSvg = (color) => `
<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="${color}" viewBox="0 0 24 24">
  <path d="M17.65 6.35A7.95 7.95 0 0 0 12 4V1L7 6l5 5V7c2.76 0 5 2.24 
           5 5 0 1.64-.8 3.09-2.03 4l1.46 1.46A7.938 7.938 0 0 0 20 
           12c0-2.21-.9-4.21-2.35-5.65zM6 13c0-1.64.8-3.09 
           2.03-4L6.57 7.54A7.938 7.938 0 0 0 4 13c0 
           4.42 3.58 8 8 8v3l5-5-5-5v3c-2.76 
           0-5-2.24-5-5z"/>
</svg>
`;

export default function Med() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [medicineName, setMedicineName] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [similarMeds, setSimilarMeds] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  const [history, setHistory] = useState([]);

  // Current logged-in user
  const [currentUser, setCurrentUser] = useState(null);

  // User-specific history key
  const [historyStorageKey, setHistoryStorageKey] = useState(null);

  const spinAnim = useRef(new Animated.Value(0)).current;

  const scrollRef = useRef(null);

  const [iconActive, setIconActive] = useState(false);

  const suggestionDebounceRef = useRef(null);

  const searchAbortRef = useRef(null);

  const suggestionAbortRef = useRef(null);

  const dynamicStyles = styles(colors, insets);

  // ======================================================
  // LOAD CURRENT USER + USER-SPECIFIC HISTORY
  // ======================================================

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadCurrentUserHistory = async () => {
        try {
          const loggedUserRaw = await AsyncStorage.getItem("loggedUser");

          // No logged-in user
          if (!loggedUserRaw) {
            if (active) {
              setCurrentUser(null);
              setHistoryStorageKey(null);
              setHistory([]);
            }

            return;
          }

          let user;

          try {
            user = JSON.parse(loggedUserRaw);
          } catch (parseError) {
            console.error("Failed to parse loggedUser:", parseError);

            if (active) {
              setCurrentUser(null);
              setHistoryStorageKey(null);
              setHistory([]);
            }

            return;
          }

          const userId = getUserStorageId(user);

          // User object exists but no usable identifier
          if (!userId) {
            console.warn("Logged user does not contain a usable ID.");

            if (active) {
              setCurrentUser(user);
              setHistoryStorageKey(null);
              setHistory([]);
            }

            return;
          }

          const userHistoryKey = getHistoryStorageKey(userId);

          const storedHistory = await AsyncStorage.getItem(userHistoryKey);

          let parsedHistory = [];

          if (storedHistory) {
            try {
              const parsed = JSON.parse(storedHistory);

              if (Array.isArray(parsed)) {
                parsedHistory = parsed.slice(0, 5);
              }
            } catch (parseError) {
              console.error("History parse failed:", parseError);

              parsedHistory = [];
            }
          }

          if (!active) return;

          setCurrentUser(user);
          setHistoryStorageKey(userHistoryKey);

          // IMPORTANT:
          // Reset old user's history before
          // applying the new user's history.
          setHistory(parsedHistory);
        } catch (error) {
          console.error("Failed to load user search history:", error);

          if (active) {
            setCurrentUser(null);
            setHistoryStorageKey(null);
            setHistory([]);
          }
        }
      };

      loadCurrentUserHistory();

      return () => {
        active = false;
      };
    }, []),
  );

  // ======================================================
  // SAVE HISTORY FOR CURRENT USER ONLY
  // ======================================================

  useEffect(() => {
    if (!historyStorageKey) {
      return;
    }

    AsyncStorage.setItem(historyStorageKey, JSON.stringify(history)).catch(
      (e) => {
        console.error("History save failed", e);
      },
    );
  }, [history, historyStorageKey]);

  // ======================================================
  // SCROLL TO TOP WHEN THEME CHANGES
  // ======================================================

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        y: 0,
        animated: false,
      });
    });
  }, [isDark]);

  // ======================================================
  // CLEANUP
  // ======================================================

  useEffect(() => {
    return () => {
      if (searchAbortRef.current) {
        searchAbortRef.current.abort();
      }

      if (suggestionAbortRef.current) {
        suggestionAbortRef.current.abort();
      }

      if (suggestionDebounceRef.current) {
        clearTimeout(suggestionDebounceRef.current);
      }
    };
  }, []);

  // ======================================================
  // UPDATE USER-SPECIFIC HISTORY
  // ======================================================

  const updateHistory = (name) => {
    if (!name || !historyStorageKey) {
      return;
    }

    setHistory((prev) => {
      const safePreviousHistory = Array.isArray(prev) ? prev : [];

      const filtered = safePreviousHistory.filter(
        (item) => item.toLowerCase() !== name.toLowerCase(),
      );

      const updated = [name, ...filtered];

      // Latest search stays FIRST
      return updated.slice(0, 5);
    });
  };

  // ======================================================
  // RESET
  // ======================================================

  const handleReset = () => {
    setIconActive(true);

    Animated.sequence([
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.linear,
        useNativeDriver: true,
      }),

      Animated.timing(spinAnim, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start(() => setIconActive(false));

    setMedicineName("");
    setSearchResult(null);
    setSimilarMeds([]);
    setSuggestions([]);

    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        y: 0,
        animated: true,
      });
    });
  };

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "0deg"],
  });

  // ======================================================
  // SEARCH
  // ======================================================

  const handleSearch = async () => {
    if (!medicineName.trim()) {
      return;
    }

    if (searchAbortRef.current) {
      searchAbortRef.current.abort();
    }

    const controller = new AbortController();

    searchAbortRef.current = controller;

    try {
      setLoadingSearch(true);

      const res = await fetch(
        `${API_BASE}/medicine?name=${encodeURIComponent(medicineName.trim())}`,
        {
          signal: controller.signal,
        },
      );

      if (!res.ok) {
        throw new Error("Medicine fetch failed");
      }

      const json = await res.json();

      setSearchResult(json || null);

      // Add newest search to the beginning
      // of CURRENT USER's history.
      updateHistory(medicineName.trim());

      let subs = [];

      if (json) {
        const substituteKeys = [
          "substitute0",
          "substitute1",
          "substitute2",
          "substitute3",
          "substitute4",
        ];

        for (const key of substituteKeys) {
          if (!json[key]) {
            continue;
          }

          try {
            const subRes = await fetch(
              `${API_BASE}/medicine?name=${encodeURIComponent(json[key])}`,
              {
                signal: controller.signal,
              },
            );

            if (subRes.ok) {
              const subJson = await subRes.json();

              subs.push(
                subJson || {
                  name: json[key],
                },
              );
            } else {
              subs.push({
                name: json[key],
              });
            }
          } catch (err) {
            if (err.name !== "AbortError") {
              subs.push({
                name: json[key],
              });
            }
          }
        }

        subs.sort((a, b) => {
          const priceA = parseFloat(a?.price) || Infinity;

          const priceB = parseFloat(b?.price) || Infinity;

          return priceA - priceB;
        });
      }

      setSimilarMeds(subs);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Search error:", err.message);

        setSimilarMeds([]);
      }
    } finally {
      setLoadingSearch(false);
    }
  };

  // ======================================================
  // SUGGESTIONS
  // ======================================================

  const handleInputChange = (text) => {
    setMedicineName(text);

    if (suggestionDebounceRef.current) {
      clearTimeout(suggestionDebounceRef.current);
    }

    if (!text.trim()) {
      setSuggestions([]);
      return;
    }

    suggestionDebounceRef.current = setTimeout(async () => {
      if (suggestionAbortRef.current) {
        suggestionAbortRef.current.abort();
      }

      const controller = new AbortController();

      suggestionAbortRef.current = controller;

      setLoadingSuggestions(true);

      try {
        const res = await fetch(
          `${API_BASE}/suggestions?q=${encodeURIComponent(text)}`,
          {
            signal: controller.signal,
          },
        );

        if (!res.ok) {
          throw new Error("Failed to fetch suggestions");
        }

        const json = await res.json();

        setSuggestions(Array.isArray(json) ? json.slice(0, 6) : []);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Suggestion error:", err.message);

          setSuggestions([]);
        }
      } finally {
        setLoadingSuggestions(false);
      }
    }, 400);
  };

  const handleSuggestionPress = (item) => {
    if (!item) return;

    setMedicineName(item.name || "");

    setSuggestions([]);
  };

  // ======================================================
  // HEADER
  // ======================================================

  const renderHeader = () => (
    <View style={dynamicStyles.headerContainer}>
      {/* Header */}
      <View style={dynamicStyles.headerRow}>
        <Text style={dynamicStyles.title}>{t("med.medicalEnquiry")}</Text>

        <TouchableOpacity
          onPress={handleReset}
          hitSlop={{
            top: 8,
            bottom: 8,
            left: 8,
            right: 8,
          }}
        >
          <Animated.View
            style={{
              transform: [
                {
                  rotate: spin,
                },
              ],
            }}
          >
            <SvgXml
              xml={refreshSvg(iconActive ? colors.white : colors.text)}
              width="28"
              height="28"
            />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Input label */}
      <Text style={dynamicStyles.label}>{t("med.tabletName")}:</Text>

      {/* Search input + suggestions */}
      <View style={dynamicStyles.inputWrapper}>
        <TextInput
          style={dynamicStyles.input}
          value={medicineName}
          placeholder={t("med.enterTabletName")}
          placeholderTextColor={colors.textLight}
          onChangeText={handleInputChange}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />

        {medicineName.length > 0 && suggestions.length > 0 && (
          <View style={dynamicStyles.suggestionBox}>
            {loadingSuggestions ? (
              <View style={dynamicStyles.loadingSuggestion}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : (
              <View>
                {suggestions
                  .filter((item) => item && item.name)
                  .map((item, index) => (
                    <TouchableOpacity
                      key={item._id || `${item.name}-${index}`}
                      style={dynamicStyles.suggestionItemWrapper}
                      onPress={() => handleSuggestionPress(item)}
                    >
                      <Text style={dynamicStyles.suggestionItem}>
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>
            )}
          </View>
        )}
      </View>

      {/* Search button */}
      <TouchableOpacity
        style={dynamicStyles.button}
        onPress={handleSearch}
        activeOpacity={0.8}
      >
        {loadingSearch ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <Text style={dynamicStyles.buttonText}>{t("med.search")}</Text>
        )}
      </TouchableOpacity>

      {/* History + results */}
      <ScrollView
        ref={scrollRef}
        style={dynamicStyles.resultsScroll}
        contentContainerStyle={dynamicStyles.resultsContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Search History */}
        {history.length > 0 ? (
          <View style={dynamicStyles.historyContainer}>
            <Text style={dynamicStyles.historyTitle}>
              {t("med.searchHistory")}:
            </Text>

            {history.map((item, index) => (
              <View key={`${item}-${index}`} style={dynamicStyles.historyItem}>
                <Text style={dynamicStyles.historyText} numberOfLines={1}>
                  {item}
                </Text>

                <TouchableOpacity
                  onPress={() => setMedicineName(item)}
                  hitSlop={{
                    top: 8,
                    bottom: 8,
                    left: 8,
                    right: 8,
                  }}
                >
                  <Text style={dynamicStyles.historyAction}>
                    {"\u00A0\u031A"}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <Text style={dynamicStyles.noHistory}>{t("med.noHistory")}</Text>
        )}

        {/* Primary result */}
        {searchResult && (
          <MedicineCard
            data={searchResult}
            colors={colors}
            isPrimary
            onLongPress={() => setSelectedMedicine(searchResult)}
          />
        )}

        {/* Similar medicines */}
        {similarMeds.length > 0 && (
          <View style={dynamicStyles.similarContainer}>
            <Text style={dynamicStyles.similarTitle}>
              {t("med.suggested")}:
            </Text>

            {similarMeds.map((med, idx) => (
              <MedicineCard
                key={med._id || idx}
                data={med}
                colors={colors}
                onLongPress={() => setSelectedMedicine(med)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );

  // ======================================================
  // UI
  // ======================================================

  return (
    <KeyboardAvoidingView
      style={dynamicStyles.keyboardContainer}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View style={dynamicStyles.container}>
        {renderHeader()}

        {/* Medicine details modal */}
        <Modal
          visible={!!selectedMedicine}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedMedicine(null)}
        >
          <View style={dynamicStyles.modalBackground}>
            <View style={dynamicStyles.modalCard}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={dynamicStyles.modalContent}
              >
                <Text style={dynamicStyles.modalTitle}>
                  {selectedMedicine?.name || "N/A"}
                </Text>

                <Detail
                  label={t("med.manufacturer")}
                  value={selectedMedicine?.manufacturer_name}
                  colors={colors}
                />

                <Detail
                  label={t("med.price")}
                  value={`₹${selectedMedicine?.price}`}
                  colors={colors}
                />

                <Detail
                  label={t("med.type")}
                  value={selectedMedicine?.type}
                  colors={colors}
                />

                <Detail
                  label={t("med.packaging")}
                  value={selectedMedicine?.pack_size_label}
                  colors={colors}
                />

                <Detail
                  label={t("med.composition1")}
                  value={selectedMedicine?.short_composition1}
                  colors={colors}
                />

                <Detail
                  label={t("med.composition2")}
                  value={selectedMedicine?.short_composition2}
                  colors={colors}
                />

                <Detail
                  label={t("med.sideEffects")}
                  value={selectedMedicine?.Consolidated_Side_Effects}
                  colors={colors}
                />

                <Detail
                  label={t("med.use")}
                  value={selectedMedicine?.use0}
                  colors={colors}
                />

                <Detail
                  label={t("med.chemicalClass")}
                  value={selectedMedicine?.["Chemical Class"]}
                  colors={colors}
                />

                <Detail
                  label={t("med.habitForming")}
                  value={selectedMedicine?.["Habit Forming"]}
                  colors={colors}
                />

                <Detail
                  label={t("med.therapeuticClass")}
                  value={selectedMedicine?.["Therapeutic Class"]}
                  colors={colors}
                />

                <Detail
                  label={t("med.actionClass")}
                  value={selectedMedicine?.["Action Class"]}
                  colors={colors}
                />
              </ScrollView>

              <TouchableOpacity
                style={dynamicStyles.closeButton}
                onPress={() => setSelectedMedicine(null)}
                activeOpacity={0.8}
              >
                <Text style={dynamicStyles.closeText}>{t("med.close")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}

// ======================================================
// MEDICINE CARD
// ======================================================

function MedicineCard({ data, onLongPress, colors }) {
  if (!data) return null;

  const cardStyles = medicineCardStyles(colors);

  return (
    <View style={cardStyles.resultBox}>
      <TouchableOpacity
        onLongPress={() => {
          if (onLongPress) {
            onLongPress();
          }
        }}
        activeOpacity={0.85}
      >
        <View style={cardStyles.resultHeader}>
          <Text
            style={cardStyles.resultTitle}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {data.name || "N/A"}
          </Text>

          <Text style={cardStyles.price}>₹ {data.price || "N/A"}</Text>
        </View>

        <Text numberOfLines={1} style={cardStyles.detailLine}>
          <Text style={cardStyles.detailLabel}>Manufacturer:</Text>

          <Text style={cardStyles.detailText}>{data.manufacturer_name}</Text>
        </Text>

        <Text numberOfLines={2} style={cardStyles.detailLine}>
          <Text style={cardStyles.detailLabel}>Components:</Text>

          <Text style={cardStyles.detailText}>
            {data.short_composition1}{" "}
            {data.short_composition2 ? `, ${data.short_composition2}` : ""}
          </Text>
        </Text>

        <Text style={cardStyles.longPressText}>(Long press for details)</Text>
      </TouchableOpacity>
    </View>
  );
}

// ======================================================
// DETAIL
// ======================================================

function Detail({ label, value, colors }) {
  if (!value) return null;

  const detailStyles = medicineDetailStyles(colors);

  return (
    <Text style={detailStyles.detail}>
      <Text style={detailStyles.label}>{label}: </Text>

      <Text style={detailStyles.value}>{value}</Text>
    </Text>
  );
}

// ======================================================
// MAIN STYLES
// ======================================================

const styles = (colors, insets) =>
  StyleSheet.create({
    keyboardContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },

    container: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: SPACING.xl,
    },

    headerContainer: {
      flex: 1,
      paddingTop: Math.max(insets.top, SPACING.sm),
      paddingHorizontal: SPACING.screenHorizontal,
    },

    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: SPACING.lg,
    },

    title: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.text,
      flex: 1,
    },

    label: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.textSecondary,
      marginBottom: SPACING.sm,
    },

    inputWrapper: {
      zIndex: 10,
    },

    input: {
      backgroundColor: colors.inputBackground,
      color: colors.text,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 14,
      paddingHorizontal: SPACING.input.paddingHorizontal,
      paddingVertical: SPACING.input.paddingVertical,
      fontSize: 16,
    },

    suggestionBox: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 14,
      marginTop: SPACING.xs,
      maxHeight: 260,
      overflow: "hidden",
    },

    loadingSuggestion: {
      paddingVertical: SPACING.lg,
      alignItems: "center",
      justifyContent: "center",
    },

    suggestionItemWrapper: {
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border,
    },

    suggestionItem: {
      fontSize: 14,
      color: colors.text,
    },

    button: {
      backgroundColor: colors.primary,
      paddingVertical: SPACING.button.paddingVertical,
      paddingHorizontal: SPACING.button.paddingHorizontal,
      borderRadius: 14,
      alignItems: "center",
      marginTop: SPACING.button.marginTop,
      marginBottom: SPACING.sm,
    },

    buttonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: "600",
    },

    resultsScroll: {
      flex: 1,
      marginTop: SPACING.xs,
      borderRadius: 18,
    },

    resultsContent: {
      paddingBottom: insets.bottom + SPACING.xxxl,
    },

    historyContainer: {
      paddingTop: SPACING.sm,
      paddingHorizontal: SPACING.sm,
    },

    historyTitle: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: "700",
      marginBottom: SPACING.xs,
    },

    historyItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "95%",
      minHeight: 30,
    },

    historyText: {
      color: colors.textLight,
      flex: 1,
      paddingLeft: SPACING.sm,
      fontSize: 14,
    },

    historyAction: {
      color: colors.text,
      fontSize: 18,
      paddingLeft: SPACING.md,
    },

    noHistory: {
      color: colors.textLight,
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      fontSize: 14,
    },

    similarContainer: {
      marginTop: SPACING.lg,
    },

    similarTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "700",
      marginBottom: SPACING.sm,
    },

    modalBackground: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.overlay,
    },

    modalCard: {
      backgroundColor: colors.card,
      padding: SPACING.xl,
      borderRadius: 16,
      width: "90%",
      maxHeight: "85%",
      borderWidth: 1,
      borderColor: colors.border,
    },

    modalContent: {
      paddingBottom: SPACING.lg,
    },

    modalTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: "800",
      marginBottom: SPACING.lg,
    },

    closeButton: {
      backgroundColor: colors.primary,
      marginTop: SPACING.lg,
      paddingVertical: SPACING.button.paddingVertical,
      borderRadius: 14,
      alignItems: "center",
    },

    closeText: {
      color: colors.white,
      fontWeight: "600",
      fontSize: 16,
    },
  });

// ======================================================
// MEDICINE CARD STYLES
// ======================================================

const medicineCardStyles = (colors) =>
  StyleSheet.create({
    resultBox: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: SPACING.card.padding,
      marginTop: SPACING.item.marginTop,
      marginBottom: SPACING.listItem.marginBottom,
      borderWidth: 1,
      borderColor: colors.border,
    },

    resultHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: SPACING.sm,
    },

    resultTitle: {
      flex: 1,
      flexShrink: 1,
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      marginRight: SPACING.sm,
    },

    price: {
      minWidth: 70,
      textAlign: "right",
      fontSize: 16,
      fontWeight: "600",
      color: colors.success,
    },

    detailLine: {
      marginTop: SPACING.xs,
      color: colors.text,
    },

    detailLabel: {
      fontWeight: "700",
      color: colors.textSecondary,
    },

    detailText: {
      color: colors.text,
    },

    longPressText: {
      fontSize: 12,
      marginTop: SPACING.xs,
      color: colors.textLight,
    },
  });

// ======================================================
// DETAIL STYLES
// ======================================================

const medicineDetailStyles = (colors) =>
  StyleSheet.create({
    detail: {
      marginBottom: SPACING.sm,
      color: colors.text,
      lineHeight: 20,
    },

    label: {
      fontWeight: "700",
      color: colors.textSecondary,
    },

    value: {
      color: colors.text,
    },
  });
