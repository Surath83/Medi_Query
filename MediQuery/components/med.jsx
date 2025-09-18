import React, { useState, useRef } from "react";
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
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ScrollView,
} from "react-native";
import { SvgXml } from "react-native-svg";
import config from "../config";

const API_BASE = config.API_BASE;
const SCREEN_HEIGHT = Dimensions.get("window").height;

// online refresh icon SVG
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
  const [modalVisible, setModalVisible] = useState(false);

  const spinAnim = useRef(new Animated.Value(0)).current;
  const [iconActive, setIconActive] = useState(false);

  const colors = {
    background: colorScheme === "dark" ? "#1E293B" : "#F8FAFC",
    card: colorScheme === "dark" ? "#334155" : "#fff",
    text: colorScheme === "dark" ? "#F8FAFC" : "#1E293B",
    label: colorScheme === "dark" ? "#94A3B8" : "#334155",
    price: "#16A34A",
    button: "#2563EB",
    placeholder: "#94A3B8",
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
    outputRange: ["0deg", "360deg"],
  });

  const handleSearch = async () => {
    if (!medicineName.trim()) return;
    try {
      setLoadingSearch(true);
      const res = await fetch(
        `${API_BASE}/medicine?name=${encodeURIComponent(medicineName)}`
      );
      const json = await res.json();
      setSearchResult(json || null);

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
          if (json[key]) {
            try {
              const subRes = await fetch(
                `${API_BASE}/medicine?name=${encodeURIComponent(json[key])}`
              );
              if (subRes.ok) {
                const subJson = await subRes.json();
                subs.push(subJson || { name: json[key] });
              } else {
                subs.push({ name: json[key] });
              }
            } catch {
              subs.push({ name: json[key] });
            }
          }
        }
      }
      setSimilarMeds(subs);
    } catch (err) {
      console.error("Error fetching medicine:", err);
      setSimilarMeds([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleInputChange = async (text) => {
    setMedicineName(text);
    if (!text.trim()) {
      setSuggestions([]);
      return;
    }
    setLoadingSuggestions(true);
    try {
      const res = await fetch(
        `${API_BASE}/suggestions?q=${encodeURIComponent(text)}`
      );
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const json = await res.json();
      setSuggestions(Array.isArray(json) ? json.slice(0, 6) : []);
    } catch (err) {
      console.error("Error fetching suggestions:", err.message);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSuggestionPress = (item) => {
    if (!item) return;
    setMedicineName(item.name || "");
    setSuggestions([]);
  };

  const renderHeader = () => (
    <View style={{ paddingBottom: 20, minHeight: SCREEN_HEIGHT * (5 / 9) }}>
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
              xml={refreshSvg(iconActive ? "#2563EB" : colors.text)}
              width="28"
              height="28"
            />
          </Animated.View>
        </TouchableOpacity>
      </View>

      <Text style={[styles.label, { color: colors.label }]}>
        Medicine Name:
      </Text>

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
          placeholder="Enter medicine name"
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

      {searchResult && (
        <MedicineCard
          data={searchResult}
          colors={colors}
          onLongPress={() => setModalVisible(true)}
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
              onLongPress={() => {
                setSearchResult(med);
                setModalVisible(true);
              }}
            />
          ))}
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <FlatList
          contentContainerStyle={{ flexGrow: 1 }}
          ListHeaderComponent={renderHeader}
          data={[]}
          renderItem={null}
          keyboardShouldPersistTaps="handled"
        />

        {/* Modal */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
              <ScrollView>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {searchResult?.name || "N/A"}
                </Text>
                <Detail label="Manufacturer" value={searchResult?.manufacturer_name} />
                <Detail label="Price" value={`₹${searchResult?.price}`} />
                <Detail label="Type" value={searchResult?.type} />
                <Detail label="Packaging" value={searchResult?.pack_size_label} />
                <Detail label="Composition 1" value={searchResult?.short_composition1} />
                <Detail label="Composition 2" value={searchResult?.short_composition2} />
                <Detail label="Side Effects" value={searchResult?.Consolidated_Side_Effects} />
                <Detail label="Use" value={searchResult?.use0} />
                <Detail label="Chemical Class" value={searchResult?.["Chemical Class"]} />
                <Detail label="Habit Forming" value={searchResult?.["Habit Forming"]} />
                <Detail label="Therapeutic Class" value={searchResult?.["Therapeutic Class"]} />
                <Detail label="Action Class" value={searchResult?.["Action Class"]} />
              </ScrollView>
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: colors.button }]}
                onPress={() => setModalVisible(false)}
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

function MedicineCard({ data, onLongPress, colors }) {
  if (!data) return null;
  return (
    <View
      style={[
        styles.resultBox,
        { backgroundColor: colors.card, marginBottom: 12 },
      ]}
    >
      <TouchableOpacity onLongPress={onLongPress}>
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
          Manufacturer: {data.manufacturer_name}
        </Text>
        <Text numberOfLines={2} style={{ marginTop: 2 }}>
          Components: {data.short_composition1}{" "}
          {data.short_composition2 ? `, ${data.short_composition2}` : ""}
        </Text>
        <Text style={{ fontSize: 12, marginTop: 4, color: colors.label }}>
          (Long press for details)
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function Detail({ label, value }) {
  if (!value) return null;
  return (
    <Text style={{ marginBottom: 6 }}>
      <Text style={{ fontWeight: "700" }}>{label}: </Text>
      <Text>{value}</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  label: { fontSize: 16, fontWeight: "500", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  suggestionBox: {
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    zIndex: 20,
    maxHeight: 260,
  },
  suggestionItemWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },
  suggestionItem: { fontSize: 16 },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 12,
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
  resultBox: {
    borderRadius: 10,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
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
  price: {
    minWidth: 70,
    textAlign: "right",
    fontSize: 16,
    fontWeight: "600",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    padding: 20,
    borderRadius: 12,
    width: "85%",
    maxHeight: "80%",
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  closeButton: {
    marginTop: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  closeText: { color: "#fff", fontWeight: "600" },
});
