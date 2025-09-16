import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
} from "react-native";
import { ThemedText } from "./themed-text";
import rawData from "../data.json";

const data = Array.isArray(rawData) ? rawData : [rawData];

export default function Med() {
  const [medicineName, setMedicineName] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSearch = () => {
    if (medicineName.trim() === "") return;

    // find medicine by name (case-insensitive)
    const found = data.find(
      (item) =>
        item.medicine_name.toLowerCase() === medicineName.trim().toLowerCase()
    );

    setSearchResult(found || null);
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Medical Enquiry</ThemedText>

      <ThemedText style={styles.label}>Medicine Name:</ThemedText>

      <TextInput
        style={styles.input}
        value={medicineName}
        placeholder="Enter medicine name"
        placeholderTextColor="#94A3B8"
        onChangeText={(text) => setMedicineName(text)}
      />

      <TouchableOpacity style={styles.button} onPress={handleSearch}>
        <Text style={styles.buttonText}>Search</Text>
      </TouchableOpacity>

      {searchResult ? (
        <View style={styles.resultBox}>
          <TouchableOpacity onLongPress={() => setModalVisible(true)}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>
                {searchResult.medicine_name}
              </Text>
              <Text style={styles.price}>₹ {searchResult.price}</Text>
            </View>
          </TouchableOpacity>

          <ThemedText style={styles.subHeader}>Similar Medicines:</ThemedText>
          <FlatList
            data={searchResult.substitutes}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Text style={styles.substitute}>{item}</Text>
            )}
          />
        </View>
      ) : (
        medicineName.length > 0 && (
          <Text style={styles.noResult}>No medicine found</Text>
        )
      )}

      {/* Modal for extra details */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{searchResult?.medicine_name}</Text>
            <Text>Manufacturer: {searchResult?.manufacturer}</Text>
            <Text>Type: {searchResult?.type}</Text>
            <Text>Packaging: {searchResult?.packaging}</Text>
            <Text>
              Composition:{" "}
              {searchResult?.composition
                .map((c) => `${c.name} (${c.strength})`)
                .join(", ")}
            </Text>
            <Text>Side Effects: {searchResult?.side_effects.join(", ")}</Text>
            <Text>Uses: {searchResult?.uses.join(", ")}</Text>
            <Text>Habit Forming: {searchResult?.habit_forming}</Text>
            <Text>Therapeutic Class: {searchResult?.therapeutic_class}</Text>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    margin: 5,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    color: "#1E293B",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#334155",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#1E293B",
    backgroundColor: "white",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  resultBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    flexShrink: 1, // prevents text cutoff
  },
  price: {
    fontSize: 16,
    fontWeight: "600",
    color: "#16A34A",
  },
  subHeader: {
    marginTop: 10,
    fontWeight: "600",
    color: "#334155",
  },
  substitute: {
    fontSize: 14,
    marginVertical: 2,
    color: "#475569",
    fontStyle: "italic",
  },
  noResult: {
    marginTop: 12,
    color: "red",
    fontStyle: "italic",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "85%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#1E293B",
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 10,
    backgroundColor: "#2563EB",
    borderRadius: 8,
    alignItems: "center",
  },
  closeText: {
    color: "#fff",
    fontWeight: "600",
  },
});
