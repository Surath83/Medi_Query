import React, {
  useState,
  useCallback,
} from "react";

import {
  View,
  ScrollView,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";

import { BlurView } from "expo-blur";
import AsyncStorage from "@react-native-async-storage/async-storage";
<<<<<<< Updated upstream
import Profile_Card from "@/components/profile_card";
=======
import * as SecureStore from "expo-secure-store";
import { router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
>>>>>>> Stashed changes

import Profile_Card from "@/components/profile_card";
import { useTheme } from "@/constants/theme";
import { SPACING } from "@/constants/spacing";
import { useTranslation } from "@/constants/i18n";

/*
  IMPORTANT:
  Profile data is now stored separately for every user.

  Example:
    USER_PROFILE_V1_671234abcd
    USER_PROFILE_V1_672345bcde

  This prevents User 2 from seeing User 1's profile.
*/

const PROFILE_KEY_PREFIX = "USER_PROFILE_V1_";

const genderOptions = [
  "male",
  "female",
  "other",
];

const DEFAULT_PROFILE = {
  name: "john",
  age: 25,
  height: 160,
  weight: 70,
  gender: "other",
};

export default function Profile() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

<<<<<<< Updated upstream
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const saved = await AsyncStorage.getItem(PROFILE_KEY);
        if (saved) setProfileData(JSON.parse(saved));
      } catch (err) {
        console.error("Error loading user profile:", err);
      }
    };
=======
  const dynamicStyles = styles(
    colors,
    insets
  );

  const [profileData, setProfileData] =
    useState(DEFAULT_PROFILE);

  const [editModalVisible, setEditModalVisible] =
    useState(false);

  const [currentUser, setCurrentUser] =
    useState(null);

  const [profileStorageKey, setProfileStorageKey] =
    useState(null);
>>>>>>> Stashed changes

  const [isLoadingProfile, setIsLoadingProfile] =
    useState(true);

  /*
  ============================================================
  LOAD PROFILE FOR CURRENT LOGGED-IN USER
  ============================================================
  */

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadUserProfile = async () => {
        try {
          setIsLoadingProfile(true);

          /*
            Reset state immediately.

            This is important because Profile can remain mounted
            while authentication changes. Without resetting here,
            the previous user's React state can remain visible.
          */
          setProfileData(DEFAULT_PROFILE);
          setCurrentUser(null);
          setProfileStorageKey(null);

          /*
          --------------------------------------------------------
          LOAD LOGGED-IN USER
          --------------------------------------------------------
          */

          const userData =
            await AsyncStorage.getItem(
              "loggedUser"
            );

          if (!userData) {
            if (isActive) {
              setIsLoadingProfile(false);
            }

            return;
          }

          const user = JSON.parse(userData);

          if (!user || !user.id) {
            console.warn(
              "Logged user does not contain a valid user ID."
            );

            if (isActive) {
              setIsLoadingProfile(false);
            }

            return;
          }

          /*
          --------------------------------------------------------
          CREATE USER-SPECIFIC PROFILE KEY
          --------------------------------------------------------

          Example:

          User 1:
          USER_PROFILE_V1_64abc123

          User 2:
          USER_PROFILE_V1_64def456
          */

          const userId = String(user.id);

          const userProfileKey =
            `${PROFILE_KEY_PREFIX}${userId}`;

          /*
          --------------------------------------------------------
          LOAD USER-SPECIFIC PROFILE
          --------------------------------------------------------
          */

          const savedProfile =
            await AsyncStorage.getItem(
              userProfileKey
            );

          let loadedProfile = {
            ...DEFAULT_PROFILE,
            name: user.username || "",
          };

          if (savedProfile) {
            try {
              const parsed =
                JSON.parse(savedProfile);

              loadedProfile = {
                ...loadedProfile,
                ...parsed,

                /*
                  Always keep the logged-in username
                  as the fallback identity.
                */
                name:
                  parsed.name ||
                  user.username ||
                  "",
              };
            } catch (parseError) {
              console.error(
                "Error parsing saved profile:",
                parseError
              );
            }
          }

          if (isActive) {
            setCurrentUser(user);
            setProfileStorageKey(
              userProfileKey
            );
            setProfileData(loadedProfile);
          }
        } catch (error) {
          console.error(
            "Error loading user profile:",
            error
          );
        } finally {
          if (isActive) {
            setIsLoadingProfile(false);
          }
        }
      };

      loadUserProfile();

      return () => {
        isActive = false;
      };
    }, [])
  );

  /*
  ============================================================
  SAVE PROFILE AUTOMATICALLY
  ============================================================
  */

  /*
    Notice that we DO NOT use a global PROFILE_KEY anymore.

    The profile is saved using:

      profileStorageKey

    which belongs to the currently logged-in user.
  */

  const handleChange = useCallback(
    (field, value) => {
      setProfileData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  /*
  ============================================================
  SAVE PROFILE
  ============================================================
  */

  const saveProfile = async () => {
    Keyboard.dismiss();

    if (!currentUser || !profileStorageKey) {
      Alert.alert(
        t("common.error"),
        "Unable to identify the logged-in user."
      );

      return;
    }

<<<<<<< Updated upstream
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

=======
    try {
      /*
        Save only to the current user's profile key.
      */

      await AsyncStorage.setItem(
        profileStorageKey,
        JSON.stringify(profileData)
      );

      setEditModalVisible(false);

      Alert.alert(
        t("profile.updatedTitle"),
        t("profile.updatedMessage")
      );
    } catch (error) {
      console.error(
        "Error saving profile:",
        error
      );

      Alert.alert(
        t("common.error"),
        "Unable to save your profile."
      );
    }
  };

  /*
  ============================================================
  LOGOUT
  ============================================================
  */

  const handleLogout = async () => {
    try {
      /*
        Remove authentication information.

        IMPORTANT:
        We intentionally DO NOT remove:

          USER_PROFILE_V1_<userId>

        because that profile belongs to this user and can be
        loaded again when the same user logs back in.
      */

      await SecureStore.deleteItemAsync(
        "token"
      );

      await AsyncStorage.removeItem(
        "loggedUser"
      );

      /*
        Clear local React state before navigating away.
      */

      setCurrentUser(null);
      setProfileStorageKey(null);
      setProfileData(DEFAULT_PROFILE);
      setEditModalVisible(false);

      router.replace("/login");
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );

      Alert.alert(
        t("common.error"),
        t("profile.logoutError")
      );
    }
  };

  /*
  ============================================================
  UI
  ============================================================
  */

>>>>>>> Stashed changes
  return (
    <View
      style={dynamicStyles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          dynamicStyles.scrollContent
        }
      >
        {/* ======================================================
            HEADER
        ====================================================== */}

        <View
          style={
            dynamicStyles.headerContainer
          }
        >
          <Text
            style={
              dynamicStyles.header
            }
          >
            {t("profile.title")}
          </Text>

          <Text
            style={
              dynamicStyles.subtitle
            }
          >
            {t("profile.subtitle")}
          </Text>
        </View>

        {/* ======================================================
            PROFILE CARD
        ====================================================== */}

        <View
          style={
            dynamicStyles.cardWrapper
          }
        >
<<<<<<< Updated upstream
          <Text style={dynamicStyles.buttonText}>Edit Profile</Text>
        </Pressable>
=======
          <Profile_Card
            {...profileData}
            visible={!isLoadingProfile}
          />
        </View>

        {/* ======================================================
            ACTION BUTTONS
        ====================================================== */}

        <View
          style={
            dynamicStyles.actionsContainer
          }
        >
          {/* EDIT PROFILE */}

          <Pressable
            disabled={
              isLoadingProfile ||
              !currentUser
            }
            style={({ pressed }) => [
              dynamicStyles.primaryButton,

              (pressed ||
                isLoadingProfile ||
                !currentUser) &&
                dynamicStyles.buttonPressed,

              (isLoadingProfile ||
                !currentUser) &&
                dynamicStyles.disabledButton,
            ]}
            onPress={() =>
              setEditModalVisible(true)
            }
          >
            <Text
              style={
                dynamicStyles.primaryButtonText
              }
            >
              {t("profile.editProfile")}
            </Text>
          </Pressable>

          {/* LOGOUT */}

          <Pressable
            style={({ pressed }) => [
              dynamicStyles.logoutButton,

              pressed &&
                dynamicStyles.buttonPressed,
            ]}
            onPress={handleLogout}
          >
            <Text
              style={
                dynamicStyles.logoutButtonText
              }
            >
              {t("profile.logout")}
            </Text>
          </Pressable>
        </View>

        {/* ======================================================
            FOOTER
        ====================================================== */}

        <Text
          style={
            dynamicStyles.footerText
          }
        >
          {t("profile.localStorageInfo")}
        </Text>
>>>>>>> Stashed changes
      </ScrollView>

      {/* ==========================================================
          EDIT PROFILE MODAL
      ========================================================== */}

      <Modal
        visible={editModalVisible}
        animationType="fade"
        transparent
        statusBarTranslucent
        onRequestClose={() =>
          setEditModalVisible(false)
        }
      >
        <KeyboardAvoidingView
          style={
            dynamicStyles.keyboardContainer
          }
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >
          <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
          >
            <View
              style={
                dynamicStyles.modalOverlay
              }
            >
              {/* =================================================
                  BACKGROUND BLUR
              ================================================= */}

              <BlurView
                intensity={
                  isDark ? 90 : 75
                }
                tint={
                  isDark
                    ? "dark"
                    : "light"
                }
                style={
                  dynamicStyles.blur
                }
              />

              {/* =================================================
                  MODAL
              ================================================= */}

              <TouchableWithoutFeedback>
                <View
                  style={
                    dynamicStyles.modalContent
                  }
                >
                  {/* ==================================================
                      MODAL HEADER
                  ================================================== */}

                  <View
                    style={
                      dynamicStyles.modalHeader
                    }
                  >
                    <View>
                      <Text
                        style={
                          dynamicStyles.modalTitle
                        }
                      >
                        {t(
                          "profile.editProfile"
                        )}
                      </Text>

                      <Text
                        style={
                          dynamicStyles.modalSubtitle
                        }
                      >
                        {t(
                          "profile.updateInformation"
                        )}
                      </Text>
                    </View>

                    <Pressable
                      style={
                        dynamicStyles.closeButton
                      }
                      onPress={() =>
                        setEditModalVisible(
                          false
                        )
                      }
                    >
                      <Text
                        style={
                          dynamicStyles.closeButtonText
                        }
                      >
                        ×
                      </Text>
                    </Pressable>
                  </View>

                  {/* ==================================================
                      NAME
                  ================================================== */}

                  <Text
                    style={
                      dynamicStyles.label
                    }
                  >
                    {t("profile.name")}
                  </Text>

                  <TextInput
                    style={
                      dynamicStyles.input
                    }
                    value={
                      profileData.name
                    }
                    placeholder={t(
                      "profile.enterName"
                    )}
                    placeholderTextColor={
                      colors.textLight
                    }
                    onChangeText={(text) =>
                      handleChange(
                        "name",
                        text
                      )
                    }
                    autoCapitalize="words"
                  />

                  {/* ==================================================
                      AGE
                  ================================================== */}

                  <Text
                    style={
                      dynamicStyles.label
                    }
                  >
                    {t("profile.age")}
                  </Text>

                  <TextInput
                    style={
                      dynamicStyles.input
                    }
                    value={String(
                      profileData.age
                    )}
                    placeholder={t(
                      "profile.age"
                    )}
                    placeholderTextColor={
                      colors.textLight
                    }
                    keyboardType="numeric"
                    onChangeText={(text) =>
                      handleChange(
                        "age",
                        parseInt(
                          text,
                          10
                        ) || 0
                      )
                    }
                  />

                  {/* ==================================================
                      HEIGHT
                  ================================================== */}

                  <Text
                    style={
                      dynamicStyles.label
                    }
                  >
                    {t("profile.height")}
                  </Text>

                  <View
                    style={
                      dynamicStyles.inputWithUnit
                    }
                  >
                    <TextInput
                      style={
                        dynamicStyles.unitInput
                      }
                      value={String(
                        profileData.height
                      )}
                      placeholder={t(
                        "profile.height"
                      )}
                      placeholderTextColor={
                        colors.textLight
                      }
                      keyboardType="numeric"
                      onChangeText={(text) =>
                        handleChange(
                          "height",
                          parseFloat(
                            text
                          ) || 0
                        )
                      }
                    />

                    <Text
                      style={
                        dynamicStyles.unitText
                      }
                    >
                      {t("profile.cm")}
                    </Text>
                  </View>

                  {/* ==================================================
                      WEIGHT
                  ================================================== */}

                  <Text
                    style={
                      dynamicStyles.label
                    }
                  >
                    {t("profile.weight")}
                  </Text>

                  <View
                    style={
                      dynamicStyles.inputWithUnit
                    }
                  >
                    <TextInput
                      style={
                        dynamicStyles.unitInput
                      }
                      value={String(
                        profileData.weight
                      )}
                      placeholder={t(
                        "profile.weight"
                      )}
                      placeholderTextColor={
                        colors.textLight
                      }
                      keyboardType="numeric"
                      onChangeText={(text) =>
                        handleChange(
                          "weight",
                          parseFloat(
                            text
                          ) || 0
                        )
                      }
                    />

                    <Text
                      style={
                        dynamicStyles.unitText
                      }
                    >
                      {t("profile.kg")}
                    </Text>
                  </View>

                  {/* ==================================================
                      GENDER
                  ================================================== */}

                  <Text
                    style={
                      dynamicStyles.label
                    }
                  >
                    {t("profile.gender")}
                  </Text>

                  <View
                    style={
                      dynamicStyles.genderContainer
                    }
                  >
                    {genderOptions.map(
                      (option) => {
                        const selected =
                          profileData.gender ===
                          option;

                        return (
                          <Pressable
                            key={option}
                            style={[
                              dynamicStyles.genderButton,

                              selected &&
                                dynamicStyles.genderSelected,
                            ]}
                            onPress={() =>
                              handleChange(
                                "gender",
                                option
                              )
                            }
                          >
                            <Text
                              style={[
                                dynamicStyles.genderText,

                                selected &&
                                  dynamicStyles.genderTextSelected,
                              ]}
                            >
                              {t(
                                `profile.genderOptions.${option}`
                              )}
                            </Text>
                          </Pressable>
                        );
                      }
                    )}
                  </View>

                  {/* ==================================================
                      MODAL ACTIONS
                  ================================================== */}

                  <View
                    style={
                      dynamicStyles.modalActions
                    }
                  >
                    {/* CANCEL */}

                    <Pressable
                      style={
                        dynamicStyles.cancelButton
                      }
                      onPress={() => {
                        Keyboard.dismiss();

                        setEditModalVisible(
                          false
                        );
                      }}
                    >
                      <Text
                        style={
                          dynamicStyles.cancelButtonText
                        }
                      >
                        {t(
                          "common.cancel"
                        )}
                      </Text>
                    </Pressable>

                    {/* SAVE */}

                    <Pressable
                      style={
                        dynamicStyles.saveButton
                      }
                      onPress={
                        saveProfile
                      }
                    >
                      <Text
                        style={
                          dynamicStyles.saveButtonText
                        }
                      >
                        {t(
                          "profile.saveChanges"
                        )}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

/* ================================================================
   STYLES
================================================================ */

<<<<<<< Updated upstream
  return StyleSheet.create({
    container: { paddingTop: 4, paddingBottom: 10},
    
=======
const styles = (
  colors,
  insets
) =>
  StyleSheet.create({
    /* ============================================================
       MAIN CONTAINER
    ============================================================ */

    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    scrollContent: {
      paddingHorizontal:
        SPACING.screenHorizontal,

      paddingTop: Math.max(
        SPACING.md,
        insets.top + SPACING.xs
      ),

      paddingBottom:
        insets.bottom +
        SPACING.screenVertical,
    },

    /* ============================================================
       HEADER
    ============================================================ */

    headerContainer: {
      marginBottom: SPACING.xl,
    },

>>>>>>> Stashed changes
    header: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.text,
    },

    subtitle: {
      marginTop: SPACING.xs,
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
    },

    /* ============================================================
       PROFILE CARD
    ============================================================ */

    cardWrapper: {
      backgroundColor: colors.card,

      borderRadius: 22,

      borderWidth: 1,

      borderColor: colors.border,

      padding: 14,

      shadowColor: colors.shadow,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      shadowOpacity: 0.08,

      shadowRadius: 12,

      elevation: 3,

      marginBottom:
        SPACING.mainBorder
          .marginVertical,
    },

    /* ============================================================
       ACTIONS
    ============================================================ */

    actionsContainer: {
      width: "100%",
      alignItems: "center",
      marginTop: SPACING.xs,
    },

    /* ============================================================
       EDIT PROFILE
    ============================================================ */

    primaryButton: {
      width: "100%",
      minHeight: 52,

      backgroundColor:
        colors.primary,

      borderRadius: 15,

      alignItems: "center",
      justifyContent: "center",

      marginBottom: SPACING.md,
    },

    primaryButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: "700",
    },

    disabledButton: {
      opacity: 0.5,
    },

    /* ============================================================
       LOGOUT
    ============================================================ */

    logoutButton: {
      width: "100%",
      minHeight: 50,

      backgroundColor: "transparent",

      borderWidth: 1,
      borderColor: colors.danger,

      borderRadius: 15,

      alignItems: "center",
      justifyContent: "center",
    },

    logoutButtonText: {
      color: colors.danger,
      fontSize: 15,
      fontWeight: "700",
    },

    buttonPressed: {
      opacity: 0.7,

      transform: [
        {
          scale: 0.985,
        },
      ],
    },

    /* ============================================================
       FOOTER
    ============================================================ */

    footerText: {
      textAlign: "center",

      marginTop: SPACING.xl,

      paddingHorizontal: SPACING.xl,

      fontSize: 12,

      lineHeight: 18,

      color: colors.textLight,
    },

    /* ============================================================
       MODAL
    ============================================================ */

    keyboardContainer: {
      flex: 1,
    },

    modalOverlay: {
      flex: 1,

      justifyContent: "center",

      alignItems: "center",

      paddingHorizontal: SPACING.lg,
    },

    blur: {
      ...StyleSheet.absoluteFillObject,
    },

    modalContent: {
      width: "100%",

      maxWidth: 480,

      backgroundColor: colors.surface,

      borderRadius: 24,

      paddingHorizontal: SPACING.xl,

      paddingTop: SPACING.xl,

      paddingBottom: SPACING.lg,

      borderWidth: 1,

      borderColor: colors.border,

      shadowColor: colors.shadow,

      shadowOffset: {
        width: 0,
        height: 10,
      },

      shadowOpacity: 0.2,

      shadowRadius: 25,

      elevation: 10,
    },

    /* ============================================================
       MODAL HEADER
    ============================================================ */

    modalHeader: {
      flexDirection: "row",

      alignItems: "flex-start",

      justifyContent:
        "space-between",

      marginBottom: SPACING.xl,
    },

    modalTitle: {
      fontSize: 22,

      fontWeight: "800",

      color: colors.text,
    },

    modalSubtitle: {
      marginTop: SPACING.xs,

      fontSize: 13,

      color: colors.textSecondary,
    },

    /* ============================================================
       CLOSE BUTTON
    ============================================================ */

    closeButton: {
      width: 34,

      height: 34,

      borderRadius: 17,

      backgroundColor:
        colors.inputBackground,

      alignItems: "center",

      justifyContent: "center",
    },

    closeButtonText: {
      fontSize: 26,

      lineHeight: 27,

      fontWeight: "300",

      color: colors.text,
    },

    /* ============================================================
       LABEL
    ============================================================ */

    label: {
      fontSize: 13,

      fontWeight: "700",

      color: colors.textSecondary,

      marginBottom: SPACING.xs,
    },

    /* ============================================================
       NORMAL INPUT
    ============================================================ */

    input: {
      width: "100%",

      minHeight: 46,

      backgroundColor:
        colors.inputBackground,

      borderWidth: 1,

      borderColor: colors.border,

      borderRadius: 13,

      paddingHorizontal: SPACING.md,

      paddingVertical: SPACING.sm,

      marginBottom: SPACING.md,

      color: colors.text,

      fontSize: 15,
    },

    /* ============================================================
       INPUT WITH UNIT
    ============================================================ */

    inputWithUnit: {
      flexDirection: "row",

      alignItems: "center",

      width: "100%",

      minHeight: 46,

      backgroundColor:
        colors.inputBackground,

      borderWidth: 1,

      borderColor: colors.border,

      borderRadius: 13,

      paddingLeft: SPACING.md,

      paddingRight: SPACING.md,

      marginBottom: SPACING.md,
    },

    unitInput: {
      flex: 1,

      paddingVertical: SPACING.sm,

      color: colors.text,

      fontSize: 15,
    },

    unitText: {
      fontSize: 13,

      fontWeight: "700",

      color: colors.textSecondary,
    },

    /* ============================================================
       GENDER
    ============================================================ */

    genderContainer: {
      flexDirection: "row",

      marginHorizontal: -SPACING.xs,

      marginBottom: SPACING.lg,
    },

    genderButton: {
      flex: 1,

      minHeight: 44,

      marginHorizontal: SPACING.xs,

      borderRadius: 12,

      borderWidth: 1,

      borderColor: colors.border,

      backgroundColor:
        colors.inputBackground,

      alignItems: "center",

      justifyContent: "center",
    },

    genderSelected: {
      backgroundColor: colors.primary,

      borderColor: colors.primary,
    },

    genderText: {
      fontSize: 13,

      fontWeight: "700",

      color: colors.textSecondary,
    },

    genderTextSelected: {
      color: colors.white,
    },

    /* ============================================================
       MODAL ACTIONS
    ============================================================ */

    modalActions: {
      flexDirection: "row",

      gap: SPACING.sm,

      marginTop: SPACING.xs,
    },

    /* ============================================================
       CANCEL
    ============================================================ */

    cancelButton: {
      flex: 1,

      minHeight: 48,

      borderRadius: 13,

      borderWidth: 1,

      borderColor: colors.border,

      backgroundColor:
        colors.inputBackground,

      alignItems: "center",

      justifyContent: "center",
    },

    cancelButtonText: {
      fontSize: 14,

      fontWeight: "700",

      color: colors.textSecondary,
    },

    /* ============================================================
       SAVE CHANGES
    ============================================================ */

    saveButton: {
      flex: 1,

      minHeight: 48,

      borderRadius: 13,

      backgroundColor:
        colors.primary,

      alignItems: "center",

      justifyContent: "center",
    },

    saveButtonText: {
      fontSize: 14,

      fontWeight: "700",

      color: colors.white,
    },
  });
