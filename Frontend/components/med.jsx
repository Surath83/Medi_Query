import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  ActivityIndicator,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  ScrollView,
} from "react-native";
import { SvgXml } from "react-native-svg";
import config from "../config";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = config.API_BASE;
const HISTORY_KEY = "MED_SEARCH_HISTORY";

// Refresh icon SVG
const refreshSvg = (color = "#000") => `
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
  const colorScheme = useColorScheme();
  const [medicineName, setMedicineName] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [similarMeds, setSimilarMeds] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [history, setHistory] = useState([""]);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const [iconActive, setIconActive] = useState(false);

  const suggestionDebounceRef = useRef(null);
  const searchAbortRef = useRef(null);
  const suggestionAbortRef = useRef(null);

  const colors = {
    background: "transparent",
    card:
      colorScheme === "dark"
        ? "rgba(79, 90, 104, 1)"
        : "rgba(248, 250, 252, 1)",
    text: colorScheme === "dark" ? "#F8FAFC" : "#1E293B",
    label: colorScheme === "dark" ? "#CBD5E1" : "#334155",
    price: "#16A34A",
    button: "#0EA5A4",
    placeholder: "#94A3B8",
    overlay: "rgba(0,0,0,0.7)",
  };
  useEffect(() => {
    return () => {
      if (searchAbortRef.current) searchAbortRef.current.abort();
      if (suggestionAbortRef.current) suggestionAbortRef.current.abort();
      if (suggestionDebounceRef.current)
        clearTimeout(suggestionDebounceRef.current);
    };
  }, []);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const stored = await AsyncStorage.getItem(HISTORY_KEY);
        if (stored) setHistory(JSON.parse(stored));
      } catch (e) {
        console.error("History load failed", e);
      }
    };
    loadHistory();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  const updateHistory = (name) => {
    if (!name) return;

    setHistory((prev) => {
      const filtered = prev.filter(
        (item) => item.toLowerCase() !== name.toLowerCase(),
      );
      const updated = [...filtered, name];
      return updated.slice(-5);
    });
  };

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
  };

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "0deg"],
  });

  const handleSearch = async () => {
    if (!medicineName.trim()) return;

    // Abort previous search
    if (searchAbortRef.current) {
      searchAbortRef.current.abort();
    }

    const controller = new AbortController();
    searchAbortRef.current = controller;

    try {
      setLoadingSearch(true);

      const res = await fetch(
        `${API_BASE}/medicine?name=${encodeURIComponent(medicineName)}`,
        { signal: controller.signal },
      );

      if (!res.ok) throw new Error("Medicine fetch failed");

      const json = await res.json();
      setSearchResult(json || null);
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
          if (!json[key]) continue;

          try {
            const subRes = await fetch(
              `${API_BASE}/medicine?name=${encodeURIComponent(json[key])}`,
              { signal: controller.signal },
            );

            if (subRes.ok) {
              const subJson = await subRes.json();
              subs.push(subJson || { name: json[key] });
            } else {
              subs.push({ name: json[key] });
            }
          } catch (err) {
            if (err.name !== "AbortError") {
              subs.push({ name: json[key] });
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
          { signal: controller.signal },
        );

        if (!res.ok) throw new Error("Failed to fetch suggestions");

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

  const renderHeader = () => (
    <View style={{ paddingBottom: 0 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={[styles.title, { color: colors.text }]}>
          Medical Enquiry
        </Text>
        <TouchableOpacity onPress={handleReset}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <SvgXml
              xml={refreshSvg(iconActive ? "#ffffffff" : colors.text)}
              width="28"
              height="28"
            />
          </Animated.View>
        </TouchableOpacity>
      </View>

      <Text style={[styles.label, { color: colors.label }]}>Tablet Name:</Text>

      <View style={{ zIndex: 10 }}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              color: colors.text,
              borderColor: colors.label,
            },
          ]}
          value={medicineName}
          placeholder="Enter tablet name"
          placeholderTextColor={colors.placeholder}
          onChangeText={handleInputChange}
        />

        {medicineName.length > 0 && suggestions.length > 0 && (
          <View
            style={[
              styles.suggestionBox,
              { backgroundColor: colors.card, borderColor: colors.label },
            ]}
          >
            {loadingSuggestions ? (
              <ActivityIndicator size="small" color={colors.button} />
            ) : (
              <FlatList
                data={suggestions.filter((item) => item && item.name)}
                keyExtractor={(item, index) => item._id || index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.suggestionItemWrapper}
                    onPress={() => handleSuggestionPress(item)}
                  >
                    <Text
                      style={[styles.suggestionItem, { color: colors.text }]}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.button }]}
        onPress={handleSearch}
      >
        {loadingSearch ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Search</Text>
        )}
      </TouchableOpacity>

      <ScrollView
        style={{ maxHeight: "71%", padding: 0, borderRadius: 18 }}
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        {history.length > 0 ? (
          <View>
            <Text
              style={{
                color: colors.label,
                fontWeight: "700",
                paddingTop: 10,
                paddingLeft: 10,
              }}
            >
              Search History :
            </Text>

            {history.map((item, index) => (
              <View
                key={index}
                style={{
                  paddingLeft: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "95%",
                  paddingVertical: 2,
                }}
              >
                {/* Left text */}
                <Text
                  style={{ color: colors.placeholder, flex: 1, paddingLeft: 8 }}
                >
                  {item}
                </Text>

                {/* Right clickable angle */}
                <TouchableOpacity
                  onPress={() => setMedicineName(item)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 18,
                      paddingLeft: 12,
                    }}
                  >
                    {"\u00A0\u031A"}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <Text style={{ color: colors.text }}>No history yet</Text>
        )}
        {searchResult && (
          <MedicineCard
            data={searchResult}
            colors={colors}
            isPrimary={true}
            onLongPress={() => setSelectedMedicine(searchResult)}
          />
        )}

        {similarMeds.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <Text
              style={[styles.label, { color: colors.text, fontWeight: "700" }]}
            >
              Suggested:
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View style={[styles.container]} keyboardShouldPersistTaps="handled">
        {renderHeader()}

        {/* Modal */}
        <Modal
          visible={!!selectedMedicine}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedMedicine(null)}
        >
          <View
            style={[
              styles.modalBackground,
              { backgroundColor: colors.overlay },
            ]}
          >
            <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
              <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {selectedMedicine?.name || "N/A"}
                </Text>
                <Detail
                  label="Manufacturer"
                  value={selectedMedicine?.manufacturer_name}
                  colors={colors}
                />
                <Detail
                  label="Price"
                  value={`₹${selectedMedicine?.price}`}
                  colors={colors}
                />
                <Detail
                  label="Type"
                  value={selectedMedicine?.type}
                  colors={colors}
                />
                <Detail
                  label="Packaging"
                  value={selectedMedicine?.pack_size_label}
                  colors={colors}
                />
                <Detail
                  label="Composition 1"
                  value={selectedMedicine?.short_composition1}
                  colors={colors}
                />
                <Detail
                  label="Composition 2"
                  value={selectedMedicine?.short_composition2}
                  colors={colors}
                />
                <Detail
                  label="Side Effects"
                  value={selectedMedicine?.Consolidated_Side_Effects}
                  colors={colors}
                />
                <Detail
                  label="Use"
                  value={selectedMedicine?.use0}
                  colors={colors}
                />
                <Detail
                  label="Chemical Class"
                  value={selectedMedicine?.["Chemical Class"]}
                  colors={colors}
                />
                <Detail
                  label="Habit Forming"
                  value={selectedMedicine?.["Habit Forming"]}
                  colors={colors}
                />
                <Detail
                  label="Therapeutic Class"
                  value={selectedMedicine?.["Therapeutic Class"]}
                  colors={colors}
                />
                <Detail
                  label="Action Class"
                  value={selectedMedicine?.["Action Class"]}
                  colors={colors}
                />
              </ScrollView>
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: colors.button }]}
                onPress={() => setSelectedMedicine(null)}
              >
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}

function MedicineCard({ data, onLongPress, colors, isPrimary = false }) {
  const colorScheme = useColorScheme();
  const textColor = colorScheme === "dark" ? "#c9c9c9ff" : "#7e7e7eff";
  if (!data) return null;
  return (
    <View
      style={[
        styles.resultBox,
        { backgroundColor: colors.card, marginBottom: 12 },
      ]}
    >
      <TouchableOpacity
        onLongPress={() => {
          if (onLongPress) onLongPress();
        }}
      >
        <View style={styles.resultHeader}>
          <Text
            style={[styles.resultTitle, { color: colors.text }]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {data.name || "N/A"}
          </Text>
          <Text style={[styles.price, { color: colors.price }]}>
            ₹ {data.price || "N/A"}
          </Text>
        </View>
        <Text numberOfLines={1} style={{ marginTop: 4 }}>
          <Text style={{ fontWeight: "700", color: colors.label }}>
            Manufacturer:
          </Text>
          <Text style={{ color: textColor }}>{data.manufacturer_name}</Text>
        </Text>
        <Text numberOfLines={2} style={{ marginTop: 2 }}>
          <Text style={{ fontWeight: "700", color: colors.label }}>
            Components:
          </Text>
          <Text style={{ color: textColor }}>
            {data.short_composition1}{" "}
            {data.short_composition2 ? `, ${data.short_composition2}` : ""}
          </Text>
        </Text>
        <Text style={{ fontSize: 12, marginTop: 4, color: colors.label }}>
          (Long press for details)
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function Detail({ label, value, colors }) {
  const colorScheme = useColorScheme();
  const textColor = colorScheme === "dark" ? "#c9c9c9ff" : "#7e7e7eff";

  if (!value) return null;
  return (
    <Text style={{ marginBottom: 6 }}>
      <Text style={{ fontWeight: "700", color: colors.label }}>{label}: </Text>
      <Text style={{ color: textColor }}>{value}</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 10 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  label: { fontSize: 16, fontWeight: "500", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
  },
  suggestionBox: {
    borderWidth: 1,
    borderRadius: 14,
    marginTop: 4,
    maxHeight: 260,
    overflow: "hidden",
  },
  suggestionItemWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },
  suggestionItem: { fontSize: 14 },
  button: {
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 8,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  resultBox: {
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  resultTitle: {
    flex: 1,
    flexShrink: 1,
    fontSize: 18,
    fontWeight: "700",
    marginRight: 10,
  },
  price: { minWidth: 70, textAlign: "right", fontSize: 16, fontWeight: "600" },
  modalBackground: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalCard: { padding: 20, borderRadius: 16, width: "90%", maxHeight: "85%" },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  closeButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  closeText: { color: "#fff", fontWeight: "600" },
});
