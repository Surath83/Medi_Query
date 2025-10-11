import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  useColorScheme,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { BlurView } from "expo-blur";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Profile_Card from "@/components/profile_card";

export default function Profile({ name }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [user, setUser] = useState({
    name: name || "John",
    age: 25,
    height: 160,
    weight: 60,
    gender: "prefer not to say",
  });

  const [editModalVisible, setEditModalVisible] = useState(false);

  const genderOptions = ["male", "female", "prefer not to say"];

  // Load stored profile
  useEffect(() => {
    (async () => {
      try {
        const savedUser = await AsyncStorage.getItem("userProfile");
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (err) {
        console.error("Error loading user profile:", err);
      }
    })();
  }, []);

  // Save profile changes
  const saveProfile = async () => {
    try {
      await AsyncStorage.setItem("userProfile", JSON.stringify(user));
      setEditModalVisible(false);
      Alert.alert("Success", "Profile saved successfully!");
    } catch (err) {
      console.error("Error saving user profile:", err);
      Alert.alert("Error", "Could not save profile. Try again.");
    }
  };

  const handleChange = (key, value) =>
    setUser((prev) => ({ ...prev, [key]: value }));

  return (
    <KeyboardAvoidingView
      style={[styles.container, isDark ? styles.darkBg : styles.lightBg]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text
          style={[
            styles.header,
            isDark ? styles.headerDark : styles.headerLight,
          ]}
        >
          {user.name}&#39;s Profile
        </Text>

        <Profile_Card {...user} visible={true} />

        {/* Edit Button */}
        <Pressable
          style={[styles.editButton, isDark && styles.editButtonDark]}
          onPress={() => setEditModalVisible(true)}
        >
          <Text
            style={[styles.editButtonText, isDark && styles.editButtonTextDark]}
          >
            Edit Profile
          </Text>
        </Pressable>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="fade"
        transparent
        statusBarTranslucent
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <BlurView
              intensity={80}
              tint={isDark ? "dark" : "light"}
              style={styles.blur}
            />

            <View
              style={[styles.modalContent, isDark && styles.modalContentDark]}
            >
              <Text
                style={[styles.modalTitle, isDark && styles.modalTitleDark]}
              >
                Edit Profile
              </Text>

              {/* Name */}
              <Text style={[styles.label, isDark && styles.labelDark]}>
                Name
              </Text>
              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                value={user.name}
                editable={false}
              />

              {/* Age */}
              <Text style={[styles.label, isDark && styles.labelDark]}>
                Age
              </Text>
              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                value={String(user.age)}
                keyboardType="numeric"
                onChangeText={(text) =>
                  handleChange("age", parseInt(text) || 0)
                }
              />

              {/* Height */}
              <Text style={[styles.label, isDark && styles.labelDark]}>
                Height (cm)
              </Text>
              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                value={String(user.height)}
                keyboardType="numeric"
                onChangeText={(text) =>
                  handleChange("height", parseFloat(text) || 0)
                }
              />

              {/* Weight */}
              <Text style={[styles.label, isDark && styles.labelDark]}>
                Weight (kg)
              </Text>
              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                value={String(user.weight)}
                keyboardType="numeric"
                onChangeText={(text) =>
                  handleChange("weight", parseFloat(text) || 0)
                }
              />

              {/* Gender */}
              <Text style={[styles.label, isDark && styles.labelDark]}>
                Gender
              </Text>
              <View style={styles.genderContainer}>
                {genderOptions.map((option) => {
                  const selected = user.gender === option;
                  return (
                    <Pressable
                      key={option}
                      style={[
                        styles.genderButton,
                        isDark && styles.genderButtonDark,
                        selected &&
                          (isDark
                            ? styles.genderSelectedDark
                            : styles.genderSelected),
                      ]}
                      onPress={() => handleChange("gender", option)}
                    >
                      <Text
                        style={[
                          styles.genderText,
                          isDark && styles.genderTextDark,
                          selected && styles.genderTextSelected,
                        ]}
                      >
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Save / Cancel */}
              <Pressable
                style={[styles.saveButton, isDark && styles.saveButtonDark]}
                onPress={saveProfile}
              >
                <Text
                  style={[
                    styles.saveButtonText,
                    isDark && styles.saveButtonTextDark,
                  ]}
                >
                  Save Changes
                </Text>
              </Pressable>

              <Pressable
                style={[styles.cancelButton, isDark && styles.cancelButtonDark]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text
                  style={[
                    styles.cancelButtonText,
                    isDark && styles.cancelButtonTextDark,
                  ]}
                >
                  Cancel
                </Text>
              </Pressable>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  darkBg: { backgroundColor: "#121212" },
  lightBg: { backgroundColor: "#F0FDF4" },
  header: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "left",
    marginTop: 20,
    paddingBottom: 0,
    paddingHorizontal: 0,
  },
  headerLight: {
    color: "#1F2937", // dark gray for light mode
  },
  headerDark: {
    color: "#F3F4F6", // light gray/white for dark mode
  },
  editButton: {
    alignSelf: "flex-end", // pushes it to the right
    minWidth: 120, // set minimum width
    maxWidth: 160, // set maximum width
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#0EA5A4",
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
    marginRight: 16, // add spacing from right edge
  },
  editButtonDark: {
    backgroundColor: "#0EA5A4",
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  editButtonTextDark: { color: "#fff" },

  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center" },
  blur: { ...StyleSheet.absoluteFillObject },

  modalContent: {
    width: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    elevation: 10,
  },
  modalContentDark: { backgroundColor: "#1E293B" },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
    color: "#1F2937",
  },
  modalTitleDark: { color: "#E5E7EB" },

  label: { marginBottom: 6, fontWeight: "600", color: "#1F2937" },
  labelDark: { color: "#A1A1AA" },

  input: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    color: "#1F2937",
  },
  inputDark: {
    backgroundColor: "#2A2A2A",
    borderColor: "#334155",
    color: "#E5E7EB",
  },

  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
  },
  genderButtonDark: { borderColor: "#475569" },
  genderSelected: { backgroundColor: "#38BDF8", borderColor: "#0EA5A4" },
  genderSelectedDark: { backgroundColor: "#0EA5A4", borderColor: "#0EA5A4" },
  genderText: { color: "#1F2937", fontWeight: "600" },
  genderTextDark: { color: "#E5E7EB", fontWeight: "600" },
  genderTextSelected: { color: "#fff" },

  saveButton: {
    backgroundColor: "#38BDF8",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonDark: { backgroundColor: "#0EA5A4" },
  saveButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  saveButtonTextDark: { color: "#fff" },

  cancelButton: {
    backgroundColor: "#EF4444",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  cancelButtonDark: { backgroundColor: "#F87171" },
  cancelButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  cancelButtonTextDark: { color: "#fff" },
});
