import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";

import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Share,
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/constants/theme";
import { SPACING } from "@/constants/spacing";
import { useTranslation } from "@/constants/i18n";

// =========================================================
// Notifications
// =========================================================
//
// Local notifications:
// Android + iOS -> supported
// Web             -> not supported
//
// We use require() so the web version does not try to
// initialize native notification functionality.
// =========================================================

let Notifications = null;

if (Platform.OS === "android" || Platform.OS === "ios") {
  try {
    Notifications = require("expo-notifications");
  } catch (error) {
    console.log(
      "[Notifications] expo-notifications could not be loaded:",
      error?.message || error
    );
  }
}

// =========================================================
// Notification handler
// =========================================================
//
// This must be configured as early as possible.
// It controls how a notification behaves while the
// application is currently open.
// =========================================================

if (Notifications) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (error) {
    console.log(
      "[Notifications] Failed to configure notification handler:",
      error?.message || error
    );
  }
}

// =========================================================
// Storage key prefixes
// =========================================================

const REMINDERS_KEY_PREFIX = "@reminders_v1_";

const PROFILE_KEY_PREFIX = "USER_PROFILE_V1_";

// =========================================================
// Constants
// =========================================================

const PRESET_TIMES = {
  breakfast: {
    hour: 8,
    minute: 0,
  },

  lunch: {
    hour: 13,
    minute: 0,
  },

  dinner: {
    hour: 20,
    minute: 0,
  },
};

const TIME_OPTIONS = [
  {
    key: "breakfast",
    label: "Breakfast (8:00)",
  },
  {
    key: "lunch",
    label: "Lunch (13:00)",
  },
  {
    key: "dinner",
    label: "Dinner (20:00)",
  },
  {
    key: "custom",
    label: "Custom",
  },
];

// =========================================================
// Compute notification date
// =========================================================

function computeNotificationDate(
  baseDate,
  hour,
  minute,
  offsetMinutes = 0
) {
  const d = baseDate
    ? new Date(baseDate)
    : new Date();

  d.setHours(hour);
  d.setMinutes(minute + offsetMinutes);
  d.setSeconds(0);
  d.setMilliseconds(0);

  const now = new Date();

  if (d <= now) {
    d.setDate(d.getDate() + 1);
  }

  return d;
}

// =========================================================
// Reminder Component
// =========================================================

export default function Reminder() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  const insets = useSafeAreaInsets();

  const scrollRef = useRef(null);

  const dynamicStyles = styles(
    colors,
    insets
  );

  // -------------------------------------------------------
  // State
  // -------------------------------------------------------

  const [first_name, setFirstName] =
    useState("John");

  const [medicine, setMedicine] =
    useState("");

  const [timeMode, setTimeMode] =
    useState("breakfast");

  const [customTime, setCustomTime] =
    useState(new Date());

  const [showTimePicker, setShowTimePicker] =
    useState(false);

  const [beforeAfter, setBeforeAfter] =
    useState("before");

  const [offset, setOffset] =
    useState(0);

  const [endDate, setEndDate] =
    useState(null);

  const [showEndDatePicker, setShowEndDatePicker] =
    useState(false);

  const [reminders, setReminders] =
    useState([]);

  const [currentUser, setCurrentUser] =
    useState(null);

  const [remindersStorageKey, setRemindersStorageKey] =
    useState(null);

  // -------------------------------------------------------
  // Translated time option
  // -------------------------------------------------------

  const getTimeLabel = (key) => {
    switch (key) {
      case "breakfast":
        return `${t("reminder.breakfast")} (8:00)`;

      case "lunch":
        return `${t("reminder.lunch")} (13:00)`;

      case "dinner":
        return `${t("reminder.dinner")} (20:00)`;

      case "custom":
        return t("reminder.custom");

      default:
        return key;
    }
  };

  // -------------------------------------------------------
  // Translated status
  // -------------------------------------------------------

  const getStatusLabel = (status) => {
    switch (status) {
      case "taken":
        return t("reminder.taken");

      case "missed":
        return t("reminder.missed");

      case "pending":
        return t("reminder.pending");

      default:
        return status || t("reminder.pending");
    }
  };

  // =======================================================
  // Reset scroll when theme changes
  // =======================================================

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        y: 0,
        animated: false,
      });
    });
  }, [isDark]);

  // =======================================================
  // Notification setup
  // =======================================================

  useEffect(() => {
    let mounted = true;

    const setupNotifications = async () => {
      // ---------------------------------------------------
      // Web
      // ---------------------------------------------------

      if (Platform.OS === "web") {
        console.log(
          "[Notifications] Web detected. Local native notifications are disabled."
        );

        return;
      }

      // ---------------------------------------------------
      // Native module unavailable
      // ---------------------------------------------------

      if (!Notifications) {
        console.log(
          "[Notifications] expo-notifications is unavailable in this native build."
        );

        return;
      }

      try {
        // -------------------------------------------------
        // Android notification channel
        // -------------------------------------------------

        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync(
            "reminders",
            {
              name: t(
                "reminder.medicineReminders"
              ),

              importance:
                Notifications.AndroidImportance.HIGH,

              sound: "default",

              vibrationPattern: [
                0,
                250,
                250,
                250,
              ],

              lockscreenVisibility:
                Notifications.AndroidNotificationVisibility.PUBLIC,
            }
          );

          console.log(
            "[Notifications] Android reminder channel created."
          );
        }

        // -------------------------------------------------
        // Check existing permission
        // -------------------------------------------------

        let permission =
          await Notifications.getPermissionsAsync();

        // -------------------------------------------------
        // Request permission if necessary
        // -------------------------------------------------

        if (
          permission.status !== "granted"
        ) {
          permission =
            await Notifications.requestPermissionsAsync();
        }

        if (
          permission.status !== "granted"
        ) {
          console.log(
            "[Notifications] Permission not granted."
          );

          return;
        }

        // -------------------------------------------------
        // iOS authorization check
        // -------------------------------------------------

        if (
          Platform.OS === "ios" &&
          permission.ios
        ) {
          const iosStatus =
            permission.ios.status;

          console.log(
            "[Notifications] iOS authorization:",
            iosStatus
          );
        }

        if (mounted) {
          console.log(
            "[Notifications] Local notifications are ready."
          );
        }
      } catch (error) {
        console.log(
          "[Notifications] Setup failed:",
          error?.message || error
        );
      }
    };

    setupNotifications();

    return () => {
      mounted = false;
    };
  }, [t]);

  // =======================================================
  // Load current user + reminders
  // =======================================================

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadUserData = async () => {
        try {
          // ------------------------------------------------
          // Reset previous user immediately
          // ------------------------------------------------

          setCurrentUser(null);
          setRemindersStorageKey(null);
          setReminders([]);
          setFirstName("John");

          // ------------------------------------------------
          // Get logged-in user
          // ------------------------------------------------

          const userData =
            await AsyncStorage.getItem(
              "loggedUser"
            );

          if (!userData) {
            return;
          }

          const user =
            JSON.parse(userData);

          if (!user || !user.id) {
            console.warn(
              "Logged user does not contain a valid user ID."
            );

            return;
          }

          const userId =
            String(user.id);

          // ------------------------------------------------
          // User-specific storage keys
          // ------------------------------------------------

          const userRemindersKey =
            `${REMINDERS_KEY_PREFIX}${userId}`;

          const userProfileKey =
            `${PROFILE_KEY_PREFIX}${userId}`;

          // ------------------------------------------------
          // Load profile
          // ------------------------------------------------

          let displayName =
            user.username || "John";

          try {
            const profileRaw =
              await AsyncStorage.getItem(
                userProfileKey
              );

            if (profileRaw) {
              const profile =
                JSON.parse(profileRaw);

              if (profile?.name) {
                displayName =
                  profile.name;
              }
            }
          } catch (profileError) {
            console.log(
              "Failed to load user profile:",
              profileError?.message ||
                profileError
            );
          }

          // ------------------------------------------------
          // Load reminders
          // ------------------------------------------------

          const raw =
            await AsyncStorage.getItem(
              userRemindersKey
            );

          let list = [];

          if (raw) {
            try {
              list = JSON.parse(raw);

              if (!Array.isArray(list)) {
                list = [];
              }
            } catch (parseError) {
              console.log(
                "Failed to parse reminders:",
                parseError?.message ||
                  parseError
              );

              list = [];
            }
          }

          // ------------------------------------------------
          // Update expired reminders
          // ------------------------------------------------

          const now = new Date();

          list = list.map((r) => {
            if (!r || !r.date) {
              return r;
            }

            const d =
              new Date(r.date);

            if (d < now) {
              if (r.repeat) {
                const nextDate =
                  new Date(d);

                nextDate.setDate(
                  nextDate.getDate() + 1
                );

                return {
                  ...r,
                  date:
                    nextDate.toISOString(),
                  status: "pending",
                };
              }

              return {
                ...r,
                status: "pending",
              };
            }

            return r;
          });

          // ------------------------------------------------
          // Save updated reminders
          // ------------------------------------------------

          await AsyncStorage.setItem(
            userRemindersKey,
            JSON.stringify(list)
          );

          if (isActive) {
            setCurrentUser(user);
            setRemindersStorageKey(
              userRemindersKey
            );
            setFirstName(displayName);
            setReminders(list);
          }
        } catch (error) {
          console.error(
            "Failed to load user reminders:",
            error
          );

          if (isActive) {
            setReminders([]);
          }
        }
      };

      loadUserData();

      return () => {
        isActive = false;
      };
    }, [])
  );

  // =======================================================
  // Schedule notification
  // =======================================================

  async function scheduleNotification(
    reminder
  ) {
    // -----------------------------------------------------
    // Web
    // -----------------------------------------------------

    if (Platform.OS === "web") {
      console.log(
        "[Notifications] Web does not support native scheduled notifications."
      );

      return [];
    }

    // -----------------------------------------------------
    // Native module unavailable
    // -----------------------------------------------------

    if (!Notifications) {
      console.log(
        "[Notifications] Native notification module is unavailable."
      );

      return [];
    }

    try {
      // ---------------------------------------------------
      // Make sure permission is available
      // ---------------------------------------------------

      let permission =
        await Notifications.getPermissionsAsync();

      if (
        permission.status !== "granted"
      ) {
        permission =
          await Notifications.requestPermissionsAsync();
      }

      if (
        permission.status !== "granted"
      ) {
        console.log(
          "[Notifications] Notification permission denied."
        );

        return [];
      }

      // ---------------------------------------------------
      // Android channel
      // ---------------------------------------------------

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync(
          "reminders",
          {
            name: t(
              "reminder.medicineReminders"
            ),

            importance:
              Notifications.AndroidImportance.HIGH,

            sound: "default",

            vibrationPattern: [
              0,
              250,
              250,
              250,
            ],

            lockscreenVisibility:
              Notifications.AndroidNotificationVisibility.PUBLIC,
          }
        );
      }

      // ---------------------------------------------------
      // Notification date
      // ---------------------------------------------------

      const notifDate =
        new Date(reminder.date);

      if (
        Number.isNaN(
          notifDate.getTime()
        )
      ) {
        console.log(
          "[Notifications] Invalid reminder date."
        );

        return [];
      }

      // ---------------------------------------------------
      // Don't schedule something already in the past
      // ---------------------------------------------------

      if (
        notifDate.getTime() <=
        Date.now()
      ) {
        console.log(
          "[Notifications] Reminder date is in the past."
        );

        return [];
      }

      const end =
        reminder.endDate
          ? new Date(
              reminder.endDate
            )
          : null;

      const ids = [];

      // ---------------------------------------------------
      // Food timing text
      // ---------------------------------------------------

      const foodText =
        reminder.beforeAfter ===
        "before"
          ? t("reminder.beforeFood")
          : t("reminder.afterFood");

      // ---------------------------------------------------
      // Notification content
      // ---------------------------------------------------

      const baseContent = {
        title:
          `💊 ${t(
            "reminder.medicineReminder"
          )}`,

        body:
          `${t("reminder.take")} ` +
          `${reminder.medicine} ` +
          `(${foodText})`,

        sound: "default",

        data: {
          type: "medicine-reminder",
          reminderId:
            reminder.id,
          medicine:
            reminder.medicine,
        },

        ...(Platform.OS ===
        "android"
          ? {
              channelId:
                "reminders",
            }
          : {}),
      };

      // ===================================================
      // Reminder with END DATE
      // ===================================================
      //
      // Schedule one DATE notification for every day.
      //
      // Example:
      //
      // 10 Sep -> notification
      // 11 Sep -> notification
      // 12 Sep -> notification
      //
      // until endDate.
      // ===================================================

      if (end) {
        let d =
          new Date(
            notifDate
          );

        while (d <= end) {
          // -----------------------------------------------
          // Only schedule future dates
          // -----------------------------------------------

          if (
            d.getTime() >
            Date.now()
          ) {
            try {
              const id =
                await Notifications.scheduleNotificationAsync(
                  {
                    content:
                      baseContent,

                    trigger: {
                      type:
                        Notifications
                          .SchedulableTriggerInputTypes
                          .DATE,

                      date:
                        new Date(d),
                    },
                  }
                );

              ids.push(id);
            } catch (error) {
              console.log(
                "[Notifications] Failed to schedule DATE notification:",
                error?.message ||
                  error
              );
            }
          }

          d.setDate(
            d.getDate() + 1
          );
        }
      }

      // ===================================================
      // DAILY reminder
      // ===================================================

      else {
        // -------------------------------------------------
        // Use DAILY trigger for recurring reminders.
        //
        // We intentionally use the hour/minute from the
        // calculated notification date.
        // -------------------------------------------------

        const hour =
          notifDate.getHours();

        const minute =
          notifDate.getMinutes();

        try {
          const id =
            await Notifications.scheduleNotificationAsync(
              {
                content:
                  baseContent,

                trigger: {
                  type:
                    Notifications
                      .SchedulableTriggerInputTypes
                      .DAILY,

                  hour,

                  minute,
                },
              }
            );

          ids.push(id);
        } catch (error) {
          console.log(
            "[Notifications] Failed to schedule DAILY notification:",
            error?.message ||
              error
          );
        }
      }

      // ---------------------------------------------------
      // Result
      // ---------------------------------------------------

      if (ids.length > 0) {
        console.log(
          `[Notifications] Scheduled ${ids.length} notification(s) for ${reminder.medicine}.`
        );
      } else {
        console.log(
          "[Notifications] No notifications were scheduled."
        );
      }

      return ids;
    } catch (error) {
      console.log(
        "[Notifications] Scheduling failed:",
        error?.message || error
      );

      return [];
    }
  }

  // =======================================================
  // Save reminders
  // =======================================================

  async function saveReminders(
    list
  ) {
    if (!remindersStorageKey) {
      Alert.alert(
        t("reminder.storageError"),
        "Unable to identify the logged-in user."
      );

      return false;
    }

    try {
      setReminders(list);

      await AsyncStorage.setItem(
        remindersStorageKey,
        JSON.stringify(list)
      );

      return true;
    } catch (error) {
      console.log(
        "Failed to save reminders:",
        error?.message || error
      );

      Alert.alert(
        t("reminder.storageError"),
        t("reminder.unableToSave")
      );

      return false;
    }
  }

  // =======================================================
  // Add reminder
  // =======================================================

  async function addReminder() {
    if (!currentUser) {
      Alert.alert(
        t("common.error"),
        "Please log in before creating a reminder."
      );

      return;
    }

    if (!medicine.trim()) {
      Alert.alert(
        t("reminder.missingField"),
        t("reminder.enterMedicine")
      );

      return;
    }

    // -----------------------------------------------------
    // Determine hour/minute
    // -----------------------------------------------------

    let hour;
    let minute;

    if (
      timeMode === "custom"
    ) {
      hour =
        customTime.getHours();

      minute =
        customTime.getMinutes();
    } else {
      const preset =
        PRESET_TIMES[
          timeMode
        ];

      if (!preset) {
        Alert.alert(
          t("reminder.invalidTime"),
          t(
            "reminder.selectValidTime"
          )
        );

        return;
      }

      hour =
        preset.hour;

      minute =
        preset.minute;
    }

    // -----------------------------------------------------
    // Before / after offset
    // -----------------------------------------------------

    const offsetMinutes =
      (beforeAfter ===
      "before"
        ? -1
        : 1) * offset;

    // -----------------------------------------------------
    // Notification date
    // -----------------------------------------------------

    const notifDate =
      computeNotificationDate(
        new Date(),
        hour,
        minute,
        offsetMinutes
      );

    // -----------------------------------------------------
    // Validate end date
    // -----------------------------------------------------

    if (endDate) {
      const selectedEndDate =
        new Date(endDate);

      selectedEndDate.setHours(
        23
      );

      selectedEndDate.setMinutes(
        59
      );

      selectedEndDate.setSeconds(
        59
      );

      selectedEndDate.setMilliseconds(
        999
      );

      if (
        notifDate >
        selectedEndDate
      ) {
        Alert.alert(
          t(
            "reminder.invalidEndDate"
          ),
          t(
            "reminder.endDateFuture"
          )
        );

        return;
      }
    }

    // -----------------------------------------------------
    // Create reminder
    // -----------------------------------------------------

    const id =
      Date.now().toString();

    const reminder = {
      id,

      userId:
        String(currentUser.id),

      medicine:
        medicine.trim(),

      timeMode,

      customTime:
        timeMode === "custom"
          ? customTime.toISOString()
          : null,

      beforeAfter,

      offset,

      endDate:
        endDate
          ? endDate.toISOString()
          : null,

      date:
        notifDate.toISOString(),

      repeat:
        !endDate,

      status:
        "pending",

      notificationIds: [],
    };

    // -----------------------------------------------------
    // Schedule Android/iOS notification
    // -----------------------------------------------------

    const notificationIds =
      await scheduleNotification(
        reminder
      );

    reminder.notificationIds =
      notificationIds;

    // -----------------------------------------------------
    // Save reminder
    // -----------------------------------------------------

    const saved =
      await saveReminders([
        reminder,
        ...reminders,
      ]);

    if (!saved) {
      // -----------------------------------------------
      // If saving failed, cancel notifications that
      // were already scheduled.
      // -----------------------------------------------

      if (
        Notifications &&
        notificationIds.length
      ) {
        for (const notificationId of
          notificationIds) {
          try {
            await Notifications.cancelScheduledNotificationAsync(
              notificationId
            );
          } catch (error) {
            console.log(
              "[Notifications] Failed to rollback notification:",
              error?.message ||
                error
            );
          }
        }
      }

      return;
    }

    // -----------------------------------------------------
    // Reset form
    // -----------------------------------------------------

    setMedicine("");

    setTimeMode(
      "breakfast"
    );

    setCustomTime(
      new Date()
    );

    setBeforeAfter(
      "before"
    );

    setOffset(0);

    setEndDate(null);

    setShowTimePicker(
      false
    );

    // -----------------------------------------------------
    // Success message
    // -----------------------------------------------------

    if (
      Platform.OS === "android" ||
      Platform.OS === "ios"
    ) {
      if (
        notificationIds.length >
        0
      ) {
        Alert.alert(
          t(
            "reminder.reminderSaved"
          ),
          t(
            "reminder.scheduled"
          )
        );
      } else {
        Alert.alert(
          t(
            "reminder.reminderSaved"
          ),
          t(
            "reminder.savedNoNotifications"
          )
        );
      }
    } else {
      Alert.alert(
        t(
          "reminder.reminderSaved"
        ),
        t(
          "reminder.savedNoNotifications"
        )
      );
    }
  }

  // =======================================================
  // Delete reminder
  // =======================================================

  async function deleteReminder(
    remId
  ) {
    try {
      const reminder =
        reminders.find(
          (x) =>
            x.id === remId
        );

      // ---------------------------------------------------
      // Cancel scheduled notifications
      // ---------------------------------------------------

      if (
        reminder
          ?.notificationIds
          ?.length &&
        Notifications
      ) {
        for (const notificationId of
          reminder.notificationIds) {
          try {
            await Notifications.cancelScheduledNotificationAsync(
              notificationId
            );
          } catch (error) {
            console.log(
              "[Notifications] Failed to cancel notification:",
              error?.message ||
                error
            );
          }
        }
      }

      // ---------------------------------------------------
      // Remove reminder
      // ---------------------------------------------------

      await saveReminders(
        reminders.filter(
          (x) =>
            x.id !== remId
        )
      );
    } catch (error) {
      console.log(
        "Failed to delete reminder:",
        error?.message ||
          error
      );
    }
  }

  // =======================================================
  // Change reminder status
  // =======================================================

  async function markStatus(
    remId,
    status
  ) {
    await saveReminders(
      reminders.map((r) =>
        r.id === remId
          ? {
              ...r,
              status,
            }
          : r
      )
    );
  }

  // =======================================================
  // Share reminders
  // =======================================================

  async function shareReminders() {
    try {
      if (!remindersStorageKey) {
        Alert.alert(
          t("common.error"),
          "Unable to identify the logged-in user."
        );

        return;
      }

      const raw =
        await AsyncStorage.getItem(
          remindersStorageKey
        );

      const list = raw
        ? JSON.parse(raw)
        : [];

      if (!list.length) {
        Alert.alert(
          t("reminder.noReminders"),
          t(
            "reminder.noRemindersToShare"
          )
        );

        return;
      }

      const text = list
        .map(
          (r, index) => {
            const time =
              new Date(
                r.date
              ).toLocaleTimeString(
                [],
                {
                  hour: "2-digit",
                  minute:
                    "2-digit",
                }
              );

            const foodText =
              r.beforeAfter ===
              "before"
                ? t(
                    "reminder.beforeFood"
                  )
                : t(
                    "reminder.afterFood"
                  );

            return `${index + 1}. ${
              r.medicine
            } — ${time} • ${foodText}`;
          }
        )
        .join("\n");

      await Share.share({
        message:
          `${t(
            "reminder.myMedicineReminders"
          )}:\n\n${text}`,
      });
    } catch (error) {
      Alert.alert(
        t("reminder.shareFailed"),
        error?.message ||
          t(
            "reminder.unableToShare"
          )
      );
    }
  }

  // =======================================================
  // UI
  // =======================================================

  return (
    <KeyboardAvoidingView
      style={
        dynamicStyles.keyboardContainer
      }
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
      keyboardVerticalOffset={
        Platform.OS === "ios"
          ? 0
          : 20
      }
    >
      <ScrollView
        ref={scrollRef}
        style={
          dynamicStyles.container
        }
        contentContainerStyle={
          dynamicStyles.contentContainer
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* HEADER */}

        <Text
          style={
            dynamicStyles.header
          }
        >
          {t("reminder.title")}
        </Text>

        {/* SHARE BUTTON */}

        <Pressable
          style={({ pressed }) => [
            dynamicStyles.shareBtn,
            pressed &&
              dynamicStyles.pressed,
          ]}
          onPress={
            shareReminders
          }
        >
          <Feather
            name="share-2"
            size={22}
            color={colors.text}
          />
        </Pressable>

        {/* FORM CARD */}

        <View
          style={
            dynamicStyles.card
          }
        >
          {/* MEDICINE */}

          <TextInput
            placeholder={t(
              "reminder.medicineName"
            )}
            placeholderTextColor={
              colors.textLight
            }
            style={
              dynamicStyles.input
            }
            value={medicine}
            onChangeText={
              setMedicine
            }
          />

          {/* TIME */}

          <Text
            style={
              dynamicStyles.label
            }
          >
            {t(
              "reminder.selectTime"
            )}
          </Text>

          <View
            style={
              dynamicStyles.row
            }
          >
            {TIME_OPTIONS.map(
              ({
                key,
              }) => {
                const selected =
                  timeMode ===
                  key;

                return (
                  <Pressable
                    key={key}
                    style={[
                      dynamicStyles.chip,
                      selected &&
                        dynamicStyles.chipActive,
                    ]}
                    onPress={() => {
                      setTimeMode(
                        key
                      );

                      if (
                        key ===
                        "custom"
                      ) {
                        setShowTimePicker(
                          true
                        );
                      }
                    }}
                  >
                    <Text
                      style={[
                        dynamicStyles.chipText,
                        selected &&
                          dynamicStyles.chipTextActive,
                      ]}
                    >
                      {getTimeLabel(
                        key
                      )}
                    </Text>
                  </Pressable>
                );
              }
            )}
          </View>

          {/* CUSTOM TIME PICKER */}

          {timeMode ===
            "custom" &&
            showTimePicker && (
              <DateTimePicker
                value={
                  customTime
                }
                mode="time"
                is24Hour
                display={
                  Platform.OS ===
                  "ios"
                    ? "spinner"
                    : "default"
                }
                onChange={(
                  event,
                  date
                ) => {
                  setShowTimePicker(
                    false
                  );

                  if (date) {
                    setCustomTime(
                      date
                    );
                  }
                }}
              />
            )}

          {/* BEFORE / AFTER FOOD */}

          <Text
            style={
              dynamicStyles.label
            }
          >
            {t(
              "reminder.beforeAfterFood"
            )}
          </Text>

          <View
            style={
              dynamicStyles.row
            }
          >
            {[
              "before",
              "after",
            ].map(
              (option) => {
                const selected =
                  beforeAfter ===
                  option;

                return (
                  <Pressable
                    key={
                      option
                    }
                    style={[
                      dynamicStyles.chip,
                      selected &&
                        dynamicStyles.chipActive,
                    ]}
                    onPress={() =>
                      setBeforeAfter(
                        option
                      )
                    }
                  >
                    <Text
                      style={[
                        dynamicStyles.chipText,
                        selected &&
                          dynamicStyles.chipTextActive,
                      ]}
                    >
                      {option ===
                      "before"
                        ? t(
                            "reminder.before"
                          )
                        : t(
                            "reminder.after"
                          )}
                    </Text>
                  </Pressable>
                );
              }
            )}
          </View>

          {/* OFFSET */}

          <Text
            style={
              dynamicStyles.label
            }
          >
            {t(
              "reminder.reminderOffset"
            )}
          </Text>

          <View
            style={
              dynamicStyles.row
            }
          >
            {[0, 15, 30].map(
              (minutes) => {
                const selected =
                  offset ===
                  minutes;

                return (
                  <Pressable
                    key={
                      minutes
                    }
                    style={[
                      dynamicStyles.chip,
                      selected &&
                        dynamicStyles.chipActive,
                    ]}
                    onPress={() =>
                      setOffset(
                        minutes
                      )
                    }
                  >
                    <Text
                      style={[
                        dynamicStyles.chipText,
                        selected &&
                          dynamicStyles.chipTextActive,
                      ]}
                    >
                      {minutes}{" "}
                      {t(
                        "reminder.min"
                      )}
                    </Text>
                  </Pressable>
                );
              }
            )}
          </View>

          {/* END DATE */}

          <Text
            style={
              dynamicStyles.label
            }
          >
            {t(
              "reminder.endDateOptional"
            )}
          </Text>

          <Pressable
            style={
              dynamicStyles.timeBtn
            }
            onPress={() =>
              setShowEndDatePicker(
                true
              )
            }
          >
            <Text
              style={
                dynamicStyles.timeBtnText
              }
            >
              {endDate
                ? endDate.toLocaleDateString()
                : t(
                    "reminder.selectEndDate"
                  )}
            </Text>
          </Pressable>

          {showEndDatePicker && (
            <DateTimePicker
              value={
                endDate ||
                new Date()
              }
              mode="date"
              display={
                Platform.OS ===
                "ios"
                  ? "spinner"
                  : "default"
              }
              minimumDate={
                new Date()
              }
              onChange={(
                event,
                date
              ) => {
                setShowEndDatePicker(
                  false
                );

                if (date) {
                  setEndDate(
                    date
                  );
                }
              }}
            />
          )}

          {/* SAVE */}

          <Pressable
            style={({ pressed }) => [
              dynamicStyles.saveBtn,
              pressed &&
                dynamicStyles.pressed,
            ]}
            onPress={
              addReminder
            }
          >
            <Text
              style={
                dynamicStyles.saveBtnText
              }
            >
              {t(
                "reminder.saveReminder"
              )}
            </Text>
          </Pressable>
        </View>

        {/* LIST HEADER */}

        <Text
          style={
            dynamicStyles.sectionHeader
          }
        >
          {first_name}
          {"'"}s{" "}
          {t(
            "reminder.reminders"
          )}
        </Text>

        {/* REMINDER LIST */}

        <View
          style={
            dynamicStyles.listContent
          }
        >
          {reminders.length ===
          0 ? (
            <Text
              style={
                dynamicStyles.emptyText
              }
            >
              {t(
                "reminder.noRemindersYet"
              )}
            </Text>
          ) : (
            reminders.map(
              (item) => {
                if (!item) {
                  return null;
                }

                return (
                  <View
                    key={
                      item.id
                    }
                    style={
                      dynamicStyles.reminderRow
                    }
                  >
                    {/* DELETE */}

                    <Pressable
                      style={[
                        dynamicStyles.smallBtn,
                        dynamicStyles.deleteBtn,
                      ]}
                      onPress={() =>
                        deleteReminder(
                          item.id
                        )
                      }
                    >
                      <Text>
                        🗑️
                      </Text>
                    </Pressable>

                    {/* DETAILS */}

                    <View
                      style={
                        dynamicStyles.details
                      }
                    >
                      <Text
                        style={
                          dynamicStyles.reminderTitle
                        }
                      >
                        {item.medicine ??
                          t(
                            "reminder.unknown"
                          )}
                      </Text>

                      <Text
                        style={
                          dynamicStyles.reminderMeta
                        }
                      >
                        {item.repeat
                          ? t(
                              "reminder.daily"
                            )
                          : t(
                              "reminder.oneTime"
                            )}{" "}
                        •{" "}
                        {item.date
                          ? new Date(
                              item.date
                            ).toLocaleString()
                          : "N/A"}
                      </Text>

                      {item.endDate && (
                        <Text
                          style={
                            dynamicStyles.reminderMeta
                          }
                        >
                          {t(
                            "reminder.ends"
                          )}{" "}
                          {new Date(
                            item.endDate
                          ).toLocaleDateString()}
                        </Text>
                      )}

                      <Text
                        style={
                          dynamicStyles.reminderMeta
                        }
                      >
                        {t(
                          "reminder.status"
                        )}{" "}
                        {getStatusLabel(
                          item.status
                        )}
                      </Text>
                    </View>

                    {/* STATUS BUTTONS */}

                    <View
                      style={
                        dynamicStyles.rightButtons
                      }
                    >
                      <Pressable
                        style={
                          dynamicStyles.smallBtn
                        }
                        onPress={() =>
                          markStatus(
                            item.id,
                            "taken"
                          )
                        }
                      >
                        <Text>
                          ✅
                        </Text>
                      </Pressable>

                      <Pressable
                        style={
                          dynamicStyles.smallBtn
                        }
                        onPress={() =>
                          markStatus(
                            item.id,
                            "missed"
                          )
                        }
                      >
                        <Text>
                          ❌
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                );
              }
            )
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// =========================================================
// Styles
// =========================================================

const styles = (
  colors,
  insets
) =>
  StyleSheet.create({
    keyboardContainer: {
      flex: 1,
      backgroundColor:
        colors.background,
    },

    container: {
      flex: 1,
      backgroundColor:
        colors.background,
    },

    contentContainer: {
      paddingHorizontal:
        SPACING.screenHorizontal,

      paddingTop: Math.max(
        insets.top,
        SPACING.sm
      ),

      paddingBottom:
        insets.bottom +
        SPACING.xxxl,
    },

    header: {
      fontSize: 28,

      fontWeight: "800",

      textAlign: "left",

      color: colors.text,

      marginBottom:
        SPACING.md,
    },

    shareBtn: {
      position: "absolute",

      top:
        Math.max(
          insets.top,
          SPACING.sm
        ) + SPACING.xs,

      right:
        SPACING.screenHorizontal,

      width: 40,

      height: 40,

      borderRadius: 20,

      alignItems: "center",

      justifyContent:
        "center",

      backgroundColor:
        colors.inputBackground,

      borderWidth: 1,

      borderColor:
        colors.border,
    },

    card: {
      padding:
        SPACING.lg,

      borderRadius:
        SPACING.xl,

      marginBottom:
        SPACING.xl,

      backgroundColor:
        colors.card,

      borderWidth: 1,

      borderColor:
        colors.border,

      shadowColor:
        colors.shadow,

      shadowOpacity: 0.05,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      shadowRadius: 8,

      elevation: 3,
    },

    input: {
      borderWidth: 1,

      borderColor:
        colors.border,

      paddingHorizontal:
        SPACING.md,

      paddingVertical:
        SPACING.sm,

      borderRadius:
        SPACING.md,

      marginBottom:
        SPACING.sm,

      backgroundColor:
        colors.inputBackground,

      color:
        colors.text,

      fontSize: 14,
    },

    label: {
      fontWeight: "600",

      marginTop:
        SPACING.md,

      marginBottom:
        SPACING.xs,

      color:
        colors.text,
    },

    row: {
      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap:
        SPACING.xs,
    },

    chip: {
      paddingVertical:
        SPACING.chip
          .paddingVertical,

      paddingHorizontal:
        SPACING.chip
          .paddingHorizontal,

      borderRadius:
        SPACING.xl,

      borderWidth: 1,

      borderColor:
        colors.border,

      backgroundColor:
        colors.inputBackground,

      margin:
        SPACING.chip.margin,
    },

    chipActive: {
      backgroundColor:
        colors.primary,

      borderColor:
        colors.primary,
    },

    chipText: {
      color:
        colors.textSecondary,

      fontSize: 14,
    },

    chipTextActive: {
      color:
        colors.white,

      fontWeight: "600",
    },

    timeBtn: {
      marginTop:
        SPACING.sm,

      paddingVertical:
        SPACING.sm,

      paddingHorizontal:
        SPACING.md,

      borderWidth: 1,

      borderColor:
        colors.border,

      borderRadius:
        SPACING.md,

      backgroundColor:
        colors.inputBackground,
    },

    timeBtnText: {
      color:
        colors.text,

      fontSize: 14,
    },

    saveBtn: {
      marginTop:
        SPACING.lg,

      paddingVertical:
        SPACING.sm,

      minHeight: 44,

      borderRadius:
        SPACING.md,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        colors.primary,
    },

    saveBtnText: {
      color:
        colors.white,

      fontWeight:
        "600",

      fontSize: 15,
    },

    sectionHeader: {
      fontWeight:
        "800",

      color:
        colors.text,

      fontSize: 20,

      marginBottom:
        SPACING.sm,
    },

    listContent: {
      paddingTop:
        SPACING.xs,

      paddingBottom:
        SPACING.lg,
    },

    emptyText: {
      color:
        colors.textSecondary,

      paddingVertical:
        SPACING.sm,
    },

    reminderRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      padding:
        SPACING.md,

      borderRadius:
        SPACING.lg,

      marginVertical:
        SPACING.xs,

      borderWidth: 1,

      borderColor:
        colors.border,

      backgroundColor:
        colors.card,
    },

    details: {
      flex: 1,

      minWidth: 0,

      marginHorizontal:
        SPACING.sm,
    },

    reminderTitle: {
      fontWeight:
        "700",

      color:
        colors.text,

      fontSize: 15,

      marginBottom:
        SPACING.xs,
    },

    reminderMeta: {
      fontSize: 12,

      color:
        colors.textSecondary,

      marginTop:
        SPACING.xs,
    },

    smallBtn: {
      padding:
        SPACING.sm,

      borderRadius:
        SPACING.sm,

      marginVertical:
        SPACING.xs,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        colors.inputBackground,
    },

    deleteBtn: {
      backgroundColor:
        colors.inputBackground,

      marginRight:
        SPACING.xs,

      borderWidth: 1,

      borderColor:
        colors.border,
    },

    rightButtons: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        SPACING.xs,

      marginLeft:
        "auto",
    },

    pressed: {
      opacity: 0.7,

      transform: [
        {
          scale: 0.985,
        },
      ],
    },
  });