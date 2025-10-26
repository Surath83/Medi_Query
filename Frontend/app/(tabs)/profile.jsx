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
import { useRouter } from "expo-router";
// import { useUser, useAuth } from "@clerk/clerk-expo";

export default function Profile() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const dynamicStyles = styles(isDark);
  const router = useRouter();
  // const { user } = useUser();
  // const { signOut } = useAuth();

  const [profileData, setProfileData] = useState({
    name: "John",
    age: 25,
    height: 160,
    weight: 60,
    gender: "prefer not to say",
  });

  const [editModalVisible, setEditModalVisible] = useState(false);

  const genderOptions = ["male", "female", "prefer not to say"];

  // useEffect(() => {
  //   if (user) {
  //     setProfileData((prevData) => ({ ...prevData, name: user.firstName || "John" }));
  //   }
  // }, [user]);

  // Load stored profile
  useEffect(() => {
    (async () => {
      try {
        const savedUser = await AsyncStorage.getItem("userProfile");
        if (savedUser) setProfileData(JSON.parse(savedUser));
      } catch (err) {
        console.error("Error loading user profile:", err);
      }
    })();
  }, []);

  // Save profile changes
  const saveProfile = async () => {
    try {
      await AsyncStorage.setItem("userProfile", JSON.stringify(profileData));
      setEditModalVisible(false);
      Alert.alert("Success", "Profile saved successfully!");
    } catch (err) {
      console.error("Error saving user profile:", err);
      Alert.alert("Error", "Could not save profile. Try again.");
    }
  };

  // const handleLogout = async () => {
  //   await signOut();
  // };

  const handleChange = (field, value) => {
    setProfileData((prevData) => ({ ...prevData, [field]: value }));
  };

  return (
    <KeyboardAvoidingView
      style={dynamicStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={{ flexGrow: 1, padding: 16, paddingBottom: 60 }} >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16 }}>
        
          <>
            <Text style={dynamicStyles.header}>{profileData.name}&#39;s Profile</Text>

            <Profile_Card {...profileData} visible={true} />

            {/* Edit Button */}
            <Pressable
              style={[dynamicStyles.button, dynamicStyles.editButton]}
              onPress={() => setEditModalVisible(true)}
            >
              <Text style={dynamicStyles.buttonText}>Edit Profile</Text>
            </Pressable>

            {/* Logout Button */}
            {/* <Pressable
              style={[dynamicStyles.button, dynamicStyles.logoutButton]}
              onPress={handleLogout}
            >
              <Text style={dynamicStyles.buttonText}>Logout</Text>
            </Pressable> */}
          </>
        
      </ScrollView>

      {/* Edit Modal */}
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

              {/* Name */}
              <Text style={dynamicStyles.label}>Name</Text>
              <TextInput
                style={dynamicStyles.input}
                value={profileData.name}
                editable={false}
              />

              {/* Age */}
              <Text style={dynamicStyles.label}>Age</Text>
              <TextInput
                style={dynamicStyles.input}
                value={String(profileData.age)}
                keyboardType="numeric"
                onChangeText={(text) =>
                  handleChange("age", parseInt(text) || 0)
                }
              />

              {/* Height */}
              <Text style={dynamicStyles.label}>Height (cm)</Text>
              <TextInput
                style={dynamicStyles.input}
                value={String(profileData.height)}
                keyboardType="numeric"
                onChangeText={(text) =>
                  handleChange("height", parseFloat(text) || 0)
                }
              />

              {/* Weight */}
              <Text style={dynamicStyles.label}>Weight (kg)</Text>
              <TextInput
                style={dynamicStyles.input}
                value={String(profileData.weight)}
                keyboardType="numeric"
                onChangeText={(text) =>
                  handleChange("weight", parseFloat(text) || 0)
                }
              />

              {/* Gender */}
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

              {/* Save / Cancel */}
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
      </View>
    </KeyboardAvoidingView>
  );
}

// Theme-based dynamic styles
const baseColors = {
  light: {
    background: "#F0FDF4",
    text: "#1F2937",
    secondaryText: "#4B5563",
    inputBg: "#F1F5F9",
    inputBorder: "#D1D5DB",
    buttonPrimary: "#0EA5A4",
    buttonSecondary: "#38BDF8",
    buttonDanger: "#EF4444",
    modalBg: "#FFFFFF",
    genderSelected: "#38BDF8",
  },
  dark: {
    background: "#121212",
    text: "#E5E7EB",
    secondaryText: "#A1A1AA",
    inputBg: "#2A2A2A",
    inputBorder: "#334155",
    buttonPrimary: "#0EA5A4",
    buttonSecondary: "#0EA5A4",
    buttonDanger: "#F87171",
    modalBg: "#1E293B",
    genderSelected: "#0EA5A4",
  },
};

const styles = (isDark) => {
  const colors = isDark ? baseColors.dark : baseColors.light;

  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { fontSize: 20, fontWeight: "700", marginVertical: 16, color: colors.text },

    // Buttons
    button: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      alignItems: "center",
      marginVertical: 6,
    },
    buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
    editButton: { backgroundColor: colors.buttonPrimary, alignSelf: "center", minWidth: 120, maxWidth: 160 },
    loginButton: { backgroundColor: colors.buttonPrimary, minWidth: 120, maxWidth: 160 },
    logoutButton: { backgroundColor: colors.buttonDanger, alignSelf: "center", minWidth: 120, maxWidth: 160 },
    saveButton: { backgroundColor: colors.buttonSecondary },
    cancelButton: { backgroundColor: colors.buttonDanger },

    // Modal
    modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center" },
    blur: { ...StyleSheet.absoluteFillObject },
    modalContent: { width: "90%", backgroundColor: colors.modalBg, borderRadius: 20, padding: 20, elevation: 10 },
    modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 16, textAlign: "center", color: colors.text },

    // Inputs
    label: { marginBottom: 6, fontWeight: "600", color: colors.secondaryText },
    input: {
      backgroundColor: colors.inputBg,
      borderColor: colors.inputBorder,
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 12,
      color: colors.text,
    },

    // Gender
    genderContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
    genderButton: {
      flex: 1,
      paddingVertical: 10,
      marginHorizontal: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      alignItems: "center",
    },
    genderSelected: { backgroundColor: colors.genderSelected, borderColor: colors.genderSelected },
    genderText: { color: colors.text, fontWeight: "600" },
    genderTextSelected: { color: "#fff" },

    // Logged out
    loggedOutContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    loggedOutText: { fontSize: 18, marginBottom: 20, textAlign: "center", color: colors.text },
  });
};
