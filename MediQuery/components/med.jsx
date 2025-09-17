import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  ActivityIndicator,
  ScrollView,
  useColorScheme,
} from "react-native";
import env from "../config"; // API_BASE

const API_BASE = env.API_BASE;

export default function Med() {
  const colorScheme = useColorScheme();

  const [medicineName, setMedicineName] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [similarMeds, setSimilarMeds] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Light/dark colors
  const colors = {
    background: colorScheme === "dark" ? "#1E293B" : "#F8FAFC",
    card: colorScheme === "dark" ? "#334155" : "#fff",
    text: colorScheme === "dark" ? "#F8FAFC" : "#1E293B",
    label: colorScheme === "dark" ? "#94A3B8" : "#334155",
    price: "#16A34A",
    button: "#2563EB",
    placeholder: "#94A3B8",
  };

  // 🔍 Search medicine + fetch similar medicines
  const handleSearch = async () => {
    if (!medicineName.trim()) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/medicine?name=${medicineName}`);
      const json = await res.json();
      setSearchResult(json || null);

      if (json) {
        const comp1 = json.short_composition1;
        const comp2 = json.short_composition2 || "";

        const simRes = await fetch(
          `${API_BASE}/similar?comp1=${encodeURIComponent(comp1)}&comp2=${encodeURIComponent(comp2)}`
        );
        const simJson = await simRes.json();
        setSimilarMeds(
          Array.isArray(simJson)
            ? simJson.filter((med) => med?.name?.toLowerCase() !== medicineName.toLowerCase())
            : []
        );
      } else {
        setSimilarMeds([]);
      }
    } catch (err) {
      console.error("Error fetching medicine:", err);
      setSimilarMeds([]);
    } finally {
      setLoading(false);
    }
  };

  // ✍️ Suggestions as user types
  const handleInputChange = async (text) => {
    setMedicineName(text);
    if (!text.trim()) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/suggestions?q=${text}`);
      const json = await res.json();
      setSuggestions(Array.isArray(json) ? json : []);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionPress = (item) => {
    if (!item) return;
    setMedicineName(item.name || "");
    setSuggestions([]);
    setSearchResult(item);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Medical Enquiry</Text>
      <Text style={[styles.label, { color: colors.label }]}>Medicine Name:</Text>

      <View style={{ zIndex: 10 }}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.label }]}
          value={medicineName}
          placeholder="Enter medicine name"
          placeholderTextColor={colors.placeholder}
          onChangeText={handleInputChange}
        />

        {medicineName.length > 0 && suggestions.length > 0 && (
          <View style={[styles.suggestionBox, { backgroundColor: colors.card, borderColor: colors.label }]}>
            {loading ? (
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
                    <Text style={[styles.suggestionItem, { color: colors.text }]}>
                      {item.name} {item.price ? `- ₹${item.price}` : ""}
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
        <Text style={styles.buttonText}>Search</Text>
      </TouchableOpacity>

      {searchResult && (
        <MedicineCard
          data={searchResult}
          onPress={() => setModalVisible(true)}
          colors={colors}
        />
      )}

      {similarMeds.length > 0 && (
        <View style={{ marginTop: 12 }}>
          <Text style={[styles.usesTitle, { marginBottom: 8, color: colors.text }]}>Similar Medicines</Text>
          <FlatList
            data={similarMeds.filter((med) => med && med.name)}
            keyExtractor={(item, idx) => item._id || idx.toString()}
            renderItem={({ item }) => (
              <MedicineCard
                data={item}
                onPress={() => {
                  setSearchResult(item);
                  setModalVisible(true);
                }}
                colors={colors}
              />
            )}
          />
        </View>
      )}

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
              <Text style={[styles.modalTitle, { color: colors.text }]}>{searchResult?.name || "N/A"}</Text>
              <Text><Text style={[styles.fieldLabel, { color: colors.text }]}>Manufacturer: </Text>{searchResult?.manufacturer_name || "N/A"}</Text>
              <Text><Text style={[styles.fieldLabel, { color: colors.text }]}>Price: </Text>₹ {searchResult?.price || "N/A"}</Text>
              <Text><Text style={[styles.fieldLabel, { color: colors.text }]}>Type: </Text>{searchResult?.type || "N/A"}</Text>
              <Text><Text style={[styles.fieldLabel, { color: colors.text }]}>Packaging: </Text>{searchResult?.pack_size_label || "N/A"}</Text>
              <Text><Text style={[styles.fieldLabel, { color: colors.text }]}>Composition: </Text>{searchResult?.short_composition1 || ""} {searchResult?.short_composition2 || ""}</Text>
              <Text><Text style={[styles.fieldLabel, { color: colors.text }]}>Side Effects: </Text>{searchResult?.Consolidated_Side_Effects || "N/A"}</Text>

              <Text style={[styles.usesTitle, { color: colors.text }]}>Uses:</Text>
              {["use0","use1","use2","use3","use4"].map((key, idx) =>
                searchResult?.[key] ? <Text key={idx} style={[styles.useItem, { color: colors.text }]}>• {searchResult[key]}</Text> : null
              )}

              <Text><Text style={[styles.fieldLabel, { color: colors.text }]}>Habit Forming: </Text>{searchResult?.["Habit Forming"] || "N/A"}</Text>
              <Text><Text style={[styles.fieldLabel, { color: colors.text }]}>Therapeutic Class: </Text>{searchResult?.["Therapeutic Class"] || "N/A"}</Text>
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
    </ScrollView>
  );
}

/* Medicine Card */
function MedicineCard({ data, onPress, colors }) {
  if (!data) return null;
  return (
    <View style={[styles.resultBox, { backgroundColor: colors.card }]}>
      <TouchableOpacity onLongPress={onPress}>
        <View style={styles.resultHeader}>
          <Text style={[styles.resultTitle, { color: colors.text }]}>{data.name || "N/A"}</Text>
          <Text style={[styles.price, { color: colors.price }]}>₹ {data.price || "N/A"}</Text>
        </View>
        <Text><Text style={[styles.fieldLabel, { color: colors.text }]}>Manufacturer: </Text>{data.manufacturer_name || "N/A"}</Text>
        <Text><Text style={[styles.fieldLabel, { color: colors.text }]}>Composition: </Text>{data.short_composition1 || ""}{data.short_composition2 ? `, ${data.short_composition2}` : ""}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  label: { fontSize: 16, fontWeight: "500", marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  suggestionBox: { maxHeight: 180, borderWidth: 1, borderRadius: 8, marginTop: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 6, position: "absolute", top: 50, left: 0, right: 0, zIndex: 20 },
  suggestionItemWrapper: { paddingHorizontal: 10, paddingVertical: 8 },
  suggestionItem: { fontSize: 15 },
  button: { paddingVertical: 12, borderRadius: 8, alignItems: "center", marginTop: 16, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 3 },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
  resultBox: { borderRadius: 10, padding: 16, marginTop: 12, borderWidth: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 5 },
  resultHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  resultTitle: { fontSize: 18, fontWeight: "700", flexShrink: 1 },
  price: { fontSize: 16, fontWeight: "600" },
  fieldLabel: { fontWeight: "700" },
  modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  modalCard: { padding: 20, borderRadius: 12, width: "85%", maxHeight: "80%", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 6 },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  usesTitle: { marginTop: 10, fontWeight: "700" },
  useItem: { fontSize: 14, marginVertical: 2 },
  closeButton: { marginTop: 16, paddingVertical: 10, borderRadius: 8, alignItems: "center" },
  closeText: { color: "#fff", fontWeight: "600" },
});
