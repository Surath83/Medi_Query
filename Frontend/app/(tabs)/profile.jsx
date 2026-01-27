import React, { useState, useEffect, useCallback, useRef } from "react";
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

const PROFILE_KEY = "USER_PROFILE_V1";
const genderOptions = ["male", "female", "other"];

const DEFAULT_PROFILE = {
  name: "john",
  age: 25,
  height: 160,
  weight: 70,
  gender: "other",
};

export default function Profile() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const dynamicStyles = styles(isDark);
  const [profileData, setProfileData] = useState(DEFAULT_PROFILE);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const saved = await AsyncStorage.getItem(PROFILE_KEY);
        if (saved) setProfileData(JSON.parse(saved));
      } catch (err) {
        console.error("Error loading user profile:", err);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }

    const saveProfile = async () => {
      try {
        await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profileData));
      } catch (err) {
        console.error("Error saving profile:", err);
      }
    };

    saveProfile();
  }, [profileData]);

  const handleChange = useCallback((field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const saveProfile = () => {
    setEditModalVisible(false);
    Alert.alert("Success", "Profile saved successfully!");
  };

  return (
    <View style={[dynamicStyles.container]}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: 16,
        }}
      >
        <Text style={dynamicStyles.header}>Profile</Text>

        <Profile_Card {...profileData} visible />

        <Pressable
          style={[dynamicStyles.button, dynamicStyles.editButton]}
          onPress={() => setEditModalVisible(true)}
        >
          <Text style={dynamicStyles.buttonText}>Edit Profile</Text>
        </Pressable>
      </ScrollView>

      {/* Edit Modal */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <Modal
          visible={editModalVisible}
          animationType="fade"
          transparent
          statusBarTranslucent
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={dynamicStyles.modalOverlay}>
              <BlurView
                intensity={80}
                tint={isDark ? "dark" : "light"}
                style={dynamicStyles.blur}
              />

              <View style={dynamicStyles.modalContent}>
                <Text style={dynamicStyles.modalTitle}>Edit Profile</Text>

                <Text style={dynamicStyles.label}>Name</Text>
                <TextInput
                  style={dynamicStyles.input}
                  value={profileData.name}
                  onChangeText={(t) => handleChange("name", t)}
                />

                <Text style={dynamicStyles.label}>Age</Text>
                <TextInput
                  style={dynamicStyles.input}
                  value={String(profileData.age)}
                  keyboardType="numeric"
                  onChangeText={(t) => handleChange("age", parseInt(t) || 0)}
                />

                <Text style={dynamicStyles.label}>Height (cm)</Text>
                <TextInput
                  style={dynamicStyles.input}
                  value={String(profileData.height)}
                  keyboardType="numeric"
                  onChangeText={(t) =>
                    handleChange("height", parseFloat(t) || 0)
                  }
                />

                <Text style={dynamicStyles.label}>Weight (kg)</Text>
                <TextInput
                  style={dynamicStyles.input}
                  value={String(profileData.weight)}
                  keyboardType="numeric"
                  onChangeText={(t) =>
                    handleChange("weight", parseFloat(t) || 0)
                  }
                />

                <Text style={dynamicStyles.label}>Gender</Text>
                <View style={dynamicStyles.genderContainer}>
                  {genderOptions.map((option) => {
                    const selected = profileData.gender === option;
                    return (
                      <Pressable
                        key={option}
                        style={[
                          dynamicStyles.genderButton,
                          selected && dynamicStyles.genderSelected,
                        ]}
                        onPress={() => handleChange("gender", option)}
                      >
                        <Text
                          style={[
                            dynamicStyles.genderText,
                            selected && dynamicStyles.genderTextSelected,
                          ]}
                        >
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Pressable
                  style={[dynamicStyles.button, dynamicStyles.saveButton]}
                  onPress={saveProfile}
                >
                  <Text style={dynamicStyles.buttonText}>Save Changes</Text>
                </Pressable>

                <Pressable
                  style={[dynamicStyles.button, dynamicStyles.cancelButton]}
                  onPress={() => setEditModalVisible(false)}
                >
                  <Text style={dynamicStyles.buttonText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = (isDark) => {
  const colors = {
    background: isDark ? "#121212" : "#F0FDF4",
    text: isDark ? "#E5E7EB" : "#1F2937",
    secondaryText: isDark ? "#A1A1AA" : "#4B5563",
    inputBg: isDark ? "#2A2A2A" : "#F1F5F9",
    inputBorder: isDark ? "#334155" : "#D1D5DB",
    buttonPrimary: "#0EA5A4",
    buttonSecondary: isDark ? "#0EA5A4" : "#38BDF8",
    buttonDanger: isDark ? "#F87171" : "#EF4444",
    modalBg: isDark ? "#1E293B" : "#FFFFFF",
    genderSelected: isDark ? "#0EA5A4" : "#38BDF8",
  };

  return StyleSheet.create({
    container: { paddingTop: 4, paddingBottom: 10},
    
    header: {
      fontSize: 20,
      fontWeight: "700",
      marginVertical: 16,
      color: colors.text,
    },
    button: {
      paddingVertical: 9,
      paddingHorizontal: 16,
      borderRadius: 12,
      alignItems: "center",
      marginVertical: 6,
    },
    buttonText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 16,
    },
    editButton: {
      backgroundColor: colors.buttonPrimary,
      alignSelf: "center",
      minWidth: 120,
      maxWidth: 160,
    },
    saveButton: {
      backgroundColor: colors.buttonSecondary,
    },
    cancelButton: {
      backgroundColor: colors.buttonDanger,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    blur: {
      ...StyleSheet.absoluteFillObject,
    },
    modalContent: {
      width: "90%",
      backgroundColor: colors.modalBg,
      borderRadius: 20,
      paddingHorizontal: 20,
      paddingVertical: 14,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "700",
      marginBottom: 16,
      textAlign: "center",
      color: colors.text,
    },
    label: {
      marginBottom: 6,
      fontWeight: "600",
      color: colors.secondaryText,
    },
    input: {
      backgroundColor: colors.inputBg,
      borderColor: colors.inputBorder,
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 6,
      marginBottom: 6,
      color: colors.text,
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
      borderColor: colors.inputBorder,
      alignItems: "center",
    },
    genderSelected: {
      backgroundColor: colors.genderSelected,
      borderColor: colors.genderSelected,
    },
    genderText: {
      color: colors.text,
      fontWeight: "600",
    },
    genderTextSelected: {
      color: "#fff",
    },
  });
};
